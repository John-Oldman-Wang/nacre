#!/usr/bin/env bash
# 一键：下载 V8 → 生成 ios/ → 打包 JS → 编译 → 装进模拟器启动，终端显示 console 输出
#
#   bash ios/scripts/run-sim.sh                                     跑验收套件
#   bash ios/scripts/run-sim.sh examples/hello --runtime=framework  跑示例
#
# 项目的 ios/ 由 packages/ios 的 CLI 生成，不在版本库里。两种运行时：
#   source      引运行时的 Xcode 工程（我们自己开发用，改一行 C++ 就生效）
#   framework   引预编译的 Nacre.xcframework（用户拿到的就是这个）
set -euo pipefail
cd "$(dirname "$0")/../.."

PROJECT="${1:-acceptance}"
RUNTIME="source"
for arg in "${@:2}"; do
  case "$arg" in
    --runtime=*) RUNTIME="${arg#*=}" ;;
    *) echo "不认识的选项 $arg"; exit 1 ;;
  esac
done
[ -f "$PROJECT/nacre.config.json" ] || { echo "$PROJECT 不是一个 Nacre 项目（没有 nacre.config.json）"; exit 1; }

# 包名和 App 名从项目配置里读，和 CLI 生成工程时用的是同一份
BUNDLE_ID=$(node -p "require('./$PROJECT/nacre.config.json').bundleId")
APP_NAME=$(node -p "require('./$PROJECT/nacre.config.json').name")

# 默认使用第一个可用的 iPhone 模拟器；也可以用 NACRE_SIM=<模拟器 UDID> 指定
DEVICE="${NACRE_SIM:-$(xcrun simctl list devices available | awk '/^-- iOS (2[6-9]|[3-9][0-9])/{f=1;next} /^--/{f=0} f && /iPhone/ {match($0,/\([0-9A-F-]+\)/); print substr($0,RSTART+1,RLENGTH-2); exit}')}"
[ -n "$DEVICE" ] || { echo "没有找到可用的 iPhone 模拟器，请在 Xcode → Settings → Components 安装 iOS 26 模拟器"; exit 1; }

command -v xcodegen >/dev/null || { echo "请先安装 XcodeGen：brew install xcodegen"; exit 1; }

bash ios/scripts/fetch-v8.sh
if [ "$RUNTIME" = "source" ]; then
  (cd ios && xcodegen generate --quiet)
elif [ ! -d packages/ios/Nacre.xcframework ]; then
  bash ios/scripts/build-xcframework.sh
fi

node packages/ios/bin/nacre-ios.js generate "$PROJECT" --runtime="$RUNTIME"
bash ios/scripts/build-js.sh "$PROJECT"
(cd "$PROJECT/ios" && xcodegen generate --quiet)

BUILD="$PROJECT/ios/build"
mkdir -p "$BUILD"
xcodebuild -project "$PROJECT/ios/$APP_NAME.xcodeproj" -scheme App -configuration Debug \
  -sdk iphonesimulator -destination "platform=iOS Simulator,id=$DEVICE" \
  -derivedDataPath "$BUILD" -quiet build 2>&1 | tee "$BUILD/xcodebuild.log"

# 用了比最低支持版本（iOS 26）更新的系统接口、却没加 @available 保护的地方。
# 编译器对这个只给警告，而一次全量编译有两万多条别的警告（V8 头文件的
# 可空性标注），这几条淹在里面，从来没人看见过。所以单独捞出来放在最后。
#
# 增量编译只重编改过的文件，这里只看得到这次重编到的那些。要看全量：
# rm -rf <项目>/ios/build 之后再跑一次。
AVAILABILITY=$(grep -E '\[-Wunguarded-availability(-new)?\]' "$BUILD/xcodebuild.log" \
                 | sed 's#^.*/ios/##' | sort -u || true)
if [ -n "$AVAILABILITY" ]; then
  echo
  echo "⚠️  下面这些接口在 iOS 26 上没有，用之前要加 @available 保护（否则在 26 上会崩）："
  echo "$AVAILABILITY"
  echo
fi

APP="$BUILD/Build/Products/Debug-iphonesimulator/$APP_NAME.app"
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
