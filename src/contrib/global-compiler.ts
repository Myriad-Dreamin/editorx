import type { InitOptions } from "@myriaddreamin/typst.ts/dist/esm/options.init.mjs";
import type { TypstCompiler } from "@myriaddreamin/typst.ts/dist/esm/compiler.mjs";

let globalCompiler: TypstCompiler | undefined = undefined;
let globalCompilerInitReady: Promise<TypstCompiler>;
let isReady = false;

export function getGlobalCompiler(): TypstCompiler | undefined {
  return isReady ? globalCompiler : undefined;
}

export function createGlobalCompiler(
  creator: () => TypstCompiler,
  initOptions: InitOptions
): Promise<TypstCompiler> {
  // todo: determine compiler thread-safety
  // todo: check inconsistent initOptions
  const compiler = globalCompiler || creator();

  if (globalCompilerInitReady !== undefined) {
    return globalCompilerInitReady;
  }

  return (globalCompilerInitReady = (async () => {
    isReady = true;
    await compiler.init(initOptions);
    return (globalCompiler = compiler);
  })());
}

export function withGlobalCompiler(
  creator: () => TypstCompiler,
  initOptions: InitOptions,
  resolve: (compiler: TypstCompiler) => void,
  reject?: (err: any) => void
) {
  const compiler = getGlobalCompiler();
  if (compiler) {
    resolve(compiler);
    return;
  }

  createGlobalCompiler(creator, initOptions).then(resolve).catch(reject);
}
