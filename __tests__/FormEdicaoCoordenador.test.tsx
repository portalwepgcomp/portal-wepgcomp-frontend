import { afterEach, beforeEach, expect, test } from "@jest/globals";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { FormEdicao } from "@/components/Forms/CadastroEdicao/FormEdicao";
import { useFormEdicao } from "@/components/Forms/CadastroEdicao/useFormEdicao";
import { CommitteerContext } from "@/hooks/useCommittee";
import { committerMembersApi } from "@/services/CommitteeMember";
import type { Edicao } from "@/models/edicao";
import type { Committer } from "@/models/committer";

const mockCreate = jest.fn().mockResolvedValue(true);
const mockUpdate = jest.fn().mockResolvedValue(undefined);
const mockGetSharedMembers = jest.fn().mockResolvedValue([]);
const mockShowAlert = jest.fn();
let queryClient: QueryClient;

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock("@/context/AuthProvider/authProvider", () => ({
  AuthContext: jest
    .requireActual<typeof import("react")>("react")
    .createContext({ user: { id: "editor" } }),
}));
jest.mock("@/hooks/useUsers", () => ({
  UserContext: jest
    .requireActual<typeof import("react")>("react")
    .createContext({
      getAdvisors: jest.fn(),
      advisors: [],
      getAdmins: jest.fn(),
      admins: [
        { id: "coord-B", name: "Coordinator B" },
        { id: "new-coordinator", name: "New coordinator" },
      ],
    }),
}));
jest.mock("@/hooks/useEdicao", () => ({
  useEdicao: () => ({
    createEdicao: mockCreate,
    updateEdicao: mockUpdate,
    Edicao: { isActive: true },
  }),
}));
jest.mock("@/hooks/useAlert", () => ({
  useSweetAlert: () => ({ showAlert: mockShowAlert }),
}));
jest.mock("@/services/CommitteeMember", () => ({
  committerMembersApi: { getAllMembers: jest.fn() },
}));
jest.mock("@/utils/logError", () => ({ registrarErro: jest.fn() }));

const mockGetMembers = jest.mocked(committerMembersApi.getAllMembers);
const eventB: Edicao = {
  id: "event-B",
  name: "Event B",
  description: "Description",
  location: "Salvador",
  presentationDuration: 20,
  presentationsPerPresentationBlock: 2,
  callForPapersText: "Submit",
  startDate: "2026-11-27T12:00:00Z",
  endDate: "2026-11-28T12:00:00Z",
  submissionDeadline: "2026-11-26T12:00:00Z",
  isActive: true,
  createdAt: "",
  updatedAt: "",
  deletedAt: "",
};
const eventA: Edicao = { ...eventB, id: "event-A", name: "Event A" };
const validFields = {
  titulo: "New event",
  descricao: "Description",
  inicio: eventB.startDate,
  final: eventB.endDate,
  local: "Salvador",
  salas: [],
  comissao: [],
  sessoes: 2,
  duracao: 20,
  submissao: "Submit",
  limite: eventB.submissionDeadline,
};

function member(
  eventEditionId = "event-B",
  userId = "coord-B",
  level = "Coordinator",
): Committer {
  return {
    id: userId,
    eventEditionId,
    userId,
    userName: userId,
    role: "OrganizingCommittee",
    level,
    createdAt: "",
    updatedAt: "",
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <CommitteerContext.Provider
        value={{
          committerList: [member("event-A", "coord-A")],
          getCommitterAll: mockGetSharedMembers,
        }}
      >
        {children}
      </CommitteerContext.Provider>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetMembers.mockReset().mockResolvedValue([member()]);
  queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity, refetchOnWindowFocus: false },
    },
  });
});
afterEach(() => queryClient.clear());

