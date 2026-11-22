"use client";

import { ArrowUp } from "lucide-react";

export default function AvisoNovosRegistros({
  quantidade,
  aoMostrar,
}: Readonly<{ quantidade: number; aoMostrar: () => void }>) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none absolute inset-x-0 top-14 z-20 flex justify-center"
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
