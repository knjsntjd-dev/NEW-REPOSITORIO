import React from "react";
import { Easing, interpolate } from "remotion";
import { useFrame30 } from "../tempo";
import { C, FONT_TEXTO, FONT_TITULO, GOLD_TEXT, fmt } from "../theme";
import { Card, Extruded, Float3D, useContador, useEntrada } from "./motion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Rotulo: React.FC<{ readonly children: React.ReactNode; readonly color?: string; readonly size?: number }> = ({
  children,
  color = C.cinza,
  size = 34,
}) => (
  <div
    style={{
      fontFamily: FONT_TEXTO,
      fontWeight: 800,
      fontSize: size,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color,
    }}
  >
    {children}
  </div>
);

const GREEN_TEXT: React.CSSProperties = {
  backgroundImage: "linear-gradient(180deg, #D9FFC7 0%, #7EE26F 45%, #3FAE4A 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

// ---------------------------------------------------------------------------

/** Contador de dinheiro 3D (faturamento, gastos, retorno). */
export const ContadorDinheiro: React.FC<{
  readonly valor: number;
  readonly casas?: number;
  readonly rotulo: string;
  readonly sub?: string;
  readonly cor?: "ouro" | "verde";
  readonly top: number;
  readonly frames?: number;
  readonly tamanho?: number;
  readonly sufixo?: string;
}> = ({ valor, casas = 0, rotulo, sub, cor = "ouro", top, frames = 34, tamanho = 190, sufixo = "€" }) => {
  const v = useContador(valor, frames, 4);
  const verde = cor === "verde";
  return (
    <Float3D style={{ top, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <Card accent={verde ? C.verde : C.ouro} style={{ padding: "34px 64px 44px", textAlign: "center" }}>
        <Rotulo color={verde ? C.verde : C.ouro}>{rotulo}</Rotulo>
        <div style={{ marginTop: 14 }}>
          <Extruded
            size={tamanho}
            face={verde ? GREEN_TEXT : GOLD_TEXT}
            depthColor={verde ? "#1D5A22" : "#5A3D0C"}
            glow={verde ? "rgba(95,208,104,0.45)" : undefined}
          >
            {fmt(v, casas)}
            {sufixo ? <span style={{ fontSize: tamanho * 0.62, marginLeft: 14 }}>{sufixo}</span> : null}
          </Extruded>
        </div>
        {sub ? (
          <div style={{ marginTop: 18 }}>
            <Rotulo size={30} color="rgba(255,255,255,0.75)">
              {sub}
            </Rotulo>
          </div>
        ) : null}
      </Card>
    </Float3D>
  );
};

// ---------------------------------------------------------------------------

/** Palavra-chave gigante com extrusão 3D (LUCRO, 100% REAL...). */
export const PalavraChave: React.FC<{
  readonly texto: string;
  readonly top: number;
  readonly tamanho?: number;
  readonly cor?: "ouro" | "verde" | "branco";
  readonly apoio?: string;
}> = ({ texto, top, tamanho = 210, cor = "ouro", apoio }) => {
  const frame = useFrame30();
  const p = useEntrada(0, 11, 0.8);
  const face =
    cor === "ouro" ? GOLD_TEXT : cor === "verde" ? GREEN_TEXT : { color: C.branco };
  const depth = cor === "ouro" ? "#5A3D0C" : cor === "verde" ? "#1D5A22" : "#3A3A42";
  return (
    <Float3D style={{ top, left: 0, right: 0, textAlign: "center" }} tilt={70} from={[0, 60]}>
      <div
        style={{
          scale: String(interpolate(p, [0, 1], [1.6, 1]) + Math.sin(frame / 9) * 0.008),
          display: "inline-block",
        }}
      >
        <Extruded
          size={tamanho}
          face={face}
          depthColor={depth}
          depth={12}
          glow={cor === "verde" ? "rgba(95,208,104,0.5)" : cor === "branco" ? "rgba(255,255,255,0.25)" : undefined}
        >
          {texto}
        </Extruded>
      </div>
      {apoio ? (
        <div style={{ marginTop: 22 }}>
          <span
            style={{
              display: "inline-block",
              padding: "12px 26px",
              borderRadius: 999,
              background: "rgba(8,8,10,0.82)",
              border: `2px solid ${C.ouro}55`,
              boxShadow: "0 18px 40px rgba(0,0,0,0.5)",
            }}
          >
            <Rotulo size={32} color={C.branco}>
              {apoio}
            </Rotulo>
          </span>
        </div>
      ) : null}
    </Float3D>
  );
};

// ---------------------------------------------------------------------------

/** Dois cards lado a lado (ex.: investido x retorno). */
export const Comparacao: React.FC<{
  readonly esquerda: { rotulo: string; valor: number; sub: string; casas?: number; sufixo?: string };
  readonly direita: { rotulo: string; valor: number; sub: string; casas?: number; sufixo?: string };
  readonly top: number;
  /** Frame (relativo) em que o card da direita entra. */
  readonly atrasoDireita?: number;
}> = ({ esquerda, direita, top, atrasoDireita = 18 }) => {
  const vE = useContador(esquerda.valor, 26, 4);
  const vD = useContador(direita.valor, 30, atrasoDireita + 4);
  const seta = useEntrada(atrasoDireita - 4);
  const cardStyle: React.CSSProperties = { width: 400, padding: "28px 26px 32px", textAlign: "center" };
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, height: 360 }}>
      <Float3D style={{ left: 70, top: 0 }} from={[-120, 80]} tilt={40} phase={0.3}>
        <Card style={cardStyle}>
          <Rotulo size={28}>{esquerda.rotulo}</Rotulo>
          <div style={{ marginTop: 10 }}>
            <Extruded size={128} face={{ color: C.branco }} depthColor="#33333B" glow="rgba(255,255,255,0.2)">
              {fmt(vE, esquerda.casas ?? 0)}
              {(esquerda.sufixo ?? "€") ? <span style={{ fontSize: 80, marginLeft: 8 }}>{esquerda.sufixo ?? "€"}</span> : null}
            </Extruded>
          </div>
          <div style={{ marginTop: 12 }}>
            <Rotulo size={24} color="rgba(255,255,255,0.7)">
              {esquerda.sub}
            </Rotulo>
          </div>
        </Card>
      </Float3D>
      <div
        style={{
          position: "absolute",
          left: 540 - 34,
          top: 120,
          width: 68,
          height: 68,
          borderRadius: 999,
          background: C.ouro,
          boxShadow: "0 12px 30px rgba(0,0,0,0.55), 0 0 30px rgba(233,196,106,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 3,
          scale: String(seta),
          opacity: seta,
        }}
      >
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={C.preto} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </div>
      <Float3D style={{ right: 70, top: 0 }} delay={atrasoDireita} from={[120, 80]} tilt={40} phase={1.1}>
        <Card style={cardStyle} accent={C.verde} sheenDelay={atrasoDireita + 14}>
          <Rotulo size={28} color={C.verde}>
            {direita.rotulo}
          </Rotulo>
          <div style={{ marginTop: 10 }}>
            <Extruded size={128} face={GREEN_TEXT} depthColor="#1D5A22" glow="rgba(95,208,104,0.45)">
              {fmt(vD, direita.casas ?? 0)}
              {(direita.sufixo ?? "€") ? <span style={{ fontSize: 80, marginLeft: 8 }}>{direita.sufixo ?? "€"}</span> : null}
            </Extruded>
          </div>
          <div style={{ marginTop: 12 }}>
            <Rotulo size={24} color="rgba(255,255,255,0.7)">
              {direita.sub}
            </Rotulo>
          </div>
        </Card>
      </Float3D>
    </div>
  );
};

