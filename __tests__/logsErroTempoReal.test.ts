/**
 * @jest-environment node
 */
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import {
  conectarStreamLogs,
  ErroFatalStream,
  urlStreamLogs,
} from "@/features/logs-erro/lib/streamLogsErro";
import {
  atrasoAteAtualizar,
  atrasoReconexao,
  idsNovos,
  motivoPausa,
  type CondicoesTempoReal,
  type MotivoPausa,
} from "@/features/logs-erro/lib/tempoReal";

const AO_VIVO: CondicoesTempoReal = {
  periodo: "24h",
  ordenar: "createdAt",
  ordem: "desc",
  pagina: 1,
  detalheAberto: false,
  linhaSelecionada: false,
  ponteiroNaTabela: false,
  topoForaDaTela: false,
};

describe("motivoPausa", () => {
  it("não pausa na primeira página dos mais recentes, sem interação", () => {
    expect(motivoPausa(AO_VIVO)).toBeNull();
  });

  const casos: [Partial<CondicoesTempoReal>, MotivoPausa][] = [
    [{ periodo: "personalizado" }, "periodo"],
    [{ ordem: "asc" }, "ordenacao"],
    [{ ordenar: "statusCode" }, "ordenacao"],
    [{ pagina: 2 }, "pagina"],
    [{ detalheAberto: true }, "detalhe"],
    [{ linhaSelecionada: true }, "teclado"],
    [{ ponteiroNaTabela: true }, "ponteiro"],
    [{ topoForaDaTela: true }, "rolagem"],
  ];

  it.each(casos)("pausa com %o", (mudanca, motivo) => {
    expect(motivoPausa({ ...AO_VIVO, ...mudanca })).toBe(motivo);
  });
});

describe("idsNovos", () => {
  it("devolve só os que não estavam na lista, na ordem atual", () => {
    expect(idsNovos(["b", "c"], ["x", "a", "b", "c"])).toEqual(["x", "a"]);
    expect(idsNovos(["a"], ["a"])).toEqual([]);
  });
});

describe("atrasos", () => {
  it("reconecta com espera crescente até 30s", () => {
    expect([0, 1, 2, 3, 4, 5, 9].map(atrasoReconexao)).toEqual([
      1_000, 1_000, 2_000, 5_000, 15_000, 30_000, 30_000,
    ]);
  });

  it("junta a rajada e respeita o intervalo mínimo", () => {
    expect(atrasoAteAtualizar(10_000, 0, 3_000, 1_000)).toBe(1_000);
    expect(atrasoAteAtualizar(10_000, 9_500, 3_000, 1_000)).toBe(2_500);
  });
});

function respostaSse(trechos: string[], status = 200) {
  const codificador = new TextEncoder();
  const corpo = new ReadableStream<Uint8Array>({
    start(controle) {
      trechos.forEach((trecho) => controle.enqueue(codificador.encode(trecho)));
      controle.close();
    },
  });
  return new Response(corpo, {
    status,
    headers: { "Content-Type": "text/event-stream" },
  });
}

describe("conectarStreamLogs", () => {
  const fetchOriginal = global.fetch;
  afterEach(() => {
    global.fetch = fetchOriginal;
  });

  const opcoes = () => ({
    token: "tok",
    signal: new AbortController().signal,
    aoAbrir: jest.fn(),
    aoReceber: jest.fn(),
    aoSinalDeVida: jest.fn(),
  });

  it("monta a URL sem barra duplicada", () => {
    expect(urlStreamLogs("https://api.test/")).toBe(
      "https://api.test/error-logs/stream",
    );
  });

  it("envia o token e entrega eventos, mesmo partidos entre trechos", async () => {
    const fetchFalso = jest.fn(async (..._args: unknown[]) =>
      respostaSse([
        'event: ready\nid: 1\ndata: {"heartbeatMs":25000}\n\n',
        ": ping\n\n",
        'event: error-log\nid: a\ndata: {"id":"a","createdAt":"2026-11-21',
        'T12:00:00.000Z"}\n\nevent: error-log\ndata: inválido\n\n',
      ]),
    );
    global.fetch = fetchFalso as unknown as typeof fetch;
    const o = opcoes();

    await conectarStreamLogs(o);

    const [, init] = fetchFalso.mock.calls[0] as [string, RequestInit];
    expect(init.headers).toMatchObject({ Authorization: "Bearer tok" });
    expect(o.aoAbrir).toHaveBeenCalledTimes(1);
    expect(o.aoReceber).toHaveBeenCalledTimes(1);
    expect(o.aoReceber).toHaveBeenCalledWith({
      id: "a",
      createdAt: "2026-11-21T12:00:00.000Z",
    });
    expect(o.aoSinalDeVida).toHaveBeenCalledTimes(4);
  });

  it.each([401, 403, 404])("trata %i como erro fatal", async (status) => {
    global.fetch = jest.fn(async () =>
      respostaSse([], status),
    ) as unknown as typeof fetch;

    await expect(conectarStreamLogs(opcoes())).rejects.toBeInstanceOf(
      ErroFatalStream,
    );
  });

  it("trata 5xx como falha temporária", async () => {
    global.fetch = jest.fn(async () =>
      respostaSse([], 502),
    ) as unknown as typeof fetch;

    const erro = await conectarStreamLogs(opcoes()).catch((e: unknown) => e);
    expect(erro).toBeInstanceOf(Error);
    expect(erro).not.toBeInstanceOf(ErroFatalStream);
  });
});
