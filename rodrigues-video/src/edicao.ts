// Monta a linha do tempo editada a partir dos trechos de fala do vídeo original.

export type Fala = [number, number, string];

export type Clip = {
  /** Início/fim no vídeo original (s). */
  src0: number;
  src1: number;
  /** Início na linha do tempo editada (s). */
  out0: number;
  gancho: boolean;
};

export type Plano = { src0: number; zoom: number; enfase: boolean };

export type Palavra = { texto: string; t: number; destaque: boolean };
export type Pagina = { t0: number; t1: number; palavras: Palavra[] };

const DESTAQUES =
  /^(vendas?|venda|lucro|facebook|ads|roi|euros?|cêntimos|faturou|loja|10k|real|100%|encomendas|investimento|retorno|retornou|série|piores?|fraco|fracos|caixa|produto|estrutura|unidades|pessoas|amanhã)$/i;

const limpa = (w: string) => w.replace(/[.,!?]/g, "");

export const montarEdicao = (opts: {
  falas: Fala[];
  gancho: [number, number];
  pausaMax: number;
  respiro: number;
  enfase: [number, number][];
}) => {
  const { falas, gancho, pausaMax, respiro, enfase } = opts;

  // 1. Clipes: junta trechos separados por pausas curtas; pausas longas viram corte.
  const blocos: [number, number][] = [];
  for (const [a, b] of falas) {
    const ult = blocos[blocos.length - 1];
    if (ult && a - ult[1] <= pausaMax) ult[1] = b;
    else blocos.push([a, b]);
  }
  const clips: Clip[] = [];
  let out = 0;
  clips.push({ src0: gancho[0], src1: gancho[1], out0: 0, gancho: true });
  out += gancho[1] - gancho[0];
  for (const [a, b] of blocos) {
    const src0 = Math.max(0, a - respiro);
    const src1 = b + respiro;
    clips.push({ src0, src1, out0: out, gancho: false });
    out += src1 - src0;
  }
  const duracao = out;

  /** Converte tempo do original para a edição (linha principal, sem o gancho). */
  const srcToOut = (t: number, noGancho = false) => {
    const lista = clips.filter((c) => c.gancho === noGancho);
    for (const c of lista) {
      if (t < c.src0) return c.out0; // caiu num corte: vai para o próximo clipe
      if (t <= c.src1) return c.out0 + (t - c.src0);
    }
    const u = lista[lista.length - 1];
    return u.out0 + (u.src1 - u.src0);
  };

  // 2. Planos de câmera: troca de enquadramento a cada frase (efeito de 2ª câmera),
  //    plano fechado nos trechos de ênfase.
  const planos: Plano[] = [];
  let alterna = 0;
  let inicioPlano = -Infinity;
  falas.forEach(([a], i) => {
    const em = enfase.some(([x, y]) => a >= x - 0.05 && a < y);
    const anterior = planos[planos.length - 1];
    const fimFrase = i > 0 && /[.?!,]$/.test(falas[i - 1][2]);
    if (em) {
      if (!anterior?.enfase) planos.push({ src0: a, zoom: 1.2, enfase: true });
      return;
    }
    if (!anterior || anterior.enfase || (fimFrase && a - inicioPlano >= 2.4)) {
      alterna++;
      planos.push({ src0: a, zoom: alterna % 2 ? 1.0 : 1.1, enfase: false });
      inicioPlano = a;
    }
  });

  // 3. Legendas: palavras distribuídas dentro de cada trecho pelo tamanho;
  //    páginas de até 3 palavras.
  const paginasDe = (falasAlvo: Fala[], mapa: (t: number) => number) => {
    const paginas: Pagina[] = [];
    for (const [a, b, texto] of falasAlvo) {
      const ws = texto.split(" ");
      const pesos = ws.map((w) => limpa(w).length + 2);
      const total = pesos.reduce((x, y) => x + y, 0);
      let acc = 0;
      const palavras: Palavra[] = ws.map((w, i) => {
        const t = a + ((b - a) * acc) / total;
        acc += pesos[i];
        return {
          texto: w,
          t: mapa(t),
          destaque: DESTAQUES.test(limpa(w)) || /\d/.test(w),
        };
      });
      for (let i = 0; i < palavras.length; ) {
        let n = 1;
        let chars = palavras[i].texto.length;
        while (
          i + n < palavras.length &&
          n < 3 &&
          chars + palavras[i + n].texto.length <= 17 &&
          !/[.?!,]$/.test(palavras[i + n - 1].texto)
        ) {
          chars += palavras[i + n].texto.length + 1;
          n++;
        }
        const grupo = palavras.slice(i, i + n);
        const prox = palavras[i + n];
        paginas.push({
          t0: grupo[0].t,
          t1: prox ? prox.t : mapa(b) + 0.12,
          palavras: grupo,
        });
        i += n;
      }
    }
    return paginas;
  };

  const legendas = [
    ...paginasDe(
      falas.filter(([a, b]) => a >= gancho[0] && b <= gancho[1]),
      (t) => srcToOut(t, true),
    ),
    ...paginasDe(falas, (t) => srcToOut(t)),
  ];

  return { clips, planos, legendas, duracao, srcToOut };
};
