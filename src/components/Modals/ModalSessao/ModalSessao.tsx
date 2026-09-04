"use client";

import FormSessaoApresentacoes from "@/components/Forms/Sessao/FormSessaoApresentacoes";
import FormSessaoGeral from "@/components/Forms/Sessao/FormSessaoGeral";
import { SessaoTipoEnum } from "@/enums/session";
import { useEdicao } from "@/hooks/useEdicao";
import { useSession } from "@/hooks/useSession";
import { useEffect, useMemo, useState } from "react";
import ModalComponent from "@/components/UI/ModalComponent/ModalComponent";

const tipo = {
  label: "Tipo de sessão",
  options: [
    { value: "General", label: "Sessão auxiliar do evento" },
    { value: "Presentation", label: "Sessão de apresentações" },
  ],
};

const titulo = {
  cadastro: "Cadastrar sessão",
  edicao: "Editar sessão",
};

export default function ModalSessao() {
  const { sessao, listRooms, sessoesList } = useSession();
  const { Edicao } = useEdicao();

  const disabledIntervals = useMemo(() => {
    if (!sessoesList) return [];
    const otherSessions = sessoesList.filter((s) => s.id !== sessao?.id);

    return otherSessions.map((s) => {
      const start = new Date(s.startTime);
      const end = new Date(start.getTime() + (s.duration ?? 0) * 60000);
      return { start, end };
    });
  }, [sessoesList, sessao?.id]);

  const [tipoSessao, setTipoSessao] = useState<SessaoTipoEnum>(
    sessao?.type === SessaoTipoEnum["Sessão de apresentações"]
      ? SessaoTipoEnum["Sessão de apresentações"]
      : SessaoTipoEnum["Sessão auxiliar do evento"],
  );

  useEffect(() => {
    if (sessao?.type) {
      setTipoSessao(
        (sessao?.type ||
          SessaoTipoEnum["Sessão auxiliar do evento"]) as SessaoTipoEnum,
      );
    }
  }, [sessao?.type]);

  useEffect(() => {
    if (Edicao?.id) {
      listRooms(Edicao.id);
    }
  }, [Edicao?.id]);

  return (
    <ModalComponent
      id="sessaoModal"
      idCloseModal="sessaoModalClose"
      loading={false}
    >
      <div className="w-full text-black">
        <h3 className="mb-4 text-xl font-bold">
          {sessao?.id ? titulo.edicao : titulo.cadastro}
        </h3>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-bold">{tipo.label}</label>
          <div className="flex flex-wrap gap-4">
            {tipo.options?.map((op, i) => (
              <div className="flex items-center gap-2" key={`radio${op.value}-${i}`}>
                <input
                  type="radio"
                  className="h-4 w-4 accent-brand-blue"
                  id={`sessao-tipo-radio-${i}`}
                  value={op.value}
                  name="radioTipoSessao"
                  checked={sessao?.id ? sessao.type === op.value : undefined}
                  defaultChecked={
                    op.value === SessaoTipoEnum["Sessão auxiliar do evento"]
                  }
                  disabled={!!sessao?.id}
                  onChange={() => setTipoSessao(op.value as SessaoTipoEnum)}
                />
                <label
                  className="text-sm font-bold"
                  htmlFor={`sessao-tipo-radio-${i}`}
                >
                  {op.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {tipoSessao === SessaoTipoEnum["Sessão auxiliar do evento"] ? (
          <FormSessaoGeral disabledIntervals={disabledIntervals} />
        ) : (
          <FormSessaoApresentacoes disabledIntervals={disabledIntervals} />
        )}
      </div>
    </ModalComponent>
  );
}
