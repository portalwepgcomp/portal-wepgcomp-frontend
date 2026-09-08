"use client";

import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";

import { AuthContext } from "@/context/AuthProvider/authProvider";
import { useEdicao } from "@/hooks/useEdicao";
import { sessionApi } from "@/services/sessions";
import { PresentationBlock } from "@/models/session";

/**
 * Bancas (blocos de apresentação) das quais o usuário é panelista/avaliador.
 * Lista via TanStack Query (read-only; filtrado por usuário panelista).
 */
export function useListaBancas() {
  const { user } = useContext(AuthContext);
  const { Edicao } = useEdicao();

  const eventEditionId = Edicao?.id;
  const userId = user?.id ?? "";

  const { data } = useQuery<PresentationBlock[]>({
    queryKey: ["panelist-blocks", eventEditionId, userId],
    enabled: !!eventEditionId && !!userId,
    queryFn: () =>
      sessionApi.listPresentionBlockByPanelist(
        eventEditionId as string,
        userId,
      ),
  });

  const sessoes = [...(data ?? [])].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  return {
    sessoes,
    vazio: sessoes.length === 0,
  };
}
