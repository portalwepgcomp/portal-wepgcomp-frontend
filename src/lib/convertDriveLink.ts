/** Converte links do Google Drive/Docs/Slides em URL de download direto. */
export function convertDriveLinkToDownload(url?: string): string {
  if (!url) return "";
  const normalizedUrl = url.startsWith("/d/") ? url.slice(3) : url;

  const docsMatch = normalizedUrl.match(
    /docs\.google\.com\/document\/d\/([\w-]+)/,
  );
  if (docsMatch) {
    return `https://docs.google.com/document/d/${docsMatch[1]}/export?format=pdf`;
  }

  const slidesMatch = normalizedUrl.match(
    /docs\.google\.com\/presentation\/d\/([\w-]+)/,
  );
  if (slidesMatch) {
    return `https://docs.google.com/presentation/d/${slidesMatch[1]}/export/pdf`;
  }

  if (/^[\w-]{20,}$/.test(normalizedUrl)) {
    return `https://drive.google.com/uc?export=download&id=${normalizedUrl}`;
  }

  const driveFileIdMatch = normalizedUrl.match(
    /(?:drive\.google\.com\/file\/d\/|\/d\/|id=)([\w-]+)/,
  );
  if (driveFileIdMatch) {
    return `https://drive.google.com/uc?export=download&id=${driveFileIdMatch[1]}`;
  }

  return url;
}
