// Anúncio "QUER TER A SUA PRÓPRIA MARCA?" — serviço de criação de marca + loja Shopify (70 €).
import { Audio } from "@remotion/media";
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Sequence, continueRender, delayRender, interpolate, staticFile, useVideoConfig } from "remotion";
import { fontsLoaded } from "../theme";
import {
  CenaCTA,
  CenaChecklist,
  CenaGancho,
  CenaMensagens,
  CenaPreco,
  CenaProva,
  CenaVirada,
  EtapaBanners,
  EtapaDominio,
  EtapaIdentidade,
  EtapaLogo,
  EtapaNome,
  EtapaSite,
  FundoPremium,
} from "./cenas";

/** Linha do tempo em segundos: [início, fim]. */
const T = {
  gancho: [0, 3.8],
  mensagens: [3.8, 8.6],
  virada: [8.6, 11.6],
  nome: [11.6, 13.9],
  logo: [13.9, 16.2],
  identidade: [16.2, 18.5],
  banners: [18.5, 20.8],
  dominio: [20.8, 23.3],
  site: [23.3, 26.4],
  checklist: [26.4, 30.0],
  prova: [30.0, 34.0],
  preco: [34.0, 38.4],
  cta: [38.4, 44.4],
} as const;
export const DURACAO_ANUNCIO = 44.4;

const Cena: React.FC<{ readonly t: readonly [number, number]; readonly nome: string; readonly children: React.ReactNode }> = ({ t, nome, children }) => {
  const { fps } = useVideoConfig();
  return (
    <Sequence name={nome} from={Math.round(t[0] * fps)} durationInFrames={Math.round((t[1] - t[0]) * fps)} premountFor={fps}>
      {children}
    </Sequence>
  );
};

const Sfx: React.FC<{ readonly em: number; readonly som: string; readonly volume: number }> = ({ em, som, volume }) => {
  const { fps } = useVideoConfig();
  return (
    <Sequence name={`SFX ${som}`} from={Math.round(em * fps)} durationInFrames={2 * fps}>
      <Audio src={staticFile(`sfx/${som}.wav`)} volume={volume} />
    </Sequence>
  );
};

export const MarcaPropria: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const [handle] = useState(() => delayRender("Carregando fontes"));
  useEffect(() => {
    fontsLoaded.then(() => continueRender(handle));
  }, [handle]);
  const etapas = 6;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <FundoPremium />

      <Cena t={T.gancho} nome="Gancho"><CenaGancho /></Cena>
      <Cena t={T.mensagens} nome="Mensagens"><CenaMensagens /></Cena>
      <Cena t={T.virada} nome="Vou criar a sua marca do zero"><CenaVirada /></Cena>
      <Cena t={T.nome} nome="1 Nome"><EtapaNome n={1} total={etapas} /></Cena>
      <Cena t={T.logo} nome="2 Logo"><EtapaLogo n={2} total={etapas} /></Cena>
      <Cena t={T.identidade} nome="3 Identidade"><EtapaIdentidade n={3} total={etapas} /></Cena>
      <Cena t={T.banners} nome="4 Banners"><EtapaBanners n={4} total={etapas} /></Cena>
      <Cena t={T.dominio} nome="5 Domínio e e-mail"><EtapaDominio n={5} total={etapas} /></Cena>
      <Cena t={T.site} nome="6 Site Shopify"><EtapaSite n={6} total={etapas} /></Cena>
      <Cena t={T.checklist} nome="Checklist"><CenaChecklist /></Cena>
      <Cena t={T.prova} nome="Prova 15.000 €"><CenaProva /></Cena>
      <Cena t={T.preco} nome="Preço 70 €"><CenaPreco /></Cena>
      <Cena t={T.cta} nome="CTA"><CenaCTA /></Cena>

      {/* Música (sem direitos autorais, enviada pelo Rodrigues) com fade no fim */}
      <Audio
        src={staticFile("anuncio/musica.mp3")}
        volume={(f) => 0.55 * interpolate(f, [0, 10, durationInFrames - 1.5 * fps, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />

      {/* Efeitos sonoros */}
      <Sfx em={0.0} som="impact" volume={0.6} />
      <Sfx em={0.25} som="whoosh" volume={0.35} />
      <Sfx em={3.8 + 0.6} som="pop" volume={0.35} />
      <Sfx em={3.8 + 1.4} som="pop" volume={0.35} />
      <Sfx em={3.8 + 2.2} som="pop" volume={0.35} />
      <Sfx em={8.6} som="whoosh" volume={0.4} />
      <Sfx em={8.6 + 0.87} som="impact" volume={0.5} />
      <Sfx em={11.6} som="whoosh" volume={0.3} />
      <Sfx em={13.9} som="whoosh" volume={0.3} />
      <Sfx em={16.2} som="whoosh" volume={0.3} />
      <Sfx em={18.5} som="whoosh" volume={0.3} />
      <Sfx em={20.8} som="whoosh" volume={0.3} />
      <Sfx em={23.3} som="whoosh" volume={0.3} />
      <Sfx em={26.4} som="pop" volume={0.3} />
      <Sfx em={30.0} som="venda-shopify" volume={0.4} />
      <Sfx em={32.8} som="riser" volume={0.35} />
      <Sfx em={34.0 + 0.53} som="impact" volume={0.6} />
      <Sfx em={38.4 + 1.2} som="pop" volume={0.4} />
      <Sfx em={38.4 + 2.93} som="pop" volume={0.4} />
      <Sfx em={38.4 + 3.33} som="impact" volume={0.4} />
    </AbsoluteFill>
  );
};