test("blocks saving while B loads, ignoring shared and cached members of A", async () => {
  const pending = deferred<Committer[]>();
  mockGetMembers.mockReturnValue(pending.promise);
  queryClient.setQueryData(
    ["committee-members", "event-A"],
    [member("event-A", "coord-A")],
  );
  const { result } = renderHook(() => useFormEdicao({ edicaoData: eventB }), {
    wrapper: Wrapper,
  });
  expect(mockGetMembers).toHaveBeenCalledWith("event-B");
  expect(result.current.form.getValues("coordenador")).toBeUndefined();
  expect(result.current.isValid).toBe(false);
  await act(async () => {
    result.current.form.setValue("coordenador", {
      value: "coord-A",
      label: "A",
    });
    await result.current.handleSubmit();
  });
  expect(mockUpdate).not.toHaveBeenCalled();
});

test("preserves the coordinator of B and only loads ordinary committee members of B", async () => {
  mockGetMembers.mockResolvedValue([
    member("event-A", "coord-A"),
    member(),
    member("event-B", "committee-B", "Committee"),
    member("event-A", "committee-A", "Committee"),
  ]);
  const { result } = renderHook(() => useFormEdicao({ edicaoData: eventB }), {
    wrapper: Wrapper,
  });
  await waitFor(() => expect(result.current.isValid).toBe(true));
  expect(result.current.form.getValues("comissao")).toEqual([
    { value: "committee-B", label: "committee-B" },
  ]);
  await act(async () => {
    await result.current.handleSubmit();
  });
  expect(mockUpdate).toHaveBeenCalledWith(
    "event-B",
    expect.objectContaining({
      coordinatorId: "coord-B",
      organizingCommitteeIds: ["committee-B"],
    }),
  );
});

test("submits a deliberate coordinator change", async () => {
  const { result } = renderHook(() => useFormEdicao({ edicaoData: eventB }), {
    wrapper: Wrapper,
  });
  await waitFor(() => expect(result.current.isValid).toBe(true));
  await act(async () => {
    result.current.form.setValue(
      "coordenador",
      { value: "new-coordinator", label: "New coordinator" },
      { shouldValidate: true },
    );
    await result.current.handleSubmit();
  });
  expect(mockUpdate).toHaveBeenCalledWith(
    "event-B",
    expect.objectContaining({ coordinatorId: "new-coordinator" }),
  );
});

test("keeps edits to other fields made while the committee loads", async () => {
  const pending = deferred<Committer[]>();
  mockGetMembers.mockReturnValue(pending.promise);
  const { result } = renderHook(() => useFormEdicao({ edicaoData: eventB }), {
    wrapper: Wrapper,
  });
  act(() => result.current.form.setValue("titulo", "Edited title"));
  await act(async () => {
    pending.resolve([member()]);
  });
  await waitFor(() => expect(result.current.isValid).toBe(true));
  expect(result.current.form.getValues("titulo")).toBe("Edited title");
});

test("clears the previous coordinator and its extra option when switching editions", async () => {
  const pendingB = deferred<Committer[]>();
  mockGetMembers.mockImplementation((id) =>
    id === "event-A"
      ? Promise.resolve([member("event-A", "coord-A")])
      : pendingB.promise,
  );
  const { result, rerender } = renderHook(
    ({ edition }) => useFormEdicao({ edicaoData: edition }),
    { wrapper: Wrapper, initialProps: { edition: eventA } },
  );
  await waitFor(() => expect(result.current.isValid).toBe(true));
  expect(result.current.form.getValues("coordenador").value).toBe("coord-A");
  rerender({ edition: eventB });
  expect(result.current.form.getValues("coordenador")).toBeUndefined();
  expect(
    result.current.coordenadorOptions.some(
      (option) => option.value === "coord-A",
    ),
  ).toBe(false);
  expect(result.current.isValid).toBe(false);
  await act(async () => {
    pendingB.resolve([]);
  });
  await waitFor(() => expect(result.current.comissaoDisponivel).toBe(true));
  await act(async () => {
    await result.current.handleSubmit();
  });
  expect(result.current.form.getValues("coordenador")).toBeUndefined();
  expect(mockUpdate).not.toHaveBeenCalled();
});

