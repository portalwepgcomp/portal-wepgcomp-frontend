import { describe, expect, it } from "@jest/globals";

import { normalizarLinkMapa } from "@/components/Endereco/linkMapa";

describe("link do mapa", () => {
  it("extrai o src do HTML de incorporar", () => {
    const embed =
      "https://www.google.com/maps/embed?pb=!1m18!2d-38.5084892!3d-13.0011881";

    expect(normalizarLinkMapa(`<iframe src="${embed}"></iframe>`)?.embed).toBe(
      embed,
    );
  });

  it("recusa o link comum de compartilhar", () => {
    expect(
      normalizarLinkMapa(
        "https://www.google.com/maps/place/Instituto+de+Biologia+da+UFBA/@-13.0011881,-38.5084892,17z",
      ),
    ).toBeNull();
  });
});
