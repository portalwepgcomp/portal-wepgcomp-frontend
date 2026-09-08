import Image from "next/image";

interface GerenciarListaVaziaProps {
  comFiltros: boolean;
}

export default function GerenciarListaVazia({
  comFiltros,
}: GerenciarListaVaziaProps) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-[#e9ecef] bg-white p-12 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
      <div className="max-w-[400px] text-center">
        <Image
          src="/assets/images/empty_box.svg"
          alt="Lista vazia"
          width={90}
          height={90}
        />
        <h4 className="my-4 mb-2 text-xl font-semibold text-[#495057]">
          {comFiltros
            ? "Nenhum usuário encontrado"
            : "Nenhum usuário cadastrado"}
        </h4>
        <p className="m-0 text-base leading-normal text-[#6c757d]">
          {comFiltros
            ? "Tente ajustar os filtros de busca"
            : "Os usuários aparecerão aqui quando forem cadastrados"}
        </p>
      </div>
    </div>
  );
}
