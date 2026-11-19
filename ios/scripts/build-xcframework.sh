#!/usr/bin/env bash
# 构建交付物：Nacre.xcframework，以及每个拆出去的能力各一个
# （NacreKeychain.xcframework…）。每个都是真机和模拟器两个切片合成的。
#
# 核心的产物放 packages/ios/（它是 @nacrejs/ios 的一部分），每个能力的产物放
# 它自己的包里（packages/keychain/…）。都不提交。
set -euo pipefail
cd "$(dirname "$0")/../.."

# 中间产物放一个**每次运行都不一样**的目录，跑完删掉。以前固定用
# ios/build/xcframework，两个打包同时跑时后起的那个一上来就把目录清掉，
# 先起的那个打到一半中间产物没了（2026-11-16 两个对话同时打包撞过一次）
mkdir -p ios/build
BUILD="$(mktemp -d ios/build/xcframework.XXXXXX)"
# 退出时删掉中间目录。**没走到最后的都算失败**：macOS 自带的 bash 3.2 因为
# set -u 这类错误中途退出时，EXIT trap 里的 $? 是 0，trap 跑完整个脚本就以 0
# 退出了。CI 上撞过：打包中途死掉，步骤却显示成功。所以用一个标记判断走没走完，
# 不信 $?
FINISHED=0
trap 'rm -rf "$BUILD"; [ "$FINISHED" = 1 ] || exit 1' EXIT

# 要打的 framework，每项是「target=产物路径」。核心放 @nacrejs/ios；每个能力放
# 它**自己的包**里（packages/<包>/，认的是带 capability 的 nacre-ios.json）。
# target 名和产物名都从能力包的清单里读——和 CLI 读的是同一份，两边不会漂。
BUILDS="Nacre=packages/ios/Nacre.xcframework $(node -e "
const fs = require('fs'), path = require('path');
for (const dir of fs.readdirSync('packages').sort()) {
  const file = path.join('packages', dir, 'nacre-ios.json');
  if (!fs.existsSync(file)) continue;
  const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (manifest.capability) process.stdout.write(manifest.target + '=packages/' + dir + '/' + manifest.xcframework + ' ');
}")"

command -v xcodegen >/dev/null || { echo "请先安装 XcodeGen：brew install xcodegen"; exit 1; }

# 先说要打哪几个。CI 上出现过只打出了核心、能力包一个都没打、步骤却算成功的情况，
# 原因从步骤的成败看不出来，所以开头列出来、结尾逐个核对
COUNT=0
for build in $BUILDS; do COUNT=$((COUNT + 1)); done
echo "要打 $COUNT 个：$(for build in $BUILDS; do printf '%s ' "${build%%=*}"; done)"
if [ "${GITHUB_ACTIONS:-}" = "true" ]; then
  echo "::notice::要打 $COUNT 个 framework：$(for build in $BUILDS; do printf '%s ' "${build%%=*}"; done)"
fi

bash ios/scripts/fetch-v8.sh
(cd ios && xcodegen generate --quiet)


for build in $BUILDS; do
  scheme="${build%%=*}"
  OUT="${build#*=}"
  # 两个切片。SKIP_INSTALL=NO 才会把 framework 放进 archive；
  # BUILD_LIBRARY_FOR_DISTRIBUTION 让它能被别的工程安全地引用
  for pair in "generic/platform=iOS:device" "generic/platform=iOS Simulator:simulator"; do
    dest="${pair%:*}"
    name="${pair##*:}"
    echo "构建 $scheme 的 $name 切片…"
    # **看 xcodebuild 自己的退出码。** 以前的写法是把输出接给 grep、末尾 || true，
    # 那样 archive 失败和「日志里没有匹配的行」被一起忽略了，后面只看产物目录
    # 在不在——目录在不等于 archive 成功。完整的日志留在文件里，失败时把
    # 报错的那几行和日志的位置打出来
    LOG="$BUILD/$scheme-$name.log"
    status=0
    xcodebuild archive \
      -project ios/Nacre.xcodeproj -scheme "$scheme" -configuration Release \
      -destination "$dest" -archivePath "$BUILD/$scheme-$name.xcarchive" \
      SKIP_INSTALL=NO BUILD_LIBRARY_FOR_DISTRIBUTION=YES \
      CODE_SIGNING_ALLOWED=NO -quiet > "$LOG" 2>&1 || status=$?
    if [ "$status" -ne 0 ]; then
      # 变量后面紧跟中文标点时要写成 ${...}：bash 3.2 在 UTF-8 下会把全角字符的字节
      # 当成变量名的一部分。status 后面直接跟全角括号，会被读成一个叫 status\xef 的
      # 变量，set -u 下直接退出。check.yml 里有一条检查拦这种写法
      echo "构建 ${scheme} 的 ${name} 切片失败（xcodebuild 退出码 ${status}）："
      grep -E " error: |BUILD FAILED|ARCHIVE FAILED" "$LOG" | head -20 || true
      # 在 GitHub Actions 里另外打成批注：日志要登录才能读，批注是公开的
      if [ "${GITHUB_ACTIONS:-}" = "true" ]; then
        echo "::error::构建 ${scheme} 的 ${name} 切片失败（xcodebuild 退出码 ${status}）"
        grep -E " error: " "$LOG" | sed 's#^.*/ios/##' | sort -u | head -8 | while IFS= read -r line; do
          echo "::error::$line"
        done
      fi
      # 失败时把日志留下来给人看（中间目录在退出时会被删）
      KEEP="ios/build/xcframework-failed-$scheme-$name.log"
      cp "$LOG" "$KEEP"
      echo "完整日志：$KEEP"
      exit 1
    fi
    test -d "$BUILD/$scheme-$name.xcarchive/Products/Library/Frameworks/$scheme.framework" \
      || { echo "没有产出 $scheme 的 $name 切片"; exit 1; }
  done

  # 先在中间目录里合成，成了再换掉原来的产物：失败的时候旧的那一份还在，
  # 不会留下一个删了一半的包
  xcodebuild -create-xcframework \
    -framework "$BUILD/$scheme-device.xcarchive/Products/Library/Frameworks/$scheme.framework" \
    -framework "$BUILD/$scheme-simulator.xcarchive/Products/Library/Frameworks/$scheme.framework" \
    -output "$BUILD/$scheme.xcframework" >/dev/null
  # 两个切片都在、里面都有二进制，才算数
  for slice in ios-arm64 ios-arm64-simulator; do
    test -f "$BUILD/$scheme.xcframework/$slice/$scheme.framework/$scheme" \
      || { echo "$scheme.xcframework 里没有 $slice 这个切片的二进制"; exit 1; }
  done
  rm -rf "$OUT"
  mv "$BUILD/$scheme.xcframework" "$OUT"

  echo "构建完成：${OUT}（$(du -sh "$OUT" | cut -f1)）"
done

# 逐个核对都打出来了：少一个就失败，不让它算成功
MISSING=""
for build in $BUILDS; do
  OUT="${build#*=}"
  [ -f "$OUT/ios-arm64/${build%%=*}.framework/${build%%=*}" ] || MISSING="$MISSING ${build%%=*}"
done
if [ -n "$MISSING" ]; then
  echo "没打出来：$MISSING"
  [ "${GITHUB_ACTIONS:-}" = "true" ] && echo "::error::要打 $COUNT 个，没打出来的：$MISSING"
  exit 1
fi
echo "全部打完：${COUNT} 个"
FINISHED=1
