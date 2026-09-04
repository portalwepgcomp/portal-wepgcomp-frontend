"use client";

import Contato from "@/components/Contato";
import Endereco from "@/components/Endereco/Endereco";

export default function LocalEvento() {
  return (
    <section
      id="Contato"
      className="w-full bg-slate-50 py-10 sm:py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-100 scroll-mt-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
          <Contato />
          <Endereco />
        </div>
      </div>
    </section>
  );
}
