"use client";

import Image from "next/image";
import Button from "@/components/UI/Button";
import { Pencil, Trash2 } from "lucide-react";

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
          >
            <Image
              src="/assets/images/link.svg"
              alt={`Link externo ${nomeArquivo || "arquivo"}`}
              width={40}
              height={40}
            />
          </a>
        ) : null}

        {urlDownload ? (
          <a
            href={urlDownload}
            download
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/assets/images/download.svg.svg"
              alt={`Download ${nomeArquivo || "arquivo"}`}
              width={40}
              height={40}
            />
          </a>
        ) : null}

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
