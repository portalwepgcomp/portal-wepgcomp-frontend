import { describe, expect, it } from "@jest/globals";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const raizSrc = join(process.cwd(), "src");

function arquivosTypeScript(diretorio: string): string[] {
  return readdirSync(diretorio, { withFileTypes: true }).flatMap((entrada) => {
    const caminho = join(diretorio, entrada.name);

    if (entrada.isDirectory()) return arquivosTypeScript(caminho);
    return /\.tsx?$/.test(entrada.name) ? [caminho] : [];
  });
}

const linhasFonte = arquivosTypeScript(raizSrc).flatMap((arquivo) =>
  readFileSync(arquivo, "utf8")
    .split(/\r?\n/)
    .map((linha, indice) => ({ arquivo, numero: indice + 1, linha })),
);

function ocorrencias(padrao: RegExp): string[] {
  return linhasFonte
    .filter(({ linha }) => {
      padrao.lastIndex = 0;
      return padrao.test(linha);
    })
    .map(({ arquivo, numero, linha }) => `${arquivo}:${numero}:${linha}`);
}

describe("Grafia da sigla WEPGCOMP", () => {
  it("não deve haver variação de caixa no nome exibido", () => {
    const erradas = linhasFonte.flatMap(({ arquivo, numero, linha }) => {
      const textoSemContextosTecnicos = linha
        .replace(/https?:\/\/\S+/gi, "")
        .replace(/\bid\s*=\s*(["']).*?\1/gi, "");
      const variacoes = textoSemContextosTecnicos.match(/wepgcomp/gi) ?? [];

      return variacoes.some((variacao) => variacao !== "WEPGCOMP")
        ? [`${arquivo}:${numero}:${linha}`]
        : [];
    });

    expect(erradas).toEqual([]);
  });

  it("deve manter a grafia correta em uso", () => {
    expect(ocorrencias(/WEPGCOMP/).length).toBeGreaterThan(0);
  });
});
