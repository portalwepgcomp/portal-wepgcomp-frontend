"use client";

import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";

import { AuthContext } from "@/context/AuthProvider/authProvider";
import { useEdicao } from "@/hooks/useEdicao";
import { sessionApi } from "@/services/sessions";

/**
 * Bancas (blocos de apresentação) das quais o usuário é panelista/avaliador.
 * Lista via TanStack Query (read-only; sem acoplamento com modais), diferente
 * de `sessoes` que permanece no provider `useSession` por causa da prevenção de
 * sobreposição de horários no `ModalSessao` e do uso no `ScheduleSection`.
 */
export function useListaBancas() {
  const { user } = useContext(AuthContext);
  const { Edicao } = useEdicao();

  const eventEditionId = Edicao?.id;
  const userId = user?.id ?? "";

  const { data } = useQuery<Sessao[]>({
    queryKey: ["panelist-blocks", eventEditionId, userId],
    enabled: !!eventEditionId && !!userId,
    queryFn: () =>
      sessionApi.listPresentionBlockByPanelist(
        eventEditionId as string,
        userId,
      ),
  });

  const sessoes = (data ?? []).toSorted(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  return {
    sessoes,
    vazio: sessoes.length === 0,
  };
}
