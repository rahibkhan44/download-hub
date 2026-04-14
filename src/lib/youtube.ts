import { Innertube, Platform } from "youtubei.js";
import type { Types } from "youtubei.js";

let innertube: Awaited<ReturnType<typeof Innertube.create>> | null = null;

// Provide a JavaScript evaluator so youtubei.js can decipher signature-protected URLs
Platform.shim.eval = async (
  data: Types.BuildScriptResult,
  env: Record<string, Types.VMPrimative>
) => {
  const properties: string[] = [];

  if (env.n) {
    properties.push(`n: exportedVars.nFunction("${env.n}")`);
  }

  if (env.sig) {
    properties.push(`sig: exportedVars.sigFunction("${env.sig}")`);
  }

  const code = `${data.output}\nreturn { ${properties.join(", ")} }`;

  return new Function(code)();
};

export async function getInnertube() {
  if (!innertube) {
    innertube = await Innertube.create({
      lang: "en",
      location: "US",
    });
  }
  return innertube;
}
