"use client";

import Button from "@/components/UI/Button";
import { Pencil, Trash2 } from "lucide-react";

import ReadMore from "@/components/ReadMore/ReadMore";
import { useSweetAlert } from "@/hooks/useAlert";
import { cn } from "@/utils/cn";
import { Edicao } from "@/models/edicao";

interface CardEdicaoProps {
  edicao: Edicao;
  edicaoAtiva: boolean;
  onEditar: () => void;
  onExcluir: () => void;
}

export default function CardEdicao({
  edicao,
  edicaoAtiva,
  onEditar,
  onExcluir,
}: Readonly<CardEdicaoProps>) {
  const { showAlert } = useSweetAlert();

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
          {edicao.name || "Sem Título"}
        </h5>
        <ReadMore text={edicao.description ?? ""} maxLength={100} />
      </div>

      <div className="m-4 flex gap-1 max-[980px]:w-full max-[980px]:justify-center">
        <Button size="lg"
          variante="outline"
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
