"use client";

import Image from "next/image";
import { useState } from "react";

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
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const estilo = (id: string) => ({
    transition: "transform 0.3s ease",
    transform: hoveredId === id ? "scale(1.2)" : "scale(1)",
  });

  const podeReordenar =
    sessao.type === "Presentation" && (sessao.presentations?.length ?? 0) > 0;

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
          {sessao.title || "Sem Título"}
        </h5>
        <p className="mb-0 text-[0.95rem] text-[#666]">
          {sessao.horarioFormatado}
        </p>
      </div>

      <div className="m-4 flex gap-1 max-[980px]:w-full max-[980px]:justify-center">
        {podeReordenar && edicaoAtiva && (
          <button
            className="mr-2 mt-1 h-9 min-w-max rounded-[0.625rem] bg-brand-accent px-4 py-1 text-sm font-extrabold text-white max-[980px]:h-auto max-[980px]:min-w-0"
            onClick={onReordenar}
            type="button"
          >
            Trocar ordem das apresentações
          </button>
        )}

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
