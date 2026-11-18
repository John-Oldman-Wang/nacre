// @ts-nocheck —— 这个文件成批地喂不合法的输入（选项给 null、地区给数字），
// 每一处都标 @ts-expect-error 反而看不清在测什么。
//
// Intl.NumberFormat 的对照用例。验收拿它在两处各跑一遍：同一台设备上网页里
// 的 Intl，和运行时自己的 Intl，然后逐条比对——「和 Web 一致」验的就是这个。
//
// intlNumberCases 必须**自包含**：它会被 toString() 之后送进网页里执行，
// 所以函数体里不能用这个文件里别的东西，也不能用 ES5 之外网页不一定有的写法。
// 返回 [标签, 取结果的函数] 的数组，执行由调用方做（运行时这边要分批，免得
// 三万多条一口气占住主线程）。
//
// 标签的第一段是类别：
//   F  format()：地区 | 选项 | 值
//   R  resolvedOptions()：地区 | 选项
//   L  地区标签解析成什么    LF 那个地区格式化出来什么
//   S  supportedLocalesOf / getCanonicalLocales
//   E  不合法的选项该抛什么
//   X  别的入口：toLocaleString、BigInt、字符串、不带 new……
export function intlNumberCases() {
  var out = [];
  var show = function (v) { return typeof v === 'bigint' ? v + 'n' : Object.is(v, -0) ? '-0' : String(v); };
  var run = function (label, fn) { out.push([label, fn]); };
  var locales = ['en-US', 'zh-CN', 'de-DE', 'ja-JP', 'ar-EG', 'en-IN', 'fr-FR', 'hi-IN', 'pt-BR', 'de-CH', 'ru-RU',
                 'es-ES', 'pl-PL', 'en-GB', 'ko-KR', 'th-TH', 'fa-IR', 'he-IL', 'zh-TW', 'zh-Hant-HK', 'bn-BD'];
  var values = [0, 1, -1, 1234567.891, 0.5, 1.005, 2.5, 3.5, 1234.5, 0.256, -0, 1e21, 0.000001234,
                987654321.123456789, NaN, Infinity, -Infinity, 1234, 12345, 100, 0.1 + 0.2, 1.45, -1234.5, 5e-7,
                -0.4, 0.045, -0.0004, 12345.678, -1];
  var options = [
    {}, { maximumFractionDigits: 0 }, { minimumFractionDigits: 2 }, { minimumFractionDigits: 2, maximumFractionDigits: 2 },
    { style: 'percent' }, { style: 'percent', maximumFractionDigits: 1 },
    { style: 'currency', currency: 'USD' }, { style: 'currency', currency: 'JPY' }, { style: 'currency', currency: 'EUR' },
    { style: 'currency', currency: 'CNY' }, { style: 'currency', currency: 'USD', currencyDisplay: 'code' },
    { style: 'currency', currency: 'USD', currencyDisplay: 'name' }, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 },
    { useGrouping: false }, { minimumIntegerDigits: 3 }, { maximumSignificantDigits: 3 }, { minimumSignificantDigits: 5 },
    { signDisplay: 'always' }, { signDisplay: 'exceptZero' }, { signDisplay: 'never' }, { signDisplay: 'negative' },
    { style: 'currency', currency: 'USD', currencySign: 'accounting' }, { style: 'currency', currency: 'USD', signDisplay: 'always' },
    { style: 'percent', signDisplay: 'exceptZero' },
    { useGrouping: 'always' }, { useGrouping: 'min2' }, { useGrouping: true },
    { roundingMode: 'halfEven', maximumFractionDigits: 0 }, { roundingMode: 'trunc', maximumFractionDigits: 1 },
    { roundingMode: 'ceil', maximumFractionDigits: 0 }, { roundingMode: 'floor', maximumFractionDigits: 0 },
    { roundingMode: 'expand', maximumFractionDigits: 0 }, { roundingMode: 'halfTrunc', maximumFractionDigits: 0 },
    { roundingMode: 'halfCeil', maximumFractionDigits: 0 }, { roundingMode: 'halfFloor', maximumFractionDigits: 0 },
    { numberingSystem: 'arab' }, { numberingSystem: 'latn' },
    { numberingSystem: 'hanidec' }, { numberingSystem: 'thai' }, { numberingSystem: 'deva' }, { numberingSystem: 'fullwide' },
    { numberingSystem: 'arab', style: 'currency', currency: 'USD' }, { useGrouping: 'always', style: 'currency', currency: 'EUR' }, { useGrouping: 'min2', style: 'percent' },
    { signDisplay: 'negative', style: 'currency', currency: 'USD' }, { signDisplay: 'negative', maximumFractionDigits: 0 },
    { style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol' },
    { notation: 'scientific' }, { notation: 'engineering' }, { notation: 'compact' }, { notation: 'compact', compactDisplay: 'long' },
    { style: 'unit', unit: 'kilometer' },
    { trailingZeroDisplay: 'stripIfInteger', minimumFractionDigits: 2 },
    { maximumFractionDigits: 20 }, { maximumFractionDigits: 6 }, { style: 'currency', currency: 'KWD' },
    { style: 'currency', currency: 'usd' }, { roundingIncrement: 5, maximumFractionDigits: 2, minimumFractionDigits: 2 },
    { roundingPriority: 'morePrecision', maximumSignificantDigits: 2, maximumFractionDigits: 3 },
    // 组合：单项都对上不代表组合也对上
    { notation: 'compact', maximumFractionDigits: 1 }, { notation: 'compact', maximumSignificantDigits: 3 },
    { notation: 'compact', style: 'currency', currency: 'USD' }, { notation: 'compact', useGrouping: 'always' },
    { notation: 'compact', signDisplay: 'always' }, { notation: 'compact', style: 'percent' },
    { notation: 'scientific', maximumFractionDigits: 1 }, { notation: 'scientific', maximumSignificantDigits: 2 },
    { style: 'percent', minimumFractionDigits: 2 }, { style: 'percent', numberingSystem: 'thai' },
    { style: 'percent', signDisplay: 'negative' },
    { style: 'currency', currency: 'USD', maximumSignificantDigits: 3 },
    { style: 'currency', currency: 'EUR', roundingIncrement: 5, minimumFractionDigits: 2, maximumFractionDigits: 2 },
    { style: 'currency', currency: 'USD', currencySign: 'accounting', signDisplay: 'exceptZero' },
    { style: 'currency', currency: 'USD', currencySign: 'accounting', signDisplay: 'never' },
    { style: 'currency', currency: 'JPY', currencyDisplay: 'name', signDisplay: 'always' },
    { style: 'currency', currency: 'CNY', currencyDisplay: 'narrowSymbol', useGrouping: false },
    { minimumIntegerDigits: 3, useGrouping: false, minimumFractionDigits: 1 },
    { minimumIntegerDigits: 2, maximumSignificantDigits: 3 },
    { roundingMode: 'floor', style: 'currency', currency: 'USD' }, { roundingMode: 'ceil', style: 'percent', maximumFractionDigits: 1 },
  ];
  for (var l = 0; l < locales.length; l++) for (var o = 0; o < options.length; o++) for (var v = 0; v < values.length; v++) {
    (function (loc, opt, val) {
      run('F|' + loc + '|' + JSON.stringify(opt) + '|' + show(val), function () { return new Intl.NumberFormat(loc, opt).format(val); });
    })(locales[l], options[o], values[v]);
  }
  // 解析之后的选项（键的顺序也要一致）
  for (var o2 = 0; o2 < options.length; o2++) for (var l2 = 0; l2 < 3; l2++) {
    (function (loc, opt) {
      run('R|' + loc + '|' + JSON.stringify(opt), function () { return new Intl.NumberFormat(loc, opt).resolvedOptions(); });
    })(['en-US', 'ar-EG', 'ja-JP'][l2], options[o2]);
  }
  // 地区标签怎么解析
  // 不指定地区、或者给的地区解析不了要退回默认时，运行时跟的是**系统的首选语言**。
  // 网页不是：它为了防指纹把系统语言压成少数几种（简体中文加香港地区在网页里是
  // zh-CN，德语奥地利是 de-DE），压缩用的是系统的私有接口。这一条我们有意不照网页，
  // 见 docs/internals/intl.md。
  //
  // 所以这些用例在网页那一边改成显式指定运行时取到的那个默认地区（验收把它放在
  // __nacreDefaultLocale 里），验的是「不指定」等于「指定系统首选语言」；那种语言
  // 本身怎么写，仍然由网页把关。运行时这一边没有这个变量，loc() 原样返回
  var systemLocale = (typeof __nacreDefaultLocale === 'string') ? __nacreDefaultLocale : undefined;
  var loc = function (tag) {
    if (systemLocale === undefined) return tag;
    if (tag === undefined || typeof tag === 'number') return systemLocale;   // 数字 → 空列表 → 默认
    if (typeof tag === 'string') return [tag, systemLocale];                  // 解析不了才轮到后面那个
    return tag;                                                               // null 之类：照样抛
  };
  var tags = [undefined, 'zh', 'zh-CN', 'zh-Hans', 'zh-Hans-CN', 'zh-TW', 'zh-HK', 'en', 'en-GB', 'EN-us', 'en-ZZ', 'xx', 'xx-YY',
              'de-CH-1996', 'sr-Latn-RS', 'pt', 'pt-PT', 'es-419', 'en-US-u-nu-arab', 'ar-u-nu-latn', 'th-TH-u-nu-thai',
              'en_US', '', 'e', 'english', 'en-', 'i-klingon', 'und', 'en-US-x-private', 'tlh', 'yue-Hant-HK', 'fil', 'nb', 'no'];
  for (var t = 0; t < tags.length; t++) {
    (function (tag) {
      run('L|' + String(tag), function () { return new Intl.NumberFormat(loc(tag)).resolvedOptions().locale; });
      run('LF|' + String(tag), function () { return new Intl.NumberFormat(loc(tag)).format(1234567.891); });
    })(tags[t]);
  }
  run('L|[xx,de-DE]', function () { return new Intl.NumberFormat(['xx', 'de-DE']).resolvedOptions().locale; });
  run('L|[]', function () { return new Intl.NumberFormat([]).resolvedOptions().locale === new Intl.NumberFormat().resolvedOptions().locale; });
  run('L|null', function () { return new Intl.NumberFormat(null).resolvedOptions().locale; });
  run('L|5', function () { return new Intl.NumberFormat(loc(5)).resolvedOptions().locale; });
  run('L|[5]', function () { return new Intl.NumberFormat([5]).resolvedOptions().locale; });
  run('S|supportedLocalesOf', function () { return Intl.NumberFormat.supportedLocalesOf(['zh-CN', 'xx', 'en-us', 'de-CH-1996']); });
  run('S|getCanonicalLocales', function () { return Intl.getCanonicalLocales(['EN-us', 'zh-hans-cn', 'sr-latn']); });
  // 选项不合法
  var bad = [{ style: 'money' }, { style: 'currency' }, { style: 'currency', currency: 'US' }, { style: 'currency', currency: '12$' },
             { currencyDisplay: 'big' }, { minimumFractionDigits: -1 }, { minimumFractionDigits: 101 }, { maximumFractionDigits: 1, minimumFractionDigits: 3 },
             { minimumIntegerDigits: 0 }, { minimumIntegerDigits: 22 }, { maximumSignificantDigits: 0 }, { minimumSignificantDigits: 3, maximumSignificantDigits: 2 },
             { useGrouping: 'sometimes' }, { signDisplay: 'loud' }, { notation: 'tiny' }, { roundingMode: 'up' }, { localeMatcher: 'exact' },
             { numberingSystem: 'bad!' }, { style: 'unit' }, { minimumFractionDigits: 'x' }, { maximumFractionDigits: 2.7 }, { minimumFractionDigits: '2' },
             null, 5, 'str'];
  for (var b = 0; b < bad.length; b++) {
    (function (opt) {
      run('E|' + JSON.stringify(opt), function () { return new Intl.NumberFormat('en-US', opt).format(1234.5678); });
    })(bad[b]);
  }
  // 别的入口
  run('X|toLocaleString()', function () { return (1234567.891).toLocaleString('de-DE'); });
  run('X|toLocaleString currency', function () { return (1234.5).toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' }); });
  run('X|bigint.toLocaleString', function () { return (123456789012345678901234567890n).toLocaleString('en-US'); });
  run('X|format(bigint)', function () { return new Intl.NumberFormat('de-DE').format(12345678901234567890n); });
  run('X|format(bigint) currency', function () { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(-98765432109876543210n); });
  run('X|format(string)', function () { return new Intl.NumberFormat('en-US').format('1234.5'); });
  run('X|format(string bad)', function () { return new Intl.NumberFormat('en-US').format('abc'); });
  run('X|format(null)', function () { return new Intl.NumberFormat('en-US').format(null); });
  run('X|format(undefined)', function () { return new Intl.NumberFormat('en-US').format(undefined); });
  run('X|format(true)', function () { return new Intl.NumberFormat('en-US').format(true); });
  run('X|format()', function () { return new Intl.NumberFormat('en-US').format(); });
  run('X|format is bound', function () { var f = new Intl.NumberFormat('en-US').format; return [1234, 5678].map(f).join('|'); });
  run('X|without new', function () { return Intl.NumberFormat('en-US').format(1234); });
  run('X|toString tag', function () { return Object.prototype.toString.call(new Intl.NumberFormat()) + Object.prototype.toString.call(Intl); });
  run('X|instanceof', function () { return new Intl.NumberFormat() instanceof Intl.NumberFormat; });
  run('X|format.name/length', function () { var d = Object.getOwnPropertyDescriptor(Intl.NumberFormat.prototype, 'format'); return [typeof d.get, Intl.NumberFormat.length, Intl.NumberFormat.name, new Intl.NumberFormat().format.length]; });
  run('X|keys', function () { return Object.getOwnPropertyNames(Intl.NumberFormat.prototype).sort(); });
  run('X|array.toLocaleString', function () { return [1234.5, 0.5].toLocaleString('de-DE'); });
  run('X|large safe', function () { return new Intl.NumberFormat('en-US').format(9007199254740993); });
  run('X|1e-7', function () { return new Intl.NumberFormat('en-US', { maximumFractionDigits: 10 }).format(1e-7); });
  run('X|bigint 45 digits', function () { return new Intl.NumberFormat('en-US').format(123456789012345678901234567890123456789012345n); });
  run('X|string long decimal', function () { return new Intl.NumberFormat('en-US', { maximumFractionDigits: 20 }).format('1234567890123456789.123456789'); });
  run('X|string exp', function () { return new Intl.NumberFormat('en-US').format('1e3'); });
  run('X|string hex', function () { return new Intl.NumberFormat('en-US').format('0x10'); });
  run('X|string spaces', function () { return new Intl.NumberFormat('en-US').format('  12.50  '); });
  run('X|123456789012345680000', function () { return new Intl.NumberFormat('en-US').format(123456789012345680000); });
    return out;
}

// 这几组选项运行时**明确不支持**：系统公开的格式化接口做不出来。网页里它们
// 是能用的，所以不拿来比对，而是断言构造时抛 RangeError。
// 怎么定的见 docs/internals/intl.md。
export const INTL_NUMBER_UNSUPPORTED = [
  '{"roundingMode":"halfTrunc","maximumFractionDigits":0}',
  '{"roundingMode":"halfCeil","maximumFractionDigits":0}',
  '{"roundingMode":"halfFloor","maximumFractionDigits":0}',
  '{"notation":"engineering"}',
  '{"notation":"compact","compactDisplay":"long"}',
  '{"style":"unit","unit":"kilometer"}',
  '{"trailingZeroDisplay":"stripIfInteger","minimumFractionDigits":2}',
  '{"roundingPriority":"morePrecision","maximumSignificantDigits":2,"maximumFractionDigits":3}',
  // 「整数至少几位」和有效数字一起用：系统的接口只能二选一
  '{"minimumIntegerDigits":2,"maximumSignificantDigits":3}',
];

// 同样是明确不支持、但不是按选项分的：这几条用例断言抛 RangeError。
//   45 位的 BigInt：系统的十进制数最多 38 位有效数字，再长会丢位
export const INTL_NUMBER_REJECTED_LABELS = ['X|bigint 45 digits'];

// 执行一条用例，结果统一成字符串。抛了就记异常的名字。
// 同样要自包含（网页里用的是它的 toString()）。
export function intlRunCase(fn) {
  try {
    var r = fn();
    return typeof r === 'string' ? r : JSON.stringify(r);
  } catch (e) {
    return '抛 ' + (e && e.name);
  }
}
