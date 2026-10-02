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
      submissionDeadline: "2026-10-15T02:59:00.000Z",
    },
  }),
}));

jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ signed: false }),
}));

describe("Carousel — datas da edição", () => {
  it("deve usar o prazo de submissão no texto de inscrições, não a data de início", () => {
    render(<Carousel />);

    const inscricoes = screen.getByText(/Inscrições:/i).parentElement;

    expect(inscricoes?.textContent).toContain("14 de outubro de 2026");
    expect(inscricoes?.textContent).not.toContain("novembro");
  });

  it("deve manter a data do evento apontando para início e fim", () => {
    render(<Carousel />);

    const evento = screen.getByText(/Data do evento:/i).parentElement;

    expect(evento?.textContent).toContain("19 de novembro de 2026");
  });
});
