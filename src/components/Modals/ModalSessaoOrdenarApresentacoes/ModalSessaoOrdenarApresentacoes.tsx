"use client";

import DraggableList, {
  DraggedMovement,
} from "@/components/DraggableList/DraggableList";
import ModalComponent from "@/components/UI/ModalComponent/ModalComponent";
import { useEdicao } from "@/hooks/useEdicao";
import { useSession } from "@/hooks/useSession";
import { useEffect, useState } from "react";

export default function ModalSessaoOrdenarApresentacoes() {
  const { swapPresentationsOnSession, sessao } = useSession();
  const { Edicao } = useEdicao();
  const [listaOrdenada, setListaOrdenada] = useState<any[]>([]);

  useEffect(() => {
    const listaOrdenadaSessao =
      sessao?.presentations
        ?.toSorted((a, b) => a.positionWithinBlock - b.positionWithinBlock)
        .map((p) => p.submission) || [];
    setListaOrdenada(listaOrdenadaSessao);
  }, [sessao]);

  const getPresentationId = (id: string): string =>
    sessao?.presentations?.find((p) => p.submissionId == id)?.id || "";

  const handleOnChangeOrder = async (
    data: any[],
    draggedMovement: DraggedMovement[],
  ) => {
    if (!sessao?.id || !Edicao?.id) return;

    const swapPresentationBodies = draggedMovement
      .map(
        (movement) =>
          ({
            presentation1Id: getPresentationId(movement.fromId),
            presentation2Id: getPresentationId(movement.toId),
          }) as SwapPresentationsOnSession,
      )
      .filter((x) => x.presentation1Id && x.presentation2Id);

    if (swapPresentationBodies.length === 0) return;

    await swapPresentationsOnSession(sessao.id, Edicao.id, swapPresentationBodies);

    setListaOrdenada(data);
    setTimeout(() => {
      window.location.reload();
    }, 1800);
  };

  return (
    <ModalComponent
      id="trocarOrdemApresentacao"
      loading={false}
      labelConfirmButton="Confirmar"
      idCloseModal="trocarOrdemApresentacaoClose"
    >
      <div className="m-4 mt-0 text-black">
        <h3 className="mb-4 text-xl font-bold">
          Mudar ordenação das apresentações
        </h3>

        <div className="mb-4 mt-4">
          <p className="mb-2 text-sm font-bold">
            Arraste os itens para alterar a ordenação
          </p>
          <DraggableList
            list={listaOrdenada}
            labelTitle="title"
            labelSubtitle="abstract"
            componentParentId="trocarOrdemApresentacao"
            onChangeOrder={handleOnChangeOrder}
          />
        </div>
      </div>
    </ModalComponent>
  );
}
