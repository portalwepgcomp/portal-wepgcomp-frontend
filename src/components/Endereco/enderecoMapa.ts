export function coordenadasValidas(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): boolean {
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180
  );
}

export function montarUrlComoChegar(
  latitude: number,
  longitude: number,
): string {
  const destino = encodeURIComponent(`${latitude},${longitude}`);
  return `https://www.google.com/maps/dir/?api=1&hl=pt-BR&destination=${destino}`;
}

export function montarUrlMapaEmbed(
  latitude: number,
  longitude: number,
): string {
  const ponto = encodeURIComponent(`${latitude},${longitude}`);
  return `https://maps.google.com/maps?q=${ponto}&ll=${ponto}&z=17&output=embed&hl=pt-BR`;
}

export function parseCoordenada(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}
