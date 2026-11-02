// Cenas do anúncio "MARCA PRÓPRIA DO ZERO" (serviço do Rodrigues, 70 €).
// Vídeo 100% em motion graphics, na identidade da série: preto, dourado, branco e verde Shopify.
import React from "react";
import { AbsoluteFill, Easing, interpolate, random, spring } from "remotion";
import { useEntrada, useSaida } from "../components/motion";
import { BordaViva } from "../components/motion-v2";
import { FPS_DESIGN, useFrame30 } from "../tempo";
import { C, FONT_TEXTO, FONT_TITULO, GOLD_TEXT } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const mola = (f: number, delay: number, cfg: { damping?: number; stiffness?: number; mass?: number } = {}) =>
  spring({ frame: f - delay, fps: FPS_DESIGN, config: { damping: 16, stiffness: 150, mass: 0.85, ...cfg } });

const Etiqueta: React.FC<{ readonly children: React.ReactNode; readonly cor?: string; readonly tamanho?: number }> = ({
  children,
  cor = "rgba(255,255,255,0.7)",
  tamanho = 30,
}) => (
  <div style={{ fontFamily: FONT_TEXTO, fontWeight: 800, fontSize: tamanho, letterSpacing: "0.16em", textTransform: "uppercase", color: cor }}>
    {children}
  </div>
);

/** Saída padrão de cena (encolhe + desfoca) — envolve o conteúdo da cena inteira. */
const SaidaCena: React.FC<{ readonly children: React.ReactNode }> = ({ children }) => {
  const out = useSaida(8);
  return <AbsoluteFill style={{ opacity: 1 - out, filter: `blur(${out * 14}px)`, scale: String(1 - out * 0.06) }}>{children}</AbsoluteFill>;
};

// ---------------------------------------------------------------------------

/** Fundo premium: preto profundo, luzes douradas lentas, grade em perspectiva e partículas. */
export const FundoPremium: React.FC = () => {
  const f = useFrame30();
  const t = f / FPS_DESIGN;
  return (
    <AbsoluteFill style={{ backgroundColor: C.preto, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: [
            `radial-gradient(circle at ${50 + Math.sin(t * 0.35) * 22}% ${28 + Math.cos(t * 0.27) * 10}%, rgba(233,196,106,0.20), transparent 42%)`,
            `radial-gradient(circle at ${30 + Math.cos(t * 0.22) * 20}% ${78 + Math.sin(t * 0.3) * 8}%, rgba(95,208,104,0.10), transparent 40%)`,
            `radial-gradient(circle at ${80 + Math.sin(t * 0.18) * 10}% ${60 + Math.cos(t * 0.24) * 14}%, rgba(184,137,44,0.16), transparent 38%)`,
          ].join(", "),
        }}
      />
      {/* grade em perspectiva (chão) */}
      <div style={{ position: "absolute", left: -540, right: -540, bottom: -200, height: 1100, perspective: 900 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            rotate: "x 72deg",
            backgroundImage:
              "linear-gradient(rgba(233,196,106,0.16) 2px, transparent 2px), linear-gradient(90deg, rgba(233,196,106,0.16) 2px, transparent 2px)",
            backgroundSize: "120px 120px",
            backgroundPosition: `0 ${(f * 2) % 120}px`,
            maskImage: "linear-gradient(to top, rgba(0,0,0,0.9), transparent 75%)",
            WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.9), transparent 75%)",
          }}
        />
      </div>
      {/* partículas */}
      {Array.from({ length: 40 }, (_, i) => {
        const x = random(`px${i}`) * 1080;
        const vel = 0.6 + random(`pv${i}`) * 1.6;
        const y = 1920 - ((random(`py${i}`) * 1920 + f * vel * 2) % 2100);
        const s = 2 + random(`ps${i}`) * 5;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.sin(t + i) * 14,
              top: y,
              width: s,
              height: s,
              borderRadius: 999,
              background: i % 5 === 0 ? C.verde : C.ouro,
              opacity: 0.18 + random(`po${i}`) * 0.4,
              boxShadow: `0 0 ${s * 3}px ${i % 5 === 0 ? C.verde : C.ouro}`,
            }}
          />
        );
      })}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.65) 100%)" }} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------

