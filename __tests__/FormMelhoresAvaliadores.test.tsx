import { beforeEach, describe, expect, it } from "@jest/globals";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { AxiosError, type AxiosResponse } from "axios";
import type { ContextType } from "react";

import MelhoresAvaliadoresPage from "@/app/premiacao/melhores-avaliadores/page";
import { AuthContext } from "@/context/AuthProvider/authProvider";
import { getEventEditionIdStorage } from "@/context/AuthProvider/util";
import type { UserProfile } from "@/models/user";
import { premiacaoApi } from "@/services/premiacao";

const mockShowAlert = jest.fn();
const mockPush = jest.fn();
const mockRouter = { push: mockPush };

jest.mock("next/navigation", () => ({ useRouter: () => mockRouter }));
jest.mock("@/hooks/useAlert", () => ({
  useSweetAlert: () => ({ showAlert: mockShowAlert }),
}));
jest.mock("@/hooks/useEdicao", () => ({
  useEdicao: () => ({ Edicao: { name: "WEPGCOMP de Teste" } }),
}));
jest.mock("@/context/AuthProvider/util", () => ({
  getEventEditionIdStorage: jest.fn(),
}));
jest.mock("@/services/premiacao", () => ({
  premiacaoApi: {
    getPanelists: jest.fn(),
    createAwardedPanelists: jest.fn(),
  },
}));

const getEdicao = jest.mocked(getEventEditionIdStorage);
const listarBanca = jest.mocked(premiacaoApi.getPanelists);
const salvar = jest.mocked(premiacaoApi.createAwardedPanelists);
const admin: UserProfile = {
  id: "admin-98",
  name: "Administradora",
  profile: "Professor",
  level: "Admin",
  isActive: true,
};

function renderPage(user: UserProfile | null = admin) {
  const session: ContextType<typeof AuthContext> = {
    user,
    signed: !!user,
    singIn: jest.fn(async () => {}),
    logout: jest.fn(),
    updateUserProfile: jest.fn(),
    isValidatingToken: false,
    isLoggingOut: false,
  };
  return render(
    <AuthContext.Provider value={session}>
      <MelhoresAvaliadoresPage />
    </AuthContext.Provider>,
  );
}

async function selecionarAvaliadora() {
  await waitFor(() => expect(listarBanca).toHaveBeenCalledWith("edicao-98"));
  fireEvent.keyDown(screen.getByRole("combobox"), { key: "ArrowDown" });
  fireEvent.click(await screen.findByRole("option", { name: "Avaliadora Um" }));
}

function clicarSalvar() {
  fireEvent.click(screen.getByRole("button", { name: "Salvar Premiação" }));
}

beforeEach(() => {
  jest.resetAllMocks();
  getEdicao.mockReturnValue("edicao-98");
  listarBanca.mockResolvedValue([
    { id: "avaliadora-1", name: "Avaliadora Um" },
  ]);
  salvar.mockResolvedValue({ added: 1, removed: 0 });
  mockShowAlert.mockResolvedValue({ isConfirmed: true });
});

