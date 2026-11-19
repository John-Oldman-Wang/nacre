// scripts/release.mjs 的用例：只测不碰网络、不碰 npm 的那部分——版本怎么换算、
// 发布的顺序、一个包「齐不齐」怎么判。
//
//   node --test scripts/test/*.test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import {
  checkPackage, frameworkVersion, pendingPackages, publishOrder, setVersion, tagFor,
} from '../release.mjs';

const LICENSE = 'the license text\n';

/**
 * 在临时目录里搭一个小仓库：根目录的许可，加上给的几个包。
 * @param {Record<string, { pkg: object, files?: Record<string, string> }>} packages 目录名 → 内容
 */
function repo(packages) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nacre-release-test-'));
  fs.writeFileSync(path.join(root, 'LICENSE.md'), LICENSE);
  fs.mkdirSync(path.join(root, 'ios'), { recursive: true });
  fs.writeFileSync(path.join(root, 'ios', 'project.yml'),
                   'a:\n        MARKETING_VERSION: "0.1.0"\n        NACRE_VERSION: "0.1.0"\nb:\n        MARKETING_VERSION: "0.1.0"\n');
  for (const [dir, { pkg, files = {} }] of Object.entries(packages)) {
    const at = path.join(root, 'packages', dir);
    fs.mkdirSync(at, { recursive: true });
    fs.writeFileSync(path.join(at, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');
    for (const [file, content] of Object.entries(files)) {
      fs.mkdirSync(path.dirname(path.join(at, file)), { recursive: true });
      fs.writeFileSync(path.join(at, file), content);
    }
  }
  return root;
}

/** 一个齐全的包 */
const good = (name, dir, extra = {}) => ({
  pkg: {
    name, version: '0.0.1', license: 'FSL-1.1-MIT',
    repository: { type: 'git', url: 'git+https://example.com/x.git', directory: 'packages/' + dir },
    files: ['index.d.ts'],
    publishConfig: { access: 'public', registry: 'https://registry.npmjs.org/' }, ...extra,
  },
  files: { 'index.d.ts': 'export {};\n', 'LICENSE.md': LICENSE, 'README.md': '# x\n' },
});

// ---------------------------------------------------------------- 版本的换算

test('通道：正式版是 latest，带后缀的用后缀的名字', () => {
  assert.equal(tagFor('0.0.1'), 'latest');
  assert.equal(tagFor('0.0.1-beta.1'), 'beta');
  assert.equal(tagFor('1.2.3-rc.0'), 'rc');
});

test('通道：不像版本号的拒绝', () => {
  assert.throws(() => tagFor('beta'), /版本号/);
  assert.throws(() => tagFor('0.0.1-'), /版本号/);
});

test('框架里写的版本号：去掉后缀，只留三段数字', () => {
  assert.equal(frameworkVersion('0.0.1-beta.1'), '0.0.1');
  assert.equal(frameworkVersion('1.2.3'), '1.2.3');
});

// ---------------------------------------------------------------- 发布的顺序

test('发布的顺序：类型、运行时、命令在前，能力包按名字排，不发的不在里面', () => {
  const root = repo({
    photos: good('@nacrejs/photos', 'photos'),
    cli: good('@nacrejs/cli', 'cli'),
    'example-module': { pkg: { name: '@nacrejs/example-module', version: '0.0.1', private: true } },
    ios: good('@nacrejs/ios', 'ios'),
    camera: good('@nacrejs/camera', 'camera'),
    types: good('@nacrejs/types', 'types'),
  });
  assert.deepEqual(publishOrder(root).map((p) => p.name),
                   ['@nacrejs/types', '@nacrejs/ios', '@nacrejs/cli', '@nacrejs/camera', '@nacrejs/photos']);
});

// ---------------------------------------------------------------- 一个包齐不齐

test('齐全的包：没有问题', () => {
  const root = repo({ types: good('@nacrejs/types', 'types') });
  assert.deepEqual(checkPackage(root, 'types', '0.0.1'), []);
});

for (const [what, change, expected] of [
  ['标着 private', (p) => { p.pkg.private = true; }, /private/],
  ['版本和别的包不一样', (p) => { p.pkg.version = '0.0.2'; }, /版本是 0\.0\.2/],
  ['许可不是 FSL-1.1-MIT', (p) => { p.pkg.license = 'MIT'; }, /license/],
  ['没写公开发布', (p) => { delete p.pkg.publishConfig.access; }, /publishConfig\.access/],
  ['没写发到官方的仓库', (p) => { delete p.pkg.publishConfig.registry; }, /publishConfig\.registry/],
  ['写的是镜像的地址', (p) => { p.pkg.publishConfig.registry = 'https://registry.npmmirror.com/'; },
   /publishConfig\.registry/],
  ['没限定打包的文件', (p) => { delete p.pkg.files; }, /files/],
  ['仓库里的目录写错了', (p) => { p.pkg.repository.directory = 'packages/other'; }, /repository/],
  ['files 里列的文件不存在', (p) => { p.pkg.files.push('Missing.xcframework'); }, /Missing\.xcframework/],
  ['没有许可文件', (p) => { delete p.files['LICENSE.md']; }, /LICENSE\.md/],
  ['许可文件和根目录的不一样', (p) => { p.files['LICENSE.md'] = 'edited\n'; }, /LICENSE\.md.*不一样/],
  ['没有说明', (p) => { delete p.files['README.md']; }, /README\.md/],
  ['依赖别的 Nacre 包但版本没写死', (p) => { p.pkg.peerDependencies = { '@nacrejs/types': '*' }; },
   /@nacrejs\/types.*0\.0\.1/],
]) {
  test('不齐：' + what, () => {
    const one = good('@nacrejs/types', 'types');
    change(one);
    const root = repo({ types: one });
    const problems = checkPackage(root, 'types', '0.0.1');
    assert.equal(problems.length, 1, JSON.stringify(problems));
    assert.match(problems[0], expected);
  });
}

test('依赖别的 Nacre 包、版本写死成同一个：没有问题', () => {
  const one = good('@nacrejs/camera', 'camera',
                   { peerDependencies: { '@nacrejs/ios': '0.0.1', '@nacrejs/types': '0.0.1' } });
  assert.deepEqual(checkPackage(repo({ camera: one }), 'camera', '0.0.1'), []);
});

test('不发布的包：只要求它标着 private', () => {
  const root = repo({ 'example-module': { pkg: { name: '@nacrejs/example-module', version: '9.9.9', private: true } } });
  assert.deepEqual(checkPackage(root, 'example-module', '0.0.1'), []);
});

test('不发布的包没标 private：报出来，免得被误发出去', () => {
  const root = repo({ 'example-module': { pkg: { name: '@nacrejs/example-module', version: '0.0.1' } } });
  const problems = checkPackage(root, 'example-module', '0.0.1');
  assert.equal(problems.length, 1, JSON.stringify(problems));
  assert.match(problems[0], /private/);
});

// ---------------------------------------------------------------- 改版本

test('改版本：每个包的版本、包之间的依赖、框架的版本号、启动日志里的版本一起改', () => {
  const root = repo({
    types: good('@nacrejs/types', 'types'),
    camera: good('@nacrejs/camera', 'camera',
                 { peerDependencies: { '@nacrejs/ios': '0.0.1', '@nacrejs/types': '0.0.1', other: '^1.0.0' } }),
    'example-module': { pkg: { name: '@nacrejs/example-module', version: '0.0.1', private: true } },
  });
  setVersion(root, '0.0.2-beta.3');
  const read = (dir) => JSON.parse(fs.readFileSync(path.join(root, 'packages', dir, 'package.json'), 'utf8'));
  assert.equal(read('types').version, '0.0.2-beta.3');
  assert.equal(read('example-module').version, '0.0.2-beta.3');
  assert.deepEqual(read('camera').peerDependencies,
                   { '@nacrejs/ios': '0.0.2-beta.3', '@nacrejs/types': '0.0.2-beta.3', other: '^1.0.0' });
  assert.equal(fs.readFileSync(path.join(root, 'ios', 'project.yml'), 'utf8'),
               'a:\n        MARKETING_VERSION: "0.0.2"\n        NACRE_VERSION: "0.0.2-beta.3"\nb:\n        MARKETING_VERSION: "0.0.2"\n');
});

test('改版本：不像版本号的拒绝，什么都不改', () => {
  const root = repo({ types: good('@nacrejs/types', 'types') });
  assert.throws(() => setVersion(root, 'next'), /版本号/);
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'packages', 'types', 'package.json'), 'utf8')).version,
               '0.0.1');
});

// ---------------------------------------------------------------- 哪些还没发

test('还没发的包：npm 上已经有这个版本的跳过，顺序不变', () => {
  const root = repo({
    types: good('@nacrejs/types', 'types'),
    ios: good('@nacrejs/ios', 'ios'),
    cli: good('@nacrejs/cli', 'cli'),
    camera: good('@nacrejs/camera', 'camera'),
  });
  const asked = [];
  const pending = pendingPackages(root, (name, version) => {
    asked.push(name + '@' + version);
    return name === '@nacrejs/types' || name === '@nacrejs/cli';
  });
  assert.deepEqual(pending.map((p) => p.name), ['@nacrejs/ios', '@nacrejs/camera']);
  assert.deepEqual(asked, ['@nacrejs/types@0.0.1', '@nacrejs/ios@0.0.1', '@nacrejs/cli@0.0.1', '@nacrejs/camera@0.0.1']);
});

test('还没发的包：全都发过了就是空的', () => {
  const root = repo({ types: good('@nacrejs/types', 'types') });
  assert.deepEqual(pendingPackages(root, () => true), []);
});
