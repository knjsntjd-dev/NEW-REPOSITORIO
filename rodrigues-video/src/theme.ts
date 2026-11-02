import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Identidade visual RODRIGUES (ver BRIEFING.md §3).
export const C = {
  preto: "#07070A",
  vidro: "rgba(12, 12, 16, 0.78)",
  branco: "#FFFFFF",
  cinza: "rgba(255,255,255,0.62)",
  ouro: "#E9C46A",
  ouroEscuro: "#B8892C",
  verde: "#5FD068", // verde Shopify (#95BF47) puxado para o legível sobre preto
  verdeShopify: "#95BF47",
};

export const GOLD_TEXT: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(180deg, #FFF3C4 0%, #F2CD6B 38%, #C8962E 62%, #FBE7A1 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

export const FONT_TITULO = "Anton";
export const FONT_TEXTO = "Inter";

export const fontsLoaded = Promise.all([
  loadFont({ family: FONT_TITULO, url: staticFile("fonts/Anton.woff2") }),
  ...["500", "700", "800", "900"].map((weight) =>
    loadFont({
      family: FONT_TEXTO,
      url: staticFile(`fonts/Inter-${weight}.woff2`),
      weight,
    }),
  ),
]);

/** Formata número no padrão falado no vídeo ("8.675", "61,20"). */
export const fmt = (n: number, decimals = 0) => {
  const [int, dec] = n.toFixed(decimals).split(".");
  const milhar = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return dec ? `${milhar},${dec}` : milhar;
};
