import typescript from "rollup-plugin-typescript2";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.mjs",
      format: "esm",
      sourcemap: true,
    },
  ],
  external: [],
  plugins: [
    replace({
      "process.env.NODE_ENV": JSON.stringify("production"),
      "process.env.REDIS_URL": JSON.stringify(process.env.REDIS_URL),
      "process.env.REDIS_PASSWORD": JSON.stringify(process.env.REDIS_PASSWORD),
    }),
    nodeResolve(),
    commonjs(),
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          sourceMap: true,
          noEmit: false,
          declaration: true,
          target: 'es2015',
          module: "es2015"
        },
      },
    }),
  ],
};
