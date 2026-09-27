"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

import HtmlEditorComponent from "@/components/HtmlEditorComponent/HtmlEditorComponent";
import { getEventEditionIdStorage } from "@/context/AuthProvider/util";
import { useEdicao } from "@/hooks/useEdicao";
import { obterClassesBotao } from "@/lib/estilosBotao";

import { coordenadasValidas, montarUrlComoChegar } from "./enderecoMapa";

const MapaEvento = dynamic(() => import("./MapaEvento"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-slate-500">
      Carregando mapa...
    </div>
  ),
});

/**
 * Exibe a localização cadastrada na edição e preserva sua edição administrativa.
 * O pin do mapa usa exclusivamente latitude/longitude cadastradas.
 */
export default function Endereco() {
  const { updateEdicao, Edicao } = useEdicao();
  const [content, setContent] = useState(Edicao?.location ?? "");

  useEffect(() => {
    setContent(Edicao?.location ?? "");
  }, [Edicao?.location]);

  const coordenadas = useMemo(() => {
    const latitude = Edicao?.locationLatitude;
    const longitude = Edicao?.locationLongitude;
    if (!coordenadasValidas(latitude, longitude)) return null;
    return {
      latitude: latitude as number,
      longitude: longitude as number,
    };
  }, [Edicao?.locationLatitude, Edicao?.locationLongitude]);

  const mapsExternalUrl = useMemo(
    () =>
      coordenadas
        ? montarUrlComoChegar(coordenadas.latitude, coordenadas.longitude)
        : null,
    [coordenadas],
  );

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

          {mapsExternalUrl && (
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
        {coordenadas ? (
          <MapaEvento
            latitude={coordenadas.latitude}
            longitude={coordenadas.longitude}
          />
        ) : (
          <div className="flex h-full items-center justify-center p-5 text-center text-sm text-slate-500">
            Informe latitude e longitude no cadastro da edição para exibir o
            mapa com o pin exato.
          </div>
        )}
      </div>
    </div>
  );
}
