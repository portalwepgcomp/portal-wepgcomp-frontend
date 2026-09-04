"use client";

import Spinner from "@/components/UI/Spinner";

export default function IndicadorDeCarregamento() {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center">
      <Spinner className="h-12 w-12" />
    </div>
  );
}
