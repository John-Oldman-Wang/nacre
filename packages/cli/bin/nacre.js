#!/usr/bin/env node
// @nacrejs/cli：从一个 Nacre 项目生成它的 ios/ 目录。
//
//   nacre generate <项目目录> [选项]
//
//     --runtime=framework   引预编译的 Nacre.xcframework（默认，用户就是这样）
//     --runtime=source      引运行时的 Xcode 工程当子工程（我们自己开发时用，
//                           改一行 C++ 重新编就生效）
//     --runtime-path=<目录> source 模式下运行时源码在哪，默认 <仓库>/ios
//
// **这个包里只有命令，没有任何要放进 ios/ 的东西。** 运行时、启动壳、清单都在
// 项目自己装的 @nacrejs/ios 里（<项目>/node_modules/@nacrejs/ios），命令去那里
// 找——和它找能力包是同一种找法。这样命令不属于任何一个平台，平台的东西
// 跟着平台的包走、和运行时同一个版本。
//
// 清单（nacre-ios.json）是两个包之间的约定，它带一个格式版本 manifestVersion。
// 清单的格式变了就升这个数；命令遇到不认识的版本直接停下，不去猜。
//
// 生成的 ios/ 是**可以整个删掉重建的**（Expo 管这叫 CNG）。所以它不该被
// 手改，也不进版本库。
'use strict';

const fs = require('fs');
const path = require('path');

// 这个命令读得懂的清单格式版本
const MANIFEST_VERSION = 1;

// 项目装的 @nacrejs/ios 在哪、它的清单。generate 一开始由 loadPlatform 填上；
// 下面的函数都在那之后才被调用
let IOS_PKG = null;
let MANIFEST = null;

function fail(message) {
  console.error('nacre: ' + message);
  process.exit(1);
}

// 找到项目装的 @nacrejs/ios，读它的清单。只读，不写任何东西
function loadPlatform(projectDir) {
  const dir = path.join(projectDir, 'node_modules', '@nacrejs', 'ios');
  const manifestPath = path.join(dir, 'nacre-ios.json');
  if (!fs.existsSync(manifestPath)) {
    fail('@nacrejs/ios is not installed in ' + projectDir +
         '. It holds the runtime and the app shell this command puts into ios/. Run: npm install @nacrejs/ios');
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (manifest.manifestVersion !== MANIFEST_VERSION) {
    fail('the installed @nacrejs/ios uses manifest version ' +
         (manifest.manifestVersion === undefined ? '(none)' : JSON.stringify(manifest.manifestVersion)) +
         ', but this @nacrejs/cli reads manifest version ' + MANIFEST_VERSION +
         '. Update @nacrejs/cli and @nacrejs/ios so that they match');
  }
  IOS_PKG = dir;
  MANIFEST = manifest;
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

// 项目装了哪些能力包。
//
// **装了就是声明**：项目的 package.json 里依赖了哪个能力包，生成的工程就嵌
// 哪个 framework；没装的，产物里没有它，JS 里对应的属性也不存在。不另设一份
// 「能力清单」让人再写一遍——那样「装了但忘了写」这个状态就会存在。
//
// **只看直接依赖。** 某个库自己依赖了一个能力包，不该让用它的 App 悄悄多嵌
// 一个 framework：那等于替用户做了选择（带来的可能是一条隐私声明、一句
// 权限文案）。要用，就自己装——和 npm 的 peerDependencies 是同一种约定。
//
// 认一个包是不是能力包，看它根目录的 nacre-ios.json 里有没有 capability。
function findCapabilities(projectDir) {
  const pkgPath = path.join(projectDir, 'package.json');
  if (!fs.existsSync(pkgPath)) return [];
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const names = Object.keys({ ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) });
  const found = [];
  // 排序：加进工程的顺序每次都一样，生成的 project.yml 才是稳定的
  for (const name of names.sort()) {
    const dir = path.join(projectDir, 'node_modules', name);
    // 写了依赖却没装：没法知道它是不是能力包。跳过的话就是「装了但没接入」，
    // 而且不报错——所以这里直接停下
    if (!fs.existsSync(dir)) fail('dependency ' + name + ' is not installed. Run npm install in the project first');
    const manifestPath = path.join(dir, 'nacre-ios.json');
    if (!fs.existsSync(manifestPath)) continue;
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (!manifest.capability) continue;
    // xcframework 必须有。target 只有运行时仓库里的包才有（它是运行时工程里的
    // target 名）；第三方的包没有，引源码时也用它预编译的 framework
    if (typeof manifest.xcframework !== 'string' || manifest.xcframework === '') {
      fail(name + ': nacre-ios.json must have "xcframework", the file name of the prebuilt framework in the package');
    }
    if (manifest.target !== undefined &&
        (typeof manifest.target !== 'string' || manifest.target === '')) {
      fail(name + ': "target" in nacre-ios.json must be a target name in the runtime project; third-party packages leave it out');
    }
    // 能力包依赖核心给它的接口（NacreExtension.h 和内置脚本的 ctx）。两边版本
    // 错开，要到运行时才以奇怪的方式出问题，所以在这里就拦
    const need = manifest.requires && manifest.requires.runtimeVersion;
    if (need && need !== MANIFEST.runtimeVersion) {
      fail(name + ' needs runtime ' + need + ', but the installed @nacrejs/ios is ' + MANIFEST.runtimeVersion);
    }
    // 这个包要项目在工程里写什么：哪些 Info.plist 键（给用户看的权限文案）、
    // 哪些 entitlement。它只说要哪些键，内容由项目自己写——文案是一句给最终
    // 用户看的话，包替不了
    const requires = manifest.requires || {};
    for (const slot of ['infoPlist', 'entitlements']) {
      const keys = requires[slot];
      if (keys !== undefined &&
          !(Array.isArray(keys) && keys.every((key) => typeof key === 'string' && key !== ''))) {
        fail(name + ': requires.' + slot + ' in nacre-ios.json must be a list of keys');
      }
    }
    const realDir = fs.realpathSync(dir);
    found.push({ package: name, dir: realDir,
                 target: manifest.target, xcframework: manifest.xcframework,
                 infoPlist: requires.infoPlist || [], entitlements: requires.entitlements || [],
                 vendored: readVendoredFrameworks(name, realDir, manifest.vendoredFrameworks),
                 systemFrameworks: readSystemFrameworks(name, manifest.systemFrameworks) });
  }
  // 拷进 ios/ 之后它们都在同一层，文件名不能撞
  const owners = new Map([[MANIFEST.xcframework, '@nacrejs/ios']]);
  for (const cap of found) {
    for (const file of [cap.xcframework, ...cap.vendored.map((v) => v.file)]) {
      if (owners.has(file)) {
        fail(cap.package + ' and ' + owners.get(file) + ' both ship ' + file +
             ': frameworks embedded in the app cannot share a name');
      }
      owners.set(file, cap.package);
    }
  }
  return found;
}

// 一个包随包带的第三方预编译 framework（清单的 vendoredFrameworks）。
//
// 原生模块包着的往往是别人给的 SDK，那个 SDK 自己是一个 .xcframework。它要和
// 模块的 framework 一起嵌进 App：模块的二进制记着「我要加载它」，App 里没有
// 就是启动时崩。写的是包目录里的相对路径。
//
// **只收动态的。** 静态库不是嵌进 App 的东西：它应该在编模块自己的 framework
// 时就链进去，那之后包里不用再带它。把静态的 framework 嵌进 App，装到设备上
// 时会被拒
function readVendoredFrameworks(name, dir, list) {
  if (list === undefined) return [];
  const where = name + ': vendoredFrameworks in nacre-ios.json';
  if (!Array.isArray(list) || !list.every((item) => typeof item === 'string' && item !== '')) {
    fail(where + ' must be a list of paths to .xcframework directories inside the package, e.g. ["vendor/RiskSDK.xcframework"]');
  }
  return list.map((item) => {
    if (!item.endsWith('.xcframework')) {
      fail(where + ': ' + item + ' is not an .xcframework. Only .xcframework is accepted' +
           ' (a bare .framework does not say whether it is for devices or the simulator)');
    }
    const full = path.resolve(dir, item);
    if (path.isAbsolute(item) || path.relative(dir, full).startsWith('..')) {
      fail(where + ': ' + item + ' points outside the package. Use a relative path inside the package directory');
    }
    if (!fs.existsSync(full) || !fs.statSync(full).isDirectory()) {
      fail(where + ': ' + item + ' does not exist (or is not a directory): ' + full);
    }
    if (isStaticXcframework(full)) {
      fail(where + ': ' + item + ' contains a static library. Link static libraries into your own ' +
           'framework when you build it; list only dynamic frameworks that must be embedded in the app here');
    }
    return { from: full, file: path.basename(item) };
  });
}

// 一个 xcframework 里是不是静态库：切片里有 .a，或者 .framework 里的二进制
// 是一个归档（文件开头是 !<arch>）
function isStaticXcframework(dir) {
  for (const slice of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!slice.isDirectory()) continue;
    for (const entry of fs.readdirSync(path.join(dir, slice.name), { withFileTypes: true })) {
      if (entry.name.endsWith('.a')) return true;
      if (!entry.isDirectory() || !entry.name.endsWith('.framework')) continue;
      const binary = path.join(dir, slice.name, entry.name, path.basename(entry.name, '.framework'));
      if (!fs.existsSync(binary) || !fs.statSync(binary).isFile()) continue;
      const head = Buffer.alloc(8);
      const fd = fs.openSync(binary, 'r');
      fs.readSync(fd, head, 0, 8, 0);
      fs.closeSync(fd);
      if (head.toString('latin1') === '!<arch>\n') return true;
    }
  }
  return false;
}

