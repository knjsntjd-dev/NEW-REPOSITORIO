import { Audio } from "@remotion/media";
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Sequence, continueRender, delayRender, staticFile, useVideoConfig } from "remotion";
import { Acabamento, Camera, Flash } from "../components/camera";
import {
  Alerta,
  ChamadaSeguir,
  Comparacao,
  ContadorDinheiro,
  DiasSemana,
  Formula,
  Indicador,
  MetaProgresso,
  NotificacoesVenda,
  PalavraChave,
  ProximoEpisodio,
  SeloEpisodio,
  TituloEpisodio,
} from "../components/graficos";
import { Legendas } from "../components/legendas";
import { montarEdicao } from "../edicao";
import { FPS_DESIGN } from "../tempo";
import { fontsLoaded } from "../theme";
import { DADOS, ENFASE, FALAS, GANCHO, PAUSA_MAX, RESPIRO } from "./dia39-dados";

export const EDICAO_DIA39 = montarEdicao({
  falas: FALAS,
  gancho: GANCHO,
  pausaMax: PAUSA_MAX,
  respiro: RESPIRO,
  enfase: ENFASE,
});

/** Zona dos gráficos (sobre o peito, abaixo do rosto) e das legendas. */
const ZONA_CARD = 1010;
const ZONA_LEGENDA = 1450;

const { srcToOut } = EDICAO_DIA39;

/**
 * Sequência ancorada em tempos do vídeo original: `de`/`ate` em segundos da
 * gravação; `gancho` usa o mapeamento do trecho de abertura.
 */
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

/** Efeito sonoro disparado num tempo do vídeo original. */
const Sfx: React.FC<{ readonly em: number; readonly som: string; readonly volume: number; readonly gancho?: boolean }> = ({
  em,
  som,
  volume,
  gancho = false,
}) => {
  const { fps } = useVideoConfig();
  return (
    <Sequence name={`SFX ${som}`} from={Math.max(0, Math.round(srcToOut(em, gancho) * fps))} durationInFrames={2 * fps}>
      <Audio src={staticFile(`sfx/${som}.wav`)} volume={volume} />
    </Sequence>
  );
};

/** Frames entre dois tempos do original (para atrasos internos dos gráficos). */
/** Frames de design (30 fps) entre dois tempos do original — os gráficos animam em 30 fps-equivalentes. */
const entre = (a: number, b: number) => Math.round((srcToOut(b) - srcToOut(a)) * FPS_DESIGN);

