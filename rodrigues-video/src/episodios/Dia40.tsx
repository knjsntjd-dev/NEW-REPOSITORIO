import React, { useEffect, useState } from "react";
import { AbsoluteFill, Sequence, continueRender, delayRender, useVideoConfig } from "remotion";
import { Acabamento, Camera, Flash } from "../components/camera";
import {
  ChamadaSeguir,
  Comparacao,
  ContadorDinheiro,
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
import { fontsLoaded } from "../theme";
import { DADOS, ENFASE, FALAS, GANCHO, PAUSA_MAX, RESPIRO } from "./dia40-dados";
import { criarFerramentas } from "./ferramentas";

export const EDICAO_DIA40 = montarEdicao({
  falas: FALAS,
  gancho: GANCHO,
  pausaMax: PAUSA_MAX,
  respiro: RESPIRO,
  enfase: ENFASE,
});

/** Zona dos gráficos (sobre o peito, abaixo do rosto) e das legendas. */
const ZONA_CARD = 1010;
const ZONA_LEGENDA = 1450;

const { srcToOut } = EDICAO_DIA40;
const { Em, Sfx, entre } = criarFerramentas(srcToOut);

export const Dia40: React.FC = () => {
  const { fps } = useVideoConfig();
  const [handle] = useState(() => delayRender("Carregando fontes"));
  useEffect(() => {
    fontsLoaded.then(() => continueRender(handle));
  }, [handle]);

  const fimGancho = Math.round(srcToOut(0.34) * fps);
  const f01 = Math.round(0.1 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Camera clips={EDICAO_DIA40.clips} planos={EDICAO_DIA40.planos} src="dia40/base.mp4" />
      <Acabamento />

      {/* ---------- GANCHO: o total faturado desde o 1º dia ---------- */}
      <Sequence name="Gancho · faturamento" from={f01} durationInFrames={fimGancho - f01} premountFor={fps}>
        <ContadorDinheiro
          valor={DADOS.faturamentoTotal}
          rotulo="Desde o 1º dia, a loja faturou"
          top={ZONA_CARD}
          frames={entre(60.98, 65.8, true)}
        />
      </Sequence>
      <Sfx em={GANCHO[0]} gancho som="impact" volume={0.55} />
      <Sfx em={GANCHO[0] + 0.1} gancho som="pop" volume={0.3} />
      <Sequence name="Transição" from={fimGancho - Math.round(0.07 * fps)} durationInFrames={Math.round(0.33 * fps)}>
        <Flash />
      </Sequence>
      <Sfx em={0.34} som="whoosh" volume={0.4} />

      <SeloEpisodio dia={DADOS.dia} />

      {/* ---------- ABERTURA ---------- */}
      <Em nome="Título DIA 40" de={0.34} ate={5.9}>
        <TituloEpisodio dia={DADOS.dia} top={ZONA_CARD} />
      </Em>

      {/* ---------- HOJE ---------- */}
      <Em nome="Faturado hoje" de={10.9} ate={14.7}>
        <ContadorDinheiro valor={DADOS.faturadoHoje} rotulo="Hoje, até agora" cor="verde" top={ZONA_CARD} frames={entre(10.9, 13.3)} />
      </Em>
      <Sfx em={10.9} som="pop" volume={0.3} />

      <Em nome="Pedidos de hoje" de={15.03} ate={17.0}>
        <NotificacoesVenda quantidade={DADOS.pedidosHoje} top={ZONA_CARD} intervalo={6} />
      </Em>
      {/* UM único toque de venda Shopify para o grupo de notificações */}
      <Sfx em={15.03} som="venda-shopify" volume={0.32} />

      <Em nome="Conversão Shopify" de={17.05} ate={23.75}>
        <ContadorDinheiro
          valor={DADOS.conversao}
          casas={2}
          sufixo="%"
          rotulo="Taxa de conversão · Shopify"
          top={ZONA_CARD}
          frames={entre(20.7, 22.6)}
        />
      </Em>
      <Sfx em={17.05} som="whoosh" volume={0.3} />

      <Em nome="Visitantes hoje" de={24.73} ate={29.6}>
        <ContadorDinheiro valor={DADOS.visitantesHoje} sufixo="" rotulo="Visitantes hoje" top={ZONA_CARD} frames={entre(24.73, 27.5)} />
      </Em>
      <Sfx em={24.73} som="pop" volume={0.3} />

      {/* ---------- ROI ---------- */}
      <Em nome="ROI hoje" de={33.24} ate={43.0}>
        <Indicador rotulo="ROI" valor={DADOS.roiHoje} sub="Retorno sobre investimento" top={ZONA_CARD} />
      </Em>
      <Sfx em={33.24} som="whoosh" volume={0.3} />

      <Em nome="ROI ontem x hoje" de={44.18} ate={55.0}>
        <Comparacao
          top={ZONA_CARD}
          esquerda={{ rotulo: "ROI ontem", valor: DADOS.roiOntem, casas: 2, sufixo: "", sub: "DIA 39" }}
          direita={{ rotulo: "ROI hoje", valor: DADOS.roiHoje, casas: 2, sufixo: "", sub: "DIA 40" }}
          atrasoDireita={entre(44.18, 51.48)}
        />
      </Em>
      <Sfx em={44.18} som="pop" volume={0.3} />
      <Sfx em={51.48} som="impact" volume={0.35} />

      {/* ---------- RESULTADOS ACUMULADOS ---------- */}
      <Em nome="Faturamento total" de={58.78} ate={66.6}>
        <ContadorDinheiro valor={DADOS.faturamentoTotal} rotulo="Desde o 1º dia" top={ZONA_CARD} frames={entre(60.98, 65.8)} />
      </Em>
      <Sfx em={60.98} som="pop" volume={0.3} />

      <Em nome="Pedidos no total" de={66.58} ate={70.8}>
        <ContadorDinheiro valor={DADOS.pedidosTotal} sufixo="" rotulo="Pedidos no total" cor="verde" top={ZONA_CARD} frames={entre(67.77, 69.6)} />
      </Em>
      <Sfx em={67.77} som="pop" volume={0.3} />

      <Em nome="Visitas no total" de={70.97} ate={76.5}>
        <ContadorDinheiro valor={DADOS.visitasTotal} sufixo="" rotulo="Visitas na loja" top={ZONA_CARD} frames={entre(72.54, 75.2)} />
      </Em>
      <Sfx em={72.54} som="pop" volume={0.3} />

      <Em nome="Meta 10K" de={78.58} ate={83.0}>
        <MetaProgresso atual={DADOS.faturamentoTotal} meta={DADOS.meta} top={ZONA_CARD} />
      </Em>
      <Sfx em={78.58} som="whoosh" volume={0.3} />

      {/* ---------- CHAMADA PARA SEGUIR ---------- */}
      <Em nome="Segue o perfil" de={85.24} ate={90.6}>
        <ChamadaSeguir top={ZONA_CARD} />
      </Em>
      <Sfx em={85.24} som="pop" volume={0.3} />

      {/* ---------- A DICA ---------- */}
      <Em nome="A dica" de={90.71} ate={95.5}>
        <PalavraChave texto="A DICA" tamanho={230} apoio="Pra você" top={ZONA_CARD} />
      </Em>
      <Sfx em={90.71} som="impact" volume={0.35} />

      <Em nome="Trabalha pra você" de={95.99} ate={101.0}>
        <PalavraChave texto="TRABALHA PRA VOCÊ" tamanho={125} cor="verde" top={ZONA_CARD} />
      </Em>
      <Sfx em={95.99} som="whoosh" volume={0.3} />

      <Em nome="Salário mínimo" de={104.57} ate={108.0}>
        <PalavraChave texto="SALÁRIO MÍNIMO" tamanho={150} cor="branco" apoio="Como funcionário" top={ZONA_CARD} />
      </Em>
      <Sfx em={104.57} som="pop" volume={0.3} />

      <Em nome="Liberdade" de={110.65} ate={115.7}>
        <PalavraChave texto="LIBERDADE" tamanho={200} apoio="de tempo · financeira" top={ZONA_CARD} />
      </Em>
      <Sfx em={110.65} som="impact" volume={0.35} />

      {/* ---------- 10 MIL ---------- */}
      <Em nome="10 mil visualizações" de={125.78} ate={130.0}>
        <PalavraChave texto="+10 MIL" tamanho={210} apoio="visualizações em um vídeo" top={ZONA_CARD} />
      </Em>
      <Sfx em={125.78} som="impact" volume={0.35} />

      {/* ---------- ENCERRAMENTO ---------- */}
      <Sfx em={144.0} som="riser" volume={0.3} />
      <Em nome="Amanhã DIA 41" de={145.98} ate={149.7}>
        <ProximoEpisodio dia={DADOS.dia + 1} top={ZONA_CARD} />
      </Em>
      <Sfx em={145.98} som="impact" volume={0.45} />

      <Legendas paginas={EDICAO_DIA40.legendas} top={ZONA_LEGENDA} />
    </AbsoluteFill>
  );
};
