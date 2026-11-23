#!/usr/bin/env bash
# 下载预编译的 Android 版 V8（来自 NativeScript/v8-buildscripts 的 GitHub Release），
# 校验 SHA256 后解压到 Vendor/v8/：
#   Vendor/v8/include/          头文件
#   Vendor/v8/lib/arm64-v8a/    arm64 静态库 libv8_monolith.a
#
# 和 iOS 用同一次构建（同一个 RELEASE）。这份是用 NDK r29 编的，运行时也必须用
# r29 编：两边静态链接同一份 libc++，大版本不同 ABI 就对不上。
# 它开着指针压缩（库里定义了 v8::internal::MainCage::base_），所以运行时编译时要定义
# V8_COMPRESS_POINTERS 和 V8_31BIT_SMIS_ON_64BIT_ARCH，见 runtime/src/main/cpp/CMakeLists.txt。
set -euo pipefail

RELEASE="v8-14.9.207.39-7"
VERSION="14.9.207.39"
BASE_URL="https://github.com/NativeScript/v8-buildscripts/releases/download/$RELEASE"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/Vendor/v8"
CACHE="$ROOT/Vendor/.v8-cache/$RELEASE"
STAMP="$DEST/.release"

if [ -f "$STAMP" ] && [ "$(cat "$STAMP")" = "$RELEASE" ] && [ "${1:-}" != "--force" ]; then
  echo "V8 $RELEASE 已安装（重新安装请加 --force）"
  exit 0
fi

mkdir -p "$CACHE"
fetch() {
  [ -f "$CACHE/$1" ] && return 0
  echo "下载 $1"
  curl -fSL --retry 3 -o "$CACHE/$1.part" "$BASE_URL/$1"
  mv "$CACHE/$1.part" "$CACHE/$1"
}

ARM64="v8-$VERSION-android-arm64-v8a.tar.gz"
fetch "$ARM64"

# 预期哈希写死在仓库里，理由见 ios/scripts/fetch-v8.sh 的同一段注释。
# 升级 V8 时连同这一行一起更新。
SHA_ARM64="3cb942ab2bea0413073c88e735ee558c6fc120391ba85b6b10193ea130f2d231"

echo "校验 SHA256"
( cd "$CACHE" && printf '%s  %s\n' "$SHA_ARM64" "$ARM64" | shasum -a 256 -c - )

STAGE="$(mktemp -d)"
FINISHED=0
trap 'rm -rf "$STAGE"; [ "$FINISHED" = 1 ] || exit 1' EXIT
tar -xzf "$CACHE/$ARM64" -C "$STAGE"

rm -rf "$DEST"
mkdir -p "$DEST/lib/arm64-v8a"
cp -R "$STAGE/android-arm64-v8a/include" "$DEST/include"
cp "$STAGE/android-arm64-v8a/lib/"*.a "$DEST/lib/arm64-v8a/"
echo "$RELEASE" > "$STAMP"

echo "V8 $VERSION 已安装到 Vendor/v8"
FINISHED=1
