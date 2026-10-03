import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";

import Carousel from "@/components/Carousel/Carousel";

jest.mock("@/hooks/useEdicao", () => ({
  useEdicao: () => ({
    Edicao: {
      id: "edicao-1",
      name: "WEPGCOMP 2026",
      startDate: "2026-11-18T03:00:00.000Z",
      endDate: "2026-11-20T02:59:00.000Z",
      submissionDeadline: "2026-11-18T02:59:00.000Z",
    },
  }),
}));

jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ signed: false }),
}));

function linha(rotulo: RegExp) {
  return screen.getByText(rotulo).parentElement?.textContent ?? "";
}

describe("Carousel — datas da edição", () => {
  it("deve encerrar as inscrições junto com o evento", () => {
    render(<Carousel />);

    expect(linha(/Inscrições:/i)).toContain("19 de novembro de 2026");
  });

  it("deve mostrar o intervalo do evento com início e fim", () => {
    render(<Carousel />);

    expect(linha(/Data do evento:/i)).toContain("18 a 19 de novembro de 2026");
  });

  it("deve mostrar o prazo dos autores antes do evento", () => {
    render(<Carousel />);

    expect(linha(/Data limite para submissão pelos autores:/i)).toContain(
      "17 de novembro de 2026",
    );
  });

  it("deve manter as três datas distintas entre si", () => {
    render(<Carousel />);

    const inscricoes = linha(/Inscrições:/i);
    const submissao = linha(/Data limite para submissão pelos autores:/i);

    expect(inscricoes).not.toEqual(submissao);
    expect(submissao).not.toContain("19 de novembro");
  });
});
