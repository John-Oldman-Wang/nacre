// 命令行工具从 @nacrejs/ios 里拆出来之后的用例：它是单独的包 @nacrejs/cli，
// 命令叫 nacre；运行时、启动壳、清单在项目自己装的 @nacrejs/ios 里，它去那里找。
//
//   node --test packages/cli/test/
//
// 每个用例在临时目录里建一个最小的项目，往它的 node_modules 里放一个
// @nacrejs/ios（假的或者指向仓库里真的那个），跑一次命令，看生成的文件和报错。
'use strict';

const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

const CLI_PKG = path.resolve(__dirname, '..');
const CLI = path.join(CLI_PKG, 'bin', 'nacre.js');
const REPO = path.resolve(CLI_PKG, '..', '..');
const REAL_IOS = path.join(REPO, 'packages', 'ios');
const RUNTIME_SOURCE = path.join(REPO, 'ios');
const realManifest = () =>
  JSON.parse(fs.readFileSync(path.join(REAL_IOS, 'nacre-ios.json'), 'utf8'));

const HAN = /\p{Script=Han}/u;

/** 跑一次命令 */
function run(args) {
  const out = spawnSync('node', [CLI, ...args], { encoding: 'utf8' });
  return { status: out.status, stdout: out.stdout || '', stderr: out.stderr || '' };
}

/**
 * 建一个项目。
 * @param {null | 'real' | { manifest?: object, files?: Record<string, string> }} ios
 *   null：不装 @nacrejs/ios；'real'：链到仓库里真的那个包；
 *   对象：造一个假的包——manifest 盖在真清单上，files 是包里另外要有的文件
 */
function project(ios) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nacre-cli-test-'));
  fs.writeFileSync(path.join(dir, 'nacre.config.json'),
                   JSON.stringify({ name: 'Shop', bundleId: 'com.example.shop' }));
  const dependencies = {};
  if (ios !== null) {
    dependencies['@nacrejs/ios'] = '1.0.0';
    const at = path.join(dir, 'node_modules', '@nacrejs', 'ios');
    fs.mkdirSync(path.dirname(at), { recursive: true });
    if (ios === 'real') {
      fs.symlinkSync(REAL_IOS, at, 'dir');
    } else {
      fs.mkdirSync(at, { recursive: true });
      const manifest = { ...realManifest(), ...(ios.manifest || {}) };
      for (const key of Object.keys(manifest)) {
        if (manifest[key] === undefined) delete manifest[key];
      }
      fs.writeFileSync(path.join(at, 'nacre-ios.json'), JSON.stringify(manifest));
      const files = { 'template/App/AppDelegate.swift': '// fake shell\n', ...(ios.files || {}) };
      for (const [file, content] of Object.entries(files)) {
        fs.mkdirSync(path.dirname(path.join(at, file)), { recursive: true });
        fs.writeFileSync(path.join(at, file), content);
      }
    }
  }
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ dependencies }));
  return dir;
}

const source = (dir) => run(['generate', dir, '--runtime=source', '--runtime-path=' + RUNTIME_SOURCE]);
const generated = (dir) => fs.existsSync(path.join(dir, 'ios'));

// ---------------------------------------------------------------- 两个包各有什么

test('@nacrejs/cli 提供 nacre 这个命令', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(CLI_PKG, 'package.json'), 'utf8'));
  assert.equal(pkg.name, '@nacrejs/cli');
  assert.deepEqual(pkg.bin, { nacre: './bin/nacre.js' });
});

test('@nacrejs/ios 不再有命令，也不再带用例', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(REAL_IOS, 'package.json'), 'utf8'));
  assert.equal(pkg.bin, undefined);
  assert.equal(fs.existsSync(path.join(REAL_IOS, 'bin')), false);
  assert.equal(fs.existsSync(path.join(REAL_IOS, 'test')), false);
});

test('@nacrejs/ios 的清单带着格式版本 1', () => {
  assert.equal(realManifest().manifestVersion, 1);
});

// ---------------------------------------------------------------- 找 @nacrejs/ios

test('装了真的 @nacrejs/ios：生成成功', () => {
  const dir = project('real');
  const out = source(dir);
  assert.equal(out.status, 0, out.stderr);
  assert.equal(fs.existsSync(path.join(dir, 'ios', 'project.yml')), true);
  assert.equal(fs.existsSync(path.join(dir, 'ios', 'App', 'AppDelegate.swift')), true);
});

test('没装 @nacrejs/ios：报错说要装它，什么都不写', () => {
  const dir = project(null);
  const out = source(dir);
  assert.equal(out.status, 1);
  assert.match(out.stderr, /@nacrejs\/ios is not installed/);
  assert.match(out.stderr, /npm install @nacrejs\/ios/);
  assert.equal(generated(dir), false);
});

