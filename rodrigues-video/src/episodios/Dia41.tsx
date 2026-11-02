import React, { useEffect, useState } from "react";
import { AbsoluteFill, Sequence, continueRender, delayRender, useVideoConfig } from "remotion";
import { Acabamento, Camera, Flash } from "../components/camera";
import { SeloEpisodio } from "../components/graficos";
import { Legendas } from "../components/legendas";
import {
  BentoResultados,
  BotaoSeguir,
  CardRolante,
  Chips,
  IlhaDinamica,
  Marcador,
  MetaAnel,
  TituloMascara,
} from "../components/motion-v2";
import { montarEdicao } from "../edicao";
import { fontsLoaded } from "../theme";
import { DADOS, ENFASE, FALAS, GANCHO, PAUSA_MAX, RESPIRO } from "./dia41-dados";
import { criarFerramentas } from "./ferramentas";

export const EDICAO_DIA41 = montarEdicao({
  falas: FALAS,
  gancho: GANCHO,
  pausaMax: PAUSA_MAX,
  respiro: RESPIRO,
  enfase: ENFASE,
});

const ZONA_CARD = 1030;
const ZONA_LEGENDA = 1460;

const { srcToOut } = EDICAO_DIA41;
const { Em, Sfx, entre } = criarFerramentas(srcToOut);