// 一个包要 App 链接的系统框架和系统库（清单的 systemFrameworks）。
//
// 动态 framework 自己用到的系统框架记在它的二进制里，不用写。要写的是第三方
// SDK 的接入文档里「请在工程里添加这些框架」的那一类：SDK 在运行时按名字找
// 类（NSClassFromString）或者弱链接，那个系统框架得有人链接才会被加载
function readSystemFrameworks(name, list) {
  if (list === undefined) return [];
  const where = name + ': systemFrameworks in nacre-ios.json';
  if (!Array.isArray(list) || !list.every((item) => typeof item === 'string')) {
    fail(where + ' must be a list of names, e.g. ["CoreTelephony.framework", "libz.tbd"]');
  }
  for (const item of list) {
    if (item.endsWith('.xcframework')) {
      fail(where + ': ' + item + ' is an .xcframework. Frameworks shipped with the package go in ' +
           'vendoredFrameworks; this list is for system frameworks only');
    }
    // 系统框架是 Xxx.framework，系统库是 libxxx.tbd。只要名字，不要路径
    if (!/^[A-Za-z0-9_]+\.framework$/.test(item) && !/^lib[A-Za-z0-9_.+-]+\.tbd$/.test(item)) {
      fail(where + ': ' + JSON.stringify(item) + ' is not recognized. Write system frameworks as Xxx.framework ' +
           'and system libraries as libxxx.tbd: the name only, no path');
    }
  }
  return list;
}

// ---- App 图标 ----
//
// 图标用约定的文件名，不写进 nacre.config.json：项目根目录（和
// nacre.config.json 并排）的 icon.icon 或者 icon.png。
//
//   icon.icon   Icon Composer 存出来的图标文件（一个目录，里面是 icon.json 和
//               图层图片）。浅色、深色、着色几种外观都在这一个文件里
//   icon.png    一张 1024×1024 的图
//
// 两个都有用 icon.icon。**没放就不带图标**：不报错、不提示，也没有默认的图，
// 桌面上是系统的占位图标。
//
// 不放在 assets/ 里，因为那个目录会整个拷进 App 包给 JS 用。

// 生成的工程里图标叫这个名字。两种文件进了工程都叫它，编译设置只指这一个
const ICON_NAME = 'AppIcon';
const ICON_SIZE = 1024;

