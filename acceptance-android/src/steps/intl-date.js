// 拷自 acceptance/src/steps/intl-date.js，去掉了和网页逐条比对的那一段（连同区块和状态标签）。
//
// **和 iOS 不同的 1 条**（2026-11-23 定）：en-US 的 dateStyle medium + timeStyle short，iOS 的期望照 Safari（日期和时间之间是「at」）；Android 照 Chrome，两者底下都是 ICU，用逗号。名字也跟着改了。
//
// Intl.DateTimeFormat：按地区写日期和时间。
//
// 这里是固定期望值的断言，和明确不支持的 formatRangeToParts。
import { runCase } from '../support.js';

/** @param {import("../main.js").StepContext} ctx */
export function stepIntlDate(ctx) {
  const { assert } = ctx;
  console.log('  --- Intl.DateTimeFormat ---');

  // ===== 1. 不用网页也能验的：固定的期望值 =====
  // 期望值是从这台模拟器的网页里抄的。全部给了时区，结果不随设备的时区变。
  const when = new Date(Date.UTC(2026, 0, 5, 3, 4, 5, 678));   // 2026-01-05 03:04:05.678 UTC，周一
  const literal = (/** @type {string} */ label, /** @type {() => unknown} */ fn,
                   /** @type {string} */ expected) => assert(label, runCase(fn), expected);
  literal('Intl.DateTimeFormat 是个函数', () => typeof Intl.DateTimeFormat, 'function');
  literal('dateStyle + timeStyle，换到纽约是前一天晚上（照 Chrome，用逗号）',
          () => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short',
                                                   timeZone: 'America/New_York' }).format(when),
          'Jan 4, 2026, 10:04 PM');
  literal('按字段选：德语的年月日',
          () => new Intl.DateTimeFormat('de-DE', { year: 'numeric', month: 'long', day: 'numeric',
                                                   timeZone: 'UTC' }).format(when),
          '5. Januar 2026');
  literal('只要星期几', () => new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'UTC' }).format(when),
          'Monday');
  // 这两条是一对：分钟写 2-digit 时中文的小时是一位，写 numeric 时反而是两位。
  // 看着怪，但网页就是这样（取决于系统的格式数据里匹配到哪一条）
  literal('中文 小时 numeric + 分钟 2-digit：小时一位',
          () => new Intl.DateTimeFormat('zh-CN', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }).format(when),
          '3:04');
  literal('中文 小时 numeric + 分钟 numeric：小时两位',
          () => new Intl.DateTimeFormat('zh-CN', { hour: 'numeric', minute: 'numeric', timeZone: 'UTC' }).format(when),
          '03:04');
  literal('hour12: false 换成 24 小时制',
          () => new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: false,
                                                   timeZone: 'UTC' }).format(when),
          '03:04');
  literal('换日历：日本年号',
          () => new Intl.DateTimeFormat('ja-JP', { calendar: 'japanese', dateStyle: 'long',
                                                   timeZone: 'UTC' }).format(when),
          '令和8年1月5日');
  literal('带时区的名字',
          () => new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
                                                   timeZone: 'America/New_York' }).format(when),
          '10:04 PM EST');
  literal('时区名大小写不敏感，读出来是规范的写法',
          () => new Intl.DateTimeFormat('en-US', { timeZone: 'asia/shanghai' }).resolvedOptions().timeZone,
          'Asia/Shanghai');
  literal('formatToParts 的类型',
          () => new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit',
                                                   timeZone: 'America/New_York' }).formatToParts(when),
          '[{"type":"hour","value":"10"},{"type":"literal","value":":"},{"type":"minute","value":"04"},' +
          '{"type":"literal","value":" "},{"type":"dayPeriod","value":"PM"}]');
  literal('formatRange：同一个月里的两天',
          () => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' })
            .formatRange(new Date(Date.UTC(2026, 10, 15, 8)), new Date(Date.UTC(2026, 10, 18, 8))),
          'Nov 15 – 18, 2026');
  literal('resolvedOptions 的键和顺序',
          () => new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit',
                                                   timeZone: 'Asia/Kolkata' }).resolvedOptions(),
          '{"locale":"en-US","calendar":"gregory","numberingSystem":"latn","timeZone":"Asia/Kolkata",' +
          '"hourCycle":"h12","hour12":true,"dayPeriod":"short","hour":"numeric","minute":"2-digit"}');
  const moment = new Date(Date.UTC(2026, 10, 15, 15, 5, 9));
  literal('Date.prototype.toLocaleString 认地区了',
          () => moment.toLocaleString('de-DE', { timeZone: 'UTC' }), '15.11.2026, 15:05:09');
  literal('toLocaleDateString 只有日期', () => moment.toLocaleDateString('en-US', { timeZone: 'UTC' }),
          '11/15/2026');
  literal('toLocaleTimeString 只有时间', () => moment.toLocaleTimeString('en-US', { timeZone: 'UTC' }),
          '3:05:09 PM');
  literal('无效日期的 toLocaleString 不抛', () => new Date(NaN).toLocaleString('en-US'), 'Invalid Date');
  literal('无效日期的 format 抛 RangeError', () => new Intl.DateTimeFormat('en-US').format(new Date(NaN)),
          '抛 RangeError');
  literal('不认识的时区抛 RangeError', () => new Intl.DateTimeFormat('en-US', { timeZone: 'Mars/Olympus' }),
          '抛 RangeError');
  literal('dateStyle 不能和单个字段一起用，抛 TypeError',
          () => new Intl.DateTimeFormat('en-US', { dateStyle: 'short', year: 'numeric' }), '抛 TypeError');
  // 数字那一步的入口还在
  literal('Intl.NumberFormat 没被这一步弄坏', () => new Intl.NumberFormat('de-DE').format(1234.5), '1.234,5');

  // ===== 2. 明确不支持的：formatRangeToParts =====
  try {
    new Intl.DateTimeFormat('en-US').formatRangeToParts(new Date(0), new Date(86400000));
    console.log('  ✗ formatRangeToParts 居然没抛');
  } catch (err) {
    const e = /** @type {Error} */ (err);
    const ok = e.name === 'TypeError' && String(e.message).includes('formatRangeToParts') &&
               String(e.message).includes('not supported');
    assert('formatRangeToParts 还不能用，抛 TypeError 并点名', ok ? 'TypeError' : e.name + ': ' + e.message,
           'TypeError');
  }
}