// ---------------------------------------------------------------------------

/** Indicador grande (ex.: ROI 1,34) com anel de progresso. */
export const Indicador: React.FC<{
  readonly rotulo: string;
  readonly valor: number;
  readonly casas?: number;
  readonly sub: string;
  readonly top: number;
}> = ({ rotulo, valor, casas = 2, sub, top }) => {
  const v = useContador(valor, 30, 4, 0);
  const anel = useContador(1, 34, 2);
  const R = 92;
  const L = 2 * Math.PI * R;
  return (
    <Float3D style={{ top, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <Card style={{ padding: "30px 46px 30px 34px", display: "flex", alignItems: "center", gap: 34 }}>
        <svg width="220" height="220" viewBox="0 0 220 220" style={{ filter: "drop-shadow(0 0 16px rgba(233,196,106,0.45))" }}>
          <defs>
            <linearGradient id="anelOuro" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFF0B8" />
              <stop offset="55%" stopColor="#E9C46A" />
              <stop offset="100%" stopColor="#B8892C" />
            </linearGradient>
          </defs>
          <circle cx="110" cy="110" r={R} stroke="rgba(255,255,255,0.12)" strokeWidth="18" fill="none" />
          <circle
            cx="110"
            cy="110"
            r={R}
            stroke="url(#anelOuro)"
            strokeWidth="18"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={L}
            strokeDashoffset={L * (1 - anel)}
            transform="rotate(-90 110 110)"
          />
          <text x="110" y="128" textAnchor="middle" fontFamily={FONT_TITULO} fontSize="56" fill={C.ouro}>
            {rotulo}
          </text>
        </svg>
        <div>
          <Extruded size={170} face={GOLD_TEXT}>
            {fmt(v, casas)}
          </Extruded>
          <div style={{ marginTop: 14 }}>
            <Rotulo size={30} color="rgba(255,255,255,0.8)">
              {sub}
            </Rotulo>
          </div>
        </div>
      </Card>
    </Float3D>
  );
};

// ---------------------------------------------------------------------------

/** Notificações de "nova encomenda" empilhando, no estilo do app da loja. */
export const NotificacoesVenda: React.FC<{
  readonly quantidade: number;
  readonly top: number;
  readonly intervalo?: number;
}> = ({ quantidade, top, intervalo = 7 }) => {
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0 }}>
      {Array.from({ length: quantidade }, (_, i) => (
        <Notificacao key={i} indice={i} total={quantidade} delay={i * intervalo} intervalo={intervalo} />
      ))}
    </div>
  );
};

