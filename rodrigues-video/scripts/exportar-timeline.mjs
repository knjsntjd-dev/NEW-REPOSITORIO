// Exporta a linha do tempo editada (cortes + efeitos sonoros) de um episódio como JSON,
// para remontar o ÁUDIO no ffmpeg sem re-renderizar o vídeo.
// uso: node --experimental-strip-types scripts/exportar-timeline.mjs <diaNN> > timeline.json
import { readFileSync } from "node:fs";
import { montarEdicao } from "../src/edicao.ts";

const dia = process.argv[2]; // ex.: dia40
const D = await import(`../src/episodios/${dia}-dados.ts`);
const ed = montarEdicao({
  falas: D.FALAS,
  gancho: D.GANCHO,
  pausaMax: D.PAUSA_MAX,
  respiro: D.RESPIRO,
  enfase: D.ENFASE,
});
const tsx = readFileSync(`src/episodios/${dia[0].toUpperCase()}${dia.slice(1)}.tsx`, "utf8");
const GANCHO = D.GANCHO;
const sfx = [...tsx.matchAll(/<Sfx em=\{([^}]+)\}\s*(gancho\s+)?som="([^"]+)"\s+volume=\{([\d.]+)\}/g)].map((m) => {
  const em = Function("GANCHO", `return (${m[1]});`)(GANCHO);
  const gancho = !!m[2];
  return { out: ed.srcToOut(em, gancho), som: m[3], volume: Number(m[4]) };
});
console.log(JSON.stringify({ clips: ed.clips, sfx, duracao: ed.duracao }, null, 1));
