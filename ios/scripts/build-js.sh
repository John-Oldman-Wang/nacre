#!/usr/bin/env bash
# 把 acceptance/ 下的验收 JS 打包成 acceptance/ios/JS/main.js。
#
# 为什么是 esbuild 不是 vite / webpack：
#   - vite 是开发服务器 + 构建工具，dev server、HMR、index.html 这些对我们全没用
#   - webpack 经典输出给每个模块包一层 CommonJS 壳、建一张注册表；esbuild 走
#     scope hoisting，产物几乎就是源码顺序拼起来。运行时**没有 source map**，
#     报错行号指向产物，所以产物越接近源码越好
#
# 两条不满足就跑不起来的约束：
#   --format=iife      运行时编译的是 classic script，ESM 产物里的 import 直接抛
#   --platform=neutral 不能注入 process / global / Buffer 的 polyfill，一个都没有
# 外加不压缩——同样是为了行号还能对。
set -euo pipefail
cd "$(dirname "$0")/../../acceptance"

command -v npm >/dev/null || { echo "需要 npm（打包和类型检查都靠它）"; exit 1; }
# 第一次构建要联网装 esbuild 和 typescript，之后只读 node_modules
[ -d node_modules ] || npm ci

npm run --silent build
echo "打包完成：acceptance/ios/JS/main.js（$(wc -c < ios/JS/main.js | tr -d ' ') 字节）"
