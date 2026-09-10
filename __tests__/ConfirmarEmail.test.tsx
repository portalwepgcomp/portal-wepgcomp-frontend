import { afterAll, describe, expect, it } from "@jest/globals";
import { AxiosError, AxiosResponse } from "axios";
import { render, screen, waitFor } from "@testing-library/react";

import { ConfirmarEmail } from "@/components/ConfirmarEmail/ConfirmarEmail";
import { userApi } from "@/services/user";

jest.mock("@/services/user", () => ({
  userApi: {
    confirmEmail: jest.fn(),
  },
}));

const confirmEmailMock = jest.mocked(userApi.confirmEmail);

const consoleErrorSpy = jest
  .spyOn(console, "error")
  .mockImplementation(() => {});

afterAll(() => consoleErrorSpy.mockRestore());

function erroDaApi(message: string) {
  return new AxiosError(
    "Request failed",
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    { status: 400, data: { message } } as AxiosResponse,
  );
}

describe("Componente ConfirmarEmail", () => {
  it("deve confirmar o e-mail enviando o token recebido no link", async () => {
    confirmEmailMock.mockResolvedValue({
      message: "E-mail confirmado com sucesso.",
    });

    render(<ConfirmarEmail token="token-valido" />);

    expect(await screen.findByText("E-mail confirmado!")).toBeInTheDocument();
    expect(confirmEmailMock).toHaveBeenCalledWith("token-valido");
    expect(confirmEmailMock).toHaveBeenCalledTimes(1);
  });

  it("deve exibir a mensagem da API quando o token for inválido ou expirado", async () => {
    confirmEmailMock.mockRejectedValue(erroDaApi("Token inválido ou expirado."));

    render(<ConfirmarEmail token="token-expirado" />);

    expect(
      await screen.findByText("Não foi possível confirmar"),
    ).toBeInTheDocument();
    expect(screen.getByText("Token inválido ou expirado.")).toBeInTheDocument();
  });

  it("deve exibir a mensagem da API quando o token já tiver sido utilizado", async () => {
    confirmEmailMock.mockRejectedValue(erroDaApi("Token já utilizado."));

    render(<ConfirmarEmail token="token-usado" />);

    expect(await screen.findByText("Token já utilizado.")).toBeInTheDocument();
  });

  it("não deve chamar a API quando o link vier sem token", async () => {
    render(<ConfirmarEmail />);

    expect(
      await screen.findByText("Não foi possível confirmar"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/link de confirmação está incompleto/i),
    ).toBeInTheDocument();
    await waitFor(() => expect(confirmEmailMock).not.toHaveBeenCalled());
  });
});
