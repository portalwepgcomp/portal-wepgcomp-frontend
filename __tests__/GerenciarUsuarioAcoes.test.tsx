import { afterEach, describe, expect, it } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import GerenciarUsuarioAcoes from "@/components/GerenciarUsuario/GerenciarUsuarioAcoes";
import { User, UserProfile } from "@/models/user";

const showAlertMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/hooks/useAlert", () => ({
  useSweetAlert: () => ({ showAlert: showAlertMock }),
}));

const admin: UserProfile = {
  id: "admin-1",
  name: "Admin",
  profile: "Professor",
  level: "Admin",
  isActive: true,
};

const apresentador = {
  id: "user-1",
  name: "Adriano Humberto de Oliveira Maia",
  email: "adriano.maia@ufba.br",
  profile: "Presenter",
  level: "Default",
  isActive: true,
  isPresenterActive: false,
  isTeacherActive: false,
} as User;

function renderizar(onExcluir = () => {}) {
  return render(
    <GerenciarUsuarioAcoes
      usuario={apresentador}
      usuarioAtual={admin}
      edicaoAtiva
      carregando={false}
      onExcluir={onExcluir}
      onAprovarProfessor={() => {}}
      onAprovarApresentador={() => {}}
      onPromoverAdmin={() => {}}
      onRebaixar={() => {}}
    />,
  );
}

afterEach(() => {
  showAlertMock.mockReset();
});

describe("GerenciarUsuarioAcoes", () => {
  it("deve rotular cada botão com o texto da ação", () => {
    renderizar();

    for (const rotulo of [
      "Excluir Usuário",
      "Aprovar Apresentador",
      "Editar usuário",
      "Promover a Admin",
    ]) {
      expect(screen.getByRole("button", { name: rotulo })).toHaveTextContent(
        rotulo,
      );
    }
  });

  it("não deve substituir o rótulo por um marcador sem significado", () => {
    const { container } = renderizar();

    expect(container.textContent).not.toContain("•");

    for (const botao of Array.from(container.querySelectorAll("button"))) {
      expect(botao.textContent?.trim()).not.toBe("");
    }
  });

  it("deve reservar o vermelho apenas para a exclusão", () => {
    const { container } = renderizar();

    const vermelhos = Array.from(container.querySelectorAll("button")).filter(
      (b) => b.className.includes("bg-red-"),
    );

    expect(vermelhos).toHaveLength(1);
    expect(vermelhos[0]).toHaveTextContent("Excluir Usuário");
  });

  it("deve pedir confirmação antes de excluir, sem excluir de imediato", () => {
    const onExcluir = jest.fn();
    showAlertMock.mockResolvedValue({ isConfirmed: false });

    renderizar(onExcluir);
    fireEvent.click(screen.getByRole("button", { name: "Excluir Usuário" }));

    expect(showAlertMock).toHaveBeenCalledTimes(1);
    expect(onExcluir).not.toHaveBeenCalled();
  });

  it("deve nomear o usuário na confirmação", () => {
    showAlertMock.mockResolvedValue({ isConfirmed: false });

    renderizar();
    fireEvent.click(screen.getByRole("button", { name: "Excluir Usuário" }));

    expect(showAlertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: "warning",
        showCancelButton: true,
        text: expect.stringContaining(apresentador.name),
      }),
    );
  });

  it("deve excluir somente após o usuário confirmar", async () => {
    const onExcluir = jest.fn();
    showAlertMock.mockResolvedValue({ isConfirmed: true });

    renderizar(onExcluir);
    fireEvent.click(screen.getByRole("button", { name: "Excluir Usuário" }));

    await waitFor(() => expect(onExcluir).toHaveBeenCalledWith("user-1"));
  });

  it("não deve excluir quando o usuário cancela", async () => {
    const onExcluir = jest.fn();
    showAlertMock.mockResolvedValue({ isConfirmed: false });

    renderizar(onExcluir);
    fireEvent.click(screen.getByRole("button", { name: "Excluir Usuário" }));

    await waitFor(() => expect(showAlertMock).toHaveBeenCalled());
    expect(onExcluir).not.toHaveBeenCalled();
  });
});
