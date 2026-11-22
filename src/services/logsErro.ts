"use client";
import axiosInstance from "@/utils/api";
import type { PaginatedResponse } from "@/types/api";
import type {
  ItemResumo,
  LogErroDetalhe,
  LogErroResumo,
  ParametrosApiLogs,
} from "@/features/logs-erro/tipos";

const baseUrl = "/error-logs";

export const logsErroApi = {
  listar: async (
    params: ParametrosApiLogs,
    signal?: AbortSignal,
  ): Promise<PaginatedResponse<LogErroResumo>> => {
    const { data } = await axiosInstance.get(baseUrl, { params, signal });
    return data;
  },

  resumir: async (
    params: ParametrosApiLogs,
    signal?: AbortSignal,
  ): Promise<ItemResumo[]> => {
    const { data } = await axiosInstance.get(`${baseUrl}/summary`, {
      params,
      signal,
    });
    return data;
  },

  buscarPorId: async (
    id: string,
    signal?: AbortSignal,
  ): Promise<LogErroDetalhe> => {
    const { data } = await axiosInstance.get(`${baseUrl}/${id}`, { signal });
    return data;
  },
};
