"use client";

import { ProtectedLayout } from "@/components/ProtectedLayout/protectedLayout";
import ListaFavoritos from "@/features/favoritos/components/ListaFavoritos";

export default function Favoritos() {
  return (
    <ProtectedLayout>
      <div className="flex flex-col gap-[50px]">
        <ListaFavoritos />
      </div>
    </ProtectedLayout>
  );
}
