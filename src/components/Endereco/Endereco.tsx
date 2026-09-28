"use client";

import { useEffect, useMemo, useState } from "react";

import HtmlEditorComponent from "@/components/HtmlEditorComponent/HtmlEditorComponent";
import { getEventEditionIdStorage } from "@/context/AuthProvider/util";
import { useEdicao } from "@/hooks/useEdicao";
import { obterClassesBotao } from "@/lib/estilosBotao";

import { normalizarLinkMapa } from "./linkMapa";

const MENSAGEM_LINK_INVALIDO =
  "Cole o código de Compartilhar → Incorporar um mapa. O link comum do Google não pode aparecer aqui.";

/**
 * Exibe o endereço da edição e o mapa incorporado do Google.
 */
export default function Endereco() {
  const { updateEdicao, Edicao } = useEdicao();
  const [content, setContent] = useState(Edicao?.location ?? "");
  const [linkMapa, setLinkMapa] = useState(Edicao?.mapEmbedUrl ?? "");
  const [erroLink, setErroLink] = useState<string | null>(null);

  useEffect(() => {
    setContent(Edicao?.location ?? "");
    setLinkMapa(Edicao?.mapEmbedUrl ?? "");
  }, [Edicao?.location, Edicao?.mapEmbedUrl]);

  const mapaSalvo = useMemo(
    () => normalizarLinkMapa(Edicao?.mapEmbedUrl ?? ""),
    [Edicao?.mapEmbedUrl],
  );

  const handleEditAddress = () => {
    if (!Edicao) return false;

    const textoLink = linkMapa.trim();
    const mapa = textoLink ? normalizarLinkMapa(textoLink) : null;
    if (textoLink && !mapa) {
      setErroLink(MENSAGEM_LINK_INVALIDO);
      return false;
    }

    setErroLink(null);
    const eventEditionId = getEventEditionIdStorage() ?? Edicao.id;
    void updateEdicao(eventEditionId, {
      location: content,
      name: Edicao.name,
      mapEmbedUrl: mapa?.embed ?? null,
    });
    return true;
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
                editExtras={
                  <div className="mt-3 flex flex-col gap-1">
                    <label
                      htmlFor="link-mapa"
                      className="text-xs font-medium text-slate-600"
                    >
                      Link do mapa
                    </label>
                    <textarea
                      id="link-mapa"
                      value={linkMapa}
                      rows={4}
                      disabled={!Edicao?.isActive}
                      placeholder="Cole aqui o HTML de Incorporar um mapa"
                      aria-invalid={erroLink ? true : undefined}
                      aria-describedby="link-mapa-ajuda"
                      onChange={(event) => {
                        setLinkMapa(event.target.value);
                        setErroLink(null);
                      }}
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm text-slate-800 disabled:bg-gray-50"
                    />
                    <p id="link-mapa-ajuda" className="text-xs text-slate-500">
                      Google Maps → Compartilhar → Incorporar um mapa → copiar
                      HTML.
                    </p>
                    {erroLink && (
                      <p role="alert" className="text-xs text-red-700">
                        {erroLink}
                      </p>
                    )}
                  </div>
                }
              />
            </div>
          </div>

          {mapaSalvo && (
            <a
              href={mapaSalvo.abrir}
              target="_blank"
              rel="noopener noreferrer"
              className={`${obterClassesBotao("outline")} w-full sm:w-auto sm:shrink-0`}
            >
              <span>Abrir no Google Maps</span>
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
        {mapaSalvo ? (
          <iframe
            title="Mapa do Local do Evento"
            src={mapaSalvo.embed}
            className="h-full w-full border-0"
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-5 text-center text-sm text-slate-500">
            Local do Evento
          </div>
        )}
      </div>
    </div>
  );
}
