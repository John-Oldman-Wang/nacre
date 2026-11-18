// nacre generate 的用例：App 图标。
//
//   node --test packages/cli/test/
//
// 图标用约定的文件名，不写进 nacre.config.json：项目根目录的 icon.icon
// （Icon Composer 的图标文件，一个目录）或者 icon.png（一张 1024×1024 的图）。
// 两个都有用 icon.icon。没放就不带图标，不报错、不提示，也没有默认图标。
//
// 这里只核对 CLI 写出来的东西。「Xcode 认不认这份工程」是用探针工程量过的，
// 见 docs/internals/capabilities.md 的「App 图标」。
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
const TEMPLATE = path.join(IOS_PKG, 'template');
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
  ihdr[8] = 8;    // 每个通道 8 位
  ihdr[9] = 2;    // RGB
  // 每行开头一个过滤方式的字节，后面是像素
  const pixels = zlib.deflateSync(Buffer.alloc(height * (1 + width * 3)));
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', pixels), chunk('IEND', Buffer.alloc(0)),
  ]);
}

const GOOD_PNG = png(1024, 1024);
const ICON_JSON = JSON.stringify({ groups: [{ layers: [{ 'image-name': 'glyph.png', name: 'glyph' }] }] });

/** 在项目根目录放一个 Icon Composer 的图标文件（它是一个目录） */
function writeIconDocument(dir, name = 'icon.icon') {
  fs.mkdirSync(path.join(dir, name, 'Assets'), { recursive: true });
  fs.writeFileSync(path.join(dir, name, 'icon.json'), ICON_JSON);
  fs.writeFileSync(path.join(dir, name, 'Assets', 'glyph.png'), png(8, 8));
}

/** 建一个空项目，返回它的目录 */
function project() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nacre-cli-test-'));
  linkPlatform(dir);
  fs.writeFileSync(path.join(dir, 'nacre.config.json'), JSON.stringify(BASE));
  fs.writeFileSync(path.join(dir, 'package.json'), '{}');
  return dir;
}

/** 在一个项目目录上跑一次生成 */
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
  const yaml = exists('project.yml') ? fs.readFileSync(at('project.yml'), 'utf8') : '';
  return { ok, stdout, stderr, exists, read, yaml, dir };
}

/**
 * 建一个项目，放上几样东西，生成。
 * @param {(dir: string) => void} [prepare] 生成之前往项目目录里放文件
 */
function generate(prepare = () => {}) {
  const dir = project();
  prepare(dir);
  return run(dir);
}

/** 图标名的编译设置：一行，值是带引号的字符串 */
const iconSetting = (yaml) => {
  const found = yaml.match(/^\s*ASSETCATALOG_COMPILER_APPICON_NAME: (.*)$/m);
  return found ? found[1] : null;
};

/** 生成时没有打印任何关于图标的话：没放不提示，放了也不提示 */
function assertSilent(out) {
  assert.doesNotMatch(out.stdout + out.stderr, /图标|icon/i);
}

/** 生成的工程里一张图标都没有，也没有为此说什么 */
function assertNoIcon(out) {
  assert.equal(out.ok, true, out.stderr);
  assert.equal(out.exists('App/Assets.xcassets'), false, '不该有资源目录');
  assert.equal(out.exists('App/AppIcon.icon'), false, '不该有 .icon');
  // XcodeGen 给 App 默认的图标名是 AppIcon，资源里没有它时编译失败（实测）。
  // 不带图标时要明确写成空的
  assert.equal(iconSetting(out.yaml), '""');
  assertSilent(out);
}

// ---------------------------------------------------------------- 没放图标

test('没放图标：工程里没有图标，图标名是空的', () => {
  assertNoIcon(generate());
});

test('模板里没有默认图标', () => {
  assert.equal(fs.existsSync(path.join(TEMPLATE, 'App', 'Assets.xcassets')), false);
  const leftovers = fs.readdirSync(path.join(TEMPLATE, 'App'), { recursive: true })
    .filter((file) => /\.(png|icon|appiconset)$/.test(String(file)));
  assert.deepEqual(leftovers, []);
});

// ---------------------------------------------------------------- icon.png

test('icon.png：编进工程的资源目录，图标名是 AppIcon', () => {
  const out = generate((dir) => fs.writeFileSync(path.join(dir, 'icon.png'), GOOD_PNG));
  assert.equal(out.ok, true, out.stderr);
  assert.equal(iconSetting(out.yaml), '"AppIcon"');
  // 图原样拷过去，一个字节都不动
  assert.deepEqual(out.read('App/Assets.xcassets/AppIcon.appiconset/icon.png'), GOOD_PNG);
  assert.equal(out.exists('App/Assets.xcassets/Contents.json'), true);
  assert.equal(out.exists('App/AppIcon.icon'), false);
  // 它是工程的图标，不是 JS 的资源：不拷进 App 包的 JS/ 目录
  assert.equal(out.exists('JS/icon.png'), false);
  assert.equal(out.exists('JS/assets/icon.png'), false);
  assertSilent(out);
});

