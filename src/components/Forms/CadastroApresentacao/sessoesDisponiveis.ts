import type { PresentationBlock } from "@/models/session";
import type { Submission } from "@/models/submission";

/**
 * Um bloco só pode receber novas escolhas quando possui horários livres.
 * Uma apresentação já alocada pode manter sua sessão durante a edição.
 */
export function sessoesDisponiveisParaCadastro(
  sessoes: PresentationBlock[],
  eventEditionId?: string,
  submission?: Submission | null,
): PresentationBlock[] {
  if (!eventEditionId) return [];

  return sessoes
    .filter(
      (sessao) =>
        sessao.eventEditionId === eventEditionId &&
        sessao.type === "Presentation" &&
        ((sessao.availablePositionsWithInBlock?.length ?? 0) > 0 ||
          (submission?.presentationId != null &&
            submission.block?.id === sessao.id)),
    )
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );
}