// 找项目的图标，顺带查它能不能用。没放返回 null。
//
// **「没放」不报错，「放了但不能用」要报。** 后一种不拦的话（实测）：尺寸不对的
// PNG 编译失败，报的是一句看不出原因的话，原因在另一条警告里；写成普通文件的
// icon.icon 则是编译通过、悄悄没有图标。
function findIcon(projectDir) {
  // 文件名一个字都不能差。不能直接问「icon.png 在不在」：macOS 的文件系统默认
  // 不分大小写，Icon.png 也会答在。所以列出目录里实际的名字来比
  const names = fs.readdirSync(projectDir);

  if (names.includes('icon.icon')) {
    const from = path.join(projectDir, 'icon.icon');
    const usage = 'It must be an icon saved by Icon Composer: a directory containing icon.json';
    if (!fs.statSync(from).isDirectory()) {
      fail('icon.icon is not a directory. ' + usage);
    }
    if (!fs.readdirSync(from).includes('icon.json')) {
      fail('icon.icon has no icon.json. ' + usage);
    }
    return { kind: 'composer', from };
  }

  if (names.includes('icon.png')) {
    const from = path.join(projectDir, 'icon.png');
    const usage = 'The app icon must be a ' + ICON_SIZE + '×' + ICON_SIZE + ' PNG';
    if (fs.statSync(from).isDirectory()) fail('icon.png is a directory. ' + usage);
    const size = pngSize(from);
    if (size === null) fail('icon.png is not a PNG file (bad file signature). ' + usage);
    if (size.width !== ICON_SIZE || size.height !== ICON_SIZE) {
      fail('icon.png is ' + size.width + '×' + size.height + '. ' + usage);
    }
    return { kind: 'png', from };
  }

  return null;
}

// 一张 PNG 的宽高，不是 PNG 返回 null。PNG 开头是 8 个字节的签名，紧跟着的
// 第一块一定是 IHDR，宽和高是它开头的两个 32 位整数
function pngSize(file) {
  const head = Buffer.alloc(24);
  const fd = fs.openSync(file, 'r');
  const read = fs.readSync(fd, head, 0, 24, 0);
  fs.closeSync(fd);
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (read < 24 || !head.subarray(0, 8).equals(signature) ||
      head.toString('latin1', 12, 16) !== 'IHDR') {
    return null;
  }
  return { width: head.readUInt32BE(16), height: head.readUInt32BE(20) };
}

// 把图标写进生成的工程（App/ 刚重铺过，上一次的图标已经不在了）。
//
// icon.icon 整个拷成 App/AppIcon.icon：XcodeGen 认这个扩展名，放进资源阶段，
// Xcode 把它编进 App 的资源包。icon.png 没有这条路，要包成一个资源目录里的
// 图标集——只有一张图、不分外观的那种
function writeIcon(icon, appDir) {
  if (icon === null) return;
  if (icon.kind === 'composer') {
    copyDir(icon.from, path.join(appDir, ICON_NAME + '.icon'));
    return;
  }
  const set = catalogEntry(appDir, ICON_NAME + '.appiconset', {
    images: [{ filename: 'icon.png', idiom: 'universal', platform: 'ios',
               size: ICON_SIZE + 'x' + ICON_SIZE }],
  });
  fs.copyFileSync(icon.from, path.join(set, 'icon.png'));
}

// 往生成的工程的资源目录（App/Assets.xcassets）里加一项，返回这一项的目录。
// 资源目录本身用到时才建：图标（icon.png）和启动屏（底色、图）都可能往里放，
// 都没有时工程里就没有资源目录
const CATALOG_INFO = { author: 'xcode', version: 1 };
function catalogEntry(appDir, name, contents) {
  const catalog = path.join(appDir, 'Assets.xcassets');
  const entry = path.join(catalog, name);
  fs.mkdirSync(entry, { recursive: true });
  const json = (value) => JSON.stringify(value, null, 2) + '\n';
  fs.writeFileSync(path.join(catalog, 'Contents.json'), json({ info: CATALOG_INFO }));
  fs.writeFileSync(path.join(entry, 'Contents.json'), json({ ...contents, info: CATALOG_INFO }));
  return entry;
}

// ---- 启动屏 ----
//
// 启动屏是 App 启动到第一帧画出来之前系统显示的那个画面。它是一个底色加一张
// 居中的图，两样各自可有可无：
//
//   底色  nacre.config.json 最外层的 launchScreen：一个色值（"#0A84FF"），或者
//         按深浅色分的 { "light": "#FFFFFF", "dark": "#000000" }
//   图    项目根目录的 launch.png，按 3 倍图算（360×360 像素显示成 120×120 点），
//         深浅色用同一张
//
// 只给色值是纯色底；只给图是系统底色（浅色白、深色黑）上放图；都没给和以前
// 一样，一个空白的画面。「没给」不报错、不提示。
//
// 另有一个出口：项目根目录放 launch.storyboard，就整个用它，上面两样不看
// （和 icon.icon 优先于 icon.png 一个道理）。
//
// 底色加图那条路由我们写出一份 storyboard，不用 Info.plist 的 UILaunchScreen
// 字典：那个字典画图不缩放，比屏幕大的图直接裁掉（实测）；storyboard 能做到
// 「图多大就显示多大，放不下时等比缩到放得下」。

// 生成的工程里这几样东西的名字。用户看不到，也不该依赖
const LAUNCH_STORYBOARD = 'LaunchScreen';
const LAUNCH_COLOR = 'LaunchBackground';
const LAUNCH_IMAGE = 'LaunchLogo';
const LAUNCH_IMAGE_SCALE = 3;
// 实测（iPhone Air 的模拟器）：图大到一定程度，系统不画启动屏，整屏是黑的——
// 2400×2400（576 万像素）还行，2600×2600 和 1300×5200（676 万）不行，和长宽
// 无关，只看像素数。界限定在量过没问题的范围里，留出余量
const LAUNCH_IMAGE_MAX_PIXELS = 4000000;

// 一个色值：# 加 6 位或 3 位十六进制数，不分大小写。返回 [红, 绿, 蓝]，0–255；
// 认不出来返回 null。运行时的颜色还认 4 位、8 位（带透明度）和颜色名，这里
// 不认：启动屏的底色后面没有东西可以透出来，系统的语义色则不需要写（不给
// 底色就是它）
function parseLaunchColor(value) {
  if (typeof value !== 'string' || !/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) return null;
  const hex = value.length === 4 ? value.slice(1).replace(/./g, '$&$&') : value.slice(1);
  return [0, 2, 4].map((at) => parseInt(hex.slice(at, at + 2), 16));
}

// 配置里的底色。返回 { light, dark }，dark 是 null 表示两种外观同一个颜色；
// 没写返回 null。
//
// 认不出来的也返回 null，当没写，不报错：写错的结果在屏幕上看得到（底色是
// 系统默认的），生成时不拦（2026-11-18 定）。认得出的只有两种写法——一个色值，
// 或者 light 和 dark 两项都是色值的对象（多出来的键不看）
function readLaunchColor(config) {
  const value = config.launchScreen;
  if (typeof value === 'string') {
    const light = parseLaunchColor(value);
    return light === null ? null : { light, dark: null };
  }
  if (!isPlainObject(value)) return null;
  const light = parseLaunchColor(value.light);
  const dark = parseLaunchColor(value.dark);
  return light === null || dark === null ? null : { light, dark };
}

