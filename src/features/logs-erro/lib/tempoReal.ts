import type { CampoOrdenacao, Periodo } from "../tipos";

export type EstadoTempoReal =
  "conectando" | "ao-vivo" | "reconectando" | "indisponivel";

export type MotivoPausa =
  | "periodo"
  | "ordenacao"
  | "pagina"
  | "detalhe"
  | "teclado"
  | "ponteiro"
  | "rolagem";

export interface CondicoesTempoReal {
  periodo: Periodo;
  ordenar: CampoOrdenacao;
  ordem: "asc" | "desc";
  pagina: number;
  detalheAberto: boolean;
  linhaSelecionada: boolean;
  ponteiroNaTabela: boolean;
  topoForaDaTela: boolean;
}

export const DESCRICAO_PAUSA: Record<MotivoPausa, string> = {
  periodo: "o período escolhido é fixo",
  ordenacao: "a lista não está ordenada pelos mais recentes",
  pagina: "você não está na primeira página",
  detalhe: "há um registro aberto",
  teclado: "há uma linha selecionada pelo teclado",
  ponteiro: "o ponteiro está sobre a tabela",
  rolagem: "o início da lista está fora da tela",
};

/** Motivo para não inserir registros sob os olhos do usuário, ou `null`. */
export function motivoPausa(condicoes: CondicoesTempoReal): MotivoPausa | null {
  if (condicoes.periodo === "personalizado") return "periodo";
  if (condicoes.ordenar !== "createdAt" || condicoes.ordem !== "desc") {
    return "ordenacao";
  }
  if (condicoes.pagina > 1) return "pagina";
  if (condicoes.detalheAberto) return "detalhe";
  if (condicoes.linhaSelecionada) return "teclado";
  if (condicoes.ponteiroNaTabela) return "ponteiro";
  if (condicoes.topoForaDaTela) return "rolagem";
  return null;
}

/** Ids que entraram na lista; a ordem é a da lista atual. */
export function idsNovos(anteriores: Iterable<string>, atuais: string[]) {
  const conhecidos = new Set(anteriores);
  return atuais.filter((id) => !conhecidos.has(id));
}

const ESPERAS_RECONEXAO_MS = [1_000, 2_000, 5_000, 15_000, 30_000];

/** Espera antes da tentativa `n` (a partir de 1). */
export function atrasoReconexao(tentativa: number) {
  const indice = Math.min(
    Math.max(tentativa, 1) - 1,
    ESPERAS_RECONEXAO_MS.length - 1,
  );
  return ESPERAS_RECONEXAO_MS[indice];
}

/**
 * Quanto esperar para atualizar após um evento: junta a rajada por
 * `esperaRajada` e respeita `intervaloMinimo` desde a última atualização.
 */
export function atrasoAteAtualizar(
  agora: number,
  ultimaAtualizacao: number,
  intervaloMinimo: number,
  esperaRajada: number,
) {
  return Math.max(esperaRajada, ultimaAtualizacao + intervaloMinimo - agora);
}
