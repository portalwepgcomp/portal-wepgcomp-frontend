"use client";

import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Database,
  FileCode2,
  Filter,
  Lock,
  LockOpen,
  ScrollText,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Abas, AbaPainel } from "@/components/UI/Abas";
import BotaoCopiar from "@/components/UI/BotaoCopiar";
import PainelLateral from "@/components/UI/PainelLateral";
import { userInitials } from "@/components/Perfil/perfilLabels";
import { getErrorMessage } from "@/utils/error";
import { cn } from "@/utils/cn";
import type {
  FiltrosLogsErro,
  LogErroDetalhe,
  LogErroResumo,
  OperacaoPrisma,
} from "../tipos";
import { useLogErroDetalhe } from "../hooks/useLogsErroQuery";
import {
  descricaoStatus,
  formatarDataHora,
  formatarDuracao,
  formatarHoraPrecisa,
  formatarRelativo,
  mensagemCurta,
  ROTULO_NIVEL,
  ROTULO_NIVEL_USUARIO,
  ROTULO_ORIGEM,
  ROTULO_PERFIL,
  ROTULO_TOKEN,
  tomDoLog,
} from "../lib/formatacao";
import { agruparQuadros, analisarPilha } from "../lib/pilha";
import { resumoParaIssue } from "../lib/resumoParaIssue";
import SeloStatus, { COR_TOM, SeloMetodo } from "../components/SeloStatus";
import { EsqueletoBloco } from "../components/EstadosLogs";
import VisualizadorJson from "./VisualizadorJson";

type Aba = "resumo" | "pilha" | "requisicao" | "banco" | "linha" | "json";

interface PainelDetalheLogProps {
  id?: string;
  anteriorId?: string;
  proximoId?: string;
  aoFechar: () => void;
  aoNavegar: (id: string) => void;
  aoFiltrar: (mudancas: Partial<FiltrosLogsErro>) => void;
}

function Fato({
  rotulo,
  children,
  mono,
}: Readonly<{ rotulo: string; children: ReactNode; mono?: boolean }>) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">
        {rotulo}
      </dt>
      <dd
        className={cn(
          "m-0 min-w-0 break-words text-sm text-foreground",
          mono && "font-mono text-[13px]",
        )}
      >
        {children}
      </dd>
    </div>
  );
}

function Secao({
  titulo,
  acao,
  children,
}: Readonly<{ titulo: string; acao?: ReactNode; children: ReactNode }>) {
  return (
    <section className="flex flex-col gap-2">
      <header className="flex items-center justify-between gap-2">
        <h3 className="m-0 text-xs font-semibold uppercase tracking-wider text-brand-slate">
          {titulo}
        </h3>
        {acao}
      </header>
      {children}
    </section>
  );
}

function BotaoFiltro({
  children,
  onClick,
}: Readonly<{ children: ReactNode; onClick: () => void }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-blue-800/40 hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800/50"
    >
      <Filter className="h-3 w-3 text-muted" aria-hidden />
      {children}
    </button>
  );
}

function Vazio({
  icone: Icone,
  children,
}: Readonly<{ icone: typeof Database; children: ReactNode }>) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-line px-4 py-10 text-center">
      <Icone className="h-6 w-6 text-muted" aria-hidden />
      <p className="m-0 max-w-sm text-sm text-muted">{children}</p>
    </div>
  );
}

