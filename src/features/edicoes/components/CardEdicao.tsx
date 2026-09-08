"use client";

import Image from "next/image";
import { useState } from "react";

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
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const estilo = (id: string) => ({
    transition: "transform 0.3s ease",
    transform: hoveredId === id ? "scale(1.2)" : "scale(1)",
  });

  const confirmarExclusao = () => {
    showAlert({
      title: "Você tem certeza?",
      text: "Ao deletar você não poderá reverter essa ação.",
      icon: "warning",
      showCancelButton: true,
      cancelButtonColor: "#CF000A",
      cancelButtonText: "Cancelar",
      showConfirmButton: true,
      confirmButtonColor: "#019A34",
      confirmButtonText: "Deletar",
    }).then((result) => {
      if (result.isConfirmed) onExcluir();
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
        <button
          onClick={onEditar}
          className={cn(
            "w-min border-0 bg-transparent p-0",
            !edicaoAtiva && "hidden",
          )}
          type="button"
          onMouseEnter={() => setHoveredId("editar")}
          onMouseLeave={() => setHoveredId(null)}
        >
          <Image
            src="/assets/images/edit.svg"
            alt="Editar"
            width={50}
            height={50}
            style={estilo("editar")}
          />
        </button>

        {edicaoAtiva && (
          <button
            type="button"
            className="w-min border-0 bg-transparent p-0"
            onClick={confirmarExclusao}
            onMouseEnter={() => setHoveredId("excluir")}
            onMouseLeave={() => setHoveredId(null)}
          >
            <Image
              src="/assets/images/delete.svg"
              alt="Excluir"
              width={50}
              height={50}
              style={estilo("excluir")}
            />
          </button>
        )}
      </div>
    </div>
  );
}
