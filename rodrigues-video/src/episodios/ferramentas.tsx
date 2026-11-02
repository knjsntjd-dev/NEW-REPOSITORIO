import { Audio } from "@remotion/media";
import React from "react";
import { Sequence, staticFile, useVideoConfig } from "remotion";
import { FPS_DESIGN } from "../tempo";

/**
 * Ferramentas de montagem de episódio: ancoram sequências e efeitos sonoros em tempos
 * do vídeo ORIGINAL (em segundos) e convertem para a linha do tempo editada.
 */
export const criarFerramentas = (srcToOut: (t: number, noGancho?: boolean) => number) => {
  /** Mostra `children` entre `de` e `ate` (s do original). `gancho`: usa o trecho de abertura. */
  const Em: React.FC<{
    readonly de: number;
    readonly ate: number;
    readonly nome: string;
    readonly gancho?: boolean;
    readonly children: React.ReactNode;
  }> = ({ de, ate, nome, gancho = false, children }) => {
    const { fps } = useVideoConfig();
    const from = Math.round(srcToOut(de, gancho) * fps);
    const to = Math.round(srcToOut(ate, gancho) * fps);
    return (
      <Sequence name={nome} from={from} durationInFrames={Math.max(1, to - from)} premountFor={fps}>
        {children}
      </Sequence>
    );
  };

  /** Efeito sonoro (um toque) disparado num tempo do original. */
  const Sfx: React.FC<{
    readonly em: number;
    readonly som: string;
    readonly volume: number;
    readonly gancho?: boolean;
  }> = ({ em, som, volume, gancho = false }) => {
    const { fps } = useVideoConfig();
    return (
      <Sequence name={`SFX ${som}`} from={Math.max(0, Math.round(srcToOut(em, gancho) * fps))} durationInFrames={2 * fps}>
        <Audio src={staticFile(`sfx/${som}.wav`)} volume={volume} />
      </Sequence>
    );
  };

  /** Frames de design (30 fps) entre dois tempos do original — os gráficos animam a 30 fps-equivalentes. */
  const entre = (a: number, b: number, gancho = false) =>
    Math.round((srcToOut(b, gancho) - srcToOut(a, gancho)) * FPS_DESIGN);

  return { Em, Sfx, entre };
};
