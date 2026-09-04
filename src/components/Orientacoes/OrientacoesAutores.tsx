"use client";

import HtmlEditorComponent from "../HtmlEditorComponent/HtmlEditorComponent";
import { useEffect, useState } from "react";
import { useOrientacao } from "@/hooks/useOrientacao";

import { getEventEditionIdStorage } from "@/context/AuthProvider/util";

export default function OrientacoesAutores() {
  const { putOrientacao, orientacoes, getOrientacoes } = useOrientacao();

  const [content, setContent] = useState(orientacoes?.authorGuidance || "");

  const handleEditOrientacao = () => {
    const idOrientacao = orientacoes?.id;
    const eventEditionId = getEventEditionIdStorage();

    if (idOrientacao) {
      putOrientacao(idOrientacao, {
        eventEditionId: eventEditionId ?? "",
        authorGuidance: content,
      });
      getOrientacoes()
    }
  };

  useEffect(() => {
    setContent(orientacoes?.authorGuidance || "");
  }, [orientacoes?.authorGuidance]);

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
