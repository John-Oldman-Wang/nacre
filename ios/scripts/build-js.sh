#!/usr/bin/env bash
# 把一个 Nacre 项目的 JS 打包成它的 ios/JS/main.js。
#
#   bash ios/scripts/build-js.sh [项目目录]     默认 acceptance，可以是绝对路径
#
# 打包的几项是硬约束，写在 packages/ios/nacre-ios.json 里：
#   --format=iife        运行时编译的是 classic script，ESM 的 import 直接抛
#   --platform=neutral   不能注入 process / Buffer 的 polyfill
#   不压缩 + utf8        报错行号只能靠人去产物里对
set -euo pipefail
cd "$(dirname "$0")/../.."
PROJECT="${1:-acceptance}"

command -v npm >/dev/null || { echo "需要 npm（打包和类型检查都靠它）"; exit 1; }
[ -d "$PROJECT/node_modules" ] || (cd "$PROJECT" && npm install --silent)

# NACRE_ESBUILD_ARGS：额外交给打包器的参数，按空白分开。验收的 runner 用它把
# 「只跑哪几步」写进产物（--define），见 acceptance/scripts/verify.mjs
# shellcheck disable=SC2086
(cd "$PROJECT" && npm run --silent build -- ${NACRE_ESBUILD_ARGS:-})
OUT=$(node -p "require('$PWD/packages/ios/nacre-ios.json').js.outfile")
echo "打包完成：$PROJECT/$OUT（$(wc -c < "$PROJECT/$OUT" | tr -d ' ') 字节）"