export const Dia39: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const [handle] = useState(() => delayRender("Carregando fontes"));
  useEffect(() => {
    fontsLoaded.then(() => continueRender(handle));
  }, [handle]);

  const fimGancho = Math.round(srcToOut(0.18) * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Camera clips={EDICAO_DIA39.clips} planos={EDICAO_DIA39.planos} src="dia39/base.mp4" />
      <Acabamento />

      {/* ---------- GANCHO: o resultado mais forte primeiro ---------- */}
      <Sequence name="Gancho · faturamento" from={Math.round(0.1 * fps)} durationInFrames={fimGancho - Math.round(0.1 * fps)} premountFor={fps}>
        <ContadorDinheiro valor={DADOS.faturamentoTotal} rotulo="A loja já faturou" top={ZONA_CARD} frames={entre(107.22, 112.4)} />
      </Sequence>
      <Sfx em={GANCHO[0]} gancho som="impact" volume={0.55} />
      <Sfx em={GANCHO[0] + 0.1} gancho som="pop" volume={0.3} />
      <Sequence name="Transição" from={fimGancho - Math.round(0.07 * fps)} durationInFrames={Math.round(0.33 * fps)}>
        <Flash />
      </Sequence>
      <Sfx em={0.18} som="whoosh" volume={0.4} />

      <SeloEpisodio dia={DADOS.dia} />

      {/* ---------- ABERTURA ---------- */}
      <Em nome="Título DIA 39" de={0.18} ate={5.75}>
        <TituloEpisodio dia={DADOS.dia} top={ZONA_CARD} />
      </Em>

      {/* ---------- HOJE ---------- */}
      <Em nome="Faturado hoje" de={11.29} ate={15.55}>
        <ContadorDinheiro valor={DADOS.faturadoHoje} casas={2} rotulo="Hoje, até agora" cor="verde" top={ZONA_CARD} frames={entre(11.29, 15.0)} />
      </Em>
      <Sfx em={11.29} som="pop" volume={0.3} />

      <Em nome="Pior dia" de={18.39} ate={22.0}>
        <Alerta rotulo="Desde o começo da série" texto="UM DOS PIORES DIAS" top={ZONA_CARD} />
      </Em>
      <Sfx em={18.39} som="whoosh" volume={0.3} />

      <Em nome="Lucro" de={29.53} ate={32.45}>
        <PalavraChave texto="LUCRO" cor="verde" apoio="Mesmo no pior dia" top={ZONA_CARD} />
      </Em>
      <Sfx em={29.53} som="impact" volume={0.35} />

      <Em nome="Ads x retorno" de={32.57} ate={41.1}>
        <Comparacao
          top={ZONA_CARD}
          esquerda={{ rotulo: "Facebook Ads", valor: DADOS.gastoAds, sub: "gasto até agora" }}
          direita={{ rotulo: "Retornou", valor: DADOS.retornoAds, sub: "até agora" }}
          atrasoDireita={entre(32.57, 39.29)}
        />
      </Em>
      <Sfx em={32.57} som="pop" volume={0.3} />
      <Sfx em={39.29} som="venda" volume={0.35} />

      <Em nome="ROI" de={41.14} ate={46.4}>
        <Indicador rotulo="ROI" valor={DADOS.roi} sub="Retorno sobre investimento" top={ZONA_CARD} />
      </Em>
      <Sfx em={41.14} som="whoosh" volume={0.3} />

      {/* ---------- FIM DE SEMANA ---------- */}
      <Em nome="Fim de semana" de={53.02} ate={59.8}>
        <DiasSemana dias={["SEX", "SÁB", "DOM"]} titulo="Fim de semana" destaque={`${DADOS.vendasDiaFimDeSemana} / DIA`} top={ZONA_CARD} />
      </Em>
      <Sfx em={53.02} som="pop" volume={0.3} />

      <Em nome="ROI de novo" de={62.84} ate={66.6}>
        <PalavraChave texto="ROI 1,34" tamanho={190} apoio="Mesmo num dia fraco" top={ZONA_CARD} />
      </Em>
      <Sfx em={62.84} som="impact" volume={0.3} />

      <Em nome="Fórmula" de={67.19} ate={76.6}>
        <Formula
          itens={["PRODUTO CERTO", "ESTRUTURA CERTA", "LUCRO"]}
          tempos={[entre(67.19, 68.5), entre(67.19, 70.1), entre(67.19, 75.83)]}
          top={ZONA_CARD - 20}
        />
      </Em>
      <Sfx em={68.5} som="pop" volume={0.28} />
      <Sfx em={70.1} som="pop" volume={0.28} />
      <Sfx em={75.83} som="venda" volume={0.3} />

      <Em nome="Sex + Sáb + Dom" de={82.23} ate={88.95}>
        <PalavraChave texto="SEX · SÁB · DOM" tamanho={150} cor="branco" apoio="Recuperam o dia fraco" top={ZONA_CARD} />
      </Em>
      <Sfx em={82.23} som="whoosh" volume={0.3} />

      <Em nome="100% real" de={89.14} ate={93.0}>
        <PalavraChave texto="100% REAL" tamanho={200} top={ZONA_CARD} />
      </Em>
      <Sfx em={91.6} som="impact" volume={0.4} />

      {/* ---------- RESULTADOS ACUMULADOS ---------- */}
      <Em nome="Faturamento total" de={107.22} ate={113.15}>
        <ContadorDinheiro valor={DADOS.faturamentoTotal} rotulo="A loja já faturou" top={ZONA_CARD} frames={entre(107.22, 112.4)} />
      </Em>
      <Sfx em={107.22} som="pop" volume={0.3} />

      <Em nome="Encomendas" de={113.21} ate={116.7}>
        <NotificacoesVenda quantidade={3} top={ZONA_CARD} />
      </Em>
      <Sfx em={113.21} som="venda" volume={0.3} />
      <Sfx em={113.21 + 7 / 30} som="venda" volume={0.25} />
      <Sfx em={113.21 + 14 / 30} som="venda" volume={0.25} />

      <Em nome="Visitantes" de={116.76} ate={121.55}>
        <ContadorDinheiro valor={DADOS.visitantes} sufixo="" rotulo="Pessoas acessaram a loja" top={ZONA_CARD} frames={entre(116.76, 119.5)} />
      </Em>
      <Sfx em={116.76} som="pop" volume={0.3} />

      <Em nome="Meta 10K" de={121.66} ate={126.6}>
        <MetaProgresso atual={DADOS.faturamentoTotal} meta={DADOS.meta} top={ZONA_CARD} />
      </Em>
      <Sfx em={121.66} som="whoosh" volume={0.3} />

      {/* ---------- ENCERRAMENTO ---------- */}
      <Em nome="Segue o perfil" de={126.65} ate={137.05}>
        <ChamadaSeguir top={ZONA_CARD} />
      </Em>
      <Sfx em={126.65} som="pop" volume={0.3} />
      <Sfx em={135.9} som="riser" volume={0.3} />
      <Em nome="Amanhã DIA 40" de={137.18} ate={142.7}>
        <ProximoEpisodio dia={DADOS.dia + 1} top={ZONA_CARD} />
      </Em>
      <Sfx em={137.18} som="impact" volume={0.45} />

      <Legendas paginas={EDICAO_DIA39.legendas} top={ZONA_LEGENDA} />

      <Sequence name="fim" from={durationInFrames - 1} durationInFrames={1}>
        <AbsoluteFill />
      </Sequence>
    </AbsoluteFill>
  );
};
