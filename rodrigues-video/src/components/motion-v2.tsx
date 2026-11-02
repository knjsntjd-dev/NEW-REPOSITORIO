// Pacote de motion "v2" (DIA 41+): linguagem visual atual de criadores de negócios/tecnologia —
// dígitos que rolam (odômetro), bordas com luz girando, notificação estilo Dynamic Island, títulos
// revelados por máscara, marcador de texto, grade bento, anel de meta e botão "Seguir" com cursor.
// Mesma paleta RODRIGUES (preto, branco, dourado, verde) para manter a identidade da série.
import React from "react";
import { Easing, interpolate, spring } from "remotion";
import { FPS_DESIGN, useFrame30 } from "../tempo";
import { C, FONT_TEXTO, FONT_TITULO, GOLD_TEXT } from "../theme";
import { useEntrada, useSaida } from "./motion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const GREEN_TEXT: React.CSSProperties = {
  backgroundImage: "linear-gradient(180deg, #D9FFC7 0%, #7EE26F 45%, #3FAE4A 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

/** Mola em "tempo de 30 fps" (independente do fps do render). */
const useMola = (delay: number, config: { damping?: number; stiffness?: number; mass?: number } = {}) => {
  const f = useFrame30();
  return spring({ frame: f - delay, fps: FPS_DESIGN, config: { damping: 18, stiffness: 140, mass: 0.9, ...config } });
};

