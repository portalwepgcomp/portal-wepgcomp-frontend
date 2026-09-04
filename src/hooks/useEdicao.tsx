import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";

import { edicaoApi } from "@/services/edicao";
import { useSweetAlert } from "@/hooks/useAlert";
import { setEventEditionIdStorage } from "@/context/AuthProvider/util";
import { Edicao, EdicaoParams } from "@/models/edicao";
import { getErrorMessage } from "@/utils/error";

interface EdicaoProps {
  children: ReactNode;
}

interface EdicaoProviderData {
  loadingEdicoesList: boolean;
  loadingEdicao: boolean;
  edicoesList: Edicao[];
  Edicao: Edicao | null;
  setEdicao: Dispatch<SetStateAction<Edicao | null>>;
  listEdicao: () => Promise<Edicao[]>;
  getEdicaoById: (idEdicao: string) => Promise<Edicao | null>;
  getEdicaoByYear: (year: string) => Promise<Edicao | null>;
  createEdicao: (body: EdicaoParams) => Promise<boolean>;
  updateEdicao: (idEdicao: string, body: EdicaoParams) => Promise<void>;
  updateEdicaoActivate: (idEdicao: string, body: EdicaoParams) => Promise<void>;
  deleteEdicao: (idEdicao: string) => Promise<boolean>;
  clearEdicao: () => void;
}

export const EdicaoContext = createContext<EdicaoProviderData>(
  {} as EdicaoProviderData
);

export const useEdicao = () => useContext(EdicaoContext);

