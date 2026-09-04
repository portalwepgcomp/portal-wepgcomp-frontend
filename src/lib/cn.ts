/**
 * Une classes condicionalmente (estilo clsx), filtrando valores falsy.
 * Usado para compor classes do Tailwind nos componentes.
 */
export type ClassValue = string | number | null | false | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
