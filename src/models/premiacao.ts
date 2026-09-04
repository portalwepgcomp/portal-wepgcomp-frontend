/* eslint-disable @typescript-eslint/no-unused-vars */
import { Submission } from "@/models/submission";

export type PremiacaoCategoriaProps = {
  categoria: string;
  searchValue: string;
  premiacoes: Premiacoes[];
  avaliadores: AuthorOrEvaluator[];
};

export interface AuthorOrEvaluator {
  id: string;
  name: string;
  email: string;
  votes?: number;
  registrationNumber: string;
  photoFilePath: string;
  profile: Record<string, unknown>;
  level: Record<string, unknown>;
  isActive?: boolean;
}

export interface AvaliadorParams {
  eventEditionId: string;
  panelists: {
    userId: string;
  }[];
}

export interface PanelistsParams {
  id: string;
  name: string;
  email: string;
  registrationNumber: string;
  profile: Record<string, unknown>;
  level: Record<string, unknown>;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  isVerified?: boolean;
}

export interface Premiacoes {
  id: string;
  presentationBlockId: string;
  positionWithinBlock: number;
  status: Record<string, unknown>;
  publicAverageScore: number;
  evaluatorsAverageScore: number;
  submission: Submission;
}
