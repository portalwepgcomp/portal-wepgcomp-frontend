"use client";

import { EyeOff } from "lucide-react";
import { cn } from "@/utils/cn";

const OCULTO = "[REDACTED]";
const TRUNCADO = "[TRUNCATED]";

function Primitivo({ valor }: Readonly<{ valor: unknown }>) {
  if (valor === null || valor === undefined) {
    return <span className="text-slate-400">null</span>;
  }
  if (typeof valor === "string") {
    if (valor === OCULTO) {
      return (
        <span
          className="inline-flex items-center gap-1 rounded bg-slate-200 px-1.5 py-px font-sans text-[10px] font-semibold uppercase tracking-wide text-slate-600"
          title="Valor sensível ocultado antes de gravar"
        >
          <EyeOff className="h-3 w-3" aria-hidden /> oculto
        </span>
      );
    }
    if (valor.startsWith(TRUNCADO)) {
      return <span className="italic text-slate-500">{valor}</span>;
    }
    return (
      <span className="whitespace-pre-wrap break-all text-emerald-700">
        &quot;{valor}&quot;
      </span>
    );
  }
  if (typeof valor === "number")
    return <span className="text-amber-700">{valor}</span>;
  if (typeof valor === "boolean")
    return <span className="text-violet-700">{String(valor)}</span>;
  return <span>{String(valor)}</span>;
}

function No({
  chave,
  valor,
  profundidade,
  abertoAte,
}: Readonly<{
  chave?: string;
  valor: unknown;
  profundidade: number;
  abertoAte: number;
}>) {
  const rotulo =
    chave !== undefined ? <span className="text-blue-800">{chave}</span> : null;

  if (valor === null || typeof valor !== "object") {
    return (
      <div className="py-px pl-4">
        {rotulo && <>{rotulo}: </>}
        <Primitivo valor={valor} />
      </div>
    );
  }

  const ehLista = Array.isArray(valor);
  const entradas = ehLista
    ? (valor as unknown[]).map(
        (item, indice) => [String(indice), item] as const,
      )
    : Object.entries(valor as Record<string, unknown>);
  const resumo = ehLista ? `[${entradas.length}]` : `{${entradas.length}}`;

  if (entradas.length === 0) {
    return (
      <div className="py-px pl-4">
        {rotulo && <>{rotulo}: </>}
        <span className="text-slate-400">{ehLista ? "[]" : "{}"}</span>
      </div>
    );
  }

  return (
    <details open={profundidade < abertoAte} className="group/no pl-4">
      <summary className="-ml-4 cursor-pointer list-none py-px pl-4 marker:hidden hover:bg-slate-100 [&::-webkit-details-marker]:hidden">
        <span className="-ml-4 inline-block w-4 text-slate-400 transition-transform group-open/no:rotate-90">
          ▸
        </span>
        {rotulo && <>{rotulo}: </>}
        <span className="text-slate-400">{resumo}</span>
      </summary>
      <div className="border-l border-slate-200">
        {entradas.map(([k, v]) => (
          <No
            key={k}
            chave={k}
            valor={v}
            profundidade={profundidade + 1}
            abertoAte={abertoAte}
          />
        ))}
      </div>
    </details>
  );
}

interface VisualizadorJsonProps {
  valor: unknown;
  abertoAte?: number;
  className?: string;
}

/** Árvore recolhível; valores ocultados pelo backend aparecem como selo. */
export default function VisualizadorJson({
  valor,
  abertoAte = 2,
  className,
}: Readonly<VisualizadorJsonProps>) {
  const vazio =
    valor === undefined ||
    valor === null ||
    (typeof valor === "object" && Object.keys(valor as object).length === 0);

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-md border border-line bg-slate-50 py-2 pl-1 pr-3 font-mono text-xs leading-relaxed text-slate-800",
        className,
      )}
    >
      {vazio ? (
        <div className="pl-3 text-slate-400">vazio</div>
      ) : (
        <No valor={valor} profundidade={0} abertoAte={abertoAte} />
      )}
    </div>
  );
}
