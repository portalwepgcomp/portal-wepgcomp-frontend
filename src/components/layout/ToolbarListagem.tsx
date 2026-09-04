"use client";

import Image from "next/image";
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
  /** Botão de criação (opcional). Só renderiza quando informado. */
  criar?: BotaoCriar;
}

/**
 * Barra de ações compartilhada das listagens: botão criar (opcional) + busca.
 * Só layout; a feature decide se/como criar e o que a busca filtra.
 */
export default function ToolbarListagem({
  busca,
  onBuscaChange,
  ocultarBusca,
  placeholderBusca,
  criar,
}: Readonly<ToolbarListagemProps>) {
  return (
    <div className="mb-4 grid grid-cols-[1.5fr_3fr_4fr] gap-4 max-[980px]:grid-cols-[1.5fr_4fr] max-md:grid-cols-1 max-md:justify-items-stretch">
      {criar ? (
        <button
          type="button"
          className="flex max-w-[15.625rem] items-center justify-between rounded-[10px] border-0 bg-brand-orange px-4 py-2 font-semibold text-white disabled:opacity-50 max-md:h-12"
          onClick={criar.onClick}
          disabled={criar.desabilitado}
        >
          {criar.rotulo}
          <Image src="/assets/images/add.svg" alt="" width={24} height={24} />
        </button>
      ) : null}

      <BarraBusca
        valor={busca}
        onChange={onBuscaChange}
        placeholder={placeholderBusca}
        ocultar={ocultarBusca}
      />
    </div>
  );
}