export const Dia41: React.FC = () => {
  const { fps } = useVideoConfig();
  const [handle] = useState(() => delayRender("Carregando fontes"));
  useEffect(() => {
    fontsLoaded.then(() => continueRender(handle));
  }, [handle]);

  const fimGancho = Math.round(srcToOut(0.12) * fps);
  const f01 = Math.round(0.1 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Imagem 100% original: zooms suaves e contidos (preservam nitidez), tremor nos números. */}
      <Camera
        clips={EDICAO_DIA41.clips}
        planos={EDICAO_DIA41.planos}
        src="dia41/base.mp4"
        estilo={{ fator: 0.5, suave: true, gancho: [1.12, 1.03], impactos: [12.44, 26.23, 37.24, 61.53, 106.74] }}
      />
      <Acabamento />

      {/* ---------- GANCHO: 9.533 € (a 467 € dos 10K) ---------- */}
      <Sequence name="Gancho · 9.533 €" from={f01} durationInFrames={fimGancho - f01} premountFor={fps}>
        <CardRolante rotulo="A loja já faturou" texto={DADOS.faturamentoTotal} sufixo="€" top={ZONA_CARD} tamanho={210} />
      </Sequence>
      <Sfx em={GANCHO[0]} gancho som="impact" volume={0.5} />
      <Sfx em={GANCHO[0] + 0.15} gancho som="whoosh" volume={0.25} />
      <Sequence name="Transição" from={fimGancho - Math.round(0.07 * fps)} durationInFrames={Math.round(0.33 * fps)}>
        <Flash />
      </Sequence>
      <Sfx em={0.12} som="whoosh" volume={0.4} />

      <SeloEpisodio dia={DADOS.dia} />

      {/* ---------- ABERTURA ---------- */}
      <Em nome="Título DIA 41" de={0.12} ate={5.5}>
        <TituloMascara
          top={ZONA_CARD - 20}
          linhas={[
            { texto: "DIA 41", tamanho: 250, cor: "ouro" },
            { texto: "DO ZERO AOS 10K", tamanho: 92, cor: "branco" },
          ]}
        />
      </Em>

      {/* ---------- HOJE ---------- */}
      <Em nome="Hoje 498 € (Dynamic Island)" de={11.29} ate={16.9}>
        <IlhaDinamica rotulo="Hoje, até agora" texto={DADOS.faturadoHoje} sufixo="€" top={ZONA_CARD + 40} />
      </Em>
      <Sfx em={11.55} som="venda-shopify" volume={0.3} />

      <Em nome="Conversão hoje" de={16.92} ate={21.95}>
        <CardRolante rotulo="Conversão de hoje" texto={DADOS.conversaoHoje} sufixo="%" cor="verde" top={ZONA_CARD} tamanho={210} />
      </Em>
      <Sfx em={16.92} som="pop" volume={0.28} />

      <Em nome="Melhores dias" de={22.07} ate={29.7}>
        <Marcador
          top={ZONA_CARD - 10}
          linhas={[
            { texto: "HOJE + DIA 35", tamanho: 110 },
            { texto: "OS MELHORES DIAS", tamanho: 120, marcar: true },
            { texto: "DA LOJA", tamanho: 110 },
          ]}
          delays={[0, entre(22.07, 26.23), entre(22.07, 28.47)]}
        />
      </Em>
      <Sfx em={22.07} som="whoosh" volume={0.28} />
      <Sfx em={26.23} som="impact" volume={0.35} />

      {/* ---------- RESULTADOS (bento 2x2: cada bloco entra quando o número é falado) ---------- */}
      <Em nome="Bento resultados" de={34.42} ate={56.4}>
        <BentoResultados
          top={ZONA_CARD - 20}
          titulo="Desde o 1º dia"
          itens={[
            { rotulo: "Faturamento", texto: DADOS.faturamentoTotal, sufixo: "€", delay: entre(34.42, 37.24) },
            { rotulo: "Pedidos", texto: DADOS.pedidosTotal, cor: "verde", delay: entre(34.42, 44.44) },
            { rotulo: "Visualizações", texto: DADOS.visualizacoes, cor: "branco", delay: entre(34.42, 47.1) },
            { rotulo: "Conversão", texto: DADOS.conversaoTotal, sufixo: "%", cor: "verde", delay: entre(34.42, 52.82) },
          ]}
        />
      </Em>
      <Sfx em={37.24} som="pop" volume={0.3} />
      <Sfx em={44.44} som="pop" volume={0.28} />
      <Sfx em={47.1} som="pop" volume={0.28} />
      <Sfx em={52.82} som="pop" volume={0.28} />

      {/* ---------- A DICA: CRIATIVOS UGC ---------- */}
      <Em nome="A dica de hoje" de={56.54} ate={61.4}>
        <TituloMascara
          top={ZONA_CARD}
          linhas={[
            { texto: "A DICA", tamanho: 210, cor: "ouro" },
            { texto: "DE HOJE", tamanho: 120, cor: "branco" },
          ]}
        />
      </Em>
      <Sfx em={56.54} som="impact" volume={0.35} />

      <Em nome="Criativos UGC" de={61.53} ate={69.5}>
        <TituloMascara
          top={ZONA_CARD}
          linhas={[
            { texto: "CRIATIVOS", tamanho: 170, cor: "branco" },
            { texto: "UGC", tamanho: 260, cor: "ouro" },
          ]}
        />
      </Em>
      <Sfx em={62.52} som="whoosh" volume={0.3} />

      <Em nome="O que é UGC" de={69.59} ate={78.2}>
        <Chips
          top={ZONA_CARD + 10}
          itens={[
            { texto: "Pessoas reais", delay: 0 },
            { texto: "Usando o produto", delay: entre(69.59, 71.3) },
            { texto: "Mineração nas redes", delay: entre(69.59, 73.05) },
          ]}
        />
      </Em>
      <Sfx em={69.59} som="pop" volume={0.26} />
      <Sfx em={71.3} som="pop" volume={0.26} />
      <Sfx em={73.05} som="pop" volume={0.26} />

      <Em nome="Criativos UGC (marcador)" de={84.54} ate={88.5}>
        <Marcador top={ZONA_CARD + 30} linhas={[{ texto: "CRIATIVOS UGC", tamanho: 140, marcar: true }]} />
      </Em>
      <Sfx em={84.54} som="impact" volume={0.3} />

      {/* ---------- SEGUIR ---------- */}
      <Em nome="Botão Seguir" de={88.6} ate={100.6}>
        <BotaoSeguir top={ZONA_CARD + 20} clique={entre(88.6, 95.6)} />
      </Em>
      <Sfx em={95.6} som="pop" volume={0.35} />

      {/* ---------- META ---------- */}
      <Em nome="Meta 10K" de={106.74} ate={110.5}>
        <MetaAnel atual={DADOS.totalNum} meta={DADOS.meta} top={ZONA_CARD - 20} rotulo="da meta 10K" />
      </Em>
      <Sfx em={106.74} som="riser" volume={0.28} />

      {/* ---------- AMANHÃ ---------- */}
      <Em nome="Amanhã DIA 42" de={110.55} ate={114.6}>
        <TituloMascara
          top={ZONA_CARD}
          linhas={[
            { texto: "AMANHÃ", tamanho: 100, cor: "branco" },
            { texto: "DIA 42", tamanho: 230, cor: "ouro" },
          ]}
        />
      </Em>
      <Sfx em={110.55} som="impact" volume={0.4} />

      {/* Legenda some enquanto a grade de resultados está na tela (os números já estão nela). */}
      <Legendas
        paginas={EDICAO_DIA41.legendas}
        top={ZONA_LEGENDA}
        estilo="pilula"
        ocultar={[[srcToOut(34.42), srcToOut(56.4)]]}
      />
    </AbsoluteFill>
  );
};
