#!/usr/bin/env node
// 从一个 Nacre 项目生成它的 ios/ 目录。
//
//   node packages/ios/bin/nacre-ios.js generate <项目目录> [选项]
//
//     --runtime=framework   引预编译的 Nacre.xcframework（默认，用户就是这样）
//     --runtime=source      引运行时的 Xcode 工程当子工程（我们自己开发时用，
//                           改一行 C++ 重新编就生效）
//     --runtime-path=<目录> source 模式下运行时源码在哪，默认 <仓库>/ios
//
// **这是参考实现，不是产品。** 它存在的理由有两个：证明 @nacre/ios 里的
// 东西齐不齐，以及让我们自己的验收 App 天天用一遍模板——模板只有被用才
// 不会漂。真正的 CLI 由别人做，它只需要读同一份 nacre-ios.json。
//
// 生成的 ios/ 是**可以整个删掉重建的**（Expo 管这叫 CNG）。所以它不该被
// 手改，也不进版本库。
'use strict';

const fs = require('fs');
const path = require('path');

const PKG = path.resolve(__dirname, '..');
const MANIFEST = JSON.parse(fs.readFileSync(path.join(PKG, 'nacre-ios.json'), 'utf8'));

function fail(message) {
  console.error('nacre-ios: ' + message);
  process.exit(1);
}

// Swift 的模块名：只留字母数字下划线，不能以数字开头。
// **不能和运行时的模块名（Nacre）一样**——那样 App 里的 import Nacre 会变成
// 导入它自己，Swift 报 cannot find 'NacreRuntime' in scope。
function moduleNameFor(name) {
  let id = name.replace(/[^A-Za-z0-9_]/g, '');
  if (id === '' || /^[0-9]/.test(id)) id = 'App' + id;
  return id === MANIFEST.moduleName ? id + 'App' : id;
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, entry.name);
    const b = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(a, b);
    else fs.copyFileSync(a, b);
  }
}

// 一段 YAML 里的标量。清单里的值都是字符串或字符串数组
function yamlValue(value) {
  if (Array.isArray(value)) {
    return '[' + value.map((item) => JSON.stringify(String(item))).join(', ') + ']';
  }
  return JSON.stringify(String(value));
}

function settingsBlock(settings, indent) {
  return Object.entries(settings)
    .filter(([key]) => key !== '//')
    .map(([key, value]) => indent + key + ': ' + yamlValue(value))
    .join('\n');
}

function projectYaml(config, runtime) {
  const name = config.name;
  const moduleName = moduleNameFor(name);
  const displayName = config.displayName || name;
  const excluded = Object.entries(MANIFEST.excludedArchitectures || {})
    .map(([sdk, archs]) => `    EXCLUDED_ARCHS[sdk=${sdk}*]: ${archs.join(' ')}`)
    .join('\n');

  // 引运行时的两种方式。source 引工程，framework 引产物
  const references = runtime.mode === 'source'
    ? `projectReferences:\n  NacreRuntime:\n    path: ${runtime.projectPath}\n\n`
    : '';
  const dependency = runtime.mode === 'source'
    ? `      - target: NacreRuntime/${MANIFEST.moduleName}`
    : `      - framework: ${MANIFEST.xcframework}`;

  return `# 这个文件是 nacre-ios 生成的，别手改——下次生成会盖掉。
# 要改，改项目根目录的 nacre.config.json，或者让 CLI 支持你要的那一项。
name: ${name}

options:
  bundleIdPrefix: ${config.bundleId.split('.').slice(0, -1).join('.') || 'app'}
  deploymentTarget:
    iOS: "${config.deploymentTarget || MANIFEST.deploymentTarget}"
  createIntermediateGroups: true

${references}targets:
  App:
    type: application
    platform: iOS
    sources:
      - path: App
      # 整个目录作为资源打进 App Bundle（包内路径 ${MANIFEST.js.directory}/）
      - path: ${MANIFEST.js.directory}
        type: folder
        buildPhase: resources
    dependencies:
${dependency}
        embed: true
        codeSign: true
    info:
      path: App/Info.plist
      properties:
        CFBundleDisplayName: ${displayName}
        CFBundleShortVersionString: "${config.version || '0.1.0'}"
        CFBundleVersion: "${config.buildNumber || '1'}"
        UILaunchScreen: {}
        UIApplicationSupportsIndirectInputEvents: true
        UISupportedInterfaceOrientations:
          - UIInterfaceOrientationPortrait
        UIApplicationSceneManifest:
          UIApplicationSupportsMultipleScenes: false
          UISceneConfigurations:
            UIWindowSceneSessionRoleApplication:
              - UISceneConfigurationName: Default Configuration
                UISceneDelegateClassName: $(PRODUCT_MODULE_NAME).SceneDelegate
    settings:
      base:
        PRODUCT_BUNDLE_IDENTIFIER: ${config.bundleId}
        PRODUCT_NAME: ${name}
        # 模块名和运行时的 ${MANIFEST.moduleName} 区分开，否则 import ${MANIFEST.moduleName} 导入的是它自己
        PRODUCT_MODULE_NAME: ${moduleName}
        ASSETCATALOG_COMPILER_APPICON_NAME: AppIcon
        SWIFT_VERSION: "5.0"
${settingsBlock(MANIFEST.appSettings, '        ')}

settings:
  base:
    ARCHS: ${(MANIFEST.architectures || ['arm64']).join(' ')}
${excluded}
${settingsBlock(MANIFEST.projectSettings, '    ')}
`;
}

