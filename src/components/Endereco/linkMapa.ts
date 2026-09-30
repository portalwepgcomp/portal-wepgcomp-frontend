export type LinkMapa = {
  abrir: string;
  embed: string;
};

function lerUrlGoogle(entrada: string): URL | null {
  const texto = entrada.trim();
  if (!texto) return null;

  const src = texto.match(/src=["']([^"']+)["']/i)?.[1] ?? texto;
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");
  const hostGoogle = host === "google.com" || host.endsWith(".google.com");
  if (!hostGoogle || !url.pathname.includes("/maps/embed")) return null;
  return url;
}

/** Aceita a URL de incorporar ou o HTML copiado do Google Maps. */
export function normalizarLinkMapa(entrada: string): LinkMapa | null {
  const url = lerUrlGoogle(entrada);
  if (!url) return null;
  const embed = url.toString();
  return { abrir: embed, embed };
}
