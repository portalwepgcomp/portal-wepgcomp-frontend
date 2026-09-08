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
import { submissionApi } from "@/services/submission";
import { registrarErro } from "@/utils/logError";
import { Submission, SubmissionParams } from "@/models/submission";
import { getErrorMessage } from "@/utils/error";

interface SubmissionProps {
  children: ReactNode;
}

interface SubmissionProviderData {
  loadingSubmission: boolean;
  submission: Submission | null;
  setSubmission: Dispatch<SetStateAction<Submission | null>>;
  getSubmissionById: (idSubmission: string) => Promise<void>;
  createSubmission: (body: SubmissionParams) => Promise<boolean>;
  updateSubmissionById: (
    idSubmission: string,
    body: SubmissionParams
  ) => Promise<boolean>;
  deleteSubmissionById: (idSubmission: string) => Promise<void>;
}

export const SubmissionContext = createContext<SubmissionProviderData>(
  {} as SubmissionProviderData
);

export const useSubmission = () => useContext(SubmissionContext);

export const SubmissionProvider = ({ children }: SubmissionProps) => {
  const [loadingSubmission, setLoadingSubmission] = useState<boolean>(false);
  const [submission, setSubmission] = useState<Submission | null>(null);

  const { showAlert } = useSweetAlert();
  const queryClient = useQueryClient();

  const invalidarListas = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["submissions"] }),
    [queryClient]
  );

  const getSubmissionById = useCallback(
    async (idSubmission: string) => {
      setLoadingSubmission(true);

      try {
        const response = await submissionApi.getSubmissionById(idSubmission);
        setSubmission(response);
      } catch (err: unknown) {
        registrarErro("Erro na requisição de submissão", err);
        setSubmission(null);

        showAlert({
          icon: "error",
          title: "Erro ao buscar apresentação",
          text: getErrorMessage(err, "Ocorreu um erro durante a busca."),
          confirmButtonText: "Retornar",
        });
      } finally {
        setLoadingSubmission(false);
      }
    },
    [showAlert]
  );

  const createSubmission = useCallback(
    async (body: SubmissionParams) => {
      setLoadingSubmission(true);

      try {
        const response = await submissionApi.createSubmission(body);
        setSubmission(response);
        invalidarListas();

        showAlert({
          icon: "success",
          title: "Apresentação cadastrada com sucesso!",
          timer: 3000,
          showConfirmButton: false,
        });

        return true;
      } catch (err: unknown) {
        showAlert({
          icon: "error",
          title: "Erro ao cadastrar apresentação",
          text: getErrorMessage(
            err,
            "Ocorreu um erro durante o cadastro. Tente novamente mais tarde!"
          ),
          confirmButtonText: "Retornar",
        });

        return false;
      } finally {
        setLoadingSubmission(false);
      }
    },
    [invalidarListas, showAlert]
  );

  const updateSubmissionById = useCallback(
    async (idSubmission: string, body: SubmissionParams) => {
      setLoadingSubmission(true);

      try {
        const response = await submissionApi.updateSubmissionById(
          idSubmission,
          body
        );
        setSubmission(response);
        invalidarListas();

        showAlert({
          icon: "success",
          title: "Apresentação editada com sucesso!",
          timer: 3000,
          showConfirmButton: false,
        });

        return true;
      } catch (err: unknown) {
        showAlert({
          icon: "error",
          title: "Erro ao editar apresentação",
          text: getErrorMessage(
            err,
            "Ocorreu um erro durante a edição. Tente novamente mais tarde!"
          ),
          confirmButtonText: "Retornar",
        });

        return false;
      } finally {
        setLoadingSubmission(false);
      }
    },
    [invalidarListas, showAlert]
  );

  const deleteSubmissionById = useCallback(
    async (idSubmission: string) => {
      setLoadingSubmission(true);

      try {
        const response = await submissionApi.deleteSubmissionById(idSubmission);
        setSubmission(response);
        invalidarListas();

        showAlert({
          icon: "success",
          title: "Apresentação removida com sucesso!",
          timer: 3000,
          showConfirmButton: false,
        });
      } catch (err: unknown) {
        registrarErro("Erro na requisição de submissão", err);
        setSubmission(null);

        showAlert({
          icon: "error",
          title: "Erro ao remover apresentação",
          text: getErrorMessage(
            err,
            "Ocorreu um erro durante a remoção. Tente novamente mais tarde!"
          ),
          confirmButtonText: "Retornar",
        });
      } finally {
        setLoadingSubmission(false);
      }
    },
    [invalidarListas, showAlert]
  );

  const contextValue = useMemo(
    () => ({
      loadingSubmission,
      submission,
      setSubmission,
      getSubmissionById,
      createSubmission,
      updateSubmissionById,
      deleteSubmissionById,
    }),
    [
      loadingSubmission,
      submission,
      setSubmission,
      getSubmissionById,
      createSubmission,
      updateSubmissionById,
      deleteSubmissionById,
    ]
  );

  return (
    <SubmissionContext.Provider value={contextValue}>
      {children}
    </SubmissionContext.Provider>
  );
};
