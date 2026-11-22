import type { ItemResumo } from "../tipos";
import type { Intervalo } from "./filtrosUrl";

export interface PontoSerie {
  dia: string;
  total: number;
}

const formatoDia = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export const chaveDoDia = (data: Date) => formatoDia.format(data);

/**
 * Completa com zero os dias sem ocorrência — a API só devolve dias com
 * registros, e um gráfico com buracos esconde justamente os dias tranquilos.
 */
export function montarSerieDiaria(
  itens: ItemResumo[],
  intervalo: Intervalo,
): PontoSerie[] {
  const totais = new Map(itens.map((item) => [String(item.key), item.count]));
  const dias: string[] = [];
  const passo = 6 * 60 * 60 * 1000;

  for (
    let t = intervalo.inicio.getTime();
    t <= intervalo.fim.getTime();
    t += passo
  ) {
    const dia = chaveDoDia(new Date(t));
    if (dias[dias.length - 1] !== dia) dias.push(dia);
  }
  const ultimo = chaveDoDia(intervalo.fim);
  if (dias[dias.length - 1] !== ultimo) dias.push(ultimo);

  return dias.map((dia) => ({ dia, total: totais.get(dia) ?? 0 }));
}

/** Início e fim do dia (fuso de Brasília) em formato aceito por `datetime-local`. */
export function limitesDoDia(dia: string): { de: string; ate: string } {
  return { de: `${dia}T00:00`, ate: `${dia}T23:59` };
}
