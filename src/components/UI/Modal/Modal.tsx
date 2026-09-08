"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface ModalProps {
  content: React.ReactNode;
  reference: React.RefObject<HTMLButtonElement>;
}

export default function Modal({ content, reference }: Readonly<ModalProps>) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const openModal = () => {
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsOpen(false);
    document.body.style.overflow = "auto";
  };

  return (
    <>
      <button
        ref={reference}
        onClick={() => openModal()}
        className="hidden"
        type="button"
      />
      {isOpen && (
        <div className="fixed inset-0 z-[100]">
          <div
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => closeModal()}
            aria-hidden
          />
          <div className="fixed left-1/2 top-[50%] w-[85vw] max-w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white shadow-2xl max-[480px]:w-[95vw]">
            <button
              type="button"
              onClick={() => closeModal()}
              className="relative left-[94%] top-5 h-6 w-6 cursor-pointer border-0 bg-transparent text-muted hover:text-foreground max-[480px]:left-[88%]"
              aria-label="Fechar"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
