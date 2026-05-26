import { defineBuildConfig } from "unbuild";

// noinspection JSUnusedGlobalSymbols -- unbuild consumes the default export as build config.
export default defineBuildConfig({
  declaration: true,
  externals: [
    "@nuxt/kit",
    "#app",
    "#build/uniauth-options",
    "h3",
    "ofetch",
    "vue",
  ],
});
