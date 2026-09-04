"use client";

import { useEffect, useState } from "react";
import HtmlEditorComponent from "../HtmlEditorComponent/HtmlEditorComponent";

import { useOrientacao } from "@/hooks/useOrientacao";
import { getEventEditionIdStorage } from "@/context/AuthProvider/util";

export default function OrientacoesAvaliadores() {
  const { putOrientacao, orientacoes, getOrientacoes } = useOrientacao();

  const [content, setContent] = useState(orientacoes?.reviewerGuidance || "");

  const handleEditOrientacao = () => {
    const idOrientacao = orientacoes?.id;
    const eventEditionId = getEventEditionIdStorage();

    if (idOrientacao) {
      putOrientacao(idOrientacao, {
        eventEditionId: eventEditionId ?? "",
        reviewerGuidance: content,
      });
      getOrientacoes()
    }
  };

  useEffect(() => {
    setContent(orientacoes?.reviewerGuidance || "");
  }, [orientacoes?.reviewerGuidance]);

  return (
    <div className="w-full px-[6.25rem] pb-4 text-black max-md:px-4">
      <HtmlEditorComponent
        content={content}
        onChange={(newValue) => setContent(newValue)}
        handleEditField={handleEditOrientacao}
      />
    </div>
  );
}