describe("Melhores avaliadores — salvar premiação", () => {
  it.each([400, 401, 403, 422, 500, 503])(
    "mostra apenas erro e permanece no formulário quando a API responde %i",
    async (status) => {
      const message = `Falha ao salvar (${status}).`;
      salvar.mockRejectedValue(
        new AxiosError(
          "Request failed",
          "ERR_BAD_RESPONSE",
          undefined,
          undefined,
          { status, data: { message } } as AxiosResponse,
        ),
      );
      renderPage();
      await selecionarAvaliadora();
      clicarSalvar();

      await waitFor(() => expect(mockShowAlert).toHaveBeenCalledTimes(1));
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: "error",
          text: message,
        }),
      );
      expect(mockPush).not.toHaveBeenCalled();
      expect(screen.getByText("1 / 3 selecionados")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Salvar Premiação" }),
      ).toBeEnabled();
    },
  );

  it("não mostra sucesso nem redireciona quando ocorre erro de rede", async () => {
    salvar.mockRejectedValue(new AxiosError("Network Error", "ERR_NETWORK"));
    renderPage();
    await selecionarAvaliadora();
    clicarSalvar();

    await waitFor(() => expect(mockShowAlert).toHaveBeenCalledTimes(1));
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: "error",
        text: expect.stringContaining("Não foi possível estabelecer conexão"),
      }),
    );
    expect(mockPush).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Salvar Premiação" }),
    ).toBeEnabled();
  });

  it("aguarda a gravação, confirma sucesso uma única vez e só então redireciona", async () => {
    let concluirGravacao!: (value: unknown) => void;
    let confirmarAlerta!: () => void;
    salvar.mockImplementation(
      () =>
        new Promise((resolve) => {
          concluirGravacao = resolve;
        }),
    );
    mockShowAlert.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          confirmarAlerta = resolve;
        }),
    );
    renderPage();
    await selecionarAvaliadora();
    clicarSalvar();

    await waitFor(() => expect(salvar).toHaveBeenCalledTimes(1));
    expect(salvar).toHaveBeenCalledWith({
      eventEditionId: "edicao-98",
      panelists: [{ userId: "avaliadora-1" }],
    });
    expect(
      screen.getByRole("button", { name: "Salvar Premiação" }),
    ).toBeDisabled();
    expect(
      screen.getByLabelText("Selecione os Membros da Banca"),
    ).toBeDisabled();
    expect(mockShowAlert).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();

    await act(async () => concluirGravacao({ added: 1, removed: 0 }));
    expect(mockShowAlert).toHaveBeenCalledTimes(1);
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: "success",
        title: "Premiação Salva!",
      }),
    );
    expect(mockPush).not.toHaveBeenCalled();

    await act(async () => confirmarAlerta());
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/premiacao");
  });

  it("permite tentar novamente após uma falha sem perder a seleção", async () => {
    salvar.mockRejectedValueOnce(new Error("Falha temporária"));
    renderPage();
    await selecionarAvaliadora();
    clicarSalvar();
    await waitFor(() => expect(mockShowAlert).toHaveBeenCalledTimes(1));
    expect(mockPush).not.toHaveBeenCalled();

    clicarSalvar();
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/premiacao"));
    expect(salvar).toHaveBeenCalledTimes(2);
    expect(salvar.mock.calls[1][0].panelists).toEqual([
      { userId: "avaliadora-1" },
    ]);
    expect(mockShowAlert.mock.calls.map(([options]) => options.icon)).toEqual([
      "error",
      "success",
    ]);
  });

  it.each(["Listener", "Presenter", "Professor"] as const)(
    "bloqueia acesso direto ao formulário para %s com nível Default",
    (profile) => {
      renderPage({ ...admin, profile, level: "Default" });

      expect(screen.getByRole("alert")).toHaveTextContent(
        "Apenas administradores",
      );
      expect(
        screen.queryByRole("button", { name: "Salvar Premiação" }),
      ).not.toBeInTheDocument();
      expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
      expect(listarBanca).not.toHaveBeenCalled();
      expect(salvar).not.toHaveBeenCalled();
      expect(mockShowAlert).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    },
  );

  it("mantém a proteção de login para quem não está autenticado", () => {
    renderPage(null);

    expect(mockPush).toHaveBeenCalledWith("/login");
    expect(
      screen.queryByRole("button", { name: "Salvar Premiação" }),
    ).not.toBeInTheDocument();
    expect(listarBanca).not.toHaveBeenCalled();
    expect(salvar).not.toHaveBeenCalled();
  });

  it("não salva nem confirma sucesso sem uma edição selecionada", async () => {
    getEdicao.mockReturnValue(null);
    renderPage();
    clicarSalvar();

    await waitFor(() =>
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: "warning",
          title: "Edição não selecionada",
        }),
      ),
    );
    expect(listarBanca).not.toHaveBeenCalled();
    expect(salvar).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
