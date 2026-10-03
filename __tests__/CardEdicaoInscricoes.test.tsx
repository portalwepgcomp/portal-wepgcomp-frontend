import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";

import CardEdicao from "@/features/edicoes/components/CardEdicao";
import { Edicao } from "@/models/edicao";

jest.mock("@/hooks/useAlert", () => ({
  useSweetAlert: () => ({ showAlert: jest.fn() }),
}));

function edicao(overrides: Partial<Edicao> = {}) {
  return {
    id: "edicao-1",
    name: "WEPGCOMP 2026",
    description: "Descrição da edição",
    isActive: true,
    registrationOpen: false,
    createdAt: "",
    updatedAt: "",
    deletedAt: "",
    ...overrides,
  } as Edicao;
}

function renderizar(
  props: Partial<Parameters<typeof CardEdicao>[0]> = {},
  dados: Partial<Edicao> = {},
) {
  return render(
    <CardEdicao
      edicao={edicao(dados)}
      onEditar={() => {}}
      onExcluir={() => {}}
      onAtivar={() => {}}
      {...props}
    />,
  );
}

describe("CardEdicao — controle de inscrições", () => {
  it("deve oferecer abrir inscrições na edição ativa quando estão fechadas", () => {
    renderizar({ onAlternarInscricoes: () => {} });

    expect(
      screen.getByRole("button", { name: "Abrir inscrições" }),
    ).toBeInTheDocument();
  });

  it("deve oferecer fechar inscrições quando já estão abertas", () => {
    renderizar({ onAlternarInscricoes: () => {} }, { registrationOpen: true });

    expect(
      screen.getByRole("button", { name: "Fechar inscrições" }),
    ).toBeInTheDocument();
  });

  it("não deve oferecer o controle em edição inativa", () => {
    renderizar({ onAlternarInscricoes: () => {} }, { isActive: false });

    expect(
      screen.queryByRole("button", { name: /inscrições/i }),
    ).not.toBeInTheDocument();
  });

  it("deve inverter o estado atual ao acionar o controle", () => {
    const onAlternarInscricoes = jest.fn();
    renderizar({ onAlternarInscricoes }, { registrationOpen: false });

    fireEvent.click(screen.getByRole("button", { name: "Abrir inscrições" }));

    expect(onAlternarInscricoes).toHaveBeenCalledWith(true);
  });

  it("deve desabilitar o controle enquanto a alteração está em curso", () => {
    renderizar({
      onAlternarInscricoes: () => {},
      alternandoInscricoes: true,
    });

    expect(
      screen.getByRole("button", { name: "Abrir inscrições" }),
    ).toBeDisabled();
  });
});
