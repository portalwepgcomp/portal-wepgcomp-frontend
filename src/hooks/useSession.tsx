import {
  useContext,
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
  useCallback,
  useMemo,
} from "react";

import { useQueryClient } from "@tanstack/react-query";

import { useSweetAlert } from "@/hooks/useAlert";
import { useSweetToast } from "@/hooks/useToast";
import { sessionApi } from "@/services/sessions";
import {
  PresentationBlock,
  PresentationBlockParams,
  SwapPresentationsOnSession,
} from "@/models/session";
import { getErrorMessage } from "@/utils/error";

interface SessionProps {
  children: ReactNode;
}

interface SessionProviderData {
  loadingSessao: boolean;
  sessao: PresentationBlock | null;
  setSessao: Dispatch<SetStateAction<PresentationBlock | null>>;
  getSessionById: (idSession: string) => Promise<void>;
  createSession: (
    eventEditionId: string,
    body: PresentationBlockParams
  ) => Promise<boolean>;
  updateSession: (
    idSession: string,
    eventEditionId: string,
    body: PresentationBlockParams
  ) => Promise<boolean>;
  deleteSession: (idSession: string, eventEditionId?: string) => Promise<boolean>;
  swapPresentationsOnSession: (
    idSession: string,
    eventEditionId?: string,
    bodies?: SwapPresentationsOnSession[]
  ) => Promise<boolean>;
}

export const SessionContext = createContext<SessionProviderData>(
  {} as SessionProviderData
);

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }: SessionProps) => {
  const [loadingSessao, setLoadingSessao] = useState<boolean>(false);
  const [sessao, setSessao] = useState<PresentationBlock | null>(null);

  const { showAlert } = useSweetAlert();
  const { showToast } = useSweetToast();
  const queryClient = useQueryClient();

  const invalidarSessoes = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["sessions"] }),
    [queryClient]
  );

  const getSessionById = useCallback(async (idSession: string) => {
    setLoadingSessao(true);
    try {
      const response = await sessionApi.getSessionById(idSession);
      setSessao(response);
    } catch {
      setSessao(null);
    } finally {
      setLoadingSessao(false);
    }
  }, []);

  const createSession = useCallback(
    async (_eventEditionId: string, body: PresentationBlockParams) => {
      setLoadingSessao(true);
      try {
        const response = await sessionApi.createSession(body);
        setSessao(response);
        invalidarSessoes();
        showAlert({
          icon: "success",
          title: "Cadastro de sessão realizado com sucesso!",
          timer: 3000,
          showConfirmButton: false,
        });

        return true;
      } catch (err: unknown) {
        showAlert({
          icon: "error",
          title: "Erro ao cadastrar sessão",
          text: getErrorMessage(
            err,
            "Ocorreu um erro durante o cadastro. Tente novamente mais tarde!"
          ),
          confirmButtonText: "Retornar",
        });
        return false;
      } finally {
        setLoadingSessao(false);
      }
    },
    [invalidarSessoes, showAlert]
  );

  const updateSession = useCallback(
    async (
      idSession: string,
      _eventEditionId: string,
      body: PresentationBlockParams
    ) => {
      setLoadingSessao(true);
      try {
        const response = await sessionApi.updateSessionById(idSession, body);
        setSessao(response);
        invalidarSessoes();
        showAlert({
          icon: "success",
          title: "Atualização de sessão realizada com sucesso!",
          timer: 3000,
          showConfirmButton: false,
        });

        return true;
      } catch (err: unknown) {
        showAlert({
          icon: "error",
          title: "Erro ao atualizar sessão",
          text: getErrorMessage(
            err,
            "Ocorreu um erro durante o cadastro. Tente novamente mais tarde!"
          ),
          confirmButtonText: "Retornar",
        });
        return false;
      } finally {
        setLoadingSessao(false);
      }
    },
    [invalidarSessoes, showAlert]
  );

  const deleteSession = useCallback(
    async (idSession: string, _eventEditionId?: string) => {
      setLoadingSessao(true);
      try {
        await sessionApi.deleteSessionById(idSession);
        invalidarSessoes();
        showAlert({
          icon: "success",
          title: "Sessão deletada com sucesso!",
          timer: 3000,
          showConfirmButton: false,
        });

        return true;
      } catch (err: unknown) {
        showAlert({
          icon: "error",
          title: "Erro ao deletar sessão",
          text: getErrorMessage(
            err,
            "Ocorreu um erro durante a deleção. Tente novamente mais tarde!"
          ),
          confirmButtonText: "Retornar",
        });
        return false;
      } finally {
        setSessao(null);
        setLoadingSessao(false);
      }
    },
    [invalidarSessoes, showAlert]
  );

  const swapPresentationsOnSession = useCallback(
    async (
      idSession: string,
      _eventEditionId?: string,
      presentations: SwapPresentationsOnSession[] = []
    ) => {
      setLoadingSessao(true);
      const body = { presentations };
      try {
        await sessionApi.swapPresentationsOnSession(idSession, body);
        invalidarSessoes();
        showToast({
          icon: "success",
          title:
            "Troca na ordem das apresentações da sessão realizada com sucesso!",
        });

        return true;
      } catch {
        showToast({
          icon: "error",
          title: "Erro na troca da ordem das apresentações da sessão",
        });

        return false;
      } finally {
        setLoadingSessao(false);
      }
    },
    [invalidarSessoes, showToast]
  );

  const contextValue = useMemo(
    () => ({
      loadingSessao,
      sessao,
      setSessao,
      getSessionById,
      createSession,
      updateSession,
      deleteSession,
      swapPresentationsOnSession,
    }),
    [
      loadingSessao,
      sessao,
      setSessao,
      getSessionById,
      createSession,
      updateSession,
      deleteSession,
      swapPresentationsOnSession,
    ]
  );

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
};
