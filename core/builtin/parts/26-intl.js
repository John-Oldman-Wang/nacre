// Intl：按地区格式化。现在只有 NumberFormat。
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
//
// 预编译的 V8 不带 ICU，所以 Intl 整个不存在，toLocaleString 一族把地区和
// 选项静默忽略。这里按 ECMA-402 把它补上，分工是：
//
//   - 这个文件：标准规定的那部分——选项怎么读、默认值、报什么错、
//     resolvedOptions 长什么样、地区标签怎么解析。全是纯 JS，不过桥。
//   - 原生层：「按这组解析好的选项，把这个值格式化成字符串」。数据来自系统。
//
// 判据是「和同一台设备上网页里的 Intl 逐条相同」，验收里就是这么比的。
// 系统公开接口做不出来的选项，构造时抛 RangeError 并点名，不静默忽略——
// 金额显示错了又不报错是最坏的结果。见 docs/internals/intl.md。
(function (ctx) {
  'use strict';

  const { define, nativeClassCallValue } = ctx;

  const call = (selector, args) => nativeClassCallValue('NacreIntl', selector, args);

  // ---------- 地区 ----------

  // 系统有哪些地区、哪些数字系统、默认地区是什么。第一次用到才问，问一次
  let localeInfo = null;
  function info() {
    if (localeInfo === null) {
      const raw = call('localeInfo', []);
      localeInfo = {
        defaultLocale: raw.defaultLocale,
        available: new Set(raw.availableLocales),
        numberingSystems: new Set(raw.numberingSystems),
      };
    }
    return localeInfo;
  }

  // 结构上是不是一个合法的地区标签（UTS 35 的 unicode_locale_id）。
  // 只查形状，不查这个语言存不存在——'xx' 是合法的，只是没有数据
  const LANGUAGE_TAG = new RegExp(
    '^([a-z]{2,3}|[a-z]{5,8})' +                       // 语言
    '(-[a-z]{4})?' +                                    // 文字
    '(-(?:[a-z]{2}|[0-9]{3}))?' +                       // 地区
    '((?:-(?:[a-z0-9]{5,8}|[0-9][a-z0-9]{3}))*)' +      // 变体
    '((?:-[0-9a-wy-z](?:-[a-z0-9]{2,8})+)*)' +          // 扩展
    '(-x(?:-[a-z0-9]{1,8})+)?$');                       // 私用
  function canonicalizeTag(tag) {
    const lower = tag.toLowerCase();
    const m = LANGUAGE_TAG.exec(lower);
    if (m === null) throw new RangeError('invalid language tag: ' + tag);
    // 同一个扩展字母、同一个变体不能出现两次
    const singletons = (m[5].match(/-[0-9a-wy-z](?=-)/g) || []);
    if (new Set(singletons).size !== singletons.length) {
      throw new RangeError('invalid language tag: ' + tag);
    }
    const variants = m[4] === '' ? [] : m[4].slice(1).split('-');
    if (new Set(variants).size !== variants.length) {
      throw new RangeError('invalid language tag: ' + tag);
    }
    let out = m[1];
    if (m[2]) out += '-' + m[2][1].toUpperCase() + m[2].slice(2);
    if (m[3]) out += m[3].toUpperCase();
    return out + m[4] + m[5] + (m[6] || '');
  }
  // 标准的 CanonicalizeLocaleList
  function canonicalizeLocaleList(locales) {
    if (locales === undefined) return [];
    const seen = [];
    if (typeof locales === 'string') return [canonicalizeTag(locales)];
    if (locales === null) throw new TypeError('locales must be a string or an array, got null');
    const list = Object(locales);
    const length = Math.min(Math.max(Math.trunc(Number(list.length)) || 0, 0), 2 ** 32 - 1);
    for (let i = 0; i < length; i++) {
      if (!(i in list)) continue;
      const item = list[i];
      if (typeof item !== 'string' && (typeof item !== 'object' || item === null)) {
        throw new TypeError('locale must be a string or an object, got ' + typeof item);
      }
      const tag = canonicalizeTag(String(item));
      if (!seen.includes(tag)) seen.push(tag);
    }
    return seen;
  }
  // 把扩展和私用部分拆出来。返回 { base, nu }：nu 是 -u- 里的数字系统
  function splitExtensions(tag) {
    const at = tag.search(/-[0-9a-z](?=-)/);
    if (at < 0) return { base: tag, nu: undefined };
    const base = tag.slice(0, at);
    const m = /-u(?:-[a-z0-9]{2,8})*?-nu-([a-z0-9]{3,8})(?=-|$)/.exec(tag.slice(at));
    return { base, nu: m === null ? undefined : m[1] };
  }
  // 标准的 BestAvailableLocale：从后往前一段一段去掉，直到系统有这个地区
  function bestAvailable(base) {
    const available = info().available;
    let candidate = base;
    for (;;) {
      if (available.has(candidate)) return candidate;
      let at = candidate.lastIndexOf('-');
      if (at < 0) return undefined;
      if (at >= 2 && candidate[at - 2] === '-') at -= 2;
      candidate = candidate.slice(0, at);
    }
  }
  // 从请求的地区里挑第一个系统有的；一个都没有用默认地区
  function resolveLocale(requested) {
    for (const tag of requested) {
      const { base, nu } = splitExtensions(tag);
      const found = bestAvailable(base);
      if (found !== undefined) return { locale: found, nu };
    }
    return { locale: info().defaultLocale, nu: undefined };
  }
  function supportedLocales(requested, options) {
    if (options !== undefined) {
      getOption(Object(options), 'localeMatcher', 'string', ['lookup', 'best fit'], 'best fit');
    }
    return requested.filter((tag) => bestAvailable(splitExtensions(tag).base) !== undefined);
  }

  // ---------- 读选项（标准的 GetOption 那一组） ----------

  function getOption(options, name, type, values, fallback) {
    let value = options[name];
    if (value === undefined) return fallback;
    value = type === 'boolean' ? Boolean(value) : String(value);
    if (values !== undefined && !values.includes(value)) {
      throw new RangeError(name + ' has no value "' + value + '"; expected one of: ' +
                           values.join(' / '));
    }
    return value;
  }
  function defaultNumberOption(value, minimum, maximum, fallback, name) {
    if (value === undefined) return fallback;
    const number = Number(value);
    if (Number.isNaN(number) || number < minimum || number > maximum) {
      throw new RangeError(name + ' must be between ' + minimum + ' and ' + maximum +
                           ', got ' + String(value));
    }
    return Math.floor(number);
  }
  function getNumberOption(options, name, minimum, maximum, fallback) {
    return defaultNumberOption(options[name], minimum, maximum, fallback, name);
  }
  // 运行时做不了的。和「标准里就不合法」分开报，错误信息里点名
  function unsupported(name, value) {
    return new RangeError(name + ': "' + value + '" is not supported by this runtime');
  }
  // 标准里有、这里还没做的方法。方法留在原型上，是为了报一个说得清的错
  function unsupportedMethod(name) {
    return new TypeError(name + ' is not supported by this runtime');
  }

  // ---------- NumberFormat ----------

  const ROUNDING_INCREMENTS = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000];
  const ROUNDING_MODES = ['ceil', 'floor', 'expand', 'trunc', 'halfCeil', 'halfFloor',
                          'halfExpand', 'halfTrunc', 'halfEven'];
  // 系统的格式化接口只有这六种舍入规则
  const SUPPORTED_ROUNDING_MODES = ['ceil', 'floor', 'expand', 'trunc', 'halfExpand', 'halfEven'];

  const kSlots = Symbol('Intl.NumberFormat');

  function slotsOf(value, method) {
    const slots = value != null ? value[kSlots] : undefined;
    if (slots === undefined) {
      throw new TypeError('Intl.NumberFormat.prototype.' + method +
                          ' called on a value that is not an Intl.NumberFormat');
    }
    return slots;
  }

  // 构造：按标准的顺序读选项、算默认值，然后让原生按结果建一个格式化器
  function initialize(target, locales, optionsArg) {
    const requested = canonicalizeLocaleList(locales);
    let options;
    if (optionsArg === undefined) options = Object.create(null);
    else if (optionsArg === null) throw new TypeError('options must be an object, got null');
    else options = Object(optionsArg);

    getOption(options, 'localeMatcher', 'string', ['lookup', 'best fit'], 'best fit');
    let numberingSystem = getOption(options, 'numberingSystem', 'string', undefined, undefined);
    if (numberingSystem !== undefined) {
      if (!/^[a-zA-Z0-9]{3,8}(-[a-zA-Z0-9]{3,8})*$/.test(numberingSystem)) {
        throw new RangeError('numberingSystem is not a well-formed numbering system: "' +
                             numberingSystem + '"');
      }
      numberingSystem = numberingSystem.toLowerCase();
    }

    const resolved = resolveLocale(requested);
    const known = info().numberingSystems;
    const fromOption = numberingSystem !== undefined && known.has(numberingSystem);
    const fromTag = resolved.nu !== undefined && known.has(resolved.nu);
    const localeDefault = call('numberingSystem:', [resolved.locale]);
    const slots = { locale: resolved.locale };
    if (fromOption) {
      slots.numberingSystem = numberingSystem;
      // 选项和标签里写的一样，标签里那段才留着
      if (fromTag && resolved.nu === numberingSystem) slots.locale += '-u-nu-' + numberingSystem;
    } else if (fromTag) {
      slots.numberingSystem = resolved.nu;
      slots.locale += '-u-nu-' + resolved.nu;
    } else {
      slots.numberingSystem = localeDefault;
    }

    // SetNumberFormatUnitOptions
    const style = getOption(options, 'style', 'string',
                            ['decimal', 'percent', 'currency', 'unit'], 'decimal');
    slots.style = style;
    let currency = getOption(options, 'currency', 'string', undefined, undefined);
    if (currency === undefined) {
      if (style === 'currency') throw new TypeError('currency is required when style is "currency"');
    } else if (!/^[A-Za-z]{3}$/.test(currency)) {
      throw new RangeError('currency is not a well-formed currency code: "' + currency + '"');
    }
    const currencyDisplay = getOption(options, 'currencyDisplay', 'string',
                                      ['code', 'symbol', 'narrowSymbol', 'name'], 'symbol');
    const currencySign = getOption(options, 'currencySign', 'string',
                                   ['standard', 'accounting'], 'standard');
    const unit = getOption(options, 'unit', 'string', undefined, undefined);
    if (unit === undefined) {
      if (style === 'unit') throw new TypeError('unit is required when style is "unit"');
    } else if (!/^[a-z]+(-[a-z]+)*$/.test(unit)) {
      throw new RangeError('unit is not a well-formed unit identifier: "' + unit + '"');
    }
    getOption(options, 'unitDisplay', 'string', ['short', 'narrow', 'long'], 'short');
    if (style === 'currency') {
      slots.currency = currency.toUpperCase();
      slots.currencyDisplay = currencyDisplay;
      slots.currencySign = currencySign;
    }

    const notation = getOption(options, 'notation', 'string',
                               ['standard', 'scientific', 'engineering', 'compact'], 'standard');
    slots.notation = notation;

    // SetNumberFormatDigitOptions
    let minDefault = 0;
    let maxDefault = style === 'percent' ? 0 : 3;
    if (style === 'currency' && notation === 'standard') {
      minDefault = maxDefault = call('currencyDigits:', [slots.currency]);
    }
    slots.minimumIntegerDigits = getNumberOption(options, 'minimumIntegerDigits', 1, 21, 1);
    let minFraction = options.minimumFractionDigits;
    let maxFraction = options.maximumFractionDigits;
    let minSignificant = options.minimumSignificantDigits;
    let maxSignificant = options.maximumSignificantDigits;
    const roundingIncrement = getNumberOption(options, 'roundingIncrement', 1, 5000, 1);
    if (!ROUNDING_INCREMENTS.includes(roundingIncrement)) {
      throw new RangeError('roundingIncrement has no value ' + roundingIncrement +
                           '; expected one of: ' + ROUNDING_INCREMENTS.join(' / '));
    }
    const roundingMode = getOption(options, 'roundingMode', 'string', ROUNDING_MODES, 'halfExpand');
    const roundingPriority = getOption(options, 'roundingPriority', 'string',
                                       ['auto', 'morePrecision', 'lessPrecision'], 'auto');
    const trailingZeroDisplay = getOption(options, 'trailingZeroDisplay', 'string',
                                          ['auto', 'stripIfInteger'], 'auto');
    if (roundingIncrement !== 1) maxDefault = minDefault;
    const hasSignificant = minSignificant !== undefined || maxSignificant !== undefined;
    const hasFraction = minFraction !== undefined || maxFraction !== undefined;
    let needSignificant = true;
    let needFraction = true;
    if (roundingPriority === 'auto') {
      needSignificant = hasSignificant;
      if (needSignificant || (!hasFraction && notation === 'compact')) needFraction = false;
    }
    if (needSignificant) {
      if (hasSignificant) {
        minSignificant = defaultNumberOption(minSignificant, 1, 21, 1, 'minimumSignificantDigits');
        maxSignificant = defaultNumberOption(maxSignificant, minSignificant, 21, 21,
                                             'maximumSignificantDigits');
      } else {
        minSignificant = 1;
        maxSignificant = 21;
      }
    }
    if (needFraction) {
      if (hasFraction) {
        minFraction = defaultNumberOption(minFraction, 0, 100, undefined, 'minimumFractionDigits');
        maxFraction = defaultNumberOption(maxFraction, 0, 100, undefined, 'maximumFractionDigits');
        if (minFraction === undefined) minFraction = Math.min(minDefault, maxFraction);
        else if (maxFraction === undefined) maxFraction = Math.max(maxDefault, minFraction);
        else if (minFraction > maxFraction) {
          throw new RangeError('minimumFractionDigits (' + minFraction +
                               ') is greater than maximumFractionDigits (' + maxFraction + ')');
        }
      } else {
        minFraction = minDefault;
        maxFraction = maxDefault;
      }
    }
    // roundingType：fractionDigits / significantDigits / morePrecision / lessPrecision
    let roundingType;
    let computedPriority = 'auto';
    if (!needSignificant && !needFraction) {
      // 紧凑写法的默认：两位有效数字，不留小数
      minFraction = 0; maxFraction = 0; minSignificant = 1; maxSignificant = 2;
      roundingType = 'morePrecision';
      computedPriority = 'morePrecision';
    } else if (roundingPriority === 'morePrecision' || roundingPriority === 'lessPrecision') {
      roundingType = roundingPriority;
      computedPriority = roundingPriority;
    } else if (hasSignificant) {
      roundingType = 'significantDigits';
    } else {
      roundingType = 'fractionDigits';
    }
    if (roundingIncrement !== 1) {
      if (roundingType !== 'fractionDigits') {
        throw new TypeError('roundingIncrement can only be used with fraction digits');
      }
      if (maxFraction !== minFraction) {
        throw new RangeError('roundingIncrement needs minimumFractionDigits and ' +
                             'maximumFractionDigits to be equal');
      }
    }
    slots.roundingType = roundingType;
    if (roundingType !== 'significantDigits') {
      slots.minimumFractionDigits = minFraction;
      slots.maximumFractionDigits = maxFraction;
    }
    if (roundingType !== 'fractionDigits') {
      slots.minimumSignificantDigits = minSignificant;
      slots.maximumSignificantDigits = maxSignificant;
    }
    slots.roundingIncrement = roundingIncrement;
    slots.roundingMode = roundingMode;
    slots.roundingPriority = computedPriority;
    slots.trailingZeroDisplay = trailingZeroDisplay;

    const compactDisplay = getOption(options, 'compactDisplay', 'string', ['short', 'long'], 'short');
    const groupingDefault = notation === 'compact' ? 'min2' : 'auto';
    if (notation === 'compact') slots.compactDisplay = compactDisplay;
    // useGrouping 既收布尔也收字符串（标准的 GetBooleanOrStringNumberFormatOption）
    let useGrouping = options.useGrouping;
    if (useGrouping === undefined) useGrouping = groupingDefault;
    else if (useGrouping === true) useGrouping = 'always';
    else if (!useGrouping) useGrouping = false;
    else {
      useGrouping = String(useGrouping);
      if (!['min2', 'auto', 'always', 'true', 'false'].includes(useGrouping)) {
        throw new RangeError('useGrouping has no value "' + useGrouping +
                             '"; expected one of: min2 / auto / always / true / false');
      }
      if (useGrouping === 'true' || useGrouping === 'false') useGrouping = groupingDefault;
    }
    slots.useGrouping = useGrouping;
    slots.signDisplay = getOption(options, 'signDisplay', 'string',
                                  ['auto', 'never', 'always', 'exceptZero', 'negative'], 'auto');

    // 到这里标准规定的错都报完了。下面是运行时做不了的
    if (style === 'unit') throw unsupported('style', 'unit');
    if (notation === 'engineering') throw unsupported('notation', notation);
    if (notation === 'compact' && compactDisplay === 'long') throw unsupported('compactDisplay', 'long');
    if (!SUPPORTED_ROUNDING_MODES.includes(roundingMode)) throw unsupported('roundingMode', roundingMode);
    if (roundingPriority !== 'auto') throw unsupported('roundingPriority', roundingPriority);
    if (trailingZeroDisplay !== 'auto') throw unsupported('trailingZeroDisplay', trailingZeroDisplay);
    if (roundingType === 'significantDigits' && slots.minimumIntegerDigits !== 1) {
      throw unsupported('minimumIntegerDigits', slots.minimumIntegerDigits +
                        ' together with significant digits');
    }

    // 交给原生的那一份：只有它用得着的字段。同一组选项只建一个格式化器
    const native = {
      locale: resolved.locale,
      numbers: slots.numberingSystem === localeDefault ? null : slots.numberingSystem,
      style,
      currency: slots.currency || null,
      currencyDisplay: slots.currencyDisplay || null,
      currencySign: slots.currencySign || null,
      notation,
      signDisplay: slots.signDisplay,
      useGrouping: slots.useGrouping,
      minimumIntegerDigits: slots.minimumIntegerDigits,
      // 紧凑写法的默认精度让系统自己定（它和标准是同一个结果），不传
      precision: roundingType === 'morePrecision' ? 'default'
        : roundingType === 'significantDigits' ? 'significant' : 'fraction',
      minimumFractionDigits: minFraction === undefined ? null : minFraction,
      maximumFractionDigits: maxFraction === undefined ? null : maxFraction,
      minimumSignificantDigits: minSignificant === undefined ? null : minSignificant,
      maximumSignificantDigits: maxSignificant === undefined ? null : maxSignificant,
      roundingMode,
      roundingIncrement,
    };
    slots.formatter = call('numberFormat:', [JSON.stringify(native), native]);
    slots.boundFormat = undefined;
    Object.defineProperty(target, kSlots, { value: slots });
    return target;
  }

  // 值怎么交给原生。数走字符串而不是 JSON 的数：NaN、Infinity、-0 在 JSON 里
  // 都没有，而且字符串形式是「能读回同一个双精度数的最短写法」，不丢位。
  //   d:<数>   双精度数      n:<十进制数字串>   精确的十进制数（BigInt、数字字符串）
  function encodeValue(value) {
    if (typeof value === 'object' && value !== null || typeof value === 'function') {
      // ToPrimitive，偏好数
      const prim = value[Symbol.toPrimitive];
      value = prim != null ? prim.call(value, 'number') : value.valueOf();
      if (typeof value === 'object' && value !== null) value = String(value);
    }
    if (typeof value === 'bigint') return 'n:' + value.toString();
    if (typeof value === 'string') {
      const number = Number(value);
      const text = value.trim();
      // 普通的十进制写法按原样的每一位格式化，不先变成双精度数
      if (Number.isFinite(number) && number !== 0 && /^[+-]?(\d+\.?\d*|\.\d+)$/.test(text)) {
        return 'n:' + (text[0] === '+' ? text.slice(1) : text);
      }
      value = number;
    }
    const number = Number(value);   // Symbol 在这里抛 TypeError，和标准一致
    return Object.is(number, -0) ? 'd:-0' : 'd:' + String(number);
  }
  function formatValue(slots, value) {
    const encoded = encodeValue(value);
    // 精确的十进制数系统最多装 38 位有效数字。再长的没有办法不丢位，
    // 而「悄悄丢位」比抛更坏
    if (encoded.charCodeAt(0) === 110 /* n */ &&
        encoded.replace(/[^0-9]/g, '').replace(/^0+/, '').length > 38) {
      throw new RangeError('numbers with more than 38 significant digits ' +
                           'are not supported by this runtime');
    }
    return call('formatNumber:', [slots.formatter, encoded]);
  }

  // 标准规定 length 是 0，所以不写形参
  function NumberFormat() {
    // 标准允许不带 new 调用，效果一样
    const target = new.target === undefined ? Object.create(NumberFormat.prototype) : this;
    return initialize(target, arguments[0], arguments[1]);
  }
  define(NumberFormat, 'supportedLocalesOf', function supportedLocalesOf(locales, options) {
    return supportedLocales(canonicalizeLocaleList(locales), options);
  });
  Object.defineProperty(NumberFormat, 'prototype', { writable: false });
  const proto = NumberFormat.prototype;
  // format 是取值器：取出来的是绑定好的函数，可以直接交给 map
  Object.defineProperty(proto, 'format', {
    configurable: true,
    enumerable: false,
    get() {
      const slots = slotsOf(this, 'format');
      if (slots.boundFormat === undefined) {
        slots.boundFormat = (value) => formatValue(slots, value);
        Object.defineProperty(slots.boundFormat, 'name', { value: '' });
      }
      return slots.boundFormat;
    },
  });
  // 这三个这一步不做。方法留着，是为了报一个说得清的错，而不是「不是函数」
  for (const name of ['formatRange', 'formatRangeToParts', 'formatToParts']) {
    define(proto, name, {
      [name]() {
        slotsOf(this, name);
        throw unsupportedMethod('Intl.NumberFormat.prototype.' + name);
      },
    }[name]);
  }
  define(proto, 'resolvedOptions', function resolvedOptions() {
    const slots = slotsOf(this, 'resolvedOptions');
    const out = {};
    // 键的顺序是标准定的
    for (const key of ['locale', 'numberingSystem', 'style', 'currency', 'currencyDisplay',
                       'currencySign', 'minimumIntegerDigits', 'minimumFractionDigits',
                       'maximumFractionDigits', 'minimumSignificantDigits',
                       'maximumSignificantDigits', 'useGrouping', 'notation', 'compactDisplay',
                       'signDisplay', 'roundingIncrement', 'roundingMode', 'roundingPriority',
                       'trailingZeroDisplay']) {
      if (slots[key] !== undefined) out[key] = slots[key];
    }
    return out;
  });
  Object.defineProperty(proto, Symbol.toStringTag, {
    value: 'Intl.NumberFormat', writable: false, enumerable: false, configurable: true,
  });

  // ---------- Intl ----------

  const Intl = {};
  Object.defineProperty(Intl, Symbol.toStringTag, {
    value: 'Intl', writable: false, enumerable: false, configurable: true,
  });
  define(Intl, 'NumberFormat', NumberFormat);
  define(Intl, 'getCanonicalLocales', function getCanonicalLocales(locales) {
    return canonicalizeLocaleList(locales);
  });
  define(globalThis, 'Intl', Intl);

  // 日期那一半在下一个 part 里，这些它也要用
  ctx.intl = {
    Intl, call, info, canonicalizeLocaleList, bestAvailable, getOption, defaultNumberOption,
    supportedLocales, unsupportedMethod,
  };

  // ---------- toLocaleString ----------
  //
  // 没有 ICU 的 V8 把这两个的参数整个忽略。换成标准规定的行为：等于
  // new Intl.NumberFormat(locales, options).format(this)。
  //
  // 每次调用都要解析一遍选项，所以留着最近用过的几个格式化器，
  // 列表里对一列数反复调同一组参数是最常见的用法
  const recent = new Map();
  function cachedFormat(locales, options) {
    let key;
    if (locales === undefined && options === undefined) key = '';
    else if ((locales === undefined || typeof locales === 'string') &&
             (options === undefined || (typeof options === 'object' && options !== null))) {
      try { key = JSON.stringify([locales === undefined ? null : locales, options || null]); }
      catch (e) { key = undefined; }
    }
    if (key === undefined) return new NumberFormat(locales, options);
    let formatter = recent.get(key);
    if (formatter === undefined) {
      formatter = new NumberFormat(locales, options);
      if (recent.size >= 32) recent.delete(recent.keys().next().value);
      recent.set(key, formatter);
    }
    return formatter;
  }
  const numberValueOf = Number.prototype.valueOf;
  define(Number.prototype, 'toLocaleString', function toLocaleString() {
    const value = numberValueOf.call(this);   // 不是数就抛 TypeError
    return formatValue(cachedFormat(arguments[0], arguments[1])[kSlots], value);
  });
  const bigintValueOf = BigInt.prototype.valueOf;
  define(BigInt.prototype, 'toLocaleString', function toLocaleString() {
    const value = bigintValueOf.call(this);
    return formatValue(cachedFormat(arguments[0], arguments[1])[kSlots], value);
  });

  // 数组的 toLocaleString 要把地区和选项传给每个成员（ECMA-402 的规定）。
  // 没有 ICU 的 V8 不传，所以 [1234.5].toLocaleString('de-DE') 还是英文写法
  const visiting = [];
  function joinLocalized(list, length, locales, options) {
    // 数组里套着自己的时候返回空串，和 join 一个规矩
    if (visiting.includes(list)) return '';
    visiting.push(list);
    try {
      let out = '';
      for (let i = 0; i < length; i++) {
        if (i > 0) out += ',';
        const item = list[i];
        if (item !== undefined && item !== null) out += String(item.toLocaleString(locales, options));
      }
      return out;
    } finally {
      visiting.pop();
    }
  }
  define(Array.prototype, 'toLocaleString', function toLocaleString() {
    const list = Object(this);
    const length = Math.min(Math.max(Math.trunc(Number(list.length)) || 0, 0), Number.MAX_SAFE_INTEGER);
    return joinLocalized(list, length, arguments[0], arguments[1]);
  });
  const TypedArray = Object.getPrototypeOf(Int8Array);
  const typedLength = Object.getOwnPropertyDescriptor(TypedArray.prototype, 'length').get;
  define(TypedArray.prototype, 'toLocaleString', function toLocaleString() {
    // 不是类型化数组时这个取值器自己会抛 TypeError
    return joinLocalized(this, typedLength.call(this), arguments[0], arguments[1]);
  });

  // ---------- String.prototype.normalize ----------
  //
  // 它不属于 Intl，放在这里是因为病根相同：没有 ICU 的 V8 把字符串原样返回，
  // 不报错。换成标准规定的行为（ECMA-262 的 String.prototype.normalize），
  // 规范化本身交给系统，验收里和网页逐条比。
  const normalizationForms = ['NFC', 'NFD', 'NFKC', 'NFKD'];
  const asciiOnly = /^[\x00-\x7f]*$/;
  const isWellFormed = String.prototype.isWellFormed;
  const includes = String.prototype.includes;
  function normalizeText(text, form) {
    // ASCII 在四种形式下都不变，不用过桥
    if (asciiOnly.test(text)) return text;
    return call('normalize:', [text, form]);
  }
  // 从 from 起第一个过不了桥的码元在哪，没有就是 -1。两种：
  //   - 落单的代理项：桥上走的是 JSON 和 UTF-8，它转不成 UTF-8
  //   - U+FEFF：系统从 UTF-8 建字符串时会把开头的那一个去掉
  function unbridgeableAt(text, from) {
    for (let i = from; i < text.length; i++) {
      const unit = text.charCodeAt(i);
      if (unit === 0xfeff) return i;
      if (unit >= 0xd800 && unit <= 0xdbff) {
        const next = text.charCodeAt(i + 1);
        if (next >= 0xdc00 && next <= 0xdfff) { i++; continue; }
        return i;
      }
      if (unit >= 0xdc00 && unit <= 0xdfff) return i;
    }
    return -1;
  }
  // 写成对象里的方法，是为了和内置的一样不能当构造函数、没有 prototype 属性
  define(String.prototype, 'normalize', {
    normalize() {
      if (this === null || this === undefined) {
        throw new TypeError('String.prototype.normalize called on null or undefined');
      }
      // 模板字符串做的是标准的 ToString：Symbol 会抛，对象先问 toString
      const text = `${this}`;
      const form = arguments[0] === undefined ? 'NFC' : `${arguments[0]}`;
      if (!normalizationForms.includes(form)) {
        throw new RangeError('The normalization form should be one of NFC, NFD, NFKC, NFKD.');
      }
      if (isWellFormed.call(text) && !includes.call(text, '\ufeff')) return normalizeText(text, form);
      // 有过不了桥的码元，而标准要求它们原样留着。这两种都不拆、不和前后的
      // 字符合成、也不参与重排，所以在它们那里把字符串切开、各段分别规范化、
      // 再接回去，结果和整个一起做是一样的
      let result = '';
      let from = 0;
      for (let at = unbridgeableAt(text, 0); at !== -1; at = unbridgeableAt(text, from)) {
        result += normalizeText(text.slice(from, at), form) + text[at];
        from = at + 1;
      }
      return result + normalizeText(text.slice(from), form);
    },
  }.normalize);

})
