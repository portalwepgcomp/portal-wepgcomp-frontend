"use client";

import { FormContato } from "./Forms/Contato/FormContato";

export default function Contato() {
  return (
    <div className="flex w-full flex-col items-start gap-4">
      <div className="flex items-center gap-3">
        <div className="h-7 w-1.5 rounded-full bg-brand-orange" />
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Fale Conosco
        </h2>
      </div>
      <p className="text-sm text-slate-600">
        Dúvidas, sugestões ou suporte? Envie sua mensagem para a coordenação do evento.
      </p>
      <div className="w-full">
        <FormContato />
      </div>
    </div>
  );
}
