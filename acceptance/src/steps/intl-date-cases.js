// @ts-nocheck —— 这个文件成批地喂不合法的输入，每一处都标 @ts-expect-error 反而看不清在测什么。
//
// Intl.DateTimeFormat 的对照用例。和 intl-number-cases.js 一个做法：自包含的函数，返回
// [标签, 取结果的函数]，验收拿它在网页里和运行时里各跑一遍，逐条比对。
//
// 标签的第一段是类别：
//   F  format()：地区 | 选项 | 时区 | 时刻（毫秒）
//   P  formatToParts()：地区 | 选项          R  resolvedOptions()：地区 | 选项
//   G  formatRange()：地区 | 选项 | 第几段时间
//   Z  时区名认不认、认成什么             L  地区标签里的扩展（日历、小时制、数字系统）
//   S  supportedLocalesOf               E  不合法的选项该抛什么
//   X  别的入口：Date 的三个 toLocale*String、无效日期、不带 new……
export function intlDateCases() {
  var out = [];
  var run = function (label, fn) { out.push([label, fn]); };
  var locales = ['en-US', 'zh-CN', 'de-DE', 'ja-JP', 'ar-EG', 'en-IN', 'fr-FR', 'hi-IN', 'pt-BR', 'de-CH', 'ru-RU',
                 'es-ES', 'pl-PL', 'en-GB', 'ko-KR', 'th-TH', 'fa-IR', 'he-IL', 'zh-TW', 'zh-Hant-HK', 'bn-BD'];
  var dates = [0, Date.UTC(2026, 10, 15, 0, 0, 0), Date.UTC(2026, 0, 5, 3, 4, 5, 678), Date.UTC(2024, 1, 29, 23, 59, 59, 999),
               Date.UTC(2026, 5, 21, 12, 0, 0), Date.UTC(1969, 6, 20, 20, 17, 40), Date.UTC(2026, 2, 8, 6, 59, 59),
               Date.UTC(1900, 0, 1, 0, 0, 0)];
  var zones = ['UTC', 'America/New_York', 'Asia/Kolkata'];
  var options = [
    {},
    { dateStyle: 'full' }, { dateStyle: 'long' }, { dateStyle: 'medium' }, { dateStyle: 'short' },
    { timeStyle: 'full' }, { timeStyle: 'long' }, { timeStyle: 'medium' }, { timeStyle: 'short' },
    { dateStyle: 'full', timeStyle: 'full' }, { dateStyle: 'long', timeStyle: 'long' }, { dateStyle: 'medium', timeStyle: 'medium' },
    { dateStyle: 'short', timeStyle: 'short' }, { dateStyle: 'medium', timeStyle: 'short' }, { dateStyle: 'long', timeStyle: 'short' },
    { dateStyle: 'short', timeStyle: 'medium' },
    { year: 'numeric', month: 'long', day: 'numeric' }, { year: 'numeric', month: 'short', day: 'numeric' },
    { year: 'numeric', month: '2-digit', day: '2-digit' }, { year: '2-digit', month: 'numeric', day: 'numeric' },
    { month: 'long', day: 'numeric' }, { month: 'short', day: 'numeric' }, { year: 'numeric', month: 'long' },
    { year: 'numeric' }, { month: 'long' }, { month: 'narrow' }, { day: 'numeric' }, { month: 'numeric', day: 'numeric' },
    { weekday: 'long' }, { weekday: 'short' }, { weekday: 'narrow' },
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }, { weekday: 'short', month: 'short', day: 'numeric' },
    { hour: 'numeric' }, { hour: '2-digit' }, { hour: 'numeric', minute: '2-digit' }, { hour: '2-digit', minute: '2-digit' },
    { hour: 'numeric', minute: '2-digit', second: '2-digit' }, { minute: '2-digit', second: '2-digit' },
    { hour: 'numeric', minute: 'numeric' }, { second: 'numeric' }, { minute: 'numeric' },
    { hour: 'numeric', minute: '2-digit', hour12: true }, { hour: 'numeric', minute: '2-digit', hour12: false },
    { hour: 'numeric', minute: '2-digit', hourCycle: 'h11' }, { hour: 'numeric', minute: '2-digit', hourCycle: 'h12' },
    { hour: 'numeric', minute: '2-digit', hourCycle: 'h23' }, { hour: 'numeric', minute: '2-digit', hourCycle: 'h24' },
    { hour: '2-digit', minute: '2-digit', hour12: false }, { hour: '2-digit', minute: '2-digit', hour12: true },
    { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }, { hour: 'numeric', minute: '2-digit', timeZoneName: 'long' },
    { hour: 'numeric', minute: '2-digit', timeZoneName: 'shortOffset' }, { hour: 'numeric', minute: '2-digit', timeZoneName: 'longOffset' },
    { hour: 'numeric', minute: '2-digit', timeZoneName: 'shortGeneric' }, { hour: 'numeric', minute: '2-digit', timeZoneName: 'longGeneric' },
    { timeZoneName: 'short' },
    { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit' },
    { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' },
    { weekday: 'long', hour: 'numeric', minute: '2-digit' },
    { era: 'short' }, { era: 'long', year: 'numeric' }, { year: 'numeric', era: 'narrow', month: 'long' },
    { fractionalSecondDigits: 3 }, { second: '2-digit', fractionalSecondDigits: 2 },
    { hour: 'numeric', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 1 },
    { dayPeriod: 'long' }, { hour: 'numeric', dayPeriod: 'short' }, { hour: 'numeric', dayPeriod: 'narrow', hour12: true },
    { calendar: 'buddhist' }, { calendar: 'japanese', dateStyle: 'long' }, { calendar: 'chinese', dateStyle: 'medium' },
    { calendar: 'islamic-umalqura' }, { calendar: 'gregory', dateStyle: 'short' }, { calendar: 'persian', year: 'numeric', month: 'long', day: 'numeric' },
    { numberingSystem: 'arab', dateStyle: 'short' }, { numberingSystem: 'hanidec', year: 'numeric', month: 'long', day: 'numeric' },
    { dateStyle: 'short', timeStyle: 'short', hour12: false }, { timeStyle: 'short', hourCycle: 'h23' }, { timeStyle: 'medium', hour12: true },
    { timeStyle: 'short', hourCycle: 'h12' },
  ];
  var withZone = function (opt, zone) { var o = {}; for (var k in opt) o[k] = opt[k]; o.timeZone = zone; return o; };
  for (var l = 0; l < locales.length; l++) for (var o = 0; o < options.length; o++) for (var z = 0; z < zones.length; z++) for (var d = 0; d < dates.length; d++) {
    (function (loc, opt, zone, ms) {
      run('F|' + loc + '|' + JSON.stringify(opt) + '|' + zone + '|' + ms, function () { return new Intl.DateTimeFormat(loc, withZone(opt, zone)).format(new Date(ms)); });
    })(locales[l], options[o], zones[z], dates[d]);
  }
  // 拆成一段一段的
  var partLocales = ['en-US', 'zh-CN', 'de-DE', 'ja-JP', 'ar-EG', 'fr-FR'];
  for (var l2 = 0; l2 < partLocales.length; l2++) for (var o2 = 0; o2 < options.length; o2++) {
    (function (loc, opt) {
      run('P|' + loc + '|' + JSON.stringify(opt), function () { return new Intl.DateTimeFormat(loc, withZone(opt, 'America/New_York')).formatToParts(new Date(Date.UTC(2026, 0, 5, 3, 4, 5, 678))); });
      run('R|' + loc + '|' + JSON.stringify(opt), function () { return new Intl.DateTimeFormat(loc, withZone(opt, 'Asia/Kolkata')).resolvedOptions(); });
    })(partLocales[l2], options[o2]);
  }
  // 一段时间
  var ranges = [[Date.UTC(2026, 10, 15, 8), Date.UTC(2026, 10, 15, 10, 30)], [Date.UTC(2026, 10, 15, 8), Date.UTC(2026, 10, 18, 8)],
                [Date.UTC(2026, 10, 15, 8), Date.UTC(2027, 1, 3, 20)], [Date.UTC(2026, 10, 15, 8), Date.UTC(2026, 10, 15, 8)]];
  var rangeOptions = [{}, { dateStyle: 'medium' }, { dateStyle: 'long', timeStyle: 'short' }, { timeStyle: 'short' }, { year: 'numeric', month: 'short', day: 'numeric' },
                      { hour: 'numeric', minute: '2-digit' }, { month: 'long', day: 'numeric' }, { year: 'numeric', month: 'long' }];
  for (var l3 = 0; l3 < partLocales.length; l3++) for (var o3 = 0; o3 < rangeOptions.length; o3++) for (var r = 0; r < ranges.length; r++) {
    (function (loc, opt, pair, index) {
      run('G|' + loc + '|' + JSON.stringify(opt) + '|' + index, function () { return new Intl.DateTimeFormat(loc, withZone(opt, 'UTC')).formatRange(new Date(pair[0]), new Date(pair[1])); });
    })(partLocales[l3], rangeOptions[o3], ranges[r], r);
  }
  var hourRanges = [{ hour: 'numeric', minute: '2-digit', hour12: false }, { hour: 'numeric', minute: '2-digit', hour12: true },
                    { timeStyle: 'short', hourCycle: 'h23' }, { dateStyle: 'short', timeStyle: 'short', hour12: true }, { hour: 'numeric', hourCycle: 'h11' },
                    { year: 'numeric', month: 'long', day: 'numeric', calendar: 'buddhist' }];
  for (var l4 = 0; l4 < partLocales.length; l4++) for (var o4 = 0; o4 < hourRanges.length; o4++) for (var r4 = 0; r4 < ranges.length; r4++) {
    (function (loc, opt, pair, index) {
      run('G|' + loc + '|' + JSON.stringify(opt) + '|' + index, function () { return new Intl.DateTimeFormat(loc, withZone(opt, 'Asia/Kolkata')).formatRange(new Date(pair[0]), new Date(pair[1])); });
    })(partLocales[l4], hourRanges[o4], ranges[r4], r4);
  }
  // 时区
  var tzs = ['UTC', 'utc', 'Etc/UTC', 'GMT', 'Asia/Shanghai', 'asia/shanghai', 'Asia/Calcutta', 'Asia/Kolkata', 'America/Los_Angeles', 'Europe/London',
             'Pacific/Auckland', 'America/Argentina/Buenos_Aires', 'Australia/Lord_Howe', '+08:00', '-05:30', '+0800', 'UTC+8', 'GMT+8', 'Etc/GMT-8', 'EST', 'PST',
             'Mars/Olympus', '', 'Asia/Peking', 'PRC', 'Z'];
  for (var t = 0; t < tzs.length; t++) {
    (function (tz) {
      run('Z|' + tz, function () { var f = new Intl.DateTimeFormat('en-US', { timeZone: tz, dateStyle: 'short', timeStyle: 'long' }); return f.resolvedOptions().timeZone + ' / ' + f.format(new Date(Date.UTC(2026, 10, 15, 0, 0, 0))); });
    })(tzs[t]);
  }
  run('Z|默认时区不是空的', function () { return typeof new Intl.DateTimeFormat().resolvedOptions().timeZone; });
  // 地区标签里的扩展
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
  var tags = [undefined, 'en-US-u-hc-h23', 'en-US-u-ca-buddhist', 'ja-JP-u-ca-japanese', 'th-TH', 'th-TH-u-ca-gregory', 'ar-SA', 'ar-SA-u-nu-latn', 'zh-CN-u-ca-chinese',
              'en-GB-u-hc-h12', 'fa-IR', 'fa-IR-u-ca-gregory', 'he-IL-u-ca-hebrew', 'en-US-u-hc-h11-ca-islamic', 'xx', 'en-ZZ'];
  for (var g = 0; g < tags.length; g++) {
    (function (tag) {
      run('L|' + String(tag), function () { var f = new Intl.DateTimeFormat(loc(tag), { timeZone: 'UTC', dateStyle: 'medium', timeStyle: 'short' }); var r = f.resolvedOptions(); return r.locale + ' ' + r.calendar + ' ' + r.numberingSystem + ' ' + r.hourCycle + ' / ' + f.format(new Date(Date.UTC(2026, 10, 15, 15, 5, 0))); });
    })(tags[g]);
  }
  run('S|supportedLocalesOf', function () { return Intl.DateTimeFormat.supportedLocalesOf(['zh-CN', 'xx', 'en-us']); });
  // 不合法的
  var bad = [{ dateStyle: 'huge' }, { timeStyle: 'tiny' }, { dateStyle: 'short', year: 'numeric' }, { timeStyle: 'short', hour: 'numeric' }, { dateStyle: 'short', weekday: 'long' },
             { year: 'full' }, { month: 'big' }, { day: '3-digit' }, { weekday: 'tiny' }, { hour: 'long' }, { minute: 'long' }, { second: 'x' }, { era: 'x' },
             { timeZoneName: 'x' }, { hourCycle: 'h25' }, { fractionalSecondDigits: 0 }, { fractionalSecondDigits: 4 }, { calendar: 'bad!' }, { numberingSystem: 'bad!' },
             { timeZone: 'Nowhere/City' }, { formatMatcher: 'x' }, { localeMatcher: 'x' }, { dayPeriod: 'x' }, { dateStyle: 'short', timeZoneName: 'short' },
             { dateStyle: 'short', fractionalSecondDigits: 1 }, { dateStyle: 'short', dayPeriod: 'short' }, { dateStyle: 'short', era: 'short' }, null, 5];
  for (var b = 0; b < bad.length; b++) {
    (function (opt) {
      run('E|' + JSON.stringify(opt), function () { return new Intl.DateTimeFormat('en-US', opt).format(new Date(0)); });
    })(bad[b]);
  }
  // 别的入口
  var when = new Date(Date.UTC(2026, 10, 15, 15, 5, 9));
  var u = { timeZone: 'UTC' };
  run('X|toLocaleString', function () { return when.toLocaleString('de-DE', u); });
  run('X|toLocaleDateString', function () { return when.toLocaleDateString('de-DE', u); });
  run('X|toLocaleTimeString', function () { return when.toLocaleTimeString('de-DE', u); });
  run('X|toLocaleString en', function () { return when.toLocaleString('en-US', u); });
  run('X|toLocaleDateString en', function () { return when.toLocaleDateString('en-US', u); });
  run('X|toLocaleTimeString en', function () { return when.toLocaleTimeString('en-US', u); });
  run('X|toLocaleString zh', function () { return when.toLocaleString('zh-CN', u); });
  run('X|toLocaleDateString 带选项', function () { return when.toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); });
  run('X|toLocaleDateString 只给时间选项', function () { return when.toLocaleDateString('en-US', { timeZone: 'UTC', hour: 'numeric' }); });
  run('X|toLocaleTimeString 只给日期选项', function () { return when.toLocaleTimeString('en-US', { timeZone: 'UTC', year: 'numeric' }); });
  run('X|toLocaleTimeString 带选项', function () { return when.toLocaleTimeString('en-US', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' }); });
  run('X|toLocaleDateString dateStyle', function () { return when.toLocaleDateString('en-US', { timeZone: 'UTC', dateStyle: 'full' }); });
  run('X|toLocaleDateString timeStyle', function () { return when.toLocaleDateString('en-US', { timeZone: 'UTC', timeStyle: 'short' }); });
  run('X|toLocaleTimeString dateStyle', function () { return when.toLocaleTimeString('en-US', { timeZone: 'UTC', dateStyle: 'short' }); });
  run('X|toLocaleString dateStyle', function () { return when.toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'medium', timeStyle: 'short' }); });
  run('X|无效日期 toLocaleString', function () { return new Date(NaN).toLocaleString('en-US'); });
  run('X|无效日期 format', function () { return new Intl.DateTimeFormat('en-US').format(new Date(NaN)); });
  run('X|format(数)', function () { return new Intl.DateTimeFormat('en-US', u).format(86400000); });
  run('X|format(字符串)', function () { return new Intl.DateTimeFormat('en-US', u).format('2026-11-15T00:00:00Z'); });
  run('X|format(null)', function () { return new Intl.DateTimeFormat('en-US', u).format(null); });
  run('X|format(超出范围)', function () { return new Intl.DateTimeFormat('en-US', u).format(8.64e15 + 1); });
  run('X|format 最大', function () { return new Intl.DateTimeFormat('en-US', u).format(8.64e15); });
  run('X|format 最小', function () { return new Intl.DateTimeFormat('en-US', withZone({ era: 'short', year: 'numeric', month: 'long', day: 'numeric' }, 'UTC')).format(-8.64e15); });
  run('X|公元前', function () { return new Intl.DateTimeFormat('en-US', withZone({ dateStyle: 'long' }, 'UTC')).format(new Date(Date.UTC(-100, 0, 1))); });
  run('X|公元前 era', function () { return new Intl.DateTimeFormat('en-US', withZone({ era: 'short', year: 'numeric' }, 'UTC')).format(new Date(Date.UTC(-100, 0, 1))); });
  run('X|format is bound', function () { var f = new Intl.DateTimeFormat('en-US', u).format; return [0, 86400000].map(function (x) { return f(x); }).join('|'); });
  run('X|without new', function () { return Intl.DateTimeFormat('en-US', u).format(0); });
  run('X|toString tag', function () { return Object.prototype.toString.call(new Intl.DateTimeFormat()); });
  run('X|keys', function () { return Object.getOwnPropertyNames(Intl.DateTimeFormat.prototype).sort(); });
  run('X|length', function () { return [Intl.DateTimeFormat.length, new Intl.DateTimeFormat().format.length]; });
  run('X|formatRange 反了', function () { return new Intl.DateTimeFormat('en-US', u).formatRange(86400000 * 3, 0); });
  run('X|formatRangeToParts', function () { return new Intl.DateTimeFormat('en-US', withZone({ dateStyle: 'medium' }, 'UTC')).formatRangeToParts(0, 86400000 * 3); });
  // 不给时区：用系统的。网页和运行时在同一台设备上，结果应该一样
  run('X|系统时区', function () { return new Intl.DateTimeFormat().resolvedOptions().timeZone; });
  run('X|系统时区 format', function () { return new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'full' }).format(when); });
  run('X|系统时区 toLocaleString', function () { return when.toLocaleString(loc(undefined)); });
  run('X|系统时区 toLocaleDateString', function () { return when.toLocaleDateString(loc(undefined)); });
  run('X|系统时区 toLocaleTimeString', function () { return when.toLocaleTimeString(loc(undefined)); });
  run('X|format() 不传就是现在', function () { return typeof new Intl.DateTimeFormat('en-US', u).format(); });
  run('X|format(undefined)', function () { return typeof new Intl.DateTimeFormat('en-US', u).format(undefined); });
  run('X|formatToParts 拼回去等于 format', function () { var f = new Intl.DateTimeFormat('ar-EG', withZone({ dateStyle: 'full', timeStyle: 'full' }, 'Asia/Kolkata')); return f.formatToParts(when).map(function (p) { return p.value; }).join('') === f.format(when); });
  run('X|formatToParts 无效日期', function () { return new Intl.DateTimeFormat('en-US').formatToParts(new Date(NaN)); });
  run('X|formatRange 无效日期', function () { return new Intl.DateTimeFormat('en-US').formatRange(new Date(NaN), new Date(0)); });
  run('X|resolvedOptions 是新对象', function () { var f = new Intl.DateTimeFormat('en-US', u); return f.resolvedOptions() !== f.resolvedOptions(); });
  run('X|supportedLocalesOf 带选项', function () { return Intl.DateTimeFormat.supportedLocalesOf('de-DE', { localeMatcher: 'lookup' }); });
  run('X|Date 对象上别的方法没动', function () { return [when.toISOString(), when.getTime()]; });
  run('X|formatRange 缺参数', function () { return new Intl.DateTimeFormat('en-US', u).formatRange(0); });
  return out;
}

// 这几条运行时**明确不支持**，网页里是能用的。不拿来比对，断言它们抛 TypeError。
//   formatRangeToParts：系统的区间格式化器只给整串，不给分段
export const INTL_DATE_REJECTED_LABELS = ['X|formatRangeToParts'];
