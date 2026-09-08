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
    if (!Edicao?.id) {
      showAlert({
        icon: "warning",
        title: "Edição não selecionada",
        text: "Por favor, selecione uma edição do evento para baixar o certificado.",
        timer: 3500,
        showConfirmButton: false,
      });
      return;
    }

    const response = await downloadCertificate(Edicao.id);

    if (response === 200) {
      showAlert({
        icon: "success",
        title: "Download concluído com sucesso!",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

    let mensagemErro = "Certificado ainda não disponível para o seu usuário nesta edição.";
    if (typeof response === "string" && response.trim()) {
      const respLower = response.toLowerCase();
      if (respLower.includes("not found") || respLower.includes("não encontrado") || respLower.includes("404")) {
        mensagemErro = "Nenhum certificado encontrado para o seu usuário nesta edição.";
      } else if (respLower.includes("not generated") || respLower.includes("não gerado")) {
        mensagemErro = "Os certificados desta edição ainda estão em fase de emissão pela comissão organizadora.";
      } else {
        mensagemErro = response;
      }
    }

    showAlert({
      icon: "info",
      title: "Certificado não disponível",
      text: mensagemErro,
      confirmButtonText: "Entendido",
    });
  };

  return { certificateDownload };
}
