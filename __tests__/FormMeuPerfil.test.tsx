import { beforeEach, describe, expect, it } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { FormMeuPerfil } from "@/components/Forms/MeuPerfil/FormMeuPerfil";
import { userApi } from "@/services/user";

const mockUpdateUserProfile = jest.fn();
const mockShowAlert = jest.fn();

jest.mock("@/services/user", () => ({
  userApi: {
    getMe: jest.fn(),
    updateMe: jest.fn(),
    requestProfileChange: jest.fn(),
    cancelProfileChange: jest.fn(),
  },
}));

jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ updateUserProfile: mockUpdateUserProfile }),
}));

jest.mock("@/hooks/useAlert", () => ({
  useSweetAlert: () => ({ showAlert: mockShowAlert }),
}));

const getMe = userApi.getMe as jest.Mock;
const updateMe = userApi.updateMe as jest.Mock;
const requestProfileChange = userApi.requestProfileChange as jest.Mock;
const cancelProfileChange = userApi.cancelProfileChange as jest.Mock;

const usuario = {
  id: "usuario-1",
  name: "Maria Silva",
  email: "maria@ufba.br",
  profile: "Presenter",
  level: "Default",
  registrationNumber: "2021001",
  registrationNumberType: "MATRICULA",
  linkLattes: "",
};

