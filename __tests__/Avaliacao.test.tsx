import { expect } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import Avaliacao from "@/app/avaliacao/[id]/page";
import { AuthContext } from "@/context/AuthProvider/authProvider";
import { useEvaluation } from "@/hooks/useEvaluation";
import type { EvaluationContextData } from "@/models/evaluation";
import { evaluationApi } from "@/services/evaluation";
import type { ContextType } from "react";

jest.mock("@/hooks/useEvaluation", () => ({ useEvaluation: jest.fn() }));
jest.mock("@/services/evaluation", () => ({
  evaluationApi: {
    getEvaluationContext: jest.fn(),
    getEvaluationCriteria: jest.fn(),
    getEvaluationByUser: jest.fn(),
  },
}));

const makeEvaluation = jest.fn();
const evaluationCriteria = [
  { id: "clareza", title: "Clareza", description: "Clareza da apresentação" },
  { id: "dominio", title: "Domínio", description: "Domínio do tema" },
];
const context: EvaluationContextData = {
  presentationId: "apresentacao",
  submissionId: "trabalho",
  title: "Trabalho de teste",
  authorName: "Autora",
  eventEdition: {
    id: "edicao",
    name: "Edição de teste",
    isActive: true,
    isEvaluationRestrictToLoggedUsers: true,
  },
  criteria: evaluationCriteria,
};
const api = jest.mocked(evaluationApi);
const auth = {
  user: { id: "ouvinte" },
  isValidatingToken: false,
  isLoggingOut: false,
} as ContextType<typeof AuthContext>;

beforeEach(() => {
  jest.clearAllMocks();
  api.getEvaluationContext.mockResolvedValue(context);
  api.getEvaluationCriteria.mockResolvedValue(evaluationCriteria);
  api.getEvaluationByUser.mockResolvedValue([]);
  jest.mocked(useEvaluation).mockReturnValue({
    makeEvaluation,
    makeAnonymousEvaluation: jest.fn(async () => {}),
    loadingEvaluation: false,
    loadingEvaluationCriteria: false,
    evaluations: [],
    evaluationCriteria: [],
    getEvaluations: jest.fn(async () => {}),
    getEvaluationByUser: jest.fn(async () => {}),
    getEvaluationCriteria: jest.fn(async () => {}),
    createEvaluationCriteria: jest.fn(async () => true),
    updateEvaluationCriteria: jest.fn(async () => true),
  });
});

function pagina(id = "apresentacao") {
  return (
    <AuthContext.Provider value={auth}>
      <Avaliacao params={{ id }} />
    </AuthContext.Provider>
  );
}

async function renderizar() {
  const view = render(pagina());
  await screen.findByRole("button", { name: "Avaliar" });
  return view;
}

function marcarNota(criterio: number, nota: number) {
  const group = screen.getByRole("group", {
    name: evaluationCriteria[criterio].description,
  });
  fireEvent.click(group.querySelectorAll(".star")[nota - 1]);
}

it("orienta a preencher as notas quando nenhum critério foi avaliado", async () => {
  await renderizar();
  fireEvent.click(screen.getByRole("button", { name: "Avaliar" }));

  expect(screen.getByRole("alert")).toHaveTextContent(
    "Selecione uma nota para cada critério antes de enviar a avaliação.",
  );
  expect(makeEvaluation).not.toHaveBeenCalled();
});

it("bloqueia o envio parcial com uma mensagem sem listar critérios", async () => {
  await renderizar();
  marcarNota(0, 4);
  fireEvent.click(screen.getByRole("button", { name: "Avaliar" }));

  expect(screen.getByRole("alert").textContent).toBe(
    "Selecione uma nota para cada critério antes de enviar a avaliação.",
  );
  expect(makeEvaluation).not.toHaveBeenCalled();
});

it("remove a mensagem ao completar as notas e envia todos os critérios", async () => {
  await renderizar();
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

it("permite reenviar uma avaliação completa existente e preserva comentários", async () => {
  const evaluations = evaluationCriteria.map((criteria) => ({
    id: `avaliacao-${criteria.id}`,
    userId: "ouvinte",
    submissionId: "trabalho",
    evaluationCriteriaId: criteria.id,
    score: 3,
    comments: "Comentário existente",
  }));
  api.getEvaluationByUser.mockResolvedValue(evaluations);
  await renderizar();
  fireEvent.click(screen.getByRole("button", { name: "Avaliar" }));

  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(makeEvaluation).toHaveBeenCalledWith(
    evaluations.map(({ id: _id, ...evaluation }) => evaluation),
  );
});

it("não envia uma avaliação vazia quando a edição não tem critérios", async () => {
  api.getEvaluationCriteria.mockResolvedValue([]);
  await renderizar();

  const button = screen.getByRole("button", { name: "Avaliar" });
  expect(button).toBeDisabled();
  fireEvent.submit(button.closest("form")!);
  expect(makeEvaluation).not.toHaveBeenCalled();
});

it("mantém o envio desabilitado em uma edição inativa", async () => {
  api.getEvaluationContext.mockResolvedValue({
    ...context,
    eventEdition: { ...context.eventEdition, isActive: false },
  });
  await renderizar();
  marcarNota(0, 4);
  marcarNota(1, 5);

  const button = screen.getByRole("button", { name: "Avaliar" });
  expect(button).toBeDisabled();
  fireEvent.submit(button.closest("form")!);
  expect(makeEvaluation).not.toHaveBeenCalled();
});

it("limpa o aviso de critérios incompletos ao trocar de apresentação", async () => {
  const { rerender } = await renderizar();
  fireEvent.click(screen.getByRole("button", { name: "Avaliar" }));
  expect(screen.getByRole("alert")).toBeInTheDocument();
  api.getEvaluationContext.mockResolvedValue({
    ...context,
    presentationId: "outra-apresentacao",
    submissionId: "outro-trabalho",
    title: "Outro trabalho",
  });

  rerender(pagina("outra-apresentacao"));
  await screen.findByText("Outro trabalho");
  expect(api.getEvaluationContext).toHaveBeenLastCalledWith(
    "outra-apresentacao",
  );
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(makeEvaluation).not.toHaveBeenCalled();
});

it("identifica cada critério como obrigatório visualmente e para leitores de tela", async () => {
  await renderizar();
  expect(screen.getByText("Campo obrigatório")).toBeInTheDocument();
  for (const criterion of evaluationCriteria) {
    const group = screen.getByRole("group", { name: criterion.description });
    expect(group).toHaveTextContent("(obrigatório)");
    expect(group.querySelector('[aria-hidden="true"]')).toHaveTextContent("*");
  }
});