function AbaResumo({
  log,
  aoFiltrar,
}: Readonly<{
  log: LogErroDetalhe;
  aoFiltrar: PainelDetalheLogProps["aoFiltrar"];
}>) {
  const tom = tomDoLog(log);
  const ctx = log.context ?? {};
  const handler = ctx.handler?.controller
    ? `${ctx.handler.controller}.${ctx.handler.method ?? "?"}`
    : undefined;

  return (
    <div className="flex flex-col gap-6">
      <pre
        className={cn(
          "m-0 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-md border-l-4 px-4 py-3 font-mono text-[13px] leading-relaxed",
          tom === "erro"
            ? "border-error-strong bg-error-light/40 text-error-strong"
            : "border-warning bg-warning-light/70 text-[#7c2d12]",
        )}
      >
        {log.message.trim()}
      </pre>

      <dl className="m-0 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        <Fato rotulo="Quando">
          {formatarDataHora(log.createdAt)}
          <span className="font-mono text-xs text-muted">
            .
            {String(new Date(log.createdAt).getMilliseconds()).padStart(3, "0")}
          </span>
          <span className="block text-xs text-muted">
            {formatarRelativo(log.createdAt)} · horário de Brasília
          </span>
        </Fato>
        <Fato rotulo="Origem e nível">
          {ROTULO_ORIGEM[log.source]} · {ROTULO_NIVEL[log.level]}
          {log.loggerContext && (
            <span className="block font-mono text-xs text-muted">
              {log.loggerContext}
            </span>
          )}
        </Fato>
        {(log.method || log.path) && (
          <Fato rotulo="Requisição" mono>
            <span className="flex flex-wrap items-center gap-1.5">
              <SeloMetodo metodo={log.method} />
              <span className="break-all">{log.path}</span>
            </span>
            {log.route && log.route !== log.path && (
              <span className="block text-xs text-muted">rota {log.route}</span>
            )}
          </Fato>
        )}
        {log.statusCode && (
          <Fato rotulo="Resposta">
            <span className="font-mono">{log.statusCode}</span> ·{" "}
            {descricaoStatus(log.statusCode)}
            {formatarDuracao(ctx.durationMs) && (
              <span className="block text-xs text-muted">
                em {formatarDuracao(ctx.durationMs)}
              </span>
            )}
          </Fato>
        )}
        {log.file && (
          <Fato rotulo="Onde no código" mono>
            <span className="text-blue-800">
              {log.file}
              {log.line ? `:${log.line}` : ""}
              {log.column ? `:${log.column}` : ""}
            </span>
            {log.functionName && (
              <span className="block text-xs text-muted">
                em {log.functionName}()
              </span>
            )}
          </Fato>
        )}
        {handler && (
          <Fato rotulo="Handler" mono>
            {handler}
          </Fato>
        )}
        {log.prismaCode && (
          <Fato rotulo="Código Prisma" mono>
            {log.prismaCode}
          </Fato>
        )}
        {log.requestId && (
          <Fato rotulo="Request ID" mono>
            <span className="flex items-center gap-1">
              <span className="truncate">{log.requestId}</span>
              <BotaoCopiar
                texto={log.requestId}
                rotulo="Copiar request ID"
                compacto
              />
            </span>
          </Fato>
        )}
      </dl>

      <Secao titulo="Usuário">
        {log.userEmail ? (
          <div className="flex items-start gap-3 rounded-lg border border-line p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-semibold text-white">
              {userInitials(log.userName ?? log.userEmail)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="m-0 truncate text-sm font-semibold text-foreground">
                {log.userName ?? "—"}
              </p>
              <p className="m-0 truncate text-sm text-muted">{log.userEmail}</p>
              <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-medium">
                {log.userLevel && (
                  <span className="rounded bg-muted-light px-1.5 py-0.5 text-muted">
                    {ROTULO_NIVEL_USUARIO[log.userLevel] ?? log.userLevel}
                  </span>
                )}
                {log.userProfile && (
                  <span className="rounded bg-muted-light px-1.5 py-0.5 text-muted">
                    {ROTULO_PERFIL[log.userProfile] ?? log.userProfile}
                  </span>
                )}
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded px-1.5 py-0.5",
                    log.isAuthenticated
                      ? "bg-success-light text-[#1e7e46]"
                      : "bg-warning-light text-warning",
                  )}
                >
                  {log.isAuthenticated ? (
                    <Lock className="h-3 w-3" aria-hidden />
                  ) : (
                    <LockOpen className="h-3 w-3" aria-hidden />
                  )}
                  {log.isAuthenticated
                    ? "Autenticado"
                    : (ROTULO_TOKEN[ctx.request?.tokenStatus ?? ""] ??
                      "Não autenticado")}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="m-0 text-sm text-muted">
            Sem usuário identificado
            {ctx.request?.tokenStatus
              ? ` (${ROTULO_TOKEN[ctx.request.tokenStatus]?.toLowerCase()})`
              : ""}
            .
          </p>
        )}
      </Secao>

      <Secao titulo="Investigar">
        <div className="flex flex-wrap gap-2">
          {log.exceptionName && (
            <BotaoFiltro
              onClick={() => aoFiltrar({ excecao: [log.exceptionName!] })}
            >
              Mesma exceção
            </BotaoFiltro>
          )}
          {log.route && (
            <BotaoFiltro onClick={() => aoFiltrar({ rota: log.route! })}>
              Mesma rota
            </BotaoFiltro>
          )}
          {log.userEmail && (
            <BotaoFiltro onClick={() => aoFiltrar({ usuario: log.userEmail! })}>
              Mesmo usuário
            </BotaoFiltro>
          )}
          {log.file && (
            <BotaoFiltro onClick={() => aoFiltrar({ arquivo: log.file! })}>
              Mesmo arquivo
            </BotaoFiltro>
          )}
          {log.prismaCode && (
            <BotaoFiltro
              onClick={() => aoFiltrar({ prisma: [log.prismaCode!] })}
            >
              Mesmo código Prisma
            </BotaoFiltro>
          )}
        </div>
      </Secao>
    </div>
  );
}

