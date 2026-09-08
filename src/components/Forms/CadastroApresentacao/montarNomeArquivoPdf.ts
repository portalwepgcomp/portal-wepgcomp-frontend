/** Remove acentos e mantém apenas letras (para compor nomes de arquivo). */
function tratarPalavra(w: string): string {
  return w
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z]/g, "");
}

/**
 * Gera o nome do PDF a partir do nome do apresentador + título + data/hora.
 * Ex.: `Joao_Silva-Meu_Titulo-05.07.2026.14h.30m.10s.pdf`.
 * Extraído de `FormCadastroApresentacao.tsx` (função pura, sem estado).
 */
export function montarNomeArquivoPdf(
  nomeCompleto: string,
  date = new Date(),
  titulo: string,
): string {
  const parts = (nomeCompleto || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(tratarPalavra)
    .filter(Boolean);

  const primeiro = parts[0] || "Arquivo";
  const ultimo = parts.length > 1 ? parts[parts.length - 1] : "";
  const parteNome = ultimo ? `${primeiro}_${ultimo}` : primeiro;
  const tituloPart = titulo.replaceAll(" ", "_");

  const hh = String(date.getHours()).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const ano = date.getFullYear();
  const segundos = String(date.getSeconds()).padStart(2, "0");

  return `${parteNome}-${tituloPart}-${dd}.${mes}.${ano}.${hh}h.${mm}m.${segundos}s.pdf`;
}
