// 验收的结果怎么判：解析日志、比对断言名单的基线、决定通过不通过。
//
// 这里没有任何启动模拟器的代码，全是纯函数，所以能用存好的日志片段测
// （scripts/test/report.test.mjs）。启动和等待在 scripts/verify.mjs。

// 运行时给 console 的每一行加的前缀：[JS][log]、[JS][error]……
const PREFIX = /^\[JS\]\[[a-z]+\] ?/;
// 断言的行：前缀之后只有空白，然后是记号。行中间出现的 ✓ 不算
const MARK = /^\s*([✓✗!]) (.*)$/;
// App 跑完时打的那一行，见 src/main.js
const DONE = /^\[acceptance\] done (.*)$/;

/**
 * 断言的名字里常带着量出来的数（耗时、字节数、日期），每一遍都不一样。
 * 统一换成 #，名字才能跨两遍比较。
 * @param {string} name
 */
export function normalizeName(name) {
  return name.replace(/\d+(?:\.\d+)?/g, '#').trim();
}

/**
 * @typedef {object} Parsed
 * @property {number} passed ✓ 的行数
 * @property {number} failed ✗ 的行数
 * @property {string[]} failures 每一条 ✗ 的原文
 * @property {string[]} unverified 每一条 ! 的原文
 * @property {Set<string>} names 出现过的断言的名字（通过和失败都算），数字已换成 #
 * @property {Record<string, unknown> | null} done 结束标记带的那份数；没有标记是 null
 */

/**
 * @param {string} text 整份日志
 * @returns {Parsed}
 */
export function parseLog(text) {
  /** @type {Parsed} */
  const parsed = { passed: 0, failed: 0, failures: [], unverified: [], names: new Set(), done: null };
  for (const raw of text.split('\n')) {
    const line = raw.replace(/\r+$/, '').replace(PREFIX, '');
    const done = DONE.exec(line.trim());
    if (done !== null) {
      try {
        const value = JSON.parse(done[1]);
        if (value !== null && typeof value === 'object') parsed.done = value;
      } catch {
        // 标记写坏了当没有：宁可判成「没等到结束标记」，也不猜
      }
      continue;
    }
    const mark = MARK.exec(line);
    if (mark === null) continue;
    const [, kind, rest] = mark;
    if (kind === '!') {
      parsed.unverified.push(rest);
      continue;
    }
    const cut = rest.indexOf(' = ');
    parsed.names.add(normalizeName(cut === -1 ? rest : rest.slice(0, cut)));
    if (kind === '✓') {
      parsed.passed++;
    } else {
      parsed.failed++;
      parsed.failures.push(rest);
    }
  }
  return parsed;
}

/**
 * @typedef {object} Baseline
 * @property {Set<string>} required 每一遍都必须出现的
 * @property {Set<string>} optional 可以缺的：那几组对时序敏感、有时自己报未验证的检查
 */

/**
 * 基线文件：一行一条，开头两个字符说明这一行是什么：
 *   「+ 」必须出现的断言    「? 」可以缺的断言    「# 」注释
 * 名字是这两个字符之后的全部。不拿「没有记号」当必须出现：名字里的数字换成
 * 了 #，所以有的名字自己就以「# 」开头（「# MB 的 Blob：长度」），会和注释分不清。
 * @param {string} text
 * @returns {Baseline}
 */
export function parseBaseline(text) {
  /** @type {Baseline} */
  const baseline = { required: new Set(), optional: new Set() };
  for (const raw of text.split('\n')) {
    const line = raw.replace(/\r+$/, '');
    if (line.startsWith('+ ')) baseline.required.add(line.slice(2));
    else if (line.startsWith('? ')) baseline.optional.add(line.slice(2));
  }
  return baseline;
}

const HEADER = [
  '# 验收的断言名单（iPhone Air 模拟器）。由 scripts/verify.mjs --update-baseline 生成。',
  '#',
  '# 一行一个断言的名字，名字里的数字统一换成了 #。开头的记号：',
  '#   +  每一遍都必须出现，少了算失败',
  '#   ?  可以缺：那几组对时序敏感的检查有时自己报未验证，它们的断言那一遍就不出现',
  '',
];

/** @param {Baseline} baseline */
export function formatBaseline(baseline) {
  const lines = [
    ...[...baseline.required].sort().map((name) => '+ ' + name),
    ...[...baseline.optional].sort().map((name) => '? ' + name),
  ];
  return HEADER.join('\n') + lines.join('\n') + '\n';
}

/**
 * @param {Set<string>} names 这一遍出现的
 * @param {Baseline} baseline
 * @returns {{ missing: string[], unknown: string[] }}
 */
export function compareBaseline(names, baseline) {
  const missing = [...baseline.required].filter((name) => !names.has(name)).sort();
  const unknown = [...names]
    .filter((name) => !baseline.required.has(name) && !baseline.optional.has(name)).sort();
  return { missing, unknown };
}

/**
 * 用这一遍的结果更新基线。
 *   - 新出现的名字进「必须出现」
 *   - 原来必须、这一遍没出现的：默认去掉（那条断言被删了）；
 *     markMissingOptional 时改成「可以缺」（那条断言这一遍只是没轮到）
 *   - 已经是「可以缺」的一直留着，出现了也不升回去
 * @param {Set<string>} names
 * @param {Baseline} baseline
 * @param {{ markMissingOptional: boolean }} options
 * @returns {Baseline}
 */
