import { beforeEach, describe, expect, it } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AxiosError } from "axios";
import type { ContextType } from "react";
import Avaliacao from "@/app/avaliacao/[id]/page";
import { AuthContext } from "@/context/AuthProvider/authProvider";
import { EvaluationProvider } from "@/hooks/useEvaluation";
import type { EvaluationContextData } from "@/models/evaluation";
import { evaluationApi } from "@/services/evaluation";

const mockPush = jest.fn();
const mockRouter = { push: mockPush };
const mockShowAlert = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => mockRouter }));
jest.mock("@/hooks/useAlert", () => ({
  useSweetAlert: () => ({ showAlert: mockShowAlert }),
}));
jest.mock("@/services/evaluation", () => ({
  evaluationApi: {
    getEvaluationContext: jest.fn(),
    getEvaluationByUser: jest.fn(),
    getEvaluationCriteria: jest.fn(),
    makeEvaluation: jest.fn(),
    makeAnonymousEvaluation: jest.fn(),
  },
}));
const api = jest.mocked(evaluationApi);
const criteria = [
  {
    id: "criterion-1",
    title: "Clareza",
    description: "Clareza da apresentação",
  },
  {
    id: "criterion-2",
    title: "Conteúdo",
    description: "Conteúdo da apresentação",
  },
];
const context: EvaluationContextData = {
  presentationId: "presentation-99",
  submissionId: "submission-99",
  title: "Trabalho para avaliação",
  authorName: "Autora de Teste",
  eventEdition: {
    id: "actual-edition",
    name: "Edição da apresentação",
    isActive: true,
    isEvaluationRestrictToLoggedUsers: false,
  },
  criteria,
};

function renderPage(authenticated = false, validating = false) {
  const auth: ContextType<typeof AuthContext> = {
    user: authenticated
      ? {
          id: "user-99",
          name: "Usuária",
          level: "Default",
          profile: "Listener",
          isActive: true,
        }
      : null,
    signed: authenticated,
    isValidatingToken: validating,
    isLoggingOut: false,
    singIn: jest.fn(async () => {}),
    logout: jest.fn(),
    updateUserProfile: jest.fn(),
  };
  return render(
    <AuthContext.Provider value={auth}>
      <EvaluationProvider>
        <Avaliacao params={{ id: "presentation-99" }} />
      </EvaluationProvider>
    </AuthContext.Provider>,
  );
}

async function preencherNotas() {
  for (const criterion of criteria) {
    const group = await screen.findByRole("group", {
      name: criterion.description,
    });
    fireEvent.click(group.querySelectorAll(".star")[2]);
  }
}
function preencherVisitante(email = "VISITANTE@example.com") {
  fireEvent.change(screen.getByLabelText("Nome"), {
    target: { value: " Visitante " },
  });
  fireEvent.change(screen.getByLabelText("E-mail"), {
    target: { value: email },
  });
}
function enviar() {
  fireEvent.submit(
    screen.getByRole("button", { name: "Avaliar" }).closest("form")!,
  );
}

beforeEach(() => {
  jest.resetAllMocks();
  api.getEvaluationContext.mockResolvedValue(context);
  api.getEvaluationCriteria.mockResolvedValue(criteria);
  api.getEvaluationByUser.mockResolvedValue([]);
  api.makeEvaluation.mockResolvedValue([]);
  api.makeAnonymousEvaluation.mockResolvedValue({ message: "ok" });
  mockShowAlert.mockResolvedValue({ isConfirmed: true });
});

