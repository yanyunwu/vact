// rollup.config.js
import livereload from 'rollup-plugin-livereload'
import serve from 'rollup-plugin-serve'
/** 打包nodejs内置工具模块 */
import nodePolyfills from 'rollup-plugin-node-polyfills';
/** 支持ts打包 */
import typescript from "rollup-plugin-typescript";
import dts from "rollup-plugin-dts";
/** 报错追源 */
import sourceMaps from "rollup-plugin-sourcemaps";
/** 压缩打包 */
import { terser } from 'rollup-plugin-terser';
const config = {
  input: "index.ts", // 入口文件
  output: [
    {
      file: "lib/boundle.js",    // 必须
      format: "cjs",  // 必须
      sourcemap: true
    },
    {
      file: "test/boundle/boundle.js",    // 必须
      format: 'umd',
      name: 'Vact'
    },
    // {
    //   file: "lib/boundle.umd.js",    // 必须
    //   format: 'umd',
    //   name: 'Vact',
    //   sourcemap: true
    // },
    // {
    //   file: "lib/bundle.esm.js",
    //   format: "es",
    //   sourcemap: true
    // }
  ],

  plugins: [
    nodePolyfills(),
    livereload(),
    serve({
      // open: true,
      port: 3000,
      contentBase: './test'
    }),
    typescript({
      exclude: "node_modules/**",
      typescript: require("typescript")
    }),
    sourceMaps(),
    // terser()

  ]

};

export default [
  config,
  {
    // 生成 .d.ts 类型声明文件
    input: 'index.ts',
    output: {
      file: "index.d.ts",
      format: 'es',
    },
    plugins: [
      dts()
    ]
  }
]