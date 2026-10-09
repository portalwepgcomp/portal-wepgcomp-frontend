"use client";

import { useState } from "react";
import dayjs from "dayjs";

import Button from "@/components/UI/Button";
import { Campo } from "@/components/UI/Input";
import { fullProfileLabel } from "@/components/Perfil/perfilLabels";
import { useSweetAlert } from "@/hooks/useAlert";
import { ProfileType, SubprofileType, User } from "@/models/user";
import { userApi } from "@/services/user";
import { getErrorMessage } from "@/utils/error";

interface OpcaoPerfil {
  valor: string;
  profile: ProfileType;
  subprofile?: SubprofileType;
}

const OPCOES_PERFIL: OpcaoPerfil[] = [
  { valor: "Presenter", profile: "Presenter" },
  { valor: "Professor", profile: "Professor" },
  { valor: "Listener:Doctorate", profile: "Listener", subprofile: "Doctorate" },
  { valor: "Listener:Master", profile: "Listener", subprofile: "Master" },
  { valor: "Listener:Bachelor", profile: "Listener", subprofile: "Bachelor" },
  { valor: "Listener:Other", profile: "Listener", subprofile: "Other" },
];

/** Mesma regra do cadastro: só ouvinte "Outro" pode ter e-mail externo. */
function exigeEmailUfba({ profile, subprofile }: OpcaoPerfil) {
  return profile !== "Listener" || subprofile !== "Other";
}

function ehPerfilAtual(opcao: OpcaoPerfil, usuario: User) {
  return (
    opcao.profile === usuario.profile &&
    (opcao.profile !== "Listener" || opcao.subprofile === usuario.subprofile)
  );
}

interface SolicitarTrocaPerfilProps {
  usuario: User;
  onAtualizado: (usuario: User) => void;
}

export function SolicitarTrocaPerfil({
  usuario,
  onAtualizado,
}: Readonly<SolicitarTrocaPerfilProps>) {
  const { showAlert } = useSweetAlert();
  const [selecionado, setSelecionado] = useState("");
  const [enviando, setEnviando] = useState(false);

  const emailUfba = usuario.email.toLowerCase().endsWith("@ufba.br");
  const opcoes = OPCOES_PERFIL.filter(
    (opcao) => !ehPerfilAtual(opcao, usuario),
  );

  const executar = async (
    acao: () => Promise<User>,
    sucesso: string,
    erro: string,
  ) => {
    setEnviando(true);
    try {
      const atualizado = await acao();
      onAtualizado(atualizado);
      setSelecionado("");
      showAlert({
        icon: "success",
        title: sucesso,
        timer: 3000,
        showConfirmButton: false,
      });
    } catch (err: unknown) {
      showAlert({
        icon: "error",
        title: erro,
        text: getErrorMessage(err, "Tente novamente mais tarde."),
        confirmButtonText: "Retornar",
      });
    } finally {
      setEnviando(false);
    }
  };

  const solicitar = () => {
    const opcao = OPCOES_PERFIL.find((o) => o.valor === selecionado);
    if (!opcao) return;

    executar(
      () =>
        userApi.requestProfileChange({
          profile: opcao.profile,
          ...(opcao.subprofile && { subprofile: opcao.subprofile }),
        }),
      "Solicitação enviada! Aguarde a aprovação de um administrador.",
      "Erro ao solicitar troca de perfil",
    );
  };

  const cancelar = () =>
    executar(
      () => userApi.cancelProfileChange(),
      "Solicitação cancelada.",
      "Erro ao cancelar solicitação",
    );

  return (
    <section className="mt-8 w-full max-w-[540px] border-t border-gray-200 pt-6">
      <h2 className="mb-1 text-lg font-semibold text-foreground">
        Perfil de participação
      </h2>
      <p className="mb-4 text-sm text-foreground">
        Perfil atual:{" "}
        <strong>{fullProfileLabel(usuario.profile, usuario.subprofile)}</strong>
      </p>

      {usuario.requestedProfile ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm text-foreground">
            Solicitação de troca para{" "}
            <strong>
              {fullProfileLabel(
                usuario.requestedProfile,
                usuario.requestedSubprofile,
              )}
            </strong>{" "}
            aguardando aprovação de um administrador
            {usuario.profileRequestedAt &&
              ` (enviada em ${dayjs(usuario.profileRequestedAt).format("DD/MM/YYYY")})`}
            .
          </p>
          <Button
            className="mt-3"
            variante="outline"
            onClick={cancelar}
            disabled={enviando}
          >
            {enviando ? "Cancelando..." : "Cancelar solicitação"}
          </Button>
        </div>
      ) : (
        <>
          <Campo
            label="Solicitar troca para"
            htmlFor="novoPerfil"
            className="mb-2"
          >
            <select
              id="novoPerfil"
              className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              value={selecionado}
              onChange={(e) => setSelecionado(e.target.value)}
              disabled={enviando}
            >
              <option value="">Selecione o novo perfil</option>
              {opcoes.map((opcao) => (
                <option
                  key={opcao.valor}
                  value={opcao.valor}
                  disabled={!emailUfba && exigeEmailUfba(opcao)}
                >
                  {fullProfileLabel(opcao.profile, opcao.subprofile)}
                </option>
              ))}
            </select>
          </Campo>
          {!emailUfba && (
            <p className="mb-2 text-xs text-gray-500">
              Perfis da UFBA exigem um e-mail @ufba.br.
            </p>
          )}
          <p className="mb-4 text-xs text-gray-500">
            A troca só vale depois de aprovada por um administrador.
          </p>
          <Button
            larguraTotal
            variante="primary"
            onClick={solicitar}
            disabled={!selecionado || enviando}
          >
            {enviando ? "Enviando..." : "Solicitar troca de perfil"}
          </Button>
        </>
      )}
    </section>
  );
}
