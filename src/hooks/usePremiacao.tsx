import {
  useContext,
  createContext,
  ReactNode,
  useState,
  useCallback,
  useMemo,
} from "react";

import { useSweetAlert } from "@/hooks/useAlert";
import { premiacaoApi } from "@/services/premiacao";
import {
  AvaliadorParams,
  AuthorOrEvaluator,
  PanelistsParams,
  Premiacoes,
} from "@/models/premiacao";
import { getErrorMessage } from "@/utils/error";

interface SubmissionProps {
  children: ReactNode;
}

interface PremiacaoProviderData {
  loadingPremiacaoList: boolean;
  loadingpremiacao: boolean;
  premiacaoListBanca: Premiacoes[];
  premiacaoListAudiencia: Premiacoes[];
  premiacaoListAvaliadores: AuthorOrEvaluator[];
  premiacaoAvaliadores: AvaliadorParams[];
  listPanelists: PanelistsParams[];
  getPremiacoesBanca: (eventId: string) => Promise<Premiacoes[] | undefined>;
  getPremiacoesAudiencia: (eventId: string) => Promise<Premiacoes[] | undefined>;
  getPremiacoesAvaliadores: (eventId: string) => Promise<AuthorOrEvaluator[] | undefined>;
  createAwardedPanelists: (body: AvaliadorParams) => Promise<void>;
  getPanelists: (eventId: string) => Promise<void>;
}

export const PremiacaoContext = createContext<PremiacaoProviderData>(
  {} as PremiacaoProviderData
);

export const usePremiacao = () => useContext(PremiacaoContext);

export const PremiacaoProvider = ({ children }: SubmissionProps) => {
  const [loadingPremiacaoList, setLoadingPremiacaoList] =
    useState<boolean>(false);
  const [loadingpremiacao, setLoadingpremiacao] = useState<boolean>(false);
  const [premiacaoListBanca, setPremiacaoListBanca] = useState<Premiacoes[]>(
    []
  );
  const [premiacaoListAudiencia, setPremiacaoListAudiencia] = useState<
    Premiacoes[]
  >([]);
  const [premiacaoListAvaliadores, setPremiacaoListAvaliadores] = useState<
    AuthorOrEvaluator[]
  >([]);
  const [premiacaoAvaliadores, setPremiacaoAvaliadores] = useState<
    AvaliadorParams[]
  >([]);

  const [listPanelists, setlistPanelists] = useState<PanelistsParams[]>([]);

  const { showAlert } = useSweetAlert();

  const getPremiacoesBanca = useCallback(
    async (eventId: string) => {
      setLoadingPremiacaoList(true);

      try {
        const response = await premiacaoApi.listTopPanelistsById(eventId);
        setPremiacaoListBanca(response);
        return response;
      } catch (err: unknown) {
        setLoadingpremiacao(false);

        showAlert({
          icon: "error",
          title: "Erro ao listar premiações",
          text: getErrorMessage(err, "Ocorreu um erro durante a busca."),
          confirmButtonText: "Retornar",
        });
      } finally {
        setLoadingPremiacaoList(false);
      }
    },
    [showAlert]
  );

  const getPremiacoesAudiencia = useCallback(
    async (eventId: string) => {
      setLoadingPremiacaoList(true);

      try {
        const response = await premiacaoApi.listTopAudienceById(eventId);
        setPremiacaoListAudiencia(response);
        return response;
      } catch (err: unknown) {
        setLoadingpremiacao(false);

        showAlert({
          icon: "error",
          title: "Erro ao listar premiações",
          text: getErrorMessage(err, "Ocorreu um erro durante a busca."),
          confirmButtonText: "Retornar",
        });
      } finally {
        setLoadingPremiacaoList(false);
      }
    },
    [showAlert]
  );

  const getPremiacoesAvaliadores = useCallback(
    async (eventId: string) => {
      setLoadingPremiacaoList(true);

      try {
        const response = await premiacaoApi.listAwardedPanelistsById(eventId);
        setPremiacaoListAvaliadores(response);
        return response;
      } catch (err: unknown) {
        setLoadingpremiacao(false);

        showAlert({
          icon: "error",
          title: "Erro ao listar premiações",
          text: getErrorMessage(err, "Ocorreu um erro durante a busca."),
          confirmButtonText: "Retornar",
        });
      } finally {
        setLoadingPremiacaoList(false);
      }
    },
    [showAlert]
  );

  const createAwardedPanelists = useCallback(
    async (body: AvaliadorParams) => {
      setLoadingPremiacaoList(true);

      try {
        const response = await premiacaoApi.createAwardedPanelists(body);
        setPremiacaoAvaliadores(response);
        showAlert({
          icon: "success",
          title: "Avaliadores salvos com sucesso!",
          timer: 3000,
          showConfirmButton: false,
        });
      } catch (err: unknown) {
        showAlert({
          icon: "error",
          title: "Erro ao salvar os avaliadores",
          text: getErrorMessage(
            err,
            "Ocorreu um erro durante a escolha dos avaliadores. Tente novamente mais tarde!"
          ),
          confirmButtonText: "Retornar",
        });
      } finally {
        setLoadingPremiacaoList(false);
      }
    },
    [showAlert]
  );

  const getPanelists = useCallback(async (eventId: string) => {
    setLoadingpremiacao(true);
    try {
      const response = await premiacaoApi.getPanelists(eventId);
      setlistPanelists(response);
    } catch {
      setlistPanelists([]);
    } finally {
      setLoadingpremiacao(false);
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      loadingPremiacaoList,
      loadingpremiacao,
      premiacaoListBanca,
      premiacaoListAudiencia,
      premiacaoListAvaliadores,
      premiacaoAvaliadores,
      listPanelists,
      getPremiacoesBanca,
      getPremiacoesAudiencia,
      getPremiacoesAvaliadores,
      getPanelists,
      createAwardedPanelists,
    }),
    [
      loadingPremiacaoList,
      loadingpremiacao,
      premiacaoListBanca,
      premiacaoListAudiencia,
      premiacaoListAvaliadores,
      premiacaoAvaliadores,
      listPanelists,
      getPremiacoesBanca,
      getPremiacoesAudiencia,
      getPremiacoesAvaliadores,
      getPanelists,
      createAwardedPanelists,
    ]
  );

  return (
    <PremiacaoContext.Provider value={contextValue}>
      {children}
    </PremiacaoContext.Provider>
  );
};