import { describe, expect, it } from "@jest/globals";
import { act, renderHook } from "@testing-library/react";

import { useFormCadastroApresentacao } from "@/components/Forms/CadastroApresentacao/useFormCadastroApresentacao";

const sessaoProposta = "11111111-1111-4111-8111-111111111111";
const sessaoAlocada = "22222222-2222-4222-8222-222222222222";
const mockSubmission = {
  id: "sub-1",
  title: "Título do trabalho",
  abstract: "Resumo do trabalho submetido",
  mainAuthorId: "autor-1",
  advisorId: "33333333-3333-4333-8333-333333333333",
  pdfFile: "slide-salvo.pdf",
  phoneNumber: "71991234567",
  status: "Confirmed",
  proposedPresentationBlockId: sessaoProposta,
  presentationId: "presentation-1",
  block: { id: sessaoAlocada },
};
const mockSessoes = [sessaoProposta, sessaoAlocada].map((id) => ({
  id,
  eventEditionId: "edition-1",
  type: "Presentation",
  startTime: "2026-11-18T13:00:00Z",
  availableSubmissionSlots: 0,
  availablePositionsWithInBlock: [],
}));
const mockUpdateSubmission = jest.fn().mockResolvedValue(true);
const mockSendFile = jest.fn();
const mockRefetch = jest
  .fn()
  .mockResolvedValue({ data: mockSessoes, isError: false });
const mockSetSubmission = jest.fn();
const mockRouterPush = jest.fn();
const mockShowAlert = jest.fn().mockResolvedValue(undefined);

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));
jest.mock("@/context/AuthProvider/authProvider", () => ({
  AuthContext: jest
    .requireActual<typeof import("react")>("react")
    .createContext({
      user: {
        id: "autor-1",
        name: "Autor",
        level: "Default",
        profile: "Presenter",
      },
    }),
}));
jest.mock("@/hooks/useUsers", () => ({
  UserContext: jest
    .requireActual<typeof import("react")>("react")
    .createContext({
      getAdvisors: jest.fn(),
      advisors: [],
      getUsers: jest.fn(),
      userList: [],
      loadingUserList: false,
    }),
}));
jest.mock("@/hooks/useEdicao", () => ({
  useEdicao: () => ({ Edicao: { id: "edition-1", isActive: true } }),
}));
jest.mock("@/hooks/useAlert", () => ({
  useSweetAlert: () => ({ showAlert: mockShowAlert }),
}));
jest.mock("@/hooks/useSubmission", () => ({
  useSubmission: () => ({
    submission: mockSubmission,
    updateSubmissionById: mockUpdateSubmission,
    createSubmission: jest.fn(),
    setSubmission: mockSetSubmission,
  }),
}));
jest.mock("@/hooks/useSubmissionFile", () => ({
  useSubmissionFile: () => ({ sendFile: mockSendFile, deleteFile: jest.fn() }),
}));
jest.mock("@/features/sessoes/hooks/useSessoesQuery", () => ({
  useSessoesQuery: () => ({
    data: mockSessoes,
    sessoes: mockSessoes,
    isLoading: false,
    error: null,
    refetch: mockRefetch,
  }),
}));
jest.mock("@/features/apresentacoes/hooks/useSubmissionsQuery", () => ({
  useSubmissionsQuery: () => ({ data: [] }),
}));

describe("edição de submissão já alocada", () => {
  it("mantém a sessão alocada lotada e envia essa sessão ao salvar, sem usar a proposta antiga", async () => {
    const { result } = renderHook(() => useFormCadastroApresentacao());

    expect(
      result.current.sessoesDisponiveis.map((sessao) => sessao.id),
    ).toEqual([sessaoAlocada]);
    expect(result.current.sessaoAnteriorIndisponivel).toBe(false);

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mockRefetch).toHaveBeenCalledTimes(1);
    expect(mockUpdateSubmission).toHaveBeenCalledWith(
      "sub-1",
      expect.objectContaining({
        proposedPresentationBlockId: sessaoAlocada,
        title: mockSubmission.title,
        status: "Confirmed",
        pdfFile: "slide-salvo.pdf",
      }),
    );
    expect(mockSendFile).not.toHaveBeenCalled();
    expect(mockRouterPush).toHaveBeenCalledWith("/minha-apresentacao");
  });
});
