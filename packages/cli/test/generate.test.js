// nacre generate 的用例：工程配置（语言、Info.plist、自定义协议、entitlement、能力包的要求）。
//
//   node --test packages/cli/test/
//
// 每个用例在临时目录里建一个最小的项目，跑一次 CLI，看生成的文件和报错。
// 用 --runtime=source：它只引运行时的工程，不需要先打出 xcframework。
// 这里只核对 CLI 写出来的东西；「Xcode 认不认这份工程」由验收和示例工程每次
// 重新生成来保证。
'use strict';

const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

const CLI = path.resolve(__dirname, '..', 'bin', 'nacre.js');
// 命令去项目的 node_modules 里找 @nacrejs/ios（运行时、启动壳、清单）。每个临时
// 项目都链到仓库里真的那个包，这样用例验的是真的清单和真的启动壳
const IOS_PKG = path.resolve(__dirname, '..', '..', 'ios');
function linkPlatform(dir) {
  const at = path.join(dir, 'node_modules', '@nacrejs', 'ios');
  fs.mkdirSync(path.dirname(at), { recursive: true });
  fs.symlinkSync(IOS_PKG, at, 'dir');
}

/**
 * 建一个项目并生成它的 ios/。
 * @param {object} config nacre.config.json 的内容
 * @param {Record<string, object>} [capabilities] 包名 → 它的 nacre-ios.json
 * @param {Record<string, Record<string, string>>} [files] 包名 → 包里另外要有的文件
 *   （相对路径 → 内容）。随包带的 framework 用它造
 */
