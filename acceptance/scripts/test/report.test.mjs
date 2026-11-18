// runner 判结果的那部分：解析日志、比对基线、决定退出码。
// 用存好的日志片段测，不启动模拟器。
//
//   cd acceptance && npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  compareBaseline, formatBaseline, judge, knownSteps, normalizeName, parseBaseline, parseLog,
  resolveSteps, updateBaseline,
} from '../lib/report.mjs';

const DONE = '[JS][log] [acceptance] done {"asserts":3,"failed":0}';

test('数通过、失败、未验证的行', () => {
  const r = parseLog([
    '[JS][log]   ✓ alpha 默认 1 = 1',
    '[JS][log]   ✓ 兑现的是 CLLocation = true',
    '[JS][log]   ✗ 垂直精度无效时 altitude 是 null = false（期望 true）',
    '[JS][log]   ! 软键盘没弹出来（guide 高 34），这一条未验证',
    '[JS][log]     位置：37.33490, -122.00900 ±5 m',
    DONE,
  ].join('\n'));
  assert.equal(r.passed, 2);
  assert.equal(r.failed, 1);
  assert.deepEqual(r.failures, ['垂直精度无效时 altitude 是 null = false（期望 true）']);
  assert.deepEqual(r.unverified, ['软键盘没弹出来（guide 高 34），这一条未验证']);
  assert.deepEqual(r.done, { asserts: 3, failed: 0 });
});

test('没有运行时前缀的行也认（顶层直接打的 ✓）', () => {
  const r = parseLog('✓ 屏幕上：一个纵向滚动的瀑布\n  ✗ 步骤 stepAlerts 中途抛了，它后面的断言没跑: boom');
  assert.equal(r.passed, 1);
  assert.equal(r.failed, 1);
});

test('不是断言的行不算：编译输出、普通日志、行中间出现的记号', () => {
  const r = parseLog([
    '** BUILD SUCCEEDED **',
    '[JS][log]   实测：biometryType = none',
    '[JS][log]   → 这一行中间有个 ✓ 但不是断言',
    '[JS][warn] Timer callback blocked the main thread for 108 ms',
  ].join('\n'));
  assert.equal(r.passed + r.failed, 0);
  assert.equal(r.unverified.length, 0);
  assert.equal(r.done, null);
});

test('断言的名字：到第一个「 = 」为止，数字换成 #', () => {
  assert.equal(normalizeName('1 MB 的 Blob：长度'), '# MB 的 Blob：长度');
  assert.equal(normalizeName('下载完成 11879 字节，type'), '下载完成 # 字节，type');
  assert.equal(normalizeName('均值在 127.5 ± 2 以内'), '均值在 # ± # 以内');
  const r = parseLog([
    '[JS][log]   ✓ 1 MB 的 Blob：长度 = 1048576',
    '[JS][log]   ✓ 收到 error | message = Uncaught Error: x | lineno = 19592',
    '[JS][log]   ✓ 没有等号的一行',
    '[JS][log]   ✗ 1 MB 的 Blob：长度 = 3（期望 1048576）',
  ].join('\n'));
  assert.deepEqual([...r.names].sort(),
                   ['# MB 的 Blob：长度', '收到 error | message', '没有等号的一行'].sort());
});

test('结束标记：没有就是 null，写坏了也是 null', () => {
  assert.equal(parseLog('[JS][log]   ✓ a = 1').done, null);
  assert.equal(parseLog('[JS][log] [acceptance] done {oops').done, null);
  assert.deepEqual(parseLog(DONE).done, { asserts: 3, failed: 0 });
});

test('基线文件：必须出现的和可以缺的，往返不变', () => {
  const text = '# 说明\n\n+ alpha 默认 #\n? 对照组被回收了\n+ beta\n没有记号的行不认\n';
  const b = parseBaseline(text);
  assert.deepEqual([...b.required].sort(), ['alpha 默认 #', 'beta']);
  assert.deepEqual([...b.optional], ['对照组被回收了']);
  const again = parseBaseline(formatBaseline(b));
  assert.deepEqual([...again.required].sort(), [...b.required].sort());
  assert.deepEqual([...again.optional], [...b.optional]);
});

test('基线文件：名字自己以 # 或 ? 开头也读得回来', () => {
  const b = { required: new Set(['# MB 的 Blob：长度', '? 开头的名字', '+ 开头的名字']),
              optional: new Set(['# 秒之后被回收']) };
  const again = parseBaseline(formatBaseline(b));
  assert.deepEqual([...again.required].sort(), [...b.required].sort());
  assert.deepEqual([...again.optional], [...b.optional]);
});

