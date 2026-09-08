"use client";

import Spinner from "@/components/UI/Spinner";

export default function Loading() {
  return (
    <div className="m-5 flex h-full flex-col items-center justify-center">
      <Spinner colorClassName="text-success" className="h-10 w-10" />
      <span className="mt-2 text-2xl font-bold text-success">
        Carregando...
      </span>
    </div>
  );
}
