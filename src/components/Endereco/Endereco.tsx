"use client";

import { useContext, useEffect, useMemo, useState } from "react";

import HtmlEditorComponent from "@/components/HtmlEditorComponent/HtmlEditorComponent";
import { isAdminLevel } from "@/components/Perfil/perfilLabels";
import { AuthContext } from "@/context/AuthProvider/authProvider";
import { getEventEditionIdStorage } from "@/context/AuthProvider/util";
import { useEdicao } from "@/hooks/useEdicao";
import { obterClassesBotao } from "@/lib/estilosBotao";

import {
  coordenadasValidas,
  montarUrlComoChegar,
  montarUrlMapaEmbed,
  parseCoordenada,
} from "./enderecoMapa";

/**
 * Exibe a localização cadastrada na edição.
 * O pin do Google Maps usa apenas latitude/longitude cadastradas.
 */
export default function Endereco() {
  const { user } = useContext(AuthContext);
  const { updateEdicao, Edicao } = useEdicao();
  const isAdm = isAdminLevel(user?.level);

  const [content, setContent] = useState(Edicao?.location ?? "");
  const [latitudeInput, setLatitudeInput] = useState(
    Edicao?.locationLatitude?.toString() ?? "",
  );
  const [longitudeInput, setLongitudeInput] = useState(
    Edicao?.locationLongitude?.toString() ?? "",
  );

  useEffect(() => {
    setContent(Edicao?.location ?? "");
    setLatitudeInput(Edicao?.locationLatitude?.toString() ?? "");
    setLongitudeInput(Edicao?.locationLongitude?.toString() ?? "");
  }, [Edicao?.location, Edicao?.locationLatitude, Edicao?.locationLongitude]);

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

  const mapUrl = useMemo(
    () =>
      coordenadas
        ? montarUrlMapaEmbed(coordenadas.latitude, coordenadas.longitude)
        : null,
    [coordenadas],
  );

  const handleEditAddress = () => {
    if (!Edicao) return;

    const eventEditionId = getEventEditionIdStorage() ?? Edicao.id;
    const locationLatitude = parseCoordenada(latitudeInput);
    const locationLongitude = parseCoordenada(longitudeInput);

    void updateEdicao(eventEditionId, {
      location: content,
      name: Edicao.name,
      locationLatitude,
      locationLongitude,
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

              {isAdm && (
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                    Latitude
                    <input
                      type="text"
                      inputMode="decimal"
                      value={latitudeInput}
                      onChange={(event) => setLatitudeInput(event.target.value)}
                      placeholder="Ex.: -13.0020509"
                      disabled={!Edicao?.isActive}
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm text-slate-800 disabled:bg-gray-50"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                    Longitude
                    <input
                      type="text"
                      inputMode="decimal"
                      value={longitudeInput}
                      onChange={(event) =>
                        setLongitudeInput(event.target.value)
                      }
                      placeholder="Ex.: -38.5098765"
                      disabled={!Edicao?.isActive}
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm text-slate-800 disabled:bg-gray-50"
                    />
                  </label>
                  <p className="sm:col-span-2 text-xs text-slate-500">
                    Preencha as coordenadas e clique em Salvar no editor do
                    endereço. Google Maps → botão direito no ponto → copiar
                    coordenadas.
                  </p>
                </div>
              )}
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
            Informe latitude e longitude para exibir o mapa com o pin exato.
          </div>
        )}
      </div>
    </div>
  );
}
