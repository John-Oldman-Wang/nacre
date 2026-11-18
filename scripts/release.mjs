#!/usr/bin/env node
// 发布 npm 包用的脚本。包的原样在 packages/<目录>/，全部包用同一个版本、一起发。
//
//   node scripts/release.mjs version <版本>      改版本：每个包、包之间的依赖、框架里写的版本号
//   node scripts/release.mjs check               核对每个包齐不齐，不改任何东西
//   node scripts/release.mjs pack [目录]          核对后把要发布的包各打成一个压缩包（默认 build/npm）
//   node scripts/release.mjs pending             列出这个版本 npm 上还没有的包，一行一个
//   node scripts/release.mjs publish [--dry-run]  核对后按顺序发布到 npm，已经发过的跳过
//
// 带后缀的版本（0.0.1-beta.1）发到同名的通道（beta），不会变成默认装到的那个；
// 正式版发到 latest。
//
// publish 可以重跑：npm 上同一个版本只能发一次，所以它先问每个包这个版本在不在，
// 在的跳过。发到一半断了，再跑一次会接着发剩下的。CI 也靠 pending 判断这次合并
// 要不要发布。
//
// 不发布的包（标着 private 的，现在只有示例模块）版本号照样跟着改，但不核对、
// 不打包、不发布。
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const LICENSE_ID = 'FSL-1.1-MIT';
// 发布和查询都明说是官方的仓库。很多人的 npm 指着镜像（registry.npmmirror.com），
// 镜像不收发布，npm login 也会被带到镜像的登录页上去
const REGISTRY = 'https://registry.npmjs.org/';
const SCOPE = '@nacrejs/';
// 定了不发布的包。它们必须标着 private；别的包必须没有 private。名单写明了，
// 「忘了去掉 private」和「本来就不发」才分得清
const UNPUBLISHED = ['@nacrejs/example-module'];
// 别的包依赖它们，所以先发
const FIRST = ['@nacrejs/types', '@nacrejs/ios', '@nacrejs/cli'];

const VERSION = /^(\d+\.\d+\.\d+)(?:-([a-z]+)(?:\.\d+)?)?$/;

function parseVersion(version) {
  const match = VERSION.exec(String(version));
  if (!match) {
    throw new Error('不像一个版本号：' + version + '（要是 1.2.3 或者 1.2.3-beta.1 这样的）');
  }
  return { core: match[1], channel: match[2] || null };
}

/** 这个版本发到 npm 的哪个通道 */
export function tagFor(version) {
  return parseVersion(version).channel || 'latest';
}

/** 框架的 Info.plist 里写的版本号：只能是三段数字 */
export function frameworkVersion(version) {
  return parseVersion(version).core;
}

function readPackages(root) {
  const base = path.join(root, 'packages');
  return fs.readdirSync(base).sort()
    .filter((dir) => fs.existsSync(path.join(base, dir, 'package.json')))
    .map((dir) => {
      const file = path.join(base, dir, 'package.json');
      const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
      return { dir, at: path.join(base, dir), file, pkg, name: pkg.name };
    });
}

/** 要发布的包，按发布的先后 */
export function publishOrder(root) {
  const publishable = readPackages(root).filter((p) => p.pkg.private !== true);
  const rank = (p) => (FIRST.includes(p.name) ? FIRST.indexOf(p.name) : FIRST.length);
  return publishable.sort((a, b) => rank(a) - rank(b) || (a.name < b.name ? -1 : 1));
}

/**
 * 一个包齐不齐。返回问题的列表，空的就是齐。
 * @param {string} root 仓库根目录
 * @param {string} dir packages/ 下的目录名
 * @param {string} version 全部包该有的版本
 */
