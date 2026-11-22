"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/utils/cn";
import type { Indicadores } from "../hooks/useIndicadoresLogsErro";
import { formatarNumero } from "../lib/formatacao";
import { EsqueletoBloco } from "./EstadosLogs";

export type AcaoIndicador =
  "servidor" | "cliente" | "foraDeRequisicao" | "usuarios";

interface FaixaIndicadoresProps {
  indicadores?: Indicadores;
  carregando: boolean;
  ativos: Partial<Record<AcaoIndicador, boolean>>;
  aoSelecionar: (acao: AcaoIndicador) => void;
}

function Variacao({
  variacao,
  anterior,
}: Readonly<{ variacao?: number; anterior?: number }>) {
  if (anterior === undefined)
    return <span className="text-xs text-muted">…</span>;
  if (variacao === undefined) {
    return (
      <span className="text-xs text-muted">sem dados no período anterior</span>
    );
  }
  const pct = Math.round(Math.abs(variacao) * 100);
  const Icone =
    pct === 0 ? Minus : variacao > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-semibold",
        pct === 0
          ? "text-muted"
          : variacao > 0
            ? "text-error-strong"
            : "text-success",
      )}
      title={`${formatarNumero(anterior)} no período anterior`}
    >
      <Icone className="h-3.5 w-3.5" aria-hidden />
      {pct}%{" "}
      <span className="font-normal text-muted">vs. período anterior</span>
    </span>
  );
}

interface CartaoProps {
  rotulo: string;
  valor: string;
  detalhe: React.ReactNode;
  acento: string;
  ativo?: boolean;
  onClick?: () => void;
  dica?: string;
}

function Cartao({
  rotulo,
  valor,
  detalhe,
  acento,
  ativo,
  onClick,
  dica,
}: Readonly<CartaoProps>) {
  const conteudo = (
    <>
      <span
        className={cn("absolute inset-y-3 left-0 w-1 rounded-r-full", acento)}
        aria-hidden
      />
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
        {rotulo}
      </span>
      <span className="text-2xl font-bold tabular-nums leading-tight text-foreground">
        {valor}
      </span>
      <span className="min-h-[1rem]">{detalhe}</span>
    </>
  );
  const base =
    "relative flex flex-col gap-1 overflow-hidden rounded-lg border bg-card px-4 py-3 text-left shadow-sm";

  if (!onClick)
    return <div className={cn(base, "border-line")}>{conteudo}</div>;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      title={dica}
      className={cn(
        base,
        "transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800/50 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        ativo ? "border-blue-800 ring-1 ring-blue-800" : "border-line",
      )}
    >
      {conteudo}
    </button>
  );
}

export default function FaixaIndicadores({
  indicadores,
  carregando,
  ativos,
  aoSelecionar,
}: Readonly<FaixaIndicadoresProps>) {
  if (carregando || !indicadores) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5" aria-busy>
        {Array.from({ length: 5 }, (_, i) => (
          <EsqueletoBloco
            key={i}
            className={cn("h-[92px]", i === 0 && "col-span-2 lg:col-span-1")}
          />
        ))}
      </div>
    );
  }

  const parcela = (valor: number) =>
    indicadores.total > 0
      ? `${Math.round((valor / indicadores.total) * 100)}% do total`
      : "—";

  return (
    <section
      aria-label="Indicadores do período"
      className="grid grid-cols-2 gap-3 lg:grid-cols-5"
    >
      <div className="col-span-2 lg:col-span-1">
        <Cartao
          rotulo="Ocorrências"
          valor={formatarNumero(indicadores.total)}
          detalhe={
            <Variacao
              variacao={indicadores.variacao}
              anterior={indicadores.totalAnterior}
            />
          }
          acento="bg-blue-800"
        />
      </div>
      <Cartao
        rotulo="Falhas do servidor"
        valor={formatarNumero(indicadores.servidor)}
        detalhe={
          <span className="text-xs text-muted">
            5xx · {parcela(indicadores.servidor)}
          </span>
        }
        acento="bg-error-strong"
        ativo={ativos.servidor}
        onClick={() => aoSelecionar("servidor")}
        dica="Filtrar respostas 5xx"
      />
      <Cartao
        rotulo="Erros de cliente"
        valor={formatarNumero(indicadores.cliente)}
        detalhe={
          <span className="text-xs text-muted">
            4xx · {parcela(indicadores.cliente)}
          </span>
        }
        acento="bg-warning"
        ativo={ativos.cliente}
        onClick={() => aoSelecionar("cliente")}
        dica="Filtrar respostas 4xx"
      />
      <Cartao
        rotulo="Fora de requisições"
        valor={formatarNumero(indicadores.foraDeRequisicao)}
        detalhe={
          <span className="text-xs text-muted">tarefas, logger e processo</span>
        }
        acento="bg-brand-slate"
        ativo={ativos.foraDeRequisicao}
        onClick={() => aoSelecionar("foraDeRequisicao")}
        dica="Filtrar falhas de tarefas agendadas, logger e processo"
      />
      <Cartao
        rotulo="Usuários afetados"
        valor={`${formatarNumero(indicadores.usuariosAfetados)}${indicadores.usuariosNoLimite ? "+" : ""}`}
        detalhe={
          <span className="text-xs text-muted">com e-mail identificado</span>
        }
        acento="bg-brand-navy"
        ativo={ativos.usuarios}
        onClick={() => aoSelecionar("usuarios")}
        dica="Agrupar por usuário"
      />
    </section>
  );
}
