import { describe, expect, it } from "@jest/globals";
import { agruparQuadros, analisarPilha } from "@/features/logs-erro/lib/pilha";
import { montarSerieDiaria } from "@/features/logs-erro/lib/serieDiaria";
import { mensagemCurta } from "@/features/logs-erro/lib/formatacao";
import { paginasVisiveis } from "@/components/layout/Paginacao";

const PILHA = [
  "PrismaClientKnownRequestError: Unique constraint failed",
  "    at Rn.handleRequestError (/app/node_modules/@prisma/client/runtime/library.js:121:7315)",
  "    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)",
  "    at async UserService.create (/app/src/user/user.service.ts:118:52)",
  "    at UserController.create (/app/dist/user/user.controller.js:48:12)",
  "    at /app/node_modules/@nestjs/core/router/router-proxy.js:9:17",
].join("\n");

describe("analisarPilha", () => {
  it("separa cabeçalho e marca os quadros do projeto", () => {
    const { cabecalho, quadros } = analisarPilha(PILHA);

    expect(cabecalho).toBe(
      "PrismaClientKnownRequestError: Unique constraint failed",
    );
    expect(quadros).toHaveLength(5);
    expect(quadros.filter((q) => q.doProjeto).map((q) => q.funcao)).toEqual([
      "UserService.create",
      "UserController.create",
    ]);
    expect(quadros[2]).toMatchObject({
      arquivo: "src/user/user.service.ts",
      linha: 118,
      coluna: 52,
    });
  });

  it("entende quadros sem nome de função", () => {
    const { quadros } = analisarPilha(PILHA);
    expect(quadros[4].funcao).toBeUndefined();
    expect(quadros[4]).toMatchObject({ linha: 9, doProjeto: false });
  });

  it("agrupa quadros de bibliotecas consecutivos", () => {
    const grupos = agruparQuadros(analisarPilha(PILHA).quadros);
    expect(
      grupos.map((g) => (g.doProjeto ? "projeto" : g.quadros.length)),
    ).toEqual([2, "projeto", "projeto", 1]);
  });

  it("pilha ausente vira estrutura vazia", () => {
    expect(analisarPilha(undefined)).toEqual({ cabecalho: "", quadros: [] });
  });
});

describe("montarSerieDiaria", () => {
  it("preenche com zero os dias sem ocorrência, em ordem crescente", () => {
    const serie = montarSerieDiaria(
      [
        { key: "2026-11-20", count: 4, lastOccurrence: null },
        { key: "2026-11-18", count: 2, lastOccurrence: null },
      ],
      {
        inicio: new Date("2026-11-17T15:00:00Z"),
        fim: new Date("2026-11-20T15:00:00Z"),
      },
    );
    expect(serie).toEqual([
      { dia: "2026-11-17", total: 0 },
      { dia: "2026-11-18", total: 2 },
      { dia: "2026-11-19", total: 0 },
      { dia: "2026-11-20", total: 4 },
    ]);
  });
});

describe("mensagemCurta", () => {
  it("pula o preâmbulo do Prisma e mantém a primeira linha nos demais casos", () => {
    expect(
      mensagemCurta(
        "\nInvalid `prisma.user.create()` invocation:\n\nUnique constraint failed on the fields: (`email`)",
      ),
    ).toBe("Unique constraint failed on the fields: (`email`)");
    expect(
      mensagemCurta("Can't reach database server\n\nPlease make sure..."),
    ).toBe("Can't reach database server");
  });
});

describe("paginasVisiveis", () => {
  it("mostra todas quando são poucas", () => {
    expect(paginasVisiveis(2, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("usa reticências em volta da página atual", () => {
    expect(paginasVisiveis(10, 22)).toEqual([1, "…", 9, 10, 11, "…", 22]);
    expect(paginasVisiveis(1, 22)).toEqual([1, 2, "…", 22]);
  });
});
