"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface ModalContextValue {
  openModal: (id: string) => void;
  closeModal: (id: string) => void;
  isModalOpen: (id: string) => boolean;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const openModal = useCallback((id: string) => {
    setOpenIds((prev) => new Set(prev).add(id));
  }, []);

  const closeModal = useCallback((id: string) => {
    setOpenIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const isModalOpen = useCallback(
    (id: string) => openIds.has(id),
    [openIds],
  );

  const value = useMemo(
    () => ({ openModal, closeModal, isModalOpen }),
    [openModal, closeModal, isModalOpen],
  );

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
}

export function useModalRegistry() {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error("useModalRegistry deve ser usado dentro de ModalProvider");
  }
  return ctx;
}

/** Hook para um modal específico ou acesso global ao registry. */
export function useModal(modalId?: string) {
  const { openModal, closeModal, isModalOpen } = useModalRegistry();

  return useMemo(
    () => ({
      openModal,
      closeModal,
      open: () => modalId && openModal(modalId),
      close: () => modalId && closeModal(modalId),
      isOpen: modalId ? isModalOpen(modalId) : false,
    }),
    [modalId, openModal, closeModal, isModalOpen],
  );
}
