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
        compilerOptions: {
          "lib": [
            "DOM",
            "WebWorker",
            "ESNext"
          ],
          "skipDefaultLibCheck": true,
          "module": "ESNext",
          "moduleResolution": "Node",
          "target": "ES2022",
          "strictNullChecks": true,
          "strictFunctionTypes": true,
          "sourceMap": true,
          "inlineSources": true
        }
      })
    ],
  },
  {
    input: "src/index.ts",
    output: [{ file: "types/index.d.ts", format: "esm" }],
    plugins: [dts()],
  }
];
