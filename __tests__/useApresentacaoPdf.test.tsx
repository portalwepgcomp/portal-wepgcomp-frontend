import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import { AxiosError, AxiosResponse } from "axios";
import { renderHook, waitFor } from "@testing-library/react";

import { useApresentacaoPdf } from "@/hooks/useApresentacaoPdf";
import { submissionApi } from "@/services/submission";

const showAlertMock = jest.fn();

jest.mock("@/services/submission", () => ({
  submissionApi: {
    downloadPdf: jest.fn(),
  },
}));

jest.mock("@/hooks/useAlert", () => ({
  useSweetAlert: () => ({ showAlert: showAlertMock }),
}));

const downloadPdfMock = jest.mocked(submissionApi.downloadPdf);

const consoleErrorSpy = jest
  .spyOn(console, "error")
  .mockImplementation(() => {});

afterAll(() => consoleErrorSpy.mockRestore());

const criarObjectURL = jest.fn(() => "blob:fake-url");
const revokeObjectURL = jest.fn();
const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, "click");

beforeEach(() => {
  showAlertMock.mockReset();
  Object.defineProperty(window.URL, "createObjectURL", {
    value: criarObjectURL,
    writable: true,
  });
  Object.defineProperty(window.URL, "revokeObjectURL", {
    value: revokeObjectURL,
    writable: true,
  });
  clickSpy.mockImplementation(() => {});
});

function erroDaApi(status: number, message: string) {
  return new AxiosError(
    "Request failed",
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    {
      status,
      data: new Blob([JSON.stringify({ message })], {
        type: "application/json",
      }),
    } as AxiosResponse,
  );
}

describe("Hook useApresentacaoPdf", () => {
  it("deve baixar o PDF pelo id da submissão, com o nome do arquivo", async () => {
    downloadPdfMock.mockResolvedValue(new Blob(["pdf"]));

    const { result } = renderHook(() => useApresentacaoPdf());
    await result.current.baixarPdf("sub-1", "slides.pdf");

    expect(downloadPdfMock).toHaveBeenCalledWith("sub-1");
    expect(criarObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:fake-url");
    expect(showAlertMock).not.toHaveBeenCalled();
  });

  it("deve usar um nome padrão quando a submissão não tem nome de arquivo", async () => {
    downloadPdfMock.mockResolvedValue(new Blob(["pdf"]));
    const links: string[] = [];
    clickSpy.mockImplementation(function (this: HTMLAnchorElement) {
      links.push(this.download);
    });

    const { result } = renderHook(() => useApresentacaoPdf());
    await result.current.baixarPdf("sub-2");

    expect(links).toEqual(["apresentacao-sub-2.pdf"]);
  });

  it("deve extrair o nome do arquivo quando pdfFile vem como URL completa", async () => {
    downloadPdfMock.mockResolvedValue(new Blob(["pdf"]));
    const links: string[] = [];
    clickSpy.mockImplementation(function (this: HTMLAnchorElement) {
      links.push(this.download);
    });

    const { result } = renderHook(() => useApresentacaoPdf());
    await result.current.baixarPdf(
      "sub-5",
      "http://localhost:3001/uploads/slides%20finais.pdf",
    );

    expect(links).toEqual(["slides finais.pdf"]);
  });

  it("não deve chamar a API quando não há submissão associada", async () => {
    const { result } = renderHook(() => useApresentacaoPdf());
    await result.current.baixarPdf(undefined, "slides.pdf");

    expect(downloadPdfMock).not.toHaveBeenCalled();
    expect(showAlertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: "warning",
        title: "Arquivo não disponível",
      }),
    );
  });

  it("deve exibir a mensagem da API quando o arquivo não é encontrado", async () => {
    downloadPdfMock.mockRejectedValue(
      erroDaApi(404, "Submissão ou arquivo não encontrado."),
    );

    const { result } = renderHook(() => useApresentacaoPdf());
    await result.current.baixarPdf("sub-3", "slides.pdf");

    await waitFor(() =>
      expect(showAlertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: "error",
          title: "Erro ao baixar",
          text: "Submissão ou arquivo não encontrado.",
        }),
      ),
    );
  });

  it("deve exibir a mensagem da API quando o JWT está ausente ou expirado", async () => {
    downloadPdfMock.mockRejectedValue(
      erroDaApi(401, "Token inválido ou expirado."),
    );

    const { result } = renderHook(() => useApresentacaoPdf());
    await result.current.baixarPdf("sub-4", "slides.pdf");

    await waitFor(() =>
      expect(showAlertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          text: "Token inválido ou expirado.",
        }),
      ),
    );
  });
});