export function updateBaseline(names, baseline, { markMissingOptional }) {
  /** @type {Baseline} */
  const next = { required: new Set(), optional: new Set(baseline.optional) };
  for (const name of names) {
    if (!next.optional.has(name)) next.required.add(name);
  }
  if (markMissingOptional) {
    for (const name of baseline.required) {
      if (!names.has(name)) next.optional.add(name);
    }
  }
  return next;
}

/**
 * 入口文件（src/main.js）里登记了哪些步骤。两种写法：run('stepX', …) 和
 * 排队那张表里的 ['stepX', …]。注释里提到的名字不算。
 *
 * 靠正则从源码里认，所以认不出来时要说是「认法过时了」，不能安静地给一张空表。
 * @param {string} mainSource
 * @returns {string[]}
 */
export function knownSteps(mainSource) {
  const names = [];
  for (const raw of mainSource.split('\n')) {
    const line = raw.replace(/\/\/.*$/, '');
    const found = /(?:\brun\(|\[)'(step[A-Z][A-Za-z0-9]*)'/.exec(line);
    if (found !== null && !names.includes(found[1])) names.push(found[1]);
  }
  if (names.length === 0) {
    throw new Error('src/main.js 里一个步骤都没认出来：scripts/lib/report.mjs 的 knownSteps 要跟着入口的写法更新（verify.mjs 靠它核对 --steps）');
  }
  return names;
}

/**
 * --steps 的值 → 步骤的全名。带不带 step 前缀、首字母大小写都认。
 * @param {string} input 逗号分隔
 * @param {string[]} known
 * @returns {{ steps: string[], unknown: string[] }}
 */
export function resolveSteps(input, known) {
  /** @type {string[]} */ const steps = [];
  /** @type {string[]} */ const unknown = [];
  for (const raw of input.split(',')) {
    const given = raw.trim();
    if (given === '') continue;
    const bare = given.replace(/^step(?=[A-Z])/, '');
    const full = 'step' + bare[0].toUpperCase() + bare.slice(1);
    if (known.includes(full)) {
      if (!steps.includes(full)) steps.push(full);
    } else if (!unknown.includes(given)) {
      unknown.push(given);
    }
  }
  return { steps, unknown };
}

/**
 * 这一遍是怎么结束的：
 *   done          等到了结束标记
 *   build-failed  还没启动 App 就失败了（编译、生成工程、装不上）
 *   timeout       期限内没等到结束标记
 *   exited        App 没打结束标记就退出了（崩溃、被杀）
 * @typedef {'done' | 'build-failed' | 'timeout' | 'exited'} Exit
 */

const SHOWN = 40;
/** @param {string[]} items */
const listed = (items) => items.slice(0, SHOWN).map((item) => '    ' + item).join('\n') +
  (items.length > SHOWN ? '\n    ……还有 ' + (items.length - SHOWN) + ' 条' : '');

/**
 * steps：要求只跑哪几步（全名）；null 或者不给是跑全部。App 在结束标记里报它
 * 实际按哪几步过滤的，两边对不上说明过滤没写进产物，这一遍的结果不能信。
 * @param {{ parsed: Parsed, baseline: Baseline | null, exit: Exit, steps?: string[] | null }} run
 * @returns {{ ok: boolean, reasons: string[], missing: string[], unknown: string[] }}
 */
export function judge({ parsed, baseline, exit, steps = null }) {
  /** @type {string[]} */
  const reasons = [];
  if (exit === 'build-failed') reasons.push('编译或者安装失败，App 没有启动');
  if (exit === 'timeout') reasons.push('期限内没等到结束标记：App 卡住了，或者有步骤一直没做完');
  if (exit === 'exited') reasons.push('App 没打结束标记就提前退出了（崩溃或者被杀）');
  if (parsed.failed > 0) {
    reasons.push(parsed.failed + ' 条断言失败：\n' + listed(parsed.failures));
  }
  let missing = /** @type {string[]} */ ([]);
  let unknown = /** @type {string[]} */ ([]);
  if (exit === 'done') {
    if (parsed.passed + parsed.failed === 0) reasons.push('一条断言都没有：日志里没有 ✓ 也没有 ✗');
    const reported = parsed.done !== null && Array.isArray(parsed.done.steps)
      ? /** @type {string[]} */ (parsed.done.steps) : null;
    if (steps !== null && reported === null) {
      reasons.push('过滤没有生效：要求只跑 ' + steps.join('、') + '，App 跑的却是全部');
    } else if (steps === null && reported !== null) {
      reasons.push('要求跑全部，App 却只跑了一部分：' + reported.join('、'));
    } else if (steps !== null && reported !== null &&
               [...steps].sort().join() !== [...reported].sort().join()) {
      reasons.push('App 跑的步骤和要求的不一样：要求 ' + steps.join('、') + '，App 报的是 ' +
                   reported.join('、'));
    }
    // 没跑完的时候名单必然缺一大片，那是后果不是原因，不报
    if (baseline !== null) {
      ({ missing, unknown } = compareBaseline(parsed.names, baseline));
      if (missing.length > 0) {
        reasons.push('基线里有、这一遍没出现：' + missing.length + ' 条\n' + listed(missing));
      }
      if (unknown.length > 0) {
        reasons.push('这一遍出现、基线里没有：' + unknown.length + ' 条' +
                     '（是新加的断言就用 --update-baseline 记进去）\n' + listed(unknown));
      }
    }
  }
  return { ok: reasons.length === 0, reasons, missing, unknown };
}