// 找项目的启动屏。都没给返回 null。
//   { kind: 'storyboard', from }       用户自己的 launch.storyboard
//   { kind: 'generated', color, image } 底色和图，至少有一样
// 和图标一样：文件名逐字比对；「没放」不报错，「放了但不能用」要报
function findLaunchScreen(projectDir, config) {
  const names = fs.readdirSync(projectDir);

  if (names.includes('launch.storyboard')) {
    const from = path.join(projectDir, 'launch.storyboard');
    if (fs.statSync(from).isDirectory()) {
      fail('launch.storyboard is a directory. It must be a launch screen storyboard file');
    }
    return { kind: 'storyboard', from };
  }

  let image = null;
  if (names.includes('launch.png')) {
    const from = path.join(projectDir, 'launch.png');
    const usage = 'The launch screen image must be a PNG';
    if (fs.statSync(from).isDirectory()) fail('launch.png is a directory. ' + usage);
    const size = pngSize(from);
    if (size === null) fail('launch.png is not a PNG file (bad file signature). ' + usage);
    if (size.width * size.height > LAUNCH_IMAGE_MAX_PIXELS) {
      fail('launch.png is ' + size.width + '×' + size.height + ', more than ' +
           LAUNCH_IMAGE_MAX_PIXELS + ' pixels. When the image is too large the system draws no launch ' +
           'screen and the whole screen is black. It is shown at ' + LAUNCH_IMAGE_SCALE +
           'x (360×360 pixels is 120×120 points), so it does not need to be this large');
    }
    image = { from, ...size };
  }

  const color = readLaunchColor(config);
  return color === null && image === null ? null : { kind: 'generated', color, image };
}

// 把启动屏写进生成的工程。两条路最后都是 App/LaunchScreen.storyboard，
// Info.plist 的 UILaunchStoryboardName 指它
function writeLaunchScreen(launch, appDir) {
  if (launch === null) return;
  const to = path.join(appDir, LAUNCH_STORYBOARD + '.storyboard');
  if (launch.kind === 'storyboard') {
    fs.copyFileSync(launch.from, to);
    return;
  }
  const { color, image } = launch;
  if (color !== null) {
    // 底色做成资源目录里的一个颜色集：storyboard 里写死的颜色不会跟着深浅色变，
    // 按名字引用的颜色集会
    const entry = (rgb) => ({
      idiom: 'universal',
      color: {
        'color-space': 'srgb',
        components: {
          red: hexByte(rgb[0]), green: hexByte(rgb[1]), blue: hexByte(rgb[2]), alpha: '1.000',
        },
      },
    });
    const colors = [entry(color.light)];
    if (color.dark !== null) {
      colors.push({ ...entry(color.dark),
                    appearances: [{ appearance: 'luminosity', value: 'dark' }] });
    }
    catalogEntry(appDir, LAUNCH_COLOR + '.colorset', { colors });
  }
  if (image !== null) {
    // 只有 3x 这一项：图多少像素，除以 3 就是多少点
    const set = catalogEntry(appDir, LAUNCH_IMAGE + '.imageset', {
      images: [{ filename: 'launch.png', idiom: 'universal', scale: LAUNCH_IMAGE_SCALE + 'x' }],
    });
    fs.copyFileSync(image.from, path.join(set, 'launch.png'));
  }
  fs.writeFileSync(to, launchStoryboard(color !== null, image));
}

const hexByte = (value) => '0x' + value.toString(16).toUpperCase().padStart(2, '0');

