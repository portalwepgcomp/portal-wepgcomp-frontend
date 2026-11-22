"use client";

import { ArrowUp } from "lucide-react";
import { cn } from "@/utils/cn";

export default function AvisoNovosRegistros({
  quantidade,
  fixo = false,
  aoMostrar,
}: Readonly<{
  quantidade: number;
  /** O topo da tabela saiu da tela: o aviso acompanha a rolagem. */
  fixo?: boolean;
  aoMostrar: () => void;
}>) {
  return (
    <div
      aria-live="polite"
      className={cn(
        "pointer-events-none inset-x-0 flex justify-center",
        fixo ? "fixed top-4 z-40" : "absolute top-14 z-20",
      )}
    >
      {quantidade > 0 && (
        <button
          type="button"
          onClick={aoMostrar}
          className="pointer-events-auto inline-flex animate-[selectContentShow_0.25s_ease-out] items-center gap-1.5 rounded-full bg-blue-800 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg transition hover:bg-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800/50 focus-visible:ring-offset-2"
        >
          <ArrowUp className="h-3.5 w-3.5" aria-hidden />
          {quantidade === 1
            ? "1 novo registro"
            : `${quantidade} novos registros`}
        </button>
      )}
    </div>
  );
}
