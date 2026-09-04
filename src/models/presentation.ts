import { Submission } from "@/models/submission";

export interface Presentation {
  id: string;
  presentationBlockId: string;
  positionWithinBlock: number;
  presentationTime?: string;
  submission: Submission | null;
  submissionId: string;
  status: string;
  startTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface PresentationBookmark {
  bookmarked: boolean;
}

export interface PresentationBookmarkRegister {
  presentationId: string;
}
