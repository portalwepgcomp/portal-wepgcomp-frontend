export type OrigemLog = "http" | "logger" | "cron" | "process";
export type NivelLog = "error" | "warn";
export type ClasseStatus = "4xx" | "5xx";
export type MetodoHttp = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type CampoOrdenacao =
  "createdAt" | "statusCode" | "userEmail" | "exceptionName" | "route";
export type CampoAgrupamento =
  | "statusCode"
  | "exceptionName"
  | "route"
  | "userEmail"
  | "source"
  | "prismaCode"
  | "loggerContext"
  | "day";

/** Item da listagem — mesmo `select` da API, sem o `context`. */
export interface LogErroResumo {
  id: string;
  createdAt: string;
  source: OrigemLog;
  level: NivelLog;
  requestId: string | null;
  statusCode: number | null;
  method: string | null;
  path: string | null;
  route: string | null;
  isAuthenticated: boolean;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  userLevel: string | null;
  userProfile: string | null;
  exceptionName: string | null;
  message: string;
  loggerContext: string | null;
  prismaCode: string | null;
  file: string | null;
  line: number | null;
  column: number | null;
  functionName: string | null;
}

export interface OperacaoPrisma {
  model?: string;
  action?: string;
  args?: unknown;
  durationMs?: number;
  failed?: boolean;
}

export interface ContextoLogErro {
  stack?: string;
  cause?: unknown;
  responseBody?: unknown;
  request?: {
    query?: unknown;
    params?: unknown;
    body?: unknown;
    ip?: string;
    userAgent?: string;
    referer?: string;
    origin?: string;
    hasAuthorization?: boolean;
    tokenStatus?: "missing" | "valid" | "invalid" | "expired";
  };
  handler?: { controller?: string; method?: string };
  files?: unknown;
  prisma?: {
    type?: string;
    code?: string;
    meta?: unknown;
    clientVersion?: string;
  };
  prismaOperations?: OperacaoPrisma[];
  durationMs?: number;
  extra?: unknown;
  runtime?: Record<string, unknown>;
  [chave: string]: unknown;
}

export interface LogErroDetalhe extends LogErroResumo {
  context: ContextoLogErro;
  related: LogErroResumo[];
}

export interface ItemResumo {
  key: string | number | null;
  count: number;
  lastOccurrence: string | null;
}

export type PeriodoRapido = "1h" | "24h" | "7d" | "30d";
export type Periodo = PeriodoRapido | "personalizado";

/** Estado da tela, espelhado 1:1 na query string. */
export interface FiltrosLogsErro {
  busca: string;
  periodo: Periodo;
  de?: string;
  ate?: string;
  ordenar: CampoOrdenacao;
  ordem: "asc" | "desc";
  pagina: number;
  porPagina: number;
  agrupar: CampoAgrupamento;
  log?: string;

  status: number[];
  classe: ClasseStatus[];
  origem: OrigemLog[];
  nivel: NivelLog[];
  excecao: string[];
  prisma: string[];
  metodo: MetodoHttp[];
  contexto: string[];
  rota?: string;
  caminho?: string;
  arquivo?: string;
  mensagem?: string;

  usuario?: string;
  nomeUsuario?: string;
  idUsuario?: string;
  nivelUsuario: string[];
  perfil: string[];
  autenticado?: boolean;
  requisicao?: string;
}

/** Parâmetros aceitos por `GET /error-logs` e `/error-logs/summary`. */
export interface ParametrosApiLogs {
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
  sortBy?: CampoOrdenacao;
  sortOrder?: "asc" | "desc";
  userEmail?: string;
  userName?: string;
  userId?: string;
  userLevel?: string;
  userProfile?: string;
  isAuthenticated?: boolean;
  source?: string;
  level?: string;
  statusCode?: string;
  statusClass?: string;
  exceptionName?: string;
  prismaCode?: string;
  message?: string;
  method?: string;
  path?: string;
  route?: string;
  loggerContext?: string;
  file?: string;
  requestId?: string;
  groupBy?: CampoAgrupamento;
}
