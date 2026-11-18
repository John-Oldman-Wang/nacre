// Intl 两步共用的那一段：同一张用例表在这台设备的网页里跑一遍、在运行时里跑一遍，逐条比对。
//
// 「和 Web 一致」验的就是这个。期望值不写在仓库里，是从网页里现取的——换一个系统版本、
// 换一种系统语言，这条检查照样成立。
import { intlRunCase } from './intl-number-cases.js';
import { garbageProbesInFlight } from '../support.js';

const sleep = (/** @type {number} */ ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 这几万条比对要在主线程上跑十几秒。它不能和别的步骤抢：验收里有几条断言
// 是对时序敏感的（写文件和定时器谁先、GC 赶不赶得上），主线程一忙它们就
// 只能报「未验证」——第一版就是这样把三条原有的断言挤掉的。所以：
//   1. 排队，一张表跑完再跑下一张
//   2. 等前面的步骤跑完、主线程闲下来再开始：生命周期那一步的 GC 检查结束，
//      没有 GC 探测在进行，并且连续 2 秒 100 ms 的定时器都准点。
//      光等「闲 2 秒」不够——GC 的检查自己就有 3 秒的空等，比对会插进去
//   3. 按时间片跑，每片 6 ms，中间让出去
/** @type {Promise<void>} */
let queue = Promise.resolve();
async function whenQuiet() {
  let calm = 0;
  let last = performance.now();
  while (calm < 20) {
    await sleep(100);
    const now = performance.now();
    calm = now - last - 100 < 15 && garbageProbesInFlight() === 0 ? calm + 1 : 0;
    last = now;
  }
}

// 已经排上队的比对全部做完（或者中途抛了）时兑现。入口用它判断「跑完了」
export const comparisonsDone = () => queue;

/**
 * @param {object} o
 * @param {(label: string, actual: unknown, expected: unknown) => void} o.assert
 * @param {UIView} o.host 放那个看不见的网页视图用
 * @param {UILabel} o.status 进度写在这里
 * @param {string} o.name 日志里叫它什么
 * @param {() => [string, () => unknown][]} o.casesFn 自包含的用例表函数（会被 toString 送进网页）
 * @param {Promise<void>} [o.after] 等它兑现了再开始（前面那些对时序敏感的步骤）
 * @param {(label: string) => { key: string, expected?: string }} o.classify
 *        这条用例归哪一组；给了 expected 就不和网页比，断言等于它（明确不支持的那些）
 */
export function compareWithWebPage({ assert, host, status, name, casesFn, classify, after }) {
  const web = new WebView();
  web.frame = new CGRect(0, 0, 4, 4);
  web.isHidden = true;
  host.addSubview(web);

  status.text = '排着队，等别的步骤跑完';
  const run = async () => {
    if (after) await after;
    await whenQuiet();
    // 网页那边：整张表在网页里一次跑完（那是另一个进程，不占我们的线程）
    await web.webContents.loadURL('about:blank');
    // 默认地区这一条我们不照网页（见用例表里 loc() 的说明）：把运行时取到的默认
    // 地区交给网页，依赖默认地区的那几条用例在网页里改用它
    const systemLocale = new Intl.NumberFormat().resolvedOptions().locale;
    const source =
      '(function () {' +
      '  var __nacreDefaultLocale = ' + JSON.stringify(systemLocale) + ';' +
      '  var run = ' + intlRunCase.toString() + ';' +
      '  var cases = (' + casesFn.toString() + ')();' +
      '  var out = [];' +
      '  for (var i = 0; i < cases.length; i++) out.push(run(cases[i][1]));' +
      '  return out;' +
      '})()';
    const theirs = /** @type {string[]} */ (await web.webContents.executeJavaScript(source));
    web.webContents.close();
    web.removeFromSuperview();

    // 运行时这边：同一张表，按时间片跑
    const cases = casesFn();
    assert('网页和运行时拿到的是同一张表', theirs.length, cases.length);
    /** @type {string[]} */
    const mine = [];
    while (mine.length < cases.length) {
      const sliceStart = performance.now();
      while (mine.length < cases.length && performance.now() - sliceStart < 6) {
        mine.push(intlRunCase(cases[mine.length][1]));
      }
      status.text = '比对中 ' + mine.length + ' / ' + cases.length;
      await sleep(0);
    }

    // 按组报
    /** @type {Map<string, { total: number, wrong: string[] }>} */
    const groups = new Map();
    let compared = 0;
    for (let i = 0; i < cases.length; i++) {
      const label = cases[i][0];
      const { key, expected: fixed } = classify(label);
      let group = groups.get(key);
      if (!group) { group = { total: 0, wrong: [] }; groups.set(key, group); }
      group.total++;
      const expected = fixed === undefined ? theirs[i] : fixed;
      if (fixed === undefined) compared++;
      if (mine[i] !== expected) {
        group.wrong.push(label + ' → 得到「' + mine[i] + '」，应该是「' + expected + '」');
      }
    }
    let wrongTotal = 0;
    for (const [key, group] of groups) {
      wrongTotal += group.wrong.length;
      assert(key + '（' + group.total + ' 条里不同的）', group.wrong.length, 0);
      for (const line of group.wrong.slice(0, 3)) console.log('      ' + line);
    }
    status.text = wrongTotal === 0
      ? '和网页逐条相同：' + compared + ' 条'
      : '有 ' + wrongTotal + ' 条和网页不同，见日志';
    console.log('  ' + (wrongTotal === 0 ? '✓' : '✗') + ' ' + name + ' 比对完了：' +
                compared + ' 条和网页比，' + (cases.length - compared) + ' 条断言抛');
  };
  queue = queue.then(run).catch((err) => {
    status.text = '比对没跑完，见日志';
    console.log('  ✗ ' + name + ' 的比对抛了:', err && err.message);
  });
}
