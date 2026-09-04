import Image from "next/image";

interface ListaVaziaProps {
  mensagem?: string;
}

/**
 * Estado vazio compartilhado (ícone + mensagem). Extraído de `ListagemVazio`,
 * agora com mensagem configurável para reuso em qualquer feature.
 */
export default function ListaVazia({
  mensagem = "Essa lista ainda está vazia",
}: Readonly<ListaVaziaProps>) {
  return (
    <div className="me-5 mt-4 flex items-center justify-center p-3">
      <h4 className="mb-0 flex items-center gap-3 text-[#555555]">
        <Image
          src="/assets/images/empty_box.svg"
          alt="Lista vazia"
          width={90}
          height={90}
        />
        {mensagem}
      </h4>
    </div>
  );
}