function generate(projectDir, options) {
  const configPath = path.join(projectDir, 'nacre.config.json');
  if (!fs.existsSync(configPath)) fail('找不到 ' + configPath);
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  if (!config.name || !config.bundleId) fail('nacre.config.json 要有 name 和 bundleId');

  const iosDir = path.join(projectDir, 'ios');
  const runtime = { mode: options.runtime };
  if (runtime.mode === 'source') {
    const src = path.resolve(options.runtimePath || path.join(PKG, '..', '..', 'ios'));
    if (!fs.existsSync(path.join(src, 'project.yml'))) {
      fail('--runtime=source 要指向运行时源码目录（里面有 project.yml），现在是 ' + src);
    }
    // XcodeGen 的 projectReferences 走相对路径，相对生成的 ios/
    runtime.projectPath = path.relative(iosDir, path.join(src, MANIFEST.moduleName + '.xcodeproj'));
  }

  // 模板：启动壳和图标。每次重铺，手改了也会被盖掉——这是故意的
  fs.rmSync(path.join(iosDir, 'App'), { recursive: true, force: true });
  copyDir(path.join(PKG, 'template'), iosDir);

  // 预编译的运行时
  if (runtime.mode === 'framework') {
    const from = path.join(PKG, MANIFEST.xcframework);
    if (!fs.existsSync(from)) {
      fail(MANIFEST.xcframework + ' 不在 ' + PKG + '，先跑 ios/scripts/build-xcframework.sh');
    }
    const to = path.join(iosDir, MANIFEST.xcframework);
    fs.rmSync(to, { recursive: true, force: true });
    copyDir(from, to);
  }

  // 项目自己的资源。main.js 由打包器写进同一个目录，这里不碰它
  const assetsFrom = path.join(projectDir, MANIFEST.js.assets);
  const assetsTo = path.join(iosDir, MANIFEST.js.directory, 'assets');
  fs.rmSync(assetsTo, { recursive: true, force: true });
  if (fs.existsSync(assetsFrom)) copyDir(assetsFrom, assetsTo);
  else fs.mkdirSync(path.join(iosDir, MANIFEST.js.directory), { recursive: true });

  fs.writeFileSync(path.join(iosDir, 'project.yml'), projectYaml(config, runtime));
  fs.writeFileSync(path.join(iosDir, '.gitignore'),
    '# 这个目录整个是 nacre-ios 生成的，删掉重建就行\n*\n');

  console.log('生成好了：' + path.relative(process.cwd(), iosDir) +
              '（运行时：' + runtime.mode + '）');
  console.log('下一步：打包 JS，然后在那个目录里跑 xcodegen generate');
}

function main(argv) {
  const [command, target, ...rest] = argv;
  if (command !== 'generate' || !target) {
    console.error('用法：nacre-ios generate <项目目录> [--runtime=framework|source] [--runtime-path=<目录>]');
    process.exit(1);
  }
  const options = { runtime: 'framework', runtimePath: null };
  for (const arg of rest) {
    const [key, value] = arg.split('=');
    if (key === '--runtime') options.runtime = value;
    else if (key === '--runtime-path') options.runtimePath = value;
    else fail('不认识的选项 ' + arg);
  }
  if (options.runtime !== 'framework' && options.runtime !== 'source') {
    fail('--runtime 只能是 framework 或 source');
  }
  generate(path.resolve(target), options);
}

main(process.argv.slice(2));
