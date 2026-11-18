// nacre generate 的用例：启动屏。
//
//   node --test packages/cli/test/
//
// 启动屏是一个底色加一张居中的图，两样各自可有可无：
//   底色  nacre.config.json 最外层的 launchScreen：一个色值，或者 { light, dark }
//   图    项目根目录的 launch.png，按 3 倍图算
// 都没给和以前一样（空白）。另外有一个出口：项目根目录放 launch.storyboard，
// 就整个用它，上面两样不看。
//
// 这里只核对 CLI 写出来的东西。屏幕上的样子是用探针工程量的，见
// docs/internals/capabilities.md 的「启动屏」。
'use strict';

const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const zlib = require('node:zlib');

const CLI = path.resolve(__dirname, '..', 'bin', 'nacre.js');
// 命令去项目的 node_modules 里找 @nacrejs/ios（运行时、启动壳、清单）。每个临时
// 项目都链到仓库里真的那个包，这样用例验的是真的清单和真的启动壳
const IOS_PKG = path.resolve(__dirname, '..', '..', 'ios');
function linkPlatform(dir) {
  const at = path.join(dir, 'node_modules', '@nacrejs', 'ios');
  fs.mkdirSync(path.dirname(at), { recursive: true });
  fs.symlinkSync(IOS_PKG, at, 'dir');
}
const BASE = { name: 'Shop', bundleId: 'com.example.shop' };

