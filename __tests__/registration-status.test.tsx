import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";

import { CadastroContent } from "@/components/Auth/CadastroContent";
import { LoginContent } from "@/components/Auth/LoginContent";
import { isRegistrationOpen } from "@/lib/registration";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("@/hooks/useUsers", () => ({
  useUsers: () => ({
    loadingCreateUser: false,
  }),
}));

jest.mock("@/hooks/useEdicao", () => ({
  useEdicao: () => ({
    Edicao: {
      name: "WEPGCOMP 2026",
    },
  }),
}));

jest.mock("@/components/Forms/Cadastro/FormCadastro", () => ({
  FormCadastro: () => <div data-testid="form-cadastro">Formulário</div>,
}));

jest.mock("@/components/Forms/Login/FormLogin", () => ({
  FormLogin: () => <div data-testid="form-login">Login</div>,
}));

jest.mock("@/components/LoadingPage", () => ({
  __esModule: true,
  default: () => <div>Carregando</div>,
}));

describe("status das inscrições", () => {
  it("considera o valor true como inscrições abertas", () => {
    expect(isRegistrationOpen("true")).toBe(true);
  });

  it.each([undefined, "", "false", "TRUE", " true ", "1", "sim"])(
    "mantém as inscrições fechadas para o valor %s",
    (value) => {
      expect(isRegistrationOpen(value)).toBe(false);
    },
  );
});

describe("fluxo de cadastro", () => {
  it("exibe o formulário quando as inscrições estão abertas", () => {
    render(<CadastroContent registrationOpen />);

    expect(
      screen.getByRole("heading", { name: "Cadastro" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("form-cadastro")).toBeInTheDocument();
    expect(screen.queryByText("Inscrições encerradas")).not.toBeInTheDocument();
  });

  it("oculta o formulário e oferece ações quando as inscrições estão fechadas", () => {
    render(<CadastroContent registrationOpen={false} />);

    expect(
      screen.getByRole("heading", { name: "Cadastro indisponível" }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("form-cadastro")).not.toBeInTheDocument();
    expect(screen.getByText("Inscrições encerradas")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Ir para o login" }),
    ).toHaveAttribute("href", "/login");
    expect(
      screen.getByRole("link", { name: "Ver programação" }),
    ).toHaveAttribute("href", "/home#Programacao");
  });
});

describe("fluxo de login", () => {
  it("mantém o acesso ao cadastro quando as inscrições estão abertas", () => {
    render(<LoginContent registrationOpen />);

    expect(screen.getByTestId("form-login")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cadastre-se" })).toHaveAttribute(
      "href",
      "/cadastro",
    );
  });

  it("mantém o login e troca o cadastro pelo aviso quando as inscrições estão fechadas", () => {
    render(<LoginContent registrationOpen={false} />);

    expect(screen.getByTestId("form-login")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Cadastre-se" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Inscrições encerradas")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Ver programação" }),
    ).toHaveAttribute("href", "/home#Programacao");
  });
});