/** Palavra a palavra com revelação por máscara (para títulos das cenas). */
const LinhaMascara: React.FC<{
  readonly texto: string;
  readonly tamanho: number;
  readonly cor?: "ouro" | "branco" | "verde";
  readonly delay?: number;
}> = ({ texto, tamanho, cor = "branco", delay = 0 }) => {
  const f = useFrame30();
  const face =
    cor === "ouro"
      ? GOLD_TEXT
      : cor === "verde"
        ? { backgroundImage: "linear-gradient(180deg, #D9FFC7, #7EE26F 45%, #3FAE4A)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }
        : { color: C.branco };
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: tamanho * 0.22, overflow: "hidden", paddingTop: tamanho * 0.06 }}>
      {texto.split(" ").map((w, i) => {
        const p = mola(f, delay + i * 3, { damping: 17, stiffness: 150, mass: 0.8 });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontFamily: FONT_TITULO,
              fontSize: tamanho,
              lineHeight: 1.04,
              ...face,
              translate: `0 ${interpolate(p, [0, 1], [tamanho * 1.05, 0])}px`,
              rotate: `${interpolate(p, [0, 1], [6, 0])}deg`,
              filter: `blur(${interpolate(p, [0, 0.7], [10, 0], clamp)}px) drop-shadow(0 10px 22px rgba(0,0,0,0.65))${cor === "ouro" ? " drop-shadow(0 0 22px rgba(233,196,106,0.45))" : ""}`,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// 1. GANCHO

export const CenaGancho: React.FC = () => {
  const f = useFrame30();
  const chip = mola(f, 34);
  const brilho = interpolate(f, [18, 40], [-120, 220], { ...clamp, easing: Easing.inOut(Easing.quad) });
  return (
    <SaidaCena>
      <div style={{ position: "absolute", top: 560, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <LinhaMascara texto="QUER TER A SUA" tamanho={118} />
        <div style={{ position: "relative", overflow: "hidden" }}>
          <LinhaMascara texto="PRÓPRIA MARCA?" tamanho={140} cor="ouro" delay={8} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.45) 50%, transparent 60%)",
              translate: `${brilho}% 0`,
              mixBlendMode: "overlay",
            }}
          />
        </div>
        <div
          style={{
            marginTop: 40,
            padding: "18px 40px",
            borderRadius: 999,
            background: "rgba(10,10,13,0.85)",
            border: `2px solid ${C.verde}88`,
            boxShadow: "0 20px 50px rgba(0,0,0,0.5), 0 0 40px rgba(95,208,104,0.25)",
            opacity: interpolate(chip, [0, 0.3], [0, 1], clamp),
            translate: `0 ${interpolate(chip, [0, 1], [40, 0])}px`,
            scale: String(interpolate(chip, [0, 1], [0.8, 1])),
          }}
        >
          <Etiqueta tamanho={40} cor={C.branco}>
            e começar no <span style={{ color: C.verde }}>dropshipping</span>
          </Etiqueta>
        </div>
      </div>
    </SaidaCena>
  );
};

// ---------------------------------------------------------------------------
// 2. PROBLEMA — mensagens que ele recebe

const Bolha: React.FC<{ readonly texto: string; readonly delay: number; readonly lado: "esq" | "dir" }> = ({ texto, delay, lado }) => {
  const f = useFrame30();
  const digitando = f >= delay && f < delay + 12;
  const p = mola(f, delay + 12, { damping: 15, stiffness: 200, mass: 0.7 });
  const entrada = mola(f, delay, { damping: 18, stiffness: 220 });
  if (f < delay) return <div style={{ height: 0 }} />;
  const comum: React.CSSProperties = {
    alignSelf: lado === "esq" ? "flex-start" : "flex-end",
    borderRadius: 40,
    borderBottomLeftRadius: lado === "esq" ? 10 : 40,
    borderBottomRightRadius: lado === "dir" ? 10 : 40,
    boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
  };
  if (digitando) {
    return (
      <div style={{ ...comum, padding: "26px 34px", background: "#26262C", display: "flex", gap: 10, scale: String(entrada) }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 16, height: 16, borderRadius: 99, background: "rgba(255,255,255,0.7)", translate: `0 ${Math.sin((f - delay) / 2 + i) * 5}px` }} />
        ))}
      </div>
    );
  }
  return (
    <div
      style={{
        ...comum,
        maxWidth: 760,
        padding: "26px 36px",
        background: lado === "esq" ? "#26262C" : "linear-gradient(135deg, #7B5BFF, #C04BD8 55%, #F2557A)",
        fontFamily: FONT_TEXTO,
        fontWeight: 700,
        fontSize: 44,
        lineHeight: 1.2,
        color: C.branco,
        scale: String(interpolate(p, [0, 1], [0.85, 1])),
        opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
        transformOrigin: lado === "esq" ? "left bottom" : "right bottom",
      }}
    >
      {texto}
    </div>
  );
};

export const CenaMensagens: React.FC = () => {
  const f = useFrame30();
  const topo = mola(f, 0);
  return (
    <SaidaCena>
      <div style={{ position: "absolute", top: 300, left: 0, right: 0, textAlign: "center", opacity: topo, translate: `0 ${interpolate(topo, [0, 1], [30, 0])}px` }}>
        <Etiqueta tamanho={34} cor={C.ouro}>
          Tenho recebido muitas mensagens
        </Etiqueta>
      </div>
      <div style={{ position: "absolute", top: 470, left: 80, right: 80, display: "flex", flexDirection: "column", gap: 28 }}>
        <Bolha lado="esq" delay={6} texto="Quero começar no dropshipping" />
        <Bolha lado="esq" delay={30} texto="Mas não sei por onde começar" />
        <Bolha lado="esq" delay={54} texto="Como crio uma loja profissional?" />
      </div>
    </SaidaCena>
  );
};

