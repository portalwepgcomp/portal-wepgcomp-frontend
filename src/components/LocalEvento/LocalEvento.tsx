"use client";

import Contato from "@/components/Contato";
import Endereco from "@/components/Endereco/Endereco";

export default function LocalEvento() {
  return (
    <section
      id="Contato"
      className="flex w-full items-center justify-center bg-brand-slate p-8"
    >
      <div className="flex w-[80%] flex-row justify-evenly gap-8 max-xl:w-full max-xl:flex-col">
        <Contato />
        <Endereco />
      </div>
    </section>
  );
}
