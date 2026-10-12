// Renderiza quadros soltos para revisão: node scripts/stills.mjs Dia39 75 237 605 ...
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";

const [id, ...frames] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browserExecutable = process.env.REMOTION_CHROME ?? null;
const composition = await selectComposition({ serveUrl, id, browserExecutable });
for (const f of frames) {
  const output = `out/stills/${id}-${String(f).padStart(5, "0")}.jpg`;
  await renderStill({ composition, serveUrl, output, frame: Number(f), imageFormat: "jpeg", jpegQuality: 80, scale: 0.5, browserExecutable });
  console.log(output);
}
