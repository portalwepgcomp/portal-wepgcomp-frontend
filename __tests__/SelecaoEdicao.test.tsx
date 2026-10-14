import { beforeEach, describe, expect, it } from "@jest/globals";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import type { ReactNode } from "react";
import Header from "@/components/Header/Header";
import Premiacao from "@/app/premiacao/page";
import { AuthContext } from "@/context/AuthProvider/authProvider";
import { getEventEditionIdStorage } from "@/context/AuthProvider/util";
import {
  ActiveEditionProvider,
  useActiveEdition,
} from "@/hooks/useActiveEdition";
import { EdicaoProvider, useEdicao } from "@/hooks/useEdicao";
import type { Edicao } from "@/models/edicao";
import { edicaoApi } from "@/services/edicao";
import { premiacaoApi } from "@/services/premiacao";
import { presentationApi } from "@/services/presentation";

const mockShowAlert = jest.fn();
const mockPush = jest.fn();
const mockRouter = { push: mockPush };
let mockPath = "/premiacao";
jest.mock("next/navigation", () => ({
  usePathname: () => mockPath,
  useRouter: () => mockRouter,
}));
jest.mock("@/hooks/useAlert", () => ({
  useSweetAlert: () => ({ showAlert: mockShowAlert }),
}));
jest.mock("@/components/Perfil/usePerfilCertificado", () => ({
  usePerfilCertificado: () => ({ certificateDownload: jest.fn() }),
}));
jest.mock("@/services/edicao", () => ({
  edicaoApi: { listEdicao: jest.fn(), getEdicaoById: jest.fn() },
}));
jest.mock("@/services/premiacao", () => ({
  premiacaoApi: {
    listTopPanelistsById: jest.fn(),
    listTopAudienceById: jest.fn(),
    listAwardedPanelistsById: jest.fn(),
  },
}));
jest.mock("@/services/presentation", () => ({
  presentationApi: { calculateAllScores: jest.fn() },
}));

const active = {
  id: "active-2026",
  name: "Edição Principal 2026",
  startDate: "2026-10-15T12:00:00Z",
  isActive: true,
} as Edicao;
const inactive = {
  id: "inactive-2026",
  name: "Edição Extra 2026",
  startDate: "2026-10-20T12:00:00Z",
  isActive: false,
} as Edicao;
const list = jest.mocked(edicaoApi.listEdicao);
const get = jest.mocked(edicaoApi.getEdicaoById);
const audience = jest.mocked(premiacaoApi.listTopAudienceById);
const banca = jest.mocked(premiacaoApi.listTopPanelistsById);
const recalculate = jest.mocked(presentationApi.calculateAllScores);

function ranking(id: string) {
  return [
    {
      id,
      publicAverageScore: 3,
      evaluatorsAverageScore: 4,
      submission: {
        title: `Trabalho de ${id}`,
        mainAuthor: { name: "Autora" },
      },
    },
  ];
}
function Selection() {
  const { selectEdition } = useActiveEdition();
  const { Edicao } = useEdicao();
  return (
    <output data-testid="identity">
      {selectEdition.id}|{Edicao?.id}
    </output>
  );
}
function App() {
  return (
    <AuthContext.Provider
      value={{
        user: {
          id: "admin-100",
          name: "Administradora",
          level: "Admin",
          profile: "Professor",
          isActive: true,
        },
        signed: true,
        isValidatingToken: false,
        isLoggingOut: false,
        singIn: async () => {},
        logout: () => {},
        updateUserProfile: () => {},
      }}
    >
      <EdicaoProvider>
        <ActiveEditionProvider>
          <Header />
          <Selection />
          {mockPath === "/premiacao" ? <Premiacao /> : <p>Outra página</p>}
        </ActiveEditionProvider>
      </EdicaoProvider>
    </AuthContext.Provider>
  );
}
async function expectSelection(edition: Edicao) {
  await waitFor(() =>
    expect(
      screen.getByRole("combobox", { name: "Selecionar edição do evento" }),
    ).toHaveValue(edition.id),
  );
  expect(screen.getByTestId("identity")).toHaveTextContent(
    `${edition.id}|${edition.id}`,
  );
  expect(getEventEditionIdStorage()).toBe(edition.id);
  await waitFor(() =>
    expect(JSON.parse(localStorage.getItem("activeEdition") ?? "{}").id).toBe(
      edition.id,
    ),
  );
}
beforeEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
  document.cookie = "session_eventEditionId=; Path=/; Max-Age=0";
  mockPath = "/premiacao";
  list.mockResolvedValue([inactive, active]);
  get.mockImplementation(
    async (id) =>
      [active, inactive].find((edition) => edition.id === id) ??
      Promise.reject(new Error("404")),
  );
  banca.mockImplementation(async (id) => ranking(id));
  audience.mockImplementation(async (id) => ranking(id));
  jest.mocked(premiacaoApi.listAwardedPanelistsById).mockResolvedValue([]);
  recalculate.mockResolvedValue({});
  mockShowAlert.mockResolvedValue({ isConfirmed: true });
});

