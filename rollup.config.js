// rollup.config.js

// 打包配置引入
import vactapp from "./rollup/vactapp";
import examples from "./rollup/examples"

const map = new Map([
  ['vactapp', vactapp],
  ['examples', examples]
])

export default map.get(process.env.USEING_CONFIG)