export function checkPackage(root, dir, version) {
  const at = path.join(root, 'packages', dir);
  const pkg = JSON.parse(fs.readFileSync(path.join(at, 'package.json'), 'utf8'));
  const who = pkg.name;
  const problems = [];
  const add = (text) => problems.push(who + '：' + text);
  // 不发布的包只有一条要求：别被误发出去
  if (UNPUBLISHED.includes(who)) {
    if (pkg.private !== true) add('它定了不发布，package.json 里要有 "private": true');
    return problems;
  }

  if (pkg.private !== undefined) add('package.json 里有 private，发布会被拒绝');
  if (pkg.version !== version) add('版本是 ' + pkg.version + '，别的包是 ' + version);
  if (pkg.license !== LICENSE_ID) add('license 要是 ' + LICENSE_ID + '，现在是 ' + pkg.license);
  if (!pkg.publishConfig || pkg.publishConfig.access !== 'public') {
    add('publishConfig.access 要是 public：带前缀的包默认是私有的，第一次发布会被拒绝');
  }
  if (!pkg.publishConfig || pkg.publishConfig.registry !== REGISTRY) {
    add('publishConfig.registry 要是 ' + REGISTRY + '：不写的话，npm 指着镜像的人会发到镜像上去');
  }
  if (!pkg.repository || pkg.repository.directory !== 'packages/' + dir) {
    add('repository.directory 要是 packages/' + dir);
  }
  if (!Array.isArray(pkg.files) || pkg.files.length === 0) {
    add('没有 files：不限定的话，用例这类用户用不上的文件会一起打进包里');
  } else {
    for (const file of pkg.files) {
      if (!fs.existsSync(path.join(at, file))) {
        add('files 里的 ' + file + ' 不存在' +
            (file.endsWith('.xcframework') ? '（先跑 ios/scripts/build-xcframework.sh）' : ''));
      }
    }
  }
  if (!fs.existsSync(path.join(at, 'README.md'))) add('没有 README.md');
  const license = path.join(at, 'LICENSE.md');
  if (!fs.existsSync(license)) {
    add('没有 LICENSE.md');
  } else if (fs.readFileSync(license, 'utf8') !== fs.readFileSync(path.join(root, 'LICENSE.md'), 'utf8')) {
    add('LICENSE.md 和根目录的那一份不一样');
  }
  for (const section of ['dependencies', 'peerDependencies']) {
    for (const [name, range] of Object.entries(pkg[section] || {})) {
      if (name.startsWith(SCOPE) && range !== version) {
        add(section + ' 里的 ' + name + ' 要写死成 ' + version + '（全部包一起发、版本一样），现在是 ' + range);
      }
    }
  }
  return problems;
}

/**
 * 这个版本 npm 上还没有的包，按发布的先后。
 * @param {string} root
 * @param {(name: string, version: string) => boolean} isPublished
 */
export function pendingPackages(root, isPublished) {
  return publishOrder(root).filter((p) => !isPublished(p.name, p.pkg.version));
}

