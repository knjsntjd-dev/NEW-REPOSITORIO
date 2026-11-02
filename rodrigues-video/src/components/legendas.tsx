import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Pagina } from "../edicao";
import { C, FONT_TEXTO } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const CONTORNO = [
  "0 4px 0 rgba(0,0,0,0.9)",
  "0 0 3px rgba(0,0,0,0.9)",
  "2px 2px 0 rgba(0,0,0,0.85)",
  "-2px 2px 0 rgba(0,0,0,0.85)",
  "2px -2px 0 rgba(0,0,0,0.85)",
  "-2px -2px 0 rgba(0,0,0,0.85)",
  "0 10px 26px rgba(0,0,0,0.65)",
].join(", ");

/**
 * Legendas palavra a palavra: branco como base, dourado nas palavras
 * estratégicas, entrada com mola e destaque da palavra falada.
 * `ocultar`: intervalos (s) em que a legenda some para não brigar com um gráfico.
 */
export const Legendas: React.FC<{
  readonly paginas: Pagina[];
  readonly top: number;
  readonly ocultar?: [number, number][];
  /** "classico" (DIA 39/40) ou "pilula": a palavra falada ganha uma pílula dourada por trás. */
  readonly estilo?: "classico" | "pilula";
}> = ({ paginas, top, ocultar = [], estilo = "classico" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (ocultar.some(([a, b]) => t >= a && t < b)) return null;

  let atual: Pagina | undefined;
  for (const p of paginas) if (t >= p.t0 && t < p.t1) atual = p;
  if (!atual) return null;
  const pagina = atual;

  const entrada = spring({ frame: frame - Math.round(pagina.t0 * fps), fps, config: { damping: 15, stiffness: 220 } });

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 100,
        right: 100,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: estilo === "pilula" ? "6px 14px" : "0 30px",
        perspective: 1200,
        translate: `0 ${interpolate(entrada, [0, 1], [26, 0])}px`,
      }}
    >
      {pagina.palavras.map((w, i) => {
        const f0 = Math.round(w.t * fps);
        const s = spring({ frame: frame - f0, fps, config: { damping: 13, stiffness: 260, mass: 0.6 } });
        const falando = frame >= f0;
        const ativa = falando && (i === pagina.palavras.length - 1 || frame < Math.round(pagina.palavras[i + 1].t * fps));
        if (estilo === "pilula") {
          const pil = spring({ frame: frame - f0, fps, config: { damping: 16, stiffness: 320, mass: 0.5 } });
          return (
            <span
              key={i}
              style={{
                position: "relative",
                display: "inline-block",
                padding: "2px 16px 6px",
                fontFamily: FONT_TEXTO,
                fontWeight: 900,
                fontSize: 72,
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
                textTransform: "uppercase",
                color: ativa ? C.preto : w.destaque ? C.ouro : C.branco,
                textShadow: ativa ? "none" : CONTORNO,
                opacity: falando ? interpolate(s, [0, 0.35], [0, 1], clamp) : 0,
                translate: `0 ${falando ? interpolate(s, [0, 1], [18, 0]) : 18}px`,
                filter: `blur(${falando ? interpolate(s, [0, 0.5], [6, 0], clamp) : 6}px)`,
              }}
            >
              {ativa ? (
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: -1,
                    borderRadius: 18,
                    background: "linear-gradient(180deg, #FBE7A1, #E9C46A 50%, #C8962E)",
                    boxShadow: "0 10px 26px rgba(0,0,0,0.5), 0 0 30px rgba(233,196,106,0.45)",
                    scale: String(interpolate(pil, [0, 1], [0.6, 1])),
                    rotate: `${interpolate(pil, [0, 1], [-4, -1.5])}deg`,
                  }}
                />
              ) : null}
              {w.texto}
            </span>
          );
        }
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontFamily: FONT_TEXTO,
              fontWeight: 900,
              fontSize: 74,
              lineHeight: 1.12,
              letterSpacing: "-0.01em",
              textTransform: "uppercase",
              color: w.destaque ? C.ouro : C.branco,
              textShadow: CONTORNO,
              opacity: falando ? interpolate(s, [0, 0.4], [0, 1], clamp) : 0,
              scale: String(falando ? interpolate(s, [0, 1], [0.7, ativa ? 1.04 : 1]) : 0.7),
              transformOrigin: "50% 80%",
              rotate: `x ${falando ? interpolate(s, [0, 1], [50, 0]) : 0}deg`,
            }}
          >
            {w.texto}
          </span>
        );
      })}
    </div>
  );
};
