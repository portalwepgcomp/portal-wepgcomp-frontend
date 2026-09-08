"use client";

import { Plus } from "lucide-react";
import BarraBusca from "./BarraBusca";

interface BotaoCriar {
  rotulo: string;
  desabilitado?: boolean;
  onClick: () => void;
}

interface ToolbarListagemProps {
  busca: string;
  onBuscaChange: (valor: string) => void;
  ocultarBusca?: boolean;
  placeholderBusca?: string;
  criar?: BotaoCriar;
}

export default function ToolbarListagem({
  busca,
  onBuscaChange,
  ocultarBusca,
  placeholderBusca,
  criar,
}: Readonly<ToolbarListagemProps>) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-4">
        {criar ? (
          <button
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-lg border-0 bg-brand-orange px-5 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-orange-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={criar.onClick}
            disabled={criar.desabilitado}
          >
            <span>{criar.rotulo}</span>
            <Plus className="h-5 w-5" />
          </button>
        ) : null}

        <BarraBusca
          valor={busca}
          onChange={onBuscaChange}
          placeholder={placeholderBusca}
          ocultar={ocultarBusca}
        />
      </div>
    </div>
  );
}
