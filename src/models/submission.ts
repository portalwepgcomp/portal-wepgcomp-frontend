interface SubmissionParams {
  eventEditionId: string;
  mainAuthorId: string;
  title: string;
  abstractText: string;
  advisorId: string;
  coAdvisor?: string;
  dateSuggestion?: Date;
  pdfFile: string;
  phoneNumber: string;
}

interface GetSubmissionParams {
  eventEditionId: string;
  withouPresentation?: boolean;
  orderByProposedPresentation?: boolean;
  showConfirmedOnly?: boolean;
  /** Restringe a um autor. O back força isso para usuário Default (anti-spoofing). */
  mainAuthorId?: string;
  /** Busca server-side em título / nome / e-mail do autor. */
  search?: string;
}

interface Submission extends SubmissionParams {
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
