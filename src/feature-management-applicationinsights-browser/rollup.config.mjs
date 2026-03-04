// rollup.config.js
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

export default [
  {
    external: ["@microsoft/feature-management"],
    input: "src/index.ts",
    output: [
      {
        dir: "dist/esm/",
        format: "esm",
        sourcemap: true,
        preserveModules: true,
      }
    ],
    plugins: [
      typescript({
        tsconfig: "./tsconfig.json",
      })
    ],
  },
  {
    external: ["@microsoft/feature-management"],
    input: "src/index.ts",
    output: [{ file: "dist/types/index.d.ts", format: "esm" }],
    plugins: [dts()],
  }
];
