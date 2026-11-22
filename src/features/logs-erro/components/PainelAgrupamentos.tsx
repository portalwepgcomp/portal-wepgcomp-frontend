"use client";

import { Check } from "lucide-react";
import { cn } from "@/utils/cn";
import type { CampoAgrupamento, ItemResumo, OrigemLog } from "../tipos";
import {
  descricaoStatus,
  formatarNumero,
  formatarRelativo,
  ROTULO_ORIGEM,
} from "../lib/formatacao";
import { EsqueletoBloco } from "./EstadosLogs";

export const DIMENSOES: {
  campo: Exclude<CampoAgrupamento, "day">;
  rotulo: string;
}[] = [
  { campo: "route", rotulo: "Rota" },
  { campo: "exceptionName", rotulo: "Exceção" },
  { campo: "statusCode", rotulo: "Status" },
  { campo: "userEmail", rotulo: "Usuário" },
  { campo: "source", rotulo: "Origem" },
  { campo: "prismaCode", rotulo: "Prisma" },
  { campo: "loggerContext", rotulo: "Contexto" },
];

const VISIVEIS = 8;

function rotuloDoItem(
  campo: CampoAgrupamento,
  chave: ItemResumo["key"],
): string {
  if (chave === null || chave === "") {
    const vazio: Partial<Record<CampoAgrupamento, string>> = {
      route: "Sem rota (fora de requisição)",
      statusCode: "Sem status HTTP",
      userEmail: "Anônimo",
      prismaCode: "Sem código Prisma",
      exceptionName: "Sem exceção",
      loggerContext: "Sem contexto",
    };
    return vazio[campo] ?? "—";
  }
  if (campo === "source")
    return ROTULO_ORIGEM[chave as OrigemLog] ?? String(chave);
  if (campo === "statusCode")
    return `${chave} · ${descricaoStatus(Number(chave))}`;
  return String(chave);
}

interface PainelAgrupamentosProps {
  campo: CampoAgrupamento;
  aoMudarCampo: (campo: CampoAgrupamento) => void;
  itens?: ItemResumo[];
  carregando: boolean;
  estaAtivo: (chave: ItemResumo["key"]) => boolean;
  aoAlternar: (chave: ItemResumo["key"]) => void;
}

/** Contagens por dimensão, que viram filtro com um clique. */
export default function PainelAgrupamentos({
  campo,
  aoMudarCampo,
  itens,
  carregando,
  estaAtivo,
  aoAlternar,
}: Readonly<PainelAgrupamentosProps>) {
  const visiveis = (itens ?? []).slice(0, VISIVEIS);
  const maximo = Math.max(1, ...visiveis.map((item) => item.count));
  const restantes = (itens?.length ?? 0) - visiveis.length;

  return (
    <section
      aria-labelledby="titulo-agrupamentos"
      className="flex flex-col rounded-lg border border-line bg-card p-4 shadow-sm sm:p-5"
    >
      <header className="mb-3 flex items-center justify-between gap-2">
        <h2
          id="titulo-agrupamentos"
          className="m-0 text-sm font-semibold text-foreground"
        >
          Onde se concentra
        </h2>
        <label className="flex items-center gap-1.5 text-xs text-muted">
          <select
            aria-label="Agrupar por"
            value={campo === "day" ? "route" : campo}
            onChange={(e) => aoMudarCampo(e.target.value as CampoAgrupamento)}
            className="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
          >
            {DIMENSOES.map((dimensao) => (
              <option key={dimensao.campo} value={dimensao.campo}>
                por {dimensao.rotulo.toLowerCase()}
              </option>
            ))}
          </select>
        </label>
      </header>

      {carregando && !itens ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }, (_, i) => (
            <EsqueletoBloco key={i} className="h-9" />
          ))}
        </div>
      ) : visiveis.length === 0 ? (
        <p className="m-0 py-8 text-center text-sm text-muted">
          Sem registros para agrupar.
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {visiveis.map((item) => {
            const ativo = estaAtivo(item.key);
            const clicavel = item.key !== null && item.key !== "";
            const rotulo = rotuloDoItem(campo, item.key);
            return (
              <li key={String(item.key)}>
                <button
                  type="button"
                  disabled={!clicavel}
                  aria-pressed={clicavel ? ativo : undefined}
                  onClick={() => aoAlternar(item.key)}
                  title={
                    clicavel
                      ? ativo
                        ? "Remover filtro"
                        : "Filtrar por este valor"
                      : undefined
                  }
                  className={cn(
                    "group relative flex w-full items-center gap-2 overflow-hidden rounded-md px-2.5 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800/50",
                    clicavel ? "hover:bg-muted-light" : "cursor-default",
                    ativo && "bg-primary-light",
                  )}
                >
                  <span
                    className={cn(
                      "absolute inset-y-1 left-0 rounded-r-md transition-[width] motion-reduce:transition-none",
                      ativo
                        ? "bg-blue-800/15"
                        : "bg-primary-light group-hover:bg-primary/20",
                    )}
                    style={{ width: `${(item.count / maximo) * 100}%` }}
                    aria-hidden
                  />
                  {ativo && (
                    <Check
                      className="relative h-3.5 w-3.5 shrink-0 text-blue-800"
                      aria-hidden
                    />
                  )}
                  <span
                    className={cn(
                      "relative min-w-0 flex-1 truncate",
                      campo === "route" ||
                        campo === "exceptionName" ||
                        campo === "loggerContext"
                        ? "font-mono text-[13px]"
                        : "",
                      !clicavel && "italic text-muted",
                    )}
                  >
                    {rotulo}
                  </span>
                  <span className="relative hidden shrink-0 text-[11px] text-muted xl:inline">
                    {item.lastOccurrence
                      ? formatarRelativo(item.lastOccurrence)
                      : ""}
                  </span>
                  <span className="relative w-10 shrink-0 text-right text-sm font-semibold tabular-nums text-foreground">
                    {formatarNumero(item.count)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {restantes > 0 && (
        <p className="m-0 mt-2 text-xs text-muted">
          + {restantes} outro(s) valor(es) com menos ocorrências
        </p>
      )}
    </section>
  );
}
