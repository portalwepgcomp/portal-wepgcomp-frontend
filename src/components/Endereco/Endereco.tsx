"use client";

import { obterClassesBotao } from "@/lib/estilosBotao";

const EVENT_LOCATION_NAME = "Instituto de Geociências da UFBA";
const EVENT_LOCATION_ADDRESS =
  "R. Barão de Jeremoabo, s/n — Ondina, Salvador - BA, 40170-290";
const MAPS_QUERY = encodeURIComponent(
  `${EVENT_LOCATION_NAME} - UFBA - ${EVENT_LOCATION_ADDRESS}`,
);
const EVENT_MAP_URL =
  "https://www.openstreetmap.org/export/embed.html?bbox=-38.5112076%2C-13.0020929%2C-38.5032076%2C-12.9940929&layer=mapnik&marker=-12.9980929%2C-38.5072076";

export default function Endereco() {
  const mapsExternalUrl = `https://www.google.com/maps/search/?api=1&hl=pt-BR&query=${MAPS_QUERY}`;

  return (
    <div className="flex w-full flex-col items-start gap-4">
      <div className="flex items-center gap-3">
        <div className="h-7 w-1.5 rounded-full bg-brand-orange" />
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Local do Evento
        </h2>
      </div>

      <div className="flex w-full flex-col gap-2 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex min-w-0 items-start gap-3 sm:flex-1">
            <span className="mt-1 shrink-0 text-xl text-brand-orange">📍</span>
            <div className="min-w-0 flex-1 text-sm leading-relaxed text-slate-700">
              <p className="text-base font-semibold text-slate-900">
                {EVENT_LOCATION_NAME}
              </p>
              <p className="text-slate-500">{EVENT_LOCATION_ADDRESS}</p>
            </div>
          </div>
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
        </div>
      </div>

      <div className="relative h-[280px] w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm lg:h-auto lg:min-h-0 lg:flex-1">
        <iframe
          title="Mapa do Local do Evento"
          src={EVENT_MAP_URL}
          className="h-full w-full border-0"
          loading="eager"
        />
      </div>
    </div>
  );
}
