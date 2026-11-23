#!/usr/bin/env bash
# 在连着的 Android 真机上跑验收：打包 acceptance-android、编壳、装、打开，读 logcat 判定。
#
#   bash android/scripts/run-device.sh            # Debug
#   bash android/scripts/run-device.sh --release  # Release
#
# 通过不通过看退出码。判定和 iOS 的验收一样（acceptance/scripts/lib/report.mjs）：
# 等到结束标记 `[acceptance] done {…}`，没有 ✗、结束标记里的 failed 是 0，就是 0。
# 期限内没等到结束标记、App 提前退出、有 ✗，都是 1，原因打在最后。
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO="$(cd "$ROOT/.." && pwd)"
VARIANT="Debug"
[ "${1:-}" = "--release" ] && VARIANT="Release"

PACKAGE="com.test.test"
ACTIVITY="nacre.shell.MainActivity"
TAG="Nacre"
TIMEOUT=180

: "${ANDROID_HOME:?要先设 ANDROID_HOME（Android SDK 的位置）}"
ADB="$ANDROID_HOME/platform-tools/adb"

if [ "$("$ADB" devices | awk 'NR>1 && $2=="device"' | wc -l | tr -d ' ')" = 0 ]; then
  echo "没有连着的 Android 设备（adb devices 里没有状态为 device 的）" >&2
  exit 1
fi

bash "$ROOT/scripts/fetch-v8.sh"
bash "$ROOT/scripts/fetch-ada.sh"

echo "== 打包验收套件"
( cd "$REPO/acceptance-android" && { [ -d node_modules ] || npm ci --silent; } && npm run --silent build )
BUNDLE="$REPO/acceptance-android/build/main.js"

echo "== 编译（$VARIANT）"
( cd "$ROOT" && ./gradlew --quiet ":shell:assemble$VARIANT" "-PnacreMainJs=$BUNDLE" )
APK="$(ls "$ROOT"/shell/build/outputs/apk/"$(echo "$VARIANT" | tr '[:upper:]' '[:lower:]')"/*.apk | head -1)"

echo "== 安装 $(basename "$APK")"
"$ADB" install -r "$APK" >/dev/null

echo "== 打开"
"$ADB" shell am force-stop "$PACKAGE"
"$ADB" logcat -c
"$ADB" shell am start -W -n "$PACKAGE/$ACTIVITY" >/dev/null

LOG_FILE="$(mktemp)"
trap 'rm -f "$LOG_FILE"' EXIT

# 只要这个标签的内容，去掉「I/Nacre( pid): 」这样的前缀，剩下的就是 console 打的原文
read_log() {
  "$ADB" logcat -d -v raw -s "$TAG:V" | grep -v '^---------' > "$LOG_FILE" || true
}

STATUS="timeout"
for _ in $(seq 1 "$TIMEOUT"); do
  read_log
  if grep -q '^\[acceptance\] done ' "$LOG_FILE"; then STATUS="done"; break; fi
  if [ -z "$("$ADB" shell pidof "$PACKAGE" | tr -d '\r')" ]; then
    sleep 1; read_log
    grep -q '^\[acceptance\] done ' "$LOG_FILE" && STATUS="done" || STATUS="exited"
    break
  fi
  sleep 1
done

node --input-type=module - "$LOG_FILE" "$STATUS" "$VARIANT" "$REPO" <<'NODE'
import { readFileSync } from 'node:fs';
const [logFile, status, variant, repo] = process.argv.slice(2);
const { parseLog } = await import(repo + '/acceptance/scripts/lib/report.mjs');
const text = readFileSync(logFile, 'utf8');
const parsed = parseLog(text);
const reasons = [];
if (status === 'timeout') reasons.push('期限内没等到结束标记');
if (status === 'exited') reasons.push('App 提前退出了（没有结束标记）');
if (parsed.failed > 0) reasons.push(`有 ${parsed.failed} 条断言失败`);
if (parsed.done && Number(parsed.done.failed) > 0 && parsed.failed === 0) {
  reasons.push(`结束标记里记着 ${parsed.done.failed} 条失败`);
}
console.log(`== 结果（${variant}）：通过 ${parsed.passed} 条，失败 ${parsed.failed} 条` +
  (parsed.done ? `，结束标记 ${JSON.stringify(parsed.done)}` : ''));
for (const f of parsed.failures) console.log('  ✗ ' + f);
for (const u of parsed.unverified) console.log('  ! ' + u);
if (reasons.length > 0) {
  // 没等到结束标记时，把最后几行打出来，看停在哪
  if (!parsed.done) console.log(text.trim().split('\n').slice(-20).join('\n'));
  console.error(`\n验收没通过（${variant}）：` + reasons.join('；'));
  process.exit(1);
}
console.log(`\n验收通过（${variant}）`);
NODE
