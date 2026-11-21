#!/usr/bin/env node
// 跑一遍验收，用退出码说通过不通过。
//
//   cd acceptance && npm run verify                    Debug
//   cd acceptance && npm run verify -- --release       Release（交付出去的就是这个配置）
//   node acceptance/scripts/verify.mjs --runtime=framework --release   引预编译的 xcframework
//
//   --steps=a,b                只跑这几步（外加建窗口那一步）。名字是 src/main.js 里的步骤名，
//                              带不带 step 前缀都行：coreLocation、stepCoreLocation。不比对基线
//   --update-baseline          把这一遍出现的断言名单记成基线（要先全部通过）
//   --mark-missing-optional    配合上一条：基线里有、这一遍没出现的，记成「可以缺」而不是删掉
//   --device                   跑在连着的真机上（ios/scripts/run-device.sh）。不比对基线：
//                              基线是模拟器上记的，真机上有些检查走不同的分支
//   --no-baseline              不比对基线（别的模拟器）
//   --timeout=<分钟>           等结束标记的期限，默认 25
//   --from-log=<文件>          不启动模拟器，只判一份已有的日志
//
// 退出码：0 通过；1 没通过（原因打在最后）；2 命令行写错了。
//
// 没通过的情况：编译或安装失败；有断言失败（步骤中途抛了也是一条失败）；
// 期限内没等到结束标记；App 提前退出；断言名单和基线对不上。
//
// 它做的事只有三件：调 ios/scripts/run-sim.sh（真机是 run-device.sh）、把输出存下来、等结束标记。
// 怎么判在 lib/report.mjs，那边是纯函数，有用例。
//
// 模拟器由 run-sim.sh 选；要指定就设 NACRE_SIM=<UDID>。基线是 iPhone Air 上记的，
// 换了设备名单会有出入，用 --no-baseline。
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { StringDecoder } from 'node:string_decoder';
import { fileURLToPath } from 'node:url';
import {
  formatBaseline, judge, knownSteps, parseBaseline, parseLog, resolveSteps, updateBaseline,
} from './lib/report.mjs';
import { startTestServer } from './test-server.mjs';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = resolve(project, '..');
const baselinePath = join(project, 'baseline', 'simulator.txt');

const options = {
  release: false,
  device: false,
  runtime: 'source',
  updateBaseline: false,
  markMissingOptional: false,
  noBaseline: false,
  timeoutMinutes: 25,
  fromLog: /** @type {string | null} */ (null),
  steps: /** @type {string | null} */ (null),
};
for (const arg of process.argv.slice(2)) {
  if (arg === '--release') options.release = true;
  else if (arg === '--device') options.device = true;
  else if (arg.startsWith('--runtime=')) options.runtime = arg.slice('--runtime='.length);
  else if (arg === '--update-baseline') options.updateBaseline = true;
  else if (arg === '--mark-missing-optional') options.markMissingOptional = true;
  else if (arg === '--no-baseline') options.noBaseline = true;
  else if (arg.startsWith('--timeout=')) options.timeoutMinutes = Number(arg.slice('--timeout='.length));
  else if (arg.startsWith('--from-log=')) options.fromLog = resolve(arg.slice('--from-log='.length));
  else if (arg.startsWith('--steps=')) options.steps = arg.slice('--steps='.length);
  else { console.error('不认识的选项 ' + arg); process.exit(2); }
}
if (!['source', 'framework'].includes(options.runtime)) {
  console.error('--runtime 只能是 source 或 framework，现在是 ' + options.runtime);
  process.exit(2);
}
if (!Number.isFinite(options.timeoutMinutes) || options.timeoutMinutes <= 0) {
  console.error('--timeout 要一个大于 0 的分钟数');
  process.exit(2);
}
if (options.device && options.updateBaseline) {
  console.error('--device 和 --update-baseline 不能一起用：基线是模拟器上记的');
  process.exit(2);
}
if (options.markMissingOptional && !options.updateBaseline) {
  console.error('--mark-missing-optional 要和 --update-baseline 一起用');
  process.exit(2);
}

// 只跑哪几步：全名的数组；null 是跑全部
/** @type {string[] | null} */
let steps = null;
if (options.steps !== null) {
  if (options.updateBaseline) {
    console.error('--steps 和 --update-baseline 不能一起用：基线要从完整的一遍里记');
    process.exit(2);
  }
  const known = knownSteps(readFileSync(join(project, 'src', 'main.js'), 'utf8'));
  const resolved = resolveSteps(options.steps, known);
  if (resolved.unknown.length > 0 || resolved.steps.length === 0) {
    console.error(resolved.unknown.length > 0
      ? '没有这样的步骤：' + resolved.unknown.join('、')
      : '--steps 后面要写步骤名');
    console.error('有这些：' + known.map((name) => name[4].toLowerCase() + name.slice(5)).join(' '));
    process.exit(2);
  }
  steps = resolved.steps;
}