test("ignores a late response from A after switching to B", async () => {
  const pendingA = deferred<Committer[]>();
  mockGetMembers.mockImplementation((id) =>
    id === "event-A" ? pendingA.promise : Promise.resolve([member()]),
  );
  const { result, rerender } = renderHook(
    ({ edition }) => useFormEdicao({ edicaoData: edition }),
    { wrapper: Wrapper, initialProps: { edition: eventA } },
  );
  rerender({ edition: eventB });
  await waitFor(() => expect(result.current.isValid).toBe(true));
  await act(async () => {
    pendingA.resolve([member("event-A", "coord-A")]);
  });
  await act(async () => {
    await result.current.handleSubmit();
  });
  expect(mockUpdate).toHaveBeenCalledWith(
    "event-B",
    expect.objectContaining({ coordinatorId: "coord-B" }),
  );
});

test("a failed request prevents saving even with a manually supplied coordinator", async () => {
  mockGetMembers.mockRejectedValue(new Error("Network error"));
  const { result } = renderHook(() => useFormEdicao({ edicaoData: eventB }), {
    wrapper: Wrapper,
  });
  await waitFor(() => expect(result.current.erroComissao).toBe(true));
  await act(async () => {
    result.current.form.setValue("coordenador", {
      value: "coord-A",
      label: "A",
    });
    await result.current.handleSubmit();
  });
  expect(result.current.isValid).toBe(false);
  expect(mockUpdate).not.toHaveBeenCalled();
});

test("the form shows loading and error states and allows retrying", async () => {
  const pending = deferred<Committer[]>();
  mockGetMembers
    .mockReturnValueOnce(pending.promise)
    .mockResolvedValue([member()]);
  render(<FormEdicao edicaoData={eventB} />, { wrapper: Wrapper });
  expect(screen.getByRole("status")).toHaveTextContent(
    "Carregando comissão do evento",
  );
  expect(screen.getByLabelText(/Coordenador geral/i)).toBeDisabled();
  expect(screen.getByRole("button", { name: "Salvar" })).toBeDisabled();
  await act(async () => {
    pending.reject(new Error("Network error"));
  });
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Não foi possível carregar a comissão",
  );
  expect(screen.getByRole("button", { name: "Salvar" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Salvar" })).toBeEnabled(),
  );
  fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
  await waitFor(() =>
    expect(mockUpdate).toHaveBeenCalledWith(
      "event-B",
      expect.objectContaining({ coordinatorId: "coord-B" }),
    ),
  );
});

test("keeps a current coordinator absent from the admins list as an option", async () => {
  mockGetMembers.mockResolvedValue([member("event-B", "former-admin")]);
  const { result } = renderHook(() => useFormEdicao({ edicaoData: eventB }), {
    wrapper: Wrapper,
  });
  await waitFor(() => expect(result.current.isValid).toBe(true));
  expect(result.current.coordenadorOptions).toContainEqual({
    value: "former-admin",
    label: "former-admin",
  });
});

test("creation requires an explicit coordinator and sends the selected ID", async () => {
  const { result } = renderHook(() => useFormEdicao({}), { wrapper: Wrapper });
  expect(result.current.form.getValues("coordenador")).toBeUndefined();
  expect(mockGetMembers).not.toHaveBeenCalled();
  await act(async () => {
    result.current.form.reset(validFields);
    await result.current.handleSubmit();
  });
  expect(mockCreate).not.toHaveBeenCalled();
  await act(async () => {
    result.current.form.setValue("coordenador", {
      value: "new-coordinator",
      label: "New coordinator",
    });
    await result.current.handleSubmit();
  });
  expect(mockCreate).toHaveBeenCalledWith(
    expect.objectContaining({ coordinatorId: "new-coordinator" }),
  );
});
