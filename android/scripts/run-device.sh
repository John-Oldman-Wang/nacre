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

# 手机只有一台：几个会话同时跑验收会互相抢。用一把锁排队（mkdir 是原子的，macOS 没有 flock）。
# 锁里记着拿锁的进程号，那个进程没了就当成残留的锁，清掉
LOCK_DIR="${TMPDIR:-/tmp}/nacre-android-device.lock"
while ! mkdir "$LOCK_DIR" 2>/dev/null; do
  owner="$(cat "$LOCK_DIR/pid" 2>/dev/null || true)"
  if [ -n "$owner" ] && ! kill -0 "$owner" 2>/dev/null; then
    rm -rf "$LOCK_DIR"
    continue
  fi
  echo "== 手机正被别的验收占着（进程 ${owner:-?}），等它跑完…"
  sleep 10
done
echo $$ > "$LOCK_DIR/pid"
release_lock() { rm -rf "$LOCK_DIR"; }
trap release_lock EXIT

bash "$ROOT/scripts/fetch-v8.sh"
bash "$ROOT/scripts/fetch-ada.sh"

echo "== 打包验收套件"
( cd "$REPO/acceptance-android" && { [ -d node_modules ] || npm ci --silent; } && npm run --silent build )
BUNDLE="$REPO/acceptance-android/build/main.js"

echo "== 编译（$VARIANT）"
( cd "$ROOT" && ./gradlew --quiet ":shell:assemble$VARIANT" "-PnacreMainJs=$BUNDLE" \
    "-PnacreAssets=$REPO/acceptance-android/assets" )
APK="$(ls "$ROOT"/shell/build/outputs/apk/"$(echo "$VARIANT" | tr '[:upper:]' '[:lower:]')"/*.apk | head -1)"

echo "== 安装 $(basename "$APK")"
"$ADB" install -r "$APK" >/dev/null

# 网络那几步要一个本机的测试服务（acceptance/scripts/test-server.mjs，iOS 的验收也用它）。
# 起在 Mac 的 127.0.0.1:47831，再用 adb reverse 把手机上的同一个地址转过来
PORT=47831
SERVER_PID=""
if ! curl -fsS "http://127.0.0.1:$PORT/ping" >/dev/null 2>&1; then
  echo "== 起本地测试服务"
  node "$REPO/acceptance/scripts/test-server.mjs" >/dev/null 2>&1 &
  SERVER_PID=$!
  for _ in $(seq 1 20); do
    curl -fsS "http://127.0.0.1:$PORT/ping" >/dev/null 2>&1 && break
    sleep 0.2
  done
fi
"$ADB" reverse "tcp:$PORT" "tcp:$PORT" >/dev/null
cleanup_server() {
  "$ADB" reverse --remove "tcp:$PORT" >/dev/null 2>&1 || true
  [ -n "$SERVER_PID" ] && kill "$SERVER_PID" 2>/dev/null || true
}

echo "== 打开"
"$ADB" shell am force-stop "$PACKAGE"
"$ADB" logcat -c
"$ADB" shell am start -W -n "$PACKAGE/$ACTIVITY" >/dev/null

LOG_FILE="$(mktemp)"
trap 'rm -f "$LOG_FILE"; cleanup_server; release_lock' EXIT

# 只要这个标签的内容，去掉「I/Nacre( pid): 」这样的前缀，剩下的就是 console 打的原文
read_log() {
  "$ADB" logcat -d -v raw -s "$TAG:V" | grep -v '^---------' > "$LOG_FILE" || true
}

