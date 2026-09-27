import { describe, expect, it } from "@jest/globals";

import {
  coordenadasValidas,
  montarUrlComoChegar,
  montarUrlMapaEmbed,
  parseCoordenada,
} from "@/components/Endereco/enderecoMapa";

describe("enderecoMapa", () => {
  it("valida pares de coordenadas finitas", () => {
    expect(coordenadasValidas(-13.0020509, -38.5098765)).toBe(true);
    expect(coordenadasValidas(null, -38.5)).toBe(false);
  });

  it("monta URLs do Google Maps a partir das coordenadas", () => {
    expect(montarUrlComoChegar(-13.0020509, -38.5098765)).toContain(
      "destination=-13.0020509%2C-38.5098765",
    );
    expect(montarUrlMapaEmbed(-13.0020509, -38.5098765)).toContain(
      "q=-13.0020509%2C-38.5098765",
    );
  });

  it("converte texto de coordenada para número", () => {
    expect(parseCoordenada("-13,0020509")).toBeCloseTo(-13.0020509);
    expect(parseCoordenada("")).toBeNull();
  });
});
