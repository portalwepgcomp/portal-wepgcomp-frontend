import { describe, expect, it } from "@jest/globals";
import { execFileSync } from "child_process";
import { join } from "path";

const raizSrc = join(process.cwd(), "src");

function ocorrencias(padrao: string): string[] {
  try {
    const saida = execFileSync(
      "grep",
      ["-rn", "--include=*.ts", "--include=*.tsx", padrao, raizSrc],
      { encoding: "utf8" },
    );
    return saida.trim().split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

describe("Grafia da sigla WEPGCOMP", () => {
  it("não deve haver variação de caixa no nome exibido", () => {
    const erradas = ocorrencias("WePGCOMP\\|WEpgcomp\\|Wepgcomp");

    expect(erradas).toEqual([]);
  });

  it("deve manter a grafia correta em uso", () => {
    expect(ocorrencias("WEPGCOMP").length).toBeGreaterThan(0);
  });
});