test('icon.png：图标集里只有这一张，不分外观', () => {
  const out = generate((dir) => fs.writeFileSync(path.join(dir, 'icon.png'), GOOD_PNG));
  const contents = JSON.parse(out.read('App/Assets.xcassets/AppIcon.appiconset/Contents.json'));
  assert.deepEqual(contents.images, [
    { filename: 'icon.png', idiom: 'universal', platform: 'ios', size: '1024x1024' },
  ]);
});

test('icon.png 带 alpha 通道：照收（编译通过，实测）', () => {
  const withAlpha = Buffer.from(GOOD_PNG);
  withAlpha[25] = 6;   // IHDR 里的颜色类型改成 RGBA。CLI 只看宽高，不验校验和
  const out = generate((dir) => fs.writeFileSync(path.join(dir, 'icon.png'), withAlpha));
  assert.equal(out.ok, true, out.stderr);
  assert.equal(iconSetting(out.yaml), '"AppIcon"');
});

// ---------------------------------------------------------------- icon.icon

test('icon.icon：整个拷进工程，改名成 AppIcon.icon，图标名是 AppIcon', () => {
  const out = generate((dir) => writeIconDocument(dir));
  assert.equal(out.ok, true, out.stderr);
  assert.equal(iconSetting(out.yaml), '"AppIcon"');
  assert.equal(String(out.read('App/AppIcon.icon/icon.json')), ICON_JSON);
  assert.deepEqual(out.read('App/AppIcon.icon/Assets/glyph.png'), png(8, 8));
  // 不另外造资源目录
  assert.equal(out.exists('App/Assets.xcassets'), false);
  assertSilent(out);
});

// ---------------------------------------------------------------- 两个都有

test('icon.icon 和 icon.png 都有：用 icon.icon，不报错，不提示', () => {
  const out = generate((dir) => {
    writeIconDocument(dir);
    fs.writeFileSync(path.join(dir, 'icon.png'), GOOD_PNG);
  });
  assert.equal(out.ok, true, out.stderr);
  assert.equal(out.exists('App/AppIcon.icon/icon.json'), true);
  assert.equal(out.exists('App/Assets.xcassets'), false);
  assert.equal(iconSetting(out.yaml), '"AppIcon"');
  assertSilent(out);
});

test('两个都有，没用上的 icon.png 有问题：不管它', () => {
  const out = generate((dir) => {
    writeIconDocument(dir);
    fs.writeFileSync(path.join(dir, 'icon.png'), png(512, 512));
  });
  assert.equal(out.ok, true, out.stderr);
  assert.equal(out.exists('App/AppIcon.icon/icon.json'), true);
});

// ---------------------------------------------------------------- 文件名一个字都不能差
//
// macOS 的文件系统默认不分大小写：问「icon.png 在不在」时，Icon.png 也会答在。
// 所以这几条在 macOS 上是真的会挂的。

for (const name of ['Icon.png', 'ICON.PNG', 'icon.PNG', 'icon.Png']) {
  test('文件名是 ' + name + '（大小写不对）：不认，当作没放', () => {
    assertNoIcon(generate((dir) => fs.writeFileSync(path.join(dir, name), GOOD_PNG)));
  });
}

for (const name of ['Icon.icon', 'icon.Icon', 'ICON.ICON']) {
  test('文件名是 ' + name + '（大小写不对）：不认，当作没放', () => {
    assertNoIcon(generate((dir) => writeIconDocument(dir, name)));
  });
}

test('Icon.icon 不认，旁边的 icon.png 认', () => {
  const out = generate((dir) => {
    writeIconDocument(dir, 'Icon.icon');
    fs.writeFileSync(path.join(dir, 'icon.png'), GOOD_PNG);
  });
  assert.equal(out.ok, true, out.stderr);
  assert.equal(out.exists('App/AppIcon.icon'), false);
  assert.equal(out.exists('App/Assets.xcassets/AppIcon.appiconset/icon.png'), true);
});

for (const name of ['icon-dark.png', 'icon-tinted.png', 'favicon.png', 'AppIcon.png',
                    'icon.jpg', 'icon.png.bak', 'app.icon']) {
  test('别的名字 ' + name + '：不认', () => {
    assertNoIcon(generate((dir) => fs.writeFileSync(path.join(dir, name), GOOD_PNG)));
  });
}

test('assets/ 里的 icon.png 不是 App 图标：它照旧是 JS 的资源', () => {
  const out = generate((dir) => {
    fs.mkdirSync(path.join(dir, 'assets'));
    fs.writeFileSync(path.join(dir, 'assets', 'icon.png'), GOOD_PNG);
  });
  assertNoIcon(out);
  assert.equal(out.exists('JS/assets/icon.png'), true);
});

