"use client";

import { BarChart3 } from "lucide-react";
import { cn } from "@/utils/cn";
import type { PontoSerie } from "../lib/serieDiaria";
import {
  formatarDiaCurto,
  formatarDiaLongo,
  formatarNumero,
} from "../lib/formatacao";
import { EsqueletoBloco } from "./EstadosLogs";

interface GraficoProps {
  serie: PontoSerie[];
  carregando: boolean;
  diaSelecionado?: string;
  aoSelecionarDia: (dia: string) => void;
}

/** Barras em HTML/CSS — sem biblioteca de gráficos para 30 colunas. */
export default function GraficoOcorrenciasDia({
  serie,
  carregando,
  diaSelecionado,
  aoSelecionarDia,
}: Readonly<GraficoProps>) {
  const maximo = Math.max(1, ...serie.map((p) => p.total));
  const total = serie.reduce((soma, p) => soma + p.total, 0);
  const media = serie.length ? total / serie.length : 0;
  const pico = serie.reduce<PontoSerie | undefined>(
    (maior, p) => (!maior || p.total > maior.total ? p : maior),
    undefined,
  );
  const curto = serie.length < 3;
  const rotulosEixo = new Set(
    serie.length <= 8
      ? serie.map((p) => p.dia)
      : [
          serie[0]?.dia,
          serie[Math.floor(serie.length / 2)]?.dia,
          serie[serie.length - 1]?.dia,
        ],
  );

  return (
    <section
      aria-labelledby="titulo-grafico-dia"
      className="flex flex-col rounded-lg border border-line bg-card p-4 shadow-sm sm:p-5"
    >
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2
            id="titulo-grafico-dia"
            className="m-0 text-sm font-semibold text-foreground"
          >
            Ocorrências por dia
          </h2>
          <p className="m-0 text-xs text-muted">
            Clique em um dia para ver só os registros dele
          </p>
        </div>
        {pico && pico.total > 0 && !curto && (
          <p className="m-0 text-xs text-muted">
            Pico de{" "}
            <strong className="text-foreground">
              {formatarNumero(pico.total)}
            </strong>{" "}
            em {formatarDiaCurto(pico.dia)} · média{" "}
            {media.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}/dia
          </p>
        )}
      </header>

      {carregando ? (
        <EsqueletoBloco className="h-44" />
      ) : curto ? (
        <div className="flex h-44 flex-col items-center justify-center gap-2 rounded-md bg-muted-light/60 text-center">
          <BarChart3 className="h-6 w-6 text-muted" aria-hidden />
          <p className="m-0 max-w-xs text-sm text-muted">
            O gráfico diário aparece em períodos de 7 dias ou mais.{" "}
            <strong className="text-foreground">{formatarNumero(total)}</strong>{" "}
            ocorrência(s) no período.
          </p>
        </div>
      ) : (
        <>
          <div className="relative h-44" aria-hidden>
            {media > 0 && (
              <div
                className="pointer-events-none absolute inset-x-0 z-10 border-t border-dashed border-brand-slate/60"
                style={{ bottom: `${(media / maximo) * 100}%` }}
              >
                <span className="absolute -top-4 right-0 bg-card px-1 text-[10px] font-medium text-brand-slate">
                  média
                </span>
              </div>
            )}
            <div className="flex h-full items-end gap-[3px]">
              {serie.map((ponto) => {
                const selecionado = diaSelecionado === ponto.dia;
                const ehPico = pico?.dia === ponto.dia && ponto.total > 0;
                return (
                  <button
                    key={ponto.dia}
                    type="button"
                    tabIndex={-1}
                    onClick={() => aoSelecionarDia(ponto.dia)}
                    title={`${formatarDiaLongo(ponto.dia)}: ${formatarNumero(ponto.total)} ocorrência(s)`}
                    className="group flex h-full min-w-0 flex-1 items-end"
                  >
                    <span
                      className={cn(
                        "block w-full rounded-t-[3px] transition-colors motion-reduce:transition-none",
                        ponto.total === 0
                          ? "h-[2px] bg-line"
                          : selecionado
                            ? "bg-brand-orange"
                            : ehPico
                              ? "bg-error-strong/80 group-hover:bg-error-strong"
                              : "bg-blue-800/70 group-hover:bg-blue-800",
                      )}
                      style={
                        ponto.total
                          ? {
                              height: `${Math.max(3, (ponto.total / maximo) * 100)}%`,
                            }
                          : undefined
                      }
                    />
                  </button>
                );
              })}
            </div>
          </div>
          <div
            className="mt-2 flex gap-[3px] text-[10px] text-muted"
            aria-hidden
          >
            {serie.map((ponto) => (
              <span
                key={ponto.dia}
                className="min-w-0 flex-1 overflow-visible whitespace-nowrap text-center"
              >
                {rotulosEixo.has(ponto.dia) ? formatarDiaCurto(ponto.dia) : ""}
              </span>
            ))}
          </div>

          <table className="sr-only">
            <caption>Ocorrências por dia</caption>
            <thead>
              <tr>
                <th scope="col">Dia</th>
                <th scope="col">Ocorrências</th>
                <th scope="col">Filtrar</th>
              </tr>
            </thead>
            <tbody>
              {serie.map((ponto) => (
                <tr key={ponto.dia}>
                  <td>{formatarDiaLongo(ponto.dia)}</td>
                  <td>{ponto.total}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => aoSelecionarDia(ponto.dia)}
                    >
                      Ver registros de {formatarDiaCurto(ponto.dia)}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}
