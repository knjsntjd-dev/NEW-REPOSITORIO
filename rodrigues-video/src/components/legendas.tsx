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
}> = ({ paginas, top, ocultar = [] }) => {
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
        gap: "0 30px",
        perspective: 1200,
        translate: `0 ${interpolate(entrada, [0, 1], [26, 0])}px`,
      }}
    >
      {pagina.palavras.map((w, i) => {
        const f0 = Math.round(w.t * fps);
        const s = spring({ frame: frame - f0, fps, config: { damping: 13, stiffness: 260, mass: 0.6 } });
        const falando = frame >= f0;
        const ativa = falando && (i === pagina.palavras.length - 1 || frame < Math.round(pagina.palavras[i + 1].t * fps));
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
