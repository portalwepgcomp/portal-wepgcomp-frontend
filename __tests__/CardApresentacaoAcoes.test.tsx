import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";

import CardApresentacaoLista from "@/features/apresentacoes/components/CardApresentacaoLista";
import type { ApresentacaoLista } from "@/features/apresentacoes/types";

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
} as unknown as ApresentacaoLista;

function renderizar(dados: Partial<ApresentacaoLista> = {}) {
  return render(
    <CardApresentacaoLista
      item={{ ...item, ...dados } as ApresentacaoLista}
      edicaoAtiva
      onEditar={() => {}}
      onExcluir={() => {}}
    />,
  );
}

describe("CardApresentacaoLista — ações", () => {
  it("deve dar ao botão de download o mesmo tamanho de editar e excluir", () => {
    renderizar();

    const baixar = screen.getByRole("button", { name: /Download de/i });
    const editar = screen.getByRole("button", { name: "Editar" });
    const excluir = screen.getByRole("button", { name: "Excluir" });

    for (const botao of [baixar, editar, excluir]) {
      expect(botao.className).toContain("h-9");
    }
  });

  it("deve nomear o arquivo no rótulo acessível do download", () => {
    renderizar();

    expect(
      screen.getByRole("button", { name: /Download de slides\.pdf/i }),
    ).toBeInTheDocument();
  });

  it("deve manter uma dica visível em cada ação", () => {
    renderizar();

    for (const dica of ["Download", "Editar", "Excluir"]) {
      expect(screen.getByText(dica)).toBeInTheDocument();
    }
  });

  it("deve dar ao link externo o mesmo tamanho dos demais", () => {
    renderizar({ linkHostedFile: "https://exemplo.com/slides" });

    const link = screen.getByRole("link", {
      name: "Abrir link da apresentação",
    });
    const baixar = screen.getByRole("button", { name: /Download de/i });

    expect(link.className).toContain("h-9");
    expect(baixar.className).toContain("h-9");
  });

  it("não deve marcar o link externo como download", () => {
    renderizar({ linkHostedFile: "https://exemplo.com/slides" });

    const link = screen.getByRole("link", {
      name: "Abrir link da apresentação",
    });

    expect(link).not.toHaveAttribute("download");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("não deve oferecer download quando não há PDF", () => {
    renderizar({ pdfFile: "" });

    expect(
      screen.queryByRole("button", { name: /Download de/i }),
    ).not.toBeInTheDocument();
  });
});
