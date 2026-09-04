import { useContext } from "react";

import { createContext, ReactNode, useState } from "react";

import { useSweetAlert } from "@/hooks/useAlert";

import { uploadApi } from "@/services/upload";
import { registrarErro } from "@/utils/logError";

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
  deleteFile: (idFile: string) => Promise<any>;
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

  const getFiles = async () => {
    setLoadingSubmissionFileList(true);

    try {
      const data = await uploadApi.listFiles();
      setSubmissionFileList(data);
    } catch (err: any) {
      registrarErro("Erro no upload/arquivo de submissão", err);
      setSubmissionFileList([]);

      showAlert({
        icon: "error",
        title: "Erro ao listar arquivos",
        text:
          err.response?.data?.message?.message ||
          err.response?.data?.message ||
          "Ocorreu um erro durante a busca.",
        confirmButtonText: "Retornar",
      });
    } finally {
      setLoadingSubmissionFileList(false);
    }
  };

  const sendFile = async (file: File, idUser: string, desiredFilename?: string) => {
    setLoadingSubmissionFile(true);

    try {
      const data = await uploadApi.sendFile(file, idUser, desiredFilename);

      setSubmissionFile(data);
      setLoadingSubmissionFile(false);
      return data;
    } catch (err: any) {
      registrarErro("Erro no upload/arquivo de submissão", err);
      setSubmissionFile(null);
      setLoadingSubmissionFile(false);
      return null;
    } finally {
      setLoadingSubmissionFile(false);
    }
  };

  const deleteFile = async (idFile: string) => {
      return uploadApi.deleteFile(idFile);
    }

  return (
    <SubmissionFileContext.Provider
      value={{
        loadingSubmissionFileList,
        loadingSubmissionFile,
        submissionFileList,
        submissionFile,
        getFiles,
        sendFile,
        deleteFile,
      }}
    >
      {children}
    </SubmissionFileContext.Provider>
  );
};
