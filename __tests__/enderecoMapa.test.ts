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

  it("preserva a longitude negativa na URL do mapa", () => {
    const embed = decodeURIComponent(
      montarUrlMapaEmbed(-13.00094244, -38.50844628),
    );
    const rota = decodeURIComponent(
      montarUrlComoChegar(-13.00094244, -38.50844628),
    );

    expect(embed).toContain("q=-13.00094244, -38.50844628");
    expect(embed).not.toContain(",38.50844628");
    expect(rota).toContain("destination=-13.00094244, -38.50844628");
  });

  it("converte texto de coordenada para número", () => {
    expect(parseCoordenada("-13,0020509")).toBeCloseTo(-13.0020509);
    expect(parseCoordenada("")).toBeNull();
  });
});
