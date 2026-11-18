// Intl.NumberFormat：按地区格式化数字。
//
// 「和 Web 一致」在这里是一条机械的检查：同一组用例在这台设备的网页里跑
// 一遍、在运行时里跑一遍，逐条比对。三万多条，按选项分组报。
import {
  intlNumberCases, intlRunCase, INTL_NUMBER_UNSUPPORTED, INTL_NUMBER_REJECTED_LABELS,
} from './intl-number-cases.js';
import { compareWithWebPage } from './intl-compare.js';

/** @param {import("../main.js").StepContext} ctx */
export function stepIntlNumber(ctx) {
  const { assert } = ctx;
  const host = ctx.section('Intl.NumberFormat：和网页里的 Intl 逐条比对', 44);
  console.log('  --- Intl.NumberFormat ---');

  const status = new UILabel();
  status.frame = new CGRect(16, 8, 340, 28);
  status.font = UIFont.systemFontOfSize(13);
  status.textColor = 'secondaryLabel';
  status.text = '还没开始比对';
  host.addSubview(status);

  // ===== 1. 不用网页也能验的：固定的期望值 =====
  // 网页那边万一起不来，这几条还在。期望值是从这台模拟器的网页里抄的。
  const literal = (/** @type {string} */ label, /** @type {() => unknown} */ fn,
                   /** @type {string} */ expected) => assert(label, intlRunCase(fn), expected);
  literal('Intl 是个对象', () => typeof Intl, 'object');
  literal('en-US 千分位', () => new Intl.NumberFormat('en-US').format(1234567.891), '1,234,567.891');
  literal('en-IN 的分组是 3-2-2', () => new Intl.NumberFormat('en-IN').format(1234567.891),
          '12,34,567.891');
  literal('de-DE 欧元（中间是不换行空格）',
          () => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(1234567.891),
          '1.234.567,89 €');
  literal('zh-CN 紧凑写法',
          () => new Intl.NumberFormat('zh-CN', { notation: 'compact' }).format(1234567.891), '123万');
  literal('百分比', () => new Intl.NumberFormat('en-US', { style: 'percent' }).format(0.256), '26%');
  literal('会计格式的负数用括号',
          () => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', currencySign: 'accounting' })
            .format(-1234.5), '($1,234.50)');
  literal('signDisplay: always', () => new Intl.NumberFormat('en-US', { signDisplay: 'always' }).format(1234.5),
          '+1,234.5');
  literal('科学计数', () => new Intl.NumberFormat('en-US', { notation: 'scientific' }).format(1234567.891),
          '1.235E6');
  literal('换数字系统', () => new Intl.NumberFormat('en-US', { numberingSystem: 'arab' }).format(1234.5),
          '١٬٢٣٤٫٥');
  literal('Number.prototype.toLocaleString 认地区了', () => (1234567.891).toLocaleString('de-DE'),
          '1.234.567,891');
  literal('toLocaleString 认选项了',
          () => (1234.5).toLocaleString('en-US', { style: 'currency', currency: 'USD' }), '$1,234.50');
  literal('数组的 toLocaleString 把地区传给每个成员',
          () => [1234.5, 0.5].toLocaleString('de-DE'), '1.234,5,0,5');
  literal('类型化数组的 toLocaleString 也一样',
          () => new Float64Array([1234.5, 0.5]).toLocaleString('de-DE'), '1.234,5,0,5');
  literal('BigInt.prototype.toLocaleString',
          () => (123456789012345678901234567890n).toLocaleString('en-US'),
          '123,456,789,012,345,678,901,234,567,890');
  literal('resolvedOptions 的键和顺序',
          () => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'usd' }).resolvedOptions(),
          '{"locale":"en-US","numberingSystem":"latn","style":"currency","currency":"USD",' +
          '"currencyDisplay":"symbol","currencySign":"standard","minimumIntegerDigits":1,' +
          '"minimumFractionDigits":2,"maximumFractionDigits":2,"useGrouping":"auto",' +
          '"notation":"standard","signDisplay":"auto","roundingIncrement":1,' +
          '"roundingMode":"halfExpand","roundingPriority":"auto","trailingZeroDisplay":"auto"}');

  // ===== 2. 明确不支持的：要抛，而且错误信息要说清是哪个选项 =====
  /** @param {string} label @param {() => unknown} fn @param {string} name @param {string[]} words */
  const rejects = (label, fn, name, words) => {
    try {
      fn();
      console.log('  ✗ ' + label + '：居然没抛');
    } catch (err) {
      const e = /** @type {Error} */ (err);
      const ok = e.name === name && words.every((w) => String(e.message).includes(w));
      assert(label, ok ? name : e.name + ': ' + e.message, name);
    }
  };
  rejects('不支持的 notation 抛 RangeError，并点名',
          () => new Intl.NumberFormat('en-US', { notation: 'engineering' }),
          'RangeError', ['notation', 'engineering', 'not supported']);
  rejects('不支持的 style: unit 抛 RangeError',
          () => new Intl.NumberFormat('en-US', { style: 'unit', unit: 'kilometer' }),
          'RangeError', ['unit', 'not supported']);
  rejects('不支持的 roundingMode 抛 RangeError',
          () => new Intl.NumberFormat('en-US', { roundingMode: 'halfCeil' }),
          'RangeError', ['roundingMode', 'halfCeil', 'not supported']);
  rejects('不支持的 trailingZeroDisplay 抛 RangeError',
          () => new Intl.NumberFormat('en-US', { trailingZeroDisplay: 'stripIfInteger' }),
          'RangeError', ['trailingZeroDisplay', 'not supported']);
  rejects('不支持的 compactDisplay: long 抛 RangeError',
          () => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'long' }),
          'RangeError', ['compactDisplay', 'not supported']);
  rejects('不支持的 roundingPriority 抛 RangeError',
          () => new Intl.NumberFormat('en-US', { roundingPriority: 'lessPrecision' }),
          'RangeError', ['roundingPriority', 'not supported']);
  rejects('整数至少几位和有效数字一起用，抛 RangeError',
          () => new Intl.NumberFormat('en-US', { minimumIntegerDigits: 2, maximumSignificantDigits: 3 }),
          'RangeError', ['minimumIntegerDigits', 'not supported']);
  rejects('超过 38 位有效数字的 BigInt 抛 RangeError，不悄悄丢位',
          () => new Intl.NumberFormat('en-US').format(123456789012345678901234567890123456789012345n),
          'RangeError', ['38', 'not supported']);
  literal('38 位以内的 BigInt 一位不丢',
          () => new Intl.NumberFormat('en-US').format(12345678901234567890123456789012345678n),
          '12,345,678,901,234,567,890,123,456,789,012,345,678');
  // 标准里本来就不合法的值，报的是标准的错，不是「不支持」
  rejects('本来就不合法的 notation 也是 RangeError', () =>
    // @ts-expect-error notation 没有这个值
    new Intl.NumberFormat('en-US', { notation: 'tiny' }), 'RangeError', ['notation', 'tiny']);
  // 这一步不做的三个方法：在，但调了就抛
  rejects('formatToParts 还不能用，抛 TypeError',
          () => new Intl.NumberFormat('en-US').formatToParts(1), 'TypeError', ['formatToParts', 'not supported']);
  rejects('formatRange 还不能用，抛 TypeError',
          () => new Intl.NumberFormat('en-US').formatRange(1, 2), 'TypeError', ['formatRange', 'not supported']);
  rejects('formatRangeToParts 还不能用，抛 TypeError',
          () => new Intl.NumberFormat('en-US').formatRangeToParts(1, 2),
          'TypeError', ['formatRangeToParts', 'not supported']);

  // ===== 3. 和网页逐条比对 =====
  const unsupported = new Set(INTL_NUMBER_UNSUPPORTED);
  compareWithWebPage({
    after: ctx.quiet,
    assert, host, status, name: 'Intl.NumberFormat', casesFn: intlNumberCases,
    classify(label) {
      const parts = label.split('|');
      const kind = parts[0];
      const isOption = kind === 'F' || kind === 'R';
      const rejected = (isOption && unsupported.has(parts[2])) ||
                       INTL_NUMBER_REJECTED_LABELS.includes(label);
      const key = (!rejected ? '和网页一致：'
                   : isOption ? '不支持的选项要抛 RangeError：' : '不支持的值要抛 RangeError：') +
                  (kind === 'F' ? 'format ' + parts[2]
                   : kind === 'R' ? 'resolvedOptions（全部选项组）'
                   : kind === 'L' ? '地区标签解析成什么'
                   : kind === 'LF' ? '各种地区标签的格式化结果'
                   : kind === 'S' ? 'supportedLocalesOf / getCanonicalLocales'
                   : kind === 'E' ? '不合法的选项该抛什么'
                   : '别的入口（toLocaleString、BigInt、字符串、不带 new）');
      return rejected ? { key, expected: '抛 RangeError' } : { key };
    },
  });
}
