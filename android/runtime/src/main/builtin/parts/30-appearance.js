// 外观：View 的背景、前景、透明度、可见性、高度和阴影、轮廓和裁切、变换、模糊；Drawable 一族
// （Drawable、ColorDrawable、GradientDrawable、RippleDrawable）；RenderEffect 的模糊
// （Android 12 起，11 上没有这个类，View 上也没有 renderEffect）。
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
//
// 照「接类的总则」（2026-11-26，docs/project.md 第 4 节）：
//
// - 视图上的外观是登记的状态（ctx.defineViewState）：读回的就是写进去的值，颜色也原样读回。
// - Drawable 和 RenderEffect 也只在 JS 里记状态。每用在一个挂着的视图上，就按那个视图所在的
//   页面建一个原生对象（这里叫「一处」），长度按那个页面的密度换成像素；JS 改了挨个同步到每一处。
//   视图拿下来、换了背景，那一处跟着丢掉；密度变了重建。图片组的 BitmapDrawable、ImageView 的
//   drawable 也接这一套，用法见 docs/internals/android.md「外观」。
// - 长度是 dp，角度是度，透明度一律 0–1。
// - 写错：Web IDL 转不过来的抛 TypeError，超出范围、个数不对抛 RangeError；颜色、枚举的名字写错，
//   属性位打一条警告、值不变，方法和构造的参数抛 TypeError。
//
// 颜色写成 CSS 的字符串，在这里解析（纯文本运算），过桥的是 ARGB 的无符号整数。解析的几个函数
// 放在 ctx 上，排在后面的组也能用。原生那一侧是 AppearanceDomain.kt，只管把交过去的值设上。
(function (ctx) {
  'use strict';

  const {
    EventTarget,
    IGNORE,
    attachedNative,
    defineNativeClass,
    defineViewState,
    describeValue,
    enumArgument,
    enumProperty,
    kHandle,
    kOwner,
    native,
    nativeCall,
    nativeClassCallValue,
    nativeClassNames,
    nativeSet,
    nearestNative,
    px,
    toText,
  } = ctx;
  // 10-view.js 定义的，挂在全局
  const { View } = globalThis;

  // ---- 颜色 ----

  // 0–255 或百分比 → 0–255 的整数（超出范围的照 CSS 夹到范围里）
  function channel(token) {
    const t = token.trim();
    const n = t.endsWith('%') ? Number(t.slice(0, -1)) * 2.55 : Number(t);
    if (t === '' || !Number.isFinite(n)) return null;
    return Math.round(Math.min(255, Math.max(0, n)));
  }
  // 0–1 或百分比 → 0–255 的整数
  function alphaChannel(token) {
    const t = token.trim();
    const n = t.endsWith('%') ? Number(t.slice(0, -1)) / 100 : Number(t);
    if (t === '' || !Number.isFinite(n)) return null;
    return Math.round(Math.min(1, Math.max(0, n)) * 255);
  }
  const argbOf = (a, r, g, b) => ((a << 24) | (r << 16) | (g << 8) | b) >>> 0;

  // CSS 的颜色字符串 → ARGB（0–0xFFFFFFFF）。认不出给 null。
  // 认：#rgb、#rgba、#rrggbb、#rrggbbaa（透明度在最后，和 CSS 一样，和 Android 的
  // Color.parseColor 相反）、rgb() / rgba() 的逗号写法和空格写法、transparent
  function parseColor(text) {
    const t = String(text).trim();
    if (t.toLowerCase() === 'transparent') return 0;
    if (t[0] === '#') {
      const hex = t.slice(1);
      if (!/^[0-9a-fA-F]+$/.test(hex)) return null;
      const one = (i) => parseInt(hex[i] + hex[i], 16);
      const two = (i) => parseInt(hex.slice(i, i + 2), 16);
      if (hex.length === 3) return argbOf(255, one(0), one(1), one(2));
      if (hex.length === 4) return argbOf(one(3), one(0), one(1), one(2));
      if (hex.length === 6) return argbOf(255, two(0), two(2), two(4));
      if (hex.length === 8) return argbOf(two(6), two(0), two(2), two(4));
      return null;
    }
    const call = /^(rgba?)\s*\((.*)\)$/is.exec(t);
    if (call === null) return null;
    const inner = call[2];
    let tokens;
    if (inner.includes(',')) {
      tokens = inner.split(',');
    } else {
      const bySlash = inner.split('/');
      if (bySlash.length > 2) return null;
      tokens = bySlash[0].trim().split(/\s+/);
      if (bySlash.length === 2) tokens.push(bySlash[1]);
    }
    if (tokens.length !== 3 && tokens.length !== 4) return null;
    const r = channel(tokens[0]);
    const g = channel(tokens[1]);
    const b = channel(tokens[2]);
    const a = tokens.length === 4 ? alphaChannel(tokens[3]) : 255;
    if (r === null || g === null || b === null || a === null) return null;
    return argbOf(a, r, g, b);
  }

  // ARGB → '#rrggbb'（不透明）或 '#rrggbbaa'。原生交回来的颜色（图片组的 getPixel）用它
  function colorText(argb) {
    const v = argb >>> 0;
    const hex = (n) => n.toString(16).padStart(2, '0');
    const a = v >>> 24;
    const rgb = '#' + hex((v >>> 16) & 255) + hex((v >>> 8) & 255) + hex(v & 255);
    return a === 255 ? rgb : rgb + hex(a);
  }

  // 属性位，旧写法：写错打一条警告，返回 null（调用的地方就不过桥，值不变）。还没改的组在用
  function colorProperty(what, value) {
    const text = toText(value);
    const argb = parseColor(text);
    if (argb === null) {
      console.warn('[Nacre] ' + what + ': ' + JSON.stringify(text) + ' is not a valid color, ignored');
    }
    return argb;
  }
  // 方法参数和构造：写错抛 TypeError
  function colorArgument(what, value) {
    const text = toText(value);
    const argb = parseColor(text);
    if (argb === null) throw new TypeError(what + ': ' + JSON.stringify(text) + ' is not a valid color');
    return argb;
  }
  // 颜色状态（新写法）：存写进去的字符串，原样读回。写错打警告、返回 IGNORE
  function colorState(value, what) {
    const text = toText(value);
    if (parseColor(text) !== null) return text;
    console.warn('[Nacre] ' + what + ': ' + JSON.stringify(text) + ' is not a valid color, ignored');
    return IGNORE;
  }
  // 存着的颜色（已经查过）→ ARGB
  const argbOfText = (text) => parseColor(text);

  // ---- 参数转换：照 Web IDL ----

  // 数：Number() 后要是有限数
  function toNumber(v, where) {
    const n = Number(v);
    if (!Number.isFinite(n)) throw new TypeError(where + ': expected a finite number, got ' + describeValue(v));
    return n;
  }
  function nonNegative(v, where) {
    const n = toNumber(v, where);
    if (n < 0) throw new RangeError(where + ': expected a number not less than 0, got ' + n);
    return n;
  }
  function positive(v, where) {
    const n = toNumber(v, where);
    if (n <= 0) throw new RangeError(where + ': expected a number greater than 0, got ' + n);
    return n;
  }
  // 0–1：透明度、渐变的位置
  function unit(v, where) {
    const n = toNumber(v, where);
    if (n < 0 || n > 1) throw new RangeError(where + ': expected a number between 0 and 1, got ' + n);
    return n;
  }
  // 可空的：null 和 undefined 是 null
  const nullable = (convert) => (v, where) => (v == null ? null : convert(v, where));
  // 序列（Web IDL 的 sequence）：要是可迭代的对象；字符串不算
  function toSequence(v, where) {
    if (v === null || typeof v !== 'object' || typeof v[Symbol.iterator] !== 'function') {
      throw new TypeError(where + ': expected an array, got ' + describeValue(v));
    }
    return Array.from(v);
  }
  function required(dict, key, where) {
    const v = dict[key];
    if (v === undefined) throw new TypeError(where + ': required member ' + key + ' is undefined.');
    return v;
  }

  // ---- 一处一个原生对象 ----
  //
  // Drawable、RenderEffect 的 JS 对象只记状态（kModel）。每用在一个挂着的视图上，就在那个视图
  // 所在的页面上建一个原生对象：这是「一处」（place）。水波的内容、遮罩在水波的每一处里各有一处。
  //
  //   place = { obj, page, standIn, children, rebuild }
  //     standIn   带 kHandle 的内部对象，绑着这一处的原生对象（kOwner 指回 obj）
  //     children  子 Drawable 在这一处里的那几处
  //     rebuild   结构变了（水波换了内容）时整个重建这一处、装回用它的地方：用它的地方给的
  //
  // 状态变了：能当场设的挨个设到每一处；结构变了的整个重建。用它的地方（视图的背景）换了别的、
  // 视图离开页面时，那一处放掉（release）：之后原生对象没人拿着，被回收。
  const kModel = Symbol('model');

  const specs = new Map();         // 原型 -> { nativeClass, construct }
  const ownStates = new Map();     // 原型 -> 这个原型自己登记的状态
  const statesCache = new Map();   // 原型 -> 连同继承来的，排好序
  let serial = 0;

  function specOf(proto) {
    for (let p = proto; p !== null; p = Object.getPrototypeOf(p)) {
      const spec = specs.get(p);
      if (spec !== undefined) return spec;
    }
    return undefined;
  }

  function statesOf(proto) {
    let list = statesCache.get(proto);
    if (list !== undefined) return list;
    list = [];
    for (let p = proto; p !== null; p = Object.getPrototypeOf(p)) {
      const own = ownStates.get(p);
      if (own !== undefined) list.push(...own);
    }
    list.sort((x, y) => x.order - y.order || x.serial - y.serial);
    statesCache.set(proto, list);
    return list;
  }

  function stateEntry(obj, name) {
    return statesOf(Object.getPrototypeOf(obj)).find((e) => e.name === name);
  }

  function modelOf(obj, what) {
    const m = obj == null ? undefined : obj[kModel];
    if (m === undefined) throw new TypeError(what + ': Illegal invocation');
    return m;
  }

  // 状态的当前值（没写过是 initial）。不走 getter：子类覆写了 getter 也不影响设到原生的值
  function stateValue(obj, name) {
    const m = obj[kModel];
    if (m.values.has(name)) return m.values.get(name);
    const entry = stateEntry(obj, name);
    return entry === undefined ? undefined : entry.initial;
  }

  // 这个类的对象怎么建原生对象：
  //   nativeClass  原生类名（defineNativeClass 登记过的）
  //   construct    (obj, page, children) => 构造参数的数组；children 是子 Drawable 那几处的
  //                替身（{ 状态名: 替身 }），放进参数里就是原生对象
  function defineModel(Cls, spec) {
    specs.set(Cls.prototype, spec);
  }

  // 给构造函数用：建好记录
  function initModel(obj) {
    Object.defineProperty(obj, kModel, { value: { values: new Map(), places: new Set() } });
  }

  // 登记一个状态：
  //   order    建原生对象时设的先后，小的先
  //   initial  没写过时读到的值。必须等于新建的原生对象的默认值：没写过的不设
  //   convert  (v, 名字, obj) => 要存的值：类型不对抛 TypeError，范围不对抛 RangeError，名字写错
  //            打警告、返回 IGNORE
  //   apply    (替身, 值, 页面, obj) => 设到一处的原生对象。几个状态合成一次原生调用的（边框）
  //            用 stateValue 读别的
  //   after    (obj, 值) => 写完之后改别的状态（纯色和渐变互斥）。可以省略
  //   child    true：值是子 Drawable（水波的内容、遮罩），变了整个重建
  //   rebuild  (obj, 写之前的值表) => 这次要不要整个重建，不当场设（填充从纯色变成渐变）。可以省略
  function defineModelState(Cls, name, spec) {
    const entry = { name, serial: serial++, ...spec };
    const proto = Cls.prototype;
    if (!ownStates.has(proto)) ownStates.set(proto, []);
    ownStates.get(proto).push(entry);
    statesCache.clear();
    Object.defineProperty(proto, name, {
      get() {
        const m = modelOf(this, name);
        return m.values.has(name) ? m.values.get(name) : entry.initial;
      },
      set(v) {
        const m = modelOf(this, name);
        const value = entry.convert(v, name, this);
        if (value === IGNORE) return;
        const before = new Map(m.values);
        m.values.set(name, value);
        if (entry.after !== undefined) entry.after(this, value);
        sync(this, entry, before);
      },
      enumerable: false,
      configurable: true,
    });
  }

  // 一个状态变了，同步到每一处。原生拒了（JS 没查住的）：值还原、已经设过的设回去，抛给写的那一行
  function sync(obj, entry, before) {
    const m = obj[kModel];
    if (m.places.size === 0) return;
    const rebuild = entry.child === true || (entry.rebuild !== undefined && entry.rebuild(obj, before));
    const run = (place) => {
      if (rebuild) place.rebuild();
      else entry.apply(place.standIn, stateValue(obj, entry.name), place.page, obj);
    };
    let failure = null;
    for (const place of [...m.places]) {
      // 重建前面那一处时可能连带放掉了这一处（同一个 Drawable 既是内容又是遮罩）
      if (!m.places.has(place)) continue;
      try {
        run(place);
      } catch (err) {
        failure = err;
        break;
      }
    }
    if (failure === null) return;
    m.values.clear();
    for (const [k, v] of before) m.values.set(k, v);
    for (const place of [...m.places]) {
      if (!m.places.has(place)) continue;
      try {
        run(place);
      } catch (err) {
        // 已经在报一个错了，这里的不再往外抛
      }
    }
    throw failure;
  }

  // 过桥的参数：替身放到句柄里
  function splitArgs(args) {
    const values = [];
    const handles = [];
    for (const a of args) {
      const isObject = a != null && typeof a === 'object' && a[kHandle] !== undefined;
      values.push(isObject ? null : a);
      handles.push(isObject ? a[kHandle] : 0);
    }
    return { values, handles };
  }

  // 在页面上建一处。rebuild 是用它的地方给的：结构变了时调它
  function realize(obj, page, rebuild) {
    const m = obj[kModel];
    const proto = Object.getPrototypeOf(obj);
    const spec = specOf(proto);
    const place = { obj, page, standIn: null, children: [], rebuild };
    const entries = statesOf(proto);
    try {
      // 子 Drawable 先建：它们结构变了，这一处整个重建
      const children = Object.create(null);
      for (const entry of entries) {
        if (entry.child !== true) continue;
        const child = stateValue(obj, entry.name);
        if (child === null) continue;
        const childPlace = realize(child, page, () => place.rebuild());
        place.children.push(childPlace);
        children[entry.name] = childPlace.standIn;
      }
      const standIn = Object.create(null);
      standIn[kOwner] = obj;
      const { values, handles } = splitArgs(spec.construct(obj, page, children));
      const handle = native.construct(spec.nativeClass, values, handles, standIn);
      if (!handle) throw new TypeError('cannot construct ' + spec.nativeClass);
      Object.defineProperty(standIn, kHandle, { value: handle });
      place.standIn = standIn;
      for (const entry of entries) {
        if (entry.child === true || !m.values.has(entry.name)) continue;
        entry.apply(standIn, m.values.get(entry.name), page, obj);
      }
    } catch (err) {
      for (const child of place.children) release(child);
      throw err;
    }
    m.places.add(place);
    return place;
  }

  function release(place) {
    place.obj[kModel].places.delete(place);
    for (const child of place.children) release(child);
    place.children = [];
  }

  // 要求是某一类（Drawable、RenderEffect）的、能建原生对象的 JS 对象
  function requireModel(v, Cls, where) {
    if (!(v instanceof Cls) || v[kModel] === undefined || specOf(Object.getPrototypeOf(v)) === undefined) {
      throw new TypeError(where + ': expected a ' + nativeClassNames.get(Cls) + ', got ' + describeValue(v));
    }
    return v;
  }

  // ---- 视图上放一个 Drawable（或者 RenderEffect）的状态 ----
  //
  // defineModelSlot(视图类, 名字, { order, Cls, set })：登记一个视图状态，值是 Cls 的对象或 null。
  // 设到原生时在视图的页面上建一处，set(视图的替身, 那一处的替身 | null) 装上去；换了别的、视图
  // 离开页面时放掉那一处；密度变了重建（units: 'dp'）。图片组的 ImageView.drawable 用它
  const viewPlaces = new WeakMap();  // 视图 -> Map(状态名 -> 一处)

  function dropPlace(view, name) {
    const places = viewPlaces.get(view);
    const place = places === undefined ? undefined : places.get(name);
    if (place === undefined) return;
    places.delete(name);
    release(place);
  }

  function placeInto(view, name, standIn, value, page, set) {
    let places = viewPlaces.get(view);
    if (places === undefined) viewPlaces.set(view, (places = new Map()));
    const old = places.get(name);
    if (value === null) {
      set(standIn, null);
      places.delete(name);
      if (old !== undefined) release(old);
      return;
    }
    const place = realize(value, page, () => {
      // 结构变了：还是这一处、视图还挂着，就整个重建、装回去
      const current = attachedNative(view);
      if (current !== null && places.get(name) === place) placeInto(view, name, current, value, page, set);
    });
    try {
      set(standIn, place.standIn);
    } catch (err) {
      release(place);
      throw err;
    }
    places.set(name, place);
    if (old !== undefined) release(old);
  }

  function defineModelSlot(ViewCls, name, spec) {
    defineViewState(ViewCls, name, {
      order: spec.order,
      initial: null,
      units: 'dp',
      convert: (v, what) => (v == null ? null : requireModel(v, spec.Cls, what)),
      apply: (standIn, value, page, view) => placeInto(view, name, standIn, value, page, spec.set),
      release: (view) => dropPlace(view, name),
    });
  }

  // ---- Drawable 一族 ----

  // 是 EventTarget：动图（图片组的 AnimatedImageDrawable）发 animationstart / animationend
  class Drawable extends EventTarget {
    constructor() {
      if (nearestNative(new.target) === Drawable) {
        throw new TypeError('Illegal constructor: Drawable is abstract and cannot be constructed; ' +
                            'use ColorDrawable, GradientDrawable or RippleDrawable');
      }
      super();
      initModel(this);
    }
  }
  defineNativeClass('Drawable', Drawable);

  // 不透明度，0–1（Java 是 0–255）。最后设：ColorDrawable 设颜色时会把它冲掉，见下面
  defineModelState(Drawable, 'alpha', {
    order: 900,
    initial: 1,
    convert: (v, what) => unit(v, what),
    apply: (standIn, value) => nativeSet(standIn, 'alpha', Math.round(value * 255)),
  });

  class ColorDrawable extends Drawable {
    // 颜色可以不给（全透明）
    constructor(color) {
      super();
      if (color !== undefined) {
        const where = "Failed to construct 'ColorDrawable'";
        colorArgument(where, color);
        this[kModel].values.set('color', toText(color));
      }
    }
  }
  defineNativeClass('ColorDrawable', ColorDrawable);
  defineModel(ColorDrawable, { nativeClass: 'ColorDrawable', construct: () => [] });
  defineModelState(ColorDrawable, 'color', {
    order: 100,
    initial: '#00000000',
    convert: colorState,
    // Java 的 setColor 会把 setAlpha 设的透明度冲掉，所以设完颜色再设一次透明度
    apply: (standIn, value, page, d) => {
      nativeSet(standIn, 'color', argbOfText(value));
      nativeSet(standIn, 'alpha', Math.round(stateValue(d, 'alpha') * 255));
    },
  });

  // 构造只有无参的（多给的不管），都用属性设
  class GradientDrawable extends Drawable {}
  defineNativeClass('GradientDrawable', GradientDrawable);
  defineModel(GradientDrawable, { nativeClass: 'GradientDrawable', construct: () => [] });

  const gradientEnum = (name, table, order, initial) => defineModelState(GradientDrawable, name, {
    order,
    initial,
    convert: (v, what) => enumProperty(table, v, what),
    apply: (standIn, value) => nativeSet(standIn, name, value),
  });
  gradientEnum('shape', 'gradientShape', 100, 'rectangle');

  // 填充：纯色（color）或者渐变（colors），只能是一种。渐变的每一项是颜色，或者 { color, offset }
  // （offset 是 0–1 的位置，要么都带要么都不带）
  function fillKind(color, colors) {
    return colors !== null ? 'gradient' : color !== null ? 'solid' : 'none';
  }
  function applyFill(standIn, value, page, d) {
    const colors = stateValue(d, 'colors');
    const color = stateValue(d, 'color');
    if (colors !== null) {
      const plain = typeof colors[0] === 'string';
      nativeCall(standIn, 'setColors', [
        colors.map((stop) => argbOfText(plain ? stop : stop.color)),
        plain ? null : colors.map((stop) => stop.offset),
      ]);
    } else if (color !== null) {
      nativeSet(standIn, 'color', argbOfText(color));
    }
    // 两个都是 null（没有填充）：新建的原生对象就是这样，变成这样时整个重建（fillRebuild），不用设
  }
  // 填充的种类变了（纯色、渐变、没有）就整个重建：Java 里从渐变换回纯色时，画渐变的那个
  // shader 会不会清掉，文档没说，不赌
  const fillRebuild = (d, before) => {
    const was = fillKind(before.has('color') ? before.get('color') : null,
                         before.has('colors') ? before.get('colors') : null);
    return was !== fillKind(stateValue(d, 'color'), stateValue(d, 'colors'));
  };
  defineModelState(GradientDrawable, 'color', {
    order: 110,
    initial: null,
    convert: (v, what) => (v == null ? null : colorState(v, what)),
    // 写了纯色，渐变就没了；写 null 只去掉纯色
    after: (d, value) => { if (value !== null) d[kModel].values.set('colors', null); },
    apply: applyFill,
    rebuild: fillRebuild,
  });
  function convertColors(v, what) {
    if (v == null) return null;
    const list = toSequence(v, what);
    if (list.length < 2) throw new RangeError(what + ': a gradient needs at least 2 colors, got ' + list.length);
    const withOffsets = list[0] !== null && typeof list[0] === 'object';
    const out = [];
    let ok = true;
    for (const item of list) {
      const isStop = item !== null && typeof item === 'object';
      if (isStop !== withOffsets) {
        throw new TypeError(what + ': either every color has an offset ({ color, offset }) or none does');
      }
      const text = toText(isStop ? required(item, 'color', what) : item);
      if (isStop) {
        const offset = unit(required(item, 'offset', what), what);
        out.push(Object.freeze({ color: text, offset }));
      } else {
        out.push(text);
      }
      if (parseColor(text) === null && ok) {
        console.warn('[Nacre] ' + what + ': ' + JSON.stringify(text) + ' is not a valid color, ignored');
        ok = false;
      }
    }
    return ok ? Object.freeze(out) : IGNORE;
  }
  defineModelState(GradientDrawable, 'colors', {
    order: 111,
    initial: null,
    convert: convertColors,
    after: (d, value) => { if (value !== null) d[kModel].values.set('color', null); },
    apply: applyFill,
    rebuild: fillRebuild,
  });

  gradientEnum('gradientType', 'gradientType', 120, 'linearGradient');
  gradientEnum('orientation', 'gradientOrientation', 121, 'topBottom');

  // 渐变的中心，相对于自己的大小（0.5 是正中，可以在外面）。原生是一个方法设两个
  const applyCenter = (standIn, value, page, d) =>
    nativeCall(standIn, 'setGradientCenter', [stateValue(d, 'gradientCenterX'), stateValue(d, 'gradientCenterY')]);
  for (const [name, order] of [['gradientCenterX', 122], ['gradientCenterY', 123]]) {
    defineModelState(GradientDrawable, name, { order, initial: 0.5, convert: toNumber, apply: applyCenter });
  }

  // 放射渐变的半径，dp。null 是没设（系统的默认值是 0.5 像素）
  defineModelState(GradientDrawable, 'gradientRadius', {
    order: 124,
    initial: null,
    convert: nullable(nonNegative),
    apply: (standIn, value, page) => nativeSet(standIn, 'gradientRadius', value === null ? 0.5 : px(page, value)),
  });

  // 圆角，dp。cornerRadii 是四个角各两个半径（横、竖，从左上角顺时针），不是 null 时用它；
  // 写 cornerRadius 就是四个角一样，cornerRadii 变回 null
  const applyCorners = (standIn, value, page, d) => {
    const radii = stateValue(d, 'cornerRadii');
    if (radii !== null) nativeSet(standIn, 'cornerRadii', radii.map((r) => px(page, r)));
    else nativeSet(standIn, 'cornerRadius', px(page, stateValue(d, 'cornerRadius')));
  };
  defineModelState(GradientDrawable, 'cornerRadius', {
    order: 130,
    initial: 0,
    convert: nonNegative,
    after: (d) => { d[kModel].values.set('cornerRadii', null); },
    apply: applyCorners,
  });
  defineModelState(GradientDrawable, 'cornerRadii', {
    order: 131,
    initial: null,
    convert: (v, what) => {
      if (v == null) return null;
      const radii = toSequence(v, what).map((r) => nonNegative(r, what));
      if (radii.length !== 8) throw new RangeError(what + ': expected 8 values, got ' + radii.length);
      return Object.freeze(radii);
    },
    apply: applyCorners,
  });

  // 环（shape 是 'ring'）：内半径和粗细，dp；null 是按比例算（Java 的 -1）
  for (const [name, order] of [['innerRadius', 140], ['thickness', 142]]) {
    defineModelState(GradientDrawable, name, {
      order,
      initial: null,
      convert: nullable(nonNegative),
      apply: (standIn, value, page) => nativeSet(standIn, name, value === null ? -1 : px(page, value)),
    });
  }
  for (const [name, order, initial] of [['innerRadiusRatio', 141, 3], ['thicknessRatio', 143, 9]]) {
    defineModelState(GradientDrawable, name, {
      order,
      initial,
      convert: positive,
      apply: (standIn, value) => nativeSet(standIn, name, value),
    });
  }
  defineModelState(GradientDrawable, 'useLevel', {
    order: 144,
    initial: false,
    convert: (v) => Boolean(v),
    apply: (standIn, value) => nativeSet(standIn, 'useLevel', value),
  });

  // 固有尺寸，dp；null 是没有（Java 的 -1）。原生是一个方法设两个
  const applySize = (standIn, value, page, d) => {
    const size = (v) => (v === null ? -1 : px(page, v));
    nativeCall(standIn, 'setSize', [size(stateValue(d, 'intrinsicWidth')), size(stateValue(d, 'intrinsicHeight'))]);
  };
  for (const [name, order] of [['intrinsicWidth', 150], ['intrinsicHeight', 151]]) {
    defineModelState(GradientDrawable, name, { order, initial: null, convert: nullable(nonNegative), apply: applySize });
  }

  // 边框：粗细、颜色、虚线的线段和间隔（dp）。粗细是 0 就没有边框；虚线的线段是 0 就是实线。
  // 原生是一个方法设四个
  const applyStroke = (standIn, value, page, d) => nativeCall(standIn, 'setStroke', [
    px(page, stateValue(d, 'strokeWidth')),
    argbOfText(stateValue(d, 'strokeColor')),
    px(page, stateValue(d, 'strokeDashWidth')),
    px(page, stateValue(d, 'strokeDashGap')),
  ]);
  defineModelState(GradientDrawable, 'strokeWidth', { order: 160, initial: 0, convert: nonNegative, apply: applyStroke });
  defineModelState(GradientDrawable, 'strokeColor', { order: 161, initial: '#000000', convert: colorState, apply: applyStroke });
  defineModelState(GradientDrawable, 'strokeDashWidth', { order: 162, initial: 0, convert: nonNegative, apply: applyStroke });
  defineModelState(GradientDrawable, 'strokeDashGap', { order: 163, initial: 0, convert: nonNegative, apply: applyStroke });

  // 按下效果。构造只收颜色（多给的不管），内容和遮罩用属性设
  class RippleDrawable extends Drawable {
    constructor(color) {
      super();
      const where = "Failed to construct 'RippleDrawable'";
      if (arguments.length < 1) {
        throw new TypeError(where + ': 1 argument required, but only 0 present.');
      }
      colorArgument(where, color);
      this[kModel].values.set('color', toText(color));
    }
  }
  defineNativeClass('RippleDrawable', RippleDrawable);
  defineModel(RippleDrawable, {
    nativeClass: 'RippleDrawable',
    construct: (d, page, children) => [
      argbOfText(stateValue(d, 'color')),
      children.content === undefined ? null : children.content,
      children.mask === undefined ? null : children.mask,
    ],
  });
  defineModelState(RippleDrawable, 'color', {
    order: 100,
    initial: '#00000000',
    convert: colorState,
    apply: (standIn, value) => nativeSet(standIn, 'color', argbOfText(value)),
  });
  // 水波的最大半径，dp；null 是按视图的大小定（Java 的 RADIUS_AUTO）
  defineModelState(RippleDrawable, 'radius', {
    order: 110,
    initial: null,
    convert: nullable(nonNegative),
    apply: (standIn, value, page) => nativeSet(standIn, 'radius', value === null ? -1 : px(page, value)),
  });

  // d 的子 Drawable 里（往下几层）有没有 target
  function contains(d, target) {
    for (const entry of statesOf(Object.getPrototypeOf(d))) {
      if (entry.child !== true) continue;
      const child = stateValue(d, entry.name);
      if (child === null) continue;
      if (child === target || contains(child, target)) return true;
    }
    return false;
  }
  // 内容（画在水波底下）和遮罩（水波只在它不透明的地方画）
  for (const name of ['content', 'mask']) {
    defineModelState(RippleDrawable, name, {
      order: 120,
      initial: null,
      child: true,
      convert: (v, what, d) => {
        if (v == null) return null;
        requireModel(v, Drawable, what);
        if (v === d || contains(v, d)) {
          throw new ctx.DOMException("Failed to set the '" + what + "' property on 'RippleDrawable': " +
                                     'the drawable contains this one', 'HierarchyRequestError');
        }
        return v;
      },
    });
  }

  // ---- View 上加的 ----

  defineModelSlot(View, 'background', {
    order: 200,  // 在内边距（300）前面：系统设背景时可能会改内边距
    Cls: Drawable,
    set: (standIn, d) => nativeCall(standIn, 'setBackground', [d]),
  });
  defineModelSlot(View, 'foreground', {
    order: 210,
    Cls: Drawable,
    set: (standIn, d) => nativeCall(standIn, 'setForeground', [d]),
  });

  // 视图上的数值状态。dp 的挂上时换成像素
  function viewNumber(name, { initial, units, convert }) {
    defineViewState(View, name, {
      order: 250,
      initial,
      units,
      convert,
      apply: (standIn, value, page) => nativeSet(standIn, name, units === 'dp' ? px(page, value) : value),
    });
  }
  viewNumber('alpha', { initial: 1, convert: unit });
  // 高度（投影），dp，可以是负的
  viewNumber('elevation', { initial: 0, units: 'dp', convert: toNumber });
  for (const name of ['translationX', 'translationY', 'translationZ']) {
    viewNumber(name, { initial: 0, units: 'dp', convert: toNumber });
  }
  viewNumber('scaleX', { initial: 1, convert: toNumber });
  viewNumber('scaleY', { initial: 1, convert: toNumber });
  // 角度，度
  for (const name of ['rotation', 'rotationX', 'rotationY']) viewNumber(name, { initial: 0, convert: toNumber });
  // 绕 X、Y 轴转时相机离视图多远，dp
  viewNumber('cameraDistance', { initial: 1280, units: 'dp', convert: nonNegative });

  defineViewState(View, 'visibility', {
    order: 250,
    initial: 'visible',
    convert: (v, what) => enumProperty('visibility', v, what),
    apply: (standIn, value) => nativeSet(standIn, 'visibility', value),
  });

  // 缩放、旋转的中心，{ x, y }（dp，从视图的左上角量）；null 是视图的正中（跟着大小变）
  defineViewState(View, 'pivot', {
    order: 250,
    initial: null,
    units: 'dp',
    convert: (v, what) => {
      if (v === null || v === undefined) return null;
      if (typeof v !== 'object' && typeof v !== 'function') {
        throw new TypeError(what + ': expected an object { x, y } or null, got ' + describeValue(v));
      }
      const x = toNumber(required(v, 'x', what), what);
      const y = toNumber(required(v, 'y', what), what);
      return Object.freeze({ x, y });
    },
    apply: (standIn, value, page) => {
      if (value === null) nativeCall(standIn, 'resetPivot', []);
      else nativeCall(standIn, 'setPivot', [px(page, value.x), px(page, value.y)]);
    },
  });

  // 轮廓：阴影的形状，clipToOutline 时也按它裁
  defineViewState(View, 'outlineProvider', {
    order: 250,
    initial: 'background',
    convert: (v, what) => enumProperty('outlineProvider', v, what),
    apply: (standIn, value) => nativeSet(standIn, 'outlineProvider', value),
  });
  defineViewState(View, 'clipToOutline', {
    order: 250,
    initial: false,
    convert: (v) => Boolean(v),
    apply: (standIn, value) => nativeSet(standIn, 'clipToOutline', value),
  });
  for (const name of ['outlineAmbientShadowColor', 'outlineSpotShadowColor']) {
    defineViewState(View, name, {
      order: 250,
      initial: '#000000',
      convert: colorState,
      apply: (standIn, value) => nativeSet(standIn, name, argbOfText(value)),
    });
  }

  // ---- RenderEffect：Android 12 起 ----

  if (nativeClassCallValue('@appearance', 'hasRenderEffect', []) === true) {
    const kFactory = Symbol('RenderEffect');

    // 建出来不能改，没有可读的成员（和 Java 一样）
    class RenderEffect {
      constructor(token, params) {
        if (token !== kFactory) {
          throw new TypeError('Illegal constructor: use RenderEffect.createBlurEffect()');
        }
        initModel(this);
        this[kModel].params = params;
      }

      // 高斯模糊。半径是 dp；edgeTreatment 是边缘外的像素怎么取，默认 'clamp'（照 Compose 的 blur）
      static createBlurEffect(options) {
        const where = "Failed to execute 'createBlurEffect' on 'RenderEffect'";
        if (arguments.length < 1) throw new TypeError(where + ': 1 argument required, but only 0 present.');
        if (typeof options !== 'object' || options === null) {
          throw new TypeError(where + ": parameter 1 is not of type 'object'.");
        }
        const radiusX = nonNegative(required(options, 'radiusX', where), where);
        const radiusY = nonNegative(required(options, 'radiusY', where), where);
        const edgeTreatment = options.edgeTreatment === undefined ? 'clamp'
          : enumArgument('edgeTreatment', options.edgeTreatment, 'edgeTreatment');
        return new RenderEffect(kFactory, { radiusX, radiusY, edgeTreatment });
      }
    }
    defineNativeClass('RenderEffect', RenderEffect);
    defineModel(RenderEffect, {
      nativeClass: 'RenderEffect',
      construct: (effect, page) => {
        const p = effect[kModel].params;
        return ['blur', px(page, p.radiusX), px(page, p.radiusY), p.edgeTreatment];
      },
    });

    // 给视图加一个效果（模糊），null 去掉
    defineModelSlot(View, 'renderEffect', {
      order: 220,
      Cls: RenderEffect,
      set: (standIn, effect) => nativeCall(standIn, 'setRenderEffect', [effect]),
    });
  }

  Object.assign(ctx, {
    Drawable,
    colorArgument,
    colorProperty,
    colorState,
    colorText,
    defineModel,
    defineModelSlot,
    defineModelState,
    initModel,
    kModel,
    parseColor,
    requireModel,
    stateValue,
    toNumber,
  });
})
