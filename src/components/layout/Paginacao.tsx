"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

interface PaginacaoProps {
  pagina: number;
  totalPaginas: number;
  total: number;
  porPagina: number;
  aoMudarPagina: (pagina: number) => void;
  opcoesPorPagina?: readonly number[];
  aoMudarPorPagina?: (porPagina: number) => void;
  className?: string;
}

/** Números visíveis: primeira, última e vizinhas da atual, com reticências. */
export function paginasVisiveis(
  pagina: number,
  totalPaginas: number,
): (number | "…")[] {
  if (totalPaginas <= 7)
    return Array.from({ length: totalPaginas }, (_, i) => i + 1);
  const ordenadas = [1, totalPaginas, pagina - 1, pagina, pagina + 1]
    .filter(
      (p, i, todas) => p >= 1 && p <= totalPaginas && todas.indexOf(p) === i,
    )
    .sort((a, b) => a - b);
  return ordenadas.flatMap((p, i) =>
    i > 0 && p - ordenadas[i - 1] > 1 ? (["…", p] as const) : [p],
  );
}

const estiloBotao =
  "inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800/50 disabled:pointer-events-none disabled:opacity-40";

export default function Paginacao({
  pagina,
  totalPaginas,
  total,
  porPagina,
  aoMudarPagina,
  opcoesPorPagina,
  aoMudarPorPagina,
  className,
}: Readonly<PaginacaoProps>) {
  const inicio = total === 0 ? 0 : (pagina - 1) * porPagina + 1;
  const fim = Math.min(pagina * porPagina, total);

  return (
    <nav
      aria-label="Paginação"
      className={cn(
        "flex flex-col items-center justify-between gap-3 text-sm text-muted sm:flex-row",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span className="tabular-nums">
          {inicio.toLocaleString("pt-BR")}–{fim.toLocaleString("pt-BR")} de{" "}
          {total.toLocaleString("pt-BR")}
        </span>
        {opcoesPorPagina && aoMudarPorPagina && (
          <label className="flex items-center gap-2">
            <span className="hidden sm:inline" aria-hidden>
              Por página
            </span>
            <select
              aria-label="Registros por página"
              value={porPagina}
              onChange={(e) => aoMudarPorPagina(Number(e.target.value))}
              className="h-8 rounded-md border border-gray-300 bg-white px-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              {opcoesPorPagina.map((opcao) => (
                <option key={opcao} value={opcao}>
                  {opcao}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {totalPaginas > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            className={cn(estiloBotao, "text-foreground hover:bg-muted-light")}
            onClick={() => aoMudarPagina(pagina - 1)}
            disabled={pagina <= 1}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          {paginasVisiveis(pagina, totalPaginas).map((item, indice) =>
            item === "…" ? (
              <span key={`reticencias-${indice}`} className="px-1" aria-hidden>
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                className={cn(
                  estiloBotao,
                  item === pagina
                    ? "bg-blue-800 text-white"
                    : "text-foreground hover:bg-muted-light",
                )}
                onClick={() => aoMudarPagina(item)}
                aria-current={item === pagina ? "page" : undefined}
                aria-label={`Página ${item}`}
              >
                {item}
              </button>
            ),
          )}
          <button
            type="button"
            className={cn(estiloBotao, "text-foreground hover:bg-muted-light")}
            onClick={() => aoMudarPagina(pagina + 1)}
            disabled={pagina >= totalPaginas}
            aria-label="Próxima página"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}
    </nav>
  );
}
