"use client";

import { Search, Info } from "lucide-react";
import { cn } from "@/utils/cn";
import FilterSelect from "./FilterSelect";
import { opcoesFiltro } from "./constants";
import type { FiltrosUsuario } from "./constants";
import { User } from "@/models/user";

interface GerenciarFiltrosProps {
  busca: string;
  onBuscaChange: (valor: string) => void;
  filtros: FiltrosUsuario;
  userList: User[];
  onFiltroChange: (tipo: keyof FiltrosUsuario, valor: string) => void;
  infoVisivel: boolean;
  onToggleInfo: () => void;
}

/**
 * Componente de barra de filtros e busca para a listagem e gerenciamento de usuários.
 */
export default function GerenciarFiltros({
  busca,
  onBuscaChange,
  filtros,
  userList,
  onFiltroChange,
  infoVisivel,
  onToggleInfo,
}: Readonly<GerenciarFiltrosProps>) {
  return (
    <div className="rounded-xl border border-[#e9ecef] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
      <div className="relative mb-4 flex items-center">
        <input
          type="text"
          className={cn(
            "flex-1 rounded-lg border-2 border-[#e9ecef] px-4 py-2 pr-10 text-base transition-[border-color] duration-200",
            "placeholder:text-[#6c757d] focus:border-[#007bff] focus:outline-none focus:shadow-[0_0_0_0.2rem_rgba(0,123,255,0.25)]",
          )}
          placeholder="Pesquise pelo nome ou e-mail do usuário"
          onChange={(e) => onBuscaChange(e.target.value)}
          value={busca}
        />
        <div className="pointer-events-none absolute right-3 z-10 flex items-center justify-center text-[#6c757d]">
          <Search className="h-5 w-5 text-muted" aria-hidden="true" />
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
          <Info className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