describe("FormMeuPerfil", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    getMe.mockResolvedValue(usuario);
  });

  it("carrega os dados do usuário com e-mail e perfil somente leitura", async () => {
    render(<FormMeuPerfil />);

    expect(await screen.findByDisplayValue("Maria Silva")).toBeTruthy();
    expect(
      (screen.getByDisplayValue("maria@ufba.br") as HTMLInputElement).disabled,
    ).toBe(true);
    expect(screen.getByText("Apresentador")).toBeTruthy();
  });

  it("envia apenas os campos alterados e atualiza a sessão", async () => {
    updateMe.mockResolvedValue({ ...usuario, name: "Maria Souza" });
    render(<FormMeuPerfil />);

    fireEvent.change(await screen.findByDisplayValue("Maria Silva"), {
      target: { value: "Maria Souza" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await waitFor(() =>
      expect(updateMe).toHaveBeenCalledWith({ name: "Maria Souza" }),
    );
    expect(mockUpdateUserProfile).toHaveBeenCalledWith({
      name: "Maria Souza",
    });
    await waitFor(() =>
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ icon: "success" }),
      ),
    );
  });

  it("mostra erro e não altera a sessão quando a API falha", async () => {
    updateMe.mockRejectedValue(new Error("falhou"));
    render(<FormMeuPerfil />);

    fireEvent.change(await screen.findByDisplayValue("Maria Silva"), {
      target: { value: "Maria Souza" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await waitFor(() =>
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ icon: "error" }),
      ),
    );
    expect(mockUpdateUserProfile).not.toHaveBeenCalled();
  });

  describe("solicitação de troca de perfil", () => {
    it("não oferece o perfil atual e envia o perfil escolhido", async () => {
      requestProfileChange.mockResolvedValue({
        ...usuario,
        requestedProfile: "Listener",
        requestedSubprofile: "Master",
        profileRequestedAt: "2026-10-08T12:00:00.000Z",
      });
      render(<FormMeuPerfil />);

      const select = (await screen.findByLabelText(
        "Solicitar troca para",
      )) as HTMLSelectElement;
      const opcoes = Array.from(select.options).map((o) => o.value);
      expect(opcoes).not.toContain("Presenter");
      expect(opcoes).toContain("Professor");

      fireEvent.change(select, { target: { value: "Listener:Master" } });
      fireEvent.click(
        screen.getByRole("button", { name: "Solicitar troca de perfil" }),
      );

      await waitFor(() =>
        expect(requestProfileChange).toHaveBeenCalledWith({
          profile: "Listener",
          subprofile: "Master",
        }),
      );
      expect(
        await screen.findByText(/aguardando aprovação de um administrador/),
      ).toBeTruthy();
      expect(screen.getByText("Ouvinte (Mestrando)")).toBeTruthy();
    });

    it("permite cancelar uma solicitação pendente", async () => {
      getMe.mockResolvedValue({ ...usuario, requestedProfile: "Professor" });
      cancelProfileChange.mockResolvedValue(usuario);
      render(<FormMeuPerfil />);

      fireEvent.click(
        await screen.findByRole("button", { name: "Cancelar solicitação" }),
      );

      await waitFor(() => expect(cancelProfileChange).toHaveBeenCalled());
      expect(
        await screen.findByRole("button", {
          name: "Solicitar troca de perfil",
        }),
      ).toBeTruthy();
    });

    it("bloqueia perfis da UFBA para e-mail externo", async () => {
      getMe.mockResolvedValue({
        ...usuario,
        email: "maria@gmail.com",
        profile: "Listener",
        subprofile: "Other",
      });
      render(<FormMeuPerfil />);

      const select = (await screen.findByLabelText(
        "Solicitar troca para",
      )) as HTMLSelectElement;
      const professor = Array.from(select.options).find(
        (o) => o.value === "Professor",
      );
      expect(professor?.disabled).toBe(true);
    });
  });

  describe("matrícula", () => {
    const apresentadorAprovado = { ...usuario, isPresenterActive: true };

    it("pede confirmação e avisa que volta para aprovação", async () => {
      getMe.mockResolvedValue(apresentadorAprovado);
      mockShowAlert.mockResolvedValue({ isConfirmed: true });
      updateMe.mockResolvedValue({
        ...apresentadorAprovado,
        registrationNumber: "2021002",
        isPresenterActive: false,
      });
      render(<FormMeuPerfil />);

      expect(
        await screen.findByText(
          "Alterar a matrícula exige nova aprovação de um administrador.",
        ),
      ).toBeTruthy();
      fireEvent.change(screen.getByLabelText(/Matrícula/), {
        target: { value: "2021002" },
      });
      fireEvent.click(
        screen.getByRole("button", { name: "Salvar alterações" }),
      );

      await waitFor(() =>
        expect(updateMe).toHaveBeenCalledWith({
          registrationNumber: "2021002",
        }),
      );
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Alterar matrícula?" }),
      );
      await waitFor(() =>
        expect(mockShowAlert).toHaveBeenCalledWith(
          expect.objectContaining({ icon: "info" }),
        ),
      );
    });

    it("não salva quando a confirmação é cancelada", async () => {
      getMe.mockResolvedValue(apresentadorAprovado);
      mockShowAlert.mockResolvedValue({ isConfirmed: false });
      render(<FormMeuPerfil />);

      fireEvent.change(await screen.findByLabelText(/Matrícula/), {
        target: { value: "2021002" },
      });
      fireEvent.click(
        screen.getByRole("button", { name: "Salvar alterações" }),
      );

      await waitFor(() =>
        expect(mockShowAlert).toHaveBeenCalledWith(
          expect.objectContaining({ title: "Alterar matrícula?" }),
        ),
      );
      expect(updateMe).not.toHaveBeenCalled();
    });

    it("usa CPF com máscara para ouvinte Outro e envia só os dígitos", async () => {
      getMe.mockResolvedValue({
        ...usuario,
        profile: "Listener",
        subprofile: "Other",
        registrationNumber: "12345678901",
        registrationNumberType: "CPF",
      });
      updateMe.mockResolvedValue({
        ...usuario,
        profile: "Listener",
        registrationNumber: "98765432100",
      });
      render(<FormMeuPerfil />);

      const cpf = await screen.findByDisplayValue("123.456.789-01");
      fireEvent.change(cpf, { target: { value: "98765432100" } });
      expect(screen.getByDisplayValue("987.654.321-00")).toBeTruthy();
      fireEvent.click(
        screen.getByRole("button", { name: "Salvar alterações" }),
      );

      await waitFor(() =>
        expect(updateMe).toHaveBeenCalledWith({
          registrationNumber: "98765432100",
        }),
      );
    });

    it("valida o formato antes de enviar", async () => {
      render(<FormMeuPerfil />);

      fireEvent.change(await screen.findByLabelText(/Matrícula/), {
        target: { value: "12345678901234" },
      });
      fireEvent.click(
        screen.getByRole("button", { name: "Salvar alterações" }),
      );

      expect(
        await screen.findByText(
          "Matrícula inválida. Use somente dígitos (até 13).",
        ),
      ).toBeTruthy();
      expect(updateMe).not.toHaveBeenCalled();
    });
  });
});
