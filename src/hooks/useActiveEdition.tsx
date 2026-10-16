import {
  createContext,
  ReactNode,
  useEffect,
  useState,
  useContext,
  useCallback,
  useMemo,
  useRef,
} from "react";
import LoadingPage from "@/components/LoadingPage";
import { getEventEditionIdStorage } from "@/context/AuthProvider/util";
import { useEdicao } from "@/hooks/useEdicao";
import type { Edicao } from "@/models/edicao";

export interface SelectedEdition {
  id: string;
  name: string;
  year: string;
  isActive: boolean;
}

export function getEditionYear(edition: Pick<Edicao, "startDate" | "name">) {
  if (edition.startDate) {
    const year = new Date(edition.startDate).getUTCFullYear();
    if (!Number.isNaN(year)) return String(year);
  }
  return edition.name.match(/\b(20\d{2})\b/)?.[1] ?? "";
}

function metadata(edition: Edicao): SelectedEdition {
  return {
    id: edition.id,
    name: edition.name,
    year: getEditionYear(edition),
    isActive: edition.isActive,
  };
}

function readStored(key: string): { id?: string; year?: string } | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? "null");
    if (!value || typeof value !== "object") return null;
    return {
      id: "id" in value && typeof value.id === "string" ? value.id : undefined,
      year:
        "year" in value && typeof value.year === "string"
          ? value.year
          : undefined,
    };
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

interface ActiveEditionProviderData {
  selectEdition: SelectedEdition;
  setSelectEdition: (edition: SelectedEdition) => void;
  loadingActiveEdition: boolean;
  selectionError: string;
  ensureActiveEdition: () => Promise<SelectedEdition | null>;
}

export const ActiveEditionContext = createContext<ActiveEditionProviderData>(
  {} as ActiveEditionProviderData,
);

export const ActiveEditionProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { Edicao, getEdicaoById, listEdicao, clearEdicao, loadingEdicao } =
    useEdicao();
  const [initialized, setInitialized] = useState(false);
  const [selectionError, setSelectionError] = useState("");
  const selectedRef = useRef(Edicao);
  selectedRef.current = Edicao;
  const initializedRef = useRef(false);
  const pendingRef = useRef<Promise<SelectedEdition | null> | null>(null);
  const selectionVersion = useRef(0);
  const selectEdition = useMemo(
    () =>
      Edicao
        ? metadata(Edicao)
        : { id: "", name: "", year: "", isActive: false },
    [Edicao],
  );

  const ensureActiveEdition = useCallback(async () => {
    if (initializedRef.current && selectedRef.current?.id)
      return metadata(selectedRef.current);
    if (pendingRef.current) return pendingRef.current;
    pendingRef.current = (async () => {
      const saved = readStored("activeEdition");
      const savedId =
        getEventEditionIdStorage() ||
        saved?.id ||
        readStored("edicaoAtiva")?.id;
      try {
        const editions = await listEdicao();
        let id = savedId;
        if (!id && saved?.year) {
          const matches = editions.filter(
            (edition) => getEditionYear(edition) === saved.year,
          );
          if (matches.length > 1) {
            throw new Error(
              "Há mais de uma edição neste ano. Selecione a edição desejada.",
            );
          }
          id = matches[0]?.id;
          if (!id)
            throw new Error(
              "A edição salva não foi encontrada. Selecione uma edição.",
            );
        }
        if (!id) {
          const active = editions.filter((edition) => edition.isActive);
          id =
            active.length === 1
              ? active[0].id
              : editions.length === 1
                ? editions[0].id
                : undefined;
        }
        if (!id) throw new Error("Selecione uma edição do evento.");
        const edition = await getEdicaoById(id);
        if (!edition)
          throw new Error(
            "Não foi possível carregar a edição selecionada. Selecione uma edição.",
          );
        setSelectionError("");
        return metadata(edition);
      } catch (err: unknown) {
        clearEdicao();
        setSelectionError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar a edição.",
        );
        return null;
      }
    })().finally(() => {
      initializedRef.current = true;
      setInitialized(true);
      pendingRef.current = null;
    });
    return pendingRef.current;
  }, [getEdicaoById, listEdicao, clearEdicao]);

  useEffect(() => {
    void ensureActiveEdition();
  }, [ensureActiveEdition]);

  useEffect(() => {
    if (initialized && selectEdition.id) {
      localStorage.setItem("activeEdition", JSON.stringify(selectEdition));
    }
  }, [initialized, selectEdition]);

  const setSelectEdition = useCallback(
    (edition: SelectedEdition) => {
      if (!edition.id) return;
      const version = ++selectionVersion.current;
      setSelectionError("");
      void getEdicaoById(edition.id).then((response) => {
        if (version === selectionVersion.current && !response) {
          setSelectionError(
            "Não foi possível trocar de edição. A seleção anterior foi mantida.",
          );
        }
      });
    },
    [getEdicaoById],
  );

  const value = useMemo(
    () => ({
      selectEdition,
      setSelectEdition,
      selectionError,
      loadingActiveEdition: !initialized || loadingEdicao,
      ensureActiveEdition,
    }),
    [
      selectEdition,
      setSelectEdition,
      selectionError,
      initialized,
      loadingEdicao,
      ensureActiveEdition,
    ],
  );

  return (
    <ActiveEditionContext.Provider value={value}>
      {initialized ? children : <LoadingPage />}
    </ActiveEditionContext.Provider>
  );
};

export const useActiveEdition = () => useContext(ActiveEditionContext);
