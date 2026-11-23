#!/usr/bin/env bash
# 下载 ada（网页标准的 URL 解析器，Node.js 用的就是它）的单文件版，校验 SHA256 后
# 放到 Vendor/ada/：ada.h、ada.cpp、LICENSE-MIT。
#
# URL 解析的那层胶水在 core/url/，Android 的 CMakeLists.txt 把它和这里的 ada.cpp
# 一起编。iOS 不用它（iOS 还是 NSURLComponents），iOS 的工程也不引这两处。
# ada 是 Apache-2.0 和 MIT 双许可，我们按 MIT 用。
set -euo pipefail

VERSION="v4.1.1"
BASE_URL="https://github.com/ada-url/ada/releases/download/$VERSION"
LICENSE_URL="https://raw.githubusercontent.com/ada-url/ada/$VERSION/LICENSE-MIT"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/Vendor/ada"
STAMP="$DEST/.version"

if [ -f "$STAMP" ] && [ "$(cat "$STAMP")" = "$VERSION" ] && [ "${1:-}" != "--force" ]; then
  echo "ada $VERSION 已安装（重新安装请加 --force）"
  exit 0
fi

STAGE="$(mktemp -d)"
FINISHED=0
trap 'rm -rf "$STAGE"; [ "$FINISHED" = 1 ] || exit 1' EXIT

echo "下载 ada $VERSION"
curl -fsSL --retry 3 -o "$STAGE/ada.h" "$BASE_URL/ada.h"
curl -fsSL --retry 3 -o "$STAGE/ada.cpp" "$BASE_URL/ada.cpp"
curl -fsSL --retry 3 -o "$STAGE/LICENSE-MIT" "$LICENSE_URL"

# 预期哈希写死在仓库里，理由见 ios/scripts/fetch-v8.sh。升级时连同这三行一起更新
echo "校验 SHA256"
( cd "$STAGE" && shasum -a 256 -c - <<SUMS
99fa32a2e31a61e17598775d9166d7e5b7e648b31e5f4b3b27de59dfb2951bf3  ada.h
e693ea65504493eda3a8bbdd0453819256dcace6a50a0f46a8ab1db330f2e98a  ada.cpp
af0d7d2cef91fc243cf4ad98570b03d1f26f5e0227cad0f5f4a7376e2feb3160  LICENSE-MIT
SUMS
)

rm -rf "$DEST"
mkdir -p "$DEST"
cp "$STAGE/ada.h" "$STAGE/ada.cpp" "$STAGE/LICENSE-MIT" "$DEST/"
echo "$VERSION" > "$STAMP"
echo "ada $VERSION 已安装到 Vendor/ada"
FINISHED=1