// 启动屏的 storyboard：一个页面，底色，可能有一张图。
//
// 图的四条约束：横竖都居中，宽高都不超过屏幕。图本身的大小（它的像素数除以
// 3）是优先级低一档的要求，放得下就按它；放不下时那两条「不超过」先满足，
// 再由 scaleAspectFit 在框里等比缩小——所以不会被裁，也不会变形（实测）。
// 小图不会被放大：约束只有上限
function launchStoryboard(hasColor, image) {
  const background = hasColor
    ? `<color key="backgroundColor" name="${LAUNCH_COLOR}"/>`
    : '<color key="backgroundColor" systemColor="systemBackgroundColor"/>';
  const colorResource = hasColor
    ? `        <namedColor name="${LAUNCH_COLOR}">
            <color red="1" green="1" blue="1" alpha="1" colorSpace="custom" customColorSpace="sRGB"/>
        </namedColor>`
    : `        <systemColor name="systemBackgroundColor">
            <color white="1" alpha="1" colorSpace="custom" customColorSpace="genericGamma22GrayColorSpace"/>
        </systemColor>`;
  let subviews = '';
  let constraints = '';
  let imageResource = '';
  if (image !== null) {
    const points = (pixels) => Math.round(pixels / LAUNCH_IMAGE_SCALE);
    subviews = `
                        <subviews>
                            <imageView clipsSubviews="YES" userInteractionEnabled="NO" contentMode="scaleAspectFit" image="${LAUNCH_IMAGE}" translatesAutoresizingMaskIntoConstraints="NO" id="logo"/>
                        </subviews>`;
    constraints = `
                        <constraints>
                            <constraint firstItem="logo" firstAttribute="centerX" secondItem="root" secondAttribute="centerX" id="logo-center-x"/>
                            <constraint firstItem="logo" firstAttribute="centerY" secondItem="root" secondAttribute="centerY" id="logo-center-y"/>
                            <constraint firstItem="logo" firstAttribute="width" relation="lessThanOrEqual" secondItem="root" secondAttribute="width" id="logo-max-width"/>
                            <constraint firstItem="logo" firstAttribute="height" relation="lessThanOrEqual" secondItem="root" secondAttribute="height" id="logo-max-height"/>
                        </constraints>`;
    imageResource = `        <image name="${LAUNCH_IMAGE}" width="${points(image.width)}" height="${points(image.height)}"/>
`;
  }
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!-- Generated by nacre. Do not edit: the next generate overwrites it. -->
<document type="com.apple.InterfaceBuilder3.CocoaTouch.Storyboard.XIB" version="3.0" toolsVersion="23504" targetRuntime="iOS.CocoaTouch" propertyAccessControl="none" useAutolayout="YES" launchScreen="YES" useTraitCollections="YES" useSafeAreas="YES" colorMatched="YES" initialViewController="launch">
    <dependencies>
        <plugIn identifier="com.apple.InterfaceBuilder.IBCocoaTouchPlugin" version="23506"/>
        <capability name="Named colors" minToolsVersion="9.0"/>
        <capability name="System colors in document resources" minToolsVersion="11.0"/>
        <capability name="documents saved in the Xcode 8 format" minToolsVersion="8.0"/>
    </dependencies>
    <scenes>
        <scene sceneID="launch-scene">
            <objects>
                <viewController id="launch" sceneMemberID="viewController">
                    <view key="view" contentMode="scaleToFill" id="root">
                        <rect key="frame" x="0.0" y="0.0" width="393" height="852"/>
                        <autoresizingMask key="autoresizingMask" widthSizable="YES" heightSizable="YES"/>${subviews}
                        ${background}${constraints}
                    </view>
                </viewController>
                <placeholder placeholderIdentifier="IBFirstResponder" id="first-responder" sceneMemberID="firstResponder"/>
            </objects>
        </scene>
    </scenes>
    <resources>
${imageResource}${colorResource}
    </resources>
</document>
`;
}

// ---- 工程配置：语言、Info.plist、entitlement ----
//
// 这些都从 nacre.config.json 来，生成的 ios/ 里不留需要手改的地方。

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// YAML 的一行值。JSON 的写法在 YAML 里都合法，只是冒号和逗号后面留一个空格
// （XcodeGen 用的解析器对紧挨着的 "a":1 不一定认）。plist 里没有 null
function yamlInline(value, where) {
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (Array.isArray(value)) {
    return '[' + value.map((item) => yamlInline(item, where)).join(', ') + ']';
  }
  if (isPlainObject(value)) {
    return '{' + Object.entries(value)
      .map(([key, item]) => JSON.stringify(key) + ': ' + yamlInline(item, where))
      .join(', ') + '}';
  }
  fail(where + ' has a value the project file cannot express (' + String(value) +
       '): only strings, numbers, booleans, arrays and objects are allowed');
}

// .strings 文件里的一行
function stringsLine(key, text) {
  const escaped = text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
  return '"' + key + '" = "' + escaped + '";\n';
}

// App 支持的语言。第一个是默认语言。
//
// 为什么要声明：实测不声明任何语言的 App，系统给的文字（报错、系统自带的
// 按钮）一律是英文，不跟手机的语言走；声明了才跟。它和有没有权限文案无关
function readLanguages(config) {
  const ios = config.ios || {};
  if (ios.languages === undefined) return [];
  const list = ios.languages;
  if (!Array.isArray(list) || list.length === 0 || !list.every((item) => typeof item === 'string')) {
    fail('ios.languages must be a list of language codes, the first one being the default, e.g. ["en", "zh-Hans"]');
  }
  for (const code of list) {
    // 系统认的本地化目录名：en、zh-Hans、pt-BR 这种
    if (!/^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(code)) {
      fail('ios.languages: ' + JSON.stringify(code) + ' does not look like a language code (e.g. en, zh-Hans, pt-BR)');
    }
    if (list.indexOf(code) !== list.lastIndexOf(code)) {
      fail('ios.languages: ' + code + ' is listed twice');
    }
  }
  return list;
}

// 一个值是不是「按语言写的文案」：对象、值全是字符串、至少有一个键是声明过的
// 语言。键里一个语言都没有的对象是普通的字典（NSAppTransportSecurity 那种）。
// 是的话返回 { 默认语言的那一句, 各语言的 }，顺带查三种写错的情况
function localized(value, languages, where) {
  if (!isPlainObject(value)) return null;
  const keys = Object.keys(value);
  const allText = keys.length > 0 && keys.every((key) => typeof value[key] === 'string');
  if (!allText) return null;
  if (languages.length === 0) {
    // 没声明语言。长得像按语言写的（键都像语言代码）就报错，免得它被悄悄
    // 当成一个字典写进 Info.plist
    const looksLocalized = keys.every((key) => /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(key));
    if (looksLocalized) {
      fail(where + ' is written per language, but the app does not declare its languages. Add ios.languages, e.g. ' +
           JSON.stringify(keys));
    }
    return null;
  }
  if (!keys.some((key) => languages.includes(key))) return null;
  const unknown = keys.filter((key) => !languages.includes(key));
  if (unknown.length > 0) {
    fail(where + ': ' + unknown.join(', ') + ' is not in ios.languages (' +
         languages.join(', ') + '). Is the language code misspelled, or missing from ios.languages?');
  }
  const fallback = value[languages[0]];
  if (fallback === undefined || fallback.trim() === '') {
    fail(where + ' has no text for the default language ' + languages[0]);
  }
  return { fallback, byLanguage: value };
}

// 这几个键各有专门的配置项，写在 ios.infoPlist 里会和它们打架
const RESERVED_INFO_KEYS = {
  CFBundleIdentifier: 'bundleId',
  CFBundleDisplayName: 'displayName',
  CFBundleShortVersionString: 'version',
  CFBundleVersion: 'buildNumber',
  CFBundleURLTypes: 'ios.urlSchemes',
  UISupportedInterfaceOrientations: 'ios.orientations',
  // 启动屏由生成器配：给了底色或图时这两个键里用的是哪一个，取决于给了什么
  UILaunchScreen: 'launchScreen',
  UILaunchStoryboardName: 'launchScreen',
};

// 这几个协议是系统自己的：App 声明了也没用，系统照样交给它自己的 App
// （Apple 的文档「Defining a custom URL scheme for your app」里列的）。
// 写了 https 的人多半想要的是通用链接，那是另一套配置
const SYSTEM_URL_SCHEMES = ['http', 'https', 'mailto', 'tel', 'sms', 'facetime', 'facetime-audio'];

// App 认哪些自定义协议（myapp://…）。别的 App 或者一条链接用这些协议打开
// 我们时，JS 收到 application 的 openurl 事件。
//
// 名字的写法是 RFC 3986 定的：字母开头，后面是字母、数字、+、-、.。系统对
// 写错的名字不报错，只是那个协议永远打不开这个 App，所以在这里拦
function readURLSchemes(ios) {
  const list = ios.urlSchemes;
  if (list === undefined) return [];
  const usage = 'ios.urlSchemes must be a list of scheme names (without ://), e.g. ["myapp"]';
  if (!Array.isArray(list)) fail(usage);
  const seen = new Set();
  for (const scheme of list) {
    if (typeof scheme !== 'string') {
      fail(usage + '; ' + JSON.stringify(scheme) + ' is not a string');
    }
    if (!/^[A-Za-z][A-Za-z0-9+.-]*$/.test(scheme)) {
      fail('ios.urlSchemes: ' + JSON.stringify(scheme) + ' is not a scheme name. ' +
           'It must start with a letter, followed only by letters, digits, +, - and .' +
           (scheme.includes(':') ? ' (no ://)' : ''));
    }
    // 协议名不分大小写
    const key = scheme.toLowerCase();
    if (SYSTEM_URL_SCHEMES.includes(key)) {
      fail('ios.urlSchemes: ' + scheme + ' is a system scheme; an app that declares it never receives it. ' +
           'To open the app from https links, set up universal links (associated domains), not this');
    }
    if (seen.has(key)) fail('ios.urlSchemes: ' + scheme + ' is listed twice (scheme names are case-insensitive)');
    seen.add(key);
  }
  return list;
}

// App 允许的方向。名字和 JS 里页面的 supportedInterfaceOrientations 一样，认三个合称；
// 不写是只有竖屏。页面上的 supportedInterfaceOrientations 是在这个范围里再收窄
const ORIENTATIONS = {
  portrait: ['UIInterfaceOrientationPortrait'],
  portraitUpsideDown: ['UIInterfaceOrientationPortraitUpsideDown'],
  landscapeLeft: ['UIInterfaceOrientationLandscapeLeft'],
  landscapeRight: ['UIInterfaceOrientationLandscapeRight'],
  landscape: ['UIInterfaceOrientationLandscapeLeft', 'UIInterfaceOrientationLandscapeRight'],
  all: ['UIInterfaceOrientationPortrait', 'UIInterfaceOrientationPortraitUpsideDown',
        'UIInterfaceOrientationLandscapeLeft', 'UIInterfaceOrientationLandscapeRight'],
  allButUpsideDown: ['UIInterfaceOrientationPortrait', 'UIInterfaceOrientationLandscapeLeft',
                     'UIInterfaceOrientationLandscapeRight'],
};
const ORIENTATION_ORDER = ORIENTATIONS.all;

function readOrientations(ios) {
  const list = ios.orientations;
  if (list === undefined) return ['UIInterfaceOrientationPortrait'];
  const choices = Object.keys(ORIENTATIONS).join(', ');
  if (!Array.isArray(list)) fail('ios.orientations must be a list of orientation names, e.g. ["portrait", "landscape"]');
  if (list.length === 0) fail('ios.orientations needs at least one orientation; expected some of: ' + choices);
  const chosen = new Set();
  for (const name of list) {
    const values = typeof name === 'string' ? ORIENTATIONS[name] : undefined;
    if (values === undefined) {
      fail('ios.orientations has no value ' + JSON.stringify(name) + '; expected one of: ' + choices);
    }
    for (const value of values) chosen.add(value);
  }
  return ORIENTATION_ORDER.filter((value) => chosen.has(value));
}

// 把配置读成生成工程要用的几样东西：
//   info         写进 Info.plist 的键值（按语言的文案取默认语言的那一句；
//                ios.urlSchemes 在这里变成 CFBundleURLTypes）
//   strings      语言 → { 键: 那种语言的文案 }，写成各语言的 InfoPlist.strings
//   entitlements entitlement 的键值
//   notes        生成时要提示的话
function readProjectConfig(config, capabilities) {
  if (typeof config.name !== 'string' || config.name === '') {
    fail('"name" in nacre.config.json must be a string: it names the project and the product. ' +
         'For the name shown under the icon use displayName, which can be written per language');
  }
  const ios = config.ios === undefined ? {} : config.ios;
  if (!isPlainObject(ios)) fail('"ios" in nacre.config.json must be an object');
  const languages = readLanguages(config);
  const info = {};
  const strings = {};
  for (const code of languages) strings[code] = {};
  const notes = [];

  // 一条可能按语言写的文案
  const addText = (key, value, where) => {
    const texts = localized(value, languages, where);
    if (texts === null) return false;
    info[key] = texts.fallback;
    const missing = [];
    for (const code of languages) {
      if (typeof texts.byLanguage[code] === 'string' && texts.byLanguage[code].trim() !== '') {
        strings[code][key] = texts.byLanguage[code];
      } else {
        missing.push(code);
      }
    }
    if (missing.length > 0) {
      notes.push(where + ' has no text for ' + missing.join(', ') + '; these languages show the default (' +
                 languages[0] + ') text');
    }
    return true;
  };

  // 图标下面的名字。每种语言的文件里都写一份：本地化目录是空的话系统不认
  // 这种语言
  const displayName = config.displayName === undefined ? config.name : config.displayName;
  if (!addText('CFBundleDisplayName', displayName, 'displayName')) {
    if (typeof displayName !== 'string' || displayName === '') {
      fail('displayName must be a string, or an object written per language');
    }
    info.CFBundleDisplayName = displayName;
  }
  for (const code of languages) {
    if (strings[code].CFBundleDisplayName === undefined) {
      strings[code].CFBundleDisplayName = info.CFBundleDisplayName;
    }
  }

  if (ios.infoPlist !== undefined && !isPlainObject(ios.infoPlist)) {
    fail('ios.infoPlist must be an object: Info.plist keys and their values');
  }
  for (const [key, value] of Object.entries(ios.infoPlist || {})) {
    const where = 'ios.infoPlist.' + key;
    if (RESERVED_INFO_KEYS[key] !== undefined) {
      fail(where + ': this key is controlled by ' + RESERVED_INFO_KEYS[key] + ' in nacre.config.json; change that instead');
    }
    if (key === 'UIApplicationSceneManifest') {
      fail(where + ': UIApplicationSceneManifest is set by the app shell and cannot be changed here');
    }
    if (value === null || value === undefined) {
      fail(where + ' has no value. Remove the line if you do not want this key');
    }
    if (!addText(key, value, where)) {
      yamlInline(value, where);   // 现在就查一遍，错了点得出是哪个键
      info[key] = value;
    }
  }

  if (ios.entitlements !== undefined && !isPlainObject(ios.entitlements)) {
    fail('ios.entitlements must be an object: entitlement keys and their values');
  }
  // 自定义协议：一组，标识用 App 的包名。角色写 Editor——这些协议是这个 App
  // 自己定义的（Viewer 是「我能打开别人定义的协议」）
  info.UISupportedInterfaceOrientations = readOrientations(ios);
  const urlSchemes = readURLSchemes(ios);
  if (urlSchemes.length > 0) {
    info.CFBundleURLTypes = [{
      CFBundleTypeRole: 'Editor',
      CFBundleURLName: config.bundleId,
      CFBundleURLSchemes: urlSchemes,
    }];
  }

  const entitlements = { ...(ios.entitlements || {}) };
  for (const [key, value] of Object.entries(entitlements)) {
    if (value === null || value === undefined) fail('ios.entitlements.' + key + ' has no value');
    yamlInline(value, 'ios.entitlements.' + key);
  }

  // 能力包要的东西项目写了没有。**在这里就拦**：缺权限文案的 App 编译和运行
  // 都正常，要到用户第一次用那个功能时崩、或者上传 App Store 时才被拒
  const problems = [];
  for (const cap of capabilities) {
    for (const key of cap.infoPlist) {
      const value = info[key];
      if (typeof value !== 'string' || value.trim() === '') {
        problems.push(cap.package + ' needs ' + key + ' in Info.plist: a sentence shown to the user ' +
                      'explaining why the app needs this permission. Put it in ios.infoPlist in ' +
                      'nacre.config.json');
      }
    }
    for (const key of cap.entitlements) {
      if (entitlements[key] === undefined) {
        problems.push(cap.package + ' needs the entitlement ' + key +
                      '. Put it in ios.entitlements in nacre.config.json');
      }
    }
  }
  if (problems.length > 0) fail(problems.join('\n          '));

  return { languages, info, strings, entitlements, notes };
}

function projectYaml(config, runtime, capabilities, project, icon, launch) {
  const name = config.name;
  const moduleName = moduleNameFor(name);
  const { languages, info, entitlements } = project;
  // Info.plist 里项目自己的那些键。CFBundleDisplayName 也在里面
  const infoLines = Object.entries(info)
    .map(([key, value]) => '        ' + key + ': ' + yamlInline(value, key))
    .join('\n');
  const languageOption = languages.length > 0
    ? '\n  developmentLanguage: ' + yamlInline(languages[0])
    : '';
  const localizations = languages.length > 0
    ? '\n        CFBundleLocalizations: ' + yamlInline(languages)
    : '';
  const entitlementBlock = Object.keys(entitlements).length > 0
    ? '    entitlements:\n      path: App/App.entitlements\n      properties:\n' +
      Object.entries(entitlements)
        .map(([key, value]) => '        ' + JSON.stringify(key) + ': ' + yamlInline(value, key))
        .join('\n') + '\n'
    : '';
  const excluded = Object.entries(MANIFEST.excludedArchitectures || {})
    .map(([sdk, archs]) => `    EXCLUDED_ARCHS[sdk=${sdk}*]: ${archs.join(' ')}`)
    .join('\n');

  // 引运行时的两种方式。source 引工程，framework 引产物
  const references = runtime.mode === 'source'
    ? `projectReferences:\n  NacreRuntime:\n    path: ${runtime.projectPath}\n\n`
    : '';
  // 核心，加上项目装了的每个能力包。每一个都要嵌进 App 并签名——它们是各自
  // 独立的 framework，能力包只链接核心、不嵌它。
  // 包没有 target（第三方的包）时，引源码也用它预编译的 framework。
  // 随包带的第三方 framework 排在后面，一样嵌、一样签
  const usesTarget = (c) => runtime.mode === 'source' && c.target !== undefined;
  const names = [
    runtime.mode === 'source' ? `target: NacreRuntime/${MANIFEST.moduleName}`
                              : `framework: ${MANIFEST.xcframework}`,
    ...capabilities.map((c) => (usesTarget(c) ? `target: NacreRuntime/${c.target}`
                                              : `framework: ${c.xcframework}`)),
    ...capabilities.flatMap((c) => c.vendored.map((v) => `framework: ${v.file}`)),
  ];
  // 包要 App 链接的系统框架。几个包要同一个只写一次；排序是为了生成的工程稳定
  const sdks = [...new Set(capabilities.flatMap((c) => c.systemFrameworks))].sort();
  const dependency = [
    ...names.map((line) => `      - ${line}\n        embed: true\n        codeSign: true`),
    ...sdks.map((sdk) => `      - sdk: ${sdk}`),
  ].join('\n');

  return `# Generated by nacre. Do not edit: the next generate overwrites it.
# To change something, edit nacre.config.json in the project root.
name: ${name}

options:
  bundleIdPrefix: ${config.bundleId.split('.').slice(0, -1).join('.') || 'app'}
  deploymentTarget:
    iOS: "${config.deploymentTarget || MANIFEST.deploymentTarget}"
  createIntermediateGroups: true${languageOption}

${references}targets:
  App:
    type: application
    platform: iOS
    sources:
      - path: App
      # The whole directory goes into the app bundle as a resource (at ${MANIFEST.js.directory}/)
      - path: ${MANIFEST.js.directory}
        type: folder
        buildPhase: resources
    dependencies:
${dependency}
    info:
      path: App/Info.plist
      properties:
${infoLines}${localizations}
        CFBundleShortVersionString: "${config.version || '0.1.0'}"
        CFBundleVersion: "${config.buildNumber || '1'}"
        ${launch === null ? 'UILaunchScreen: {}'
                          : 'UILaunchStoryboardName: ' + JSON.stringify(LAUNCH_STORYBOARD)}
        UIApplicationSupportsIndirectInputEvents: true
        UIApplicationSceneManifest:
          UIApplicationSupportsMultipleScenes: false
          UISceneConfigurations:
            UIWindowSceneSessionRoleApplication:
              - UISceneConfigurationName: Default Configuration
                UISceneDelegateClassName: $(PRODUCT_MODULE_NAME).SceneDelegate
${entitlementBlock}    settings:
      base:
        PRODUCT_BUNDLE_IDENTIFIER: ${config.bundleId}
        PRODUCT_NAME: ${name}
        # Must differ from the runtime's module name ${MANIFEST.moduleName}; otherwise import ${MANIFEST.moduleName} imports the app itself
        PRODUCT_MODULE_NAME: ${moduleName}
        # The icon name. With no icon it must be set to empty explicitly: XcodeGen defaults an app to
        # AppIcon, and the build fails when the asset catalog exists but has no such icon
        ASSETCATALOG_COMPILER_APPICON_NAME: ${icon === null ? '""' : JSON.stringify(ICON_NAME)}
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
  loadPlatform(projectDir);
  const configPath = path.join(projectDir, 'nacre.config.json');
  if (!fs.existsSync(configPath)) fail('cannot find ' + configPath);
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  if (!config.name || !config.bundleId) fail('nacre.config.json must have "name" and "bundleId"');
  // 配置有错就在动任何文件之前停下
  const capabilities = findCapabilities(projectDir);
  const project = readProjectConfig(config, capabilities);
  const icon = findIcon(projectDir);
  const launch = findLaunchScreen(projectDir, config);

  const iosDir = path.join(projectDir, 'ios');
  const runtime = { mode: options.runtime };
  if (runtime.mode === 'source') {
    const src = path.resolve(options.runtimePath || path.join(__dirname, '..', '..', '..', 'ios'));
    if (!fs.existsSync(path.join(src, 'project.yml'))) {
      fail('--runtime=source needs the runtime source directory (the one containing project.yml); got ' + src +
           '. Pass --runtime-path=<dir>');
    }
    // XcodeGen 的 projectReferences 走相对路径，相对生成的 ios/
    runtime.projectPath = path.relative(iosDir, path.join(src, MANIFEST.moduleName + '.xcodeproj'));
  }

  // 模板：启动壳。每次重铺，手改了也会被盖掉——这是故意的
  fs.rmSync(path.join(iosDir, 'App'), { recursive: true, force: true });
  copyDir(path.join(IOS_PKG, 'template'), iosDir);

  // 项目自己的图标和启动屏。没放就什么都不写
  writeIcon(icon, path.join(iosDir, 'App'));
  writeLaunchScreen(launch, path.join(iosDir, 'App'));

  // 每种语言一个本地化目录，里面是这种语言的 App 名和权限文案。App/ 每次
  // 都是重铺的，去掉的语言不会留下目录
  for (const code of project.languages) {
    const dir = path.join(iosDir, 'App', code + '.lproj');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'InfoPlist.strings'),
      Object.entries(project.strings[code]).map(([key, text]) => stringsLine(key, text)).join(''));
  }

  // 预编译的产物：核心在 @nacrejs/ios 里，每个能力在它自己的包里。引源码时核心
  // 和有 target 的包不拷（它们由运行时的工程现编）；没有 target 的包、随包带的
  // 第三方 framework，两种方式都要拷
  {
    const files = [
      ...(runtime.mode === 'framework' ? [{ src: path.join(IOS_PKG, MANIFEST.xcframework), owner: '@nacrejs/ios' }] : []),
      ...capabilities
        .filter((c) => runtime.mode === 'framework' || c.target === undefined)
        .map((c) => ({ src: path.join(c.dir, c.xcframework), owner: c.package })),
      ...capabilities.flatMap((c) => c.vendored.map((v) => ({ src: v.from, owner: c.package }))),
    ].map((f) => ({ ...f, file: path.basename(f.src) }));
    // 先查齐不齐，再动 ios/ 里的东西
    for (const { src, file, owner } of files) {
      if (!fs.existsSync(src)) {
        fail(owner + ': ' + file + ' is missing from ' + path.dirname(src) +
             '. The package is incomplete; reinstall it');
      }
    }
    // 上一次生成时装过、这一次卸掉了的包：它的产物不能留在 ios/ 里
    for (const entry of fs.readdirSync(iosDir)) {
      if (entry.endsWith('.xcframework') && !files.some((f) => f.file === entry)) {
        fs.rmSync(path.join(iosDir, entry), { recursive: true, force: true });
      }
    }
    for (const { src, file } of files) {
      const to = path.join(iosDir, file);
      fs.rmSync(to, { recursive: true, force: true });
      copyDir(src, to);
    }
  }

  // 项目自己的资源。main.js 由打包器写进同一个目录，这里不碰它
  const assetsFrom = path.join(projectDir, MANIFEST.js.assets);
  const assetsTo = path.join(iosDir, MANIFEST.js.directory, 'assets');
  fs.rmSync(assetsTo, { recursive: true, force: true });
  if (fs.existsSync(assetsFrom)) copyDir(assetsFrom, assetsTo);
  else fs.mkdirSync(path.join(iosDir, MANIFEST.js.directory), { recursive: true });

  fs.writeFileSync(path.join(iosDir, 'project.yml'),
                   projectYaml(config, runtime, capabilities, project, icon, launch));
  fs.writeFileSync(path.join(iosDir, '.gitignore'),
    '# This whole directory is generated by nacre. Delete it and generate again any time.\n*\n');

  // 项目可以在任何地方，相对路径一旦变成一串 ../../.. 就不如绝对路径好读
  const shown = path.relative(process.cwd(), iosDir);
  console.log('Generated ' + (shown.startsWith('..') ? iosDir : shown) +
              ' (runtime: ' + runtime.mode + ')');
  console.log('Capability packages: ' + (capabilities.length
    ? capabilities.map((c) => c.package).join(', ')
    : 'none (core only)'));
  if (project.languages.length > 0) {
    console.log('Languages: ' + project.languages.join(', ') + ' (default ' + project.languages[0] + ')');
  }
  for (const note of project.notes) console.log('Note: ' + note);
  console.log('Next: bundle your JS, then run xcodegen generate in that directory');
}

function main(argv) {
  const [command, target, ...rest] = argv;
  if (command !== 'generate' || !target) {
    console.error('Usage: nacre generate <project-dir> [--runtime=framework|source] [--runtime-path=<dir>]');
    process.exit(1);
  }
  const options = { runtime: 'framework', runtimePath: null };
  for (const arg of rest) {
    const [key, value] = arg.split('=');
    if (key === '--runtime') options.runtime = value;
    else if (key === '--runtime-path') options.runtimePath = value;
    else fail('unknown option ' + arg);
  }
  if (options.runtime !== 'framework' && options.runtime !== 'source') {
    fail('--runtime must be "framework" or "source"');
  }
  generate(path.resolve(target), options);
}

main(process.argv.slice(2));
