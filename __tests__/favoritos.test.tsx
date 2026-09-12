import { expect } from "@jest/globals";
import { act, fireEvent, render, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { AuthContext } from "@/context/AuthProvider/authProvider";
import { EdicaoContext } from "@/hooks/useEdicao";
import { PresentationProvider, usePresentation } from "@/hooks/usePresentation";
import { useListaFavoritos } from "@/features/favoritos/hooks/useListaFavoritos";
import { presentationApi } from "@/services/presentation";
import api from "@/utils/api";
import PresentationCard from "@/components/CardApresentacao/PresentationCard";

jest.mock("@/utils/api", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
}));
jest.mock("next/navigation", () => ({ useRouter: jest.fn() }));

const get = api.get as jest.Mock;
const remove = api.delete as jest.Mock;
const post = api.post as jest.Mock;
const favorites = [2025, 2026].map((year) => ({
  id: `presentation-${year}`,
  submission: { eventEditionId: `edition-${year}`, title: `Apresentação ${year}` },
}));
const response = (items = favorites) => ({ data: { bookmarkedPresentations: items } });
let edition: string | undefined;
let userId: string | undefined;
let signed: boolean;
let loadingEdicao: boolean;
let client: QueryClient;
function Wrapper({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={client}>
      <AuthContext.Provider value={{ user: userId ? { id: userId } : null, signed } as React.ContextType<typeof AuthContext>}>
        <EdicaoContext.Provider value={{ loadingEdicao, Edicao: edition ? { id: edition } : null } as React.ContextType<typeof EdicaoContext>}>
          <PresentationProvider>{children}</PresentationProvider>
        </EdicaoContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  edition = "edition-2025";
  userId = "user-1";
  signed = true;
  loadingEdicao = false;
  client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  get.mockReset().mockResolvedValue(response());
  remove.mockReset().mockResolvedValue(response());
  post.mockReset().mockResolvedValue(response());
});
afterEach(() => client.clear());

it("envia a edição e filtra a resposta da API atual", async () => {
  const result = await presentationApi.getPresentationBookmarks("edition-2025");
  expect(get).toHaveBeenCalledWith("/presentation/bookmarks", expect.objectContaining({ params: { eventEditionId: "edition-2025" } }));
  expect(result.bookmarkedPresentations).toEqual([favorites[0]]);
});

it("não consulta favoritos sem edição, usuário ou sessão", async () => {
  expect(await presentationApi.getPresentationBookmarks("")).toEqual({ bookmarkedPresentations: [] });
  edition = undefined;
  const { result, rerender } = renderHook(useListaFavoritos, { wrapper: Wrapper });
  expect(result.current.total).toBe(0);
  edition = "edition-2025";
  userId = undefined;
  rerender();
  userId = "user-1";
  signed = false;
  rerender();
  expect(get).not.toHaveBeenCalled();
  expect(result.current.isLoading).toBe(false);
});

it("troca de edição, mantém a busca e mostra lista vazia na edição sem favoritos", async () => {
  const { result, rerender } = renderHook(useListaFavoritos, { wrapper: Wrapper });
  await waitFor(() => expect(result.current.itens).toEqual([favorites[0]]));
  act(() => result.current.setBusca("apresentacao"));
  expect(result.current.total).toBe(1);
  edition = "edition-2026";
  rerender();
  expect(result.current.itens).toEqual([]);
  await waitFor(() => expect(result.current.itens).toEqual([favorites[1]]));
  edition = "edition-2027";
  rerender();
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.total).toBe(0);
  edition = "edition-2025";
  rerender();
  await waitFor(() => expect(result.current.itens).toEqual([favorites[0]]));
  act(() => result.current.setBusca("inexistente"));
  expect(result.current.total).toBe(0);
});

it("ignora uma resposta atrasada da edição anterior", async () => {
  let resolveOld!: (value: ReturnType<typeof response>) => void;
  get.mockImplementationOnce(() => new Promise((resolve) => { resolveOld = resolve; }));
  const { result, rerender } = renderHook(useListaFavoritos, { wrapper: Wrapper });
  edition = "edition-2026";
  rerender();
  await waitFor(() => expect(result.current.itens).toEqual([favorites[1]]));
  await act(async () => resolveOld(response()));
  expect(result.current.itens).toEqual([favorites[1]]);
  expect(get.mock.calls[0][1].signal.aborted).toBe(true);
});

it("não reutiliza a lista anterior após erro ou ao trocar de usuário", async () => {
  const { result, rerender } = renderHook(useListaFavoritos, { wrapper: Wrapper });
  await waitFor(() => expect(result.current.total).toBe(1));
  get.mockRejectedValueOnce(new Error("Falha de rede"));
  edition = "edition-2026";
  rerender();
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.total).toBe(0);
  get.mockResolvedValue(response([]));
  edition = "edition-2025";
  userId = "user-2";
  rerender();
  expect(result.current.total).toBe(0);
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.total).toBe(0);
});

it("remove o favorito uma vez e atualiza somente a consulta ativa", async () => {
  const { result, rerender } = renderHook(useListaFavoritos, { wrapper: Wrapper });
  await waitFor(() => expect(result.current.total).toBe(1));
  get.mockResolvedValue(response([favorites[1]]));
  await act(async () => result.current.excluir("presentation-2025"));
  await waitFor(() => expect(result.current.total).toBe(0));
  expect(remove).toHaveBeenCalledTimes(1);
  expect(remove).toHaveBeenCalledWith("/presentation/bookmark", { params: { presentationId: "presentation-2025" } });
  edition = "edition-2026";
  rerender();
  await waitFor(() => expect(result.current.itens).toEqual([favorites[1]]));
});

it("atualiza a lista quando uma apresentação é favoritada em outra tela", async () => {
  get.mockResolvedValue(response([]));
  const { result } = renderHook(() => ({ list: useListaFavoritos(), actions: usePresentation() }), { wrapper: Wrapper });
  await waitFor(() => expect(result.current.list.isLoading).toBe(false));
  get.mockResolvedValue(response());
  await act(async () => result.current.actions.postPresentationBookmark({ presentationId: "presentation-2025" }));
  await waitFor(() => expect(result.current.list.itens).toEqual([favorites[0]]));
});

it("oculta os favoritos enquanto o header resolve a nova edição", async () => {
  const { result, rerender } = renderHook(useListaFavoritos, { wrapper: Wrapper });
  await waitFor(() => expect(result.current.total).toBe(1));
  loadingEdicao = true;
  rerender();
  expect(result.current.total).toBe(0);
  expect(result.current.isLoading).toBe(true);
  edition = "edition-2026";
  loadingEdicao = false;
  rerender();
  await waitFor(() => expect(result.current.itens).toEqual([favorites[1]]));
});

it("o card delega a remoção à listagem sem duplicar o DELETE", async () => {
  get.mockResolvedValue({ data: { bookmarked: true } });
  const onDelete = jest.fn();
  const { container } = render(
    <PresentationCard id="presentation-2025" title="Teste" subtitle="Resumo"
      name="Pessoa" pdfFile="teste.pdf" email="teste@example.test" advisorName="Orientador"
      onDelete={onDelete} />,
    { wrapper: Wrapper },
  );
  await waitFor(() => expect(container.querySelector("div.cursor-pointer svg")).not.toBeNull());
  fireEvent.click(container.querySelector("div.cursor-pointer")!);
  expect(onDelete).toHaveBeenCalledTimes(1);
  expect(remove).not.toHaveBeenCalled();
});
