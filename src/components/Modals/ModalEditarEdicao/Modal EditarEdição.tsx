"use client";

import { FormEdicao } from "@/components/Forms/CadastroEdicao/FormEdicao";
import ModalComponent from "@/components/UI/ModalComponent/ModalComponent";
import { Edicao } from "@/models/edicao";

interface ModalEditarEdicaoProps {
  edicaoData: Edicao | null;
}

export default function ModalEditarEdicao({
  edicaoData,
}: Readonly<ModalEditarEdicaoProps>) {
  return (
    <ModalComponent
      id="editarEdicaoModal"
      loading={false}
      labelConfirmButton="Alterar"
    >
      <div className="text-black">
        <h1 className="mb-4 mt-2 flex justify-center text-2xl font-bold">
          Editar Evento
        </h1>
        <div className="mb-5 flex justify-center">
          <FormEdicao edicaoData={edicaoData} />
        </div>
      </div>
    </ModalComponent>
  );
}
