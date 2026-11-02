import React from "react";
import {
  AbsoluteFill,
  Easing,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Clip, Plano } from "../edicao";
import { useFrame30 } from "../tempo";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Ponto do rosto no quadro (origem dos zooms). */
const ORIGEM = "50% 33%";

/** Estilo de câmera por episódio (v2: zooms menores e suaves, tremor de impacto). */
export type EstiloCamera = {
  /** Escala a intensidade dos zooms (1 = como no DIA 39/40; 0,5 = metade, preserva nitidez). */
  fator?: number;
  /** Transições suaves (dolly) entre enquadramentos em vez de corte seco de zoom. */
  suave?: boolean;
  /** Tempos (s do original) com tremor de câmera curto — batidas de impacto. */
  impactos?: number[];
  /** Zoom do gancho: [início, fim]. */
  gancho?: [number, number];
};

const zoomBruto = (planos: Plano[], srcT: number, suave: boolean) => {
  let i = 0;
  while (i + 1 < planos.length && planos[i + 1].src0 <= srcT) i++;
  const p = planos[i];
  const decorrido = srcT - p.src0;
  if (suave && i > 0) {
    const drift = Math.min(decorrido / 6, 1) * 0.025;
    const de = planos[i - 1].zoom + Math.min((p.src0 - planos[i - 1].src0) / 6, 1) * 0.025;
    const e = interpolate(decorrido, [0, 0.5], [0, 1], { ...clamp, easing: Easing.bezier(0.45, 0, 0.2, 1) });
    return de + (p.zoom + drift - de) * e;
  }
  return zoomNoTempo(planos, srcT);
};

const zoomNoTempo = (planos: Plano[], srcT: number) => {
  let i = 0;
  while (i + 1 < planos.length && planos[i + 1].src0 <= srcT) i++;
  const p = planos[i];
  const decorrido = srcT - p.src0;
  // Leve "push-in" contínuo dentro de cada plano (câmera viva, sem ser aleatório).
  const drift = Math.min(decorrido / 6, 1) * 0.025;
  if (p.enfase && i > 0) {
    const de = planos[i - 1].zoom;
    const e = interpolate(decorrido, [0, 0.4], [0, 1], { ...clamp, easing: Easing.bezier(0.2, 0.8, 0.2, 1) });
    return de + (p.zoom - de) * e + drift;
  }
  return p.zoom + drift;
};

const ClipeVideo: React.FC<{
  readonly clip: Clip;
  readonly planos: Plano[];
  readonly src: string;
  readonly estilo: EstiloCamera;
}> = ({ clip, planos, src, estilo }) => {
  const frame = useCurrentFrame();
  const f30 = useFrame30();
  const { fps } = useVideoConfig();
  const srcT = clip.src0 + frame / fps;
  const fator = estilo.fator ?? 1;
  let zoom = 1 + (zoomBruto(planos, srcT, !!estilo.suave) - 1) * fator;
  if (clip.gancho) {
    // Abertura: entra fechado e abre rápido, com controle.
    const [z0, z1] = estilo.gancho ?? [1.38, 1.14];
    zoom = interpolate(f30, [0, 14], [z0, z1], { ...clamp, easing: Easing.out(Easing.cubic) }) +
      interpolate(f30, [14, 180], [0, 0.03 * fator], clamp);
  }
  // Tremor curto de impacto (decai em 0,35 s).
  let dx = 0;
  let dy = 0;
  for (const t of clip.gancho ? [] : estilo.impactos ?? []) {
    const dt = srcT - t;
    if (dt >= 0 && dt < 0.35) {
      const a = 7 * (1 - dt / 0.35) ** 2;
      dx += Math.sin(dt * 90) * a;
      dy += Math.cos(dt * 70) * a * 0.6;
      zoom += 0.012 * (1 - dt / 0.35);
    }
  }
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <AbsoluteFill style={{ scale: String(zoom), translate: `${dx}px ${dy}px`, transformOrigin: ORIGEM }}>
        {/* OffthreadVideo decodifica com FFmpeg (o Chromium aberto não tem H.264). */}
        <OffthreadVideo
          src={staticFile(src)}
          trimBefore={Math.round(clip.src0 * fps)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Todos os clipes em sequência, com os enquadramentos de câmera. */
export const Camera: React.FC<{
  readonly clips: Clip[];
  readonly planos: Plano[];
  readonly src: string;
  readonly estilo?: EstiloCamera;
}> = ({ clips, planos, src, estilo = {} }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {clips.map((c, i) => {
        const from = Math.round(c.out0 * fps);
        const fim = i + 1 < clips.length ? Math.round(clips[i + 1].out0 * fps) : from + Math.round((c.src1 - c.src0) * fps);
        return (
          <Sequence key={i} name={c.gancho ? "Gancho" : `Clipe ${i}`} from={from} durationInFrames={fim - from} premountFor={fps}>
            <ClipeVideo clip={c} planos={planos} src={src} estilo={estilo} />
          </Sequence>
        );
      })}
    </>
  );
};

/** Vinheta e gradientes que dão profundidade e ajudam a leitura. */
export const Acabamento: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse 85% 70% at 50% 42%, transparent 55%, rgba(0,0,0,0.42) 100%)",
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 16%, transparent 62%, rgba(0,0,0,0.5) 100%)",
      }}
    />
  </AbsoluteFill>
);

/** Flash + desfoque curto para transições de impacto. */
export const Flash: React.FC = () => {
  const frame = useFrame30();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#FFF6DD",
        opacity: interpolate(frame, [0, 2, 8], [0, 0.55, 0], clamp),
        mixBlendMode: "screen",
      }}
    />
  );
};
