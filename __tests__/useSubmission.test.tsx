import { describe, expect, it } from "@jest/globals";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";

import { SubmissionProvider, useSubmission } from "@/hooks/useSubmission";
import type { Submission } from "@/models/submission";
import { submissionApi } from "@/services/submission";

jest.mock("@/services/submission", () => ({
  submissionApi: {
    deleteSubmissionById: jest.fn(),
  },
}));

jest.mock("@/hooks/useAlert", () => ({
  useSweetAlert: () => ({ showAlert: jest.fn() }),
}));

const deleteSubmissionByIdMock = jest.mocked(
  submissionApi.deleteSubmissionById,
);

function Wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <SubmissionProvider>{children}</SubmissionProvider>
    </QueryClientProvider>
  );
}

describe("useSubmission — exclusão", () => {
  it("limpa a submissão do contexto após excluir", async () => {
    const submissao = { id: "sub-1", title: "Antiga" } as Submission;
    deleteSubmissionByIdMock.mockResolvedValue(submissao);

    const { result } = renderHook(() => useSubmission(), { wrapper: Wrapper });

    act(() => result.current.setSubmission(submissao));
    expect(result.current.submission?.id).toBe("sub-1");

    await act(() => result.current.deleteSubmissionById("sub-1"));

    expect(deleteSubmissionByIdMock).toHaveBeenCalledWith("sub-1");
    expect(result.current.submission).toBeNull();
  });
});
