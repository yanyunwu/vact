import livereload from 'rollup-plugin-livereload'; /** 热加载 */
import serve from 'rollup-plugin-serve'; /** server */
import nodePolyfills from 'rollup-plugin-node-polyfills'; /** 打包nodejs内置工具模块 */
import typescript from "rollup-plugin-typescript"; /** 支持ts打包 */
import dts from "rollup-plugin-dts"; /** 生成.d.ts声明文件 */
import sourceMaps from "rollup-plugin-sourcemaps"; /** 报错追源 */
import { terser } from 'rollup-plugin-terser'; /** 压缩打包 */
import path from "path";

const prefixPath = path.resolve(__dirname, 'packages/vactapp')
const config = {
  input: path.join(prefixPath, 'index.ts'),
  output: [
    {
      file: path.join(prefixPath, 'dist/boundle.js'),
      format: "cjs",
      sourcemap: true
    },
    {
      file: path.join(prefixPath, 'dist/boundle.umd.js'),
      format: 'umd',
      name: 'Vact',
      sourcemap: true
    },
    {
      file: path.join(prefixPath, 'dist/boundle.esm.js'),
      format: "es",
      sourcemap: true
    },
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
  input: path.join(prefixPath, 'index.ts'),
  output: {
    file: path.join(prefixPath, 'index.d.ts'),
    format: 'es',
  },
  plugins: [
    dts()
  ]
}

export default [
  config, dts_config
]
