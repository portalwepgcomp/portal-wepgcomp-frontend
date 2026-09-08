import {
  useContext,
  createContext,
  ReactNode,
  useState,
  useCallback,
  useMemo,
} from "react";

import { useSweetAlert } from "@/hooks/useAlert";

import { uploadApi } from "@/services/upload";
import { registrarErro } from "@/utils/logError";
import { SubmissionFile } from "@/models/submissionFile";
import { getErrorMessage } from "@/utils/error";

interface SubmissionFileProps {
  children: ReactNode;
}

interface SubmissionFileProviderData {
  loadingSubmissionFileList: boolean;
  loadingSubmissionFile: boolean;
  submissionFileList: SubmissionFile[];
  submissionFile: SubmissionFile | null;
  getFiles: () => Promise<void>;
  sendFile: (
    file: File,
    idSubmission: string,
    desiredFilename?: string
  ) => Promise<SubmissionFile | null>;
  deleteFile: (idFile: string) => Promise<unknown>;
}

export const SubmissionFileContext = createContext<SubmissionFileProviderData>(
  {} as SubmissionFileProviderData
);

export const useSubmissionFile = () => useContext(SubmissionFileContext);

export const SubmissionFileProvider = ({ children }: SubmissionFileProps) => {
  const [loadingSubmissionFileList, setLoadingSubmissionFileList] =
    useState<boolean>(false);
  const [loadingSubmissionFile, setLoadingSubmissionFile] =
    useState<boolean>(false);
  const [submissionFileList, setSubmissionFileList] = useState<
    SubmissionFile[]
  >([]);
  const [submissionFile, setSubmissionFile] = useState<SubmissionFile | null>(
    null
  );

  const { showAlert } = useSweetAlert();

  const getFiles = useCallback(async () => {
    setLoadingSubmissionFileList(true);

    try {
      const data = await uploadApi.listFiles();
      setSubmissionFileList(data);
    } catch (err: unknown) {
      registrarErro("Erro no upload/arquivo de submissão", err);
      setSubmissionFileList([]);

      showAlert({
        icon: "error",
        title: "Erro ao listar arquivos",
        text: getErrorMessage(err, "Ocorreu um erro durante a busca."),
        confirmButtonText: "Retornar",
      });
    } finally {
      setLoadingSubmissionFileList(false);
    }
  }, [showAlert]);

  const sendFile = useCallback(
    async (file: File, idUser: string, desiredFilename?: string) => {
      setLoadingSubmissionFile(true);

      try {
        const data = await uploadApi.sendFile(file, idUser, desiredFilename);

        setSubmissionFile(data);
        setLoadingSubmissionFile(false);
        return data;
      } catch (err: unknown) {
        registrarErro("Erro no upload/arquivo de submissão", err);
        setSubmissionFile(null);
        setLoadingSubmissionFile(false);
        return null;
      } finally {
        setLoadingSubmissionFile(false);
      }
    },
    []
  );

  const deleteFile = useCallback(async (idFile: string) => {
    return uploadApi.deleteFile(idFile);
  }, []);

  const contextValue = useMemo(
    () => ({
      loadingSubmissionFileList,
      loadingSubmissionFile,
      submissionFileList,
      submissionFile,
      getFiles,
      sendFile,
      deleteFile,
    }),
    [
      loadingSubmissionFileList,
      loadingSubmissionFile,
      submissionFileList,
      submissionFile,
      getFiles,
      sendFile,
      deleteFile,
    ]
  );

  return (
    <SubmissionFileContext.Provider value={contextValue}>
      {children}
    </SubmissionFileContext.Provider>
  );
};
