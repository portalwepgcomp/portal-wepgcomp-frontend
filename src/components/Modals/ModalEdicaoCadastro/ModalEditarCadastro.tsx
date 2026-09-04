"use client";

import { FormCadastroApresentacao } from "@/components/Forms/CadastroApresentacao/FormCadastroApresentacao";
import ModalComponent from "@/components/UI/ModalComponent/ModalComponent";

export default function ModalEditarCadastro() {
  return (
    <ModalComponent
      id="editarApresentacaoModal"
      idCloseModal="editarApresentacaoModalClose"
      loading={false}
      labelConfirmButton="Alterar"
    >
      <div className="mb-5 flex justify-center text-black [&>form]:px-8">
        <FormCadastroApresentacao />
      </div>
    </ModalComponent>
  );
}
