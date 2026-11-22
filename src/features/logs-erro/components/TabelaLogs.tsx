"use client";

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronRight,
  Lock,
  LockOpen,
} from "lucide-react";
import { cn } from "@/utils/cn";
import type { CampoOrdenacao, LogErroResumo } from "../tipos";
import {
  formatarDataHora,
  formatarLocal,
  formatarRelativo,
  mensagemCurta,
  ROTULO_ORIGEM,
  tomDoLog,
} from "../lib/formatacao";
import SeloStatus, { SeloMetodo } from "./SeloStatus";

const BORDA_TOM = {
  erro: "before:bg-error-strong",
  alerta: "before:bg-warning",
  neutro: "before:bg-line",
} as const;

interface TabelaLogsProps {
  itens: LogErroResumo[];
  selecionado?: string;
  focado?: number;
  ordenar: CampoOrdenacao;
  ordem: "asc" | "desc";
  agora: Date;
  aoOrdenar: (campo: CampoOrdenacao) => void;
  aoAbrir: (id: string) => void;
  aoPreCarregar: (id: string) => void;
}

function CabecalhoOrdenavel({
  campo,
  rotulo,
  ordenar,
  ordem,
  aoOrdenar,
  className,
}: Readonly<{
  campo: CampoOrdenacao;
  rotulo: string;
  ordenar: CampoOrdenacao;
  ordem: "asc" | "desc";
  aoOrdenar: (campo: CampoOrdenacao) => void;
  className?: string;
}>) {
  const ativo = ordenar === campo;
  const Icone = !ativo ? ArrowUpDown : ordem === "asc" ? ArrowUp : ArrowDown;
  return (
    <th
      scope="col"
      aria-sort={
        ativo ? (ordem === "asc" ? "ascending" : "descending") : "none"
      }
      className={cn("px-3 py-2.5 text-left font-semibold", className)}
    >
      <button
        type="button"
        onClick={() => aoOrdenar(campo)}
        className={cn(
          "-mx-1 inline-flex items-center gap-1 rounded px-1 uppercase tracking-wider hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800/50",
          ativo && "text-blue-800",
        )}
      >
        {rotulo}
        <Icone className={cn("h-3 w-3", !ativo && "opacity-40")} aria-hidden />
      </button>
    </th>
  );
}

function Usuario({ log }: Readonly<{ log: LogErroResumo }>) {
  if (!log.userEmail) {
    return <span className="text-sm italic text-muted">Anônimo</span>;
  }
  const Cadeado = log.isAuthenticated ? Lock : LockOpen;
  return (
    <span className="flex min-w-0 flex-col">
      <span className="flex items-center gap-1 truncate text-sm text-foreground">
        <Cadeado
          className={cn(
            "h-3 w-3 shrink-0",
            log.isAuthenticated ? "text-success" : "text-warning",
          )}
          aria-label={
            log.isAuthenticated ? "Autenticado" : "Token inválido ou expirado"
          }
        />
        <span className="truncate">{log.userName ?? log.userEmail}</span>
      </span>
      <span className="truncate text-xs text-muted">{log.userEmail}</span>
    </span>
  );
}

