"use client";

import Image from "next/image";
import { useState } from "react";

import ReadMore from "@/components/ReadMore/ReadMore";
import { useSweetAlert } from "@/hooks/useAlert";
import { cn } from "@/utils/cn";
import { convertDriveLinkToDownload } from "@/utils/convertDriveLink";
import { obterNomeArquivoViaUrl } from "@/utils/obterNomeArquivoUrl";
import type { ApresentacaoLista } from "../types";

interface CardApresentacaoListaProps {
  item: ApresentacaoLista;
  edicaoAtiva: boolean;
  onEditar: () => void;
  onExcluir: () => void;
}

/**
 * Card de apresentação para a listagem (substitui `CardListagem` neste contexto).
 * Sem union types nem props legadas: recebe a `Submission` enriquecida e handlers.
 */
export default function CardApresentacaoLista({
  item,
  edicaoAtiva,
  onEditar,
  onExcluir,
}: Readonly<CardApresentacaoListaProps>) {
  const { showAlert } = useSweetAlert();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const estilo = (id: string) => ({
    transition: "transform 0.3s ease",
    transform: hoveredId === id ? "scale(1.2)" : "scale(1)",
  });

  const apresentador = item.mainAuthor?.name?.trim() || "Sem nome";
  const orientador = item.advisor?.name?.trim() || "";
  const resumo = item.abstract ?? item.abstractText ?? "";

  const nomeArquivo = item.pdfFile ? obterNomeArquivoViaUrl(item.pdfFile) : "";
  const urlDownload = item.pdfFile
    ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/${nomeArquivo}`
    : "";
  const linkHospedado = convertDriveLinkToDownload(item.linkHostedFile);

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
    <div className="flex items-center justify-between rounded-[10px] border-[3px] border-brand-accent max-[980px]:flex-col">
      <div className="w-full p-4 text-black">
        <h5 className="mb-1 text-xl font-bold text-black">{item.title}</h5>
        {apresentador !== "Sem nome" && (
          <div className="mb-2 flex flex-col gap-0.5">
            <h6 className="mb-0 text-base font-semibold text-[#333]">
              Apresentador(a): {apresentador}
            </h6>
            {orientador && (
              <p className="mb-0 text-[0.95rem] text-[#666]">
                Orientador(a): {orientador}
              </p>
            )}
          </div>
        )}
        <ReadMore text={resumo} maxLength={100} />
      </div>

      <div className="m-4 flex gap-1 max-[980px]:w-full max-[980px]:justify-center">
        {linkHospedado ? (
          <a
            href={linkHospedado}
            download
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setHoveredId("link")}
            onMouseLeave={() => setHoveredId(null)}
          >
            <Image
              src="/assets/images/link.svg"
              alt={`Link externo ${nomeArquivo || "arquivo"}`}
              width={40}
              height={40}
              style={estilo("link")}
            />
          </a>
        ) : null}

        {urlDownload ? (
          <a
            href={urlDownload}
            download
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setHoveredId("download")}
            onMouseLeave={() => setHoveredId(null)}
          >
            <Image
              src="/assets/images/download.svg.svg"
              alt={`Download ${nomeArquivo || "arquivo"}`}
              width={40}
              height={40}
              style={estilo("download")}
            />
          </a>
        ) : null}

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
