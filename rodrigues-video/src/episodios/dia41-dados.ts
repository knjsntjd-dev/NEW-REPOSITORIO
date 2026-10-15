// DIA 41 — dados de edição. Tempos em segundos do vídeo ORIGINAL (public/dia41/base.mp4).
// Números conferidos com uma segunda decodificação (trechos longos) do Whisper.

export const FALAS: [number, number, string][] = [
  [0.12, 0.68, "Dia"],
  [0.82, 1.77, "41"],
  [1.91, 3.08, "da nossa série"],
  [3.29, 4.17, "do zero"],
  [4.28, 5.38, "aos 10K"],
  [5.66, 7.14, "vendendo produtos"],
  [7.29, 8.65, "através da internet."],
  [8.82, 9.86, "E até o momento,"],
  [10.04, 11.11, "a nossa loja"],
  [11.29, 12.23, "já faturou"],
  [12.44, 15.88, "498"],
  [16.12, 16.78, "euros,"],
  [16.92, 18.7, "uma taxa de conversão"],
  [18.94, 21.83, "de 6,7%."],
  [22.07, 23.56, "Esse dia de hoje,"],
  [23.7, 26.02, "juntamente com o dia 35,"],
  [26.23, 28.26, "foram os melhores dias"],
  [28.47, 29.64, "da nossa loja."],
  [29.88, 31.24, "E nos últimos dias,"],
  [31.48, 32.74, "desde o começo"],
  [32.92, 34.31, "do nosso projeto,"],
  [34.42, 35.69, "a nossa loja"],
  [35.9, 37.03, "já faturou"],
  [37.24, 41.93, "9.533"],
  [42.39, 43.02, "euros,"],
  [43.29, 44.3, "finalizando"],
  [44.44, 46.89, "315 pedidos,"],
  [47.1, 50.63, "4.188 visualizações"],
  [50.78, 52.68, "e uma taxa de conversão"],
  [52.82, 56.33, "de 6,92%."],
  [56.54, 58.22, "Se eu pudesse te dar uma dica"],
  [58.36, 59.56, "no dia de hoje,"],
  [59.77, 61.16, "eu falaria pra você:"],
  [61.53, 62.18, "use"],
  [62.52, 63.66, "criativos"],
  [63.86, 65.64, "de UGC."],
  [65.94, 68.3, "Desde quando eu comecei a usar criativos"],
  [68.47, 69.45, "de UGC,"],
  [69.59, 72.9, "que são aquelas pessoas utilizando o seu produto,"],
  [73.05, 75.02, "você pode fazer essa mineração"],
  [75.22, 78.09, "nas redes vizinhas e trazer pro seu projeto,"],
  [78.23, 79.34, "o meu projeto"],
  [79.54, 80.33, "subiu"],
  [80.5, 83.21, "para 97%"],
  [83.35, 84.39, "de conversão."],
  [84.54, 86.28, "Criativos UGC:"],
  [86.42, 88.49, "é a dica de hoje. E se você"],
  [88.6, 89.9, "quiser acompanhar"],
  [90.07, 92.87, "a nossa série do zero aos 10K,"],
  [93.05, 95.14, "vendendo produtos através da internet,"],
  [95.29, 97.32, "é só você me seguir aqui no meu perfil,"],
  [97.43, 98.41, "que eu não vou te"],
  [98.52, 100.58, "cobrar absolutamente nada por isso."],
  [100.7, 101.48, "Obrigado"],
  [101.59, 103.66, "a todos que estão mandando mensagem,"],
  [103.8, 106.63, "a todos que estão dedicando foco, força."],
  [106.74, 108.23, "Já estamos quase"],
  [108.41, 109.26, "chegando"],
  [109.37, 110.34, "na nossa meta."],
  [110.55, 111.75, "Fiquem todos com Deus."],
  [111.99, 112.68, "Valeu!"],
  [112.86, 113.54, "E até"],
  [113.88, 114.41, "amanhã."],
];

/** Gancho: 9.533 € — a 467 € da meta de 10K. */
export const GANCHO: [number, number] = [37.1, 43.1];

export const PAUSA_MAX = 0.32;
export const RESPIRO = 0.09;

export const ENFASE: [number, number][] = [
  [22.07, 29.64], // melhores dias da loja
  [56.54, 61.16], // a dica
  [106.74, 110.34], // quase na meta
];

/** Dados reais falados no vídeo. */
export const DADOS = {
  dia: 41,
  faturadoHoje: "498",
  conversaoHoje: "6,7",
  faturamentoTotal: "9.533",
  pedidosTotal: "315",
  visualizacoes: "4.188",
  conversaoTotal: "6,92",
  totalNum: 9533,
  meta: 10000,
};
