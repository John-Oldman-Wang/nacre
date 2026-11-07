#!/usr/bin/env bash
# 下载预编译的 iOS 版 V8（来自 NativeScript/v8-buildscripts 的 GitHub Release），
# 校验 SHA256 后解压到 Vendor/v8/：
#   Vendor/v8/include/                 头文件
#   Vendor/v8/lib/iphoneos/            真机 arm64 静态库
#   Vendor/v8/lib/iphonesimulator/     模拟器 arm64 静态库
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

DEVICE="v8-$VERSION-ios-arm64-device.tar.gz"
SIM="v8-$VERSION-ios-arm64-simulator.tar.gz"

fetch "$DEVICE"
fetch "$SIM"

# 预期哈希写死在仓库里。只用 release 自带的 SHA256SUMS 是不够的：
# 校验锚点和被校验的文件同源，只能发现传输损坏，发现不了 release 资产被替换
# （GitHub 允许在不换 tag 的情况下替换 assets）。升级 V8 时连同这两行一起更新。
SHA_DEVICE="1ab69f47e80fbe57832895e0a92bb7cb3ae76c1301b2d6845190a3bf72619045"
SHA_SIM="fdad2af000733cbf0e5d4fc07458bb0c75d3579a181b556e91548f4be84a5986"

echo "校验 SHA256"
( cd "$CACHE" && printf '%s  %s\n%s  %s\n' \
    "$SHA_DEVICE" "$DEVICE" "$SHA_SIM" "$SIM" | shasum -a 256 -c - )

STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT
tar -xzf "$CACHE/$DEVICE" -C "$STAGE"
tar -xzf "$CACHE/$SIM" -C "$STAGE"

rm -rf "$DEST"
mkdir -p "$DEST/lib/iphoneos" "$DEST/lib/iphonesimulator"
cp -R "$STAGE/ios-arm64-device/include" "$DEST/include"
cp "$STAGE/ios-arm64-device/lib/"*.a "$DEST/lib/iphoneos/"
cp "$STAGE/ios-arm64-simulator/lib/"*.a "$DEST/lib/iphonesimulator/"
echo "$RELEASE" > "$STAMP"

echo "V8 $VERSION 已安装到 Vendor/v8"