test('icon.png 旁边还有 icon-dark.png：只用 icon.png，图标集里还是一张', () => {
  const out = generate((dir) => {
    fs.writeFileSync(path.join(dir, 'icon.png'), GOOD_PNG);
    fs.writeFileSync(path.join(dir, 'icon-dark.png'), GOOD_PNG);
    fs.writeFileSync(path.join(dir, 'icon-tinted.png'), GOOD_PNG);
  });
  assert.equal(out.ok, true, out.stderr);
  const set = 'App/Assets.xcassets/AppIcon.appiconset';
  assert.equal(JSON.parse(out.read(set + '/Contents.json')).images.length, 1);
  assert.deepEqual(fs.readdirSync(path.join(out.dir, 'ios', set)).sort(), ['Contents.json', 'icon.png']);
});

// ---------------------------------------------------------------- 重新生成

test('拿掉 icon.png 之后重新生成：工程里不留图标', () => {
  const dir = project();
  fs.writeFileSync(path.join(dir, 'icon.png'), GOOD_PNG);
  assert.equal(run(dir).exists('App/Assets.xcassets/AppIcon.appiconset/icon.png'), true);
  fs.rmSync(path.join(dir, 'icon.png'));
  assertNoIcon(run(dir));
});

test('从 icon.png 换成 icon.icon 之后重新生成：只留 .icon', () => {
  const dir = project();
  fs.writeFileSync(path.join(dir, 'icon.png'), GOOD_PNG);
  run(dir);
  fs.rmSync(path.join(dir, 'icon.png'));
  writeIconDocument(dir);
  const out = run(dir);
  assert.equal(out.ok, true, out.stderr);
  assert.equal(out.exists('App/AppIcon.icon/icon.json'), true);
  assert.equal(out.exists('App/Assets.xcassets'), false);
});

test('从 icon.icon 换成 icon.png 之后重新生成：只留资源目录里的那一张', () => {
  const dir = project();
  writeIconDocument(dir);
  run(dir);
  fs.rmSync(path.join(dir, 'icon.icon'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'icon.png'), GOOD_PNG);
  const out = run(dir);
  assert.equal(out.ok, true, out.stderr);
  assert.equal(out.exists('App/AppIcon.icon'), false);
  assert.equal(out.exists('App/Assets.xcassets/AppIcon.appiconset/icon.png'), true);
});

// ---------------------------------------------------------------- 放了，但文件有问题
//
// 「没放」不报错；「放了但不能用」要报——不拦的话，尺寸不对的图编译时报的
// 是一句看不出原因的话，写成普通文件的 icon.icon 则是编译通过、悄悄没有图标
// （都是实测）。

for (const [what, prepare, expected] of [
  ['icon.png 是 512×512',
   (dir) => fs.writeFileSync(path.join(dir, 'icon.png'), png(512, 512)),
   /icon\.png.*512×512.*1024×1024/],
  ['icon.png 是 2048×2048',
   (dir) => fs.writeFileSync(path.join(dir, 'icon.png'), png(2048, 2048)),
   /icon\.png.*2048×2048.*1024×1024/],
  ['icon.png 不是正方形（1024×512）',
   (dir) => fs.writeFileSync(path.join(dir, 'icon.png'), png(1024, 512)),
   /icon\.png.*1024×512.*1024×1024/],
  ['icon.png 其实是一张 JPEG',
   (dir) => fs.writeFileSync(path.join(dir, 'icon.png'),
                             Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46])),
   /icon\.png.*PNG/],
  ['icon.png 是空文件',
   (dir) => fs.writeFileSync(path.join(dir, 'icon.png'), ''),
   /icon\.png.*PNG/],
  ['icon.png 是一个目录',
   (dir) => fs.mkdirSync(path.join(dir, 'icon.png')),
   /icon\.png.*directory/],
  ['icon.icon 是一个普通文件',
   (dir) => fs.writeFileSync(path.join(dir, 'icon.icon'), GOOD_PNG),
   /icon\.icon.*directory/],
  ['icon.icon 里没有 icon.json',
   (dir) => fs.mkdirSync(path.join(dir, 'icon.icon', 'Assets'), { recursive: true }),
   /icon\.icon.*icon\.json/],
  ['两个都有，用上的 icon.icon 有问题',
   (dir) => {
     fs.writeFileSync(path.join(dir, 'icon.icon'), 'x');
     fs.writeFileSync(path.join(dir, 'icon.png'), GOOD_PNG);
   },
   /icon\.icon/],
]) {
  test(what + '：报错，点名是哪个文件、哪里不对', () => {
    const out = generate(prepare);
    assert.equal(out.ok, false, '应该报错，但生成成功了');
    assert.match(out.stderr, /^nacre: /);
    assert.match(out.stderr, expected);
    // 在动任何文件之前停下
    assert.equal(fs.existsSync(path.join(out.dir, 'ios')), false, '报错时不该已经写了 ios/');
  });
}
