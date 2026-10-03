"use client";

import { type ReactNode, useContext, useState } from "react";
import HtmlEditor from "../HtmlEditor/HtmlEditor";

import { AuthContext } from "@/context/AuthProvider/authProvider";
import { useEdicao } from "@/hooks/useEdicao";
import Button from "@/components/UI/Button";
import { isAdminLevel } from "@/components/Perfil/perfilLabels";

interface HtmlEditorComponentProps {
  content: string;
  onChange: (value: string) => void;
  handleEditField?: () => void | boolean;
  /** Conteúdo extra exibido somente no modo Editar (antes do Salvar). */
  editExtras?: ReactNode;
}

export default function HtmlEditorComponent({
  content,
  onChange,
  handleEditField,
  editExtras,
}: Readonly<HtmlEditorComponentProps>) {
  const [toggleEditor, setToggleEditor] = useState(false);
  const { user } = useContext(AuthContext);
  const { Edicao } = useEdicao();

  const isAdm = isAdminLevel(user?.level);
  const isEditing = isAdm && toggleEditor;

  return (
    <div className="flex flex-col">
      {!isEditing ? (
        <div dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <>
          <HtmlEditor value={content} onChange={onChange} />
          {editExtras}
        </>
      )}

      {isAdm && (
        <div className="flex justify-end gap-2">
          {handleEditField && (
            <Button
              size="lg"
              variante={toggleEditor ? "primary" : "outline"}
              type="button"
              className="mt-4 self-end"
              onClick={() => {
                if (toggleEditor && handleEditField() === false) return;
                setToggleEditor(!toggleEditor);
              }}
              disabled={!Edicao?.isActive}
            >
              {!toggleEditor ? "Editar" : "Salvar"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
