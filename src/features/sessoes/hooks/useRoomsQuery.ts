"use client";

import { useQuery } from "@tanstack/react-query";
import { sessionApi } from "@/services/sessions";
import { Room } from "@/models/session";

/**
 * Hook para consultar salas de uma edição com cache do TanStack Query.
 */
export function useRoomsQuery(eventEditionId?: string) {
  return useQuery<Room[]>({
    queryKey: ["rooms", eventEditionId],
    enabled: Boolean(eventEditionId),
    queryFn: () => sessionApi.listRooms(eventEditionId as string),
  });
}