const Notificacao: React.FC<{
  readonly indice: number;
  readonly total: number;
  readonly delay: number;
  readonly intervalo: number;
}> = ({ indice, total, delay, intervalo }) => {
  const p = useEntrada(delay, 15, 0.7);
  // Cada nova notificação empurra as anteriores para baixo e para trás.
  const frame = useFrame30();
  let empurrao = 0;
  for (let j = indice + 1; j < total; j++) {
    empurrao += interpolate(frame, [j * intervalo, j * intervalo + 8], [0, 1], clamp);
  }
  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        right: 90,
        top: 0,
        perspective: 1400,
        zIndex: indice,
      }}
    >
      <div
        style={{
          opacity: interpolate(p, [0, 0.4], [0, 1], clamp) * interpolate(empurrao, [2, 3.2], [1, 0], clamp),
          translate: `0 ${interpolate(p, [0, 1], [-90, 0]) + empurrao * 112}px`,
          scale: String(interpolate(p, [0, 1], [0.86, 1]) * (1 - empurrao * 0.05)),
          rotate: `x ${interpolate(p, [0, 1], [-35, 0])}deg`,
          filter: `brightness(${1 - empurrao * 0.18})`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            padding: "22px 28px",
            borderRadius: 30,
            background: "rgba(28,28,32,0.9)",
            backdropFilter: "blur(16px)",
            border: "1.5px solid rgba(255,255,255,0.12)",
            boxShadow: "0 26px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)",
          }}
        >
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 20,
              background: `linear-gradient(160deg, #A8D35A, ${C.verdeShopify} 50%, #5E8E2E)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 18px rgba(0,0,0,0.35)",
              flexShrink: 0,
            }}
          >
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round">
              <path d="M5 8h14l-1.2 12H6.2L5 8z" />
              <path d="M9 8V6.5a3 3 0 0 1 6 0V8" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ flex: 1, fontFamily: FONT_TEXTO }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontWeight: 800, fontSize: 34, color: C.branco }}>Nova encomenda</span>
              <span style={{ fontWeight: 500, fontSize: 26, color: "rgba(255,255,255,0.5)" }}>agora</span>
            </div>
            <div style={{ fontWeight: 500, fontSize: 28, color: "rgba(255,255,255,0.72)", marginTop: 4 }}>
              Loja RODRIGUES · pedido confirmado
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------

/** Barra de progresso até a meta da série (0 → 10K). */
export const MetaProgresso: React.FC<{
  readonly atual: number;
  readonly meta: number;
  readonly top: number;
  readonly delay?: number;
}> = ({ atual, meta, top, delay = 6 }) => {
  const frame = useFrame30();
  const fill = interpolate(frame - delay, [0, 40], [0, atual / meta], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  return (
    <Float3D style={{ top, left: 70, right: 70 }} tilt={35} from={[0, 80]} bob={0.5}>
      <Card style={{ padding: "26px 34px 30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <Rotulo size={28} color={C.ouro}>
            Meta da série
          </Rotulo>
          <span style={{ fontFamily: FONT_TITULO, fontSize: 52, ...GOLD_TEXT }}>
            {Math.round(fill * 100)}%
          </span>
        </div>
        <div
          style={{
            marginTop: 16,
            height: 34,
            borderRadius: 999,
            background: "rgba(255,255,255,0.1)",
            boxShadow: "inset 0 3px 8px rgba(0,0,0,0.6)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${fill * 100}%`,
              height: "100%",
              borderRadius: 999,
              background: "linear-gradient(90deg, #B8892C, #E9C46A 60%, #FFF0B8)",
              boxShadow: "0 0 24px rgba(233,196,106,0.7)",
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
          <Rotulo size={26} color="rgba(255,255,255,0.8)">
            {fmt(atual)} € faturados
          </Rotulo>
          <Rotulo size={26} color="rgba(255,255,255,0.55)">
            Meta 10K
          </Rotulo>
        </div>
      </Card>
    </Float3D>
  );
};

