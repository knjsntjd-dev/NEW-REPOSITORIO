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

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Ponto do rosto no quadro (origem dos zooms). */
const ORIGEM = "50% 33%";

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

const ClipeVideo: React.FC<{ readonly clip: Clip; readonly planos: Plano[]; readonly src: string }> = ({
  clip,
  planos,
  src,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const srcT = clip.src0 + frame / fps;
  let zoom = zoomNoTempo(planos, srcT);
  if (clip.gancho) {
    // Abertura: entra bem fechado e abre rápido, com controle.
    zoom = interpolate(frame, [0, 14], [1.38, 1.14], { ...clamp, easing: Easing.out(Easing.cubic) }) +
      interpolate(frame, [14, 180], [0, 0.05], clamp);
  }
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <AbsoluteFill style={{ scale: String(zoom), transformOrigin: ORIGEM }}>
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
export const Camera: React.FC<{ readonly clips: Clip[]; readonly planos: Plano[]; readonly src: string }> = ({
  clips,
  planos,
  src,
}) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {clips.map((c, i) => {
        const from = Math.round(c.out0 * fps);
        const fim = i + 1 < clips.length ? Math.round(clips[i + 1].out0 * fps) : from + Math.round((c.src1 - c.src0) * fps);
        return (
          <Sequence key={i} name={c.gancho ? "Gancho" : `Clipe ${i}`} from={from} durationInFrames={fim - from} premountFor={fps}>
            <ClipeVideo clip={c} planos={planos} src={src} />
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
  const frame = useCurrentFrame();
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
