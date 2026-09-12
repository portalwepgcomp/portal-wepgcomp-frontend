"use client";

import Button from "@/components/UI/Button";
import { Pencil, Trash2 } from "lucide-react";

import { useSweetAlert } from "@/hooks/useAlert";
import { cn } from "@/utils/cn";
import type { SessaoComHorario } from "../formatarHorario";

interface CardSessaoProps {
  sessao: SessaoComHorario;
  edicaoAtiva: boolean;
  onEditar: () => void;
  onExcluir: () => void;
  onReordenar: () => void;
}

export default function CardSessao({
  sessao,
  edicaoAtiva,
  onEditar,
  onExcluir,
  onReordenar,
}: Readonly<CardSessaoProps>) {
  const { showAlert } = useSweetAlert();

  const podeReordenar =
    sessao.type === "Presentation" && (sessao.presentations?.length ?? 0) > 0;

  const confirmarExclusao = () => {
    showAlert({
      title: "Você tem certeza?",
      text: "Ao deletar você não poderá reverter essa ação.",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      showConfirmButton: true,
      varianteConfirmacao: "primary",
      confirmButtonText: "Deletar",
    }).then((resultado) => {
      if (resultado.isConfirmed) onExcluir();
    });
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md max-[980px]:flex-col">
      <div className="w-full p-4 text-black">
        <h5 className="mb-1 text-xl font-bold text-black">
          {sessao.title || "Sem Título"}
        </h5>
        <p className="mb-0 text-[0.95rem] text-[#666]">
          {sessao.horarioFormatado}
        </p>
      </div>

      <div className="m-4 flex gap-1 max-[980px]:w-full max-[980px]:justify-center">
        {podeReordenar && edicaoAtiva && (
          <Button size="lg"
            variante="secondary" className="mr-2 mt-1"
            onClick={onReordenar}
            type="button"
          >
            Trocar ordem das apresentações
          </Button>
        )}

        <Button size="lg"
          variante="secondary"
          aria-label="Editar"
          onClick={onEditar}
          className={cn(
            "",
            !edicaoAtiva && "hidden",
          )}
          type="button"
        >
          <Pencil  aria-hidden="true" />
        </Button>

        {edicaoAtiva && (
          <Button size="lg"
            type="button"

            variante="danger"
            aria-label="Excluir"
            onClick={confirmarExclusao}
          >
            <Trash2  aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}
