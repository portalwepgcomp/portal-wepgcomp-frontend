import {
  useContext,
  createContext,
  ReactNode,
  useState,
  useCallback,
  useMemo,
} from "react";

import { useSweetAlert } from "@/hooks/useAlert";
import { orientacoesApi } from "@/services/orientacoes";
import { Orientacao, OrientacaoParams } from "@/models/orientacoes";
import { getErrorMessage } from "@/utils/error";

interface OrientacaoProps {
  children: ReactNode;
}

interface OrientacaoProviderData {
  loadingOrientacoes: boolean;
  loadingOrientacao: boolean;
  orientacoes: Orientacao | null;
  orientacao: Orientacao | null;
  getOrientacoes: () => Promise<void>;
  getOrientacaoById: (idOrientacao: string) => Promise<void>;
  postOrientacao: (body: OrientacaoParams) => Promise<void>;
  putOrientacao: (idOrientacao: string, body: OrientacaoParams) => Promise<void>;
  deleteOrientacao: (idOrientacao: string) => Promise<void>;
}

export const OrientacaoContext = createContext<OrientacaoProviderData>(
  {} as OrientacaoProviderData
);

export const useOrientacao = () => useContext(OrientacaoContext);

export const OrientacaoProvider = ({ children }: OrientacaoProps) => {
  const [loadingOrientacoes, setLoadingOrientacoes] = useState<boolean>(false);
  const [loadingOrientacao, setLoadingOrientacao] = useState<boolean>(false);
  const [orientacoes, setOrientacoes] = useState<Orientacao | null>(null);
  const [orientacao, setOrientacao] = useState<Orientacao | null>(null);

  const { showAlert } = useSweetAlert();

  const getOrientacoes = useCallback(async () => {
    setLoadingOrientacoes(true);
    try {
      const response = await orientacoesApi.getOrientacoes();
      setOrientacoes(response);
    } catch {
      setOrientacoes(null);
    } finally {
      setLoadingOrientacoes(false);
    }
  }, []);

  const getOrientacaoById = useCallback(async (idOrientacao: string) => {
    setLoadingOrientacoes(true);
    try {
      const response = await orientacoesApi.getOrientacaoById(idOrientacao);
      setOrientacao(response);
    } catch {
      setOrientacao(null);
    } finally {
      setLoadingOrientacoes(false);
    }
  }, []);

  const postOrientacao = useCallback(
    async (body: OrientacaoParams) => {
      setLoadingOrientacao(true);
      try {
        const response = await orientacoesApi.postOrientacao(body);
        setOrientacao(response);
        showAlert({
          icon: "success",
          title: "Cadastro realizado com sucesso!",
          timer: 3000,
          showConfirmButton: false,
        });
      } catch (err: unknown) {
        setOrientacao(null);
        showAlert({
          icon: "error",
          title: "Erro ao cadastrar orientação",
          text: getErrorMessage(
            err,
            "Ocorreu um erro durante o cadastro. Tente novamente mais tarde!",
          ),
          confirmButtonText: "Retornar",
        });
      } finally {
        setLoadingOrientacao(false);
      }
    },
    [showAlert]
  );

  const putOrientacao = useCallback(
    async (idOrientacao: string, body: OrientacaoParams) => {
      setLoadingOrientacao(true);
      try {
        const response = await orientacoesApi.putOrientacao(idOrientacao, body);
        setOrientacao(response);
        showAlert({
          icon: "success",
          title: "Atualização realizada com sucesso!",
          timer: 3000,
          showConfirmButton: false,
        });
      } catch (err: unknown) {
        showAlert({
          icon: "error",
          title: "Erro ao atualizar orientação",
          text: getErrorMessage(
            err,
            "Ocorreu um erro durante a atualização. Tente novamente mais tarde!",
          ),
          confirmButtonText: "Retornar",
        });
      } finally {
        setLoadingOrientacao(false);
      }
    },
    [showAlert]
  );

  const deleteOrientacao = useCallback(
    async (idOrientacao: string) => {
      setLoadingOrientacao(true);
      try {
        await orientacoesApi.deleteOrientacaoById(idOrientacao);
        showAlert({
          icon: "success",
          title: "Orientação deletada com sucesso!",
          timer: 3000,
          showConfirmButton: false,
        });
        await getOrientacoes();
      } catch (err: unknown) {
        showAlert({
          icon: "error",
          title: "Erro ao deletar orientação",
          text: getErrorMessage(
            err,
            "Ocorreu um erro durante a deleção. Tente novamente mais tarde!",
          ),
          confirmButtonText: "Retornar",
        });
      } finally {
        setOrientacao(null);
        setLoadingOrientacao(false);
      }
    },
    [getOrientacoes, showAlert]
  );

  const contextValue = useMemo(
    () => ({
      loadingOrientacao,
      loadingOrientacoes,
      orientacoes,
      orientacao,
      getOrientacoes,
      getOrientacaoById,
      postOrientacao,
      putOrientacao,
      deleteOrientacao,
    }),
    [
      loadingOrientacao,
      loadingOrientacoes,
      orientacoes,
      orientacao,
      getOrientacoes,
      getOrientacaoById,
      postOrientacao,
      putOrientacao,
      deleteOrientacao,
    ]
  );

  return (
    <OrientacaoContext.Provider value={contextValue}>
      {children}
    </OrientacaoContext.Provider>
  );
};
