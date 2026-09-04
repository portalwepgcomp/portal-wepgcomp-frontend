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
    <div className="w-full">
      <Banner title={titulo} />
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex flex-col gap-6">
        {toolbar}
        {children}
      </div>
    </div>
  );
}
