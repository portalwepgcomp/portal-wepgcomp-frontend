import type {
  CampoAgrupamento,
  CampoOrdenacao,
  ClasseStatus,
  FiltrosLogsErro,
  MetodoHttp,
  NivelLog,
  OrigemLog,
  ParametrosApiLogs,
  Periodo,
  PeriodoRapido,
} from "../tipos";

export const PERIODOS_RAPIDOS: Record<PeriodoRapido, number> = {
  "1h": 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

export const OPCOES_POR_PAGINA = [25, 50, 100] as const;

const ORIGENS: OrigemLog[] = ["http", "logger", "cron", "process"];
const NIVEIS: NivelLog[] = ["error", "warn"];
const CLASSES: ClasseStatus[] = ["4xx", "5xx"];
const METODOS: MetodoHttp[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const ORDENACOES: CampoOrdenacao[] = [
  "createdAt",
  "statusCode",
  "userEmail",
  "exceptionName",
  "route",
];

/** Nome curto na URL ↔ campo de agrupamento da API. */
export const AGRUPAMENTOS_URL: Record<string, CampoAgrupamento> = {
  rota: "route",
  excecao: "exceptionName",
  status: "statusCode",
  usuario: "userEmail",
  origem: "source",
  prisma: "prismaCode",
  contexto: "loggerContext",
};

export const FILTROS_PADRAO: FiltrosLogsErro = {
  busca: "",
  periodo: "7d",
  ordenar: "createdAt",
  ordem: "desc",
  pagina: 1,
  porPagina: 25,
  agrupar: "route",
  status: [],
  classe: [],
  origem: [],
  nivel: [],
  excecao: [],
  prisma: [],
  metodo: [],
  contexto: [],
  nivelUsuario: [],
  perfil: [],
};

const lista = (valor: string | null): string[] =>
  valor
    ? valor
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const listaPermitida = <T extends string>(
  valor: string | null,
  permitidos: readonly T[],
): T[] =>
  lista(valor).filter((item): item is T =>
    (permitidos as readonly string[]).includes(item),
  );

const texto = (valor: string | null) => valor?.trim() || undefined;

const inteiro = (valor: string | null, padrao: number, min = 1) => {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero >= min ? numero : padrao;
};

function agrupamentoDaUrl(valor: string | null): CampoAgrupamento {
  return (valor && AGRUPAMENTOS_URL[valor]) || FILTROS_PADRAO.agrupar;
}

function agrupamentoParaUrl(campo: CampoAgrupamento): string {
  return (
    Object.entries(AGRUPAMENTOS_URL).find(
      ([, valor]) => valor === campo,
    )?.[0] ?? "rota"
  );
}

export function lerFiltrosDaUrl(params: URLSearchParams): FiltrosLogsErro {
  const periodoUrl = params.get("periodo");
  const periodo: Periodo =
    periodoUrl === "personalizado" ||
    (periodoUrl && periodoUrl in PERIODOS_RAPIDOS)
      ? (periodoUrl as Periodo)
      : FILTROS_PADRAO.periodo;
  const ordenar = params.get("ordenar") as CampoOrdenacao | null;
  const porPagina = inteiro(params.get("porPagina"), FILTROS_PADRAO.porPagina);
  const autenticado = params.get("autenticado");

  return {
    busca: params.get("busca") ?? "",
    periodo,
    de: periodo === "personalizado" ? texto(params.get("de")) : undefined,
    ate: periodo === "personalizado" ? texto(params.get("ate")) : undefined,
    ordenar: ordenar && ORDENACOES.includes(ordenar) ? ordenar : "createdAt",
    ordem: params.get("ordem") === "asc" ? "asc" : "desc",
    pagina: inteiro(params.get("pagina"), 1),
    porPagina: (OPCOES_POR_PAGINA as readonly number[]).includes(porPagina)
      ? porPagina
      : FILTROS_PADRAO.porPagina,
    agrupar: agrupamentoDaUrl(params.get("agrupar")),
    log: texto(params.get("log")),

    status: lista(params.get("status"))
      .map(Number)
      .filter(
        (codigo) => Number.isInteger(codigo) && codigo >= 100 && codigo <= 599,
      ),
    classe: listaPermitida(params.get("classe"), CLASSES),
    origem: listaPermitida(params.get("origem"), ORIGENS),
    nivel: listaPermitida(params.get("nivel"), NIVEIS),
    excecao: lista(params.get("excecao")),
    prisma: lista(params.get("prisma")),
    metodo: listaPermitida(params.get("metodo"), METODOS),
    contexto: lista(params.get("contexto")),
    rota: texto(params.get("rota")),
    caminho: texto(params.get("caminho")),
    arquivo: texto(params.get("arquivo")),
    mensagem: texto(params.get("mensagem")),

    usuario: texto(params.get("usuario")),
    nomeUsuario: texto(params.get("nomeUsuario")),
    idUsuario: texto(params.get("idUsuario")),
    nivelUsuario: lista(params.get("nivelUsuario")),
    perfil: lista(params.get("perfil")),
    autenticado:
      autenticado === "sim" ? true : autenticado === "nao" ? false : undefined,
    requisicao: texto(params.get("requisicao")),
  };
}

/** Query string mínima: valores padrão não aparecem na URL. */
export function filtrosParaUrl(filtros: FiltrosLogsErro): string {
  const params = new URLSearchParams();
  const definir = (chave: string, valor: string | number | undefined) => {
    if (valor !== undefined && valor !== "") params.set(chave, String(valor));
  };
  const definirLista = (chave: string, valores: (string | number)[]) => {
    if (valores.length) params.set(chave, valores.join(","));
  };

  definir("busca", filtros.busca.trim());
  if (filtros.periodo !== FILTROS_PADRAO.periodo)
    definir("periodo", filtros.periodo);
  if (filtros.periodo === "personalizado") {
    definir("de", filtros.de);
    definir("ate", filtros.ate);
  }
  if (filtros.ordenar !== "createdAt") definir("ordenar", filtros.ordenar);
  if (filtros.ordem !== "desc") definir("ordem", filtros.ordem);
  if (filtros.pagina > 1) definir("pagina", filtros.pagina);
  if (filtros.porPagina !== FILTROS_PADRAO.porPagina)
    definir("porPagina", filtros.porPagina);
  if (filtros.agrupar !== FILTROS_PADRAO.agrupar) {
    definir("agrupar", agrupamentoParaUrl(filtros.agrupar));
  }

  definirLista("status", filtros.status);
  definirLista("classe", filtros.classe);
  definirLista("origem", filtros.origem);
  definirLista("nivel", filtros.nivel);
  definirLista("excecao", filtros.excecao);
  definirLista("prisma", filtros.prisma);
  definirLista("metodo", filtros.metodo);
  definirLista("contexto", filtros.contexto);
  definir("rota", filtros.rota);
  definir("caminho", filtros.caminho);
  definir("arquivo", filtros.arquivo);
  definir("mensagem", filtros.mensagem);

  definir("usuario", filtros.usuario);
  definir("nomeUsuario", filtros.nomeUsuario);
  definir("idUsuario", filtros.idUsuario);
  definirLista("nivelUsuario", filtros.nivelUsuario);
  definirLista("perfil", filtros.perfil);
  if (filtros.autenticado !== undefined) {
    definir("autenticado", filtros.autenticado ? "sim" : "nao");
  }
  definir("requisicao", filtros.requisicao);
  definir("log", filtros.log);

  return params.toString();
}

export interface Intervalo {
  inicio: Date;
  fim: Date;
}

export function intervaloDoPeriodo(
  filtros: Pick<FiltrosLogsErro, "periodo" | "de" | "ate">,
  agora: Date,
): Intervalo {
  if (filtros.periodo === "personalizado") {
    const inicio = filtros.de ? new Date(filtros.de) : undefined;
    const fim = filtros.ate ? new Date(filtros.ate) : agora;
    const valido = (data?: Date) => data && !Number.isNaN(data.getTime());
    if (valido(inicio) && valido(fim)) return { inicio: inicio!, fim: fim! };
    return {
      inicio: new Date(agora.getTime() - PERIODOS_RAPIDOS["7d"]),
      fim: agora,
    };
  }
  return {
    inicio: new Date(agora.getTime() - PERIODOS_RAPIDOS[filtros.periodo]),
    fim: agora,
  };
}

/** Janela de mesmo tamanho imediatamente antes — base da comparação dos indicadores. */
export function intervaloAnterior({ inicio, fim }: Intervalo): Intervalo {
  const duracao = fim.getTime() - inicio.getTime();
  return {
    inicio: new Date(inicio.getTime() - duracao),
    fim: new Date(inicio.getTime()),
  };
}

const juntar = (valores: (string | number)[]) =>
  valores.length ? valores.join(",") : undefined;

/**
 * Converte o estado da tela nos parâmetros da API. Listas vão separadas por
 * vírgula: o axios serializaria arrays como `chave[]=`, que a API não lê.
 */
export function filtrosParaApi(
  filtros: FiltrosLogsErro,
  intervalo: Intervalo,
): ParametrosApiLogs {
  const params: ParametrosApiLogs = {
    search: filtros.busca.trim() || undefined,
    from: intervalo.inicio.toISOString(),
    to: intervalo.fim.toISOString(),
    page: filtros.pagina,
    pageSize: filtros.porPagina,
    sortBy: filtros.ordenar,
    sortOrder: filtros.ordem,
    userEmail: filtros.usuario,
    userName: filtros.nomeUsuario,
    userId: filtros.idUsuario,
    userLevel: juntar(filtros.nivelUsuario),
    userProfile: juntar(filtros.perfil),
    isAuthenticated: filtros.autenticado,
    source: juntar(filtros.origem),
    level: juntar(filtros.nivel),
    statusCode: juntar(filtros.status),
    statusClass: juntar(filtros.classe),
    exceptionName: juntar(filtros.excecao),
    prismaCode: juntar(filtros.prisma),
    message: filtros.mensagem,
    method: juntar(filtros.metodo),
    path: filtros.caminho,
    route: filtros.rota,
    loggerContext: juntar(filtros.contexto),
    file: filtros.arquivo,
    requestId: filtros.requisicao,
  };

  return Object.fromEntries(
    Object.entries(params).filter(([, valor]) => valor !== undefined),
  ) as ParametrosApiLogs;
}

/** Filtros que recortam os dados (fora período, busca, ordenação e paginação). */
export type ChaveFiltro =
  | "status"
  | "classe"
  | "origem"
  | "nivel"
  | "excecao"
  | "prisma"
  | "metodo"
  | "contexto"
  | "rota"
  | "caminho"
  | "arquivo"
  | "mensagem"
  | "usuario"
  | "nomeUsuario"
  | "idUsuario"
  | "nivelUsuario"
  | "perfil"
  | "autenticado"
  | "requisicao";

export const CHAVES_FILTRO: ChaveFiltro[] = [
  "status",
  "classe",
  "origem",
  "nivel",
  "excecao",
  "prisma",
  "metodo",
  "contexto",
  "rota",
  "caminho",
  "arquivo",
  "mensagem",
  "usuario",
  "nomeUsuario",
  "idUsuario",
  "nivelUsuario",
  "perfil",
  "autenticado",
  "requisicao",
];

export function filtroAtivo(
  filtros: FiltrosLogsErro,
  chave: ChaveFiltro,
): boolean {
  const valor = filtros[chave];
  return Array.isArray(valor)
    ? valor.length > 0
    : valor !== undefined && valor !== "";
}

export function contarFiltrosAtivos(filtros: FiltrosLogsErro): number {
  return CHAVES_FILTRO.filter((chave) => filtroAtivo(filtros, chave)).length;
}

export function limparFiltros(filtros: FiltrosLogsErro): FiltrosLogsErro {
  return {
    ...FILTROS_PADRAO,
    periodo: filtros.periodo,
    de: filtros.de,
    ate: filtros.ate,
    porPagina: filtros.porPagina,
    agrupar: filtros.agrupar,
  };
}

/** Liga/desliga um valor de um filtro de lista. */
export function alternarValor<T>(valores: T[], valor: T): T[] {
  return valores.includes(valor)
    ? valores.filter((item) => item !== valor)
    : [...valores, valor];
}

type ChaveResumo = string | number | null;

/** Se o valor de um agrupamento já está aplicado como filtro. */
export function facetaAtiva(
  filtros: FiltrosLogsErro,
  campo: CampoAgrupamento,
  chave: ChaveResumo,
): boolean {
  if (chave === null) return false;
  switch (campo) {
    case "route":
      return filtros.rota === chave;
    case "userEmail":
      return filtros.usuario === chave;
    case "statusCode":
      return filtros.status.includes(Number(chave));
    case "exceptionName":
      return filtros.excecao.includes(String(chave));
    case "source":
      return filtros.origem.includes(chave as OrigemLog);
    case "prismaCode":
      return filtros.prisma.includes(String(chave));
    case "loggerContext":
      return filtros.contexto.includes(String(chave));
    default:
      return false;
  }
}

/** Mudança nos filtros ao clicar num valor de agrupamento (liga ou desliga). */
export function alternarFaceta(
  filtros: FiltrosLogsErro,
  campo: CampoAgrupamento,
  chave: ChaveResumo,
): Partial<FiltrosLogsErro> {
  if (chave === null) return {};
  const ativa = facetaAtiva(filtros, campo, chave);
  switch (campo) {
    case "route":
      return { rota: ativa ? undefined : String(chave) };
    case "userEmail":
      return { usuario: ativa ? undefined : String(chave) };
    case "statusCode":
      return { status: alternarValor(filtros.status, Number(chave)) };
    case "exceptionName":
      return { excecao: alternarValor(filtros.excecao, String(chave)) };
    case "source":
      return { origem: alternarValor(filtros.origem, chave as OrigemLog) };
    case "prismaCode":
      return { prisma: alternarValor(filtros.prisma, String(chave)) };
    case "loggerContext":
      return { contexto: alternarValor(filtros.contexto, String(chave)) };
    default:
      return {};
  }
}