export default function TabelaLogs({
  itens,
  selecionado,
  focado,
  ordenar,
  ordem,
  agora,
  aoOrdenar,
  aoAbrir,
  aoPreCarregar,
}: Readonly<TabelaLogsProps>) {
  const props = { ordenar, ordem, aoOrdenar };

  return (
    <>
      <table className="hidden w-full table-fixed border-collapse text-sm md:table">
        <caption className="sr-only">Registros de falha</caption>
        <thead className="border-b border-line bg-muted-light/50 text-[11px] text-muted">
          <tr>
            <CabecalhoOrdenavel
              campo="statusCode"
              rotulo="Status"
              className="w-[136px] pl-5"
              {...props}
            />
            <CabecalhoOrdenavel
              campo="createdAt"
              rotulo="Quando"
              className="w-[148px]"
              {...props}
            />
            <CabecalhoOrdenavel
              campo="exceptionName"
              rotulo="Erro"
              {...props}
            />
            <CabecalhoOrdenavel
              campo="route"
              rotulo="Requisição"
              className="w-[24%]"
              {...props}
            />
            <CabecalhoOrdenavel
              campo="userEmail"
              rotulo="Usuário"
              className="w-[20%]"
              {...props}
            />
            <th scope="col" className="w-8">
              <span className="sr-only">Abrir</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {itens.map((log, indice) => {
            const ativo = selecionado === log.id;
            const local = formatarLocal(log);
            return (
              <tr
                key={log.id}
                onClick={() => aoAbrir(log.id)}
                onMouseEnter={() => aoPreCarregar(log.id)}
                data-focado={focado === indice || undefined}
                className={cn(
                  "group cursor-pointer transition-colors hover:bg-primary-light/50",
                  ativo && "bg-primary-light",
                  focado === indice &&
                    "outline outline-2 -outline-offset-2 outline-blue-800/50",
                )}
              >
                {/* A faixa de cor fica na célula: um ::before na <tr> vira uma coluna extra. */}
                <td
                  className={cn(
                    "relative py-3 pl-5 pr-3 align-top",
                    "before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:content-['']",
                    BORDA_TOM[tomDoLog(log)],
                  )}
                >
                  <SeloStatus log={log} compacto />
                </td>
                <td className="px-3 py-3 align-top">
                  <time
                    dateTime={log.createdAt}
                    title={formatarDataHora(log.createdAt)}
                    className="block whitespace-nowrap text-sm text-foreground"
                  >
                    {formatarRelativo(log.createdAt, agora)}
                  </time>
                  <span className="block text-xs tabular-nums text-muted">
                    {formatarDataHora(log.createdAt).slice(0, 16)}
                  </span>
                </td>
                <td className="min-w-0 px-3 py-3 align-top">
                  <button
                    type="button"
                    onClick={(evento) => {
                      evento.stopPropagation();
                      aoAbrir(log.id);
                    }}
                    onFocus={() => aoPreCarregar(log.id)}
                    className="block w-full min-w-0 rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800/50"
                  >
                    <span className="block truncate font-semibold text-foreground">
                      {log.exceptionName ?? "Erro"}
                      {log.prismaCode && (
                        <span className="ml-1.5 rounded bg-brand-navy/10 px-1 py-px font-mono text-[11px] font-semibold text-brand-navy">
                          {log.prismaCode}
                        </span>
                      )}
                    </span>
                    <span
                      className="block truncate text-[13px] text-muted"
                      title={log.message}
                    >
                      {mensagemCurta(log.message)}
                    </span>
                    {local && (
                      <span className="mt-0.5 block truncate font-mono text-[11px] text-brand-slate">
                        {local}
                      </span>
                    )}
                  </button>
                </td>
                <td className="min-w-0 px-3 py-3 align-top">
                  {log.method || log.route ? (
                    <span className="flex min-w-0 items-center gap-1.5">
                      <SeloMetodo metodo={log.method} />
                      <span
                        className="truncate font-mono text-xs text-foreground"
                        title={log.path ?? undefined}
                      >
                        {log.route ?? log.path}
                      </span>
                    </span>
                  ) : (
                    <span className="text-xs text-muted">
                      {ROTULO_ORIGEM[log.source]}
                      {log.loggerContext && (
                        <span className="block font-mono text-[11px]">
                          {log.loggerContext}
                        </span>
                      )}
                    </span>
                  )}
                </td>
                <td className="min-w-0 px-3 py-3 align-top">
                  <Usuario log={log} />
                </td>
                <td className="py-3 pr-3 align-top">
                  <ChevronRight
                    className="h-4 w-4 text-muted opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <ul className="m-0 flex list-none flex-col divide-y divide-line p-0 md:hidden">
        {itens.map((log) => (
          <li key={log.id}>
            <button
              type="button"
              onClick={() => aoAbrir(log.id)}
              className={cn(
                "relative flex w-full flex-col gap-1.5 px-4 py-3 text-left",
                "before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:content-['']",
                BORDA_TOM[tomDoLog(log)],
                selecionado === log.id && "bg-primary-light",
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <SeloStatus log={log} />
                <time dateTime={log.createdAt} className="text-xs text-muted">
                  {formatarRelativo(log.createdAt, agora)}
                </time>
              </span>
              <span className="truncate text-sm font-semibold text-foreground">
                {log.exceptionName ?? "Erro"}
              </span>
              <span className="line-clamp-2 text-[13px] text-muted">
                {mensagemCurta(log.message)}
              </span>
              <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted">
                <SeloMetodo metodo={log.method} />
                <span className="truncate font-mono">
                  {log.route ?? ROTULO_ORIGEM[log.source]}
                </span>
                <span aria-hidden>·</span>
                <span className="truncate">{log.userEmail ?? "Anônimo"}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
