"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Loading from "@/components/LoadingPage";
import Button from "@/components/UI/Button";
import { Campo, Input } from "@/components/UI/Input";
import { useAuth } from "@/hooks/useAuth";
import { useSweetAlert } from "@/hooks/useAlert";
import { UpdateMeRequest } from "@/models/update-user";
import { User } from "@/models/user";
import { userApi } from "@/services/user";
import { SolicitarTrocaPerfil } from "./SolicitarTrocaPerfil";
import { getErrorMessage } from "@/utils/error";
import { maskCPF } from "@/lib/masks";

const criarSchema = (usaCpf: boolean) =>
  z.object({
    nome: z
      .string({ invalid_type_error: "Campo inválido" })
      .trim()
      .min(1, "O nome é obrigatório.")
      .max(255, "O nome deve ter no máximo 255 caracteres.")
      .regex(/^[a-zA-ZÀ-ÿ\s]+$/, {
        message: "O nome deve conter apenas letras.",
      }),
    linkLattes: z
      .string()
      .trim()
      .max(50, "O link deve ter no máximo 50 caracteres.")
      .optional(),
    // Mesmas regras do cadastro: CPF para ouvinte "Outro", matrícula nos demais.
    matricula: z
      .string()
      .transform((valor) => valor.replace(/\D/g, ""))
      .refine((digitos) => digitos.length > 0, {
        message: usaCpf ? "CPF é obrigatório." : "Matrícula é obrigatória.",
      })
      .refine(
        (digitos) =>
          usaCpf ? /^\d{11}$/.test(digitos) : /^\d{1,13}$/.test(digitos),
        {
          message: usaCpf
            ? "CPF inválido. Deve conter 11 dígitos."
            : "Matrícula inválida. Use somente dígitos (até 13).",
        },
      ),
  });

type FormMeuPerfilSchema = z.infer<ReturnType<typeof criarSchema>>;

const usaCpf = (usuario: User | null) =>
  usuario?.profile === "Listener" && usuario.subprofile === "Other";

/** Apresentador/professor já aprovado precisa de nova aprovação ao trocar. */
const estaAprovado = (usuario: User) =>
  (usuario.profile === "Presenter" && usuario.isPresenterActive) ||
  (usuario.profile === "Professor" && usuario.isTeacherActive);

const valoresIniciais = (usuario: User) => ({
  nome: usuario.name,
  linkLattes: usuario.linkLattes ?? "",
  matricula: usaCpf(usuario)
    ? maskCPF(usuario.registrationNumber ?? "")
    : (usuario.registrationNumber ?? ""),
});

const labelObrigatorio = (texto: string) => (
  <>
    {texto} <span className="text-error">*</span>
  </>
);

