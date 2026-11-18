// Intl.DateTimeFormat：按地区写日期和时间
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
//
// 判据和数字那一步一样：和同一台设备上网页里的 Intl 逐条相同。日期比数字
// 难对上——同一个选项在两个浏览器内核之间有两成的结果不同——所以这里不是
// 「按标准自己实现一遍」，而是**照 WebKit 的流程做**（它的源码是公开的）：
//
//   1. 选项 → 一个「骨架串」（yMMMd、jmm 这种，只说要哪些字段、各多宽），
//      或者 dateStyle / timeStyle 对应的现成格式串
//   2. 让系统按这个地区的习惯把骨架串变成格式串（y年M月d日、h:mm a）
//   3. 按小时制改写格式串里的小时字母
//   4. 从最后的格式串反推 resolvedOptions（所以它说的是实际用了什么）
//
// 第 2 步和格式化本身在原生层（NSDateFormatter）；其余都是字符串处理，在这里。
// 见 docs/internals/intl.md。
(function (ctx) {
  'use strict';

  const { define } = ctx;
  const {
    Intl, call, info, canonicalizeLocaleList, bestAvailable, getOption, defaultNumberOption,
    supportedLocales, unsupportedMethod,
  } = ctx.intl;

  // ---------- 格式串当字符串处理 ----------

  // 切成一段一段：{ field: 'MMM' } 是字段，{ raw: "'at' " } 是原样的文字（引号也留着，
  // 拼回去时一个字不用动）
  function tokenize(pattern) {
    const out = [];
    let raw = '';
    let i = 0;
    const flush = () => { if (raw !== '') { out.push({ raw }); raw = ''; } };
    while (i < pattern.length) {
      const c = pattern[i];
      if (c === "'") {
        // 引号里的是文字；连着两个引号是一个字面的引号
        let j = i + 1;
        if (pattern[j] === "'") { raw += "''"; i += 2; continue; }
        while (j < pattern.length) {
          if (pattern[j] === "'") {
            if (pattern[j + 1] === "'") { j += 2; continue; }
            break;
          }
          j++;
        }
        raw += pattern.slice(i, j + 1);
        i = j + 1;
        continue;
      }
      if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
        let j = i;
        while (j < pattern.length && pattern[j] === c) j++;
        flush();
        out.push({ field: pattern.slice(i, j) });
        i = j;
        continue;
      }
      raw += c;
      i++;
    }
    flush();
    return out;
  }
  const join = (tokens) => tokens.map((t) => (t.field !== undefined ? t.field : t.raw)).join('');
  const isHourChar = (c) => c === 'h' || c === 'H' || c === 'k' || c === 'K';
  const HOUR_CYCLE_OF = { K: 'h11', h: 'h12', H: 'h23', k: 'h24' };
  const HOUR_CHAR_OF = { h11: 'K', h12: 'h', h23: 'H', h24: 'k' };
  const isTwelve = (hourCycle) => hourCycle === 'h11' || hourCycle === 'h12';

  // 格式串 → 骨架串：只留字段，按规范的顺序排
  const FIELD_ORDER = 'GyYuUrQqMLlwWEecDFgdabBhHkKjJCmsSAzZOvVXx';
  function skeletonOf(pattern) {
    return tokenize(pattern).filter((t) => t.field !== undefined).map((t) => t.field)
      .sort((a, b) => FIELD_ORDER.indexOf(a[0]) - FIELD_ORDER.indexOf(b[0])).join('');
  }
  function hourCycleOfPattern(pattern) {
    for (const t of tokenize(pattern)) {
      if (t.field !== undefined && isHourChar(t.field[0])) return HOUR_CYCLE_OF[t.field[0]];
    }
    return undefined;
  }
  // 把格式串里的小时换成指定的小时制。12 小时制的一位小时换成 24 小时制时
  // 变成两位（WebKit 就是这么做的：3 PM 换过去是 15，不会只有一位）
  function replaceHourCycleInPattern(pattern, hourCycle) {
    const target = HOUR_CHAR_OF[hourCycle];
    const to24 = !isTwelve(hourCycle);
    const tokens = tokenize(pattern);
    for (const t of tokens) {
      if (t.field === undefined || !isHourChar(t.field[0])) continue;
      const from12 = t.field[0] === 'h' || t.field[0] === 'K';
      const length = to24 && from12 && t.field.length === 1 ? 2 : t.field.length;
      t.field = target.repeat(length);
    }
    return join(tokens);
  }

  // ---------- 向系统要格式串 ----------

  const templateCache = new Map();
  function template(localeId, skeleton) {
    const key = localeId + '|' + skeleton;
    let pattern = templateCache.get(key);
    if (pattern === undefined) {
      pattern = call('dateTemplate:', [localeId, skeleton]);
      templateCache.set(key, pattern);
    }
    return pattern;
  }
  // 这个地区默认的小时字母
  function defaultHourChar(localeId) {
    for (const t of tokenize(template(localeId, 'j'))) {
      if (t.field !== undefined && isHourChar(t.field[0])) return t.field[0];
    }
    return 'H';
  }
  const countHours = (skeleton) => {
    let n = 0;
    for (const c of skeleton) if (c === 'j' || isHourChar(c)) n++;
    return n;
  };
  // 小时写几位。
  //
  // WebKit 向系统要格式串时带了一个选项：小时的位数按要求的来。公开接口带不了
  // 这个选项，只能自己调：要两位就两位；要一位而系统给的是两位时不能直接缩——
  // 缩不缩取决于系统内部匹配到的是哪一条格式（中文的「小时 + 两位分钟」是 3:04，
  // 「小时 + 一位分钟」却是 03:04）。这个判断问 Swift 的日期接口，它内部带了那个选项
  const hourDigitsCache = new Map();
  function matchHourLength(pattern, skeleton, localeId, forced) {
    const want = Math.min(countHours(skeleton), 2);
    if (want === 0) return pattern;
    const tokens = tokenize(pattern);
    const hour = tokens.find((t) => t.field !== undefined && isHourChar(t.field[0]));
    if (hour === undefined || hour.field.length === want) return pattern;
    if (want === 1) {
      const id = forced === undefined ? localeId
        : localeId + (localeId.includes('@') ? ';' : '@') + 'hours=' + forced;
      const key = id + '|' + skeleton;
      let digits = hourDigitsCache.get(key);
      if (digits === undefined) {
        digits = call('hourDigits:', [skeleton, id]);
        hourDigitsCache.set(key, digits);
      }
      if (digits !== 1) return pattern;
    }
    hour.field = hour.field[0].repeat(want);
    return join(tokens);
  }
  // 骨架串 → 格式串，小时的位数按要求的来
  function bestPattern(localeId, skeleton, forced) {
    // 交给系统的骨架里小时只写一个字母：连写两个时系统的接口会给出奇怪的结果
    // （en-US 的 jj 得到 h aaaa）。位数由上面那个函数回头调
    let single = skeleton.replace(/([jhHkK])\1+/g, '$1');
    // 带了 B（按一天里的时段写）时，j 会让系统把 B 丢掉；换成这个地区默认的
    // 小时字母就对了
    if (single.includes('B')) single = single.replace('j', defaultHourChar(localeId));
    return matchHourLength(template(localeId, single), skeleton, localeId, forced);
  }

  // ---------- 选项 → 骨架串 ----------

  const WIDTH3 = { narrow: 5, short: 3, long: 4 };
  function buildSkeleton(f, hour12, hourCycle) {
    let s = '';
    if (f.weekday) s += 'E'.repeat(WIDTH3[f.weekday]);
    if (f.era) s += 'G'.repeat(WIDTH3[f.era]);
    if (f.year) s += f.year === '2-digit' ? 'yy' : 'y';
    if (f.month) s += 'M'.repeat({ numeric: 1, '2-digit': 2, short: 3, long: 4, narrow: 5 }[f.month]);
    if (f.day) s += f.day === '2-digit' ? 'dd' : 'd';
    if (f.hour) {
      let c = 'j';   // j：按这个地区的习惯选 12 还是 24 小时制
      if (hour12 !== undefined) c = hour12 ? 'h' : 'H';
      else if (hourCycle !== undefined) c = isTwelve(hourCycle) ? 'h' : 'H';
      s += f.hour === '2-digit' ? c + c : c;
    }
    if (f.dayPeriod) s += 'B'.repeat({ narrow: 5, short: 1, long: 4 }[f.dayPeriod]);
    if (f.minute) s += f.minute === '2-digit' ? 'mm' : 'm';
    if (f.second) s += f.second === '2-digit' ? 'ss' : 's';
    if (f.fractionalSecondDigits) s += 'S'.repeat(f.fractionalSecondDigits);
    if (f.timeZoneName) {
      s += { short: 'z', long: 'zzzz', shortOffset: 'O', longOffset: 'OOOO',
             shortGeneric: 'v', longGeneric: 'vvvv' }[f.timeZoneName];
    }
    return s;
  }

  // ---------- 格式串 → 实际用了哪些字段 ----------

  // resolvedOptions 报的不是你写的选项，是最后的格式串里实际有什么
  function fieldsOfPattern(pattern) {
    const f = {};
    for (const t of tokenize(pattern)) {
      if (t.field === undefined) continue;
      const c = t.field[0];
      const n = t.field.length;
      const wide = n <= 3 ? 'short' : n === 4 ? 'long' : n === 5 ? 'narrow' : undefined;
      if (c === 'G') f.era = wide;
      else if (c === 'y') { if (n <= 2) f.year = n === 1 ? 'numeric' : '2-digit'; }
      else if (c === 'M' || c === 'L') {
        f.month = [undefined, 'numeric', '2-digit', 'short', 'long', 'narrow'][n];
      } else if (c === 'E' || c === 'e' || c === 'c') f.weekday = wide;
      else if (c === 'd') { if (n <= 2) f.day = n === 1 ? 'numeric' : '2-digit'; }
      else if (c === 'a' || c === 'b' || c === 'B') f.dayPeriod = wide;
      else if (isHourChar(c)) {
        f.hourCycle = HOUR_CYCLE_OF[c];
        if (n <= 2) f.hour = n === 1 ? 'numeric' : '2-digit';
      } else if (c === 'm') { if (n <= 2) f.minute = n === 1 ? 'numeric' : '2-digit'; }
      else if (c === 's') { if (n <= 2) f.second = n === 1 ? 'numeric' : '2-digit'; }
      else if (c === 'z') { if (n === 1) f.timeZoneName = 'short'; else if (n === 4) f.timeZoneName = 'long'; }
      else if (c === 'O') { if (n === 1) f.timeZoneName = 'shortOffset'; else if (n === 4) f.timeZoneName = 'longOffset'; }
      else if (c === 'v' || c === 'V') { if (n === 1) f.timeZoneName = 'shortGeneric'; else if (n === 4) f.timeZoneName = 'longGeneric'; }
      else if (c === 'S') f.fractionalSecondDigits = n;
    }
    return f;
  }
  // formatToParts 里每一段叫什么
  function partType(field) {
    const c = field[0];
    if (c === 'G') return 'era';
    if (c === 'y' || c === 'Y' || c === 'u') return 'year';
    if (c === 'U') return 'yearName';
    if (c === 'r') return 'relatedYear';
    if (c === 'M' || c === 'L') return 'month';
    if (c === 'd') return 'day';
    if (c === 'E' || c === 'e' || c === 'c') return 'weekday';
    if (c === 'a' || c === 'b' || c === 'B') return 'dayPeriod';
    if (isHourChar(c)) return 'hour';
    if (c === 'm') return 'minute';
    if (c === 's') return 'second';
    if (c === 'S') return 'fractionalSecond';
    if ('zZOvVXx'.includes(c)) return 'timeZoneName';
    return 'unknown';
  }

  // ---------- 地区：日历、小时制、数字系统 ----------

  // 标准里的日历名 ↔ 系统的关键字。只有这两个不一样
  const CALENDAR_KEYWORD = { gregory: 'gregorian', ethioaa: 'ethiopic-amete-alem' };
  const CALENDAR_ALIAS = { gregorian: 'gregory', 'ethiopic-amete-alem': 'ethioaa', islamicc: 'islamic-civil' };
  const CALENDARS = new Set([
    'buddhist', 'chinese', 'coptic', 'dangi', 'ethioaa', 'ethiopic', 'gregory', 'hebrew', 'indian',
    'islamic', 'islamic-civil', 'islamic-rgsa', 'islamic-tbla', 'islamic-umalqura', 'iso8601',
    'japanese', 'persian', 'roc',
  ]);
  const HOUR_CYCLES = ['h11', 'h12', 'h23', 'h24'];

  // 标签里 -u- 那一段的键值。'en-US-u-ca-buddhist-hc-h23' → { ca: 'buddhist', hc: 'h23' }
  function unicodeKeywords(tag) {
    const out = {};
    const m = /-u((?:-[a-z0-9]{2,8})+)/.exec(tag.replace(/-x-.*$/, ''));
    if (m === null) return out;
    let key;
    for (const piece of m[1].slice(1).split('-')) {
      if (piece.length === 2) { key = piece; if (!(key in out)) out[key] = ''; }
      else if (key !== undefined) out[key] += (out[key] === '' ? '' : '-') + piece;
    }
    return out;
  }
  const baseOf = (tag) => { const at = tag.search(/-[0-9a-z](?=-)/); return at < 0 ? tag : tag.slice(0, at); };

  // 标准的 ResolveLocale，相关的键是 ca / hc / nu。
  // 每个键：先是这个地区的默认值；标签里写了而且认识，用标签里的（并且留在
  // 解析出来的标签里）；选项里写了而且和它不一样，用选项里的（标签里那段去掉）
  function resolveLocale(requested, options) {
    let locale = info().defaultLocale;
    let keywords = {};
    for (const tag of requested) {
      const found = bestAvailable(baseOf(tag));
      if (found !== undefined) { locale = found; keywords = unicodeKeywords(tag); break; }
    }
    const kept = [];
    const pick = (key, fallback, supported, option) => {
      let value = fallback;
      let fromTag = false;
      let wanted = keywords[key];
      if (wanted !== undefined && key === 'ca' && CALENDAR_ALIAS[wanted]) wanted = CALENDAR_ALIAS[wanted];
      if (wanted !== undefined && supported(wanted)) { value = wanted; fromTag = true; }
      if (option !== undefined && option.set && (option.value === null || supported(option.value)) &&
          option.value !== value) {
        value = option.value === null ? undefined : option.value;
        fromTag = false;
      }
      if (fromTag) kept.push('-' + key + '-' + value);
      return value;
    };
    const calendarDefault = call('calendar:', [locale]);
    const numberingDefault = call('numberingSystem:', [locale]);
    const calendar = pick('ca', calendarDefault, (v) => CALENDARS.has(v), options.calendar);
    const hourCycle = pick('hc', undefined, (v) => HOUR_CYCLES.includes(v), options.hourCycle);
    const numberingSystem = pick('nu', numberingDefault, (v) => info().numberingSystems.has(v),
                                 options.numberingSystem);
    // 给系统的地区标识：日历和数字系统写成它的关键字。默认值就不写了
    const extra = [];
    if (calendar !== calendarDefault) extra.push('calendar=' + (CALENDAR_KEYWORD[calendar] || calendar));
    if (numberingSystem !== numberingDefault) extra.push('numbers=' + numberingSystem);
    return {
      locale: locale + (kept.length ? '-u' + kept.sort().join('') : ''),
      localeId: locale + (extra.length ? '@' + extra.join(';') : ''),
      calendar, hourCycle, numberingSystem,
    };
  }

  // ---------- 时区 ----------

  // 给了时区：偏移量（+08:00、-0530）或者名字（大小写不敏感）。认不出来抛。
  // 返回 { name: resolvedOptions 里写的, native: 交给系统的 }
  const zoneCache = new Map();
  function resolveTimeZone(value) {
    if (value === undefined) {
      const name = call('defaultTimeZone', []);
      return { name, native: name };
    }
    const text = String(value);
    let zone = zoneCache.get(text);
    if (zone !== undefined) return zone;
    const m = /^([+-])(\d{2})(?::?(\d{2}))?$/.exec(text);
    if (m !== null && Number(m[2]) <= 23 && Number(m[3] || 0) <= 59) {
      const minutes = (Number(m[2]) * 60 + Number(m[3] || 0)) * (m[1] === '-' ? -1 : 1);
      zone = { name: m[1] + m[2] + ':' + (m[3] || '00'), native: minutes * 60 };
    } else {
      const found = call('timeZone:', [text]);
      if (found === null) throw new RangeError('invalid time zone: ' + text);
      zone = { name: found, native: found };
    }
    zoneCache.set(text, zone);
    return zone;
  }

  // ---------- DateTimeFormat ----------

  const kSlots = Symbol('Intl.DateTimeFormat');
  function slotsOf(value, method) {
    const slots = value != null ? value[kSlots] : undefined;
    if (slots === undefined) {
      throw new TypeError('Intl.DateTimeFormat.prototype.' + method +
                          ' called on a value that is not an Intl.DateTimeFormat');
    }
    return slots;
  }

  const COMPONENTS = [
    ['weekday', ['narrow', 'short', 'long']], ['era', ['narrow', 'short', 'long']],
    ['year', ['2-digit', 'numeric']], ['month', ['2-digit', 'numeric', 'narrow', 'short', 'long']],
    ['day', ['2-digit', 'numeric']], ['dayPeriod', ['narrow', 'short', 'long']],
    ['hour', ['2-digit', 'numeric']], ['minute', ['2-digit', 'numeric']],
    ['second', ['2-digit', 'numeric']],
  ];
  const STYLES = ['full', 'long', 'medium', 'short'];

  // required / defaults：Intl.DateTimeFormat 自己是 any / date；Date 的三个
  // toLocale*String 各有各的（只要日期的那个不许给 timeStyle，等等）
  function initialize(target, locales, optionsArg, required, defaults) {
    const requested = canonicalizeLocaleList(locales);
    let options;
    if (optionsArg === undefined) options = Object.create(null);
    else if (optionsArg === null) throw new TypeError('options must be an object, got null');
    else options = Object(optionsArg);

    getOption(options, 'localeMatcher', 'string', ['lookup', 'best fit'], 'best fit');
    const wellFormed = /^[a-zA-Z0-9]{3,8}(-[a-zA-Z0-9]{3,8})*$/;
    let calendar = getOption(options, 'calendar', 'string', undefined, undefined);
    if (calendar !== undefined) {
      if (!wellFormed.test(calendar)) {
        throw new RangeError('calendar is not a well-formed calendar value: "' + calendar + '"');
      }
      calendar = calendar.toLowerCase();
      calendar = CALENDAR_ALIAS[calendar] || calendar;
    }
    let numberingSystem = getOption(options, 'numberingSystem', 'string', undefined, undefined);
    if (numberingSystem !== undefined) {
      if (!wellFormed.test(numberingSystem)) {
        throw new RangeError('numberingSystem is not a well-formed numbering system value: "' +
                             numberingSystem + '"');
      }
      numberingSystem = numberingSystem.toLowerCase();
    }
    const hour12 = getOption(options, 'hour12', 'boolean', undefined, undefined);
    const hourCycleOption = getOption(options, 'hourCycle', 'string', HOUR_CYCLES, undefined);

    const resolved = resolveLocale(requested, {
      calendar: { set: calendar !== undefined, value: calendar },
      numberingSystem: { set: numberingSystem !== undefined, value: numberingSystem },
      // 给了 hour12 就不看任何地方写的 hourCycle 了（标签里的也不看）
      hourCycle: hour12 !== undefined ? { set: true, value: null }
        : { set: hourCycleOption !== undefined, value: hourCycleOption },
    });
    const hourCycle = resolved.hourCycle;
    const localeId = resolved.localeId;
    const zone = resolveTimeZone(options.timeZone);

    const fields = {};
    for (const [name, values] of COMPONENTS) {
      fields[name] = getOption(options, name, 'string', values, undefined);
    }
    fields.fractionalSecondDigits =
      defaultNumberOption(options.fractionalSecondDigits, 1, 3, 0, 'fractionalSecondDigits');
    fields.timeZoneName = getOption(options, 'timeZoneName', 'string',
      ['short', 'long', 'shortOffset', 'longOffset', 'shortGeneric', 'longGeneric'], undefined);
    getOption(options, 'formatMatcher', 'string', ['basic', 'best fit'], 'best fit');
    const dateStyle = getOption(options, 'dateStyle', 'string', STYLES, undefined);
    const timeStyle = getOption(options, 'timeStyle', 'string', STYLES, undefined);

    const forced = hour12 !== undefined ? (hour12 ? 'h12' : 'h23')
      : hourCycle !== undefined ? (isTwelve(hourCycle) ? 'h12' : 'h23') : undefined;
    let pattern;
    if (dateStyle !== undefined || timeStyle !== undefined) {
      if (fields.weekday || fields.era || fields.year || fields.month || fields.day ||
          fields.dayPeriod || fields.hour || fields.minute || fields.second ||
          fields.fractionalSecondDigits || fields.timeZoneName) {
        throw new TypeError('dateStyle and timeStyle may not be used with other DateTimeFormat options');
      }
      if (required === 'date' && timeStyle !== undefined) {
        throw new TypeError('timeStyle is specified while formatting date is requested');
      }
      if (required === 'time' && dateStyle !== undefined) {
        throw new TypeError('dateStyle is specified while formatting time is requested');
      }
      pattern = call('datePattern:', [localeId, dateStyle === undefined ? null : dateStyle,
                                      timeStyle === undefined ? null : timeStyle]);
      if (timeStyle !== undefined && forced !== undefined) {
        // 这个地区的时间格式是 12 小时制而要的是 24 小时制（或者反过来）：把格式串
        // 推回骨架串，换掉小时字母，重新向系统要一次
        const got = hourCycleOfPattern(pattern);
        const want12 = forced === 'h12';
        if (got !== undefined && isTwelve(got) !== want12) {
          const skeleton = skeletonOf(pattern).replace(/[hHj]/g, want12 ? 'h' : 'H');
          pattern = bestPattern(localeId, skeleton, forced);
        }
      }
    } else {
      let needDefaults = true;
      if ((required === 'date' || required === 'any') &&
          (fields.weekday || fields.year || fields.month || fields.day)) needDefaults = false;
      if ((required === 'time' || required === 'any') &&
          (fields.dayPeriod || fields.hour || fields.minute || fields.second ||
           fields.fractionalSecondDigits)) needDefaults = false;
      if (needDefaults && (defaults === 'date' || defaults === 'all')) {
        fields.year = 'numeric'; fields.month = 'numeric'; fields.day = 'numeric';
      }
      if (needDefaults && (defaults === 'time' || defaults === 'all')) {
        fields.hour = 'numeric'; fields.minute = 'numeric'; fields.second = 'numeric';
      }
      pattern = bestPattern(localeId, buildSkeleton(fields, hour12, hourCycle), forced);
    }
    if (hourCycle !== undefined) pattern = replaceHourCycleInPattern(pattern, hourCycle);

    const used = fieldsOfPattern(pattern);
    const slots = {
      locale: resolved.locale,
      calendar: resolved.calendar,
      numberingSystem: resolved.numberingSystem,
      timeZone: zone.name,
      hourCycle: used.hourCycle,
      dateStyle, timeStyle, used, pattern, localeId,
      formatter: undefined,
      boundFormat: undefined,
    };
    const native = { locale: localeId, pattern, timeZone: zone.native };
    slots.formatter = call('dateFormatter:', [JSON.stringify(native), native]);
    Object.defineProperty(target, kSlots, { value: slots });
    return target;
  }

  // 标准的 TimeClip：超出 ±8.64e15 毫秒的不是合法的时刻
  function timeValue(value) {
    const number = Number(value);
    if (!Number.isFinite(number) || Math.abs(number) > 8.64e15) return NaN;
    return Math.trunc(number) + 0;
  }
  function formatMoment(slots, moment) {
    return call('formatDate:', [slots.formatter, moment]);
  }
  function momentOf(date, method) {
    const moment = date === undefined ? Date.now() : timeValue(date);
    if (Number.isNaN(moment)) {
      throw new RangeError('date value is not finite in DateTimeFormat ' + method + '()');
    }
    return moment;
  }

  function DateTimeFormat() {
    const target = new.target === undefined ? Object.create(DateTimeFormat.prototype) : this;
    return initialize(target, arguments[0], arguments[1], 'any', 'date');
  }
  define(DateTimeFormat, 'supportedLocalesOf', function supportedLocalesOf(locales, options) {
    return supportedLocales(canonicalizeLocaleList(locales), options);
  });
  Object.defineProperty(DateTimeFormat, 'prototype', { writable: false });
  const proto = DateTimeFormat.prototype;
  Object.defineProperty(proto, 'format', {
    configurable: true,
    enumerable: false,
    get() {
      const slots = slotsOf(this, 'format');
      if (slots.boundFormat === undefined) {
        slots.boundFormat = (date) => formatMoment(slots, momentOf(date, 'format'));
        Object.defineProperty(slots.boundFormat, 'name', { value: '' });
      }
      return slots.boundFormat;
    },
  });
  define(proto, 'formatRange', function formatRange(startDate, endDate) {
    const slots = slotsOf(this, 'formatRange');
    if (startDate === undefined || endDate === undefined) {
      throw new TypeError('formatRange needs a start date and an end date');
    }
    const start = timeValue(startDate);
    const end = timeValue(endDate);
    if (Number.isNaN(start) || Number.isNaN(end)) throw new RangeError('Passed date is out of range');
    return call('formatDateRange:', [slots.formatter, skeletonOf(slots.pattern),
                                     slots.hourCycle === undefined ? null : slots.hourCycle,
                                     start, end]);
  });
  define(proto, 'formatRangeToParts', function formatRangeToParts() {
    slotsOf(this, 'formatRangeToParts');
    throw unsupportedMethod('Intl.DateTimeFormat.prototype.formatRangeToParts');
  });
  define(proto, 'formatToParts', function formatToParts(date) {
    const slots = slotsOf(this, 'formatToParts');
    const pieces = call('formatDateParts:', [slots.formatter, momentOf(date, 'formatToParts')]);
    const parts = [];
    for (const [field, value] of pieces) {
      const type = field === '' ? 'literal' : partType(field);
      const last = parts[parts.length - 1];
      // 挨着的文字并成一段
      if (type === 'literal' && last !== undefined && last.type === 'literal') last.value += value;
      else parts.push({ type, value });
    }
    return parts;
  });
  define(proto, 'resolvedOptions', function resolvedOptions() {
    const slots = slotsOf(this, 'resolvedOptions');
    const out = {
      locale: slots.locale,
      calendar: slots.calendar,
      numberingSystem: slots.numberingSystem,
      timeZone: slots.timeZone,
    };
    if (slots.hourCycle !== undefined) {
      out.hourCycle = slots.hourCycle;
      out.hour12 = isTwelve(slots.hourCycle);
    }
    if (slots.dateStyle === undefined && slots.timeStyle === undefined) {
      for (const key of ['weekday', 'era', 'year', 'month', 'day', 'dayPeriod', 'hour', 'minute',
                         'second', 'fractionalSecondDigits', 'timeZoneName']) {
        if (slots.used[key] !== undefined) out[key] = slots.used[key];
      }
    } else {
      if (slots.dateStyle !== undefined) out.dateStyle = slots.dateStyle;
      if (slots.timeStyle !== undefined) out.timeStyle = slots.timeStyle;
    }
    return out;
  });
  Object.defineProperty(proto, Symbol.toStringTag, {
    value: 'Intl.DateTimeFormat', writable: false, enumerable: false, configurable: true,
  });
  define(Intl, 'DateTimeFormat', DateTimeFormat);

  // ---------- Date 的三个 toLocale*String ----------
  //
  // 没有 ICU 的 V8 把地区和选项整个忽略，三个都输出同一种英文格式。
  // 最近用过的格式化器留着：列表里对一列日期反复调同一组参数是最常见的用法
  const recent = new Map();
  function cachedFormat(locales, options, required, defaults) {
    let key;
    if ((locales === undefined || typeof locales === 'string') &&
        (options === undefined || (typeof options === 'object' && options !== null))) {
      try {
        key = required + JSON.stringify([locales === undefined ? null : locales, options || null]);
      } catch (e) { key = undefined; }
    }
    const make = () => initialize(Object.create(proto), locales, options, required, defaults);
    if (key === undefined) return make();
    let formatter = recent.get(key);
    if (formatter === undefined) {
      formatter = make();
      if (recent.size >= 32) recent.delete(recent.keys().next().value);
      recent.set(key, formatter);
    }
    return formatter;
  }
  const getTime = Date.prototype.getTime;
  for (const [name, required, defaults] of [['toLocaleString', 'any', 'all'],
                                            ['toLocaleDateString', 'date', 'date'],
                                            ['toLocaleTimeString', 'time', 'time']]) {
    define(Date.prototype, name, {
      [name]() {
        const moment = getTime.call(this);   // 不是 Date 就抛 TypeError
        if (Number.isNaN(moment)) return 'Invalid Date';
        return formatMoment(cachedFormat(arguments[0], arguments[1], required, defaults)[kSlots], moment);
      },
    }[name]);
  }

})
