import { describe, expect, it } from "@jest/globals";
import {
  alternarFaceta,
  contarFiltrosAtivos,
  facetaAtiva,
  FILTROS_PADRAO,
  filtrosParaApi,
  filtrosParaUrl,
  intervaloAnterior,
  intervaloDoPeriodo,
  lerFiltrosDaUrl,
  limparFiltros,
} from "@/features/logs-erro/lib/filtrosUrl";
import type { FiltrosLogsErro } from "@/features/logs-erro/tipos";

const ler = (qs: string) => lerFiltrosDaUrl(new URLSearchParams(qs));
const AGORA = new Date("2026-11-21T15:00:00.000Z");

describe("lerFiltrosDaUrl / filtrosParaUrl", () => {
  it("URL vazia resulta nos filtros padrão e volta vazia", () => {
    expect(ler("")).toEqual(FILTROS_PADRAO);
    expect(filtrosParaUrl(FILTROS_PADRAO)).toBe("");
  });

  it("faz ida e volta de um recorte completo", () => {
    const qs =
      "busca=prisma&periodo=30d&ordenar=statusCode&ordem=asc&pagina=3&porPagina=50&agrupar=usuario" +
      "&status=500%2C502&classe=5xx&origem=http%2Ccron&nivel=error&excecao=TypeError&prisma=P2002" +
      "&metodo=POST&contexto=MailingService&rota=%2Fsubmission&usuario=ana%40ufba.br&perfil=Presenter" +
      "&autenticado=sim&requisicao=abc&log=123";
    const filtros = ler(qs);

    expect(filtros).toMatchObject({
      busca: "prisma",
      periodo: "30d",
      ordenar: "statusCode",
      ordem: "asc",
      pagina: 3,
      porPagina: 50,
      agrupar: "userEmail",
      status: [500, 502],
      classe: ["5xx"],
      origem: ["http", "cron"],
      metodo: ["POST"],
      rota: "/submission",
      usuario: "ana@ufba.br",
      autenticado: true,
      log: "123",
    });
    expect(ler(filtrosParaUrl(filtros))).toEqual(filtros);
  });

  it("descarta valores fora da lista permitida", () => {
    const filtros = ler(
      "origem=http,hacker&status=99,500,abc&porPagina=7&ordenar=senha&periodo=1ano",
    );
    expect(filtros.origem).toEqual(["http"]);
    expect(filtros.status).toEqual([500]);
    expect(filtros.porPagina).toBe(25);
    expect(filtros.ordenar).toBe("createdAt");
    expect(filtros.periodo).toBe("7d");
  });

  it("só lê de/ate quando o período é personalizado", () => {
    expect(ler("de=2026-11-01T00:00").de).toBeUndefined();
    expect(ler("periodo=personalizado&de=2026-11-01T00:00").de).toBe(
      "2026-11-01T00:00",
    );
  });

  it("autenticado=nao vira false", () => {
    expect(ler("autenticado=nao").autenticado).toBe(false);
  });
});

describe("intervalos", () => {
  it("período relativo termina agora", () => {
    const { inicio, fim } = intervaloDoPeriodo({ periodo: "24h" }, AGORA);
    expect(fim).toEqual(AGORA);
    expect(AGORA.getTime() - inicio.getTime()).toBe(24 * 60 * 60 * 1000);
  });

  it("período anterior tem a mesma duração e termina no início do atual", () => {
    const atual = intervaloDoPeriodo({ periodo: "7d" }, AGORA);
    const anterior = intervaloAnterior(atual);
    expect(anterior.fim).toEqual(atual.inicio);
    expect(atual.inicio.getTime() - anterior.inicio.getTime()).toBe(
      atual.fim.getTime() - atual.inicio.getTime(),
    );
  });

  it("personalizado inválido cai para 7 dias", () => {
    const { inicio } = intervaloDoPeriodo(
      { periodo: "personalizado", de: "lixo" },
      AGORA,
    );
    expect(AGORA.getTime() - inicio.getTime()).toBe(7 * 24 * 60 * 60 * 1000);
  });
});

describe("filtrosParaApi", () => {
  it("junta listas com vírgula e omite o que está vazio", () => {
    const filtros: FiltrosLogsErro = {
      ...FILTROS_PADRAO,
      status: [500, 502],
      origem: ["http"],
      autenticado: false,
      usuario: "ana@ufba.br",
    };
    const params = filtrosParaApi(filtros, intervaloDoPeriodo(filtros, AGORA));

    expect(params).toMatchObject({
      statusCode: "500,502",
      source: "http",
      isAuthenticated: false,
      userEmail: "ana@ufba.br",
      page: 1,
      pageSize: 25,
      sortBy: "createdAt",
      sortOrder: "desc",
      to: AGORA.toISOString(),
    });
    expect(params).not.toHaveProperty("level");
    expect(params).not.toHaveProperty("search");
  });
});

describe("facetas e contagem", () => {
  it("liga e desliga o filtro de um valor agrupado", () => {
    const ligado = {
      ...FILTROS_PADRAO,
      ...alternarFaceta(FILTROS_PADRAO, "statusCode", 500),
    };
    expect(ligado.status).toEqual([500]);
    expect(facetaAtiva(ligado, "statusCode", 500)).toBe(true);

    const desligado = {
      ...ligado,
      ...alternarFaceta(ligado, "statusCode", 500),
    };
    expect(desligado.status).toEqual([]);
  });

  it("rota e usuário são valores únicos", () => {
    const comRota = {
      ...FILTROS_PADRAO,
      ...alternarFaceta(FILTROS_PADRAO, "route", "/x"),
    };
    expect(comRota.rota).toBe("/x");
    expect(alternarFaceta(comRota, "route", "/x")).toEqual({ rota: undefined });
  });

  it("valor nulo não vira filtro", () => {
    expect(alternarFaceta(FILTROS_PADRAO, "route", null)).toEqual({});
    expect(facetaAtiva(FILTROS_PADRAO, "route", null)).toBe(false);
  });

  it("conta filtros e limpa preservando período e agrupamento", () => {
    const filtros: FiltrosLogsErro = {
      ...FILTROS_PADRAO,
      periodo: "30d",
      agrupar: "source",
      status: [500],
      usuario: "x",
      pagina: 4,
    };
    expect(contarFiltrosAtivos(filtros)).toBe(2);

    const limpo = limparFiltros(filtros);
    expect(contarFiltrosAtivos(limpo)).toBe(0);
    expect(limpo).toMatchObject({
      periodo: "30d",
      agrupar: "source",
      pagina: 1,
    });
  });
});
