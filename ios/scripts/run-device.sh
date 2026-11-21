#!/usr/bin/env bash
# 一键：下载 V8 → 生成 ios/ → 打包 JS → 编译 → 签名 → 装进真机启动，终端显示 console 输出
#
#   bash ios/scripts/run-device.sh                     跑验收套件（Debug）
#   bash ios/scripts/run-device.sh --release           用 Release 配置跑验收
#   bash ios/scripts/run-device.sh examples/hello      跑示例
#
# 和 run-sim.sh 是同一套步骤，只有最后三步不同：编给真机（不签名）、用本机的开发
# 证书和描述文件签、用 devicectl 装上去启动。手机要用线连着、保持解锁。
#
# 包名默认 com.test.test：验收 App 装到真机上不带任何标识。要换就设
# NACRE_DEVICE_BUNDLE_ID。只改 App 的包名，里面的 framework 不动。
#
#   NACRE_DEVICE=<UDID 或设备名>           指定哪台（默认第一台连着的 iPhone）
#   NACRE_PROFILE=<.mobileprovision>       指定描述文件（默认自己挑，见 device.mjs）
#   NACRE_SIGN_IDENTITY=<SHA-1 或名字>     指定签名身份
set -euo pipefail
cd "$(dirname "$0")/../.."

PROJECT="acceptance"
RUNTIME="source"
CONFIG="Debug"
for arg in "$@"; do
  case "$arg" in
    --runtime=*) RUNTIME="${arg#*=}" ;;
    --configuration=*) CONFIG="${arg#*=}" ;;
    --release) CONFIG="Release" ;;
    --*) echo "不认识的选项 $arg"; exit 1 ;;
    *) PROJECT="$arg" ;;
  esac
done
case "$CONFIG" in
  Debug|Release) ;;
  *) echo "--configuration 只能是 Debug 或 Release，现在是 $CONFIG"; exit 1 ;;
esac
[ -f "$PROJECT/nacre.config.json" ] || { echo "$PROJECT 不是一个 Nacre 项目（没有 nacre.config.json）"; exit 1; }
PROJECT=$(cd "$PROJECT" && pwd)

APP_NAME=$(node -p "require('$PROJECT/nacre.config.json').name")
BUNDLE_ID="${NACRE_DEVICE_BUNDLE_ID:-com.test.test}"

command -v xcodegen >/dev/null || { echo "请先安装 XcodeGen：brew install xcodegen"; exit 1; }

# 先挑设备：没连手机就别白编几分钟
DEVICE=$(node ios/scripts/device.mjs pick)

bash ios/scripts/fetch-v8.sh
if [ "$RUNTIME" = "source" ]; then
  (cd ios && xcodegen generate --quiet)
elif [ ! -d packages/ios/Nacre.xcframework ]; then
  bash ios/scripts/build-xcframework.sh
fi

node packages/cli/bin/nacre.js generate "$PROJECT" --runtime="$RUNTIME"
bash ios/scripts/build-js.sh "$PROJECT"
(cd "$PROJECT/ios" && xcodegen generate --quiet)

# 编的时候不签名，编完自己签：工程里不用写团队和描述文件，换一台 Mac 也照样跑
BUILD="$PROJECT/ios/build"
mkdir -p "$BUILD"
xcodebuild -project "$PROJECT/ios/$APP_NAME.xcodeproj" -scheme App -configuration "$CONFIG" \
  -sdk iphoneos -destination generic/platform=iOS CODE_SIGNING_ALLOWED=NO \
  -derivedDataPath "$BUILD" -quiet build 2>&1 | tee "$BUILD/xcodebuild-device.log"

AVAILABILITY=$(grep -E '\[-Wunguarded-availability(-new)?\]' "$BUILD/xcodebuild-device.log" \
                 | sed 's#^.*/ios/##' | sort -u || true)
if [ -n "$AVAILABILITY" ]; then
  echo
  echo "⚠️  下面这些接口在 iOS 26 上没有，用之前要加 @available 保护（否则在 26 上会崩）："
  echo "$AVAILABILITY"
  echo
fi

# 签名改的是包里的文件，所以拷一份出来签，编译产物保持没签名的样子，下次增量编译不受影响
SIGNED="$BUILD/device/$APP_NAME.app"
rm -rf "$SIGNED"
mkdir -p "$BUILD/device"
cp -R "$BUILD/Build/Products/$CONFIG-iphoneos/$APP_NAME.app" "$SIGNED"
node ios/scripts/device.mjs sign "$SIGNED" "$DEVICE" "$BUNDLE_ID"

xcrun devicectl device install app --quiet --device "$DEVICE" "$SIGNED"
# --console：App 的 stdout 显示在当前终端（Ctrl+C 退出）。手机锁着屏会启动失败
xcrun devicectl device process launch --console --terminate-existing --device "$DEVICE" "$BUNDLE_ID"