function generate(config, capabilities = {}, files = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nacre-cli-test-'));
  linkPlatform(dir);
  fs.writeFileSync(path.join(dir, 'nacre.config.json'), JSON.stringify(config));
  const dependencies = {};
  for (const [name, manifest] of Object.entries(capabilities)) {
    dependencies[name] = '1.0.0';
    const at = path.join(dir, 'node_modules', name);
    fs.mkdirSync(at, { recursive: true });
    fs.writeFileSync(path.join(at, 'nacre-ios.json'), JSON.stringify(manifest));
    for (const [file, content] of Object.entries(files[name] || {})) {
      fs.mkdirSync(path.dirname(path.join(at, file)), { recursive: true });
      fs.writeFileSync(path.join(at, file), content);
    }
  }
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ dependencies }));
  let stdout = '';
  let stderr = '';
  let ok = true;
  try {
    stdout = execFileSync('node', [CLI, 'generate', dir, '--runtime=source'],
                          { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (err) {
    ok = false;
    stdout = String(err.stdout || '');
    stderr = String(err.stderr || '');
  }
  const read = (file) => {
    const at = path.join(dir, 'ios', file);
    return fs.existsSync(at) ? fs.readFileSync(at, 'utf8') : null;
  };
  const exists = (file) => fs.existsSync(path.join(dir, 'ios', file));
  return { ok, stdout, stderr, read, exists, dir, yaml: read('project.yml') || '' };
}

const BASE = { name: 'Shop', bundleId: 'com.example.shop' };
/** 一个假的能力包的清单 */
const capability = (requires) => ({
  capability: 'fake', target: 'NacreFake', xcframework: 'NacreFake.xcframework',
  requires: { runtimeVersion: '0.1.0', ...requires },
});

// ---------------------------------------------------------------- 不写新配置

test('不写 ios：和以前一样，没有本地化目录，没有 entitlement', () => {
  const out = generate(BASE);
  assert.equal(out.ok, true, out.stderr);
  assert.match(out.yaml, /CFBundleDisplayName: "Shop"/);
  assert.doesNotMatch(out.yaml, /developmentLanguage/);
  assert.doesNotMatch(out.yaml, /CFBundleLocalizations/);
  assert.doesNotMatch(out.yaml, /entitlements:/);
  assert.equal(out.read('App/en.lproj/InfoPlist.strings'), null);
});

test('displayName 是字符串：照旧写进 Info.plist', () => {
  const out = generate({ ...BASE, displayName: '小店' });
  assert.equal(out.ok, true, out.stderr);
  assert.match(out.yaml, /CFBundleDisplayName: "小店"/);
});

// ---------------------------------------------------------------- 语言

test('ios.languages：每种语言一个本地化目录，第一个是默认语言', () => {
  const out = generate({ ...BASE, ios: { languages: ['en', 'zh-Hans'] } });
  assert.equal(out.ok, true, out.stderr);
  assert.match(out.yaml, /developmentLanguage: "en"/);
  assert.match(out.yaml, /CFBundleLocalizations: \["en", "zh-Hans"\]/);
  // 目录不能是空的，不然系统不认这种语言：至少放 App 的名字
  assert.equal(out.read('App/en.lproj/InfoPlist.strings'), '"CFBundleDisplayName" = "Shop";\n');
  assert.equal(out.read('App/zh-Hans.lproj/InfoPlist.strings'), '"CFBundleDisplayName" = "Shop";\n');
});

test('displayName 按语言写', () => {
  const out = generate({
    ...BASE,
    displayName: { en: 'Shop', 'zh-Hans': '小店' },
    ios: { languages: ['en', 'zh-Hans'] },
  });
  assert.equal(out.ok, true, out.stderr);
  assert.match(out.yaml, /CFBundleDisplayName: "Shop"/);   // Info.plist 里是默认语言的
  assert.equal(out.read('App/zh-Hans.lproj/InfoPlist.strings'), '"CFBundleDisplayName" = "小店";\n');
});

test('重新生成时去掉了一种语言：它的目录不留', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nacre-cli-test-'));
  linkPlatform(dir);
  fs.writeFileSync(path.join(dir, 'package.json'), '{}');
  const run = (config) => {
    fs.writeFileSync(path.join(dir, 'nacre.config.json'), JSON.stringify(config));
    execFileSync('node', [CLI, 'generate', dir, '--runtime=source'], { stdio: 'ignore' });
  };
  run({ ...BASE, ios: { languages: ['en', 'ja'] } });
  assert.equal(fs.existsSync(path.join(dir, 'ios/App/ja.lproj')), true);
  run({ ...BASE, ios: { languages: ['en'] } });
  assert.equal(fs.existsSync(path.join(dir, 'ios/App/ja.lproj')), false);
  assert.equal(fs.existsSync(path.join(dir, 'ios/App/en.lproj')), true);
});

for (const [what, languages, expected] of [
  ['不是数组', 'en', /ios\.languages/],
  ['空数组', [], /ios\.languages/],
  ['有重复', ['en', 'en'], /ios\.languages.*en/],
  ['不像语言代码', ['english!'], /english!/],
  ['不是字符串', [1], /ios\.languages/],
]) {
  test('ios.languages ' + what + '：报错', () => {
    const out = generate({ ...BASE, ios: { languages } });
    assert.equal(out.ok, false);
    assert.match(out.stderr, expected);
  });
}

// ---------------------------------------------------------------- Info.plist

test('ios.infoPlist 写一句话：各语言都用这一句', () => {
  const out = generate({
    ...BASE,
    ios: { languages: ['en', 'zh-Hans'], infoPlist: { NSCameraUsageDescription: 'Scan codes' } },
  });
  assert.equal(out.ok, true, out.stderr);
  assert.match(out.yaml, /NSCameraUsageDescription: "Scan codes"/);
  // 只有一句，就不往各语言的文件里重复写
  assert.doesNotMatch(out.read('App/zh-Hans.lproj/InfoPlist.strings'), /NSCameraUsageDescription/);
});

test('ios.infoPlist 按语言写：默认语言进 Info.plist，各语言进自己的文件', () => {
  const out = generate({
    ...BASE,
    ios: {
      languages: ['en', 'zh-Hans'],
      infoPlist: {
        NSFaceIDUsageDescription: { en: 'Confirm orders with Face ID', 'zh-Hans': '用面容 ID 确认下单' },
      },
    },
  });
  assert.equal(out.ok, true, out.stderr);
  assert.match(out.yaml, /NSFaceIDUsageDescription: "Confirm orders with Face ID"/);
  assert.match(out.read('App/en.lproj/InfoPlist.strings'),
               /"NSFaceIDUsageDescription" = "Confirm orders with Face ID";/);
  assert.match(out.read('App/zh-Hans.lproj/InfoPlist.strings'),
               /"NSFaceIDUsageDescription" = "用面容 ID 确认下单";/);
});

test('某种语言缺一句：退回默认语言，生成时提示，不算错', () => {
  const out = generate({
    ...BASE,
    ios: {
      languages: ['en', 'zh-Hans', 'ja'],
      infoPlist: { NSFaceIDUsageDescription: { en: 'Confirm orders', 'zh-Hans': '确认下单' } },
    },
  });
  assert.equal(out.ok, true, out.stderr);
  assert.doesNotMatch(out.read('App/ja.lproj/InfoPlist.strings'), /NSFaceIDUsageDescription/);
  assert.match(out.stdout, /NSFaceIDUsageDescription.*ja/);
});

test('文案里的引号、反斜杠、换行要转义', () => {
  const out = generate({
    ...BASE,
    ios: {
      languages: ['en', 'fr'],
      infoPlist: { NSCameraUsageDescription: { en: 'Scan', fr: 'Pour "scanner"\\ici\nsuite' } },
    },
  });
  assert.equal(out.ok, true, out.stderr);
  assert.match(out.read('App/fr.lproj/InfoPlist.strings'),
               /"NSCameraUsageDescription" = "Pour \\"scanner\\"\\\\ici\\nsuite";/);
});

test('不写方向：只允许竖屏', () => {
  const out = generate({ ...BASE });
  assert.equal(out.ok, true, out.stderr);
  assert.match(out.yaml, /UISupportedInterfaceOrientations: .*UIInterfaceOrientationPortrait/);
  assert.doesNotMatch(out.yaml, /UIInterfaceOrientationLandscape/);
});

test('ios.orientations：名字和 JS 里一样，合称拆开写进 Info.plist', () => {
  const out = generate({ ...BASE, ios: { orientations: ['portrait', 'landscape'] } });
  assert.equal(out.ok, true, out.stderr);
  assert.equal(out.yaml.match(/UISupportedInterfaceOrientations/g).length, 1);
  assert.match(out.yaml, /UIInterfaceOrientationPortrait/);
  assert.match(out.yaml, /UIInterfaceOrientationLandscapeLeft/);
  assert.match(out.yaml, /UIInterfaceOrientationLandscapeRight/);
  assert.doesNotMatch(out.yaml, /UpsideDown/);
});

for (const [what, orientations, expected] of [
  ['不是数组', 'portrait', /ios\.orientations must be a list/],
  ['空数组', [], /at least one/],
  ['名字写错', ['sideways'], /"sideways".*portrait.*landscapeRight/s],
]) {
  test('ios.orientations ' + what + '：报错', () => {
    const out = generate({ ...BASE, ios: { orientations } });
    assert.equal(out.ok, false);
    assert.match(out.stderr, expected);
  });
}

test('ios.infoPlist 里写 UISupportedInterfaceOrientations：报错，让改用 ios.orientations', () => {
  const out = generate({ ...BASE, ios: { infoPlist: { UISupportedInterfaceOrientations: ['UIInterfaceOrientationPortrait'] } } });
  assert.equal(out.ok, false);
  assert.match(out.stderr, /ios\.orientations/);
});

test('ios.infoPlist 里不是文案的值原样带过去：数组、布尔、数、字典', () => {
  const out = generate({
    ...BASE,
    ios: {
      infoPlist: {
        LSApplicationQueriesSchemes: ['maps', 'tel'],
        ITSAppUsesNonExemptEncryption: false,
        MyNumber: 3,
        NSAppTransportSecurity: { NSAllowsLocalNetworking: true },
      },
    },
  });
  assert.equal(out.ok, true, out.stderr);
  assert.match(out.yaml, /LSApplicationQueriesSchemes: \["maps", "tel"\]/);
  assert.match(out.yaml, /ITSAppUsesNonExemptEncryption: false/);
  assert.match(out.yaml, /MyNumber: 3/);
  assert.match(out.yaml, /NSAppTransportSecurity: \{"NSAllowsLocalNetworking": true\}/);
});

test('字典的键不是语言：当成普通的字典，不当成按语言的文案', () => {
  const out = generate({
    ...BASE,
    ios: { languages: ['en', 'zh-Hans'], infoPlist: { MyDict: { a: 'x', b: 'y' } } },
  });
  assert.equal(out.ok, true, out.stderr);
  assert.match(out.yaml, /MyDict: \{"a": "x", "b": "y"\}/);
});

for (const [what, config, expected] of [
  ['按语言写了，但没声明 ios.languages',
   { ...BASE, ios: { infoPlist: { NSCameraUsageDescription: { en: 'a', 'zh-Hans': 'b' } } } },
   /MyDict|NSCameraUsageDescription/],
  ['出现了 ios.languages 没列的语言',
   { ...BASE, ios: { languages: ['en', 'zh-Hans'],
                     infoPlist: { NSCameraUsageDescription: { en: 'a', 'zh-CN': 'b' } } } },
   /NSCameraUsageDescription.*zh-CN/],
  ['默认语言的那一句没写',
   { ...BASE, ios: { languages: ['en', 'zh-Hans'],
                     infoPlist: { NSCameraUsageDescription: { 'zh-Hans': '扫码' } } } },
   /NSCameraUsageDescription.*en/],
  ['displayName 出现了没列的语言',
   { ...BASE, displayName: { en: 'Shop', de: 'Laden' }, ios: { languages: ['en'] } },
   /displayName.*de/],
  ['值是 null',
   { ...BASE, ios: { infoPlist: { Something: null } } },
   /Something/],
  ['ios.infoPlist 不是对象',
   { ...BASE, ios: { infoPlist: ['x'] } },
   /ios\.infoPlist/],
]) {
  test('ios.infoPlist ' + what + '：报错', () => {
    const out = generate(config);
    assert.equal(out.ok, false, '应该报错，但生成成功了');
    assert.match(out.stderr, expected);
  });
}

// 这几个键由别的配置项管，写在 ios.infoPlist 里会和它们打架
for (const [key, use] of [
  ['CFBundleIdentifier', /bundleId/],
  ['CFBundleDisplayName', /displayName/],
  ['CFBundleShortVersionString', /version/],
  ['CFBundleVersion', /buildNumber/],
  ['UIApplicationSceneManifest', /UIApplicationSceneManifest/],
  ['CFBundleURLTypes', /ios\.urlSchemes/],
]) {
  test('ios.infoPlist 里写 ' + key + '：报错，指到该用的那一项', () => {
    const out = generate({ ...BASE, ios: { infoPlist: { [key]: 'x' } } });
    assert.equal(out.ok, false);
    assert.match(out.stderr, new RegExp(key));
    assert.match(out.stderr, use);
  });
}

test('name 写成按语言的对象：报错，指到 displayName', () => {
  const out = generate({ name: { en: 'Shop' }, bundleId: 'com.example.shop' });
  assert.equal(out.ok, false);
  assert.match(out.stderr, /displayName/);
});

// ---------------------------------------------------------------- 自定义协议

test('不写 ios.urlSchemes：Info.plist 里没有 CFBundleURLTypes', () => {
  const out = generate(BASE);
  assert.equal(out.ok, true, out.stderr);
  assert.doesNotMatch(out.yaml, /CFBundleURLTypes/);
});

test('ios.urlSchemes：写成 Info.plist 的 CFBundleURLTypes', () => {
  const out = generate({ ...BASE, ios: { urlSchemes: ['myapp'] } });
  assert.equal(out.ok, true, out.stderr);
  assert.match(out.yaml, /CFBundleURLTypes: \[\{.*"CFBundleURLSchemes": \["myapp"\].*\}\]/);
  // 这一组协议的标识用 App 的包名
  assert.match(out.yaml, /CFBundleURLTypes: \[\{.*"CFBundleURLName": "com\.example\.shop".*\}\]/);
});

test('ios.urlSchemes 写两个：都在同一组里，顺序和写的一样', () => {
  const out = generate({ ...BASE, ios: { urlSchemes: ['myapp', 'myapp-dev'] } });
  assert.equal(out.ok, true, out.stderr);
  assert.match(out.yaml, /"CFBundleURLSchemes": \["myapp", "myapp-dev"\]/);
  assert.equal(out.yaml.match(/CFBundleURLName/g).length, 1);
});

test('协议名里可以有数字、加号、减号、点', () => {
  const out = generate({ ...BASE, ios: { urlSchemes: ['com.example.shop', 'a1+b-c'] } });
  assert.equal(out.ok, true, out.stderr);
  assert.match(out.yaml, /"CFBundleURLSchemes": \["com\.example\.shop", "a1\+b-c"\]/);
});

test('ios.urlSchemes 是空数组：等于没写', () => {
  const out = generate({ ...BASE, ios: { urlSchemes: [] } });
  assert.equal(out.ok, true, out.stderr);
  assert.doesNotMatch(out.yaml, /CFBundleURLTypes/);
});

test('ios.urlSchemes 和别的 Info.plist 键一起写：互不影响', () => {
  const out = generate({
    ...BASE,
    ios: { urlSchemes: ['myapp'], infoPlist: { LSApplicationQueriesSchemes: ['maps'] } },
  });
  assert.equal(out.ok, true, out.stderr);
  assert.match(out.yaml, /"CFBundleURLSchemes": \["myapp"\]/);
  assert.match(out.yaml, /LSApplicationQueriesSchemes: \["maps"\]/);
});

for (const [what, urlSchemes, expected] of [
  ['不是数组（写成了一个字符串）', 'myapp', /ios\.urlSchemes/],
  ['不是数组（写成了对象）', { myapp: true }, /ios\.urlSchemes/],
  ['里面不是字符串', ['myapp', 1], /ios\.urlSchemes/],
  ['里面有 null', [null], /ios\.urlSchemes/],
  ['空串', [''], /ios\.urlSchemes/],
  ['数字开头', ['1app'], /ios\.urlSchemes.*"1app"/],
  ['有空格', ['my app'], /ios\.urlSchemes.*"my app"/],
  ['有下划线', ['my_app'], /ios\.urlSchemes.*"my_app"/],
  ['带上了 ://', ['myapp://'], /ios\.urlSchemes.*"myapp:\/\/"/],
  ['写了两次', ['myapp', 'myapp'], /ios\.urlSchemes.*myapp/],
  ['写了两次，只是大小写不同', ['myapp', 'MyApp'], /ios\.urlSchemes.*MyApp/],
  ['系统自己的协议 https', ['https'], /ios\.urlSchemes.*https/],
  ['系统自己的协议 tel', ['myapp', 'tel'], /ios\.urlSchemes.*tel/],
]) {
  test('ios.urlSchemes ' + what + '：报错', () => {
    const out = generate({ ...BASE, ios: { urlSchemes } });
    assert.equal(out.ok, false, '应该报错，但生成成功了');
    assert.match(out.stderr, expected);
  });
}

test('ios.urlSchemes 写错时点名是哪一个', () => {
  const out = generate({ ...BASE, ios: { urlSchemes: ['good', 'bad one', 'fine'] } });
  assert.equal(out.ok, false);
  assert.match(out.stderr, /"bad one"/);
  assert.doesNotMatch(out.stderr, /"good"|"fine"/);
});

// ---------------------------------------------------------------- entitlement

test('ios.entitlements：写进工程', () => {
  const out = generate({
    ...BASE,
    ios: {
      entitlements: {
        'aps-environment': 'development',
        'com.apple.developer.associated-domains': ['applinks:example.com'],
      },
    },
  });
  assert.equal(out.ok, true, out.stderr);
  assert.match(out.yaml, /entitlements:\n\s+path: App\/App\.entitlements/);
  assert.match(out.yaml, /"aps-environment": "development"/);
  assert.match(out.yaml, /"com\.apple\.developer\.associated-domains": \["applinks:example\.com"\]/);
});

test('ios.entitlements 不是对象：报错', () => {
  const out = generate({ ...BASE, ios: { entitlements: 'push' } });
  assert.equal(out.ok, false);
  assert.match(out.stderr, /ios\.entitlements/);
});

// ---------------------------------------------------------------- 能力包的要求

test('能力包要一句权限文案，项目没写：生成时报错，点名是哪个包、哪个键', () => {
  const out = generate(BASE, {
    'fake-auth': capability({ infoPlist: ['NSFaceIDUsageDescription'] }),
  });
  assert.equal(out.ok, false, '应该报错，但生成成功了');
  assert.match(out.stderr, /fake-auth/);
  assert.match(out.stderr, /NSFaceIDUsageDescription/);
  assert.match(out.stderr, /ios\.infoPlist/);
});

test('能力包要的文案写了：通过', () => {
  const out = generate(
    { ...BASE, ios: { infoPlist: { NSFaceIDUsageDescription: 'Confirm orders' } } },
    { 'fake-auth': capability({ infoPlist: ['NSFaceIDUsageDescription'] }) });
  assert.equal(out.ok, true, out.stderr);
  assert.match(out.yaml, /NSFaceIDUsageDescription: "Confirm orders"/);
});

test('能力包要的文案写成了空串：报错', () => {
  const out = generate(
    { ...BASE, ios: { infoPlist: { NSFaceIDUsageDescription: '  ' } } },
    { 'fake-auth': capability({ infoPlist: ['NSFaceIDUsageDescription'] }) });
  assert.equal(out.ok, false);
  assert.match(out.stderr, /NSFaceIDUsageDescription/);
});

test('两个包各要一个键，都没写：一次全报出来', () => {
  const out = generate(BASE, {
    'fake-auth': capability({ infoPlist: ['NSFaceIDUsageDescription'] }),
    'fake-camera': { ...capability({ infoPlist: ['NSCameraUsageDescription'] }),
                     target: 'NacreCam', xcframework: 'NacreCam.xcframework' },
  });
  assert.equal(out.ok, false);
  assert.match(out.stderr, /NSFaceIDUsageDescription/);
  assert.match(out.stderr, /NSCameraUsageDescription/);
});

test('能力包要一条 entitlement，项目没写：报错', () => {
  const out = generate(BASE, {
    'fake-push': capability({ entitlements: ['aps-environment'] }),
  });
  assert.equal(out.ok, false);
  assert.match(out.stderr, /fake-push/);
  assert.match(out.stderr, /aps-environment/);
  assert.match(out.stderr, /ios\.entitlements/);
});

test('能力包要的 entitlement 写了：通过', () => {
  const out = generate(
    { ...BASE, ios: { entitlements: { 'aps-environment': 'development' } } },
    { 'fake-push': capability({ entitlements: ['aps-environment'] }) });
  assert.equal(out.ok, true, out.stderr);
});

test('能力包的 requires.infoPlist 不是字符串数组：报错（包自己写错了）', () => {
  const out = generate(BASE, { 'fake-auth': capability({ infoPlist: 'NSFaceIDUsageDescription' }) });
  assert.equal(out.ok, false);
  assert.match(out.stderr, /fake-auth/);
});

test('什么都不要的能力包（钥匙串那样）：照旧通过', () => {
  const out = generate(BASE, { 'fake-plain': capability({}) });
  assert.equal(out.ok, true, out.stderr);
  assert.match(out.yaml, /NacreRuntime\/NacreFake/);
});

// ---------------------------------------------------------------- 原生模块的包
//
// 第三方的原生模块和我们的能力包是同一种包。清单多认两样：随包带的第三方
// 预编译 framework（要嵌进 App）、要 App 链接的系统框架。

/** 一个动态 framework 的 xcframework 里最少要有的文件 */
const dynamicFramework = (dir, name) => ({
  [dir + '/' + name + '.xcframework/Info.plist']: '<plist/>',
  [dir + '/' + name + '.xcframework/ios-arm64/' + name + '.framework/' + name]: '\xcf\xfa\xed\xfe dynamic',
});

test('vendoredFrameworks：拷进 ios/，嵌进 App 并签名', () => {
  const out = generate(BASE,
    { 'fake-risk': { ...capability({}), vendoredFrameworks: ['vendor/RiskSDK.xcframework'] } },
    { 'fake-risk': dynamicFramework('vendor', 'RiskSDK') });
  assert.equal(out.ok, true, out.stderr);
  assert.match(out.yaml, /- framework: RiskSDK\.xcframework\n\s+embed: true\n\s+codeSign: true/);
  assert.equal(out.exists('RiskSDK.xcframework/ios-arm64/RiskSDK.framework/RiskSDK'), true);
  // 包自己的 framework 照旧
  assert.match(out.yaml, /NacreRuntime\/NacreFake/);
});

test('vendoredFrameworks 可以带几个', () => {
  const out = generate(BASE,
    { 'fake-risk': { ...capability({}),
                     vendoredFrameworks: ['vendor/RiskSDK.xcframework', 'vendor/RiskCore.xcframework'] } },
    { 'fake-risk': { ...dynamicFramework('vendor', 'RiskSDK'), ...dynamicFramework('vendor', 'RiskCore') } });
  assert.equal(out.ok, true, out.stderr);
  assert.match(out.yaml, /- framework: RiskSDK\.xcframework/);
  assert.match(out.yaml, /- framework: RiskCore\.xcframework/);
});

test('卸掉带 framework 的包之后重新生成：它带的 framework 不留在 ios/ 里', () => {
  const first = generate(BASE,
    { 'fake-risk': { ...capability({}), vendoredFrameworks: ['vendor/RiskSDK.xcframework'] } },
    { 'fake-risk': dynamicFramework('vendor', 'RiskSDK') });
  assert.equal(first.exists('RiskSDK.xcframework'), true);
  fs.writeFileSync(path.join(first.dir, 'package.json'), JSON.stringify({ dependencies: {} }));
  execFileSync('node', [CLI, 'generate', first.dir, '--runtime=source'], { stdio: 'ignore' });
  assert.equal(first.exists('RiskSDK.xcframework'), false);
  assert.doesNotMatch(first.read('project.yml'), /RiskSDK/);
});

for (const [what, value, extra, expected] of [
  ['不是数组', 'vendor/RiskSDK.xcframework', dynamicFramework('vendor', 'RiskSDK'), /vendoredFrameworks/],
  ['有一项不是字符串', [1], {}, /vendoredFrameworks/],
  ['有一项是空串', [''], {}, /vendoredFrameworks/],
  ['不是 .xcframework', ['vendor/RiskSDK.framework'],
   { 'vendor/RiskSDK.framework/RiskSDK': 'x' }, /RiskSDK\.framework.*\.xcframework/],
  ['路径不存在', ['vendor/Missing.xcframework'], {}, /Missing\.xcframework/],
  ['路径指到包外面', ['../outside/RiskSDK.xcframework'], {}, /outside\/RiskSDK\.xcframework/],
  ['是绝对路径', ['/tmp/RiskSDK.xcframework'], {}, /\/tmp\/RiskSDK\.xcframework/],
  ['是一个文件不是目录', ['vendor/RiskSDK.xcframework'], { 'vendor/RiskSDK.xcframework': 'x' },
   /RiskSDK\.xcframework/],
  ['里面是静态库（framework 里的二进制是归档）', ['vendor/RiskSDK.xcframework'],
   { 'vendor/RiskSDK.xcframework/ios-arm64/RiskSDK.framework/RiskSDK': '!<arch>\nstatic' },
   /RiskSDK\.xcframework.*(静态|static)/],
  ['里面是静态库（.a）', ['vendor/RiskSDK.xcframework'],
   { 'vendor/RiskSDK.xcframework/ios-arm64/libRiskSDK.a': '!<arch>\nstatic' },
   /RiskSDK\.xcframework.*(静态|static)/],
]) {
  test('vendoredFrameworks ' + what + '：报错，点名是哪个包', () => {
    const out = generate(BASE,
      { 'fake-risk': { ...capability({}), vendoredFrameworks: value } },
      { 'fake-risk': extra });
    assert.equal(out.ok, false, '应该报错，但生成成功了');
    assert.match(out.stderr, /fake-risk/);
    assert.match(out.stderr, expected);
  });
}

test('两个包带了同名的 framework：报错，两个包都点名', () => {
  const out = generate(BASE,
    { 'fake-risk': { ...capability({}), vendoredFrameworks: ['vendor/Shared.xcframework'] },
      'fake-pay': { ...capability({}), target: 'NacrePay', xcframework: 'NacrePay.xcframework',
                    vendoredFrameworks: ['libs/Shared.xcframework'] } },
    { 'fake-risk': dynamicFramework('vendor', 'Shared'), 'fake-pay': dynamicFramework('libs', 'Shared') });
  assert.equal(out.ok, false, '应该报错，但生成成功了');
  assert.match(out.stderr, /Shared\.xcframework/);
  assert.match(out.stderr, /fake-risk/);
  assert.match(out.stderr, /fake-pay/);
});

test('随包带的 framework 和包自己的 framework 同名：报错', () => {
  const out = generate(BASE,
    { 'fake-risk': { ...capability({}), vendoredFrameworks: ['vendor/NacreFake.xcframework'] } },
    { 'fake-risk': dynamicFramework('vendor', 'NacreFake') });
  assert.equal(out.ok, false, '应该报错，但生成成功了');
  assert.match(out.stderr, /fake-risk/);
  assert.match(out.stderr, /NacreFake\.xcframework/);
});

test('systemFrameworks：App 链接这些系统框架和系统库', () => {
  const out = generate(BASE, {
    'fake-risk': { ...capability({}), systemFrameworks: ['CoreTelephony.framework', 'libz.tbd'] },
  });
  assert.equal(out.ok, true, out.stderr);
  assert.match(out.yaml, /- sdk: CoreTelephony\.framework/);
  assert.match(out.yaml, /- sdk: libz\.tbd/);
});

test('两个包要同一个系统框架：只写一次', () => {
  const out = generate(BASE, {
    'fake-risk': { ...capability({}), systemFrameworks: ['CoreTelephony.framework'] },
    'fake-pay': { ...capability({}), target: 'NacrePay', xcframework: 'NacrePay.xcframework',
                  systemFrameworks: ['CoreTelephony.framework', 'AdSupport.framework'] },
  });
  assert.equal(out.ok, true, out.stderr);
  assert.equal(out.yaml.match(/- sdk: CoreTelephony\.framework/g).length, 1);
  assert.match(out.yaml, /- sdk: AdSupport\.framework/);
});

for (const [what, value, expected] of [
  ['不是数组', 'CoreTelephony.framework', /systemFrameworks/],
  ['有一项不是字符串', [1], /systemFrameworks/],
  ['没写后缀', ['CoreTelephony'], /CoreTelephony.*(\.framework|\.tbd)/],
  ['带了路径', ['System/CoreTelephony.framework'], /System\/CoreTelephony\.framework/],
  ['是一个 .xcframework', ['RiskSDK.xcframework'], /RiskSDK\.xcframework.*vendoredFrameworks/],
]) {
  test('systemFrameworks ' + what + '：报错，点名是哪个包', () => {
    const out = generate(BASE, { 'fake-risk': { ...capability({}), systemFrameworks: value } });
    assert.equal(out.ok, false, '应该报错，但生成成功了');
    assert.match(out.stderr, /fake-risk/);
    assert.match(out.stderr, expected);
  });
}

test('两样都没写的包：工程里没有多出来的东西', () => {
  const out = generate(BASE, { 'fake-plain': capability({}) });
  assert.equal(out.ok, true, out.stderr);
  assert.doesNotMatch(out.yaml, /- sdk:/);
  assert.equal((out.yaml.match(/- framework:/g) || []).length, 0);
});

// 第三方的包在运行时的工程里没有 target：引运行时源码时也用它预编译的 framework
test('包没有 target（第三方的包）：引源码时也用它的 xcframework', () => {
  const manifest = { capability: 'risk', xcframework: 'RiskModule.xcframework',
                     requires: { runtimeVersion: '0.1.0' } };
  const out = generate(BASE, { 'fake-risk': manifest },
                       { 'fake-risk': dynamicFramework('.', 'RiskModule') });
  assert.equal(out.ok, true, out.stderr);
  assert.match(out.yaml, /- framework: RiskModule\.xcframework\n\s+embed: true\n\s+codeSign: true/);
  assert.equal(out.exists('RiskModule.xcframework/ios-arm64/RiskModule.framework/RiskModule'), true);
  // 核心还是引源码
  assert.match(out.yaml, /target: NacreRuntime\/Nacre\n/);
});

test('包没有 target，它的 xcframework 也不在包里：报错，点名是哪个包', () => {
  const manifest = { capability: 'risk', xcframework: 'RiskModule.xcframework',
                     requires: { runtimeVersion: '0.1.0' } };
  const out = generate(BASE, { 'fake-risk': manifest });
  assert.equal(out.ok, false, '应该报错，但生成成功了');
  assert.match(out.stderr, /fake-risk/);
  assert.match(out.stderr, /RiskModule\.xcframework/);
});

test('清单没有 xcframework：报错', () => {
  const out = generate(BASE, { 'fake-risk': { capability: 'risk', target: 'NacreRisk' } });
  assert.equal(out.ok, false);
  assert.match(out.stderr, /fake-risk/);
  assert.match(out.stderr, /xcframework/);
});
