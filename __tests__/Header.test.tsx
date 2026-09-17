import { describe, expect, it } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";

import Header from "@/components/Header/Header";
import { AuthContext } from "@/context/AuthProvider/authProvider";

const mockListEdicao = jest.fn();
const mockGetEdicaoByYear = jest.fn();
const mockSetSelectEdition = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => "/home",
}));

jest.mock("@/hooks/useEdicao", () => ({
  useEdicao: () => ({
    listEdicao: mockListEdicao,
    edicoesList: [
      {
        id: "edicao-2026",
        name: "WEPGCOMP 2026",
        startDate: "2026-10-15T12:00:00.000Z",
        isActive: true,
      },
    ],
    getEdicaoByYear: mockGetEdicaoByYear,
    Edicao: {
      id: "edicao-2026",
      name: "WEPGCOMP 2026",
      startDate: "2026-10-15T12:00:00.000Z",
      isActive: true,
    },
  }),
}));

jest.mock("@/hooks/useActiveEdition", () => ({
  useActiveEdition: () => ({
    setSelectEdition: mockSetSelectEdition,
    selectEdition: {
      year: "2026",
      isActive: true,
    },
  }),
}));

jest.mock("@/components/Perfil/usePerfilCertificado", () => ({
  usePerfilCertificado: () => ({
    certificateDownload: jest.fn(),
  }),
}));

function renderHeader() {
  return render(
    <AuthContext.Provider
      value={{
        user: {
          id: "usuario-1",
          name: "Administrador de Teste",
          profile: "Listener",
          level: "Admin",
          isActive: true,
        },
        signed: true,
        singIn: async () => undefined,
        logout: () => undefined,
        isValidatingToken: false,
        isLoggingOut: false,
      }}
    >
      <Header />
    </AuthContext.Provider>,
  );
}

describe("Header no mobile", () => {
  it("exibe o ícone com o texto Início e alterna a navegação", () => {
    renderHeader();

    const menuButton = screen.getByRole("button", {
      name: "Alternar navegação",
    });

    expect(menuButton).toHaveTextContent("Início");
    expect(menuButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(menuButton);

    expect(menuButton).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(screen.getByRole("link", { name: "Contato" }));

    expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });

  it("permite que o menu compacto do perfil use a largura disponível", () => {
    renderHeader();

    const profileButtons = screen.getAllByRole("button", {
      name: "Menu da conta: Administrador de Teste",
    });
    const compactProfileButton = profileButtons.find((button) =>
      button.parentElement?.classList.contains("w-full"),
    );

    expect(compactProfileButton).toBeDefined();
    expect(compactProfileButton).toHaveClass("h-9");
    expect(compactProfileButton?.parentElement).toHaveClass(
      "w-full",
      "min-w-0",
    );
    expect(
      compactProfileButton?.querySelector('span[aria-hidden="true"]'),
    ).toHaveClass("h-6", "w-6");
  });
});
