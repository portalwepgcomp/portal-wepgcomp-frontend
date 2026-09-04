import { formatDate } from "@/utils/formatDate";
import { PresentationBlock } from "@/models/session";

export type SessaoComHorario = PresentationBlock & { horarioFormatado: string };

/**
 * Formata o horário da sessão no fuso do navegador (mantido no front por isso):
 * "DD/MM/AAAA - Fim: HH:MMh". Antes vivia inline em `app/sessoes/page.tsx`.
 */
export function formatarHorarioSessao(sessao: PresentationBlock): SessaoComHorario {
  const inicio = new Date(sessao.startTime);
  const fim = new Date(inicio.getTime() + (sessao.duration ?? 0) * 60000);
  const dataFormatada = formatDate(inicio.toISOString());
  const horaFim = fim.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return {
    ...sessao,
    horarioFormatado: `${dataFormatada} - Fim: ${horaFim}h`,
  };
}