const label = (options.device ? 'device-' : '') + (options.release ? 'release' : 'debug') +
              (options.runtime === 'framework' ? '-framework' : '') +
              // 只跑几步的那一遍另存，不盖掉完整那一遍的日志和结果
              (steps !== null ? '-steps' : '');
const outDir = join(project, 'build');
mkdirSync(outDir, { recursive: true });
const logPath = options.fromLog ?? join(outDir, 'verify-' + label + '.log');
const resultPath = join(outDir, 'verify-' + label + '.json');

/**
 * 启动、等结束标记。返回这一遍是怎么结束的。
 * @returns {Promise<import('./lib/report.mjs').Exit>}
 */
function run() {
  return new Promise((done) => {
    const script = options.device ? 'ios/scripts/run-device.sh' : 'ios/scripts/run-sim.sh';
    const args = [script, 'acceptance', '--runtime=' + options.runtime];
    if (options.release) args.push('--release');
    writeFileSync(logPath, '');
    // detached：它自己一个进程组，结束时连同里面的 xcodebuild、simctl 一起停掉
    // 只跑哪几步是打包时写进产物的：run-sim.sh 每次都重新打包，把这个参数带给打包器
    const env = { ...process.env };
    delete env.NACRE_ESBUILD_ARGS;
    if (steps !== null) {
      env.NACRE_ESBUILD_ARGS = '--define:globalThis.__NACRE_STEPS__="' + steps.join(',') + '"';
    }
    const child = spawn('bash', args, { cwd: root, detached: true, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let launched = false;   // 看到运行时的第一行输出，说明 App 起来了
    let sawDone = false;
    let settled = false;
    let asserts = 0;
    let tail = '';
    const started = Date.now();

    /** @param {import('./lib/report.mjs').Exit} exit */
    const finish = (exit) => {
      if (settled) return;
      settled = true;
      clearTimeout(deadline);
      clearInterval(progress);
      try { process.kill(-(/** @type {number} */ (child.pid)), 'SIGTERM'); } catch { /* 已经退出了 */ }
      // 真机上的 App 不用另外停：下一遍启动时 --terminate-existing 会先停掉它
      if (options.device) { done(exit); return; }
      // App 自己还在模拟器里跑着，停掉它：下一遍从干净的状态开始
      const bundleId = JSON.parse(readFileSync(join(project, 'nacre.config.json'), 'utf8')).bundleId;
      spawnSync('xcrun', ['simctl', 'terminate', process.env.NACRE_SIM || 'booted', bundleId],
                { stdio: 'ignore' });
      done(exit);
    };

    // 存进日志的是原样的字节。一块数据可能正好断在一个汉字的中间：先转成字符串
    // 再存的话，那个字的前后两半各自变成乱码，断言的名字就和基线对不上了
    // （实测出过：一遍里三个名字被弄坏，报成「少了三条、多了三条」）。
    // 逐行看的那一份用 StringDecoder，它会把半个字留到下一块
    const decoders = new Map();
    /** @param {Buffer} chunk @param {'out' | 'err'} from */
    const onData = (chunk, from) => {
      writeFileSync(logPath, chunk, { flag: 'a' });
      if (!decoders.has(from)) decoders.set(from, new StringDecoder('utf8'));
      const text = decoders.get(from).write(chunk);
      const lines = (tail + text).split('\n');
      tail = /** @type {string} */ (lines.pop());
      for (const line of lines) {
        if (!launched && (line.startsWith('[JS]') || line.startsWith('[nacre]'))) {
          launched = true;
          console.log('App 起来了，用了 ' + Math.round((Date.now() - started) / 1000) + ' 秒（编译和安装）');
        }
        if (/^(\[JS\]\[[a-z]+\] ?)?\s*[✓✗] /.test(line)) asserts++;
        if (line.includes('[acceptance] done ')) sawDone = true;
      }
      // 结束标记之后再等一下，让同一拍里剩下的输出写完
      if (sawDone) setTimeout(() => finish('done'), 500);
    };
    child.stdout.on('data', (chunk) => onData(chunk, 'out'));
    child.stderr.on('data', (chunk) => onData(chunk, 'err'));
    child.on('exit', () => {
      // 留一点时间让管道里剩下的输出到齐，再下结论
      setTimeout(() => finish(sawDone ? 'done' : launched ? 'exited' : 'build-failed'), 300);
    });
    const deadline = setTimeout(() => finish('timeout'), options.timeoutMinutes * 60 * 1000);
    const progress = setInterval(() => {
      if (launched) console.log('  …已经 ' + asserts + ' 条断言');
    }, 60 * 1000);
  });
}

console.log('验收：' + (options.device ? '真机，' : '') + (options.release ? 'Release' : 'Debug') +
            '，运行时 ' + options.runtime +
            (options.fromLog ? '（只判已有的日志）' : ''));
if (steps !== null) {
  console.log('只跑这几步：' + steps.join('、') + '（外加建窗口那一步和入口顶层的几段；不比对基线）');
}
/** @type {import('./lib/report.mjs').Exit} */
let exit;
if (options.fromLog) {
  if (!existsSync(logPath)) { console.error('找不到日志 ' + logPath); process.exit(2); }
  exit = /\[acceptance\] done /.test(readFileSync(logPath, 'utf8')) ? 'done' : 'exited';
} else {
  // 流式响应那一步要一个本机的服务（scripts/test-server.mjs），它能控制每一块什么时候发。
  // 服务没起时那一步自己报未验证、整步跳过，它的断言就不出现，基线会报少了一片——
  // 所以这里替它起好。端口被占着多半是已经有一个在跑，那就用那一个
  /** @type {import('node:http').Server | null} */
  let testServer = null;
  try {
    testServer = await startTestServer({ quiet: true });
  } catch (err) {
    console.log('本机的测试服务没有另起：' + (err instanceof Error ? err.message : String(err)));
  }
  exit = await run();
  if (testServer !== null) testServer.close();
}

const parsed = parseLog(readFileSync(logPath, 'utf8'));
const hasBaseline = existsSync(baselinePath);
const useBaseline = !options.noBaseline && !options.device && !options.updateBaseline && hasBaseline && steps === null;
const baseline = hasBaseline ? parseBaseline(readFileSync(baselinePath, 'utf8')) : null;
const verdict = judge({ parsed, baseline: useBaseline ? baseline : null, exit, steps });

console.log('');
console.log('通过 ' + parsed.passed + ' 条，失败 ' + parsed.failed + ' 条，未验证 ' +
            parsed.unverified.length + ' 处');
for (const line of parsed.unverified) console.log('  ! ' + line.slice(0, 150));
if (!options.noBaseline && !options.device && !options.updateBaseline && !hasBaseline && steps === null) {
  console.log('还没有基线（' + baselinePath + '），这一遍没有比对断言名单');
}

if (options.updateBaseline) {
  if (verdict.ok) {
    const next = updateBaseline(parsed.names, baseline ?? { required: new Set(), optional: new Set() },
                                { markMissingOptional: options.markMissingOptional });
    mkdirSync(dirname(baselinePath), { recursive: true });
    writeFileSync(baselinePath, formatBaseline(next));
    console.log('基线已更新：必须出现 ' + next.required.size + ' 条，可以缺 ' + next.optional.size + ' 条');
    // 原来必须出现、这一遍没出现的，默认当成「那条断言被删了」从基线里去掉。
    // 如果其实是某一组检查这一遍报了未验证，去掉就错了——所以点名列出来，
    // 让人看得见。那种情况该加 --mark-missing-optional
    if (baseline !== null && !options.markMissingOptional) {
      const dropped = [...baseline.required].filter((name) => !parsed.names.has(name)).sort();
      if (dropped.length > 0) {
        console.log('从基线里去掉了 ' + dropped.length + ' 条（这一遍没出现）。如果它们不是被删掉的断言，' +
                    '而是某组检查这一遍报了未验证，改用 --mark-missing-optional 重来：');
        for (const name of dropped.slice(0, 40)) console.log('    ' + name);
        if (dropped.length > 40) console.log('    ……还有 ' + (dropped.length - 40) + ' 条');
      }
    }
  } else {
    console.log('没有更新基线：这一遍没通过');
  }
}

writeFileSync(resultPath, JSON.stringify({
  ok: verdict.ok,
  exit,
  configuration: options.release ? 'Release' : 'Debug',
  device: options.device,
  runtime: options.runtime,
  steps,
  passed: parsed.passed,
  failed: parsed.failed,
  unverified: parsed.unverified,
  failures: parsed.failures,
  done: parsed.done,
  baseline: { compared: useBaseline, missing: verdict.missing, unknown: verdict.unknown },
  reasons: verdict.reasons,
  log: logPath,
}, null, 2) + '\n');

console.log('');
if (verdict.ok) {
  console.log(steps === null ? '验收通过' : '这几步通过（不是完整的一遍）');
} else {
  console.log('验收没通过：');
  for (const reason of verdict.reasons) console.log('  - ' + reason);
}
console.log('日志 ' + logPath);
console.log('结果 ' + resultPath);
process.exit(verdict.ok ? 0 : 1);
