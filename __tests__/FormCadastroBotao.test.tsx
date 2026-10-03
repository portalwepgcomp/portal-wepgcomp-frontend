import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";

import { FormCadastro } from "@/components/Forms/Cadastro/FormCadastro";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/hooks/useUsers", () => ({
  useUsers: () => ({ registerUser: jest.fn(), loadingCreateUser: false }),
}));

jest.mock("@/hooks/useEdicao", () => ({
  useEdicao: () => ({ Edicao: { id: "edicao-1", name: "WEPGCOMP 2026" } }),
}));

jest.mock("@/hooks/useAlert", () => ({
  useSweetAlert: () => ({ showAlert: jest.fn() }),
}));

describe("FormCadastro — botão Cadastrar", () => {
  it("deve ocupar a largura útil do formulário, sem teto próprio", () => {
    render(<FormCadastro loadingCreateUser={false} />);

    const botao = screen.getByRole("button", { name: "Cadastrar" });

    expect(botao.className).toContain("w-full");
    expect(botao.className).not.toMatch(/max-w-\[/);
  });

  it("não deve ser deslocado por alinhamento condicional do container", () => {
    render(<FormCadastro loadingCreateUser={false} />);

    const container = screen.getByRole("button", {
      name: "Cadastrar",
    }).parentElement;

    expect(container?.className).not.toMatch(/justify-/);
  });
});
