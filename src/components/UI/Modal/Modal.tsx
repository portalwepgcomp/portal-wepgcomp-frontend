"use client";

import Image from "next/image";
import { useState } from "react";

export default function Modal({
  content,
  reference,
}: {
  content: React.ReactNode;
  reference: React.RefObject<HTMLButtonElement>;
}) {
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
            className="fixed inset-0 flex items-center justify-center bg-[#808080ba]"
            onClick={() => closeModal()}
            aria-hidden
          />
          <div className="fixed left-1/2 top-[55%] w-[80vw] max-w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-[10px] border-[3px] border-brand-accent bg-white max-[480px]:w-screen">
            <button
              type="button"
              onClick={() => closeModal()}
              className="relative left-[94%] top-5 h-6 w-6 cursor-pointer border-0 bg-transparent max-[480px]:left-[88%]"
              aria-label="Fechar"
            >
              <Image
                src="/assets/images/close.svg"
                alt="ícone de fechar"
                width={24}
                height={24}
                priority
              />
            </button>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
