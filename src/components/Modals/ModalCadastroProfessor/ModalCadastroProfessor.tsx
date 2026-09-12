"use client";

import { FormCadastroProfessor } from "@/components/Forms/CadastroProfessor/FormCadastroProfessor";
import ModalComponent from "@/components/UI/ModalComponent/ModalComponent";
import { useModal } from "@/context/ModalProvider";
import { useUsers } from "@/hooks/useUsers";
import { useRef } from "react";

interface ModalCadastroProfessorProps {
  onSuccess?: () => void;
}

export default function ModalCadastroProfessor({
  onSuccess,
}: ModalCadastroProfessorProps) {
  const { loadingCreateProfessor } = useUsers();
  const { close } = useModal("cadastroProfessorModal");
  const formRef = useRef<HTMLFormElement>(null);

  const handleConfirm = () => {
    if (formRef.current) {
      const submitEvent = new Event("submit", {
        cancelable: true,
        bubbles: true,
      });
      formRef.current.dispatchEvent(submitEvent);
    }
  };

  const handleSuccess = () => {
    onSuccess?.();
    close();
  };

  return (
    <ModalComponent
      onConfirm={handleConfirm}
      id="cadastroProfessorModal"
      idCloseModal="cadastroProfessorModalClose"
      loading={loadingCreateProfessor}
      labelConfirmButton="Cadastrar Professor"
      className="modal-above-header"
    >
      <div className="w-full text-black">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold">Cadastrar Novo Professor</h2>
          <p className="mt-2 text-muted">
            Preencha os dados abaixo para cadastrar um novo professor. Uma senha
            temporária será gerada e enviada por email.
          </p>
        </div>

        <div className="w-full">
          <FormCadastroProfessor
            onSuccess={handleSuccess}
            formRef={formRef}
            showButtons={false}
          />
        </div>
      </div>
    </ModalComponent>
  );
}
