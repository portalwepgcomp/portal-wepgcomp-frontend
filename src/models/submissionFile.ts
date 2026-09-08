export interface SubmissionFileParams {
  idUser: string;
  pdfFile: File;
}

export interface SubmissionFile extends SubmissionFileParams {
  id: string;
  createdAt: Date;
  deletedAt: Date;
  updatedAt: Date;
  key?: string;
  message?: string;
}
