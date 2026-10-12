import React from "react";
import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Mola de entrada (0 → 1) a partir de `delay` frames. */
export const useEntrada = (delay = 0, damping = 14, mass = 0.9) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, mass, stiffness: 170 } });
};

/** 0 → 1 nos últimos `frames` da sequência (para a saída). */
export const useSaida = (frames = 10) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return interpolate(frame, [durationInFrames - frames, durationInFrames], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
};

type Float3DProps = {
  readonly children: React.ReactNode;
  readonly delay?: number;
  /** Inclinação inicial em X (graus) — o card "deita" para trás e levanta. */
  readonly tilt?: number;
  /** Direção de entrada: deslocamento inicial em px. */
  readonly from?: [number, number];
  readonly style?: React.CSSProperties;
  /** Intensidade da flutuação contínua (0 desliga). */
  readonly bob?: number;
  /** Fase da flutuação, para cards vizinhos não andarem juntos. */
  readonly phase?: number;
};

/**
 * Elemento flutuante com profundidade: entra girando em 3D com física de mola,
 * flutua levemente (parallax com a câmera) e sai com desfoque.
 */
export const Float3D: React.FC<Float3DProps> = ({
  children,
  delay = 0,
  tilt = 55,
  from = [0, 140],
  style,
  bob = 1,
  phase = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = useEntrada(delay);
  const out = useSaida(9);
  const t = (frame + phase * fps) / fps;

  return (
    <div
      style={{
        position: "absolute",
        perspective: 1600,
        ...style,
      }}
    >
      <div
        style={{
          transformStyle: "preserve-3d",
          opacity: interpolate(p, [0, 0.35], [0, 1], clamp) * (1 - out),
          filter: `blur(${out * 14 + interpolate(p, [0, 0.5], [10, 0], clamp)}px)`,
          translate: `${interpolate(p, [0, 1], [from[0], 0])}px ${
            interpolate(p, [0, 1], [from[1], 0]) + Math.sin(t * 1.6) * 7 * bob - out * 40
          }px`,
          scale: String(interpolate(p, [0, 1], [0.72, 1]) * (1 - out * 0.12)),
          rotate: `x ${interpolate(p, [0, 1], [tilt, 0]) + Math.sin(t * 1.1) * 2.2 * bob}deg`,
          transform: `rotateY(${Math.sin(t * 0.9 + 1) * 3.5 * bob}deg)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Cartão de vidro escuro com borda dourada, sombra realista e reflexo de luz. */
export const Card: React.FC<{
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
  readonly accent?: string;
  readonly sheenDelay?: number;
}> = ({ children, style, accent = C.ouro, sheenDelay = 12 }) => {
  const frame = useCurrentFrame();
  const sheen = interpolate(frame, [sheenDelay, sheenDelay + 22], [-120, 220], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(160deg, rgba(34,34,40,0.92) 0%, ${C.vidro} 55%, rgba(6,6,8,0.9) 100%)`,
        backdropFilter: "blur(14px)",
        border: `2px solid ${accent}66`,
        borderRadius: 30,
        boxShadow: [
          "0 40px 80px rgba(0,0,0,0.55)",
          "0 12px 24px rgba(0,0,0,0.45)",
          `0 0 40px ${accent}22`,
          "inset 0 1px 0 rgba(255,255,255,0.16)",
          "inset 0 -12px 30px rgba(0,0,0,0.35)",
        ].join(", "),
        ...style,
      }}
    >
      {children}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%)",
          translate: `${sheen}% 0`,
        }}
      />
    </div>
  );
};

/**
 * Texto com extrusão 3D: camada de "profundidade" escura deslocada para baixo
 * + face frontal (dourada por padrão) com brilho.
 */
export const Extruded: React.FC<{
  readonly children: React.ReactNode;
  readonly size: number;
  readonly face?: React.CSSProperties;
  readonly depthColor?: string;
  readonly depth?: number;
  readonly glow?: string;
  readonly font?: string;
  readonly style?: React.CSSProperties;
}> = ({
  children,
  size,
  face,
  depthColor = "#5A3D0C",
  depth = 10,
  glow = "rgba(233,196,106,0.45)",
  font = "Anton",
  style,
}) => {
  const base: React.CSSProperties = {
    fontFamily: font,
    fontSize: size,
    lineHeight: 1,
    whiteSpace: "nowrap",
    letterSpacing: "0.01em",
  };
  const layers = Array.from({ length: depth }, (_, i) => `0 ${i + 1}px 0 ${depthColor}`);
  return (
    <div style={{ position: "relative", display: "inline-block", ...style }}>
      <div
        style={{
          ...base,
          color: depthColor,
          textShadow: [...layers, `0 ${depth + 14}px 30px rgba(0,0,0,0.7)`].join(", "),
        }}
      >
        {children}
      </div>
      <div
        style={{
          ...base,
          position: "absolute",
          inset: 0,
          filter: `drop-shadow(0 0 22px ${glow})`,
          ...face,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Valor numérico animado de `de` até `para` em `frames`, com desaceleração. */
export const useContador = (para: number, frames: number, delay = 0, de = 0) => {
  const frame = useCurrentFrame();
  return interpolate(frame - delay, [0, frames], [de, para], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
};
