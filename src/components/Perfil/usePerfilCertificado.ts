"use client";

import { useSweetAlert } from "@/hooks/useAlert";
import { useEdicao } from "@/hooks/useEdicao";
import { useCertificate } from "@/services/certificate";

/**
 * Download do certificado da edição ativa, com feedback (sucesso/erro).
 * Lógica que estava duplicada idêntica nos 4 componentes `Perfil*`.
 */
export function usePerfilCertificado() {
  const { Edicao } = useEdicao();
  const { showAlert } = useSweetAlert();
  const { downloadCertificate } = useCertificate();

  const certificateDownload = async () => {
    const response = await downloadCertificate(Edicao?.id || "");

    if (response === 200) {
      showAlert({
        icon: "success",
        title: "Download feito com sucesso!",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }
    showAlert({
      icon: "error",
      title: response,
      timer: 3000,
      showConfirmButton: false,
    });
  };

  return { certificateDownload };
}
