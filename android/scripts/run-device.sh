#!/usr/bin/env bash
# 在连着的 Android 真机上编、装、打开开发用的壳，读 logcat 判定结果。
#
#   bash android/scripts/run-device.sh            # Debug
#   bash android/scripts/run-device.sh --release  # Release
#
# 通过不通过看退出码：壳里的 main.js 跑完会打出下面 EXPECT 里的每一行，
# 期限内都在 logcat 里出现就是 0，缺哪一行就把缺的列出来、退出码 1。
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VARIANT="Debug"
[ "${1:-}" = "--release" ] && VARIANT="Release"

PACKAGE="com.test.test"
ACTIVITY="nacre.shell.MainActivity"
TAG="Nacre"
TIMEOUT=20

# main.js 打出来的，logcat 里「级别/标签: 内容」的形状
EXPECT=(
  "I/$TAG: JS 跑起来了 object 2"
  "I/$TAG: 严格模式 true"
  "W/$TAG: 警告 1"
  "E/$TAG: 出错 [1,2]"
  "I/$TAG: 结束"
)

: "${ANDROID_HOME:?要先设 ANDROID_HOME（Android SDK 的位置）}"
ADB="$ANDROID_HOME/platform-tools/adb"

if [ "$("$ADB" devices | awk 'NR>1 && $2=="device"' | wc -l | tr -d ' ')" = 0 ]; then
  echo "没有连着的 Android 设备（adb devices 里没有状态为 device 的）" >&2
  exit 1
fi

bash "$ROOT/scripts/fetch-v8.sh"

echo "== 编译（$VARIANT）"
( cd "$ROOT" && ./gradlew --quiet ":shell:assemble$VARIANT" )
APK="$(ls "$ROOT"/shell/build/outputs/apk/"$(echo "$VARIANT" | tr '[:upper:]' '[:lower:]')"/*.apk | head -1)"

echo "== 安装 $(basename "$APK")"
"$ADB" install -r "$APK" >/dev/null

echo "== 打开"
"$ADB" shell am force-stop "$PACKAGE"
"$ADB" logcat -c
"$ADB" shell am start -W -n "$PACKAGE/$ACTIVITY" >/dev/null

# 只看这次启动、这个标签的日志。-v brief 的形状是「I/Nacre  ( pid): 内容」，
# 去掉中间的 pid 再比
LOG=""
missing=("${EXPECT[@]}")
for _ in $(seq 1 "$TIMEOUT"); do
  LOG="$("$ADB" logcat -d -v brief -s "$TAG:V" | sed -E 's/^([A-Z])\/([^ (]+) *\( *[0-9]+\): /\1\/\2: /')"
  missing=()
  for line in "${EXPECT[@]}"; do
    grep -qxF "$line" <<<"$LOG" || missing+=("$line")
  done
  [ "${#missing[@]}" = 0 ] && break
  sleep 1
done

echo "== logcat（$TAG）"
grep -v '^-----' <<<"$LOG" || true

if [ "${#missing[@]}" != 0 ]; then
  echo
  echo "验收没通过（$VARIANT）：${TIMEOUT} 秒内没等到这几行" >&2
  printf '  %s\n' "${missing[@]}" >&2
  exit 1
fi
echo
echo "验收通过（$VARIANT）"
