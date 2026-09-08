"use client";

import { useQuery } from "@tanstack/react-query";
import { sessionApi } from "@/services/sessions";
import { PresentationBlock } from "@/models/session";

/**
 * Hook compartilhado para buscar e cachear a lista de sessões (blocos de apresentação)
 * de uma edição de evento usando TanStack Query.
 */
export function useSessoesQuery(eventEditionId?: string) {
  const { data, isLoading, error, refetch } = useQuery<PresentationBlock[]>({
    queryKey: ["sessions", eventEditionId],
    enabled: !!eventEditionId,
    queryFn: () => sessionApi.listSessions(eventEditionId as string),
  });

  const sessoes = data ?? [];

  return {
    data,
    sessoes,
    sessoesList: sessoes,
    isLoading,
    error,
    refetch,
  };
}
