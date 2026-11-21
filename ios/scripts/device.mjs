#!/usr/bin/env node
// run-device.sh 用的两件事：挑一台连着的真机，给编出来的 .app 签名。
//
//   node ios/scripts/device.mjs pick
//       打印一台连着的 iPhone 的 UDID。设了 NACRE_DEVICE 就用它（并核对它连着）
//
//   node ios/scripts/device.mjs sign <App.app> <UDID> <包名>
//       把 App 的包名改掉，嵌入描述文件，写 entitlements，先签里面的 framework 再签 App
//
// 签名用本机已有的开发证书和描述文件，不需要在 Apple 的网站上另外登记包名：
// 挑一份「包含这台设备、没过期、application-identifier 是 <团队>.* 或者正好是
// <团队>.<包名>」的描述文件，再挑一个装在钥匙串里、在这份描述文件的证书名单上的
// 签名身份。要指定就设 NACRE_PROFILE=<.mobileprovision 的路径>、
// NACRE_SIGN_IDENTITY=<证书的 SHA-1 或名字>。
//
// 通配的描述文件签不了要显式包名的能力（推送、关联域名），验收用不到它们。
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';

/** @param {string} message */
function fail(message) {
  console.error('device: ' + message);
  process.exit(1);
}

/** @param {string} cmd @param {string[]} args */
function run(cmd, args) {
  return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}


// ---- 选设备 ----

