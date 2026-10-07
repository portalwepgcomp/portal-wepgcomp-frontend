import { expect } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import Avaliacao from "@/app/avaliacao/[id]/page";
import { AuthContext } from "@/context/AuthProvider/authProvider";
import { useEdicao } from "@/hooks/useEdicao";
import { useEvaluation } from "@/hooks/useEvaluation";
import { usePresentation } from "@/hooks/usePresentation";
import { Evaluation, EvaluationCriteria } from "@/models/evaluation";
import { Presentation } from "@/models/presentation";
import { PropsWithChildren } from "react";

jest.mock("next/navigation", () => ({ useRouter: jest.fn() }));
jest.mock("@/hooks/useEdicao", () => ({ useEdicao: jest.fn() }));
jest.mock("@/hooks/useEvaluation", () => ({ useEvaluation: jest.fn() }));
jest.mock("@/hooks/usePresentation", () => ({ usePresentation: jest.fn() }));
jest.mock("@/components/ProtectedLayout/protectedLayout", () => ({
  ProtectedLayout: ({ children }: PropsWithChildren) => children,
}));

const makeEvaluation = jest.fn();
const evaluationCriteria = [
  { id: "clareza", title: "Clareza", description: "Clareza da apresentação" },
  { id: "dominio", title: "Domínio", description: "Domínio do tema" },
].map((criteria) => ({
  ...criteria,
  eventEditionId: "edicao",
  weightRadio: 1,
  createdAt: new Date("2026-10-07T12:00:00Z"),
  updatedAt: new Date("2026-10-07T12:00:00Z"),
})) satisfies EvaluationCriteria[];
let evaluations: Evaluation[];
let loadingEvaluation: boolean;
let isActive: boolean;

beforeEach(() => {
  evaluations = [];
  loadingEvaluation = false;
  isActive = true;
  jest
    .mocked(useEdicao)
    .mockImplementation(
      () =>
        ({ Edicao: { id: "edicao", isActive } }) as ReturnType<
          typeof useEdicao
        >,
    );
  const getPresentationAll = jest.fn();
  jest.mocked(usePresentation).mockReturnValue({
    getPresentationAll,
    presentationBookmark: { bookmarked: false },
    getPresentationBookmark: jest.fn(),
    postPresentationBookmark: jest.fn(),
    deletePresentationBookmark: jest.fn(),
    getPresentationById: jest.fn(),
    presentationList: [
      {
        id: "apresentacao",
        submission: {
          id: "trabalho",
          title: "Trabalho de teste",
          mainAuthor: { name: "Autora" },
        },
      } as Presentation,
    ],
  });
  const getEvaluationByUser = jest.fn();
  const getEvaluationCriteria = jest.fn();
  jest.mocked(useEvaluation).mockImplementation(() => ({
    makeEvaluation,
    evaluations,
    evaluationCriteria,
    getEvaluationByUser,
    getEvaluationCriteria,
    loadingEvaluation,
    loadingEvaluationCriteria: false,
    getEvaluations: jest.fn(),
    createEvaluationCriteria: jest.fn(),
    updateEvaluationCriteria: jest.fn(),
  }));
});

function renderizar() {
  return render(
    <AuthContext.Provider
      value={
        { user: { id: "ouvinte" } } as React.ContextType<typeof AuthContext>
      }
    >
      <Avaliacao params={{ id: "apresentacao" }} />
    </AuthContext.Provider>,
  );
}

function marcarNota(criterio: number, nota: number) {
  const rotulo = `${criterio + 1}. ${evaluationCriteria[criterio].description}`;
  const estrelas = screen
    .getByText(rotulo)
    .parentElement!.querySelectorAll(".star");
  fireEvent.click(estrelas[nota - 1]);
}

it("orienta a preencher as notas quando nenhum critério foi avaliado", () => {
  renderizar();
  fireEvent.click(screen.getByRole("button", { name: "Avaliar" }));

  expect(screen.getByRole("alert")).toHaveTextContent(
    "Selecione uma nota para cada critério antes de enviar a avaliação.",
  );
  expect(makeEvaluation).not.toHaveBeenCalled();
});

it("bloqueia o envio parcial com uma mensagem sem listar critérios", () => {
  renderizar();
  marcarNota(0, 4);
  fireEvent.click(screen.getByRole("button", { name: "Avaliar" }));

  expect(screen.getByRole("alert").textContent).toBe(
    "Selecione uma nota para cada critério antes de enviar a avaliação.",
  );
  expect(makeEvaluation).not.toHaveBeenCalled();
});

it("remove a mensagem ao completar as notas e envia todos os critérios", () => {
  renderizar();
  marcarNota(0, 4);
  fireEvent.click(screen.getByRole("button", { name: "Avaliar" }));
  marcarNota(1, 5);

  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Avaliar" }));
  expect(makeEvaluation).toHaveBeenCalledTimes(1);
  expect(makeEvaluation).toHaveBeenCalledWith([
    {
      userId: "ouvinte",
      submissionId: "trabalho",
      evaluationCriteriaId: "clareza",
      score: 4,
    },
    {
      userId: "ouvinte",
      submissionId: "trabalho",
      evaluationCriteriaId: "dominio",
      score: 5,
    },
  ]);
});

it("permite reenviar uma avaliação completa existente e preserva comentários", () => {
  evaluations = evaluationCriteria.map((criteria) => ({
    id: `avaliacao-${criteria.id}`,
    userId: "ouvinte",
    submissionId: "trabalho",
    evaluationCriteriaId: criteria.id,
    score: 3,
    comments: "Comentário existente",
  }));
  renderizar();
  fireEvent.click(screen.getByRole("button", { name: "Avaliar" }));

  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(makeEvaluation).toHaveBeenCalledWith(
    evaluations.map(({ id: _id, ...evaluation }) => evaluation),
  );
});

it("não envia uma avaliação vazia quando a edição não tem critérios", () => {
  const context = jest.mocked(useEvaluation)();
  jest
    .mocked(useEvaluation)
    .mockReturnValue({ ...context, evaluationCriteria: [] });
  renderizar();

  expect(screen.getByRole("button", { name: "Avaliar" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Avaliar" }));
  expect(makeEvaluation).not.toHaveBeenCalled();
});

it("mantém o envio desabilitado em uma edição inativa", () => {
  isActive = false;
  renderizar();
  marcarNota(0, 4);
  marcarNota(1, 5);

  expect(screen.getByRole("button", { name: "Avaliar" })).toBeDisabled();
  expect(makeEvaluation).not.toHaveBeenCalled();
});
