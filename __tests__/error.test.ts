import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { describe, expect, it } from "@jest/globals";
import { getErrorMessage } from "@/lib/error";

describe("getErrorMessage", () => {
  const config = { headers: {} } as InternalAxiosRequestConfig;

  it("prioriza mensagens específicas de details no contrato de validação", () => {
    const error = new AxiosError("Request failed with status code 400");
    error.response = {
      data: {
        error: "VALIDATION_ERROR",
        message: "Dados inválidos.",
        details: [
          {
            field: "duration",
            messages: ["A sessão não pode durar mais que 12 horas"],
          },
        ],
      },
      status: 400,
      statusText: "Bad Request",
      headers: {},
      config,
    };

    expect(getErrorMessage(error)).toBe(
      "A sessão não pode durar mais que 12 horas",
    );
  });

  it("mantém a mensagem do envelope quando não há details", () => {
    const error = new AxiosError("Request failed with status code 400");
    error.response = {
      data: { message: "Dados inválidos." },
      status: 400,
      statusText: "Bad Request",
      headers: {},
      config,
    };

    expect(getErrorMessage(error)).toBe("Dados inválidos.");
  });
});