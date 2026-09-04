import { ReactNode } from "react";
import Banner from "@/components/UI/Banner";

interface PaginaListagemProps {
  titulo: string;
  /** Slot da barra de ações (busca + botão criar). */
  toolbar?: ReactNode;
  children: ReactNode;
}

/**
 * Shell de layout compartilhado das telas de listagem: Banner + espaçamento +
 * slots. NÃO conhece domínio (Submission, Sessão…), modais nem `useModal`.
 * Substitui a estrutura visual do antigo `templates/Listagem`.
 */
export default function PaginaListagem({
  titulo,
  toolbar,
  children,
}: Readonly<PaginaListagemProps>) {
  return (
    <div className="flex flex-col">
      <Banner title={titulo} />
      <div className="flex flex-col p-16 max-[980px]:p-4">
        {toolbar}
        {children}
      </div>
    </div>
  );
}
