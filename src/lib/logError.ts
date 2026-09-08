import { AxiosError } from "axios";

/**
 * Extrai uma mensagem segura de um erro, sem expor o objeto completo.
 * Importante: o objeto de erro do axios contém `config` (com o header
 * Authorization) e o corpo da requisição (que pode incluir senhas), por isso
 * NUNCA deve ser logado diretamente.
 */
export function obterMensagemErro(erro: unknown): string {
  if (erro instanceof AxiosError) {
    const dados = erro.response?.data as { message?: string } | undefined;
    return dados?.message ?? erro.message ?? "Erro de requisição";
  }
  if (erro instanceof Error) return erro.message;
  return "Erro desconhecido";
}

/**
 * Loga apenas a mensagem segura do erro, com um contexto descritivo.
 */
export function registrarErro(contexto: string, erro: unknown): void {
  console.error(`${contexto}: ${obterMensagemErro(erro)}`);
}
