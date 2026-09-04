"use client";

import ModalComponent from "@/components/UI/ModalComponent/ModalComponent";
import FormCriterios from "@/components/Forms/Criterios/FormCriterios";

export default function ModalCriterios() {
  return (
    <ModalComponent
      id="criteriosModal"
      idCloseModal="criteriosModalClose"
      loading={false}
      labelConfirmButton="Salvar"
    >
      <div className="w-full text-black">
        <h1 className="mb-4 flex justify-center text-xl font-bold">
          Critérios de avaliação de apresentações
        </h1>
        <div className="mb-5 flex justify-center">
          <FormCriterios />
        </div>
      </div>
    </ModalComponent>
  );
}