/** Entrada/saída padrão do v2: sobe com desfoque → nítido, sai encolhendo com desfoque. */
const EntradaV2: React.FC<{
  readonly children: React.ReactNode;
  readonly delay?: number;
  readonly style?: React.CSSProperties;
}> = ({ children, delay = 0, style }) => {
  const p = useEntrada(delay, 16, 0.85);
  const out = useSaida(8);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: interpolate(p, [0, 0.3], [0, 1], clamp) * (1 - out),
        translate: `0 ${interpolate(p, [0, 1], [70, 0]) - out * 30}px`,
        scale: String(interpolate(p, [0, 1], [0.9, 1]) * (1 - out * 0.08)),
        filter: `blur(${interpolate(p, [0, 0.6], [16, 0], clamp) + out * 12}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ---------------------------------------------------------------------------

/** Moldura de vidro com uma luz dourada girando pela borda (borda "viva"). */
export const BordaViva: React.FC<{
  readonly children: React.ReactNode;
  readonly cor?: string;
  readonly raio?: number;
  readonly style?: React.CSSProperties;
  readonly brilho?: number;
}> = ({ children, cor = C.ouro, raio = 34, style, brilho = 1 }) => {
  const f = useFrame30();
  const ang = (f * 5) % 360;
  return (
    <div
      style={{
        position: "relative",
        padding: 2.5,
        borderRadius: raio,
        background: `conic-gradient(from ${ang}deg, rgba(255,255,255,0.10) 0deg, ${cor} 50deg, #FFF7D6 70deg, ${cor} 90deg, rgba(255,255,255,0.10) 150deg, rgba(255,255,255,0.10) 360deg)`,
        boxShadow: `0 40px 90px rgba(0,0,0,0.55), 0 0 ${50 * brilho}px ${cor}33`,
        ...style,
      }}
    >
      <div
        style={{
          borderRadius: raio - 2.5,
          background: "linear-gradient(160deg, rgba(30,30,36,0.94) 0%, rgba(10,10,13,0.92) 60%, rgba(4,4,6,0.95) 100%)",
          backdropFilter: "blur(18px)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -20px 40px rgba(0,0,0,0.35)",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------

/**
 * Número estilo odômetro: cada dígito rola verticalmente até o valor (com desfoque de movimento),
 * da direita para a esquerda. Separadores e sufixos entram com fade.
 */
export const NumeroRolante: React.FC<{
  readonly texto: string; // já formatado: "9.533", "6,92"
  readonly tamanho: number;
  readonly delay?: number;
  readonly cor?: "ouro" | "verde" | "branco";
  readonly sufixo?: string;
}> = ({ texto, tamanho, delay = 0, cor = "ouro", sufixo }) => {
  const f = useFrame30();
  const face = cor === "ouro" ? GOLD_TEXT : cor === "verde" ? GREEN_TEXT : { color: C.branco };
  const glow = cor === "ouro" ? "rgba(233,196,106,0.45)" : cor === "verde" ? "rgba(95,208,104,0.45)" : "rgba(255,255,255,0.25)";
  const chars = texto.split("");
  const nDig = chars.filter((c) => /\d/.test(c)).length;
  let idxDig = 0;
  const base: React.CSSProperties = { fontFamily: FONT_TITULO, fontSize: tamanho, lineHeight: 1, ...face };
  return (
    <div style={{ display: "flex", alignItems: "flex-end", filter: `drop-shadow(0 0 22px ${glow}) drop-shadow(0 10px 18px rgba(0,0,0,0.6))` }}>
      {chars.map((c, i) => {
        if (!/\d/.test(c)) {
          const o = interpolate(f - delay, [4, 10], [0, 1], clamp);
          return (
            <span key={i} style={{ ...base, opacity: o }}>
              {c}
            </span>
          );
        }
        const d = Number(c);
        const ordem = nDig - 1 - idxDig++; // direita -> esquerda
        const atraso = delay + ordem * 3;
        const pos = (fr: number) =>
          spring({ frame: fr - atraso, fps: FPS_DESIGN, config: { damping: 20, stiffness: 70, mass: 1 } }) * (10 + d);
        const v = Math.abs(pos(f) - pos(f - 1));
        // Larguras reais da Anton (advance/em): todos os dígitos 0,494, exceto "1" = 0,331.
        // A coluna estreita para a largura do dígito final quando o rolamento assenta.
        const assentou = interpolate(pos(f) / (10 + d), [0.85, 1], [0, 1], clamp);
        const largura = tamanho * (0.494 + ((d === 1 ? 0.331 : 0.494) - 0.494) * assentou);
        return (
          <div key={i} style={{ height: tamanho, width: largura, overflow: "hidden", display: "flex", justifyContent: "center" }}>
            <div
              style={{
                translate: `0 ${-pos(f) * tamanho}px`,
                filter: `blur(${Math.min(5, v * 4)}px)`,
              }}
            >
              {Array.from({ length: 20 }, (_, k) => (
                <div key={k} style={{ ...base, height: tamanho, textAlign: "center" }}>
                  {k % 10}
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {sufixo ? (
        <span style={{ ...base, fontSize: tamanho * 0.6, marginLeft: tamanho * 0.08, marginBottom: tamanho * 0.06, opacity: interpolate(f - delay, [10, 18], [0, 1], clamp) }}>
          {sufixo}
        </span>
      ) : null}
    </div>
  );
};

// ---------------------------------------------------------------------------

const Etiqueta: React.FC<{ readonly children: React.ReactNode; readonly cor?: string; readonly tamanho?: number }> = ({
  children,
  cor = "rgba(255,255,255,0.7)",
  tamanho = 30,
}) => (
  <div style={{ fontFamily: FONT_TEXTO, fontWeight: 800, fontSize: tamanho, letterSpacing: "0.16em", textTransform: "uppercase", color: cor }}>
    {children}
  </div>
);

/** Card com borda viva + número rolante (faturamento, conversão...). */
export const CardRolante: React.FC<{
  readonly rotulo: string;
  readonly texto: string;
  readonly sufixo?: string;
  readonly cor?: "ouro" | "verde" | "branco";
  readonly top: number;
  readonly tamanho?: number;
  readonly sub?: string;
}> = ({ rotulo, texto, sufixo, cor = "ouro", top, tamanho = 200, sub }) => (
  <EntradaV2 style={{ top }}>
    <BordaViva cor={cor === "verde" ? C.verde : C.ouro}>
      <div style={{ padding: "30px 60px 36px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Etiqueta cor={cor === "verde" ? C.verde : C.ouro}>{rotulo}</Etiqueta>
        <div style={{ marginTop: 14 }}>
          <NumeroRolante texto={texto} sufixo={sufixo} tamanho={tamanho} cor={cor} delay={4} />
        </div>
        {sub ? (
          <div style={{ marginTop: 14 }}>
            <Etiqueta tamanho={26}>{sub}</Etiqueta>
          </div>
        ) : null}
      </div>
    </BordaViva>
  </EntradaV2>
);

// ---------------------------------------------------------------------------

/** Notificação estilo Dynamic Island: pílula preta que "explode" num card com o valor. */
export const IlhaDinamica: React.FC<{
  readonly rotulo: string;
  readonly texto: string;
  readonly sufixo?: string;
  readonly top: number;
}> = ({ rotulo, texto, sufixo, top }) => {
  const f = useFrame30();
  const nasce = useMola(0, { damping: 16, stiffness: 180 });
  const abre = useMola(8, { damping: 15, stiffness: 120 });
  const out = useSaida(8);
  const w = interpolate(abre, [0, 1], [150, 880]);
  const h = interpolate(abre, [0, 1], [56, 210]);
  const conteudo = interpolate(f, [16, 24], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: interpolate(nasce, [0, 0.3], [0, 1], clamp) * (1 - out),
        scale: String(interpolate(nasce, [0, 1], [0.6, 1]) * (1 - out * 0.1)),
        filter: `blur(${out * 10}px)`,
      }}
    >
      <div
        style={{
          width: w,
          height: h,
          borderRadius: Math.min(h / 2, 70),
          background: "#000",
          border: "1.5px solid rgba(255,255,255,0.10)",
          boxShadow: "0 30px 70px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          padding: "0 40px",
          gap: 30,
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            flexShrink: 0,
            borderRadius: 34,
            background: `linear-gradient(160deg, #A8D35A, ${C.verdeShopify} 50%, #5E8E2E)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: conteudo,
            scale: String(interpolate(conteudo, [0, 1], [0.6, 1])),
            boxShadow: "0 0 40px rgba(149,191,71,0.45)",
          }}
        >
          <svg width="66" height="66" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.1" strokeLinejoin="round">
            <path d="M5 8h14l-1.2 12H6.2L5 8z" />
            <path d="M9 8V6.5a3 3 0 0 1 6 0V8" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ flex: 1, opacity: conteudo, translate: `${interpolate(conteudo, [0, 1], [30, 0])}px 0` }}>
          <Etiqueta tamanho={28} cor="rgba(255,255,255,0.6)">
            {rotulo}
          </Etiqueta>
          <div style={{ marginTop: 6 }}>
            <NumeroRolante texto={texto} sufixo={sufixo} tamanho={120} cor="verde" delay={18} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------

/**
 * Título com revelação por máscara: cada palavra sobe de trás de uma linha invisível, com desfoque
 * → nítido; linha de destaque dourada se desenha embaixo.
 */
export const TituloMascara: React.FC<{
  readonly linhas: { texto: string; tamanho: number; cor?: "ouro" | "branco" | "verde" }[];
  readonly top: number;
  readonly delay?: number;
  readonly sublinhado?: boolean;
}> = ({ linhas, top, delay = 0, sublinhado = true }) => {
  const f = useFrame30();
  const out = useSaida(8);
  let k = 0;
  const totalPalavras = linhas.reduce((a, l) => a + l.texto.split(" ").length, 0);
  const linha = interpolate(f - delay, [6 + totalPalavras * 3, 20 + totalPalavras * 3], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 60,
        right: 60,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: 1 - out,
        filter: `blur(${out * 12}px)`,
        translate: `0 ${-out * 30}px`,
      }}
    >
      {linhas.map((l, li) => {
        const face = l.cor === "ouro" ? GOLD_TEXT : l.cor === "verde" ? GREEN_TEXT : { color: C.branco };
        return (
          <div key={li} style={{ display: "flex", gap: l.tamanho * 0.22, overflow: "hidden", paddingTop: l.tamanho * 0.06 }}>
            {l.texto.split(" ").map((w, wi) => {
              const p = spring({ frame: f - delay - k++ * 3, fps: FPS_DESIGN, config: { damping: 17, stiffness: 150, mass: 0.8 } });
              return (
                <span
                  key={wi}
                  style={{
                    display: "inline-block",
                    fontFamily: FONT_TITULO,
                    fontSize: l.tamanho,
                    lineHeight: 1.02,
                    ...face,
                    translate: `0 ${interpolate(p, [0, 1], [l.tamanho * 1.05, 0])}px`,
                    rotate: `${interpolate(p, [0, 1], [6, 0])}deg`,
                    filter: `blur(${interpolate(p, [0, 0.7], [10, 0], clamp)}px) drop-shadow(0 10px 22px rgba(0,0,0,0.65))${l.cor === "ouro" ? " drop-shadow(0 0 20px rgba(233,196,106,0.4))" : ""}`,
                  }}
                >
                  {w}
                </span>
              );
            })}
          </div>
        );
      })}
      {sublinhado ? (
        <div
          style={{
            marginTop: 16,
            height: 6,
            width: 560 * linha,
            borderRadius: 6,
            background: `linear-gradient(90deg, transparent, ${C.ouro}, #FFF3C4, ${C.ouro}, transparent)`,
            boxShadow: "0 0 20px rgba(233,196,106,0.6)",
          }}
        />
      ) : null}
    </div>
  );
};

// ---------------------------------------------------------------------------

/** Texto com "marca-texto" dourado passando por trás das palavras destacadas. */
export const Marcador: React.FC<{
  readonly linhas: { texto: string; marcar?: boolean; tamanho: number }[];
  readonly top: number;
  readonly delays?: number[];
}> = ({ linhas, top, delays }) => {
  const f = useFrame30();
  const out = useSaida(8);
  return (
    <div style={{ position: "absolute", top, left: 50, right: 50, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: 1 - out, filter: `blur(${out * 12}px)` }}>
      {linhas.map((l, i) => {
        const d = delays?.[i] ?? i * 6;
        const p = spring({ frame: f - d, fps: FPS_DESIGN, config: { damping: 18, stiffness: 160 } });
        const mk = interpolate(f - d, [6, 16], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
        return (
          <div
            key={i}
            style={{
              position: "relative",
              padding: `0 ${l.tamanho * 0.18}px`,
              opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
              translate: `0 ${interpolate(p, [0, 1], [40, 0])}px`,
              filter: `blur(${interpolate(p, [0, 0.6], [10, 0], clamp)}px)`,
            }}
          >
            {l.marcar ? (
              <div
                style={{
                  position: "absolute",
                  inset: `${l.tamanho * 0.08}px 0 ${l.tamanho * 0.02}px 0`,
                  background: "linear-gradient(180deg, #FBE7A1, #E9C46A 55%, #C8962E)",
                  borderRadius: 10,
                  transformOrigin: "left center",
                  scale: `${mk} 1`,
                  transform: "skewX(-8deg)",
                  boxShadow: "0 0 40px rgba(233,196,106,0.45), 0 18px 30px rgba(0,0,0,0.45)",
                }}
              />
            ) : null}
            <span
              style={{
                position: "relative",
                fontFamily: FONT_TITULO,
                fontSize: l.tamanho,
                lineHeight: 1.08,
                color: l.marcar && mk > 0.55 ? C.preto : C.branco,
                textShadow: l.marcar && mk > 0.55 ? "none" : "0 8px 24px rgba(0,0,0,0.7)",
              }}
            >
              {l.texto}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------

/** Grade "bento" de resultados: cada bloco entra no momento em que o número é falado. */
export const BentoResultados: React.FC<{
  readonly itens: { rotulo: string; texto: string; sufixo?: string; cor?: "ouro" | "verde" | "branco"; delay: number; largo?: boolean }[];
  readonly top: number;
  readonly titulo?: string;
}> = ({ itens, top, titulo }) => {
  const f = useFrame30();
  const out = useSaida(8);
  const ultimo = itens.reduce((m, it, i) => (f >= it.delay ? i : m), -1);
  return (
    <div style={{ position: "absolute", top, left: 70, right: 70, opacity: 1 - out, filter: `blur(${out * 12}px)`, translate: `0 ${-out * 30}px` }}>
      {titulo ? (
        <div style={{ textAlign: "center", marginBottom: 14, opacity: interpolate(f, [0, 8], [0, 1], clamp) }}>
          <Etiqueta tamanho={28} cor={C.ouro}>
            {titulo}
          </Etiqueta>
        </div>
      ) : null}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {itens.map((it, i) => {
          const p = spring({ frame: f - it.delay, fps: FPS_DESIGN, config: { damping: 15, stiffness: 160, mass: 0.8 } });
          const ativo = i === ultimo;
          return (
            <div
              key={i}
              style={{
                width: it.largo ? "100%" : "calc(50% - 8px)",
                opacity: interpolate(p, [0, 0.25], [0, 1], clamp),
                scale: String(interpolate(p, [0, 1], [0.82, 1])),
                filter: `blur(${interpolate(p, [0, 0.6], [12, 0], clamp)}px)`,
              }}
            >
              <BordaViva cor={it.cor === "verde" ? C.verde : C.ouro} raio={28} brilho={ativo ? 1.4 : 0.3}>
                <div style={{ padding: "20px 26px 24px", display: "flex", flexDirection: "column", alignItems: it.largo ? "center" : "flex-start" }}>
                  <Etiqueta tamanho={24} cor={ativo ? (it.cor === "verde" ? C.verde : C.ouro) : "rgba(255,255,255,0.6)"}>
                    {it.rotulo}
                  </Etiqueta>
                  <div style={{ marginTop: 8 }}>
                    <NumeroRolante texto={it.texto} sufixo={it.sufixo} tamanho={it.largo ? 150 : 104} cor={it.cor ?? "ouro"} delay={it.delay + 3} />
                  </div>
                </div>
              </BordaViva>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------

/** Anel de progresso da meta, com brilho pulsando perto do fim. */
export const MetaAnel: React.FC<{ readonly atual: number; readonly meta: number; readonly top: number; readonly rotulo: string }> = ({
  atual,
  meta,
  top,
  rotulo,
}) => {
  const f = useFrame30();
  const pct = atual / meta;
  const fill = interpolate(f, [6, 46], [0, pct], { ...clamp, easing: Easing.out(Easing.cubic) });
  const R = 150;
  const L = 2 * Math.PI * R;
  const pulso = 0.6 + 0.4 * Math.sin(f / 5);
  const ponta = -Math.PI / 2 + fill * 2 * Math.PI;
  return (
    <EntradaV2 style={{ top }}>
      <div style={{ position: "relative", width: 380, height: 380 }}>
        <svg width="380" height="380" viewBox="0 0 380 380" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <defs>
            <linearGradient id="anelMeta" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFF3C4" />
              <stop offset="55%" stopColor="#E9C46A" />
              <stop offset="100%" stopColor="#B8892C" />
            </linearGradient>
          </defs>
          <circle cx="190" cy="190" r={R + 34} fill="rgba(6,6,8,0.82)" stroke="rgba(255,255,255,0.08)" />
          <circle cx="190" cy="190" r={R} stroke="rgba(255,255,255,0.10)" strokeWidth="26" fill="none" />
          <circle
            cx="190"
            cy="190"
            r={R}
            stroke="url(#anelMeta)"
            strokeWidth="26"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={L}
            strokeDashoffset={L * (1 - fill)}
            transform="rotate(-90 190 190)"
            style={{ filter: `drop-shadow(0 0 ${14 + 10 * pulso}px rgba(233,196,106,0.7))` }}
          />
          <circle cx={190 + R * Math.cos(ponta)} cy={190 + R * Math.sin(ponta)} r={16} fill="#FFF7D6" style={{ filter: "drop-shadow(0 0 16px #FFE9A0)" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: FONT_TITULO, fontSize: 130, lineHeight: 1, ...GOLD_TEXT, filter: "drop-shadow(0 0 20px rgba(233,196,106,0.45))" }}>
            {Math.round(fill * 100)}%
          </div>
          <Etiqueta tamanho={24}>{rotulo}</Etiqueta>
        </div>
      </div>
    </EntradaV2>
  );
};

// ---------------------------------------------------------------------------

/** "Chips" (etiquetas) que entram em sequência — resumo visual de uma ideia. */
export const Chips: React.FC<{ readonly itens: { texto: string; delay: number }[]; readonly top: number }> = ({ itens, top }) => {
  const f = useFrame30();
  const out = useSaida(8);
  return (
    <div style={{ position: "absolute", top, left: 70, right: 70, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: 1 - out, filter: `blur(${out * 12}px)` }}>
      {itens.map((it, i) => {
        const p = spring({ frame: f - it.delay, fps: FPS_DESIGN, config: { damping: 14, stiffness: 180, mass: 0.7 } });
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "16px 34px 16px 18px",
              borderRadius: 999,
              background: "rgba(10,10,13,0.86)",
              border: `2px solid ${C.ouro}55`,
              boxShadow: "0 22px 50px rgba(0,0,0,0.5)",
              opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
              translate: `${interpolate(p, [0, 1], [i % 2 ? 120 : -120, 0])}px 0`,
              filter: `blur(${interpolate(p, [0, 0.6], [10, 0], clamp)}px)`,
            }}
          >
            <div style={{ width: 54, height: 54, borderRadius: 999, background: "linear-gradient(180deg, #FBE7A1, #C8962E)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={C.preto} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </div>
            <span style={{ fontFamily: FONT_TEXTO, fontWeight: 900, fontSize: 46, color: C.branco, textTransform: "uppercase", letterSpacing: "0.02em" }}>{it.texto}</span>
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------

/** Botão "Seguir" com cursor que entra, clica (ondulação) e vira "Seguindo ✓". */
export const BotaoSeguir: React.FC<{ readonly top: number; readonly clique: number }> = ({ top, clique }) => {
  const f = useFrame30();
  const cur = interpolate(f, [clique - 16, clique - 2], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const press = interpolate(f, [clique - 1, clique + 2, clique + 7], [1, 0.92, 1], clamp);
  const feito = f >= clique + 1;
  const onda = interpolate(f, [clique, clique + 16], [0, 1], clamp);
  return (
    <EntradaV2 style={{ top }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <Etiqueta tamanho={30} cor="rgba(255,255,255,0.8)">
          Acompanhe a série · é de graça
        </Etiqueta>
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 520,
              height: 520,
              marginLeft: -260,
              marginTop: -260,
              borderRadius: 999,
              border: `4px solid ${feito ? C.verde : C.ouro}`,
              opacity: onda > 0 ? 1 - onda : 0,
              scale: String(0.3 + onda * 0.9),
            }}
          />
          <div
            style={{
              scale: String(press),
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "22px 64px",
              borderRadius: 999,
              background: feito ? "linear-gradient(180deg, #A9EE9A, #5FD068 55%, #349A3D)" : "linear-gradient(180deg, #FBE7A1, #E9C46A 45%, #B8892C)",
              boxShadow: `0 22px 50px rgba(0,0,0,0.55), 0 0 50px ${feito ? "rgba(95,208,104,0.5)" : "rgba(233,196,106,0.45)"}`,
              fontFamily: FONT_TITULO,
              fontSize: 96,
              color: C.preto,
              lineHeight: 1,
            }}
          >
            {feito ? (
              <>
                <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke={C.preto} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
                SEGUINDO
              </>
            ) : (
              "SEGUIR"
            )}
          </div>
          {/* cursor */}
          <svg
            width="90"
            height="90"
            viewBox="0 0 24 24"
            style={{
              position: "absolute",
              left: interpolate(cur, [0, 1], [520, 300]),
              top: interpolate(cur, [0, 1], [240, 60]),
              opacity: interpolate(f, [clique - 16, clique - 10, clique + 22, clique + 30], [0, 1, 1, 0], clamp),
              scale: String(press),
              filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.6))",
            }}
          >
            <path d="M4 2l15 11-6.5 1.2L16 21l-3 1.4-3.6-6.8L4 20z" fill="#fff" stroke="#000" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </EntradaV2>
  );
};
