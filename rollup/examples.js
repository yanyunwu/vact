import livereload from 'rollup-plugin-livereload'; /** 热加载 */
import serve from 'rollup-plugin-serve'; /** server */
import nodePolyfills from 'rollup-plugin-node-polyfills'; /** 打包nodejs内置工具模块 */
import typescript from "rollup-plugin-typescript"; /** 支持ts打包 */
import dts from "rollup-plugin-dts"; /** 生成.d.ts声明文件 */
import sourceMaps from "rollup-plugin-sourcemaps"; /** 报错追源 */
import { terser } from 'rollup-plugin-terser'; /** 压缩打包 */
import path from "path";

const prefixPath = path.resolve(__dirname, 'packages/vactapp')
console.log(prefixPath)
const config = {
  input: path.join(prefixPath, 'index.ts'), // 入口文件
  output: [
    {
      file: "examples/boundle/boundle.js",    // 必须
      format: 'umd',
      name: 'Vact'
    }
  ],

  plugins: [
    nodePolyfills(),
    livereload(),
    serve({
      open: true,
      port: 3000,
      contentBase: './examples'
    }),
    typescript({
      exclude: "node_modules/**",
      typescript: require("typescript")
    }),
    sourceMaps()
  ]

};


export default config
