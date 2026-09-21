/**
 * Valida a extensão e o tipo MIME informado pelo navegador para um PDF.
 * Alguns navegadores não preenchem o MIME (ou usam octet-stream), por isso a
 * extensão continua sendo necessária, mas esses tipos desconhecidos são
 * aceitos quando o nome termina em `.pdf`.
 */
export function arquivoEhPdf(file: File): boolean {
  const possuiExtensaoPdf = /\.pdf$/i.test(file.name);
  const tipoDesconhecido =
    file.type === "" || file.type === "application/octet-stream";

  return (
    possuiExtensaoPdf && (file.type === "application/pdf" || tipoDesconhecido)
  );
}