test('比对基线：少了必须的、多了没见过的；可以缺的缺了不算', () => {
  const baseline = parseBaseline('+ a\n+ b\n? c\n');
  assert.deepEqual(compareBaseline(new Set(['a', 'b', 'c']), baseline), { missing: [], unknown: [] });
  assert.deepEqual(compareBaseline(new Set(['a', 'b']), baseline), { missing: [], unknown: [] });
  assert.deepEqual(compareBaseline(new Set(['a', 'x']), baseline), { missing: ['b'], unknown: ['x'] });
});

test('更新基线：新名字进必须的，删掉的去掉，可以缺的留着', () => {
  const baseline = parseBaseline('+ a\n+ b\n? c\n');
  const next = updateBaseline(new Set(['a', 'x']), baseline, { markMissingOptional: false });
  assert.deepEqual([...next.required].sort(), ['a', 'x']);
  assert.deepEqual([...next.optional], ['c']);
});

test('更新基线：让这一遍缺的变成可以缺的', () => {
  const baseline = parseBaseline('+ a\n+ b\n? c\n');
  const next = updateBaseline(new Set(['a', 'c']), baseline, { markMissingOptional: true });
  assert.deepEqual([...next.required], ['a']);
  // c 这一遍出现了，但它已经是可以缺的，不升回去
  assert.deepEqual([...next.optional].sort(), ['b', 'c']);
});

const good = () => parseLog('[JS][log]   ✓ a = 1\n[JS][log]   ✓ b = 2\n' + DONE);
const baselineAB = () => parseBaseline('+ a\n+ b\n');

test('判定：全过、有结束标记、基线对得上，才算通过', () => {
  const v = judge({ parsed: good(), baseline: baselineAB(), exit: 'done' });
  assert.equal(v.ok, true);
  assert.deepEqual(v.reasons, []);
});

test('判定：有断言失败就不通过，原因里点名', () => {
  const parsed = parseLog('[JS][log]   ✓ a = 1\n[JS][log]   ✗ b = 3（期望 2）\n' + DONE);
  const v = judge({ parsed, baseline: baselineAB(), exit: 'done' });
  assert.equal(v.ok, false);
  assert.match(v.reasons.join('\n'), /1 条断言失败/);
  assert.match(v.reasons.join('\n'), /b = 3（期望 2）/);
});

test('判定：编译失败、超时、App 提前退出，各有各的原因', () => {
  const parsed = parseLog('[JS][log]   ✓ a = 1');
  assert.match(judge({ parsed, baseline: baselineAB(), exit: 'build-failed' }).reasons.join('\n'), /编译/);
  assert.match(judge({ parsed, baseline: baselineAB(), exit: 'timeout' }).reasons.join('\n'), /没等到结束标记/);
  assert.match(judge({ parsed, baseline: baselineAB(), exit: 'exited' }).reasons.join('\n'), /提前退出/);
  for (const exit of ['build-failed', 'timeout', 'exited']) {
    assert.equal(judge({ parsed, baseline: baselineAB(), exit }).ok, false);
  }
});

test('判定：没跑完时不报基线里少了什么（那是没跑完的后果，不是原因）', () => {
  const parsed = parseLog('[JS][log]   ✓ a = 1');
  const v = judge({ parsed, baseline: baselineAB(), exit: 'exited' });
  assert.doesNotMatch(v.reasons.join('\n'), /基线/);
});

test('判定：基线对不上就不通过', () => {
  const parsed = parseLog('[JS][log]   ✓ a = 1\n[JS][log]   ✓ x = 2\n' + DONE);
  const v = judge({ parsed, baseline: baselineAB(), exit: 'done' });
  assert.equal(v.ok, false);
  assert.match(v.reasons.join('\n'), /基线里有、这一遍没出现：1 条/);
  assert.match(v.reasons.join('\n'), /这一遍出现、基线里没有：1 条/);
});

test('判定：没有基线（真机、第一次跑）时不比对，只看断言', () => {
  const v = judge({ parsed: good(), baseline: null, exit: 'done' });
  assert.equal(v.ok, true);
});

test('判定：一条断言都没有，不算通过', () => {
  const v = judge({ parsed: parseLog(DONE), baseline: null, exit: 'done' });
  assert.equal(v.ok, false);
  assert.match(v.reasons.join('\n'), /一条断言都没有/);
});

// ---- 只跑指定的步骤 ----

