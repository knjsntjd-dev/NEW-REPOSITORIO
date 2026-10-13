// DIA 40 — dados de edição. Tempos em segundos do vídeo ORIGINAL (public/dia40/base.mp4).
// Textos revisados a partir da transcrição (Whisper); números conferidos entre si.

export const FALAS: [number, number, string][] = [
  [0.34, 0.94, "Dia"],
  [1.08, 1.8, "40"],
  [2.07, 2.86, "do zero"],
  [2.97, 4.07, "aos 10K"],
  [4.34, 5.67, "vendendo produtos"],
  [5.78, 7.05, "através da internet."],
  [7.19, 8.2, "Até o momento,"],
  [8.34, 9.38, "a nossa loja"],
  [9.53, 10.5, "já faturou"],
  [10.9, 13.42, "138 euros,"],
  [13.59, 14.63, "totalizando"],
  [15.03, 15.62, "5"],
  [15.86, 16.74, "pedidos."],
  [17.05, 19.37, "Estamos com uma taxa de conversão"],
  [19.48, 20.55, "na Shopify"],
  [20.7, 23.69, "de 2,71%."],
  [23.8, 24.46, "Tivemos"],
  [24.73, 29.5, "184 pessoas que entraram dentro do nosso site hoje."],
  [29.66, 30.95, "E o interessante"],
  [31.06, 33.03, "é que, graças a Deus,"],
  [33.24, 34.31, "o nosso ROI,"],
  [34.81, 37.0, "retorno sobre o investimento,"],
  [37.11, 42.82, "hoje está em torno de 2,92."],
  [42.94, 44.04, "Lembra que ontem"],
  [44.18, 46.25, "foi um dia mau, e o nosso ROI"],
  [46.36, 47.85, "ainda estava um pouco baixo."],
  [47.96, 48.55, "Hoje"],
  [48.7, 49.99, "já recuperamos"],
  [50.17, 51.34, "as nossas vendas, as nossas"],
  [51.48, 54.95, "e aumentamos para 2,92."],
  [55.64, 57.35, "Desde o primeiro dia"],
  [57.5, 58.63, "da nossa série"],
  [58.78, 60.62, "nós já faturamos"],
  [60.98, 63.91, "8.813"],
  [64.82, 66.41, "euros,"],
  [66.58, 67.59, "totalizando"],
  [67.77, 70.73, "289 pedidos"],
  [70.97, 72.36, "e totalizando"],
  [72.54, 76.39, "3.682 visitas"],
  [76.66, 77.19, "dentro"],
  [77.37, 78.44, "do nosso site."],
  [78.58, 80.2, "E se você quiser acompanhar"],
  [80.31, 81.19, "essa série"],
  [81.34, 82.79, "do zero aos 10K"],
  [82.97, 85.1, "vendendo produtos através da internet,"],
  [85.24, 87.21, "é só você me seguir aqui no meu perfil,"],
  [87.38, 88.33, "porque eu não vou te"],
  [88.5, 90.57, "cobrar absolutamente nada por isso."],
  [90.71, 92.94, "E se eu pudesse te dar uma dica"],
  [93.08, 94.22, "no dia de hoje,"],
  [94.36, 95.43, "a dica é"],
  [95.99, 96.55, "tenta"],
  [96.76, 98.57, "o mais rápido possível"],
  [98.81, 99.82, "trabalhar"],
  [100.09, 100.97, "pra você."],
  [101.11, 102.38, "Porque enquanto você"],
  [102.97, 104.42, "um funcionário,"],
  [104.57, 106.73, "você vai ganhar um salário mínimo"],
  [106.84, 107.91, "no final do mês."],
  [108.15, 110.44, "Enquanto você trabalhar pra você,"],
  [110.65, 114.56, "você vai ter liberdade de tempo, liberdade financeira,"],
  [114.65, 115.56, "e vai trabalhar"],
  [115.8, 116.46, "do seu"],
  [116.63, 117.13, "jeito."],
  [117.34, 120.84, "Se eu pudesse te falar alguma coisa, era isso que eu falava pra você."],
  [120.98, 121.48, "Tá bom?"],
  [121.62, 125.63, "Então fiquem todos com Deus, obrigado a todos que estão acompanhando."],
  [125.78, 129.38, "Um vídeo desses viralizou, mais de 10 mil visualizações."],
  [129.59, 130.76, "Muito obrigado"],
  [130.87, 133.74, "de coração, a todos que estão mandando mensagem,"],
  [133.91, 135.88, "pedindo dicas, estratégias."],
  [136.06, 137.7, "E é o que eu sempre falo pra"],
  [137.91, 138.92, "vocês:"],
  [139.19, 139.72, "Deus"],
  [140.06, 143.43, "acima de todas as coisas. Isso aqui só está acontecendo"],
  [143.8, 144.3, "por causa"],
  [144.57, 145.19, "de Deus."],
  [145.37, 145.86, "Tá bem?"],
  [145.98, 148.07, "Muito obrigado, um beijo no coração."],
  [148.47, 148.78, "Até"],
  [149.05, 149.54, "amanhã."],
];

/** Gancho: o total faturado desde o primeiro dia (valor real e o mais forte do episódio). */
export const GANCHO: [number, number] = [58.78, 66.41];

export const PAUSA_MAX = 0.32;
export const RESPIRO = 0.09;

/** Planos fechados (ênfase). */
export const ENFASE: [number, number][] = [
  [47.96, 55.0], // recuperamos o ROI
  [90.71, 95.43], // a dica
  [110.65, 114.56], // liberdade
  [137.91, 145.9], // Deus acima de tudo
];

/** Dados reais — falados no vídeo (ou do DIA 39, no caso do ROI de ontem). */
export const DADOS = {
  dia: 40,
  faturadoHoje: 138,
  pedidosHoje: 5,
  conversao: 2.71,
  visitantesHoje: 184,
  roiHoje: 2.92,
  roiOntem: 1.34, // dito no DIA 39
  faturamentoTotal: 8813,
  pedidosTotal: 289,
  visitasTotal: 3682,
  meta: 10000,
};
