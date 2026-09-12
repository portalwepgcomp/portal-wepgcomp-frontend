"use client";

import { useContext, useState } from "react";
import HtmlEditor from "../HtmlEditor/HtmlEditor";

import { AuthContext } from "@/context/AuthProvider/authProvider";
import { useEdicao } from "@/hooks/useEdicao";
import Button from "@/components/UI/Button";
import { isAdminLevel } from "@/components/Perfil/perfilLabels";

interface HtmlEditorComponentProps {
  content: string;
  onChange: (value: string) => void;
  handleEditField?: () => void;
}

export default function HtmlEditorComponent({
  content,
  onChange,
  handleEditField,
}: Readonly<HtmlEditorComponentProps>) {
  const [toggleEditor, setToggleEditor] = useState<boolean>(false);
  const { user } = useContext(AuthContext);
  const { Edicao } = useEdicao();

  const isAdm = isAdminLevel(user?.level);

  return (
    <div className="flex flex-col">
      {!isAdm || !toggleEditor ? (
        <div dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <HtmlEditor value={content} onChange={onChange} />
      )}

      {isAdm && (
        <div className="flex justify-end gap-2">
          {handleEditField && (
            <Button
              type="button"
              className="mt-4 self-end bg-success px-8 py-2 hover:bg-success"
              onClick={() => {
                if (toggleEditor) {
                  handleEditField();
                }
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
