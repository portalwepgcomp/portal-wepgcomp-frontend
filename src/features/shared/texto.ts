/**
 * Normaliza texto para busca client-side: remove acentos/diacriticos e
 * caracteres especiais (mantem letras, numeros, espaco, `@` e `.`), em minusculas.
 *
 * Fonte unica de verdade para busca insensivel a acento nas features. Antes
 * vivia em `GerenciarUsuario/usuarioUtils.ts` (que agora reexporta daqui).
 */
export function normalizarTextoBusca(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9\s@.]/g, "")
    .toLowerCase();
}

/** `true` se `alvo` contem `termo` apos normalizacao (busca tolerante a acento). */
export function correspondeBusca(alvo: string, termo: string): boolean {
  const termoNorm = normalizarTextoBusca(termo.trim());
  if (!termoNorm) return true;
  return normalizarTextoBusca(alvo ?? "").includes(termoNorm);
}
