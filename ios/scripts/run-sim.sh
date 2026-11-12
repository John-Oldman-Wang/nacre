#!/usr/bin/env bash
# 一键：下载 V8 → 生成工程 → 编译模拟器包 → 安装启动，并在终端显示 console 输出
set -euo pipefail
cd "$(dirname "$0")/.."

BUNDLE_ID="com.orbitlabs.nacre.dev"
# 默认使用第一个可用的 iPhone 模拟器；也可以用 NACRE_SIM=<模拟器 UDID> 指定
DEVICE="${NACRE_SIM:-$(xcrun simctl list devices available | awk '/^-- iOS (2[6-9]|[3-9][0-9])/{f=1;next} /^--/{f=0} f && /iPhone/ {match($0,/\([0-9A-F-]+\)/); print substr($0,RSTART+1,RLENGTH-2); exit}')}"
[ -n "$DEVICE" ] || { echo "没有找到可用的 iPhone 模拟器，请在 Xcode → Settings → Components 安装 iOS 26 模拟器"; exit 1; }

command -v xcodegen >/dev/null || { echo "请先安装 XcodeGen：brew install xcodegen"; exit 1; }

bash ./scripts/fetch-v8.sh
# app/ 的 JS 源码 → ios/JS/main.js（产物，不提交）
bash ./scripts/build-js.sh
xcodegen generate --quiet

mkdir -p build
xcodebuild -project Nacre.xcodeproj -scheme Nacre -configuration Debug \
  -sdk iphonesimulator -destination "platform=iOS Simulator,id=$DEVICE" \
  -derivedDataPath build -quiet build 2>&1 | tee build/xcodebuild.log

# 用了比最低支持版本（iOS 26）更新的系统接口、却没加 @available 保护的地方。
# 编译器对这个只给警告，而一次全量编译有两万多条别的警告（V8 头文件的
# 可空性标注），这几条淹在里面，从来没人看见过。所以单独捞出来放在最后。
#
# 增量编译只重编改过的文件，这里只看得到这次重编到的那些。要看全量：
# rm -rf build 之后再跑一次。
AVAILABILITY=$(grep -E '\[-Wunguarded-availability(-new)?\]' build/xcodebuild.log \
                 | sed 's#^.*/ios/##' | sort -u || true)
if [ -n "$AVAILABILITY" ]; then
  echo
  echo "⚠️  下面这些接口在 iOS 26 上没有，用之前要加 @available 保护（否则在 26 上会崩）："
  echo "$AVAILABILITY"
  echo
fi

APP="build/Build/Products/Debug-iphonesimulator/Nacre.app"
xcrun simctl boot "$DEVICE" 2>/dev/null || true

# 打开模拟器窗口。Xcode 26 及以前是 Simulator.app，Xcode 27 起改成 DeviceHub.app
# （com.apple.dt.Devices）。两个都找不到也不影响：simctl 不需要 GUI。
DEVELOPER_DIR="$(xcode-select -p)"
XCODE_APP="${DEVELOPER_DIR%/Contents/Developer}"
for sim_app in "$DEVELOPER_DIR/Applications/Simulator.app" \
               "$XCODE_APP/Contents/Applications/DeviceHub.app"; do
  if [ -d "$sim_app" ]; then
    open -a "$sim_app" || true
    break
  fi
done
xcrun simctl install "$DEVICE" "$APP"
xcrun simctl terminate "$DEVICE" "$BUNDLE_ID" 2>/dev/null || true
# --console-pty：把 App 的 stdout 直接显示在当前终端（按 Ctrl+C 退出）
xcrun simctl launch --console-pty "$DEVICE" "$BUNDLE_ID"