test('启动壳从项目装的 @nacrejs/ios 里来，不是从命令自己的包里来', () => {
  const dir = project({ files: { 'template/App/Marker.swift': '// from the installed package\n' } });
  const out = source(dir);
  assert.equal(out.status, 0, out.stderr);
  assert.equal(fs.readFileSync(path.join(dir, 'ios', 'App', 'Marker.swift'), 'utf8'),
               '// from the installed package\n');
});

test('清单也从项目装的 @nacrejs/ios 里来', () => {
  // 部署目标换一个真清单里没有的值，它出现在生成的工程里才算读的是这一份
  const dir = project({ manifest: { deploymentTarget: '99.0' } });
  const out = source(dir);
  assert.equal(out.status, 0, out.stderr);
  assert.match(fs.readFileSync(path.join(dir, 'ios', 'project.yml'), 'utf8'), /iOS: "99\.0"/);
});

test('framework 方式：运行时从项目装的 @nacrejs/ios 里拷进 ios/', () => {
  const dir = project({ files: { 'Nacre.xcframework/Info.plist': '<plist/>\n' } });
  const out = run(['generate', dir]);
  assert.equal(out.status, 0, out.stderr);
  assert.equal(fs.readFileSync(path.join(dir, 'ios', 'Nacre.xcframework', 'Info.plist'), 'utf8'),
               '<plist/>\n');
});

test('framework 方式、包里没有运行时：报错说这个包不完整，不提仓库里的脚本', () => {
  const dir = project({});
  const out = run(['generate', dir]);
  assert.equal(out.status, 1);
  assert.match(out.stderr, /@nacrejs\/ios/);
  assert.match(out.stderr, /Nacre\.xcframework/);
  assert.match(out.stderr, /is missing/);
  assert.doesNotMatch(out.stderr, /build-xcframework\.sh/);
});

// ---------------------------------------------------------------- 清单的格式版本

test('清单的格式版本这个命令不认识：报错说要升级 @nacrejs/cli，什么都不写', () => {
  const dir = project({ manifest: { manifestVersion: 2 } });
  const out = source(dir);
  assert.equal(out.status, 1);
  assert.match(out.stderr, /manifest version 2/);
  assert.match(out.stderr, /@nacrejs\/cli/);
  assert.equal(generated(dir), false);
});

test('清单没有格式版本：同样拒绝', () => {
  const dir = project({ manifest: { manifestVersion: undefined } });
  const out = source(dir);
  assert.equal(out.status, 1);
  assert.match(out.stderr, /manifest version/);
  assert.equal(generated(dir), false);
});

// ---------------------------------------------------------------- 用法和语言

test('不带参数：打出用法，命令叫 nacre', () => {
  const out = run([]);
  assert.equal(out.status, 1);
  assert.match(out.stderr, /Usage: nacre generate <project-dir>/);
});

test('不认识的选项：报错', () => {
  const dir = project('real');
  const out = run(['generate', dir, '--nope']);
  assert.equal(out.status, 1);
  assert.match(out.stderr, /unknown option --nope/);
});

test('--runtime 写错：报错', () => {
  const dir = project('real');
  const out = run(['generate', dir, '--runtime=binary']);
  assert.equal(out.status, 1);
  assert.match(out.stderr, /--runtime must be "framework" or "source"/);
});

test('报错的前缀是命令的名字 nacre', () => {
  const out = source(project(null));
  assert.match(out.stderr, /^nacre: /);
});

test('成功时的输出是英文的', () => {
  const out = source(project('real'));
  assert.equal(out.status, 0, out.stderr);
  assert.match(out.stdout, /Generated /);
  assert.doesNotMatch(out.stdout, HAN);
});

test('生成的文件里，命令自己写的注释是英文的', () => {
  const dir = project('real');
  assert.equal(source(dir).status, 0);
  for (const file of ['project.yml', '.gitignore']) {
    assert.doesNotMatch(fs.readFileSync(path.join(dir, 'ios', file), 'utf8'), HAN, file);
  }
});

test('命令的源码里，给用户看的字符串没有中文', () => {
  // 注释可以是中文（规矩是：暴露出去的用英文，注释用中文），所以先把注释去掉。
  // 两种注释都只出现在行首或者代码之后，源码里没有带 // 的字符串字面量以外的写法
  const code = fs.readFileSync(CLI, 'utf8')
    .split('\n')
    .filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line))
    .map((line) => line.replace(/\s\/\/ .*$/, ''))
    .join('\n');
  const hits = code.split('\n').filter((line) => HAN.test(line));
  assert.deepEqual(hits, []);
});
