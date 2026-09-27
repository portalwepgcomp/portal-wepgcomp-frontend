"use client";

import { isAxiosError } from "axios";
import { useCallback, useState } from "react";

import { useSweetAlert } from "@/hooks/useAlert";
import { submissionApi } from "@/services/submission";
import { getErrorMessage } from "@/utils/error";
import { obterNomeArquivoViaUrl } from "@/utils/obterNomeArquivoUrl";
import { registrarErro } from "@/utils/logError";

function lerBlobComoTexto(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

async function mensagemDoErro(err: unknown, padrao: string): Promise<string> {
  if (isAxiosError(err) && err.response?.data instanceof Blob) {
    try {
      const json = JSON.parse(await lerBlobComoTexto(err.response.data));
      if (typeof json.message === "string") return json.message;
    } catch {
      return padrao;
    }
  }

  return getErrorMessage(err, padrao);
}

export function useApresentacaoPdf() {
  const { showAlert } = useSweetAlert();
  const [baixandoPdf, setBaixandoPdf] = useState(false);

  const baixarPdf = useCallback(
    async (idSubmission?: string, arquivo?: string) => {
      if (!idSubmission) {
        showAlert({
          icon: "warning",
          title: "Arquivo não disponível",
          text: "Esta apresentação não possui arquivo PDF cadastrado.",
        });
        return;
      }

      setBaixandoPdf(true);

      try {
        const blob = await submissionApi.downloadPdf(idSubmission);

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download =
          (arquivo && obterNomeArquivoViaUrl(arquivo)) ||
          `apresentacao-${idSubmission}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      } catch (err: unknown) {
        registrarErro("Erro ao baixar PDF da apresentação", err);

        showAlert({
          icon: "error",
          title: "Erro ao baixar",
          text: await mensagemDoErro(
            err,
            "Não foi possível baixar o PDF desta apresentação. Tente novamente.",
          ),
          confirmButtonText: "Retornar",
        });
      } finally {
        setBaixandoPdf(false);
      }
    },
    [showAlert],
  );

  return { baixarPdf, baixandoPdf };
}