// ---------------------------------------------------------------------------
// 3. VIRADA — "VOU CRIAR A SUA MARCA DO ZERO"

export const CenaVirada: React.FC = () => {
  const f = useFrame30();
  const mk = interpolate(f, [14, 26], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const fogo = mola(f, 26, { damping: 12, stiffness: 160 });
  return (
    <SaidaCena>
      <div style={{ position: "absolute", top: 600, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <LinhaMascara texto="VOU CRIAR" tamanho={130} />
        <div style={{ position: "relative", padding: "0 30px" }}>
          <div
            style={{
              position: "absolute",
              inset: "14px 0 4px 0",
              background: "linear-gradient(180deg, #FBE7A1, #E9C46A 55%, #C8962E)",
              borderRadius: 14,
              transformOrigin: "left center",
              scale: `${mk} 1`,
              transform: "skewX(-8deg)",
              boxShadow: "0 0 50px rgba(233,196,106,0.5), 0 20px 40px rgba(0,0,0,0.5)",
            }}
          />
          <div style={{ position: "relative", fontFamily: FONT_TITULO, fontSize: 150, lineHeight: 1.1, color: mk > 0.55 ? C.preto : C.branco }}>A SUA MARCA</div>
        </div>
        <div style={{ scale: String(interpolate(fogo, [0, 1], [2.2, 1])), opacity: interpolate(fogo, [0, 0.2], [0, 1], clamp), filter: `blur(${interpolate(fogo, [0, 0.6], [12, 0], clamp)}px)` }}>
          <span style={{ fontFamily: FONT_TITULO, fontSize: 200, lineHeight: 1, ...GOLD_TEXT, filter: "drop-shadow(0 0 30px rgba(233,196,106,0.55))" }}>DO ZERO</span>
        </div>
      </div>
    </SaidaCena>
  );
};

// ---------------------------------------------------------------------------
// 4. CONSTRUÇÃO DA MARCA — cada entrega "acontece" na tela

/** Moldura de etapa: número, título e o "palco" onde a peça é construída. */
const Etapa: React.FC<{ readonly n: number; readonly total: number; readonly titulo: string; readonly children: React.ReactNode }> = ({
  n,
  total,
  titulo,
  children,
}) => {
  const f = useFrame30();
  const p = useEntrada(0, 16, 0.85);
  const out = useSaida(7);
  return (
    <AbsoluteFill style={{ opacity: (1 - out) * interpolate(p, [0, 0.3], [0, 1], clamp), filter: `blur(${out * 12}px)` }}>
      <div style={{ position: "absolute", top: 300, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <div style={{ display: "flex", gap: 10 }}>
          {Array.from({ length: total }, (_, i) => (
            <div key={i} style={{ width: i + 1 === n ? 64 : 22, height: 10, borderRadius: 99, background: i + 1 <= n ? C.ouro : "rgba(255,255,255,0.18)", boxShadow: i + 1 === n ? "0 0 16px rgba(233,196,106,0.7)" : "none" }} />
          ))}
        </div>
        <div style={{ overflow: "hidden" }}>
          <div style={{ fontFamily: FONT_TITULO, fontSize: 96, color: C.branco, translate: `0 ${interpolate(p, [0, 1], [110, 0])}px`, textShadow: "0 10px 30px rgba(0,0,0,0.6)" }}>
            {titulo}
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 640, left: 0, right: 0, height: 900, display: "flex", alignItems: "center", justifyContent: "center", translate: `0 ${interpolate(p, [0, 1], [60, 0]) + Math.sin(f / 18) * 6}px` }}>
        {children}
      </div>
    </AbsoluteFill>
  );
};

/** 1 — Nome exclusivo: digitado com cursor. */
export const EtapaNome: React.FC<{ readonly n: number; readonly total: number }> = (p) => {
  const f = useFrame30();
  const nome = "SUA MARCA";
  const letras = Math.floor(interpolate(f, [8, 32], [0, nome.length], clamp));
  const cursor = Math.floor(f / 8) % 2 === 0;
  const pronto = f > 34;
  return (
    <Etapa {...p} titulo="NOME EXCLUSIVO">
      <BordaViva raio={40}>
        <div style={{ padding: "60px 80px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <div style={{ fontFamily: FONT_TITULO, fontSize: 150, lineHeight: 1, ...(pronto ? GOLD_TEXT : { color: C.branco }), display: "flex", alignItems: "center" }}>
            {nome.slice(0, letras)}
            <span style={{ width: 8, height: 130, marginLeft: 10, background: C.ouro, opacity: cursor && !pronto ? 1 : 0 }} />
          </div>
          <Etiqueta tamanho={28} cor={pronto ? C.verde : "rgba(255,255,255,0.5)"}>
            {pronto ? "✓ nome disponível" : "a criar..."}
          </Etiqueta>
        </div>
      </BordaViva>
    </Etapa>
  );
};

/** 2 — Logotipo: monograma desenhado em traço e preenchido. */
export const EtapaLogo: React.FC<{ readonly n: number; readonly total: number }> = (p) => {
  const f = useFrame30();
  const traco = interpolate(f, [6, 34], [1, 0], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const preenche = interpolate(f, [30, 42], [0, 1], clamp);
  const giro = mola(f, 4, { damping: 14, stiffness: 90 });
  return (
    <Etapa {...p} titulo="LOGOTIPO PROFISSIONAL">
      <div style={{ position: "relative", width: 520, height: 520, rotate: `${interpolate(giro, [0, 1], [-30, 0])}deg`, scale: String(interpolate(giro, [0, 1], [0.7, 1])) }}>
        <svg width="520" height="520" viewBox="0 0 200 200" style={{ overflow: "visible", filter: `drop-shadow(0 0 ${20 * preenche + 6}px rgba(233,196,106,0.6))` }}>
          <defs>
            <linearGradient id="ouroLogo" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFF3C4" />
              <stop offset="50%" stopColor="#E9C46A" />
              <stop offset="100%" stopColor="#B8892C" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="88" fill="none" stroke="url(#ouroLogo)" strokeWidth="5" pathLength={1} strokeDasharray="1" strokeDashoffset={traco} />
          <circle cx="100" cy="100" r="74" fill={`rgba(233,196,106,${0.12 * preenche})`} stroke="rgba(233,196,106,0.35)" strokeWidth="1.5" pathLength={1} strokeDasharray="1" strokeDashoffset={traco} />
          <path
            d="M58 140 V62 L100 112 L142 62 V140"
            fill="none"
            stroke="url(#ouroLogo)"
            strokeWidth="13"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset={traco}
          />
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: -40, textAlign: "center", opacity: preenche }}>
          <Etiqueta tamanho={34} cor={C.ouro}>
            SUA MARCA
          </Etiqueta>
        </div>
      </div>
    </Etapa>
  );
};

/** 3 — Identidade visual: paleta de cores + tipografia. */
export const EtapaIdentidade: React.FC<{ readonly n: number; readonly total: number }> = (p) => {
  const f = useFrame30();
  const cores = [
    { c: "#07070A", nome: "PRETO" },
    { c: "#E9C46A", nome: "DOURADO" },
    { c: "#FFFFFF", nome: "BRANCO" },
    { c: "#5FD068", nome: "VERDE" },
  ];
  const fonte = mola(f, 26);
  return (
    <Etapa {...p} titulo="IDENTIDADE VISUAL">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 50 }}>
        <div style={{ display: "flex", gap: 24 }}>
          {cores.map((k, i) => {
            const s = mola(f, 4 + i * 5, { damping: 12, stiffness: 180, mass: 0.7 });
            return (
              <div key={k.nome} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, translate: `0 ${interpolate(s, [0, 1], [-260, 0])}px`, opacity: interpolate(s, [0, 0.2], [0, 1], clamp) }}>
                <div style={{ width: 190, height: 260, borderRadius: 30, background: k.c, border: "2px solid rgba(255,255,255,0.2)", boxShadow: `0 30px 60px rgba(0,0,0,0.55)${k.c === "#E9C46A" ? ", 0 0 40px rgba(233,196,106,0.4)" : ""}` }} />
                <Etiqueta tamanho={22}>{k.nome}</Etiqueta>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 40, opacity: fonte, translate: `0 ${interpolate(fonte, [0, 1], [40, 0])}px` }}>
          <span style={{ fontFamily: FONT_TITULO, fontSize: 170, lineHeight: 1, ...GOLD_TEXT }}>Aa</span>
          <span style={{ fontFamily: FONT_TEXTO, fontWeight: 900, fontSize: 110, lineHeight: 1, color: C.branco }}>Aa</span>
        </div>
      </div>
    </Etapa>
  );
};

/** 4 — Banners profissionais para a loja. */
export const EtapaBanners: React.FC<{ readonly n: number; readonly total: number }> = (p) => {
  const f = useFrame30();
  const banners = [
    { t: "NOVA COLEÇÃO", s: "Descubra já", g: "linear-gradient(120deg, #1A1A20, #3A2C0E 60%, #E9C46A)" },
    { t: "ENVIO GRÁTIS", s: "Em toda a loja", g: "linear-gradient(120deg, #0E1A10, #1E4A24 60%, #5FD068)" },
    { t: "-20% HOJE", s: "Oferta especial", g: "linear-gradient(120deg, #141418, #2A2A33 50%, #FFFFFF)" },
  ];
  return (
    <Etapa {...p} titulo="BANNERS PROFISSIONAIS">
      <div style={{ position: "relative", width: 900, height: 700, perspective: 1600 }}>
        {banners.map((b, i) => {
          const s = mola(f, 4 + i * 8, { damping: 15, stiffness: 130 });
          return (
            <div
              key={b.t}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: i * 210,
                height: 260,
                borderRadius: 32,
                background: b.g,
                border: "2px solid rgba(255,255,255,0.14)",
                boxShadow: "0 30px 70px rgba(0,0,0,0.6)",
                padding: "40px 50px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                translate: `${interpolate(s, [0, 1], [i % 2 ? 900 : -900, 0])}px 0`,
                rotate: `y ${interpolate(s, [0, 1], [i % 2 ? -40 : 40, 0])}deg`,
                zIndex: 3 - i,
              }}
            >
              <div style={{ fontFamily: FONT_TITULO, fontSize: 96, lineHeight: 1, color: C.branco, textShadow: "0 8px 20px rgba(0,0,0,0.5)" }}>{b.t}</div>
              <div style={{ marginTop: 12, display: "inline-flex", alignSelf: "flex-start", padding: "10px 26px", borderRadius: 99, background: "rgba(0,0,0,0.55)" }}>
                <Etiqueta tamanho={24} cor={C.branco}>
                  {b.s}
                </Etiqueta>
              </div>
            </div>
          );
        })}
      </div>
    </Etapa>
  );
};

