import type { FiltrosUsuario } from "./constants";
import { normalizarTextoBusca } from "@/features/shared/texto";
import { User } from "@/models/user";

// Reexporta a fonte \u00fanica de verdade (movida para features/shared) para n\u00e3o
// quebrar importa\u00e7\u00f5es existentes de `normalizarTextoBusca` a partir daqui.
export { normalizarTextoBusca };

export function obterStatusUsuario(user: User) {
  if (!user.isActive) return "INATIVO" as const;
  if (user.profile === "Professor" && !user.isTeacherActive)
    return "ATIVO_PENDENTE" as const;
  if (user.profile === "Presenter" && !user.isPresenterActive)
    return "ATIVO_PENDENTE" as const;
  return "ATIVO" as const;
}

export function obterPermissaoUsuario(user: User) {
  if (user.isSuperadmin) return "SUPERADMIN" as const;
  if (user.isAdmin) return "ADMIN" as const;
  return "NORMAL" as const;
}

function correspondeFiltroStatus(user: User, status: string): boolean {
  switch (status) {
    case "ativo":
      return (
        user.isActive &&
        (user.profile !== "Professor" || user.isTeacherActive) &&
        (user.profile !== "Presenter" || user.isPresenterActive)
      );
    case "ativo_pendente":
      return (
        (user.profile === "Professor" &&
          user.isActive &&
          !user.isTeacherActive) ||
        (user.profile === "Presenter" &&
          user.isActive &&
          !user.isPresenterActive)
      );
    case "inativo":
      return !user.isActive;
    default:
      return true;
  }
}

function correspondeFiltroPermissao(user: User, permission: string): boolean {
  switch (permission) {
    case "superadmin":
      return user.isSuperadmin;
    case "admin":
      return user.isAdmin && !user.isSuperadmin;
    case "normal":
      return !user.isAdmin && !user.isSuperadmin;
    default:
      return true;
  }
}

function correspondeFiltroPerfil(user: User, profile: string): boolean {
  switch (profile) {
    case "apresentador":
      return user.profile === "Presenter";
    case "professor":
      return user.profile === "Professor";
    case "ouvinte":
      return user.profile === "Listener";
    default:
      return true;
  }
}

export function filtrarUsuarios(
  userList: User[] | undefined,
  busca: string,
  filters: FiltrosUsuario,
): User[] {
  let resultado = userList ?? [];

  if (filters.showPresenters) {
    resultado = resultado.filter((u) => u.profile === "Presenter");
  }

  const termo = busca.trim();
  if (termo) {
    const normalizado = normalizarTextoBusca(termo);
    resultado = resultado.filter(
      (u) =>
        normalizarTextoBusca(u.name ?? "").includes(normalizado) ||
        normalizarTextoBusca(u.email ?? "").includes(normalizado),
    );
  }

  if (filters.status) {
    resultado = resultado.filter((u) =>
      correspondeFiltroStatus(u, filters.status),
    );
  }

  if (filters.permission) {
    resultado = resultado.filter((u) =>
      correspondeFiltroPermissao(u, filters.permission),
    );
  }

  if (filters.profile) {
    resultado = resultado.filter((u) =>
      correspondeFiltroPerfil(u, filters.profile),
    );
  }

  return resultado;
}

export function filtrosAtivos(
  filters: FiltrosUsuario,
  busca: string,
): boolean {
  return (
    !!busca.trim() ||
    !!filters.status ||
    !!filters.permission ||
    !!filters.profile ||
    filters.showPresenters
  );
}
