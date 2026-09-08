import { UserAccount } from "@/models/user";

export interface SubmissionParams {
  eventEditionId: string;
  mainAuthorId: string;
  title: string;
  abstractText: string;
  advisorId: string;
  coAdvisor?: string;
  pdfFile: string;
  phoneNumber: string;
}

export interface GetSubmissionParams {
  eventEditionId: string;
  withouPresentation?: boolean;
  orderByProposedPresentation?: boolean;
  showConfirmedOnly?: boolean;
  /** Restringe a um autor. O back força isso para usuário Default (anti-spoofing). */
  mainAuthorId?: string;
  /** Busca server-side em título / nome / e-mail do autor. */
  search?: string;
  /** Número da página (base 1) para paginação por envelope (P3.2). */
  page?: number;
  /** Quantidade de registros por página. */
  pageSize?: number;
  /** Se true, o backend responde com envelope PaginatedResponse. */
  paginated?: boolean;
}

export interface Submission extends SubmissionParams {
  id: string;
  deletedAt: string;
  createdAt: string;
  updatedAt: string;
  mainAuthor: UserAccount;
  advisor: UserAccount;
  proposedPresentationBlockId?: string | null;
  proposedPositionWithinBlock?: number | null;
  /** Alias retornado pela API em alguns endpoints */
  abstract?: string;
  type?: string;
  status?: string;
  linkHostedFile?: string;
}