export const EdicaoProvider = ({ children }: EdicaoProps) => {
  const [loadingEdicoesList, setLoadingEdicoesList] = useState<boolean>(false);
  const [loadingEdicao, setLoadingEdicao] = useState<boolean>(false);
  const [edicoesList, setEdicoesList] = useState<Edicao[]>([]);
  const [Edicao, setEdicao] = useState<Edicao | null>(null);

  const { showAlert } = useSweetAlert();

  useEffect(() => {
    const storedEdicao = localStorage.getItem("edicaoAtiva");
    if (storedEdicao) {
      try {
        setEdicao(JSON.parse(storedEdicao));
      } catch (_e) {
        localStorage.removeItem("edicaoAtiva");
      }
    }
  }, []);

  useEffect(() => {
    if (Edicao) {
      localStorage.setItem("edicaoAtiva", JSON.stringify(Edicao));
    }
  }, [Edicao]);

  const clearEdicao = useCallback(() => {
    setEdicao(null);
    localStorage.removeItem("edicaoAtiva");
  }, []);

  const listEdicao = useCallback(async () => {
    setLoadingEdicoesList(true);
    try {
      const response = await edicaoApi.listEdicao();
      setEdicoesList(response);
      return response;
    } catch {
      setEdicoesList([]);
      return [];
    } finally {
      setLoadingEdicoesList(false);
    }
  }, []);

  const getEdicaoById = useCallback(async (idEdicao: string) => {
    setLoadingEdicao(true);
    try {
      const response = await edicaoApi.getEdicaoById(idEdicao);
      setEdicao(response);
      setEventEditionIdStorage(response.id);
      return response;
    } catch {
      return null;
    } finally {
      setLoadingEdicao(false);
    }
  }, []);

  const getEdicaoByYear = useCallback(async (year: string) => {
    if (!year) return null;
    setLoadingEdicao(true);
    try {
      const response = await edicaoApi.getEdicaoByYear(year);
      setEdicao(response);
      setEventEditionIdStorage(response.id);
      return response;
    } catch {
      return null;
    } finally {
      setLoadingEdicao(false);
    }
  }, []);

  const createEdicao = useCallback(
    async (body: EdicaoParams): Promise<boolean> => {
      setLoadingEdicao(true);
      try {
        const response = await edicaoApi.createEdicao(body);
        setEdicao(response);
        setEventEditionIdStorage(response.id);
        showAlert({
          icon: "success",
          title: "Edição cadastrada com sucesso!",
          timer: 3000,
          showConfirmButton: false,
        });
        return true;
      } catch (err: unknown) {
        showAlert({
          icon: "error",
          title: "Erro ao cadastrar Edição",
          text: getErrorMessage(
            err,
            "Ocorreu um erro durante o cadastro. Tente novamente mais tarde!",
          ),
          confirmButtonText: "Retornar",
        });
        return false;
      } finally {
        setLoadingEdicao(false);
      }
    },
    [showAlert]
  );

  const updateEdicao = useCallback(
    async (idEdicao: string, body: EdicaoParams) => {
      setLoadingEdicao(true);
      try {
        const response = await edicaoApi.updateEdicaoById(idEdicao, body);
        setEdicao(response);
        setEventEditionIdStorage(response.id);
        showAlert({
          icon: "success",
          title: "Edição atualizada com sucesso!",
          timer: 3000,
          showConfirmButton: false,
        });
      } catch (err: unknown) {
        showAlert({
          icon: "error",
          title: "Erro ao atualizar a Edição",
          text: getErrorMessage(
            err,
            "Ocorreu um erro durante a atualização. Tente novamente mais tarde!",
          ),
          confirmButtonText: "Retornar",
        });
      } finally {
        setLoadingEdicao(false);
      }
    },
    [showAlert]
  );

  const updateEdicaoActivate = useCallback(
    async (idEdicao: string, body: EdicaoParams) => {
      setLoadingEdicao(true);
      try {
        const response = await edicaoApi.updateEdicaoActivate(idEdicao, body);
        setEdicao(response);
        showAlert({
          icon: "success",
          title: "Edição atualizada com sucesso!",
          timer: 3000,
          showConfirmButton: false,
        });
      } catch (err: unknown) {
        showAlert({
          icon: "error",
          title: "Erro ao atualizar a Edição",
          text: getErrorMessage(
            err,
            "Ocorreu um erro durante a edição. Tente novamente mais tarde!",
          ),
          confirmButtonText: "Retornar",
        });
      } finally {
        setLoadingEdicao(false);
      }
    },
    [showAlert]
  );

  const deleteEdicao = useCallback(
    async (idEdicao: string): Promise<boolean> => {
      setLoadingEdicao(true);
      try {
        await edicaoApi.deleteEdicaoById(idEdicao);
        clearEdicao();
        localStorage.removeItem("edicaoAtiva");
        showAlert({
          icon: "success",
          title: "Edição removida com sucesso!",
          timer: 3000,
          showConfirmButton: false,
        });
        return true;
      } catch (err: unknown) {
        showAlert({
          icon: "error",
          title: "Erro ao remover a Edição",
          text: getErrorMessage(
            err,
            "Ocorreu um erro durante a remoção. Tente novamente mais tarde!",
          ),
          confirmButtonText: "Retornar",
        });
        return false;
      } finally {
        setLoadingEdicao(false);
      }
    },
    [clearEdicao, showAlert]
  );

  const contextValue = useMemo(
    () => ({
      loadingEdicao,
      loadingEdicoesList,
      Edicao,
      edicoesList,
      setEdicao,
      listEdicao,
      getEdicaoById,
      getEdicaoByYear,
      createEdicao,
      updateEdicao,
      updateEdicaoActivate,
      deleteEdicao,
      clearEdicao,
    }),
    [
      loadingEdicao,
      loadingEdicoesList,
      Edicao,
      edicoesList,
      listEdicao,
      getEdicaoById,
      getEdicaoByYear,
      createEdicao,
      updateEdicao,
      updateEdicaoActivate,
      deleteEdicao,
      clearEdicao,
    ]
  );

  return (
    <EdicaoContext.Provider value={contextValue}>
      {children}
    </EdicaoContext.Provider>
  );
};