import { beforeEach, describe, expect, it } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ContextType } from "react";
import { AuthContext } from "@/context/AuthProvider/authProvider";
import PresentationCard from "@/components/CardApresentacao/PresentationCard";
import ApresentacaoDetalhes from "@/app/apresentacoes/[id]/page";
import { edicaoApi } from "@/services/edicao";

const mockPush = jest.fn();
const mockRouter = { push: mockPush, back: jest.fn() };
const mockShowAlert = jest.fn();
const mockPresentation = jest.fn();
const mockBookmark = jest.fn();
let mockRestricted: boolean;
jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  useParams: () => ({ id: "presentation-99" }),
}));
jest.mock("@/hooks/useEdicao", () => ({
  useEdicao: () => ({
    Edicao: {
      id: "selected-edition",
      isEvaluationRestrictToLoggedUsers: mockRestricted,
    },
  }),
}));
jest.mock("@/hooks/useAlert", () => ({
  useSweetAlert: () => ({ showAlert: mockShowAlert }),
}));
jest.mock("@/hooks/useApresentacaoPdf", () => ({
  useApresentacaoPdf: () => ({ baixarPdf: jest.fn() }),
}));
jest.mock("@/hooks/usePresentation", () => ({
  usePresentation: () => ({
    getPresentationById: mockPresentation,
    getPresentationBookmark: mockBookmark,
    postPresentationBookmark: jest.fn(),
    deletePresentationBookmark: jest.fn(),
  }),
}));
jest.mock("@/services/edicao", () => ({
  edicaoApi: { getEdicaoById: jest.fn() },
}));

function renderEntry(details: boolean, signed: boolean) {
  const auth = {
    signed,
    user: signed ? { id: "user-99" } : null,
  } as ContextType<typeof AuthContext>;
  return render(
    <AuthContext.Provider value={auth}>
      {details ? (
        <ApresentacaoDetalhes />
      ) : (
        <PresentationCard
          id="presentation-99"
          title="Trabalho para avaliar"
          subtitle="Resumo"
          name="Autora"
          pdfFile=""
          email="autora@example.com"
          advisorName="Orientador"
        />
      )}
    </AuthContext.Provider>,
  );
}

beforeEach(() => {
  jest.resetAllMocks();
  mockRestricted = true;
  mockPresentation.mockResolvedValue({
    id: "presentation-99",
    presentationTime: "2026-10-14T12:00:00Z",
    submission: {
      id: "submission-99",
      eventEditionId: "actual-edition",
      title: "Trabalho para avaliar",
      abstract: "Resumo",
      mainAuthor: { name: "Autora" },
      advisor: { name: "Orientador" },
    },
  });
  mockBookmark.mockResolvedValue({ bookmarked: false });
  jest.mocked(edicaoApi.getEdicaoById).mockImplementation(async () => ({
    isEvaluationRestrictToLoggedUsers: mockRestricted,
  }));
});

describe.each([false, true])(
  "Entrada da avaliação (detalhes=%s)",
  (details) => {
    it.each([false, true])(
      "oferece avaliação a autenticados quando restrição=%s",
      async (restricted) => {
        mockRestricted = restricted;
        renderEntry(details, true);
        const button = await screen.findByRole("button", { name: "Avaliar" });
        fireEvent.click(button);
        expect(mockPush).toHaveBeenCalledWith("/avaliacao/presentation-99");
      },
    );

    it("oferece avaliação a visitantes somente quando a edição permite", async () => {
      mockRestricted = false;
      renderEntry(details, false);
      const button = await screen.findByRole("button", { name: "Avaliar" });
      fireEvent.click(button);
      expect(mockPush).toHaveBeenCalledWith("/avaliacao/presentation-99");
      expect(mockShowAlert).not.toHaveBeenCalled();
      if (details)
        expect(edicaoApi.getEdicaoById).toHaveBeenCalledWith("actual-edition");
    });

    it("oculta avaliação a visitantes nas edições restritas", async () => {
      renderEntry(details, false);
      if (details)
        await waitFor(() =>
          expect(edicaoApi.getEdicaoById).toHaveBeenCalledWith(
            "actual-edition",
          ),
        );
      expect(
        screen.queryByRole("button", { name: "Avaliar" }),
      ).not.toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });
  },
);
