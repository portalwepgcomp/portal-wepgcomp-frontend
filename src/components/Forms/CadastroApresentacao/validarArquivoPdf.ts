/** Valida a extensão PDF e aceita MIME vazio ou octet-stream por compatibilidade. */
export function arquivoEhPdf(file: File): boolean {
  const possuiExtensaoPdf = /\.pdf$/i.test(file.name);
  const tipoDesconhecido =
    file.type === "" || file.type === "application/octet-stream";

  return (
    possuiExtensaoPdf && (file.type === "application/pdf" || tipoDesconhecido)
  );
}
