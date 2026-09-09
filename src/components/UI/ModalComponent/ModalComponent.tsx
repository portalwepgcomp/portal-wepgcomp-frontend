"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import LoadingPage from "@/components/LoadingPage";
import Button, { VarianteBotao } from "@/components/UI/Button";
import { useModal } from "@/context/ModalProvider";
import { cn } from "@/utils/cn";

interface ModalComponentProps {
  id: string;
  formId?: string;
  loading: boolean;
  children: ReactNode[] | ReactNode;
  labelConfirmButton?: string;
  varianteConfirmacao?: VarianteBotao;
  disabledConfirmButton?: boolean;
  isShortModal?: boolean;
  idCloseModal?: string;
  className?: string;
  onConfirm?: () => void;
  onClose?: () => void;
}

export default function ModalComponent({
  id,
  formId,
  loading,
  labelConfirmButton,
  varianteConfirmacao = "primary",
  onConfirm,
  disabledConfirmButton,
  isShortModal,
  idCloseModal,
  className,
  onClose,
  children,
}: Readonly<ModalComponentProps>) {
  const { isOpen, close } = useModal(id);

  const handleClose = () => {
    onClose?.();
    close();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[2000] flex items-center justify-center p-4",
        className?.includes("modal-above-header") && "z-[10001]",
        className,
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={id}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
        aria-hidden
      />
      <div
        className={cn(
          "relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl",
          isShortModal ? "max-w-md" : "max-w-4xl",
        )}
      >
        {loading ? (
          <LoadingPage />
        ) : (
          <>
            <div className="flex justify-end border-0 p-2">
              <Button size="lg"
                id={idCloseModal ?? "close-modal"}
                type="button"
                onClick={handleClose}
                variante="outline"
                aria-label="Fechar"
              >
                <X  aria-hidden="true" />
              </Button>
            </div>

            <div className="flex flex-col items-start overflow-y-auto px-6 pb-4">
              {children}
            </div>

            {onConfirm && labelConfirmButton && (
              <div className="flex justify-center border-t border-line px-6 py-4">
                <Button size="lg"
                  type={formId ? "submit" : "button"}
                  form={formId}
                  disabled={disabledConfirmButton}
                  variante={varianteConfirmacao}
                  onClick={onConfirm}
                >
                  {labelConfirmButton}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
