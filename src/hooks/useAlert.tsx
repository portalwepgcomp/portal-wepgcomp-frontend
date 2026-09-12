import { useCallback } from "react";
import Swal, { SweetAlertOptions, SweetAlertResult } from "sweetalert2";
import { obterClassesBotao, VarianteBotao } from "@/lib/estilosBotao";

type OpcoesAlerta = SweetAlertOptions & {
  varianteConfirmacao?: VarianteBotao;
};

function combinarClasses(base: string, adicionais?: string | readonly string[]) {
  return [base, adicionais].flat().filter(Boolean).join(" ");
}

export const useSweetAlert = () => {
  const showAlert = useCallback(
    async ({ varianteConfirmacao = "primary", ...opcoes }: OpcoesAlerta): Promise<SweetAlertResult> => {
      try {
        return await Swal.fire({
          ...opcoes,
          buttonsStyling: false,
          customClass: {
            ...opcoes.customClass,
            actions: combinarClasses("gap-3", opcoes.customClass?.actions),
            confirmButton: combinarClasses(obterClassesBotao(varianteConfirmacao), opcoes.customClass?.confirmButton),
            cancelButton: combinarClasses(obterClassesBotao("danger"), opcoes.customClass?.cancelButton),
            denyButton: combinarClasses(obterClassesBotao("danger"), opcoes.customClass?.denyButton),
          },
        });
      } catch (erro) {
        console.error("Erro ao exibir alerta:", erro);
        throw erro;
      }
    },
    [],
  );

  return {
    showAlert,
  };
};
