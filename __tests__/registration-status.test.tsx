import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";

import { CadastroContent } from "@/components/Auth/CadastroContent";
import { LoginContent } from "@/components/Auth/LoginContent";
import { obterStatusInscricoes } from "@/lib/registration";

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
  const fetchMock = jest.fn();
  const apiUrlOriginal = process.env.NEXT_PUBLIC_API_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "http://api.test";
    global.fetch = fetchMock as unknown as typeof fetch;
    fetchMock.mockReset();
  });

  afterAll(() => {
    if (apiUrlOriginal === undefined) {
      delete process.env.NEXT_PUBLIC_API_URL;
    } else {
      process.env.NEXT_PUBLIC_API_URL = apiUrlOriginal;
    }
  });

  it("considera aberto quando a API responde registrationOpen true", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        registrationOpen: true,
        eventEditionId: "edicao-1",
      }),
    });

    await expect(obterStatusInscricoes()).resolves.toEqual({
      registrationOpen: true,
      eventEditionId: "edicao-1",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/event/registration-status",
      { cache: "no-store" },
    );
  });

  it("considera fechado quando a API responde registrationOpen false", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ registrationOpen: false, eventEditionId: null }),
    });

    await expect(obterStatusInscricoes()).resolves.toEqual({
      registrationOpen: false,
      eventEditionId: null,
    });
  });

  it("considera fechado quando a API responde erro", async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({}) });

    await expect(obterStatusInscricoes()).resolves.toEqual({
      registrationOpen: false,
      eventEditionId: null,
    });
  });

  it("considera fechado quando a API está inacessível", async () => {
    fetchMock.mockRejectedValue(new Error("Network Error"));

    await expect(obterStatusInscricoes()).resolves.toEqual({
      registrationOpen: false,
      eventEditionId: null,
    });
  });

  it("não consulta a API quando a URL não está configurada", async () => {
    delete process.env.NEXT_PUBLIC_API_URL;

    await expect(obterStatusInscricoes()).resolves.toEqual({
      registrationOpen: false,
      eventEditionId: null,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([undefined, null, "true", 1])(
    "considera fechado para o valor %s vindo da API",
    async (valor) => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ registrationOpen: valor }),
      });

      await expect(obterStatusInscricoes()).resolves.toMatchObject({
        registrationOpen: false,
      });
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

  it("mantém somente o formulário quando as inscrições estão fechadas", () => {
    render(<LoginContent registrationOpen={false} />);

    expect(screen.getByTestId("form-login")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Cadastre-se" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Inscrições encerradas")).not.toBeInTheDocument();
  });
});
