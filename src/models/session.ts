import { Presentation } from "@/models/presentation";
import { User } from "@/models/user";

export type PresentationBlockType = "General" | "Presentation";

export interface PresentationBlockParams {
  type: PresentationBlockType;
  eventEditionId: string;
  roomId: string;
  startTime: string;
  title?: string;
  numPresentations: number;
  speakerName?: string;
  duration?: number;
  apresentacoes?: string[];
  avaliadores?: string[];
}

export interface AvailablePositionsWithInBlock {
  positionWithinBlock: number;
  startTime: string;
}

export interface Panelist {
  createdAt: string;
  id: string;
  presentationBlockId: string;
  status: string;
  updatedAt: string;
  user: User | null;
  userId: string;
}

export interface PresentationBlock extends PresentationBlockParams {
  id: string;
  availablePositionsWithInBlock: AvailablePositionsWithInBlock[];
  panelists: Panelist[];
  presentations: Presentation[];
  createdAt: string;
  deletedAt: string;
  updatedAt: string;
}

export interface SwapPresentationsOnSession {
  presentation1Id: string;
  presentation2Id: string;
}

export interface SwapMultiplePresentationsOnSession {
  presentations: SwapPresentationsOnSession[];
}

export interface Room {
  id: string;
  eventEditionId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}