/** 5 — Domínio próprio + e-mail profissional (barra do navegador e e-mail digitados). */
export const EtapaDominio: React.FC<{ readonly n: number; readonly total: number }> = (p) => {
  const f = useFrame30();
  const url = "www.suamarca.com";
  const mail = "contacto@suamarca.com";
  const u = Math.floor(interpolate(f, [6, 26], [0, url.length], clamp));
  const m = Math.floor(interpolate(f, [26, 46], [0, mail.length], clamp));
  const ok1 = f > 28;
  const ok2 = f > 48;
  const caixa = (conteudo: React.ReactNode, icone: React.ReactNode, ok: boolean, rotulo: string, delay: number) => {
    const s = mola(f, delay);
    return (
      <div style={{ width: 920, opacity: interpolate(s, [0, 0.3], [0, 1], clamp), translate: `0 ${interpolate(s, [0, 1], [50, 0])}px` }}>
        <Etiqueta tamanho={26} cor={C.ouro}>
          {rotulo}
        </Etiqueta>
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 22, padding: "30px 34px", borderRadius: 28, background: "rgba(16,16,20,0.92)", border: `2px solid ${ok ? C.verde : "rgba(255,255,255,0.14)"}`, boxShadow: `0 24px 50px rgba(0,0,0,0.55)${ok ? ", 0 0 30px rgba(95,208,104,0.3)" : ""}` }}>
          {icone}
          <div style={{ flex: 1, fontFamily: FONT_TEXTO, fontWeight: 700, fontSize: 52, color: C.branco, whiteSpace: "nowrap" }}>{conteudo}</div>
          <div style={{ width: 56, height: 56, borderRadius: 99, background: ok ? C.verde : "transparent", display: "flex", alignItems: "center", justifyContent: "center", scale: String(ok ? 1 : 0.4), opacity: ok ? 1 : 0 }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.preto} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </div>
        </div>
      </div>
    );
  };
  return (
    <Etapa {...p} titulo="DOMÍNIO + E-MAIL PRÓPRIOS">
      <div style={{ display: "flex", flexDirection: "column", gap: 60 }}>
        {caixa(
          <>
            {url.slice(0, u)}
            <span style={{ opacity: Math.floor(f / 8) % 2 === 0 && !ok1 ? 1 : 0, color: C.ouro }}>|</span>
          </>,
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke={C.verde} strokeWidth="2.2">
            <rect x="5" y="10" width="14" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
          </svg>,
          ok1,
          "Domínio próprio",
          2,
        )}
        {caixa(
          <>
            {mail.slice(0, m)}
            <span style={{ opacity: Math.floor(f / 8) % 2 === 0 && ok1 && !ok2 ? 1 : 0, color: C.ouro }}>|</span>
          </>,
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke={C.ouro} strokeWidth="2.2" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3.5 6.5l8.5 7 8.5-7" />
          </svg>,
          ok2,
          "E-mail profissional",
          20,
        )}
      </div>
    </Etapa>
  );
};

