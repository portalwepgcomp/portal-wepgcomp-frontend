"use client";

import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";
import { useSweetAlert } from "@/hooks/useAlert";
import { emailApi } from "@/services/emailApi";
import { ProfileType, RoleType, SubprofileType } from "@/models/user";
import { getErrorMessage } from "@/utils/error";

interface SendGroupEmailParams {
  subject: string;
  message: string;
  filters: {
    profiles?: ProfileType[];
    roles?: RoleType[];
    subprofiles?: SubprofileType[];
  };
}

interface SendGroupEmailResponse {
  success: boolean;
  sentCount: number;
  failedCount: number;
  message: string;
}

interface EmailContextData {
  sendGroupEmail: (params: SendGroupEmailParams) => Promise<SendGroupEmailResponse | null>;
  sendingEmail: boolean;
}

const EmailContext = createContext<EmailContextData>({} as EmailContextData);

interface EmailProviderProps {
  children: ReactNode;
}

export const EmailProvider = ({ children }: EmailProviderProps) => {
  const { showAlert } = useSweetAlert();
  const [sendingEmail, setSendingEmail] = useState(false);

  const sendGroupEmail = useCallback(
    async (params: SendGroupEmailParams): Promise<SendGroupEmailResponse | null> => {
      setSendingEmail(true);

      try {
        const response = await emailApi.sendGroupEmail(params);

        showAlert({
          icon: "success",
          title: "E-mail Enviado!",
          text: response.message || `E-mail enviado com sucesso para ${response.sentCount} destinatário(s).`,
        });

        return response;
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err, "Ocorreu um erro ao enviar o e-mail.");

        showAlert({
          icon: "error",
          title: "Erro ao Enviar E-mail",
          text: errorMessage,
        });

        return null;
      } finally {
        setSendingEmail(false);
      }
    },
    [showAlert]
  );

  const contextValue = useMemo(
    () => ({
      sendGroupEmail,
      sendingEmail,
    }),
    [sendGroupEmail, sendingEmail]
  );

  return (
    <EmailContext.Provider value={contextValue}>
      {children}
    </EmailContext.Provider>
  );
};

export const useEmails = (): EmailContextData => {
  const context = useContext(EmailContext);

  if (!context) {
    throw new Error("useEmails must be used within an EmailProvider");
  }

  return context;
};