export function FormMeuPerfil() {
  const { updateUserProfile } = useAuth();
  const { showAlert } = useSweetAlert();
  const [dadosUsuario, setDadosUsuario] = useState<User | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  // O formato da matrícula depende do perfil, que só é conhecido após o load.
  const usaCpfRef = useRef(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormMeuPerfilSchema>({
    resolver: (valores, contexto, opcoes) =>
      zodResolver(criarSchema(usaCpfRef.current))(valores, contexto, opcoes),
    defaultValues: { nome: "", linkLattes: "", matricula: "" },
  });

  useEffect(() => {
    const carregarPerfil = async () => {
      try {
        const data = await userApi.getMe();
        usaCpfRef.current = usaCpf(data);
        setDadosUsuario(data);
        reset(valoresIniciais(data));
      } catch (err: unknown) {
        showAlert({
          icon: "error",
          title: "Erro ao carregar perfil",
          text: getErrorMessage(
            err,
            "Não foi possível carregar seus dados. Tente novamente!",
          ),
          confirmButtonText: "Retornar",
        });
      } finally {
        setCarregando(false);
      }
    };

    carregarPerfil();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAoMudarDeNome = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filteredValue = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
    setValue("nome", filteredValue, { shouldDirty: true });
  };

  const handleMudancaMatricula = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = usaCpfRef.current
      ? maskCPF(e.target.value)
      : e.target.value.replace(/\D/g, "");
    setValue("matricula", valor, { shouldDirty: true });
  };

  const handleFormMeuPerfil = async ({
    nome,
    linkLattes = "",
    matricula,
  }: FormMeuPerfilSchema) => {
    if (!dadosUsuario) return;

    // Envia só o que mudou; a API ignora qualquer campo fora da whitelist.
    const body: UpdateMeRequest = {};
    if (nome !== dadosUsuario.name) body.name = nome;
    if (linkLattes !== (dadosUsuario.linkLattes ?? "")) {
      body.linkLattes = linkLattes;
    }

    const trocouMatricula =
      matricula !== (dadosUsuario.registrationNumber ?? "");
    if (trocouMatricula) body.registrationNumber = matricula;

    if (Object.keys(body).length === 0) return;

    const exigeNovaAprovacao = trocouMatricula && estaAprovado(dadosUsuario);
    if (exigeNovaAprovacao) {
      const { isConfirmed } = await showAlert({
        icon: "warning",
        title: "Alterar matrícula?",
        text: "Seu cadastro voltará a aguardar a aprovação de um administrador, que vai conferir o novo número.",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        confirmButtonText: "Alterar matrícula",
      });
      if (!isConfirmed) return;
    }

    setSalvando(true);
    try {
      const atualizado = await userApi.updateMe(body);
      const novosDados: User = {
        ...dadosUsuario,
        name: atualizado.name,
        linkLattes: atualizado.linkLattes ?? "",
        photoFilePath: atualizado.photoFilePath,
        registrationNumber: atualizado.registrationNumber,
        registrationNumberType: atualizado.registrationNumberType,
        isPresenterActive: atualizado.isPresenterActive,
        isTeacherActive: atualizado.isTeacherActive,
      };
      setDadosUsuario(novosDados);
      reset(valoresIniciais(novosDados));
      updateUserProfile({ name: atualizado.name });

      const voltouParaPendente =
        estaAprovado(dadosUsuario) && !estaAprovado(novosDados);
      showAlert(
        voltouParaPendente
          ? {
              icon: "info",
              title: "Perfil atualizado!",
              text: "Como a matrícula mudou, seu cadastro voltou a aguardar a aprovação de um administrador.",
              confirmButtonText: "Entendi",
            }
          : {
              icon: "success",
              title: "Perfil atualizado com sucesso!",
              timer: 3000,
              showConfirmButton: false,
            },
      );
    } catch (err: unknown) {
      showAlert({
        icon: "error",
        title: "Erro ao atualizar perfil",
        text: getErrorMessage(
          err,
          "Ocorreu um erro ao tentar atualizar seu perfil. Tente novamente!",
        ),
        confirmButtonText: "Retornar",
      });
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return <Loading />;
  }

  if (!dadosUsuario) {
    return (
      <p className="text-sm text-foreground">
        Não foi possível carregar seus dados.
      </p>
    );
  }

  // A resposta omite os campos da solicitação quando ela não existe mais,
  // por isso eles são atribuídos explicitamente (e não via spread).
  const handleSolicitacaoAtualizada = (atualizado: User) => {
    setDadosUsuario({
      ...dadosUsuario,
      requestedProfile: atualizado.requestedProfile,
      requestedSubprofile: atualizado.requestedSubprofile,
      profileRequestedAt: atualizado.profileRequestedAt,
    });
  };

  return (
    <div className="flex w-full flex-col items-center">
      <form
        className="w-full max-w-[540px]"
        onSubmit={handleSubmit(handleFormMeuPerfil)}
      >
        <Campo
          label={labelObrigatorio("Nome completo")}
          htmlFor="nome"
          erro={errors.nome?.message}
          className="mb-1"
        >
          <Input
            type="text"
            id="nome"
            placeholder="Insira seu nome"
            className="text-sm"
            maxLength={255}
            {...register("nome")}
            onChange={handleAoMudarDeNome}
          />
        </Campo>

        <Campo
          label="Link Lattes"
          htmlFor="linkLattes"
          erro={errors.linkLattes?.message}
          className="mb-1"
        >
          <Input
            type="text"
            id="linkLattes"
            placeholder="Insira seu link do perfil Lattes"
            className="text-sm"
            maxLength={50}
            {...register("linkLattes")}
          />
        </Campo>

        <Campo label="E-mail" htmlFor="email" className="mb-1">
          <Input
            type="email"
            id="email"
            className="text-sm"
            value={dadosUsuario.email}
            disabled
            readOnly
          />
        </Campo>

        <Campo
          label={labelObrigatorio(usaCpf(dadosUsuario) ? "CPF" : "Matrícula")}
          htmlFor="matricula"
          erro={errors.matricula?.message}
          className="mb-1"
        >
          <Input
            type="text"
            id="matricula"
            className="text-sm"
            placeholder={
              usaCpf(dadosUsuario) ? "000.000.000-00" : "Insira sua matrícula"
            }
            maxLength={usaCpf(dadosUsuario) ? 14 : 13}
            {...register("matricula")}
            onChange={handleMudancaMatricula}
          />
        </Campo>
        {estaAprovado(dadosUsuario) && (
          <p className="mb-1 text-xs text-gray-500">
            Alterar a matrícula exige nova aprovação de um administrador.
          </p>
        )}

        <p className="mb-4 mt-3 text-xs text-gray-500">
          O e-mail só pode ser alterado pela administração.
        </p>

        <Button type="submit" larguraTotal disabled={salvando || !isDirty}>
          {salvando ? "Salvando..." : "Salvar alterações"}
        </Button>
      </form>

      <SolicitarTrocaPerfil
        usuario={dadosUsuario}
        onAtualizado={handleSolicitacaoAtualizada}
      />
    </div>
  );
}
