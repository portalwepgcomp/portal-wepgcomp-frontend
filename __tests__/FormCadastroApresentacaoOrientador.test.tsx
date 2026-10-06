import { describe, expect, it } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useContext } from "react";
import { UserContext } from "@/hooks/useUsers";
import type { User } from "@/models/user";

import { FormCadastroApresentacao } from "@/components/Forms/CadastroApresentacao/FormCadastroApresentacao";

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

jest.mock("@/hooks/useApresentacaoPdf", () => ({
  useApresentacaoPdf: () => ({ baixarPdf: jest.fn(), baixandoPdf: false }),
}));

const outroOrientador = "44444444-4444-4444-8444-444444444444";
const professores: User[] = [mockSubmission.advisorId, outroOrientador].map(
  (id, index) => ({
    id,
    name: index === 0 ? "Orientador vinculado" : "Novo orientador",
    email: `orientador${index}@example.test`,
    password: "senha-de-teste",
    profile: "Professor",
    level: "Default",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    deletedAt: new Date("2026-01-01"),
    isActive: true,
    isTeacherActive: true,
    isPresenterActive: false,
    hasSubmission: false,
  }),
);

function Formulario({ advisors }: { advisors: User[] }) {
  const contexto = useContext(UserContext);
  return (
    <UserContext.Provider value={{ ...contexto, advisors }}>
      <FormCadastroApresentacao />
    </UserContext.Provider>
  );
}

describe("orientador exibido no formulário de edição", () => {
  it.each([false, true])(
    "exibe e envia o professor vinculado com carregamento assíncrono=%s",
    async (assincrono) => {
      const { rerender } = render(
        <Formulario advisors={assincrono ? [] : professores} />,
      );
      const select = screen.getByRole("combobox", {
        name: /Professor Orientador/i,
      });

      if (assincrono) {
        expect(select).not.toHaveTextContent("Orientador vinculado");
        rerender(<Formulario advisors={professores} />);
      }

      await waitFor(() => expect(select).toHaveValue(mockSubmission.advisorId));
      expect(
        (
          screen.getByRole("option", {
            name: "Orientador vinculado",
          }) as HTMLOptionElement
        ).selected,
      ).toBe(true);
      fireEvent.change(
        screen.getByRole("textbox", { name: /Título da Pesquisa/i }),
        {
          target: { value: "Título alterado" },
        },
      );
      fireEvent.click(
        screen.getByRole("button", { name: /Salvar Alterações/i }),
      );
      await waitFor(() =>
        expect(mockUpdateSubmission).toHaveBeenCalledWith(
          "sub-1",
          expect.objectContaining({
            advisorId: mockSubmission.advisorId,
            title: "Título alterado",
          }),
        ),
      );
    },
  );

  it("preserva a alteração manual do professor e outros campos após atualizar as opções", async () => {
    const { rerender } = render(<Formulario advisors={professores} />);
    const select = screen.getByRole("combobox", {
      name: /Professor Orientador/i,
    });
    fireEvent.change(select, { target: { value: outroOrientador } });
    fireEvent.change(
      screen.getByRole("textbox", { name: /Título da Pesquisa/i }),
      {
        target: { value: "Título alterado" },
      },
    );

    rerender(<Formulario advisors={[...professores].reverse()} />);
    expect(select).toHaveValue(outroOrientador);
    expect(
      screen.getByRole("textbox", { name: /Título da Pesquisa/i }),
    ).toHaveValue("Título alterado");
    fireEvent.click(screen.getByRole("button", { name: /Salvar Alterações/i }));
    await waitFor(() =>
      expect(mockUpdateSubmission).toHaveBeenCalledWith(
        "sub-1",
        expect.objectContaining({
          advisorId: outroOrientador,
          title: "Título alterado",
        }),
      ),
    );
  });
});
