// DIA 39 — dados de edição. Todos os tempos são em segundos do vídeo ORIGINAL
// (public/dia39/base.mp4); o componente converte para a linha do tempo editada.

/** Trechos de fala (VAD + Whisper), com o texto revisado. */
export const FALAS: [number, number, string][] = [
  [0.18, 0.78, "Dia"],
  [0.95, 1.93, "39"],
  [2.14, 3.27, "da nossa série"],
  [3.45, 4.26, "do zero"],
  [4.41, 5.58, "aos 10K"],
  [5.98, 7.34, "vendendo produtos"],
  [7.54, 8.84, "através da internet."],
  [9.05, 9.9, "Até o momento,"],
  [10.14, 11.08, "a nossa loja"],
  [11.29, 14.02, "faturou 61 euros"],
  [14.2, 15.4, "e 20 cêntimos."],
  [15.77, 18.25, "Desde o começo da nossa série, hoje"],
  [18.39, 20.78, "está sendo um dos piores dias"],
  [20.95, 21.77, "em vendas."],
  // 22.04–22.79: primeiro "Porém," repetido — cortado.
  [23.16, 23.75, "Porém,"],
  [23.9, 25.0, "mesmo sendo"],
  [25.21, 25.86, "o nosso"],
  [26.01, 27.98, "pior dia em vendas,"],
  [28.18, 29.42, "mesmo assim"],
  [29.53, 30.25, "ainda"],
  [30.42, 31.4, "continuamos"],
  [31.58, 32.33, "no lucro."],
  [32.57, 34.38, "Foi gasto até o momento"],
  [34.52, 36.1, "em Facebook Ads"],
  [36.38, 37.8, "47 euros"],
  [37.98, 39.02, "e retornou"],
  [39.29, 40.94, "63 euros."],
  [41.14, 44.17, "Estamos com um retorno sobre o investimento"],
  [44.38, 46.22, "de 1,34."],
  [46.39, 47.5, "Então perceba"],
  [47.74, 48.62, "que mesmo"],
  [49.02, 52.87, "tendo um dia mau, porque isso é totalmente normal,"],
  [53.02, 57.44, "passamos o final de semana vendendo 10, 9 unidades por dia,"],
  [57.62, 59.69, "então acumulamos caixa."],
  [59.83, 61.74, "E mesmo tendo um dia fraco,"],
  [61.94, 62.63, "ainda"],
  [62.84, 64.36, "continuamos com ROI"],
  [64.5, 66.47, "de 1,34."],
  [66.65, 67.08, "Então,"],
  [67.19, 71.2, "quando você acerta um produto e monta a estrutura certa,"],
  [71.29, 73.03, "mesmo tendo dias fracos,"],
  [73.21, 74.86, "você ainda continua"],
  [75.16, 75.69, "tendo"],
  [75.83, 76.42, "lucro."],
  [76.66, 80.64, "Eu só perderia tudo se eu não tivesse feito nenhuma venda."],
  [80.73, 81.9, "E mesmo assim,"],
  [82.23, 85.19, "todas as vendas que eu fiz sexta, sábado e domingo"],
  [85.56, 88.84, "recuperaria o meu dia fraco, que seria hoje."],
  [89.14, 91.98, "Certo? Pra vocês verem como é 100%"],
  [92.18, 92.81, "real."],
  [93.02, 99.29, "Não é todo dia que vende 10 unidades, 50 unidades, 300, 400. Tem dia que você vai vender pouco."],
  [99.61, 100.55, "E mesmo assim,"],
  [100.73, 102.02, "você ainda vai continuar"],
  [102.26, 102.95, "com lucro."],
  [103.26, 105.42, "Certo? E nos últimos dias,"],
  [105.75, 107.11, "nossa loja"],
  [107.22, 108.42, "já faturou"],
  [108.57, 109.77, "8 mil"],
  [109.98, 112.97, "675 euros,"],
  [113.21, 116.55, "284 encomendas,"],
  [116.76, 120.2, "3.478 pessoas"],
  [120.44, 121.45, "acessaram"],
  [121.66, 125.35, "a nossa loja. E se você quiser continuar acompanhando"],
  [125.46, 126.54, "a nossa série,"],
  [126.65, 128.68, "é só você me seguir aqui no meu perfil,"],
  [128.82, 132.52, "que eu não vou te cobrar absolutamente nada por isso."],
  [132.63, 133.8, "Você que chegou,"],
  [133.91, 137.0, "que tem dúvidas, e você que está acompanhando essa série,"],
  [137.18, 138.34, "muito obrigado."],
  [138.52, 139.94, "Fiquem todos com Deus."],
  [140.15, 140.94, "Valeu!"],
  [141.11, 141.8, "E até"],
  [142.01, 142.54, "amanhã."],
];

/** Gancho de abertura: o resultado mais forte do episódio vem primeiro. */
export const GANCHO: [number, number] = [107.12, 113.1];

/** Pausas maiores que isto viram corte seco (jump cut). */
export const PAUSA_MAX = 0.32;
/** Respiro mantido em volta de cada corte. */
export const RESPIRO = 0.09;

/**
 * Trechos com zoom de câmera mais fechado (ênfase). Os demais alternam entre
 * plano aberto e médio a cada corte, para esconder o jump cut.
 */
export const ENFASE: [number, number][] = [
  [18.39, 21.77], // pior dia
  [28.18, 32.33], // ainda no lucro
  [76.66, 80.64], // só perderia tudo se...
  [89.14, 92.81], // 100% real
  [137.18, 142.6], // despedida
];

/** Fonte única de dados reais do episódio (nada inventado). */
export const DADOS = {
  dia: 39,
  faturadoHoje: 61.2,
  gastoAds: 47,
  retornoAds: 63,
  roi: 1.34,
  vendasDiaFimDeSemana: "9 A 10",
  faturamentoTotal: 8675,
  encomendas: 284,
  visitantes: 3478,
  meta: 10000,
};
