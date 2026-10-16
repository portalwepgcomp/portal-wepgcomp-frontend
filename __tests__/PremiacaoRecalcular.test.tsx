import { beforeEach, describe, expect, it } from "@jest/globals";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { ReactNode } from "react";

import Premiacao from "@/app/premiacao/page";
import type { AuthorOrEvaluator, Premiacoes } from "@/models/premiacao";
import { premiacaoApi } from "@/services/premiacao";
import { presentationApi } from "@/services/presentation";

const mockShowAlert = jest.fn();
let mockEdicaoId: string | null;

jest.mock("@/hooks/useAlert", () => ({
  useSweetAlert: () => ({ showAlert: mockShowAlert }),
}));

jest.mock("@/components/ProtectedLayout/protectedLayout", () => ({
  ProtectedLayout: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

jest.mock("@/hooks/useEdicao", () => ({
  useEdicao: () => ({ Edicao: mockEdicaoId ? { id: mockEdicaoId } : null }),
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

const recalcular = jest.mocked(presentationApi.calculateAllScores);
const listarBanca = jest.mocked(premiacaoApi.listTopPanelistsById);
const listarPublico = jest.mocked(premiacaoApi.listTopAudienceById);
const listarAvaliadores = jest.mocked(premiacaoApi.listAwardedPanelistsById);

function trabalho(categoria: string, nota: number): Premiacoes[] {
  return [
    {
      id: categoria,
      evaluatorsAverageScore: nota,
      publicAverageScore: nota,
      submission: {
        title: `Trabalho da ${categoria}`,
        mainAuthor: { name: "Autora" },
      },
    } as Premiacoes,
  ];
}

function avaliadores(votos: number): AuthorOrEvaluator[] {
  return [
    { id: "avaliador", name: "Avaliadora", votes: votos } as AuthorOrEvaluator,
  ];
}

function configurarRankings(nota: number, votos: number) {
  listarBanca.mockResolvedValue(trabalho("banca", nota));
  listarPublico.mockResolvedValue(trabalho("audiência", nota));
  listarAvaliadores.mockResolvedValue(avaliadores(votos));
}

const categorias = [
  { nome: "Banca", conteudo: "Trabalho da banca", novoValor: "3.00" },
  { nome: "Público", conteudo: "Trabalho da audiência", novoValor: "3.00" },
  { nome: "Avaliadores", conteudo: "Avaliadora", novoValor: "7" },
];

async function abrirCategoria(nome: string, conteudo: string) {
  fireEvent.click(screen.getByRole("button", { name: nome }));
  expect(await screen.findByText(conteudo)).toBeInTheDocument();
}

beforeEach(() => {
  jest.resetAllMocks();
  mockEdicaoId = "edicao-97";
  mockShowAlert.mockResolvedValue({ isConfirmed: true });
  recalcular.mockResolvedValue({});
  configurarRankings(4, 4);
});

describe("Premiação — recálculo dos rankings", () => {
  it.each(categorias)(
    "atualiza a aba $nome e as demais categorias sem recarregar a página",
    async ({ nome, conteudo, novoValor }) => {
      render(<Premiacao />);
      expect(await screen.findByText("Trabalho da banca")).toBeInTheDocument();

      // Carrega valores antigos nas três categorias antes de recalcular.
      for (const categoria of categorias) {
        await abrirCategoria(categoria.nome, categoria.conteudo);
      }
      await abrirCategoria(nome, conteudo);
      const consultasAntes = [
        listarBanca,
        listarPublico,
        listarAvaliadores,
      ].map((listar) => listar.mock.calls.length);

      configurarRankings(3, 7);
      fireEvent.click(screen.getByRole("button", { name: "Recalcular" }));

      expect(await screen.findByText(novoValor)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: nome })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await waitFor(() =>
        expect(mockShowAlert).toHaveBeenCalledWith(
          expect.objectContaining({ icon: "success" }),
        ),
      );
      expect(recalcular).toHaveBeenCalledWith("edicao-97");
      [listarBanca, listarPublico, listarAvaliadores].forEach(
        (listar, indice) => {
          expect(listar).toHaveBeenCalledTimes(consultasAntes[indice] + 1);
          expect(listar).toHaveBeenLastCalledWith("edicao-97");
          // Ao abrir as outras abas, os dados do contexto já devem estar atualizados,
          // mesmo antes de suas consultas habituais terminarem.
          listar.mockImplementation(() => new Promise(() => {}));
        },
      );

      for (const categoria of categorias) {
        await abrirCategoria(categoria.nome, categoria.conteudo);
        expect(
          await screen.findByText(categoria.novoValor),
        ).toBeInTheDocument();
        expect(screen.queryByText("4.00")).not.toBeInTheDocument();
      }
    },
  );

  it("aguarda o POST e a atualização dos rankings, preservando a pesquisa", async () => {
    let concluirRecalculo!: () => void;
    let concluirRanking!: (resultado: Premiacoes[]) => void;
    recalcular.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          concluirRecalculo = resolve;
        }),
    );
    render(<Premiacao />);
    expect(await screen.findByText("4.00")).toBeInTheDocument();
    const pesquisa = screen.getByPlaceholderText(
      "Pesquise pelo nome da apresentação",
    );
    fireEvent.change(pesquisa, { target: { value: "banca" } });
    listarBanca.mockImplementationOnce(
      () =>
        new Promise<Premiacoes[]>((resolve) => {
          concluirRanking = resolve;
        }),
    );
    listarPublico.mockResolvedValue(trabalho("audiência", 3));
    listarAvaliadores.mockResolvedValue(avaliadores(7));

    fireEvent.click(screen.getByRole("button", { name: "Recalcular" }));
    await waitFor(() => expect(recalcular).toHaveBeenCalled());
    expect(listarBanca).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("button", { name: "Recalculando..." }),
    ).toBeDisabled();

    await act(async () => concluirRecalculo());
    expect(listarBanca).toHaveBeenCalledTimes(2);
    expect(
      screen.getByRole("button", { name: "Recalculando..." }),
    ).toBeDisabled();
    expect(mockShowAlert).not.toHaveBeenCalledWith(
      expect.objectContaining({ icon: "success" }),
    );

    await act(async () => concluirRanking(trabalho("banca", 3)));
    expect(await screen.findByText("3.00")).toBeInTheDocument();
    expect(pesquisa).toHaveValue("banca");
    expect(screen.getByRole("button", { name: "Recalcular" })).toBeEnabled();
  });

  it("mantém o ranking e mostra o erro da API quando o recálculo falha", async () => {
    recalcular.mockRejectedValue({
      response: { data: { message: "Falha no cálculo." } },
    });
    render(<Premiacao />);
    expect(await screen.findByText("4.00")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Recalcular" }));
    await waitFor(() =>
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ icon: "error", text: "Falha no cálculo." }),
      ),
    );
    expect(listarBanca).toHaveBeenCalledTimes(1);
    expect(listarPublico).not.toHaveBeenCalled();
    expect(listarAvaliadores).not.toHaveBeenCalled();
    expect(screen.getByText("4.00")).toBeInTheDocument();
    expect(mockShowAlert).not.toHaveBeenCalledWith(
      expect.objectContaining({ icon: "success" }),
    );
    expect(screen.getByRole("button", { name: "Recalcular" })).toBeEnabled();
  });

  it("informa quando as notas foram recalculadas mas os rankings não puderam ser atualizados", async () => {
    render(<Premiacao />);
    expect(await screen.findByText("4.00")).toBeInTheDocument();
    configurarRankings(3, 7);
    listarPublico.mockRejectedValue(new Error("Falha de rede"));

    fireEvent.click(screen.getByRole("button", { name: "Recalcular" }));
    await waitFor(() =>
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: "error",
          title: "Erro ao atualizar premiações",
          text: expect.stringContaining("As notas foram recalculadas"),
        }),
      ),
    );
    expect(screen.getByText("4.00")).toBeInTheDocument();
    expect(mockShowAlert).not.toHaveBeenCalledWith(
      expect.objectContaining({ icon: "success" }),
    );
    expect(screen.getByRole("button", { name: "Recalcular" })).toBeEnabled();
  });

  it("não recalcula nem atualiza rankings quando a confirmação é cancelada", async () => {
    mockShowAlert.mockResolvedValue({ isConfirmed: false });
    render(<Premiacao />);
    expect(await screen.findByText("4.00")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Recalcular" }));
    await waitFor(() => expect(mockShowAlert).toHaveBeenCalledTimes(1));
    expect(recalcular).not.toHaveBeenCalled();
    expect(listarBanca).toHaveBeenCalledTimes(1);
    expect(listarPublico).not.toHaveBeenCalled();
    expect(listarAvaliadores).not.toHaveBeenCalled();
  });

  it("solicita a seleção de uma edição antes de recalcular", async () => {
    mockEdicaoId = null;
    render(<Premiacao />);

    fireEvent.click(screen.getByRole("button", { name: "Recalcular" }));
    await waitFor(() =>
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: "warning",
          title: "Edição não selecionada",
        }),
      ),
    );
    expect(recalcular).not.toHaveBeenCalled();
    expect(listarBanca).not.toHaveBeenCalled();
    expect(listarPublico).not.toHaveBeenCalled();
    expect(listarAvaliadores).not.toHaveBeenCalled();
  });
});
