/* eslint-disable @typescript-eslint/no-unused-vars */

export interface EdicaoParams {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  coordinatorId?: string;
  organizingCommitteeIds?: string[];
  roomName?: string;
  itSupportIds?: string[];
  administrativeSupportIds?: string[];
  communicationIds?: string[];
  presentationsPerPresentationBlock?: number;
  presentationDuration?: number;
  callForPapersText?: string;
  submissionDeadline?: string;
  partnersText?:string

}


export interface GetEdicaoParams {
  /** Busca textual em nome / descrição da edição */
  search?: string;
  /** Número da página (base 1) para paginação por envelope (P3.2). */
  page?: number;
  /** Quantidade de registros por página. */
  pageSize?: number;
  /** Se true, o backend responde com envelope PaginatedResponse. */
  paginated?: boolean;
}

export interface Edicao extends EdicaoParams {
  id: string;
  createdAt: string;
  deletedAt: string;
  updatedAt: string;
  isActive: boolean;
}
