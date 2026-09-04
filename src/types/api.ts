import type { components, paths, operations } from "./api-schema";

export type { components, paths, operations };

/**
 * Utilitário para extrair schemas de componentes da API OpenAPI.
 * Exemplo de uso: `type UserSchema = ApiSchema<'CreateUserDto'>;`
 */
export type ApiSchema<T extends keyof components["schemas"]> =
  components["schemas"][T];

/**
 * Contrato de resposta paginada por envelope (P3.2).
 *
 * Padroniza respostas que retornam listas com metadados de paginação:
 * - `items`: registros da página atual;
 * - `total`: contagem total de itens disponíveis no backend;
 * - `page`: página atual (base 1);
 * - `pageSize`: quantidade de itens por página;
 * - `totalPages`: total de páginas calculadas.
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

/**
 * Helper para normalizar respostas que podem vir como array simples `T[]`
 * ou envelopadas em `PaginatedResponse<T>`.
 *
 * Garante que componentes de UI recebam sempre um array seguro, facilitando
 * a transição gradual sem quebrar código legado.
 *
 * @example
 * const items = unwrapPaginatedList(data);
 */
export function unwrapPaginatedList<T>(
  response: PaginatedResponse<T> | T[] | null | undefined,
): T[] {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if ("items" in response && Array.isArray(response.items)) {
    return response.items;
  }
  return [];
}

/**
 * Helper para extrair metadados de paginação com valores padrão seguros.
 */
export function getPaginationMeta<T>(
  response: PaginatedResponse<T> | T[] | null | undefined,
): {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isPaginated: boolean;
} {
  if (!response) {
    return { total: 0, page: 1, pageSize: 20, totalPages: 1, isPaginated: false };
  }
  if (Array.isArray(response)) {
    return {
      total: response.length,
      page: 1,
      pageSize: response.length || 20,
      totalPages: 1,
      isPaginated: false,
    };
  }
  const total = response.total ?? response.items?.length ?? 0;
  const pageSize = response.pageSize || 20;
  const totalPages =
    response.totalPages ?? (pageSize > 0 ? Math.ceil(total / pageSize) : 1);
  return {
    total,
    page: response.page || 1,
    pageSize,
    totalPages,
    isPaginated: true,
  };
}

