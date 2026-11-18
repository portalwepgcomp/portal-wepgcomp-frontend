import { expect, it } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";

import RecuperarSenha from "@/app/recuperar-senha/page";
import { UserProvider } from "@/hooks/useUsers";
import { userApi } from "@/services/user";

const mockShowAlert = jest.fn();
const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/hooks/useAlert", () => ({
  useSweetAlert: () => ({ showAlert: mockShowAlert }),
}));

jest.mock("@/hooks/useEdicao", () => ({
  useEdicao: () => ({ Edicao: null }),
}));

it("confirma o envio apenas após a API aceitar a solicitação", async () => {
  const email = "conta@example.test";
  const enviarRecuperacao = jest
    .spyOn(userApi, "resetPasswordSendEmail")
    .mockRejectedValueOnce(new Error("Erro no envio de email."))
    .mockResolvedValueOnce({
      message: "Token de redefinição de senha enviado.",
    });

  try {
    render(
      <UserProvider>
        <RecuperarSenha />
      </UserProvider>,
    );

    const botao = { name: "Enviar link de recuperação" };
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: email },
    });
    fireEvent.click(screen.getByRole("button", botao));

    fireEvent.click(await screen.findByRole("button", botao));
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: "error",
        title: "Erro ao enviar e-mail",
      }),
    );
    expect(enviarRecuperacao).toHaveBeenNthCalledWith(2, { email });
    expect(await screen.findByText("E-mail enviado!")).toBeVisible();
    expect(mockPush).not.toHaveBeenCalled();
  } finally {
    enviarRecuperacao.mockRestore();
  }
});