// ---------------------------------------------------------------------------

/** Dias da semana acendendo (como na referência) + texto de apoio. */
export const DiasSemana: React.FC<{
  readonly dias: string[];
  readonly titulo: string;
  readonly destaque: string;
  readonly top: number;
}> = ({ dias, titulo, destaque, top }) => {
  const frame = useFrame30();
  return (
    <Float3D style={{ top, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <Card style={{ padding: "24px 30px 28px", textAlign: "center" }}>
        <Rotulo size={28} color={C.ouro}>
          {titulo}
        </Rotulo>
        <div style={{ display: "flex", gap: 16, marginTop: 18, justifyContent: "center" }}>
          {dias.map((d, i) => {
            const on = interpolate(frame, [10 + i * 6, 16 + i * 6], [0, 1], clamp);
            return (
              <div
                key={d}
                style={{
                  fontFamily: FONT_TITULO,
                  fontSize: 64,
                  padding: "10px 30px",
                  borderRadius: 18,
                  color: on > 0.5 ? C.preto : "rgba(255,255,255,0.5)",
                  background: `rgba(95,208,104,${on})`,
                  border: "2px solid rgba(255,255,255,0.18)",
                  boxShadow: on > 0.5 ? "0 0 26px rgba(95,208,104,0.55), 0 10px 20px rgba(0,0,0,0.4)" : "none",
                  scale: String(1 + Math.sin(on * Math.PI) * 0.12),
                }}
              >
                {d}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 20 }}>
          <Extruded size={92} face={GREEN_TEXT} depthColor="#1D5A22" depth={6} glow="rgba(95,208,104,0.45)">
            {destaque}
          </Extruded>
        </div>
      </Card>
    </Float3D>
  );
};

// ---------------------------------------------------------------------------

/** Card de alerta (ex.: pior dia em vendas), seta para baixo. */
export const Alerta: React.FC<{ readonly rotulo: string; readonly texto: string; readonly top: number }> = ({
  rotulo,
  texto,
  top,
}) => {
  const frame = useFrame30();
  const seta = interpolate(frame, [8, 26], [-30, 0], { ...clamp, easing: Easing.out(Easing.back(2)) });
  return (
    <Float3D style={{ top, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <Card accent="#FFFFFF" style={{ padding: "26px 40px", display: "flex", alignItems: "center", gap: 28 }}>
        <div
          style={{
            width: 104,
            height: 104,
            borderRadius: 26,
            background: "rgba(255,255,255,0.08)",
            border: "2px solid rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="62" height="62" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ translate: `0 ${-seta * 0.4}px` }}>
            <path d="M3 6l7 7 4-4 7 7" />
            <path d="M21 10v6h-6" />
          </svg>
        </div>
        <div>
          <Rotulo size={26}>{rotulo}</Rotulo>
          <div style={{ fontFamily: FONT_TITULO, fontSize: 84, color: C.branco, lineHeight: 1.05, marginTop: 6 }}>
            {texto}
          </div>
        </div>
      </Card>
    </Float3D>
  );
};

// ---------------------------------------------------------------------------

/** Abertura do episódio: DIA 39 + nome da série. */
export const TituloEpisodio: React.FC<{ readonly dia: number; readonly top: number }> = ({ dia, top }) => {
  const frame = useFrame30();
  const linha = interpolate(frame, [8, 26], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <Float3D style={{ top, left: 0, right: 0, textAlign: "center" }} tilt={75} from={[0, 40]} bob={0.5}>
      <Extruded size={250} face={GOLD_TEXT} depth={14}>
        DIA {dia}
      </Extruded>
      <div
        style={{
          margin: "18px auto 0",
          height: 4,
          width: 520 * linha,
          background: `linear-gradient(90deg, transparent, ${C.ouro}, transparent)`,
        }}
      />
      <div style={{ marginTop: 16, opacity: linha }}>
        <Rotulo size={40} color={C.branco}>
          Do zero aos 10K
        </Rotulo>
      </div>
    </Float3D>
  );
};

/** Selo pequeno fixo no topo durante o episódio. */
export const SeloEpisodio: React.FC<{ readonly dia: number }> = ({ dia }) => {
  const p = useEntrada(0, 16);
  return (
    <div
      style={{
        position: "absolute",
        top: 210,
        left: 60,
        opacity: p,
        translate: `${interpolate(p, [0, 1], [-60, 0])}px 0`,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 22px 12px 14px",
        borderRadius: 999,
        background: "rgba(8,8,10,0.72)",
        border: `1.5px solid ${C.ouro}66`,
        boxShadow: "0 14px 30px rgba(0,0,0,0.45)",
      }}
    >
      <span
        style={{
          fontFamily: FONT_TITULO,
          fontSize: 36,
          padding: "2px 14px",
          borderRadius: 999,
          background: "linear-gradient(180deg, #FBE7A1, #C8962E)",
          color: C.preto,
        }}
      >
        DIA {dia}
      </span>
      <span style={{ fontFamily: FONT_TEXTO, fontWeight: 800, fontSize: 26, letterSpacing: "0.12em", color: C.branco }}>
        DO 0 AOS 10K
      </span>
    </div>
  );
};

// ---------------------------------------------------------------------------

/** Chamada para seguir o perfil. */
export const ChamadaSeguir: React.FC<{ readonly top: number }> = ({ top }) => {
  const frame = useFrame30();
  const pulso = 1 + Math.max(0, Math.sin(frame / 7)) * 0.035;
  return (
    <Float3D style={{ top, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <Card style={{ padding: "28px 44px 34px", textAlign: "center" }}>
        <Rotulo size={30} color="rgba(255,255,255,0.75)">
          Quer acompanhar a série?
        </Rotulo>
        <div style={{ marginTop: 16, scale: String(pulso) }}>
          <span
            style={{
              display: "inline-block",
              fontFamily: FONT_TITULO,
              fontSize: 92,
              padding: "6px 46px 10px",
              borderRadius: 999,
              background: "linear-gradient(180deg, #FBE7A1, #E9C46A 45%, #B8892C)",
              color: C.preto,
              boxShadow: "0 16px 36px rgba(0,0,0,0.5), 0 0 40px rgba(233,196,106,0.45)",
            }}
          >
            SEGUE O PERFIL
          </span>
        </div>
        <div style={{ marginTop: 18 }}>
          <Rotulo size={26} color={C.verde}>
            É de graça
          </Rotulo>
        </div>
      </Card>
    </Float3D>
  );
};

/** Gancho para o próximo episódio. */
export const ProximoEpisodio: React.FC<{ readonly dia: number; readonly top: number }> = ({ dia, top }) => (
  <Float3D style={{ top, left: 0, right: 0, textAlign: "center" }} tilt={70}>
    <Rotulo size={40} color={C.branco}>
      Amanhã
    </Rotulo>
    <div style={{ marginTop: 10 }}>
      <Extruded size={230} face={GOLD_TEXT} depth={14}>
        DIA {dia}
      </Extruded>
    </div>
  </Float3D>
);

// ---------------------------------------------------------------------------

/** Fórmula em 3 etapas reveladas no ritmo da fala: A + B = C. */
export const Formula: React.FC<{
  readonly itens: [string, string, string];
  /** Frames (relativos) de entrada de cada item. */
  readonly tempos: [number, number, number];
  readonly top: number;
}> = ({ itens, tempos, top }) => {
  const sinais = ["", "+ ", "= "];
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, height: 400 }}>
      {itens.map((txt, i) => {
        const final = i === 2;
        return (
          <Float3D
            key={txt}
            style={{ top: i * 128, left: 0, right: 0, display: "flex", justifyContent: "center" }}
            delay={tempos[i]}
            from={[i % 2 ? 160 : -160, 30]}
            tilt={30}
            phase={i * 0.7}
          >
            <div
              style={{
                padding: "12px 40px 16px",
                borderRadius: 24,
                background: final ? "linear-gradient(180deg, #A9EE9A, #5FD068 50%, #349A3D)" : "rgba(12,12,16,0.85)",
                border: final ? "none" : `2px solid ${C.ouro}66`,
                boxShadow: final
                  ? "0 22px 44px rgba(0,0,0,0.5), 0 0 40px rgba(95,208,104,0.5)"
                  : "0 22px 44px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",
                fontFamily: FONT_TITULO,
                fontSize: 78,
                lineHeight: 1,
                color: final ? C.preto : C.branco,
              }}
            >
              {sinais[i] ? (
                <span style={final ? { color: "#1D5A22" } : GOLD_TEXT}>{sinais[i]}</span>
              ) : null}
              {txt}
            </div>
          </Float3D>
        );
      })}
    </div>
  );
};
