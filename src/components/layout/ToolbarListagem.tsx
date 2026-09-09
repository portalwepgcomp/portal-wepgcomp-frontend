"use client";

import Button from "@/components/UI/Button";
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
      <div className="flex min-w-0 max-w-full flex-wrap items-center gap-4">
        {criar ? (
          <Button size="lg" variante="primary"
            type="button"
            onClick={criar.onClick}
            disabled={criar.desabilitado}
          >
            <span>{criar.rotulo}</span>
            <Plus  />
          </Button>
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
