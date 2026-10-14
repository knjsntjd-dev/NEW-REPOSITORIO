import { useCurrentFrame, useVideoConfig } from "remotion";

/** Todas as animações foram desenhadas a 30 quadros/s (delays, durações, molas). */
export const FPS_DESIGN = 30;

/**
 * Quadro atual em "unidades de 30 fps" (pode ser fracionário). Permite renderizar
 * a composição a 60 fps (ou qualquer taxa) sem mudar a velocidade das animações:
 * a 60 fps elas só ganham o dobro de quadros intermediários, ficando mais suaves.
 */
export const useFrame30 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (frame * FPS_DESIGN) / fps;
};

/** Duração da sequência atual em unidades de 30 fps. */
export const useDuracao30 = () => {
  const { durationInFrames, fps } = useVideoConfig();
  return (durationInFrames * FPS_DESIGN) / fps;
};
