"use client";

import ModalComponent from "@/components/UI/ModalComponent/ModalComponent";
import { FormMelhorAvaliador } from "@/components/Forms/MelhoresAvaliadores/FormMelhoresAvaliadores";

export default function ModalMelhoresAvaliadores() {
  return (
    <ModalComponent
      onConfirm={() => {
        const form = document.querySelector("form");
        form?.dispatchEvent(
          new Event("submit", { cancelable: true, bubbles: true }),
        );
      }}
      formId="avaliadores-form"
      id="escolherAvaliadorModal"
      idCloseModal="escolherAvaliadorModalClose"
      loading={false}
      labelConfirmButton="Salvar"
    >
      <div className="w-full text-black">
        <h2 className="mb-4 flex justify-center text-2xl font-bold">
          Escolha os melhores avaliadores
        </h2>
        <div className="flex justify-center">
          <FormMelhorAvaliador />
        </div>
      </div>
    </ModalComponent>
  );
}
