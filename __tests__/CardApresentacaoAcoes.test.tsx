import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";

import CardApresentacaoLista from "@/features/apresentacoes/components/CardApresentacaoLista";
import { Submission } from "@/models/submission";

jest.mock("@/hooks/useAlert", () => ({
  useSweetAlert: () => ({ showAlert: jest.fn() }),
}));

jest.mock("@/hooks/useApresentacaoPdf", () => ({
  useApresentacaoPdf: () => ({ baixarPdf: jest.fn(), baixandoPdf: false }),
}));

const item = {
  id: "sub-1",
  title: "Trabalho de teste",
  abstract: "Resumo",
  pdfFile: "slides.pdf",
  mainAuthor: { name: "Fulano" },
  advisor: { name: "Orientador" },
} as unknown as Submission;

function renderizar() {
  return render(
    <CardApresentacaoLista
      item={item}
      edicaoAtiva
      onEditar={() => {}}
      onExcluir={() => {}}
    />,
  );
}

describe("CardApresentacaoLista — ações", () => {
  it("deve usar o mesmo componente de botão em baixar, editar e excluir", () => {
    renderizar();

    const baixar = screen.getByRole("button", { name: /Baixar/i });
    const editar = screen.getByRole("button", { name: "Editar" });
    const excluir = screen.getByRole("button", { name: "Excluir" });

    for (const botao of [editar, excluir]) {
      expect(baixar.className).toContain("h-9");
      expect(botao.className).toContain("h-9");
    }
  });

  it("deve manter o botão de baixar acessível por nome", () => {
    renderizar();

    expect(
      screen.getByRole("button", { name: /Baixar slides\.pdf/i }),
    ).toBeInTheDocument();
  });

  it("não deve oferecer download quando não há PDF", () => {
    render(
      <CardApresentacaoLista
        item={{ ...item, pdfFile: "" } as Submission}
        edicaoAtiva
        onEditar={() => {}}
        onExcluir={() => {}}
      />,
    );

    expect(
      screen.queryByRole("button", { name: /Baixar/i }),
    ).not.toBeInTheDocument();
  });
});
