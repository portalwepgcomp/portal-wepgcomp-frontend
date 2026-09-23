"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import Button from "@/components/UI/Button";
import { Download, Pencil, Trash2 } from "lucide-react";

import ReadMore from "@/components/ReadMore/ReadMore";
import { useApresentacaoPdf } from "@/hooks/useApresentacaoPdf";
import { useSweetAlert } from "@/hooks/useAlert";
import { convertDriveLinkToDownload } from "@/utils/convertDriveLink";
import { obterNomeArquivoViaUrl } from "@/utils/obterNomeArquivoUrl";
import type { ApresentacaoLista } from "../types";

interface CardApresentacaoListaProps {
  item: ApresentacaoLista;
  edicaoAtiva: boolean;
  onEditar: () => void;
  onExcluir: () => void;
}

function DicaAcao({ texto, children }: { texto: string; children: ReactNode }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-xs font-medium text-white shadow-lg group-hover:block group-focus-within:block"
      >
        {texto}
      </span>
    </span>
  );
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
  const { baixarPdf, baixandoPdf } = useApresentacaoPdf();

  const apresentador = item.mainAuthor?.name?.trim() || "Sem nome";
  const orientador = item.advisor?.name?.trim() || "";
  const resumo = item.abstract ?? item.abstractText ?? "";

  const nomeArquivo = item.pdfFile ? obterNomeArquivoViaUrl(item.pdfFile) : "";
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
          <DicaAcao texto="Abrir link da apresentação">
            <a
              href={linkHospedado}
              download
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Abrir link da apresentação"
            >
              <Image
                src="/assets/images/link.svg"
                alt=""
                width={40}
                height={40}
              />
            </a>
          </DicaAcao>
        ) : null}

        {item.pdfFile ? (
          <DicaAcao texto="Download">
            <Button
              size="icon-lg"
              variante="primary"
              type="button"
              onClick={() => baixarPdf(item.id, item.pdfFile)}
              disabled={baixandoPdf}
              aria-label={"Download de " + (nomeArquivo || "apresentação")}
              className="h-11 w-11 p-0"
            >
              <Download aria-hidden="true" className="size-6" />
            </Button>
          </DicaAcao>
        ) : null}

        {edicaoAtiva && (
          <DicaAcao texto="Editar">
            <Button
              size="lg"
              variante="secondary"
              aria-label="Editar"
              onClick={onEditar}
              type="button"
            >
              <Pencil aria-hidden="true" />
            </Button>
          </DicaAcao>
        )}

        {edicaoAtiva && (
          <DicaAcao texto="Excluir">
            <Button
              size="lg"
              type="button"
              variante="danger"
              aria-label="Excluir"
              onClick={confirmarExclusao}
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </DicaAcao>
        )}
      </div>
    </div>
  );
}