describe("Avaliação anônima", () => {
  it("permite visitante sem consultar avaliações privadas nem exigir sessão", async () => {
    renderPage();
    expect(
      await screen.findByText("Trabalho para avaliação"),
    ).toBeInTheDocument();
    expect(screen.getByText("Avaliação sem login")).toBeInTheDocument();
    expect(api.getEvaluationContext).toHaveBeenCalledWith("presentation-99");
    expect(api.getEvaluationByUser).not.toHaveBeenCalled();
    expect(api.getEvaluationCriteria).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
    preencherVisitante();
    await preencherNotas();
    enviar();
    await waitFor(() =>
      expect(api.makeAnonymousEvaluation).toHaveBeenCalledWith({
        name: "Visitante",
        email: "visitante@example.com",
        evaluations: criteria.map((criterion) => ({
          evaluationCriteriaId: criterion.id,
          submissionId: "submission-99",
          score: 3,
        })),
      }),
    );
    expect(api.makeEvaluation).not.toHaveBeenCalled();
    expect(mockShowAlert).toHaveBeenCalledTimes(1);
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ icon: "success" }),
    );
    expect(mockPush).toHaveBeenCalledWith("/home");
  });

  it("exige login para visitantes em edição restrita", async () => {
    api.getEvaluationContext.mockResolvedValue({
      ...context,
      eventEdition: {
        ...context.eventEdition,
        isEvaluationRestrictToLoggedUsers: true,
      },
      criteria: [],
    });
    renderPage();
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/login"));
    expect(screen.queryByLabelText("Nome")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Avaliar" }),
    ).not.toBeInTheDocument();
    expect(api.getEvaluationByUser).not.toHaveBeenCalled();
    expect(api.makeAnonymousEvaluation).not.toHaveBeenCalled();
  });

  it.each([true, false])(
    "mantém a avaliação autenticada quando restrição=%s",
    async (restricted) => {
      api.getEvaluationContext.mockResolvedValue({
        ...context,
        eventEdition: {
          ...context.eventEdition,
          isEvaluationRestrictToLoggedUsers: restricted,
        },
        criteria: restricted ? [] : criteria,
      });
      renderPage(true);
      await preencherNotas();
      expect(screen.queryByLabelText("E-mail")).not.toBeInTheDocument();
      expect(api.getEvaluationCriteria).toHaveBeenCalledWith("actual-edition");
      expect(api.getEvaluationByUser).toHaveBeenCalledWith("user-99");
      enviar();
      await waitFor(() =>
        expect(api.makeEvaluation).toHaveBeenCalledWith(
          criteria.map((criterion) => ({
            userId: "user-99",
            evaluationCriteriaId: criterion.id,
            submissionId: "submission-99",
            score: 3,
          })),
        ),
      );
      expect(api.makeAnonymousEvaluation).not.toHaveBeenCalled();
    },
  );

  it("carrega as notas anteriores apenas do usuário e trabalho atuais", async () => {
    api.getEvaluationByUser.mockResolvedValue([
      {
        userId: "user-99",
        submissionId: "submission-99",
        evaluationCriteriaId: "criterion-1",
        score: 4,
      },
      {
        userId: "user-99",
        submissionId: "submission-99",
        evaluationCriteriaId: "criterion-2",
        score: 5,
      },
      {
        userId: "user-99",
        submissionId: "other-submission",
        evaluationCriteriaId: "criterion-1",
        score: 1,
      },
    ]);
    renderPage(true);
    await screen.findByText("Trabalho para avaliação");
    enviar();
    await waitFor(() =>
      expect(api.makeEvaluation).toHaveBeenCalledWith([
        expect.objectContaining({
          evaluationCriteriaId: "criterion-1",
          score: 4,
        }),
        expect.objectContaining({
          evaluationCriteriaId: "criterion-2",
          score: 5,
        }),
      ]),
    );
  });

  it("aguarda a validação da sessão sem redirecionar visitantes prematuramente", () => {
    renderPage(false, true);
    expect(api.getEvaluationContext).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("não envia critérios incompletos", async () => {
    renderPage();
    await screen.findByText("Trabalho para avaliação");
    preencherVisitante();
    const group = screen.getByRole("group", { name: criteria[0].description });
    fireEvent.click(group.querySelectorAll(".star")[2]);
    enviar();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Selecione uma nota para cada critério antes de enviar a avaliação.",
    );
    expect(api.makeAnonymousEvaluation).not.toHaveBeenCalled();
  });

  it("valida nome e e-mail do visitante", async () => {
    renderPage();
    await preencherNotas();
    enviar();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Informe seu nome",
    );
    preencherVisitante("invalido");
    enviar();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Informe um e-mail válido",
    );
    expect(api.makeAnonymousEvaluation).not.toHaveBeenCalled();
  });

  it("preserva o formulário e não confirma sucesso após falha no envio", async () => {
    api.makeAnonymousEvaluation.mockRejectedValue(
      new AxiosError("Network Error", "ERR_NETWORK"),
    );
    renderPage();
    await preencherNotas();
    preencherVisitante();
    enviar();
    await waitFor(() =>
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ icon: "error" }),
      ),
    );
    expect(mockShowAlert).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Nome")).toHaveValue(" Visitante ");
    expect(screen.getByRole("button", { name: "Avaliar" })).toBeEnabled();
  });

  it("não permite enviar em edição inativa", async () => {
    api.getEvaluationContext.mockResolvedValue({
      ...context,
      eventEdition: { ...context.eventEdition, isActive: false },
    });
    renderPage();
    await screen.findByText("Trabalho para avaliação");
    expect(screen.getByRole("button", { name: "Avaliar" })).toBeDisabled();
    enviar();
    expect(api.makeAnonymousEvaluation).not.toHaveBeenCalled();
  });

  it("mostra erro de carregamento sem oferecer um formulário indevido", async () => {
    api.getEvaluationContext.mockRejectedValue(
      new Error("Apresentação indisponível"),
    );
    renderPage();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Apresentação indisponível",
    );
    expect(
      screen.queryByRole("button", { name: "Avaliar" }),
    ).not.toBeInTheDocument();
  });
});
