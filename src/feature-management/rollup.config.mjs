// rollup.config.js
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

export default [
  {
    external: [
      "crypto"
    ],
    input: "src/index.ts",
    output: [
      {
        dir: "dist/commonjs/",
        format: "cjs",
        sourcemap: true,
        preserveModules: true,
      },
      {
        dir: "dist/esm/",
        format: "esm",
        sourcemap: true,
        preserveModules: true,
      },
      {
        file: "dist/umd/index.js",
        format: "umd",
        name: "FeatureManagement",
        sourcemap: true
      }
    ],
    plugins: [
      typescript({
        tsconfig: "./tsconfig.json",
      })
    ],
  },
  {
    input: "src/index.ts",
    output: [{ file: "dist/types/index.d.ts", format: "esm" }],
    plugins: [dts()],
  },
];
