interface Presentation {
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

interface PresentationBookmark {
  bookmarked: boolean;
}

interface PresentationBookmarkRegister {
  presentationId: string;
}
