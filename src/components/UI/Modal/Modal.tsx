"use client";

import Button from "@/components/UI/Button";
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
            <Button size="lg"
              type="button"
              onClick={() => closeModal()}
              variante="outline"
              className="relative left-[94%] top-5 max-[480px]:left-[88%]"
              aria-label="Fechar"
            >
              <X  aria-hidden="true" />
            </Button>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
