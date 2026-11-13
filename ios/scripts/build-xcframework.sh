#!/usr/bin/env bash
# 构建交付物 Nacre.xcframework：真机和模拟器两个切片，合成一个。
#
# 产物放 packages/ios/Nacre.xcframework——它是 @nacre/ios 的一部分，
# 发布时跟着模板和清单一起走。不提交。
set -euo pipefail
cd "$(dirname "$0")/../.."

OUT="packages/ios/Nacre.xcframework"
BUILD="ios/build/xcframework"

command -v xcodegen >/dev/null || { echo "请先安装 XcodeGen：brew install xcodegen"; exit 1; }

bash ios/scripts/fetch-v8.sh
(cd ios && xcodegen generate --quiet)

rm -rf "$BUILD" "$OUT"
mkdir -p "$BUILD"

# 两个切片。SKIP_INSTALL=NO 才会把 framework 放进 archive；
# BUILD_LIBRARY_FOR_DISTRIBUTION 让它能被别的工程安全地引用
for pair in "generic/platform=iOS:device" "generic/platform=iOS Simulator:simulator"; do
  dest="${pair%:*}"
  name="${pair##*:}"
  echo "构建 $name 切片…"
  xcodebuild archive \
    -project ios/Nacre.xcodeproj -scheme Nacre -configuration Release \
    -destination "$dest" -archivePath "$BUILD/$name.xcarchive" \
    SKIP_INSTALL=NO BUILD_LIBRARY_FOR_DISTRIBUTION=YES \
    CODE_SIGNING_ALLOWED=NO -quiet 2>&1 | grep -E " error: |BUILD FAILED" || true
  test -d "$BUILD/$name.xcarchive/Products/Library/Frameworks/Nacre.framework" \
    || { echo "没有产出 $name 切片"; exit 1; }
done

xcodebuild -create-xcframework \
  -framework "$BUILD/device.xcarchive/Products/Library/Frameworks/Nacre.framework" \
  -framework "$BUILD/simulator.xcarchive/Products/Library/Frameworks/Nacre.framework" \
  -output "$OUT" >/dev/null

echo "构建完成：$OUT"
du -sh "$OUT"
ls "$OUT"
