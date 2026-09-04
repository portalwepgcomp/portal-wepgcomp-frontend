"use client";

import Image from "next/image";
import { cn } from "@/utils/cn";
import FilterSelect from "./FilterSelect";
import { opcoesFiltro } from "./constants";
import type { FiltrosUsuario } from "./constants";

interface GerenciarFiltrosProps {
  busca: string;
  onBuscaChange: (valor: string) => void;
  filtros: FiltrosUsuario;
  userList: User[];
  onFiltroChange: (tipo: keyof FiltrosUsuario, valor: string) => void;
  infoVisivel: boolean;
  onToggleInfo: () => void;
}

export default function GerenciarFiltros({
  busca,
  onBuscaChange,
  filtros,
  userList,
  onFiltroChange,
  infoVisivel,
  onToggleInfo,
}: GerenciarFiltrosProps) {
  return (
    <div className="rounded-xl border border-[#e9ecef] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
      <div className="relative mb-4 flex items-center">
        <input
          type="text"
          className={cn(
            "flex-1 rounded-lg border-2 border-[#e9ecef] px-4 py-2 text-base transition-[border-color] duration-200",
            "placeholder:text-[#6c757d] focus:border-[#007bff] focus:outline-none focus:shadow-[0_0_0_0.2rem_rgba(0,123,255,0.25)]",
          )}
          placeholder="Pesquise pelo nome ou e-mail do usuário"
          onChange={(e) => onBuscaChange(e.target.value)}
          value={busca}
        />
        <div className="absolute right-2 z-10 flex items-center justify-center text-[#6c757d]">
          <Image
            src="/assets/images/search.svg"
            alt=""
            height={24}
            width={24}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4 max-md:flex-col max-md:items-stretch">
        <FilterSelect
          label="Status"
          value={filtros.status}
          options={[...opcoesFiltro.status]}
          userList={userList}
          onChange={(value) => onFiltroChange("status", value)}
        />
        <FilterSelect
          label="Permissão"
          value={filtros.permission}
          options={[...opcoesFiltro.permission]}
          userList={userList}
          onChange={(value) => onFiltroChange("permission", value)}
        />
        <FilterSelect
          label="Cargo"
          value={filtros.profile}
          options={[...opcoesFiltro.profile]}
          userList={userList}
          onChange={(value) => onFiltroChange("profile", value)}
        />
        <button
          type="button"
          className={cn(
            "flex h-[38px] w-[38px] shrink-0 items-center justify-center self-end rounded-lg",
            "border-2 border-[#e9ecef] bg-white text-[#6c757d] transition-all duration-200",
            "hover:border-[#007bff] hover:bg-[#f8f9fa] hover:text-[#007bff]",
            infoVisivel && "border-[#007bff] text-[#007bff]",
            "max-md:mt-4 max-md:self-center",
          )}
          onClick={onToggleInfo}
          title="Informações sobre status e permissões"
          aria-label="Mostrar informações"
          aria-pressed={infoVisivel}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