# JS 打「[acceptance] tap 按钮上的字」请求点一下：用 uiautomator 找到写着这几个字的
# 那个视图，点它的正中。每个请求只点一次
TAPPED=0
tap_requests() {
  local requests count text
  requests="$(grep '^\[acceptance\] tap ' "$LOG_FILE" | sed 's/^\[acceptance\] tap //' || true)"
  count="$(printf '%s' "$requests" | grep -c . || true)"
  while [ "$TAPPED" -lt "$count" ]; do
    TAPPED=$((TAPPED + 1))
    text="$(printf '%s\n' "$requests" | sed -n "${TAPPED}p")"
    # 先删旧文件再 dump：App 忙的时候 uiautomator 可能等不到界面空闲、写不出新的，
    # 不删就会读到上一次的界面。找不到就隔一秒再 dump，最多 5 次
    local point="" attempt
    for attempt in 1 2 3 4 5; do
      "$ADB" shell rm -f /sdcard/nacre-ui.xml
      "$ADB" shell uiautomator dump /sdcard/nacre-ui.xml >/dev/null 2>&1 || true
      point="$("$ADB" exec-out cat /sdcard/nacre-ui.xml 2>/dev/null | python3 -c '
import sys, re, xml.etree.ElementTree as ET
want = sys.argv[1]
try:
    root = ET.fromstring(sys.stdin.read())
except ET.ParseError:
    sys.exit(0)
for node in root.iter("node"):
    if node.get("text") == want:
        x1, y1, x2, y2 = map(int, re.findall(r"\d+", node.get("bounds")))
        print((x1 + x2) // 2, (y1 + y2) // 2)
        break
' "$text")"
      [ -n "$point" ] && break
      sleep 1
    done
    if [ -z "$point" ]; then
      echo "  （界面上没找到写着「$text」的视图，没点）"
      continue
    fi
    echo "  点「$text」：$point"
    # shellcheck disable=SC2086
    "$ADB" shell input tap $point
  done
}

# JS 打「[acceptance] swipe <dx> <dy> 视图上的字」请求用手指划一下：找到写着这几个字的
# 视图，从它看得见的那一块的正中，划到偏移 (dx, dy) 像素的地方，用 300 毫秒。每个请求只划一次。
# 找视图的办法和点击一样（uiautomator dump，找不到隔一秒再找，最多 5 次）
SWIPED=0
swipe_requests() {
  local requests count line dx dy text
  requests="$(grep '^\[acceptance\] swipe ' "$LOG_FILE" | sed 's/^\[acceptance\] swipe //' || true)"
  count="$(printf '%s' "$requests" | grep -c . || true)"
  while [ "$SWIPED" -lt "$count" ]; do
    SWIPED=$((SWIPED + 1))
    line="$(printf '%s\n' "$requests" | sed -n "${SWIPED}p")"
    dx="$(printf '%s' "$line" | awk '{print $1}')"
    dy="$(printf '%s' "$line" | awk '{print $2}')"
    text="$(printf '%s' "$line" | cut -d' ' -f3-)"
    local point="" attempt
    for attempt in 1 2 3 4 5; do
      "$ADB" shell rm -f /sdcard/nacre-ui.xml
      "$ADB" shell uiautomator dump /sdcard/nacre-ui.xml >/dev/null 2>&1 || true
      point="$("$ADB" exec-out cat /sdcard/nacre-ui.xml 2>/dev/null | python3 -c '
import sys, re, xml.etree.ElementTree as ET
want = sys.argv[1]
try:
    root = ET.fromstring(sys.stdin.read())
except ET.ParseError:
    sys.exit(0)
for node in root.iter("node"):
    if node.get("text") == want:
        x1, y1, x2, y2 = map(int, re.findall(r"\d+", node.get("bounds")))
        print((x1 + x2) // 2, (y1 + y2) // 2)
        break
' "$text")"
      [ -n "$point" ] && break
      sleep 1
    done
    if [ -z "$point" ]; then
      echo "  （界面上没找到写着「$text」的视图，没划）"
      continue
    fi
    local x y
    x="${point% *}"
    y="${point#* }"
    echo "  划「$text」：$x $y → $((x + dx)) $((y + dy))"
    "$ADB" shell input swipe "$x" "$y" "$((x + dx))" "$((y + dy))" 300
  done
}

STATUS="timeout"
for _ in $(seq 1 "$TIMEOUT"); do
  read_log
  tap_requests
  swipe_requests
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