/** 6 — Site completo na Shopify: celular com a loja montando e rolando. */
export const EtapaSite: React.FC<{ readonly n: number; readonly total: number }> = (p) => {
  const f = useFrame30();
  const tel = mola(f, 0, { damping: 15, stiffness: 110 });
  const rola = interpolate(f, [34, 70], [0, -250], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const barra = mola(f, 40, { damping: 15, stiffness: 180 });
  const bloco = (i: number) => mola(f, 8 + i * 4, { damping: 16, stiffness: 200, mass: 0.7 });
  const B = (i: number, st: React.CSSProperties, children?: React.ReactNode) => {
    const s = bloco(i);
    return <div style={{ opacity: interpolate(s, [0, 0.3], [0, 1], clamp), scale: String(interpolate(s, [0, 1], [0.85, 1])), ...st }}>{children}</div>;
  };
  return (
    <Etapa {...p} titulo="SITE COMPLETO NA SHOPIFY">
      <div
        style={{
          width: 480,
          height: 900,
          borderRadius: 70,
          background: "#000",
          border: "10px solid #1E1E24",
          boxShadow: "0 50px 100px rgba(0,0,0,0.7), 0 0 0 2px rgba(255,255,255,0.08), 0 0 60px rgba(233,196,106,0.2)",
          overflow: "hidden",
          position: "relative",
          translate: `0 ${interpolate(tel, [0, 1], [300, 0])}px`,
          rotate: `x ${interpolate(tel, [0, 1], [25, 0])}deg`,
        }}
      >
        <div style={{ position: "absolute", top: 18, left: "50%", marginLeft: -70, width: 140, height: 38, borderRadius: 99, background: "#000", zIndex: 5 }} />
        <div style={{ position: "absolute", inset: 0, background: "#0D0D10", translate: `0 ${rola}px`, padding: "80px 26px 26px", display: "flex", flexDirection: "column", gap: 20 }}>
          {B(0, { display: "flex", alignItems: "center", justifyContent: "space-between" },
            <>
              <span style={{ fontFamily: FONT_TITULO, fontSize: 40, ...GOLD_TEXT }}>SUA MARCA</span>
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M5 8h14l-1.2 12H6.2L5 8z" />
                <path d="M9 8V6.5a3 3 0 0 1 6 0V8" strokeLinecap="round" />
              </svg>
            </>,
          )}
          {B(1, { height: 300, borderRadius: 24, background: "linear-gradient(135deg, #2A200A, #E9C46A)", padding: 26, display: "flex", flexDirection: "column", justifyContent: "flex-end" },
            <>
              <span style={{ fontFamily: FONT_TITULO, fontSize: 54, color: C.preto, lineHeight: 1 }}>NOVA COLEÇÃO</span>
              <span style={{ marginTop: 10, alignSelf: "flex-start", padding: "8px 22px", borderRadius: 99, background: C.preto, color: C.branco, fontFamily: FONT_TEXTO, fontWeight: 800, fontSize: 22 }}>COMPRAR</span>
            </>,
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            {[0, 1, 2, 3, 4, 5].map((k) =>
              B(2 + k, { width: "calc(50% - 8px)", borderRadius: 20, background: "#1A1A20", padding: 14, display: "flex", flexDirection: "column", gap: 10 },
                <>
                  <div style={{ height: 170, borderRadius: 14, background: `linear-gradient(160deg, #2A2A33, ${["#3A2C0E", "#1E4A24", "#33333B"][k % 3]})` }} />
                  <div style={{ height: 14, width: "80%", borderRadius: 7, background: "rgba(255,255,255,0.3)" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ height: 14, width: "40%", borderRadius: 7, background: C.ouro }} />
                    <div style={{ padding: "6px 14px", borderRadius: 99, background: C.verde, fontFamily: FONT_TEXTO, fontWeight: 900, fontSize: 16, color: C.preto }}>+</div>
                  </div>
                </>,
              ),
            )}
          </div>
        </div>
        {/* barra de compra fixa (checkout) */}
        <div
          style={{
            position: "absolute",
            left: 22,
            right: 22,
            bottom: 26,
            height: 86,
            borderRadius: 99,
            background: "linear-gradient(180deg, #A9EE9A, #5FD068 55%, #349A3D)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT_TEXTO,
            fontWeight: 900,
            fontSize: 30,
            color: C.preto,
            letterSpacing: "0.06em",
            boxShadow: "0 -10px 30px rgba(0,0,0,0.6), 0 0 30px rgba(95,208,104,0.4)",
            translate: `0 ${interpolate(barra, [0, 1], [140, 0])}px`,
          }}
        >
          FINALIZAR COMPRA
        </div>
      </div>
    </Etapa>
  );
};

// ---------------------------------------------------------------------------
// 5. CHECKLIST — tudo o que vem incluído

export const CenaChecklist: React.FC = () => {
  const f = useFrame30();
  const itens = [
    "Nome exclusivo",
    "Logotipo profissional",
    "Identidade visual",
    "Banners para a loja",
    "E-mail profissional",
    "Domínio próprio",
    "Site completo na Shopify",
    "Visual personalizado",
  ];
  const topo = mola(f, 0);
  return (
    <SaidaCena>
      <div style={{ position: "absolute", top: 260, left: 0, right: 0, textAlign: "center", opacity: topo, translate: `0 ${interpolate(topo, [0, 1], [-30, 0])}px` }}>
        <span style={{ fontFamily: FONT_TITULO, fontSize: 110, ...GOLD_TEXT, filter: "drop-shadow(0 0 20px rgba(233,196,106,0.4))" }}>VOCÊ RECEBE</span>
      </div>
      <div style={{ position: "absolute", top: 450, left: 90, right: 90 }}>
        <BordaViva raio={40}>
          <div style={{ padding: "34px 44px", display: "flex", flexDirection: "column", gap: 22 }}>
            {itens.map((t, i) => {
              const s = mola(f, 6 + i * 4, { damping: 15, stiffness: 200, mass: 0.7 });
              const ok = mola(f, 10 + i * 4, { damping: 10, stiffness: 260, mass: 0.6 });
              return (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 26, opacity: interpolate(s, [0, 0.3], [0, 1], clamp), translate: `${interpolate(s, [0, 1], [-60, 0])}px 0` }}>
                  <div style={{ width: 66, height: 66, flexShrink: 0, borderRadius: 20, background: "linear-gradient(180deg, #A9EE9A, #5FD068 55%, #349A3D)", display: "flex", alignItems: "center", justifyContent: "center", scale: String(ok), boxShadow: "0 0 24px rgba(95,208,104,0.4)" }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.preto} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  </div>
                  <span style={{ fontFamily: FONT_TEXTO, fontWeight: 800, fontSize: 52, color: C.branco }}>{t}</span>
                </div>
              );
            })}
          </div>
        </BordaViva>
      </div>
    </SaidaCena>
  );
};

// ---------------------------------------------------------------------------
// 6. PROVA — experiência real dele (dado do próprio post)

export const CenaProva: React.FC = () => {
  const f = useFrame30();
  const v = interpolate(f, [8, 44], [0, 15000], { ...clamp, easing: Easing.out(Easing.cubic) });
  const card = mola(f, 0, { damping: 14, stiffness: 120 });
  const txt = Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (
    <SaidaCena>
      <div style={{ position: "absolute", top: 300, left: 0, right: 0, textAlign: "center" }}>
        <Etiqueta tamanho={34} cor={C.ouro}>
          Experiência real na Europa
        </Etiqueta>
      </div>
      <div style={{ position: "absolute", top: 420, left: 0, right: 0, display: "flex", justifyContent: "center", scale: String(interpolate(card, [0, 1], [0.75, 1])), opacity: interpolate(card, [0, 0.3], [0, 1], clamp) }}>
        <BordaViva cor={C.verde} raio={44} brilho={1.6}>
          <div style={{ padding: "50px 70px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Etiqueta tamanho={30} cor={C.verde}>
              Faturamento
            </Etiqueta>
            <div style={{ fontFamily: FONT_TITULO, fontSize: 230, lineHeight: 1.05, backgroundImage: "linear-gradient(180deg, #D9FFC7, #7EE26F 45%, #3FAE4A)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: "drop-shadow(0 0 30px rgba(95,208,104,0.45))" }}>
              +{txt}€
            </div>
            <Etiqueta tamanho={34} cor={C.branco}>
              nos últimos 90 dias
            </Etiqueta>
          </div>
        </BordaViva>
      </div>
      <div style={{ position: "absolute", top: 1010, left: 0, right: 0, textAlign: "center", opacity: interpolate(f, [30, 40], [0, 1], clamp) }}>
        <span style={{ fontFamily: FONT_TEXTO, fontWeight: 800, fontSize: 44, color: "rgba(255,255,255,0.85)" }}>com a minha operação de dropshipping</span>
      </div>
    </SaidaCena>
  );
};

// ---------------------------------------------------------------------------
// 7. PREÇO

export const CenaPreco: React.FC = () => {
  const f = useFrame30();
  const preco = mola(f, 16, { damping: 9, stiffness: 140, mass: 0.9 });
  const raios = interpolate(f, [16, 60], [0, 1], clamp);
  return (
    <SaidaCena>
      <div style={{ position: "absolute", top: 520, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <LinhaMascara texto="TUDO ISSO POR APENAS" tamanho={88} />
        <div style={{ position: "relative", marginTop: 40, width: 900, height: 520, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* raios girando atrás do preço */}
          <div
            style={{
              position: "absolute",
              width: 1100,
              height: 1100,
              borderRadius: 999,
              background: "repeating-conic-gradient(from 0deg, rgba(233,196,106,0.16) 0deg 6deg, transparent 6deg 18deg)",
              maskImage: "radial-gradient(circle, black 20%, transparent 60%)",
              WebkitMaskImage: "radial-gradient(circle, black 20%, transparent 60%)",
              rotate: `${f * 0.6}deg`,
              opacity: raios,
            }}
          />
          <div style={{ position: "relative", scale: String(interpolate(preco, [0, 1], [3, 1])), opacity: interpolate(preco, [0, 0.15], [0, 1], clamp), filter: `blur(${interpolate(preco, [0, 0.5], [16, 0], clamp)}px)` }}>
            <span style={{ fontFamily: FONT_TITULO, fontSize: 470, lineHeight: 1, ...GOLD_TEXT, filter: "drop-shadow(0 0 50px rgba(233,196,106,0.6)) drop-shadow(0 30px 40px rgba(0,0,0,0.7))" }}>70€</span>
          </div>
        </div>
        <div style={{ marginTop: 10, opacity: interpolate(f, [34, 44], [0, 1], clamp) }}>
          <Etiqueta tamanho={38} cor={C.branco}>
            Marca + loja Shopify prontas
          </Etiqueta>
        </div>
      </div>
    </SaidaCena>
  );
};

// ---------------------------------------------------------------------------
// 8. CTA — comentar "EU QUERO" ou mandar "MINHA MARCA" no privado

export const CenaCTA: React.FC = () => {
  const f = useFrame30();
  const t1 = "EU QUERO";
  const t2 = "MINHA MARCA";
  const n1 = Math.floor(interpolate(f, [16, 32], [0, t1.length], clamp));
  const n2 = Math.floor(interpolate(f, [64, 84], [0, t2.length], clamp));
  const env1 = mola(f, 36, { damping: 12, stiffness: 220 });
  const env2 = mola(f, 88, { damping: 12, stiffness: 220 });
  const coracao = mola(f, 44, { damping: 8, stiffness: 260, mass: 0.6 });
  const caixa = (rotulo: string, texto: string, n: number, env: number, delay: number, icone: React.ReactNode) => {
    const s = mola(f, delay);
    return (
      <div style={{ width: 920, opacity: interpolate(s, [0, 0.3], [0, 1], clamp), translate: `0 ${interpolate(s, [0, 1], [60, 0])}px` }}>
        <Etiqueta tamanho={32} cor={C.ouro}>
          {rotulo}
        </Etiqueta>
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 20, padding: "22px 22px 22px 36px", borderRadius: 999, background: "rgba(20,20,24,0.95)", border: "2px solid rgba(255,255,255,0.16)", boxShadow: "0 24px 50px rgba(0,0,0,0.55)" }}>
          <span style={{ flex: 1, fontFamily: FONT_TEXTO, fontWeight: 900, fontSize: 60, color: C.branco }}>
            {texto.slice(0, n)}
            <span style={{ color: C.ouro, opacity: Math.floor(f / 8) % 2 === 0 && n < texto.length ? 1 : 0 }}>|</span>
          </span>
          <div style={{ width: 96, height: 96, borderRadius: 99, background: env > 0.5 ? C.verde : "linear-gradient(180deg, #FBE7A1, #C8962E)", display: "flex", alignItems: "center", justifyContent: "center", scale: String(1 + Math.sin(env * Math.PI) * 0.25) }}>
            {icone}
          </div>
        </div>
      </div>
    );
  };
  return (
    <SaidaCena>
      <div style={{ position: "absolute", top: 300, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <LinhaMascara texto="QUER A SUA MARCA?" tamanho={118} cor="ouro" />
      </div>
      <div style={{ position: "absolute", top: 620, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 70 }}>
        <div style={{ position: "relative" }}>
          {caixa(
            "Comenta",
            t1,
            n1,
            env1,
            6,
            <svg width="48" height="48" viewBox="0 0 24 24" fill={C.preto}>
              <path d="M3 11.5L21 3l-7.5 18-2.5-7.5L3 11.5z" />
            </svg>,
          )}
          <svg
            width="120"
            height="120"
            viewBox="0 0 24 24"
            style={{ position: "absolute", right: -30, top: -40, scale: String(coracao), opacity: interpolate(f, [44, 48, 70, 80], [0, 1, 1, 0], clamp), filter: "drop-shadow(0 0 20px rgba(255,60,90,0.6))" }}
          >
            <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 5 6.4 5c2 0 3.3 1.1 4.1 2.3h3C14.3 6.1 15.6 5 17.6 5 21 5 23.1 8.4 21.6 11.8 19.5 16.4 12 21 12 21z" fill="#FF3C5A" />
          </svg>
        </div>
        {caixa(
          "ou envia no privado",
          t2,
          n2,
          env2,
          54,
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={C.preto} strokeWidth="2.4" strokeLinejoin="round">
            <path d="M4 5h16v11H8l-4 4V5z" />
          </svg>,
        )}
      </div>
      <div style={{ position: "absolute", top: 1330, left: 0, right: 0, textAlign: "center", opacity: interpolate(f, [100, 112], [0, 1], clamp), translate: `0 ${interpolate(f, [100, 112], [30, 0], clamp)}px` }}>
        <div style={{ fontFamily: FONT_TITULO, fontSize: 78, lineHeight: 1.05, color: C.branco, textShadow: "0 10px 30px rgba(0,0,0,0.6)" }}>VAMOS TIRAR O PROJETO</div>
        <div style={{ fontFamily: FONT_TITULO, fontSize: 130, lineHeight: 1.05, ...GOLD_TEXT, filter: "drop-shadow(0 0 24px rgba(233,196,106,0.5))" }}>DO PAPEL</div>
      </div>
    </SaidaCena>
  );
};
