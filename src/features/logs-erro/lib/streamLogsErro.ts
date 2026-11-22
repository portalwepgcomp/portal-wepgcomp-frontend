import { createParser } from "eventsource-parser";

export interface EventoLogNovo {
  id: string;
  createdAt: string;
}

/** Recusa que não adianta repetir: sessão, permissão ou API sem o endpoint. */
export class ErroFatalStream extends Error {
  constructor(readonly status: number) {
    super(`Stream de logs recusado (${status}).`);
    this.name = "ErroFatalStream";
  }
}

const STATUS_FATAIS = new Set([401, 403, 404]);

interface OpcoesStream {
  token: string;
  signal: AbortSignal;
  /** O servidor confirmou a inscrição (evento `ready`). */
  aoAbrir: () => void;
  aoReceber: (evento: EventoLogNovo) => void;
  /** Qualquer trecho recebido, inclusive o ping. */
  aoSinalDeVida: () => void;
}

export function urlStreamLogs(base = process.env.NEXT_PUBLIC_API_URL ?? "") {
  return `${base.replace(/\/+$/, "")}/error-logs/stream`;
}

function lerEvento(dados: string): EventoLogNovo | undefined {
  try {
    const evento = JSON.parse(dados) as Partial<EventoLogNovo>;
    return typeof evento.id === "string" && typeof evento.createdAt === "string"
      ? { id: evento.id, createdAt: evento.createdAt }
      : undefined;
  } catch {
    return undefined;
  }
}

/**
 * `EventSource` não envia cabeçalhos, e a API só aceita o token em
 * `Authorization`; por isso `fetch` + leitura do corpo em streaming.
 * Resolve quando o servidor encerra o stream.
 */
export async function conectarStreamLogs({
  token,
  signal,
  aoAbrir,
  aoReceber,
  aoSinalDeVida,
}: OpcoesStream): Promise<void> {
  const resposta = await fetch(urlStreamLogs(), {
    headers: { Authorization: `Bearer ${token}`, Accept: "text/event-stream" },
    cache: "no-store",
    signal,
  });

  if (STATUS_FATAIS.has(resposta.status)) {
    throw new ErroFatalStream(resposta.status);
  }
  if (!resposta.ok || !resposta.body) {
    throw new Error(`Stream de logs respondeu ${resposta.status}.`);
  }

  const parser = createParser({
    onEvent: (mensagem) => {
      if (mensagem.event === "ready") aoAbrir();
      if (mensagem.event !== "error-log") return;
      const evento = lerEvento(mensagem.data);
      if (evento) aoReceber(evento);
    },
  });

  const leitor = resposta.body.getReader();
  const decodificador = new TextDecoder();
  try {
    for (;;) {
      const { done, value } = await leitor.read();
      if (done) return;
      aoSinalDeVida();
      parser.feed(decodificador.decode(value, { stream: true }));
    }
  } finally {
    leitor.releaseLock();
  }
}
