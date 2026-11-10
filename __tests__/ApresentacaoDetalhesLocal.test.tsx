import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import type { Presentation } from "@/models/presentation";
import ApresentacaoDetalhes from "@/app/apresentacoes/[id]/page";

const mockGetPresentationById = jest.fn();
const mockGetPresentationBookmark = jest.fn();
const mockGetEdicaoById = jest.fn();
const mockShowAlert = jest.fn();
const mockPresentation = {
  id: "presentation-1",
  presentationBlockId: "block-1",
  positionWithinBlock: 1,
  presentationTime: "2026-11-05T14:00:00.000Z",
  submissionId: "submission-1",
  status: "confirmed",
  startTime: "2026-11-05T14:00:00.000Z",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  submission: {
    eventEditionId: "edition-from-presentation",
    title: "Apresentação de teste",
    abstract: "Resumo de teste",
    mainAuthor: null,
  },
} as unknown as Presentation;

jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "presentation-1" }),
  useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
}));

jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ signed: false }),
}));

jest.mock("@/hooks/useEdicao", () => ({
  useEdicao: () => ({
    Edicao: {
      id: "header-edition",
      location: "Local selecionado no cabeçalho",
    },
  }),
}));

jest.mock("@/hooks/usePresentation", () => ({
  usePresentation: () => ({
    getPresentationById: mockGetPresentationById,
    getPresentationBookmark: mockGetPresentationBookmark,
    postPresentationBookmark: jest.fn(),
    deletePresentationBookmark: jest.fn(),
  }),
}));

jest.mock("@/services/edicao", () => ({
  edicaoApi: {
    getEdicaoById: (...args: unknown[]) => mockGetEdicaoById(...args),
  },
}));

jest.mock("@/hooks/useAlert", () => ({
  useSweetAlert: () => ({ showAlert: mockShowAlert }),
}));

jest.mock("@/hooks/useApresentacaoPdf", () => ({
  useApresentacaoPdf: () => ({ baixarPdf: jest.fn(), baixandoPdf: false }),
}));

jest.mock("@/components/UI/Banner", () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <div>{title}</div>,
}));

jest.mock("@/components/UI/Button", () => ({
  __esModule: true,
  default: ({
    children,
    onClick,
    disabled,
  }: {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/UI/Spinner", () => ({
  __esModule: true,
  default: () => <div>Carregando</div>,
}));

describe("local da edição nos detalhes da apresentação", () => {
  let openSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPresentationById.mockResolvedValue(mockPresentation);
    mockGetEdicaoById.mockResolvedValue({
      id: "edition-from-presentation",
      location: "Auditório da edição da apresentação",
    });
    openSpy = jest.spyOn(window, "open").mockImplementation(() => null);
  });

  afterEach(() => {
    openSpy.mockRestore();
  });

  it("usa a edição da apresentação nos detalhes e no Google Agenda", async () => {
    render(<ApresentacaoDetalhes />);

    expect(
      await screen.findByText("Auditório da edição da apresentação"),
    ).toBeInTheDocument();
    expect(mockGetEdicaoById).toHaveBeenCalledWith("edition-from-presentation");
    expect(
      screen.queryByText("Local selecionado no cabeçalho"),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Agendar" }));

    await waitFor(() => expect(openSpy).toHaveBeenCalled());
    const calendarUrl = new URL(openSpy.mock.calls[0][0] as string);
    expect(calendarUrl.searchParams.get("location")).toBe(
      "Auditório da edição da apresentação",
    );
  });

  it("mantém o fallback quando a edição não tem local cadastrado", async () => {
    mockGetEdicaoById.mockResolvedValue({
      id: "edition-from-presentation",
      location: "",
    });

    render(<ApresentacaoDetalhes />);

    expect(await screen.findByText("Local não informado")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Agendar" }));

    await waitFor(() => expect(openSpy).toHaveBeenCalled());
    const calendarUrl = new URL(openSpy.mock.calls[0][0] as string);
    expect(calendarUrl.searchParams.get("location")).toBe(
      "Local não informado",
    );
  });
});
