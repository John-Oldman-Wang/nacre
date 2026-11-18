#!/usr/bin/env bash
# 发布前的演练：照真实用户的走法走一遍。
#
# 把要发布的包各打成压缩包，在仓库外建一个新项目，**只装这些压缩包**，然后
# 类型检查 → 生成工程 → 打包 JS → 生成 Xcode 工程 → 编译。验收一直是直接指向
# 仓库里的目录跑的，「打成 npm 包再装出来还完好吗」只有这里验得到。
#
#   bash scripts/smoke.sh          打包、装、生成、给模拟器编译
#   bash scripts/smoke.sh --run    编完再装到开着的模拟器上启动，看 JS 打出来的日志
#
# 项目里装了两个能力包：钥匙串（不要权限文案）和面容 ID（要一句文案）。先不写
# 那句文案生成一次，确认命令在动任何文件之前停下；再写上，走完全程。
#
# 要先跑过 ios/scripts/build-xcframework.sh（包里要有预编译的 framework）。
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RUN=0
for arg in "$@"; do
  case "$arg" in
    --run) RUN=1 ;;
    *) echo "不认识的选项 $arg"; exit 1 ;;
  esac
done

WORK="$(mktemp -d "${TMPDIR:-/tmp}/nacre-smoke.XXXXXX")"
echo "演练的目录：$WORK"

step() { echo; echo "== $1"; }

step "打压缩包"
(cd "$ROOT" && node scripts/release.mjs pack "$WORK/npm")
VERSION="$(node -p "require('$ROOT/packages/types/package.json').version")"
tarball() { echo "$WORK/npm/nacrejs-$1-$VERSION.tgz"; }

step "在仓库外建项目"
APP="$WORK/app"
mkdir -p "$APP/src"
cd "$APP"
cat > package.json <<'EOF'
{
  "name": "smoke",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "esbuild src/main.js --bundle --format=iife --platform=neutral --charset=utf8 --outfile=ios/JS/main.js",
    "check": "tsc --noEmit"
  }
}
EOF
cat > nacre.config.json <<'EOF'
{ "name": "Smoke", "bundleId": "com.example.smoke" }
EOF
cat > tsconfig.json <<'EOF'
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["ESNext"],
    "module": "Preserve",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "allowJs": true,
    "checkJs": true,
    "types": []
  },
  "include": ["src/**/*.js"]
}
EOF
cat > src/main.js <<'EOF'
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/keychain" />
/// <reference types="@nacrejs/local-authentication" />

application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  console.log('smoke: started, LAContext is ' + typeof LAContext);
  application.keychain.set('smoke', 'value-1')
    .then(() => application.keychain.get('smoke'))
    .then((value) => console.log('smoke: keychain read back ' + value))
    .then(() => application.keychain.remove('smoke'));
});
EOF

step "只装压缩包"
npm install -D --no-audit --no-fund \
  "$(tarball ios)" "$(tarball cli)" "$(tarball types)" \
  "$(tarball keychain)" "$(tarball local-authentication)" \
  esbuild@0.28.2 typescript@5.9.3 > "$WORK/npm-install.log" 2>&1 \
  || { cat "$WORK/npm-install.log"; exit 1; }
for name in ios cli types keychain local-authentication; do
  if [ -L "node_modules/@nacrejs/$name" ]; then
    echo "node_modules/@nacrejs/$name 是一个链接，不是装出来的包"; exit 1
  fi
done
INSTALLED="node_modules/@nacrejs/ios/Nacre.xcframework/ios-arm64/Nacre.framework/Nacre"
cmp "$INSTALLED" "$ROOT/packages/ios/Nacre.xcframework/ios-arm64/Nacre.framework/Nacre"
test -x "$INSTALLED" || { echo "装出来的二进制丢了执行权限"; exit 1; }
test -f node_modules/@nacrejs/ios/LICENSE.md
test -f node_modules/@nacrejs/ios/THIRD-PARTY-NOTICES.md
test ! -e node_modules/@nacrejs/cli/test || { echo "用例跟着包发出去了"; exit 1; }
echo "装出来的包完好：真目录，二进制和仓库里的逐字节相同，许可和第三方声明在，用例不在"

step "类型检查"
npm run check --silent

step "没写权限文案：生成要在动任何文件之前停下"
if npx nacre generate . > "$WORK/generate-missing.log" 2>&1; then
  echo "该报错却成功了"; cat "$WORK/generate-missing.log"; exit 1
fi
grep -q "NSFaceIDUsageDescription" "$WORK/generate-missing.log" \
  || { echo "报错里没有点出缺的键："; cat "$WORK/generate-missing.log"; exit 1; }
test ! -e ios || { echo "报错了却已经写了 ios/"; exit 1; }
cat "$WORK/generate-missing.log"

step "写上文案，生成工程"
cat > nacre.config.json <<'EOF'
{
  "name": "Smoke",
  "bundleId": "com.example.smoke",
  "ios": { "infoPlist": { "NSFaceIDUsageDescription": "Unlock your saved login with Face ID." } }
}
EOF
npx nacre generate .
npm run build --silent
(cd ios && xcodegen generate --quiet)

step "编译（给模拟器）"
if ! xcodebuild -project ios/Smoke.xcodeproj -scheme App -sdk iphonesimulator \
     -destination 'generic/platform=iOS Simulator' -derivedDataPath ios/build -quiet build \
     > "$WORK/xcodebuild.log" 2>&1; then
  grep -E " error: |BUILD FAILED" "$WORK/xcodebuild.log" | head -20 || true
  echo "完整日志：$WORK/xcodebuild.log"
  exit 1
fi
BUILT="ios/build/Build/Products/Debug-iphonesimulator/Smoke.app"
for framework in Nacre NacreKeychain NacreLocalAuthentication; do
  test -d "$BUILT/Frameworks/$framework.framework" \
    || { echo "App 里没有嵌 $framework.framework"; exit 1; }
done
echo "编过了，App 里嵌着：$(ls "$BUILT/Frameworks" | tr '\n' ' ')"

if [ "$RUN" = "1" ]; then
  step "装到开着的模拟器上启动"
  xcrun simctl install booted "$BUILT"
  # 启动后看 15 秒的输出就停。macOS 没有 timeout，用 perl 的 alarm
  perl -e 'alarm 15; exec @ARGV' xcrun simctl launch --console-pty booted com.example.smoke \
    > "$WORK/launch.log" 2>&1 || true
  xcrun simctl terminate booted com.example.smoke 2>/dev/null || true
  xcrun simctl uninstall booted com.example.smoke
  grep -E "\[nacre\]|\[JS\]" "$WORK/launch.log" || true
  for want in "smoke: started, LAContext is function" "smoke: keychain read back value-1" \
              "1 from NacreKeychain" "1 from NacreLocalAuthentication"; do
    grep -qF "$want" "$WORK/launch.log" \
      || { echo "日志里没有：$want"; echo "完整日志：$WORK/launch.log"; exit 1; }
  done
fi

echo
echo "演练通过（版本 $VERSION$([ "$RUN" = "1" ] && echo "，在模拟器上跑过" || echo "，只编译，没有在模拟器上跑")）"
rm -rf "${WORK:?}"
