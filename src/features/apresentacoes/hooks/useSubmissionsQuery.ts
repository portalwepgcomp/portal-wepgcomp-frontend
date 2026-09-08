"use client";

import { useQuery } from "@tanstack/react-query";
import { submissionApi } from "@/services/submission";
import { GetSubmissionParams, Submission } from "@/models/submission";
import { PaginatedResponse } from "@/types/api";

/**
 * Hook para consultar submissões/apresentações com cache do TanStack Query.
 * Suporta tanto respostas em array simples quanto o envelope PaginatedResponse (P3.2).
 */
export function useSubmissionsQuery(
  params?: GetSubmissionParams,
  enabled: boolean = true,
) {
  const eventEditionId = params?.eventEditionId;

  return useQuery<Submission[] | PaginatedResponse<Submission>>({
    queryKey: ["submissions", eventEditionId, params],
    enabled: Boolean(eventEditionId && enabled),
    queryFn: () => submissionApi.getSubmissions(params as GetSubmissionParams),
  });
}