function connectedDevices() {
  const dir = mkdtempSync(join(tmpdir(), 'nacre-device-'));
  try {
    const out = join(dir, 'devices.json');
    run('xcrun', ['devicectl', 'list', 'devices', '--quiet', '--json-output', out]);
    const devices = JSON.parse(readFileSync(out, 'utf8')).result.devices;
    return devices
      .filter((d) => d.hardwareProperties?.reality === 'physical' &&
                     d.hardwareProperties?.platform === 'iOS' &&
                     d.connectionProperties?.tunnelState === 'connected')
      .map((d) => ({ udid: d.hardwareProperties.udid, name: d.deviceProperties?.name ?? '' }));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function pick() {
  const devices = connectedDevices();
  const wanted = process.env.NACRE_DEVICE;
  if (wanted) {
    const found = devices.find((d) => d.udid === wanted || d.name === wanted);
    if (!found) fail('NACRE_DEVICE=' + wanted + ' 没有连着。连着的：' + (devices.map((d) => d.name + ' ' + d.udid).join('、') || '没有'));
    return found;
  }
  if (devices.length === 0) fail('没有连着的 iPhone。用线连上、解锁，第一次连要在手机上点「信任」');
  return devices[0];
}

// ---- 签名 ----

/** 钥匙串里能用的签名身份：[{ sha1, name }] */
function identities() {
  const out = run('security', ['find-identity', '-v', '-p', 'codesigning']);
  return [...out.matchAll(/^\s*\d+\) ([0-9A-F]{40}) "(.+)"$/gm)].map((m) => ({ sha1: m[1], name: m[2] }));
}

/** 解开一份描述文件 */
function readProfile(path) {
  const dir = mkdtempSync(join(tmpdir(), 'nacre-profile-'));
  try {
    const plist = join(dir, 'profile.plist');
    writeFileSync(plist, run('security', ['cms', '-D', '-i', path]));
    // 整份转不成 JSON（里面有日期和二进制的证书），所以一个字段一个字段取。
    // raw 取出来的日期是 ISO 字符串，二进制是 base64，数组是元素个数
    /** @param {string} key */
    const raw = (key) => run('plutil', ['-extract', key, 'raw', '-o', '-', plist]).trim();
    /** @param {string} key */
    const json = (key) => JSON.parse(run('plutil', ['-extract', key, 'json', '-o', '-', plist]));
    const certs = [];
    const count = Number(raw('DeveloperCertificates'));
    for (let i = 0; i < count; i++) {
      certs.push(createHash('sha1').update(Buffer.from(raw('DeveloperCertificates.' + i), 'base64'))
        .digest('hex').toUpperCase());
    }
    const entitlements = json('Entitlements');
    return {
      path,
      name: raw('Name'),
      team: json('TeamIdentifier')[0],
      appId: entitlements['application-identifier'] ?? '',
      entitlements,
      devices: /** @type {string[]} */ (json('ProvisionedDevices')),
      expires: new Date(raw('ExpirationDate')),
      certs,
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function profileFiles() {
  const dirs = [join(homedir(), 'Library/Developer/Xcode/UserData/Provisioning Profiles'),
                join(homedir(), 'Library/MobileDevice/Provisioning Profiles')];
  return dirs.filter(existsSync).flatMap((dir) =>
    readdirSync(dir).filter((f) => f.endsWith('.mobileprovision')).map((f) => join(dir, f)));
}

/** @param {string} udid @param {string} bundleId */
function chooseSigning(udid, bundleId) {
  const ids = identities();
  if (ids.length === 0) fail('钥匙串里没有能签名的开发证书（security find-identity -v -p codesigning 是空的）');
  const wantedId = process.env.NACRE_SIGN_IDENTITY;
  const usable = wantedId ? ids.filter((i) => i.sha1 === wantedId.toUpperCase() || i.name === wantedId) : ids;
  if (usable.length === 0) fail('钥匙串里没有 NACRE_SIGN_IDENTITY=' + wantedId);

  const files = process.env.NACRE_PROFILE ? [process.env.NACRE_PROFILE] : profileFiles();
  /** @type {string[]} */
  const rejected = [];
  for (const file of files) {
    const p = readProfile(file);
    const why = [];
    if (!p.devices.includes(udid)) why.push('不含这台设备');
    if (!(p.expires > new Date())) why.push('已过期');
    if (p.appId !== p.team + '.*' && p.appId !== p.team + '.' + bundleId) why.push('包名对不上（' + p.appId + '）');
    const identity = usable.find((i) => p.certs.includes(i.sha1));
    if (!identity) why.push('钥匙串里没有它名单上的证书');
    if (why.length === 0 && identity) return { profile: p, identity };
    rejected.push('  ' + (p.name ?? file) + '：' + why.join('，'));
  }
  fail('没有能用的描述文件。' + (files.length === 0 ? '本机一份都没有' : '看过的：\n' + rejected.join('\n')) +
       '\n可以用 NACRE_PROFILE=<路径> 指定');
  throw new Error('unreachable');
}

/** 改包名、嵌描述文件、写 entitlements、签名 */
function sign(app, udid, bundleId) {
  if (!existsSync(join(app, 'Info.plist'))) fail(app + ' 不是一个 .app');
  const { profile, identity } = chooseSigning(udid, bundleId);
  console.log('签名：' + identity.name + '，描述文件 ' + profile.name + '，包名 ' + bundleId);

  run('plutil', ['-replace', 'CFBundleIdentifier', '-string', bundleId, join(app, 'Info.plist')]);
  writeFileSync(join(app, 'embedded.mobileprovision'), readFileSync(profile.path));

  // entitlements 从描述文件里给的那份出发，通配的地方换成这个包名
  const appId = profile.team + '.' + bundleId;
  const entitlements = { ...profile.entitlements, 'application-identifier': appId };
  if (Array.isArray(entitlements['keychain-access-groups'])) {
    entitlements['keychain-access-groups'] = [appId];
  }
  const dir = mkdtempSync(join(tmpdir(), 'nacre-sign-'));
  try {
    const entPath = join(dir, 'app.entitlements');
    writeFileSync(entPath, JSON.stringify(entitlements));
    run('plutil', ['-convert', 'xml1', entPath]);

    // 里面的东西先签，App 最后签：App 的签名把里面每个文件的摘要都记进去
    const frameworks = join(app, 'Frameworks');
    if (existsSync(frameworks)) {
      for (const f of readdirSync(frameworks)) {
        if (f.endsWith('.framework') || f.endsWith('.dylib')) {
          run('codesign', ['--force', '--sign', identity.sha1, '--timestamp=none', join(frameworks, f)]);
        }
      }
    }
    run('codesign', ['--force', '--sign', identity.sha1, '--timestamp=none',
                     '--entitlements', entPath, app]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const [command, ...rest] = process.argv.slice(2);
if (command === 'pick') {
  const device = pick();
  console.error('设备：' + device.name + '（' + device.udid + '）');
  console.log(device.udid);
} else if (command === 'sign' && rest.length === 3) {
  sign(rest[0], rest[1], rest[2]);
} else {
  fail('用法：device.mjs pick | device.mjs sign <App.app> <UDID> <包名>');
}
