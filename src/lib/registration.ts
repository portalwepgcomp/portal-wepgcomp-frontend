export interface StatusInscricoes {
  registrationOpen: boolean;
  eventEditionId: string | null;
}

const TIMEOUT_MS = 5000;

const STATUS_FECHADO: StatusInscricoes = {
  registrationOpen: false,
  eventEditionId: null,
};

/**
 * Consulta na API se a edição ativa está com o cadastro público aberto.
 *
 * Em qualquer falha responde fechado: a API é a trava autoritativa e recusaria
 * o registro de todo modo, então exibir o formulário só levaria o usuário a
 * preencher tudo para receber erro no envio.
 */
export async function obterStatusInscricoes(): Promise<StatusInscricoes> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) return STATUS_FECHADO;

  // AbortController em vez de AbortSignal.timeout: o segundo não existe em
  // todo runtime (o jsdom não implementa), e ausente ele derrubaria a consulta
  // para o fallback fechado sem que nada indicasse o motivo.
  const controlador = new AbortController();
  const disparo = setTimeout(() => controlador.abort(), TIMEOUT_MS);

  try {
    const resposta = await fetch(`${baseUrl}/event/registration-status`, {
      cache: "no-store",
      signal: controlador.signal,
    });

    if (!resposta.ok) return STATUS_FECHADO;

    const dados = (await resposta.json()) as Partial<StatusInscricoes> | null;

    return {
      registrationOpen: dados?.registrationOpen === true,
      eventEditionId: dados?.eventEditionId ?? null,
    };
  } catch {
    return STATUS_FECHADO;
  } finally {
    clearTimeout(disparo);
  }
}
