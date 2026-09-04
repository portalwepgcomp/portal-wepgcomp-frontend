import { useCallback } from "react";
import Swal, { SweetAlertOptions, SweetAlertResult } from "sweetalert2";

export const useSweetAlert = () => {
  const showAlert = useCallback(
    async (options: SweetAlertOptions): Promise<SweetAlertResult> => {
      try {
        const result = await Swal.fire(options);
        return result;
      } catch (error) {
        console.error("Error showing SweetAlert:", error);
        throw error;
      }
    },
    [],
  );

  return {
    showAlert,
  };
};

