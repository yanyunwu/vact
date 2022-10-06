import nodePolyfills from 'rollup-plugin-node-polyfills'; /** 打包nodejs内置工具模块 */
import typescript from "rollup-plugin-typescript"; /** 支持ts打包 */
import dts from "rollup-plugin-dts"; /** 生成.d.ts声明文件 */
import sourceMaps from "rollup-plugin-sourcemaps"; /** 报错追源 */
import { terser } from 'rollup-plugin-terser'; /** 压缩打包 */
import path from "path";

const config = {
  input: 'index.ts',
  output: [
    {
      file: 'dist/boundle.js',
      format: "cjs",
      sourcemap: true
    }
  ],

  plugins: [
    nodePolyfills(),
    typescript({
      exclude: "node_modules/**",
      typescript: require("typescript")
    }),
    sourceMaps()
  ]

};


const dts_config = {
  // 生成 .d.ts 类型声明文件
  input: 'index.ts',
  output: {
    file: 'index.d.ts',
    format: 'es',
  },
  plugins: [
    dts()
  ]
}

export default [
  config, dts_config
]
