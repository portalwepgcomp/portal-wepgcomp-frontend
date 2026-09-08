import { isAxiosError } from "axios";

/**
 * Extrai de forma segura e tipada a mensagem de erro retornada pelo backend ou lançada localmente.
 */
export function getErrorMessage(
  err: unknown,
  fallback = "Ocorreu um erro inesperado. Por favor, tente novamente.",
): string {
  if (isAxiosError(err)) {
    if (err.code === "ERR_NETWORK" || err.message === "Network Error" || !err.response) {
      return "Não foi possível estabelecer conexão. Verifique sua internet e tente novamente em instantes.";
    }

    if (err.response?.data) {
      const data = err.response.data as Record<string, unknown>;
      if (typeof data.message === "string") {
        return data.message;
      }
      if (Array.isArray(data.message) && data.message.length > 0) {
        return data.message.join(". ");
      }
      if (
        typeof data.message === "object" &&
        data.message !== null &&
        "message" in data.message &&
        typeof (data.message as Record<string, unknown>).message === "string"
      ) {
        return (data.message as { message: string }).message;
      }
      if (typeof data.error === "string") {
        return data.error;
      }
    }

    if (err.response?.status === 401) {
      return "E-mail ou senha incorretos.";
    }
    if (err.response?.status === 403) {
      return "Você não tem permissão para realizar esta ação.";
    }
    if (err.response?.status === 404) {
      return "Informação não encontrada.";
    }
    if (err.response?.status === 409) {
      return "Registro já existente. Verifique os dados informados.";
    }
    if (err.response?.status === 429) {
      return "Muitas tentativas em sequência. Por favor, aguarde alguns instantes.";
    }
    if (err.response?.status && err.response.status >= 500) {
      return "Serviço temporariamente indisponível. Por favor, tente novamente mais tarde.";
    }
  }

  if (err instanceof Error) {
    if (err.message === "Network Error") {
      return "Não foi possível estabelecer conexão. Verifique sua internet e tente novamente em instantes.";
    }
    return err.message;
  }

  return fallback;
}
