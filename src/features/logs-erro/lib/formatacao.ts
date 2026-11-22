import type { LogErroResumo, NivelLog, OrigemLog } from "../tipos";

const FUSO = "America/Sao_Paulo";

export const ROTULO_ORIGEM: Record<OrigemLog, string> = {
  http: "Requisição",
  logger: "Logger",
  cron: "Tarefa agendada",
  process: "Processo",
};

export const ROTULO_NIVEL: Record<NivelLog, string> = {
  error: "Erro",
  warn: "Alerta",
};

export const ROTULO_NIVEL_USUARIO: Record<string, string> = {
  Superadmin: "Superadmin",
  Admin: "Administrador",
  Default: "Padrão",
};

export const ROTULO_PERFIL: Record<string, string> = {
  Presenter: "Apresentador",
  Professor: "Professor",
  Listener: "Ouvinte",
};

export const ROTULO_TOKEN: Record<string, string> = {
  missing: "Sem token",
  valid: "Token válido",
  invalid: "Token inválido",
  expired: "Token expirado",
};

const DESCRICAO_STATUS: Record<number, string> = {
  400: "Requisição inválida",
  401: "Não autenticado",
  403: "Acesso negado",
  404: "Não encontrado",
  409: "Conflito",
  413: "Conteúdo grande demais",
  422: "Não processável",
  429: "Muitas requisições",
  500: "Erro interno",
  502: "Gateway inválido",
  503: "Indisponível",
  504: "Tempo esgotado",
};

export function descricaoStatus(status: number | null | undefined): string {
  if (!status) return "Sem status HTTP";
  return (
    DESCRICAO_STATUS[status] ??
    (status >= 500 ? "Falha do servidor" : "Erro do cliente")
  );
}

export type Tom = "erro" | "alerta" | "neutro";

/** 5xx e erros fora de requisição pesam mais que 4xx. */
export function tomDoLog(
  log: Pick<LogErroResumo, "statusCode" | "level">,
): Tom {
  if (log.statusCode) return log.statusCode >= 500 ? "erro" : "alerta";
  return log.level === "error" ? "erro" : "alerta";
}

const formatoDataHora = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

const formatoHora = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

const formatoDiaCurto = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO,
  day: "2-digit",
  month: "2-digit",
});

const formatoDiaLongo = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO,
  weekday: "long",
  day: "2-digit",
  month: "long",
});

const formatoDataCurta = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO,
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatarDataHora(iso: string): string {
  return formatoDataHora.format(new Date(iso)).replace(",", "");
}

/** "18/11 17:12" — aceita ISO ou o valor de um `datetime-local`. */
export function formatarDataCurta(valor: string): string {
  const data = new Date(valor);
  return Number.isNaN(data.getTime())
    ? valor
    : formatoDataCurta.format(data).replace(",", "");
}

/** Hora com milissegundos — útil para ordenar eventos da mesma requisição. */
export function formatarHoraPrecisa(iso: string): string {
  const data = new Date(iso);
  const ms = String(data.getMilliseconds()).padStart(3, "0");
  return `${formatoHora.format(data)}.${ms}`;
}

export function formatarDiaCurto(dia: string): string {
  return formatoDiaCurto.format(new Date(`${dia}T12:00:00Z`));
}

export function formatarDiaLongo(dia: string): string {
  return formatoDiaLongo.format(new Date(`${dia}T12:00:00Z`));
}

const formatoRelativo = new Intl.RelativeTimeFormat("pt-BR", {
  numeric: "auto",
});

export function formatarRelativo(
  iso: string,
  agora: Date = new Date(),
): string {
  const segundos = Math.round(
    (new Date(iso).getTime() - agora.getTime()) / 1000,
  );
  const abs = Math.abs(segundos);
  if (abs < 45) return "agora";
  if (abs < 3600)
    return formatoRelativo.format(Math.round(segundos / 60), "minute");
  if (abs < 86400)
    return formatoRelativo.format(Math.round(segundos / 3600), "hour");
  if (abs < 86400 * 30)
    return formatoRelativo.format(Math.round(segundos / 86400), "day");
  return formatarDataHora(iso);
}

export function formatarDuracao(ms: number | undefined): string | undefined {
  if (ms === undefined || ms === null || Number.isNaN(ms)) return undefined;
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} s`;
}

export function formatarNumero(valor: number): string {
  return valor.toLocaleString("pt-BR");
}

/** "src/user/user.service.ts:118" — o que o dev procura primeiro. */
export function formatarLocal(
  log: Pick<LogErroResumo, "file" | "line">,
): string | undefined {
  if (!log.file) return undefined;
  return log.line ? `${log.file}:${log.line}` : log.file;
}

/**
 * Uma linha que resume a mensagem. No Prisma, "Invalid `x()` invocation" é só
 * preâmbulo: a causa real fica na última linha.
 */
export function mensagemCurta(mensagem: string): string {
  const linhas = mensagem
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean);
  if (linhas.length === 0) return mensagem;
  return linhas[0].startsWith("Invalid `")
    ? linhas[linhas.length - 1]
    : linhas[0];
}
