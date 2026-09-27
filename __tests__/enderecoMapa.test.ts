import { describe, expect, it } from "@jest/globals";

import {
  coordenadasValidas,
  montarUrlComoChegar,
} from "@/components/Endereco/enderecoMapa";

describe("enderecoMapa", () => {
  it("valida pares de coordenadas finitas", () => {
    expect(coordenadasValidas(-13.0020509, -38.5098765)).toBe(true);
    expect(coordenadasValidas(null, -38.5)).toBe(false);
    expect(coordenadasValidas(Number.NaN, -38.5)).toBe(false);
  });

  it("monta URL de rota com destino em coordenadas", () => {
    expect(montarUrlComoChegar(-13.0020509, -38.5098765)).toContain(
      "destination=-13.0020509%2C-38.5098765",
    );
  });
});