function AbaPilha({ log }: Readonly<{ log: LogErroDetalhe }>) {
  const pilha = log.context?.stack;
  const { cabecalho, quadros } = analisarPilha(pilha);

  if (!pilha)
    return (
      <Vazio icone={FileCode2}>
        Nenhuma pilha de chamadas foi registrada para esta falha.
      </Vazio>
    );

  return (
    <div className="flex flex-col gap-4">
      <Secao
        titulo="Pilha de chamadas"
        acao={
          <BotaoCopiar texto={pilha} rotulo="Copiar pilha">
            Copiar
          </BotaoCopiar>
        }
      >
        <div className="overflow-hidden rounded-md border border-line font-mono text-xs">
          <p className="m-0 whitespace-pre-wrap break-words bg-error-light/40 px-3 py-2 font-semibold text-error-strong">
            {cabecalho}
          </p>
          <ol className="m-0 list-none divide-y divide-line p-0">
            {agruparQuadros(quadros).map((grupo, indice) =>
              grupo.doProjeto ? (
                <li key={indice} className="bg-primary-light/40 px-3 py-1.5">
                  <span className="font-semibold text-foreground">
                    {grupo.quadro.funcao ?? "(anônima)"}
                  </span>
                  <span className="block text-blue-800">
                    {grupo.quadro.arquivo}:{grupo.quadro.linha}:
                    {grupo.quadro.coluna}
                  </span>
                </li>
              ) : (
                <li key={indice}>
                  <details className="group/q">
                    <summary className="cursor-pointer list-none px-3 py-1.5 text-muted hover:bg-muted-light [&::-webkit-details-marker]:hidden">
                      <span className="mr-1 inline-block transition-transform group-open/q:rotate-90">
                        ▸
                      </span>
                      {grupo.quadros.length} quadro(s) de bibliotecas e do Node
                    </summary>
                    <ul className="m-0 list-none bg-muted-light/40 p-0 pb-1">
                      {grupo.quadros.map((quadro, i) => (
                        <li
                          key={i}
                          className="break-all px-6 py-0.5 text-slate-500"
                        >
                          {quadro.texto}
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ),
            )}
          </ol>
        </div>
      </Secao>
      {log.context?.cause !== undefined && (
        <Secao titulo="Causa encadeada">
          <VisualizadorJson valor={log.context.cause} />
        </Secao>
      )}
    </div>
  );
}

function AbaRequisicao({ log }: Readonly<{ log: LogErroDetalhe }>) {
  const req = log.context?.request;
  if (!req) {
    return (
      <Vazio icone={ScrollText}>
        Esta falha aconteceu fora de uma requisição HTTP (
        {ROTULO_ORIGEM[log.source].toLowerCase()}).
      </Vazio>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      <dl className="m-0 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        <Fato rotulo="Autorização">
          {req.tokenStatus
            ? ROTULO_TOKEN[req.tokenStatus]
            : req.hasAuthorization
              ? "Com cabeçalho"
              : "Sem cabeçalho"}
        </Fato>
        {req.ip && (
          <Fato rotulo="IP" mono>
            {req.ip}
          </Fato>
        )}
        {req.origin && (
          <Fato rotulo="Origem" mono>
            {req.origin}
          </Fato>
        )}
        {req.referer && (
          <Fato rotulo="Página de origem" mono>
            {req.referer}
          </Fato>
        )}
        {req.userAgent && (
          <div className="sm:col-span-2">
            <Fato rotulo="Navegador" mono>
              <span className="text-xs">{req.userAgent}</span>
            </Fato>
          </div>
        )}
      </dl>
      <Secao titulo="Corpo enviado">
        <VisualizadorJson valor={req.body} />
      </Secao>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Secao titulo="Parâmetros de rota">
          <VisualizadorJson valor={req.params} />
        </Secao>
        <Secao titulo="Query string">
          <VisualizadorJson valor={req.query} />
        </Secao>
      </div>
      {log.context?.files !== undefined && (
        <Secao titulo="Arquivos">
          <VisualizadorJson valor={log.context.files} />
        </Secao>
      )}
      <Secao titulo="Resposta enviada ao cliente">
        <VisualizadorJson valor={log.context?.responseBody} />
      </Secao>
    </div>
  );
}

function Operacao({
  operacao,
  maior,
}: Readonly<{ operacao: OperacaoPrisma; maior: number }>) {
  return (
    <li
      className={cn(
        "flex flex-col gap-2 px-3 py-2.5",
        operacao.failed && "bg-error-light/30",
      )}
    >
      <div className="flex items-center gap-2">
        <span className="font-mono text-[13px] font-semibold text-foreground">
          {operacao.model ?? "?"}.
          <span className="text-blue-800">{operacao.action ?? "?"}</span>
        </span>
        {operacao.failed && (
          <span className="rounded bg-error-strong px-1.5 py-px text-[10px] font-semibold uppercase text-white">
            falhou
          </span>
        )}
        <span className="ml-auto flex items-center gap-2 text-xs tabular-nums text-muted">
          <span
            className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-muted-light sm:block"
            aria-hidden
          >
            <span
              className={cn(
                "block h-full rounded-full",
                operacao.failed ? "bg-error-strong" : "bg-blue-800/60",
              )}
              style={{
                width: `${Math.max(4, ((operacao.durationMs ?? 0) / maior) * 100)}%`,
              }}
            />
          </span>
          {formatarDuracao(operacao.durationMs) ?? "—"}
        </span>
      </div>
      {operacao.args !== undefined && (
        <VisualizadorJson valor={operacao.args} abertoAte={1} />
      )}
    </li>
  );
}

function AbaBanco({ log }: Readonly<{ log: LogErroDetalhe }>) {
  const prisma = log.context?.prisma;
  const operacoes = log.context?.prismaOperations ?? [];
  const maior = Math.max(1, ...operacoes.map((op) => op.durationMs ?? 0));

  if (!prisma && operacoes.length === 0) {
    return (
      <Vazio icone={Database}>
        Nenhuma consulta ao banco foi registrada nesta requisição.
      </Vazio>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {prisma && (
        <Secao titulo="Erro do Prisma">
          <div className="flex flex-col gap-3 rounded-lg border border-error/30 bg-error-light/30 p-3">
            <dl className="m-0 grid grid-cols-3 gap-3">
              <Fato rotulo="Código" mono>
                {prisma.code ?? "—"}
              </Fato>
              <Fato rotulo="Tipo">{prisma.type ?? "—"}</Fato>
              <Fato rotulo="Versão" mono>
                {prisma.clientVersion ?? "—"}
              </Fato>
            </dl>
            {prisma.meta !== undefined && (
              <VisualizadorJson valor={prisma.meta} />
            )}
          </div>
        </Secao>
      )}
      {operacoes.length > 0 && (
        <Secao
          titulo={`Consultas da requisição (${operacoes.length}, mais recentes por último)`}
        >
          <ol className="m-0 list-none divide-y divide-line overflow-hidden rounded-md border border-line p-0">
            {operacoes.map((operacao, indice) => (
              <Operacao key={indice} operacao={operacao} maior={maior} />
            ))}
          </ol>
        </Secao>
      )}
    </div>
  );
}

function AbaLinhaDoTempo({
  log,
  aoNavegar,
}: Readonly<{ log: LogErroDetalhe; aoNavegar: (id: string) => void }>) {
  if (!log.requestId) {
    return (
      <Vazio icone={ScrollText}>
        Falhas fora de requisição não têm outros eventos para correlacionar.
      </Vazio>
    );
  }
  const eventos: LogErroResumo[] = [log, ...log.related].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  const inicio = new Date(eventos[0].createdAt).getTime();

  return (
    <div className="flex flex-col gap-3">
      <p className="m-0 text-sm text-muted">
        {eventos.length === 1
          ? "Só este registro foi gravado para esta requisição."
          : `${eventos.length} registros compartilham o mesmo request ID.`}
      </p>
      <ol className="relative m-0 list-none border-l-2 border-line p-0 pl-5">
        {eventos.map((evento) => {
          const atual = evento.id === log.id;
          const tom = tomDoLog(evento);
          const delta = new Date(evento.createdAt).getTime() - inicio;
          const conteudo = (
            <>
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs tabular-nums text-muted">
                  {formatarHoraPrecisa(evento.createdAt)}
                </span>
                {delta > 0 && (
                  <span className="font-mono text-[11px] text-brand-slate">
                    +{delta} ms
                  </span>
                )}
                <SeloStatus log={evento} />
                {atual && (
                  <span className="rounded bg-blue-800 px-1.5 py-px text-[10px] font-semibold uppercase text-white">
                    este
                  </span>
                )}
              </span>
              <span className="mt-1 block text-sm font-semibold text-foreground">
                {evento.exceptionName ?? "Erro"}
                <span className="ml-1.5 font-normal text-muted">
                  · {evento.loggerContext ?? ROTULO_ORIGEM[evento.source]}
                </span>
              </span>
              <span className="block text-[13px] text-muted">
                {mensagemCurta(evento.message)}
              </span>
            </>
          );
          return (
            <li key={evento.id} className="relative pb-5 last:pb-0">
              <span
                className={cn(
                  "absolute -left-[27px] top-1.5 h-3 w-3 rounded-full ring-4 ring-card",
                  COR_TOM[tom],
                )}
                aria-hidden
              />
              {atual ? (
                <div className="rounded-md border border-blue-800/30 bg-primary-light/50 px-3 py-2">
                  {conteudo}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => aoNavegar(evento.id)}
                  className="block w-full rounded-md border border-line px-3 py-2 text-left transition-colors hover:border-blue-800/30 hover:bg-primary-light/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800/50"
                >
                  {conteudo}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function AbaJson({ log }: Readonly<{ log: LogErroDetalhe }>) {
  const { related: _related, ...registro } = log;
  const json = JSON.stringify(registro, null, 2);
  return (
    <Secao
      titulo="Registro completo"
      acao={
        <BotaoCopiar texto={json} rotulo="Copiar JSON">
          Copiar JSON
        </BotaoCopiar>
      }
    >
      <VisualizadorJson valor={registro} abertoAte={1} />
    </Secao>
  );
}

export default function PainelDetalheLog({
  id,
  anteriorId,
  proximoId,
  aoFechar,
  aoNavegar,
  aoFiltrar,
}: Readonly<PainelDetalheLogProps>) {
  const [aba, setAba] = useState<Aba>("resumo");
  const { data: log, isPending, error } = useLogErroDetalhe(id);
  const link = () =>
    typeof window === "undefined" ? "" : window.location.href;

  const quadrosProjeto = log
    ? analisarPilha(log.context?.stack).quadros.filter((q) => q.doProjeto)
        .length
    : 0;
  const abas = [
    { valor: "resumo", rotulo: "Resumo" },
    {
      valor: "pilha",
      rotulo: "Pilha",
      contador: log?.context?.stack ? quadrosProjeto : undefined,
    },
    { valor: "requisicao", rotulo: "Requisição" },
    {
      valor: "banco",
      rotulo: "Banco de dados",
      contador: log?.context?.prismaOperations?.length || undefined,
    },
    {
      valor: "linha",
      rotulo: "Linha do tempo",
      contador: log?.requestId ? log.related.length + 1 : undefined,
    },
    { valor: "json", rotulo: "JSON" },
  ];

  const botaoNavegacao = (
    alvo: string | undefined,
    rotulo: string,
    Icone: typeof ChevronUp,
  ) => (
    <button
      type="button"
      onClick={() => alvo && aoNavegar(alvo)}
      disabled={!alvo}
      aria-label={rotulo}
      title={rotulo}
      className="hidden h-9 w-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-muted-light hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800/50 disabled:opacity-30 sm:inline-flex"
    >
      <Icone className="h-5 w-5" aria-hidden />
    </button>
  );

  return (
    <PainelLateral
      aberto={!!id}
      aoMudar={(aberto) => !aberto && aoFechar()}
      largura="xl"
      topo={
        log && (
          <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
            <SeloStatus log={log} detalhado />
            <span>{ROTULO_ORIGEM[log.source]}</span>
            <span aria-hidden>·</span>
            <time dateTime={log.createdAt}>
              {formatarDataHora(log.createdAt)}
            </time>
          </div>
        )
      }
      titulo={
        log
          ? (log.exceptionName ?? "Erro")
          : isPending
            ? "Carregando registro…"
            : "Registro indisponível"
      }
      descricao={log ? mensagemCurta(log.message) : undefined}
      acoes={
        <>
          {botaoNavegacao(anteriorId, "Registro anterior da página", ChevronUp)}
          {botaoNavegacao(proximoId, "Próximo registro da página", ChevronDown)}
        </>
      }
      rodape={
        log && (
          <div className="flex flex-wrap items-center gap-1">
            <BotaoCopiar texto={link} rotulo="Copiar link deste registro">
              Copiar link
            </BotaoCopiar>
            <BotaoCopiar
              texto={() => resumoParaIssue(log, link())}
              rotulo="Copiar resumo em Markdown para issue"
            >
              Copiar para issue
            </BotaoCopiar>
            {log.requestId && (
              <BotaoCopiar texto={log.requestId} rotulo="Copiar request ID">
                Request ID
              </BotaoCopiar>
            )}
          </div>
        )
      }
    >
      {isPending && id ? (
        <div className="flex flex-col gap-4 p-6">
          <EsqueletoBloco className="h-20" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <EsqueletoBloco key={i} className="h-10" />
            ))}
          </div>
          <EsqueletoBloco className="h-24" />
        </div>
      ) : error ? (
        <div
          role="alert"
          className="m-6 flex items-start gap-3 rounded-lg border border-error/30 bg-error-light/40 p-4 text-sm text-error-strong"
        >
          <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
          {getErrorMessage(error, "Não foi possível carregar o registro.")}
        </div>
      ) : log ? (
        <Abas
          valor={aba}
          aoMudar={(valor) => setAba(valor as Aba)}
          abas={abas}
          rotulo="Seções do registro"
          listaClassName="sticky top-0 z-10 bg-card px-3 sm:px-4"
        >
          <div className="px-5 py-5 sm:px-6">
            <AbaPainel valor="resumo">
              <AbaResumo log={log} aoFiltrar={aoFiltrar} />
            </AbaPainel>
            <AbaPainel valor="pilha">
              <AbaPilha log={log} />
            </AbaPainel>
            <AbaPainel valor="requisicao">
              <AbaRequisicao log={log} />
            </AbaPainel>
            <AbaPainel valor="banco">
              <AbaBanco log={log} />
            </AbaPainel>
            <AbaPainel valor="linha">
              <AbaLinhaDoTempo log={log} aoNavegar={aoNavegar} />
            </AbaPainel>
            <AbaPainel valor="json">
              <AbaJson log={log} />
            </AbaPainel>
          </div>
        </Abas>
      ) : null}
    </PainelLateral>
  );
}
