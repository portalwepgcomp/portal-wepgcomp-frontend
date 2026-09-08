import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
  useContext,
  useCallback,
  useMemo,
} from "react";
import { edicaoApi } from "@/services/edicao";

interface ActiveEditionProps {
  children: ReactNode;
}

interface ActiveEditionProviderData {
  selectEdition: {
    year: string;
    isActive: boolean;
  };
  setSelectEdition: Dispatch<
    SetStateAction<{
      year: string;
      isActive: boolean;
    }>
  >;
  loadingActiveEdition: boolean;
  setLoadingActiveEdition: Dispatch<SetStateAction<boolean>>;
  ensureActiveEdition: () => Promise<{ year: string; isActive: boolean } | null>;
}

export const ActiveEditionContext = createContext<ActiveEditionProviderData>(
  {} as ActiveEditionProviderData
);

export const ActiveEditionProvider = ({ children }: ActiveEditionProps) => {
  const [selectEdition, setSelectEdition] = useState<{
    year: string;
    isActive: boolean;
  }>({ year: "", isActive: false });

  const [loadingActiveEdition, setLoadingActiveEdition] =
    useState<boolean>(false);

  useEffect(() => {
    const savedEdition = localStorage.getItem("activeEdition");
    if (savedEdition) {
      try {
        setSelectEdition(JSON.parse(savedEdition));
      } catch {
        localStorage.removeItem("activeEdition");
      }
    }
  }, []);

  useEffect(() => {
    if (selectEdition.year) {
      localStorage.setItem("activeEdition", JSON.stringify(selectEdition));
    }
  }, [selectEdition]);

  const ensureActiveEdition = useCallback(async () => {
    try {
      if (selectEdition.year) return selectEdition;

      setLoadingActiveEdition(true);

      const saved = localStorage.getItem("activeEdition");
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as { year: string; isActive: boolean };
          if (parsed?.year) {
            setSelectEdition(parsed);
            return parsed;
          }
        } catch {
          localStorage.removeItem("activeEdition");
        }
      }

      const active = await edicaoApi.getEdicaoAtiva();
      if (active?.year) {
        const meta = { year: active.year, isActive: !!active.isActive };
        setSelectEdition(meta);
        localStorage.setItem("activeEdition", JSON.stringify(meta));
        return meta;
      }

      return null;
    } catch {
      return null;
    } finally {
      setLoadingActiveEdition(false);
    }
  }, [selectEdition]);

  const contextValue = useMemo(
    () => ({
      selectEdition,
      setSelectEdition,
      loadingActiveEdition,
      setLoadingActiveEdition,
      ensureActiveEdition,
    }),
    [selectEdition, loadingActiveEdition, ensureActiveEdition]
  );

  return (
    <ActiveEditionContext.Provider value={contextValue}>
      {children}
    </ActiveEditionContext.Provider>
  );
};

export const useActiveEdition = () => {
  return useContext(ActiveEditionContext);
};