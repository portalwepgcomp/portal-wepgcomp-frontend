"use client";

import { FormContato } from "./Forms/Contato/FormContato";

export default function Contato() {
  return (
    <div className="flex w-1/2 flex-col items-start max-xl:w-full">
      <div className="w-full">
        <div className="mb-3 text-4xl font-bold text-white">Contato</div>
        <FormContato />
      </div>
    </div>
  );
}
