export const badgeBase =
  "me-1 flex items-center gap-1 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-semibold";

export const actionBtnBase =
  "inline-flex items-center justify-center gap-1 rounded-lg border border-transparent px-4 py-4 text-xs font-semibold uppercase tracking-wide shadow-sm transition-all duration-200 hover:shadow-md active:shadow-sm disabled:cursor-not-allowed disabled:opacity-60 max-sm:text-[11px] max-sm:px-3 max-sm:py-2";

export const controlSelectBase =
  "box-border w-full cursor-pointer rounded-[10px] border border-[#e9ecef] bg-[#f8f9fa] px-4 py-4 text-center text-sm font-semibold text-[#495057] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.8)] transition-all duration-300 hover:border-[#007bff] hover:bg-white focus:border-[#007bff] focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,123,255,0.1)] active:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.1)] disabled:cursor-not-allowed disabled:opacity-60";

export const statusSelectClasses = {
  ATIVO: "border-[#4caf50] bg-gradient-to-br from-[#e8f5e8] to-[#c8e6c9] text-[#2e7d32]",
  ATIVO_PENDENTE:
    "border-[#ffcc02] bg-gradient-to-br from-[#fff8e1] to-[#ffecb3] text-[#e65100]",
  INATIVO:
    "border-[#f44336] bg-gradient-to-br from-[#ffebee] to-[#ffcdd2] text-[#c62828]",
} as const;

export const permissionBadgeClasses = {
  ADMIN:
    "inline-flex w-full items-center justify-center gap-2 rounded-[10px] border border-[#2196f3] bg-gradient-to-br from-[#e3f2fd] to-[#bbdefb] px-4 py-4 text-sm font-semibold uppercase tracking-wide text-[#1565c0] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.8)]",
  NORMAL:
    "inline-flex w-full items-center justify-center gap-2 rounded-[10px] border border-[#9e9e9e] bg-gradient-to-br from-[#f5f5f5] to-[#eeeeee] px-4 py-4 text-sm font-semibold uppercase tracking-wide text-[#424242] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.8)]",
} as const;

export type StatusUsuario = keyof typeof statusSelectClasses;
export type PermissaoUsuario = keyof typeof permissionBadgeClasses;

export interface FiltrosUsuario {
  status: string;
  permission: string;
  profile: string;
  showPresenters: boolean;
}

export const filtrosIniciais: FiltrosUsuario = {
  status: "",
  permission: "",
  profile: "",
  showPresenters: false,
};

export const opcoesFiltro = {
  status: [
    { value: "", label: "Todos os status" },
    { value: "ativo", label: "Apenas Ativos", countKey: "ativo" },
    {
      value: "ativo_pendente",
      label: "Apenas Ativos Pendentes",
      countKey: "ativo_pendente",
    },
    { value: "inativo", label: "Apenas Inativos", countKey: "inativo" },
  ],
  permission: [
    { value: "", label: "Todas as permissões" },
    { value: "admin", label: "Admin", countKey: "admin" },
    { value: "normal", label: "Normal", countKey: "normal" },
  ],
  profile: [
    { value: "", label: "Todos os cargos" },
    { value: "apresentador", label: "Apresentador", countKey: "apresentador" },
    { value: "professor", label: "Professor", countKey: "professor" },
    { value: "ouvinte", label: "Ouvinte", countKey: "ouvinte" },
  ],
} as const;
