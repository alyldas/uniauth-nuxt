import type { ResolvedUniAuthModuleOptions } from "../../../src/runtime/types";
import { defaultUniAuthOptions } from "../../../src/runtime/utils/options";

// noinspection JSUnusedGlobalSymbols -- Vitest resolves #build/uniauth-options to this fixture.
export const uniauthOptions: ResolvedUniAuthModuleOptions =
  defaultUniAuthOptions;
