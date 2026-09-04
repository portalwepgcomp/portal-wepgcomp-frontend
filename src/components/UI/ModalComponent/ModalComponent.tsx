"use client";

import LoadingPage from "@/components/LoadingPage";
import Button from "@/components/UI/Button";
import { useModal } from "@/context/ModalProvider";
import { cn } from "@/utils/cn";
import Image from "next/image";
import { ReactNode, useEffect } from "react";

interface ModalComponentProps {
  id: string;
  formId?: string;
  loading: boolean;
  children: ReactNode[] | ReactNode;
  labelConfirmButton?: string;
  colorButtonConfirm?: string;
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
  colorButtonConfirm,
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
        className="absolute inset-0 bg-[#808080ba]"
        onClick={handleClose}
        aria-hidden
      />
      <div
        className={cn(
          "relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-[10px] border-[3px] border-brand-accent bg-white shadow-lg",
          isShortModal ? "max-w-md" : "max-w-4xl",
        )}
      >
        {loading ? (
          <LoadingPage />
        ) : (
          <>
            <div className="flex justify-end border-0 p-2">
              <button
                id={idCloseModal ?? "close-modal"}
                type="button"
                onClick={handleClose}
                className="flex h-8 w-8 cursor-pointer items-center justify-center border-0 bg-transparent"
                aria-label="Fechar"
              >
                <Image
                  src="/assets/images/close.svg"
                  alt=""
                  width={24}
                  height={24}
                />
              </button>
            </div>

            <div className="flex flex-col items-start overflow-y-auto px-6 pb-4">
              {children}
            </div>

            {onConfirm && labelConfirmButton && (
              <div className="flex justify-center border-t border-line px-6 py-4">
                <Button
                  type={formId ? "submit" : "button"}
                  form={formId}
                  disabled={disabledConfirmButton}
                  className="w-48 font-bold"
                  style={
                    colorButtonConfirm
                      ? { backgroundColor: colorButtonConfirm }
                      : undefined
                  }
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
