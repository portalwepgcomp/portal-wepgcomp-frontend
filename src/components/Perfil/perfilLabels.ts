import type { ProfileType, RoleType, SubprofileType } from "@/models/user";

export function profileLabel(profile: ProfileType): string {
  switch (profile) {
    case "Presenter":
      return "Apresentador";
    case "Professor":
      return "Professor";
    case "Listener":
      return "Ouvinte";
    default:
      return profile;
  }
}

export function subprofileLabel(subprofile: SubprofileType): string {
  switch (subprofile) {
    case "Doctorate":
      return "Doutorando";
    case "Master":
      return "Mestrando";
    case "Bachelor":
      return "Graduando";
    case "Other":
      return "Outro";
    default:
      return subprofile;
  }
}

/** Ex.: "Apresentador" ou "Ouvinte (Mestrando)". */
export function fullProfileLabel(
  profile: ProfileType,
  subprofile?: SubprofileType | null,
): string {
  const label = profileLabel(profile);
  return profile === "Listener" && subprofile
    ? `${label} (${subprofileLabel(subprofile)})`
    : label;
}

export function isAdminLevel(level?: RoleType | string): boolean {
  return level === "Admin";
}

export function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/).filter(Boolean)[0] ?? name;
}