describe("Identidade da edição", () => {
  it("prioriza o ID do cookie e preserva o alvo entre navegação, ranking e recálculo", async () => {
    document.cookie = `session_eventEditionId=${active.id}; Path=/`;
    localStorage.setItem(
      "activeEdition",
      JSON.stringify({ year: "2026", isActive: false }),
    );
    localStorage.setItem("edicaoAtiva", JSON.stringify(inactive));
    const app = render(<App />);
    await expectSelection(active);
    expect(
      await screen.findByText(`Trabalho de ${active.id}`),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Público" }));
    await waitFor(() => expect(audience).toHaveBeenCalledWith(active.id));
    fireEvent.click(screen.getByRole("button", { name: "Recalcular" }));
    await waitFor(() => expect(recalculate).toHaveBeenCalledWith(active.id));
    mockPath = "/home";
    app.rerender(<App />);
    await screen.findByText("Outra página");
    mockPath = "/premiacao";
    app.rerender(<App />);
    await expectSelection(active);
    expect(get).toHaveBeenCalledTimes(1);
    expect(banca.mock.calls.every(([id]) => id === active.id)).toBe(true);
    expect(audience.mock.calls.every(([id]) => id === active.id)).toBe(true);
  });

  it("oferece separadamente duas edições do mesmo ano e consulta a escolhida ao trocar sem alternar aba", async () => {
    render(<App />);
    await expectSelection(active);
    const select = screen.getByRole("combobox", {
      name: "Selecionar edição do evento",
    });
    expect(screen.getAllByRole("option")).toHaveLength(2);
    expect(
      screen.getByRole("option", { name: /Edição Extra 2026/ }),
    ).toHaveValue(inactive.id);
    fireEvent.click(screen.getByRole("button", { name: "Público" }));
    await waitFor(() => expect(audience).toHaveBeenCalledWith(active.id));
    fireEvent.change(select, { target: { value: inactive.id } });
    await expectSelection(inactive);
    expect(
      await screen.findByText(`Trabalho de ${inactive.id}`),
    ).toBeInTheDocument();
    expect(audience).toHaveBeenLastCalledWith(inactive.id);
    fireEvent.click(screen.getByRole("button", { name: "Recalcular" }));
    await waitFor(() => expect(recalculate).toHaveBeenCalledWith(inactive.id));
  });

  it.each(["cookie", "activeEdition", "edicaoAtiva"])(
    "restaura uma edição inativa por ID salvo em %s",
    async (source) => {
      if (source === "cookie")
        document.cookie = `session_eventEditionId=${inactive.id}; Path=/`;
      else
        localStorage.setItem(
          source,
          JSON.stringify({ ...inactive, year: "2026" }),
        );
      render(<App />);
      await expectSelection(inactive);
      expect(banca).toHaveBeenCalledWith(inactive.id);
    },
  );

  it("solicita escolha explícita ao migrar um ano legado ambíguo", async () => {
    localStorage.setItem(
      "activeEdition",
      JSON.stringify({ year: "2026", isActive: true }),
    );
    render(<App />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Há mais de uma edição",
    );
    expect(get).not.toHaveBeenCalled();
    expect(banca).not.toHaveBeenCalled();
    expect(getEventEditionIdStorage()).toBeNull();
    fireEvent.change(
      screen.getByRole("combobox", { name: "Selecionar edição do evento" }),
      { target: { value: active.id } },
    );
    await expectSelection(active);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("migra um ano legado quando há somente uma edição correspondente", async () => {
    list.mockResolvedValue([active]);
    localStorage.setItem(
      "activeEdition",
      JSON.stringify({ year: "2026", isActive: true }),
    );
    render(<App />);
    await expectSelection(active);
    expect(get).toHaveBeenCalledWith(active.id);
  });

  it("recupera armazenamento corrompido usando o ID do cookie", async () => {
    localStorage.setItem("activeEdition", "invalid json");
    document.cookie = `session_eventEditionId=${active.id}; Path=/`;
    render(<App />);
    await expectSelection(active);
  });

  it("não substitui silenciosamente um ID removido por outra edição", async () => {
    document.cookie = "session_eventEditionId=removed-id; Path=/";
    render(<App />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível carregar",
    );
    expect(getEventEditionIdStorage()).toBeNull();
    expect(banca).not.toHaveBeenCalled();
  });

  it("preserva a edição anterior quando uma troca falha", async () => {
    render(<App />);
    await expectSelection(active);
    get.mockRejectedValueOnce(new Error("Network error"));
    fireEvent.change(
      screen.getByRole("combobox", { name: "Selecionar edição do evento" }),
      { target: { value: inactive.id } },
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "A seleção anterior foi mantida",
    );
    await expectSelection(active);
    expect(audience).not.toHaveBeenCalledWith(inactive.id);
  });

  it("ignora respostas atrasadas ao selecionar rapidamente por ID", async () => {
    let resolveFirst!: (edition: Edicao) => void;
    let resolveSecond!: (edition: Edicao) => void;
    get
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSecond = resolve;
          }),
      );
    const { result } = renderHook(() => useEdicao(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <EdicaoProvider>{children}</EdicaoProvider>
      ),
    });
    let first!: Promise<Edicao | null>;
    let second!: Promise<Edicao | null>;
    act(() => {
      first = result.current.getEdicaoById(active.id);
      second = result.current.getEdicaoById(inactive.id);
    });
    await act(async () => {
      resolveSecond(inactive);
      await second;
    });
    await act(async () => {
      resolveFirst(active);
      await first;
    });
    expect(result.current.Edicao?.id).toBe(inactive.id);
    expect(getEventEditionIdStorage()).toBe(inactive.id);
  });
});
