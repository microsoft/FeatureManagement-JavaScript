// rollup.config.js
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

export default [
  {
    external: ["crypto"],
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
        },
        "exclude": [
            "test/**/*"
        ]
      })
    ],
  },
  {
    input: "src/index.ts",
    output: [{ file: "types/index.d.ts", format: "esm" }],
    plugins: [dts()],
  },
];