const MAIN = [
  "  run('stepSubclass', () => stepSubclass());",
  "  run('stepWindow', () => stepWindow(ctx));",
  "  ctx.webViewDone = run('stepWebView', () => stepWebView(ctx));",
  "    ['stepCoreLocation', () => stepCoreLocation(ctx)],",
  "    ['stepLifetime', () => { ctx.quiet = stepLifetime(ctx); }],",
  "  // 注释里提到 'stepNotReal' 不算",
].join('\n');

test('从入口文件里认出有哪些步骤', () => {
  assert.deepEqual(knownSteps(MAIN),
                   ['stepSubclass', 'stepWindow', 'stepWebView', 'stepCoreLocation', 'stepLifetime']);
});

test('入口文件里一个步骤都认不出来：说明认法过时了，要报出来', () => {
  assert.throws(() => knownSteps('const nothing = 1;'), /verify\.mjs/);
});

test('步骤名：带不带 step 前缀、首字母大小写都认', () => {
  const known = ['stepWindow', 'stepCoreLocation', 'stepWebView'];
  assert.deepEqual(resolveSteps('coreLocation', known), { steps: ['stepCoreLocation'], unknown: [] });
  assert.deepEqual(resolveSteps('CoreLocation,stepWebView', known),
                   { steps: ['stepCoreLocation', 'stepWebView'], unknown: [] });
  assert.deepEqual(resolveSteps(' webView , coreLocation ', known),
                   { steps: ['stepWebView', 'stepCoreLocation'], unknown: [] });
});

test('步骤名：不认识的列出来，重复的只算一次，空的不算', () => {
  const known = ['stepWindow', 'stepCoreLocation'];
  assert.deepEqual(resolveSteps('coreLocation,nope,coreLocation,,Nope2', known),
                   { steps: ['stepCoreLocation'], unknown: ['nope', 'Nope2'] });
  assert.deepEqual(resolveSteps('', known), { steps: [], unknown: [] });
});

test('判定：要求只跑几步，App 报的也是这几步，才算数', () => {
  const log = '[JS][log]   ✓ a = 1\n[JS][log] [acceptance] done ' +
              '{"asserts":1,"failed":0,"steps":["stepCoreLocation"]}';
  const v = judge({ parsed: parseLog(log), baseline: null, exit: 'done', steps: ['stepCoreLocation'] });
  assert.equal(v.ok, true);
});

test('判定：要求只跑几步，App 却跑了全部（过滤没生效），不通过', () => {
  const v = judge({ parsed: good(), baseline: null, exit: 'done', steps: ['stepCoreLocation'] });
  assert.equal(v.ok, false);
  assert.match(v.reasons.join('\n'), /过滤没有生效/);
});

test('判定：要求跑全部，App 却只跑了几步，不通过', () => {
  const log = '[JS][log]   ✓ a = 1\n[JS][log] [acceptance] done ' +
              '{"asserts":1,"failed":0,"steps":["stepCoreLocation"]}';
  const v = judge({ parsed: parseLog(log), baseline: null, exit: 'done', steps: null });
  assert.equal(v.ok, false);
  assert.match(v.reasons.join('\n'), /只跑了一部分/);
});

test('判定：App 报的步骤和要求的不一样，不通过', () => {
  const log = '[JS][log]   ✓ a = 1\n[JS][log] [acceptance] done ' +
              '{"asserts":1,"failed":0,"steps":["stepWebView"]}';
  const v = judge({ parsed: parseLog(log), baseline: null, exit: 'done', steps: ['stepCoreLocation'] });
  assert.equal(v.ok, false);
  assert.match(v.reasons.join('\n'), /stepWebView/);
});

test('判定：没跑完时不报步骤对不上（那时还没有结束标记）', () => {
  const parsed = parseLog('[JS][log]   ✓ a = 1');
  const v = judge({ parsed, baseline: null, exit: 'exited', steps: ['stepCoreLocation'] });
  assert.doesNotMatch(v.reasons.join('\n'), /过滤/);
});

test('parseLog：行尾有两个回车的行照样认（终端偶尔多给一个）', () => {
  const parsed = parseLog('[JS][log]   ✓ 甲 = 1\r\n[JS][log]   ✓ 乙 = 2\r\r\n[JS][log]   ✗ 丙 = 3（期望 4）\r\r\n' +
                          '[JS][log] [acceptance] done {"asserts":3,"failed":1}\r\r\n');
  assert.equal(parsed.passed, 2);
  assert.equal(parsed.failed, 1);
  assert.deepEqual([...parsed.names].sort(), ['丙', '乙', '甲']);
  assert.deepEqual(parsed.done, { asserts: 3, failed: 1 });
});
