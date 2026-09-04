export function obterNomeArquivoViaUrl(url: string): string {
  try {
    const u = new URL(
      url,
      typeof window !== "undefined" ? window.location.origin : "http://localhost",
    );
    const last = u.pathname.split("/").filter(Boolean).pop() || "";
    return decodeURIComponent(last);
  } catch {
    const clean = url.split("?")[0].split("#")[0];
    return decodeURIComponent(clean.split("/").pop() || "");
  }
}
