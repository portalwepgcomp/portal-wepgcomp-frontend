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

/**
 * Espaço antes da longitude negativa. Sem ele, o embed do Google trata
 * `,-38` como parâmetro e inverte o sinal (Salvador vira Moçambique).
 */
function parCoordenadas(latitude: number, longitude: number): string {
  return `${latitude}, ${longitude}`;
}

export function montarUrlComoChegar(
  latitude: number,
  longitude: number,
): string {
  const destino = encodeURIComponent(parCoordenadas(latitude, longitude));
  return `https://www.google.com/maps/dir/?api=1&hl=pt-BR&destination=${destino}`;
}

export function montarUrlMapaEmbed(
  latitude: number,
  longitude: number,
): string {
  const ponto = encodeURIComponent(parCoordenadas(latitude, longitude));
  return `https://maps.google.com/maps?q=${ponto}&z=17&output=embed&hl=pt-BR`;
}

export function parseCoordenada(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed.replace(",", "."));
  if (!Number.isFinite(parsed)) return null;
  return Number(parsed.toFixed(8));
}
