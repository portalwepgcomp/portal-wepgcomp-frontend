"use client";

import { useEffect, useState } from "react";

import HtmlEditorComponent from "@/components/HtmlEditorComponent/HtmlEditorComponent";
import { getEventEditionIdStorage } from "@/context/AuthProvider/util";
import { useEdicao } from "@/hooks/useEdicao";
import { obterClassesBotao } from "@/lib/estilosBotao";

/**
 * Exibe a localização cadastrada na edição e preserva sua edição administrativa.
 */
export default function Endereco() {
  const [content, setContent] = useState("");
  const [mapQuery, setMapQuery] = useState("");
  const { updateEdicao, Edicao } = useEdicao();

  useEffect(() => {
    setContent(Edicao?.location ?? "");
  }, [Edicao?.location]);

  useEffect(() => {
    const addressElement = document.createElement("div");
    addressElement.innerHTML = Edicao?.location ?? "";
    addressElement.querySelectorAll("br").forEach((element) => {
      element.replaceWith(" ");
    });
    addressElement.querySelectorAll("p, div, li").forEach((element) => {
      element.append(" ");
    });

    const address =
      addressElement.textContent?.replace(/\s+/g, " ").trim() ?? "";
    setMapQuery(
      address
        .replace(/\bR\.\s*/gi, "Rua ")
        .replace(/\bAv\.\s*/gi, "Avenida ")
        .replace(/\s+-\s+/g, ", ")
        .trim(),
    );
  }, [Edicao?.location]);

  const encodedMapQuery = encodeURIComponent(mapQuery);
  const mapsExternalUrl = `https://www.google.com/maps/search/?api=1&hl=pt-BR&query=${encodedMapQuery}`;
  const mapUrl = mapQuery
    ? `https://maps.google.com/maps?q=${encodedMapQuery}&z=17&output=embed&hl=pt-BR`
    : null;

  const handleEditAddress = () => {
    if (!Edicao) return;

    const eventEditionId = getEventEditionIdStorage() ?? Edicao.id;

    void updateEdicao(eventEditionId, {
      location: content,
      name: Edicao.name,
    });
  };

  return (
    <div className="flex w-full flex-col items-start gap-4">
      <div className="flex items-center gap-3">
        <div className="h-7 w-1.5 rounded-full bg-brand-orange" />
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Local do Evento
        </h2>
      </div>

      <div className="flex w-full flex-col gap-2 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex min-w-0 items-start gap-3 sm:flex-1">
            <span className="mt-1 shrink-0 text-xl text-brand-orange">📍</span>
            <div className="min-w-0 flex-1 text-sm leading-relaxed text-slate-700">
              <HtmlEditorComponent
                content={content}
                onChange={setContent}
                handleEditField={handleEditAddress}
              />
            </div>
          </div>

          {mapQuery && (
            <a
              href={mapsExternalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${obterClassesBotao("outline")} w-full sm:w-auto sm:shrink-0`}
            >
              <span>Como chegar</span>
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          )}
        </div>
      </div>

      <div className="relative h-[280px] w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm lg:h-auto lg:min-h-0 lg:flex-1">
        {mapUrl ? (
          <iframe
            title="Mapa do Local do Evento"
            src={mapUrl}
            className="h-full w-full border-0"
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-5 text-center text-sm text-slate-500">
            Endereço do evento não informado.
          </div>
        )}
      </div>
    </div>
  );
}