/** 问 npm：这个包的这个版本在不在 */
function isPublishedOnNpm(name, version) {
  try {
    const out = execFileSync('npm', ['view', name + '@' + version, 'version', '--registry', REGISTRY],
                             { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    return out.trim() === version;
  } catch {
    // 包不存在、版本不存在，npm 都是非零退出
    return false;
  }
}

/** 预编译的框架里写的版本号对不对：改了版本却没重新打包，这里会对不上 */
function checkFrameworkVersions(root, version) {
  const want = frameworkVersion(version);
  const problems = [];
  for (const p of publishOrder(root)) {
    for (const file of (p.pkg.files || []).filter((f) => f.endsWith('.xcframework'))) {
      const name = path.basename(file, '.xcframework');
      const plist = path.join(p.at, file, 'ios-arm64', name + '.framework', 'Info.plist');
      if (!fs.existsSync(plist)) continue;   // 不存在的话 checkPackage 已经报过了
      let got = '';
      try {
        got = execFileSync('plutil', ['-extract', 'CFBundleShortVersionString', 'raw', plist],
                           { encoding: 'utf8' }).trim();
      } catch {
        got = '(读不出来)';
      }
      if (got !== want) {
        problems.push(p.name + '：' + file + ' 里写的版本是 ' + got + '，该是 ' + want +
                      '。它是旧的，重新跑 ios/scripts/build-xcframework.sh');
      }
    }
  }
  return problems;
}

/** 改版本。先全部读出来、算好，再一起写，中途出错不会留下改了一半的状态 */
export function setVersion(root, version) {
  const core = frameworkVersion(version);
  const writes = [];
  for (const p of readPackages(root)) {
    p.pkg.version = version;
    for (const section of ['dependencies', 'peerDependencies']) {
      for (const name of Object.keys(p.pkg[section] || {})) {
        if (name.startsWith(SCOPE)) p.pkg[section][name] = version;
      }
    }
    writes.push([p.file, JSON.stringify(p.pkg, null, 2) + '\n']);
  }
  const project = path.join(root, 'ios', 'project.yml');
  writes.push([project, fs.readFileSync(project, 'utf8')
    .replace(/(MARKETING_VERSION: )"[^"]*"/g, '$1"' + core + '"')]);
  for (const [file, text] of writes) fs.writeFileSync(file, text);
  return writes.length;
}

function currentVersion(root) {
  const first = publishOrder(root)[0];
  if (!first) throw new Error('packages/ 下没有要发布的包');
  return first.pkg.version;
}

function checkAll(root) {
  const version = currentVersion(root);
  parseVersion(version);
  return [
    ...readPackages(root).flatMap((p) => checkPackage(root, p.dir, version)),
    ...checkFrameworkVersions(root, version),
  ];
}

// 在 GitHub Actions 里，把一句话另外打成一条批注。日志要登录才能读，批注是公开的，
// 查 CI 为什么失败时不用翻日志
function annotate(text) {
  if (process.env.GITHUB_ACTIONS === 'true') console.log('::error::' + text.replace(/\r?\n/g, ' '));
}

function requireClean(root) {
  const problems = checkAll(root);
  if (problems.length > 0) {
    console.error('有 ' + problems.length + ' 处不齐，先改掉：');
    for (const problem of problems) { console.error('  - ' + problem); annotate(problem); }
    process.exit(1);
  }
}

function main(argv) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const [command, ...rest] = argv;

  if (command === 'version') {
    if (rest.length !== 1) { console.error('用法：release.mjs version <版本>'); process.exit(1); }
    const count = setVersion(root, rest[0]);
    console.log('版本改成 ' + rest[0] + '（框架里写 ' + frameworkVersion(rest[0]) + '），改了 ' + count + ' 个文件');
    console.log('框架里的版本号变了的话，重新跑 ios/scripts/build-xcframework.sh');
    return;
  }

  if (command === 'check') {
    const version = currentVersion(root);
    const problems = checkAll(root);
    for (const problem of problems) { console.log('  - ' + problem); annotate(problem); }
    console.log(problems.length === 0
      ? '齐了：' + publishOrder(root).length + ' 个包，版本 ' + version + '，通道 ' + tagFor(version)
      : '有 ' + problems.length + ' 处不齐');
    process.exit(problems.length === 0 ? 0 : 1);
  }

  if (command === 'pack') {
    requireClean(root);
    const out = path.resolve(rest[0] || path.join(root, 'build', 'npm'));
    fs.rmSync(out, { recursive: true, force: true });
    fs.mkdirSync(out, { recursive: true });
    for (const p of publishOrder(root)) {
      const result = JSON.parse(execFileSync('npm', ['pack', '--json', '--pack-destination', out],
                                             { cwd: p.at, encoding: 'utf8' }))[0];
      console.log(p.name.padEnd(36) + (result.size / 1048576).toFixed(2).padStart(6) + ' MB  ' +
                  String(result.entryCount).padStart(4) + ' 个文件  ' + result.filename);
    }
    console.log('打好了，在 ' + path.relative(process.cwd(), out));
    return;
  }

  if (command === 'publish') {
    const dry = rest.includes('--dry-run');
    if (rest.some((arg) => arg !== '--dry-run')) { console.error('用法：release.mjs publish [--dry-run]'); process.exit(1); }
    requireClean(root);
    const version = currentVersion(root);
    const tag = tagFor(version);
    console.log((dry ? '演练，不真的发：' : '发布：') + '版本 ' + version + '，通道 ' + tag);
    const pending = new Set(pendingPackages(root, isPublishedOnNpm).map((p) => p.name));
    for (const p of publishOrder(root)) {
      if (!pending.has(p.name)) {
        console.log('→ ' + p.name + '：npm 上已经有 ' + version + '，跳过');
        continue;
      }
      console.log('→ ' + p.name);
      execFileSync('npm', ['publish', '--tag', tag, '--access', 'public', '--registry', REGISTRY,
                           ...(dry ? ['--dry-run'] : [])],
                   { cwd: p.at, stdio: 'inherit' });
    }
    return;
  }

  if (command === 'pending') {
    for (const p of pendingPackages(root, isPublishedOnNpm)) console.log(p.name);
    return;
  }

  console.error('用法：release.mjs version <版本> | check | pack [目录] | pending | publish [--dry-run]');
  process.exit(1);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2));
}