/** 一张合法的 PNG：纯黑，指定的宽高 */
function png(width, height) {
  const chunk = (type, data) => {
    const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
    const head = Buffer.alloc(4);
    head.writeUInt32BE(data.length);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(zlib.crc32(body));
    return Buffer.concat([head, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;    // RGBA：logo 是透明底的
  const pixels = zlib.deflateSync(Buffer.alloc(height * (1 + width * 4)));
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', pixels), chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** 只有文件头的 PNG：CLI 只读宽高，量大图的界限时不用真的造几百万个像素 */
function pngHeaderOnly(width, height) {
  const head = Buffer.from(png(1, 1).subarray(0, 33));
  head.writeUInt32BE(width, 16);
  head.writeUInt32BE(height, 20);
  return head;
}

const LOGO = png(360, 360);
const USER_STORYBOARD = '<?xml version="1.0" encoding="UTF-8"?>\n<document type="com.apple.InterfaceBuilder3.CocoaTouch.Storyboard.XIB" launchScreen="YES"><!-- mine --></document>\n';

/**
 * 建一个项目，放上几样东西，生成。
 * @param {object} config 并进 nacre.config.json 的内容
 * @param {(dir: string) => void} [prepare] 生成之前往项目目录里放文件
 */
function generate(config = {}, prepare = () => {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nacre-cli-test-'));
  linkPlatform(dir);
  fs.writeFileSync(path.join(dir, 'nacre.config.json'), JSON.stringify({ ...BASE, ...config }));
  fs.writeFileSync(path.join(dir, 'package.json'), '{}');
  prepare(dir);
  return run(dir);
}

function run(dir) {
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
  const at = (file) => path.join(dir, 'ios', file);
  const exists = (file) => fs.existsSync(at(file));
  const read = (file) => (exists(file) ? fs.readFileSync(at(file)) : null);
  const text = (file) => (exists(file) ? fs.readFileSync(at(file), 'utf8') : null);
  const json = (file) => JSON.parse(text(file));
  const yaml = text('project.yml') || '';
  return { ok, stdout, stderr, exists, read, text, json, yaml, dir };
}

const putLogo = (dir) => fs.writeFileSync(path.join(dir, 'launch.png'), LOGO);
const STORYBOARD = 'App/LaunchScreen.storyboard';
const COLORSET = 'App/Assets.xcassets/LaunchBackground.colorset/Contents.json';
const IMAGESET = 'App/Assets.xcassets/LaunchLogo.imageset';

/** 生成时没有打印任何关于启动屏的话：没给不提示，给了也不提示 */
function assertSilent(out) {
  assert.doesNotMatch(out.stdout + out.stderr, /启动屏|launch/i);
}

/** Info.plist 用 storyboard 当启动屏，不再带那个空的 UILaunchScreen */
function assertUsesStoryboard(out) {
  assert.equal(out.ok, true, out.stderr);
  assert.match(out.yaml, /^\s*UILaunchStoryboardName: "LaunchScreen"$/m);
  assert.doesNotMatch(out.yaml, /UILaunchScreen:/);
  assert.equal(out.exists(STORYBOARD), true);
  assertSilent(out);
}

/** 和以前一样：空的 UILaunchScreen，没有 storyboard，资源目录里没有启动屏的东西 */
function assertBlank(out) {
  assert.equal(out.ok, true, out.stderr);
  assert.match(out.yaml, /^\s*UILaunchScreen: \{\}$/m);
  assert.doesNotMatch(out.yaml, /UILaunchStoryboardName/);
  assert.equal(out.exists(STORYBOARD), false, '不该有 storyboard');
  assert.equal(out.exists('App/Assets.xcassets'), false, '不该有资源目录');
  assertSilent(out);
}

/** 颜色集里的一项：{ red, green, blue }，都是 "0xRR" */
const components = (entry) => {
  const c = entry.color.components;
  return [c.red, c.green, c.blue, c.alpha];
};

// ---------------------------------------------------------------- 四种组合

test('底色和图都没给：和以前一样，空白的启动屏', () => {
  assertBlank(generate());
});

test('只给底色：纯色底，没有图', () => {
  const out = generate({ launchScreen: '#0A84FF' });
  assertUsesStoryboard(out);
  const storyboard = out.text(STORYBOARD);
  assert.match(storyboard, /launchScreen="YES"/);
  assert.match(storyboard, /<color key="backgroundColor" name="LaunchBackground"\/>/);
  assert.doesNotMatch(storyboard, /<imageView/);
  // 底色是资源目录里的一个颜色集：两种外观下是同一个值，所以只有一项
  const colors = out.json(COLORSET).colors;
  assert.equal(colors.length, 1);
  assert.deepEqual(components(colors[0]), ['0x0A', '0x84', '0xFF', '1.000']);
  assert.equal(colors[0].color['color-space'], 'srgb');
  assert.equal(colors[0].appearances, undefined);
  assert.equal(out.exists(IMAGESET), false);
});

test('只给图：系统底色（浅色白、深色黑）上放这张图', () => {
  const out = generate({}, putLogo);
  assertUsesStoryboard(out);
  const storyboard = out.text(STORYBOARD);
  assert.match(storyboard, /<color key="backgroundColor" systemColor="systemBackgroundColor"\/>/);
  assert.doesNotMatch(storyboard, /LaunchBackground/);
  assert.match(storyboard, /<imageView [^>]*image="LaunchLogo"/);
  assert.equal(out.exists(COLORSET), false);
  // 图原样拷过去
  assert.deepEqual(out.read(IMAGESET + '/launch.png'), LOGO);
});

test('底色和图都给：底色上放这张图', () => {
  const out = generate({ launchScreen: '#0A84FF' }, putLogo);
  assertUsesStoryboard(out);
  const storyboard = out.text(STORYBOARD);
  assert.match(storyboard, /<color key="backgroundColor" name="LaunchBackground"\/>/);
  assert.match(storyboard, /<imageView [^>]*image="LaunchLogo"/);
  assert.equal(out.exists(COLORSET), true);
  assert.equal(out.exists(IMAGESET + '/launch.png'), true);
});

// ---------------------------------------------------------------- 底色的两种写法

test('底色按深浅色分：颜色集里两项，第二项是深色外观的', () => {
  const out = generate({ launchScreen: { light: '#FFFFFF', dark: '#101820' } });
  assertUsesStoryboard(out);
  const colors = out.json(COLORSET).colors;
  assert.equal(colors.length, 2);
  assert.deepEqual(components(colors[0]), ['0xFF', '0xFF', '0xFF', '1.000']);
  assert.equal(colors[0].appearances, undefined);
  assert.deepEqual(components(colors[1]), ['0x10', '0x18', '0x20', '1.000']);
  assert.deepEqual(colors[1].appearances, [{ appearance: 'luminosity', value: 'dark' }]);
});

test('色值的三位写法、小写：都认', () => {
  const short = generate({ launchScreen: '#f80' });
  assert.equal(short.ok, true, short.stderr);
  assert.deepEqual(components(short.json(COLORSET).colors[0]), ['0xFF', '0x88', '0x00', '1.000']);
  const lower = generate({ launchScreen: { light: '#0a84ff', dark: '#abc' } });
  assert.equal(lower.ok, true, lower.stderr);
  const colors = lower.json(COLORSET).colors;
  assert.deepEqual(components(colors[0]), ['0x0A', '0x84', '0xFF', '1.000']);
  assert.deepEqual(components(colors[1]), ['0xAA', '0xBB', '0xCC', '1.000']);
});

// ---------------------------------------------------------------- 图

test('launch.png 按 3 倍图算：图片集里只有 3x 这一项，360×360 像素是 120×120 点', () => {
  const out = generate({}, putLogo);
  assert.equal(out.ok, true, out.stderr);
  assert.deepEqual(out.json(IMAGESET + '/Contents.json').images,
                   [{ filename: 'launch.png', idiom: 'universal', scale: '3x' }]);
  assert.match(out.text(STORYBOARD), /<image name="LaunchLogo" width="120" height="120"\/>/);
});

test('图居中，比屏幕大时等比缩到放得下：四条约束加等比缩放', () => {
  const storyboard = generate({}, putLogo).text(STORYBOARD);
  assert.match(storyboard, /<imageView [^>]*contentMode="scaleAspectFit"/);
  for (const [attribute, relation] of [
    ['centerX', null], ['centerY', null], ['width', 'lessThanOrEqual'], ['height', 'lessThanOrEqual'],
  ]) {
    const line = storyboard.split('\n').find((l) =>
      l.includes('<constraint ') && l.includes('firstAttribute="' + attribute + '"'));
    assert.ok(line, '缺 ' + attribute + ' 的约束');
    assert.match(line, new RegExp('secondAttribute="' + attribute + '"'));
    if (relation) assert.match(line, new RegExp('relation="' + relation + '"'));
    else assert.doesNotMatch(line, /relation=/);
  }
});

test('launch.png 的像素数不是 3 的整数倍：照收，点数四舍五入', () => {
  const out = generate({}, (dir) => fs.writeFileSync(path.join(dir, 'launch.png'), png(100, 50)));
  assert.equal(out.ok, true, out.stderr);
  assert.match(out.text(STORYBOARD), /<image name="LaunchLogo" width="33" height="17"\/>/);
});

test('launch.png 正好 400 万像素：照收', () => {
  const out = generate({}, (dir) =>
    fs.writeFileSync(path.join(dir, 'launch.png'), pngHeaderOnly(2000, 2000)));
  assert.equal(out.ok, true, out.stderr);
  assert.equal(out.exists(IMAGESET + '/launch.png'), true);
});

test('launch.png 不当成 JS 的资源拷进 App 包', () => {
  const out = generate({}, putLogo);
  assert.equal(out.exists(IMAGESET + '/launch.png'), true);
  assert.equal(out.exists('JS/launch.png'), false);
  assert.equal(out.exists('JS/assets/launch.png'), false);
});

// ---------------------------------------------------------------- 和图标一起

test('有启动屏、没放图标：资源目录在，图标名仍然是空的', () => {
  const out = generate({ launchScreen: '#0A84FF' }, putLogo);
  assert.equal(out.ok, true, out.stderr);
  assert.equal(out.exists('App/Assets.xcassets/Contents.json'), true);
  // 资源目录里没有 AppIcon 而图标名指着它，编译失败（实测）
  assert.match(out.yaml, /^\s*ASSETCATALOG_COMPILER_APPICON_NAME: ""$/m);
  assert.equal(out.exists('App/Assets.xcassets/AppIcon.appiconset'), false);
});

test('启动屏和 icon.png 都有：同一个资源目录里各是各的', () => {
  const out = generate({ launchScreen: '#0A84FF' }, (dir) => {
    putLogo(dir);
    const icon = pngHeaderOnly(1024, 1024);
    fs.writeFileSync(path.join(dir, 'icon.png'), icon);
  });
  assert.equal(out.ok, true, out.stderr);
  assert.match(out.yaml, /^\s*ASSETCATALOG_COMPILER_APPICON_NAME: "AppIcon"$/m);
  assert.equal(out.exists('App/Assets.xcassets/AppIcon.appiconset/icon.png'), true);
  assert.equal(out.exists(IMAGESET + '/launch.png'), true);
  assert.equal(out.exists(COLORSET), true);
});

// ---------------------------------------------------------------- launch.storyboard

test('launch.storyboard：原样放进工程，启动屏用它', () => {
  const out = generate({}, (dir) =>
    fs.writeFileSync(path.join(dir, 'launch.storyboard'), USER_STORYBOARD));
  assertUsesStoryboard(out);
  assert.equal(out.text(STORYBOARD), USER_STORYBOARD);
  assert.equal(out.exists('App/Assets.xcassets'), false);
});

test('launch.storyboard 和 launch.png、launchScreen 都在：用 launch.storyboard，不报错，不提示', () => {
  const out = generate({ launchScreen: { light: '#FFFFFF', dark: '#000000' } }, (dir) => {
    fs.writeFileSync(path.join(dir, 'launch.storyboard'), USER_STORYBOARD);
    putLogo(dir);
  });
  assertUsesStoryboard(out);
  assert.equal(out.text(STORYBOARD), USER_STORYBOARD);
  // 另外两样不用，也不往工程里放
  assert.equal(out.exists(COLORSET), false);
  assert.equal(out.exists(IMAGESET), false);
});

test('有 launch.storyboard，没用上的 launch.png 有问题：不管它', () => {
  const out = generate({}, (dir) => {
    fs.writeFileSync(path.join(dir, 'launch.storyboard'), USER_STORYBOARD);
    fs.writeFileSync(path.join(dir, 'launch.png'), 'not a png');
  });
  assertUsesStoryboard(out);
  assert.equal(out.text(STORYBOARD), USER_STORYBOARD);
});

test('有 launch.storyboard，launchScreen 写错了：不看它，照用 launch.storyboard', () => {
  const out = generate({ launchScreen: 'blue' }, (dir) =>
    fs.writeFileSync(path.join(dir, 'launch.storyboard'), USER_STORYBOARD));
  assertUsesStoryboard(out);
  assert.equal(out.text(STORYBOARD), USER_STORYBOARD);
  assert.equal(out.exists(COLORSET), false);
});

// ---------------------------------------------------------------- 文件名一个字都不能差

for (const name of ['Launch.png', 'launch.PNG', 'LAUNCH.PNG', 'launch-dark.png', 'launch@3x.png',
                    'launch.jpg', 'splash.png']) {
  test('文件名是 ' + name + '：不认，当作没放', () => {
    assertBlank(generate({}, (dir) => fs.writeFileSync(path.join(dir, name), LOGO)));
  });
}

for (const name of ['Launch.storyboard', 'launch.Storyboard', 'LaunchScreen.storyboard']) {
  test('文件名是 ' + name + '：不认，当作没放', () => {
    assertBlank(generate({}, (dir) => fs.writeFileSync(path.join(dir, name), USER_STORYBOARD)));
  });
}

test('Launch.storyboard 不认，旁边的 launch.png 认', () => {
  const out = generate({}, (dir) => {
    fs.writeFileSync(path.join(dir, 'Launch.storyboard'), USER_STORYBOARD);
    putLogo(dir);
  });
  assertUsesStoryboard(out);
  assert.notEqual(out.text(STORYBOARD), USER_STORYBOARD);
  assert.equal(out.exists(IMAGESET + '/launch.png'), true);
});

test('assets/ 里的 launch.png 不是启动屏的图：它照旧是 JS 的资源', () => {
  const out = generate({}, (dir) => {
    fs.mkdirSync(path.join(dir, 'assets'));
    fs.writeFileSync(path.join(dir, 'assets', 'launch.png'), LOGO);
  });
  assert.equal(out.ok, true, out.stderr);
  assert.match(out.yaml, /^\s*UILaunchScreen: \{\}$/m);
  assert.equal(out.exists(STORYBOARD), false);
  assert.equal(out.exists('JS/assets/launch.png'), true);
});

// ---------------------------------------------------------------- 重新生成

test('拿掉 launch.png 和 launchScreen 之后重新生成：回到空白的启动屏', () => {
  const first = generate({ launchScreen: '#0A84FF' }, putLogo);
  assert.equal(first.exists(STORYBOARD), true);
  fs.rmSync(path.join(first.dir, 'launch.png'));
  fs.writeFileSync(path.join(first.dir, 'nacre.config.json'), JSON.stringify(BASE));
  assertBlank(run(first.dir));
});

test('从 launch.storyboard 换成底色之后重新生成：storyboard 是生成的那一份', () => {
  const first = generate({ launchScreen: '#0A84FF' }, (dir) =>
    fs.writeFileSync(path.join(dir, 'launch.storyboard'), USER_STORYBOARD));
  assert.equal(first.text(STORYBOARD), USER_STORYBOARD);
  fs.rmSync(path.join(first.dir, 'launch.storyboard'));
  const out = run(first.dir);
  assertUsesStoryboard(out);
  assert.match(out.text(STORYBOARD), /name="LaunchBackground"/);
  assert.equal(out.exists(COLORSET), true);
});

// ---------------------------------------------------------------- 写了，但认不出来
//
// launchScreen 认不出来就当没写：不报错，不提示。写错的结果在屏幕上看得到
// （底色是系统默认的），所以生成时不拦（2026-11-18 定）。

for (const [what, launchScreen] of [
  ['是一个数', 255],
  ['是布尔', true],
  ['是数组', ['#FFFFFF', '#000000']],
  ['是 null', null],
  ['是颜色名', 'white'],
  ['没写井号', '0A84FF'],
  ['位数不对', '#0A84F'],
  ['不是十六进制的字符', '#GG00FF'],
  ['是空串', ''],
  ['带了透明度（8 位）', '#0A84FF80'],
  ['带了透明度（4 位）', '#08F8'],
  ['是 rgb() 的写法', 'rgb(10, 132, 255)'],
  ['对象里少了 dark', { light: '#FFFFFF' }],
  ['对象里少了 light', { dark: '#000000' }],
  ['是空对象', {}],
  ['light 不是合法的色值', { light: 'white', dark: '#000000' }],
  ['dark 不是字符串', { light: '#FFFFFF', dark: 0 }],
]) {
  test('launchScreen ' + what + '：当没写，空白的启动屏', () => {
    assertBlank(generate({ launchScreen }));
  });
}

for (const [what, extra] of [
  ['多了不认识的键', { tinted: '#333333' }],
  ['把图也写进来了', { image: 'launch.png' }],
]) {
  test('launchScreen 对象里' + what + '：多出来的不看，light 和 dark 照用', () => {
    const out = generate({ launchScreen: { light: '#FFFFFF', dark: '#101820', ...extra } });
    assertUsesStoryboard(out);
    const colors = out.json(COLORSET).colors;
    assert.equal(colors.length, 2);
    assert.deepEqual(components(colors[0]), ['0xFF', '0xFF', '0xFF', '1.000']);
    assert.deepEqual(components(colors[1]), ['0x10', '0x18', '0x20', '1.000']);
  });
}

test('launchScreen 认不出来、launch.png 是好的：只有图，底色是系统的', () => {
  const out = generate({ launchScreen: 'white' }, putLogo);
  assertUsesStoryboard(out);
  assert.equal(out.exists(COLORSET), false);
  assert.equal(out.exists(IMAGESET), true);
  assert.match(out.text(STORYBOARD), /systemBackgroundColor/);
});

test('launchScreen 写在 ios 下面：不认，当没写', () => {
  assertBlank(generate({ ios: { launchScreen: '#0A84FF' } }));
});

// ---------------------------------------------------------------- 仍然要报的

for (const key of ['UILaunchScreen', 'UILaunchStoryboardName']) {
  test('ios.infoPlist 里写 ' + key + '：报错，指到 launchScreen', () => {
    const out = generate({ ios: { infoPlist: { [key]: 'x' } } });
    assert.equal(out.ok, false, '应该报错，但生成成功了');
    assert.match(out.stderr, new RegExp(key));
    assert.match(out.stderr, /launchScreen/);
  });
}

for (const [what, prepare, expected] of [
  ['launch.png 其实是一张 JPEG',
   (dir) => fs.writeFileSync(path.join(dir, 'launch.png'),
                             Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46])),
   /launch\.png.*PNG/],
  ['launch.png 是一个目录',
   (dir) => fs.mkdirSync(path.join(dir, 'launch.png')),
   /launch\.png.*directory/],
  // 实测：图大到一定程度（576 万像素还行，676 万不行）整个启动屏变成黑的
  ['launch.png 超过 400 万像素（2001×2000）',
   (dir) => fs.writeFileSync(path.join(dir, 'launch.png'), pngHeaderOnly(2001, 2000)),
   /launch\.png.*2001×2000.*4000000 pixels/],
  ['launch.png 超过 400 万像素（又窄又长）',
   (dir) => fs.writeFileSync(path.join(dir, 'launch.png'), pngHeaderOnly(900, 4500)),
   /launch\.png.*900×4500.*4000000 pixels/],
  ['launch.storyboard 是一个目录',
   (dir) => fs.mkdirSync(path.join(dir, 'launch.storyboard')),
   /launch\.storyboard.*directory/],
]) {
  test(what + '：报错，点名是哪个文件、哪里不对', () => {
    const out = generate({}, prepare);
    assert.equal(out.ok, false, '应该报错，但生成成功了');
    assert.match(out.stderr, /^nacre: /);
    assert.match(out.stderr, expected);
    assert.equal(fs.existsSync(path.join(out.dir, 'ios')), false, '报错时不该已经写了 ios/');
  });
}
