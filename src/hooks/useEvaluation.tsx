import {
  useContext,
  createContext,
  ReactNode,
  useState,
  useCallback,
  useMemo,
} from "react";
import { evaluationApi } from "@/services/evaluation";
import { useSweetAlert } from "@/hooks/useAlert";
import { useRouter } from "next/navigation";
import {
  Evaluation,
  EvaluationCriteria,
  EvaluationParams,
  EvaluationCriteriaParams,
} from "@/models/evaluation";
import { getErrorMessage } from "@/utils/error";

interface EvaluationProps {
  children: ReactNode;
}

interface EvaluationProviderData {
  loadingEvaluation: boolean;
  loadingEvaluationCriteria: boolean;
  evaluations: Evaluation[];
  evaluationCriteria: EvaluationCriteria[];
  getEvaluations: (submissionId: string) => Promise<void>;
  getEvaluationByUser: (userId: string) => Promise<void>;
  makeEvaluation: (body: EvaluationParams[]) => Promise<void>;
  getEvaluationCriteria: (eventEditionId: string) => Promise<void>;
  createEvaluationCriteria: (
    body: EvaluationCriteriaParams[]
  ) => Promise<boolean>;
  updateEvaluationCriteria: (
    body: EvaluationCriteriaParams[]
  ) => Promise<boolean>;
}

export const EvaluationContext = createContext<EvaluationProviderData>(
  {} as EvaluationProviderData
);

export const useEvaluation = () => useContext(EvaluationContext);

export const EvaluationProvider = ({ children }: EvaluationProps) => {
  const [loadingEvaluation, setLoadingEvaluation] = useState<boolean>(false);
  const [loadingEvaluationCriteria, setLoadingEvaluationCriteria] =
    useState<boolean>(false);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [evaluationCriteria, setEvaluationCriteria] = useState<
    EvaluationCriteria[]
  >([]);

  const { showAlert } = useSweetAlert();
  const router = useRouter();

  const makeEvaluation = useCallback(
    async (body: EvaluationParams[]) => {
      setLoadingEvaluation(true);
      try {
        const response = await evaluationApi.makeEvaluation(body);
        setEvaluations(response);
        showAlert({
          icon: "success",
          title: "Avaliação realizada com sucesso!",
          timer: 3000,
          showConfirmButton: false,
        });
        router.push("/home");
      } catch (err: unknown) {
        setEvaluations([]);
        showAlert({
          icon: "error",
          title: "Erro ao avaliar",
          text: getErrorMessage(
            err,
            "Ocorreu um erro durante a avaliação. Tente novamente mais tarde!"
          ),
          confirmButtonText: "Retornar",
        });
      } finally {
        setLoadingEvaluation(false);
      }
    },
    [router, showAlert]
  );

  const getEvaluationByUser = useCallback(async (userId: string) => {
    setLoadingEvaluation(true);
    try {
      const response = await evaluationApi.getEvaluationByUser(userId);
      setEvaluations(response);
    } catch {
      setEvaluations([]);
    } finally {
      setLoadingEvaluation(false);
    }
  }, []);

  const getEvaluations = useCallback(async (submissionId: string) => {
    setLoadingEvaluation(true);
    try {
      const response = await evaluationApi.getEvaluation(submissionId);
      setEvaluations(response);
    } catch {
      setEvaluations([]);
    } finally {
      setLoadingEvaluation(false);
    }
  }, []);

  const getEvaluationCriteria = useCallback(async (eventEditionId: string) => {
    setLoadingEvaluation(true);
    try {
      const response = await evaluationApi.getEvaluationCriteria(eventEditionId);
      setEvaluationCriteria(response);
    } catch {
      setEvaluationCriteria([]);
    } finally {
      setLoadingEvaluation(false);
    }
  }, []);

  const createEvaluationCriteria = useCallback(
    async (body: EvaluationCriteriaParams[]) => {
      setLoadingEvaluationCriteria(true);
      try {
        await evaluationApi.createEvaluationCriteria(body);
        showAlert({
          icon: "success",
          title: "Critérios criados com sucesso!",
          timer: 3000,
          showConfirmButton: false,
        });

        return true;
      } catch (err: unknown) {
        showAlert({
          icon: "error",
          title: "Erro ao criar",
          text: getErrorMessage(
            err,
            "Ocorreu um erro durante a criação. Tente novamente mais tarde!"
          ),
          confirmButtonText: "Retornar",
        });
        return false;
      } finally {
        setLoadingEvaluationCriteria(false);
      }
    },
    [showAlert]
  );

  const updateEvaluationCriteria = useCallback(
    async (body: EvaluationCriteriaParams[]) => {
      setLoadingEvaluationCriteria(true);
      try {
        await evaluationApi.updateEvaluationCriteria(body);
        showAlert({
          icon: "success",
          title: "Avaliação atualizada com sucesso!",
          timer: 3000,
          showConfirmButton: false,
        });

        return true;
      } catch (err: unknown) {
        showAlert({
          icon: "error",
          title: "Erro ao atualizar",
          text: getErrorMessage(
            err,
            "Ocorreu um erro durante a atualização. Tente novamente mais tarde!"
          ),
          confirmButtonText: "Retornar",
        });
        return false;
      } finally {
        setLoadingEvaluationCriteria(false);
      }
    },
    [showAlert]
  );

  const contextValue = useMemo(
    () => ({
      loadingEvaluation,
      loadingEvaluationCriteria,
      evaluations,
      evaluationCriteria,
      makeEvaluation,
      getEvaluationByUser,
      getEvaluations,
      getEvaluationCriteria,
      createEvaluationCriteria,
      updateEvaluationCriteria,
    }),
    [
      loadingEvaluation,
      loadingEvaluationCriteria,
      evaluations,
      evaluationCriteria,
      makeEvaluation,
      getEvaluationByUser,
      getEvaluations,
      getEvaluationCriteria,
      createEvaluationCriteria,
      updateEvaluationCriteria,
    ]
  );

  return (
    <EvaluationContext.Provider value={contextValue}>
      {children}
    </EvaluationContext.Provider>
  );
};