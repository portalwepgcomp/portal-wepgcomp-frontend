import { describe, expect, it } from "@jest/globals";

import { arquivoEhPdf } from "@/components/Forms/CadastroApresentacao/validarArquivoPdf";

describe("arquivoEhPdf", () => {
  it.each([
    ["slides.pdf", "application/pdf", true],
    ["slides.PDF", "", true],
    ["slides.pdf", "application/octet-stream", true],
    ["slides.txt", "text/plain", false],
    ["slides.pdf", "text/plain", false],
    ["slides", "application/pdf", false],
  ])("retorna %s para o arquivo %s (%s)", (nome, tipo, esperado) => {
    const arquivo = new File(["conteúdo"], nome, { type: tipo });

    expect(arquivoEhPdf(arquivo)).toBe(esperado);
  });
});
