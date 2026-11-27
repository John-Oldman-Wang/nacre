// 布局这一组（2026-11-27 照「接类的总则」重写）：子视图上的 view.layout（宽高、外边距、权重、对齐、
// 约束），读排版结果的 frame、locationInWindow / locationOnScreen、measure()，layoutchange 事件；
// LinearLayout、FrameLayout、ConstraintLayout 自己的状态，ViewGroup 的 clipChildren / clipToPadding。
// 原生那一侧是 android/runtime 的 LayoutDomain.kt。长度都是 dp。
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
//
// 往 10-view.js 的类（View、ViewGroup、LinearLayout）上加成员在这里加，不改那个文件。
//
// 「子视图在父视图里怎么摆」写在子视图上（view.layout），由父视图读：它是 10-view.js 的 placement
// 状态，子视图放进一个父视图之后，按父视图的类型设成原生的 LayoutParams；父视图不读的字段（
// FrameLayout 不读 weight）留着，换到读它的父视图下面再生效。
(function (ctx) {
  'use strict';

  const {
    IGNORE,
    attachedNative,
    define,
    defineNativeClass,
    defineViewState,
    describeValue,
    dp,
    enumNames,
    kSubscribe,
    kView,
    nativeCall,
    nativeClassCallValue,
    nativeGet,
    nativeSet,
    pageOf,
    px,
    subscribeNative,
  } = ctx;
  const { View, ViewGroup, LinearLayout } = globalThis;

  // ---- 写错时 ----
  //
  // 属性位写错名字：打一条警告，整次赋值不生效（view.layout 一次写好几项，有一项名字不对就整个不写）。
  // 嵌套的转换里抛它，最外面接住换成 IGNORE
  const kIgnored = Symbol('ignored');
  function ignore(message) {
    console.warn('[Nacre] ' + message + ', ignored');
    throw kIgnored;
  }
  function guarded(convert) {
    return function (v, what) {
      try {
        return convert(v, what);
      } catch (err) {
        if (err === kIgnored) return IGNORE;
        throw err;
      }
    };
  }
  function named(table, v, what) {
    const name = String(v);
    const names = enumNames(table);
    if (!names.includes(name)) {
      ignore(what + ' has no value ' + JSON.stringify(name) + '; expected one of: ' + names.join(' / '));
    }
    return name;
  }

  // ---- 参数转换（照 Web IDL）----

  function toNumber(v, what) {
    const n = Number(v);
    if (!Number.isFinite(n)) throw new TypeError(what + ': expected a finite number, got ' + describeValue(v));
    return n;
  }
  function toNonNegative(v, what) {
    const n = toNumber(v, what);
    if (n < 0) throw new RangeError(what + ': ' + n + ' is negative');
    return n;
  }
  function toPositive(v, what) {
    const n = toNumber(v, what);
    if (n <= 0) throw new RangeError(what + ': ' + n + ' is not greater than 0');
    return n;
  }
  function toFraction(v, what) {
    const n = toNumber(v, what);
    if (n < 0 || n > 1) throw new RangeError(what + ': ' + n + ' is out of range [0, 1]');
    return n;
  }
  const isObject = (v) => v !== null && (typeof v === 'object' || typeof v === 'function');
  const isView = (v) => v instanceof View && v[kView] !== undefined;

  // 名字的数组（位掩码、Gravity）。照 Web IDL 的 sequence：要是可迭代的对象，字符串不算
  function toNameList(v, what) {
    if (!isObject(v) || typeof v[Symbol.iterator] !== 'function') {
      throw new TypeError(what + ': expected an array of names, got ' + describeValue(v));
    }
    return Array.from(v, String);
  }

  // 宽高：dp（不小于 0）、wrapContent / matchParent / matchConstraint；null 是父视图给的默认值。
  // 不是数字的字符串当名字查
  function toSize(v, what) {
    if (v == null) return null;
    if (typeof v === 'string') {
      const t = v.trim();
      if (t === '' || !Number.isFinite(Number(t))) return named('layoutSize', v, what);
    }
    return toNonNegative(v, what);
  }

  // Gravity：每个方向最多一个名字，外加两个裁切的开关。名字表和文字组共用（Gravity.kt），布局这边
  // 水平方向只用 start / end（跟着布局方向），挑掉 left / right
  const physical = ['left', 'right'];
  const gravityNames = (table) => enumNames(table).filter((name) => !physical.includes(name));
  const gravityAxes = [['horizontal', 'gravityHorizontal'], ['vertical', 'gravityVertical']];
  function toGravity(v, what) {
    const list = toNameList(v, what);
    const all = gravityNames('gravityHorizontal').concat(gravityNames('gravityVertical'), gravityNames('gravityClip'));
    const seen = {};
    for (const name of list) {
      if (!all.includes(name)) {
        ignore(what + ' has no value ' + JSON.stringify(name) + '; expected one of: ' + all.join(' / '));
      }
      for (const [axis, table] of gravityAxes) {
        if (!gravityNames(table).includes(name)) continue;
        if (seen[axis] !== undefined && seen[axis] !== name) {
          ignore(what + ': ' + JSON.stringify(seen[axis]) + ' and ' + JSON.stringify(name) + ' are both ' + axis +
                 '; give at most one per direction');
        }
        seen[axis] = name;
      }
    }
    return Object.freeze(list);
  }

  // ---- view.layout 的各项 ----

  const sides = ['top', 'bottom', 'start', 'end'];
  const zeroMargin = Object.freeze({ top: 0, bottom: 0, start: 0, end: 0 });

  // 外边距：一个数（四边一样）或者 { top, bottom, start, end }（没给的是 0），dp，可以是负数
  function toMargin(v, what) {
    if (v == null) return zeroMargin;
    if (isObject(v)) {
      const m = {};
      for (const side of sides) m[side] = v[side] === undefined ? 0 : toNumber(v[side], what + '.' + side);
      return Object.freeze(m);
    }
    const n = toNumber(v, what);
    return Object.freeze({ top: n, bottom: n, start: n, end: n });
  }

  // 约束的目标：'parent'、一个视图（对齐它的同一条边）、{ to, edge }（对齐它的另一条边）
  const edgeChoices = {
    start: ['start', 'end'],
    end: ['start', 'end'],
    top: ['top', 'bottom'],
    bottom: ['top', 'bottom'],
    baseline: ['baseline', 'top', 'bottom'],
  };
  const edges = Object.keys(edgeChoices);

  function targetMessage(what, v) {
    return what + ' has no value ' + JSON.stringify(v) + '; expected one of: parent, a View, { to, edge }';
  }
  function toTargetView(v, what) {
    if (v === 'parent' || isView(v)) return v;
    if (typeof v === 'string') ignore(targetMessage(what, v));
    throw new TypeError(what + ': expected "parent" or a View, got ' + describeValue(v));
  }
  function toTarget(v, key) {
    const what = 'constraints.' + key;
    if (v == null) return null;
    if (v === 'parent' || isView(v)) return v;
    if (typeof v === 'string') ignore(targetMessage(what, v));
    if (!isObject(v)) throw new TypeError(what + ': expected "parent", a View or { to, edge }, got ' + describeValue(v));
    const to = toTargetView(v.to, what + '.to');
    const edge = v.edge === undefined ? key : String(v.edge);
    if (!edgeChoices[key].includes(edge)) {
      ignore(what + '.edge has no value ' + JSON.stringify(edge) + '; expected one of: ' + edgeChoices[key].join(' / '));
    }
    return Object.freeze({ to, edge });
  }

  const ratioPattern = /^\s*(?:[WHwh]\s*,\s*)?(?:\d+(?:\.\d*)?|\.\d+)(?:\s*:\s*(?:\d+(?:\.\d*)?|\.\d+))?\s*$/;
  function toRatio(v, what) {
    if (v == null) return null;
    const s = String(v);
    if (!ratioPattern.test(s)) {
      ignore(what + ': ' + JSON.stringify(s) + ' is not a ratio such as "2:1", "H,16:9" or "0.5"');
    }
    return s;
  }

  function toCircle(v, what) {
    if (v == null) return null;
    if (!isObject(v)) throw new TypeError(what + ': expected { to, radius, angle }, got ' + describeValue(v));
    return Object.freeze({
      to: toTargetView(v.to, what + '.to'),
      radius: v.radius === undefined ? 0 : toNonNegative(v.radius, what + '.radius'),
      angle: v.angle === undefined ? 0 : toNumber(v.angle, what + '.angle'),
    });
  }

  const goneSides = ['top', 'bottom', 'start', 'end', 'baseline'];
  const noGoneMargin = Object.freeze({ top: null, bottom: null, start: null, end: null, baseline: null });
  function toGoneMargin(v, what) {
    if (v == null) return noGoneMargin;
    if (!isObject(v)) throw new TypeError(what + ': expected an object, got ' + describeValue(v));
    const m = {};
    for (const side of goneSides) m[side] = v[side] == null ? null : toNumber(v[side], what + '.' + side);
    return Object.freeze(m);
  }

  const defaultConstraints = Object.freeze({
    start: null,
    end: null,
    top: null,
    bottom: null,
    baseline: null,
    horizontalBias: 0.5,
    verticalBias: 0.5,
    horizontalChainStyle: 'spread',
    verticalChainStyle: 'spread',
    horizontalWeight: null,
    verticalWeight: null,
    dimensionRatio: null,
    constrainedWidth: false,
    constrainedHeight: false,
    minWidth: 0,
    minHeight: 0,
    maxWidth: null,
    maxHeight: null,
    widthPercent: null,
    heightPercent: null,
    circle: null,
    goneMargin: noGoneMargin,
    baselineMargin: 0,
    wrapBehaviorInParent: 'included',
  });

  // 整个约束：照 Web IDL 的字典，没给的（undefined）是默认值，不认识的键不管
  function toConstraints(v) {
    if (v == null) return defaultConstraints;
    if (!isObject(v)) throw new TypeError('constraints: expected an object, got ' + describeValue(v));
    const d = defaultConstraints;
    const field = (name, convert) => (v[name] === undefined ? d[name] : convert(v[name], 'constraints.' + name));
    const nullable = (convert) => (x, what) => (x === null ? null : convert(x, what));
    const c = {};
    for (const key of edges) c[key] = toTarget(v[key], key);
    c.horizontalBias = field('horizontalBias', toFraction);
    c.verticalBias = field('verticalBias', toFraction);
    c.horizontalChainStyle = field('horizontalChainStyle', (x, what) => named('chainStyle', x, what));
    c.verticalChainStyle = field('verticalChainStyle', (x, what) => named('chainStyle', x, what));
    c.horizontalWeight = field('horizontalWeight', nullable(toNonNegative));
    c.verticalWeight = field('verticalWeight', nullable(toNonNegative));
    c.dimensionRatio = field('dimensionRatio', toRatio);
    c.constrainedWidth = field('constrainedWidth', Boolean);
    c.constrainedHeight = field('constrainedHeight', Boolean);
    c.minWidth = field('minWidth', toNonNegative);
    c.minHeight = field('minHeight', toNonNegative);
    c.maxWidth = field('maxWidth', nullable(toPositive));
    c.maxHeight = field('maxHeight', nullable(toPositive));
    c.widthPercent = field('widthPercent', nullable(toNonNegative));
    c.heightPercent = field('heightPercent', nullable(toNonNegative));
    c.circle = field('circle', toCircle);
    c.goneMargin = field('goneMargin', toGoneMargin);
    c.baselineMargin = field('baselineMargin', toNumber);
    c.wrapBehaviorInParent = field('wrapBehaviorInParent', (x, what) => named('wrapBehavior', x, what));
    return Object.freeze(c);
  }

  const defaultLayout = Object.freeze({
    width: null,
    height: null,
    margin: zeroMargin,
    weight: 0,
    gravity: null,
    constraints: defaultConstraints,
  });

  const fieldConverters = {
    width: (v) => toSize(v, 'width'),
    height: (v) => toSize(v, 'height'),
    margin: (v) => toMargin(v, 'margin'),
    weight: (v) => toNonNegative(v, 'weight'),
    gravity: (v) => (v == null ? null : toGravity(v, 'gravity')),
    constraints: (v) => toConstraints(v),
  };
  const fields = Object.keys(fieldConverters);

  // 整个 layout：照 Web IDL 的字典，没给的是默认值
  function toLayout(v) {
    if (v == null) return defaultLayout;
    if (!isObject(v)) throw new TypeError('layout: expected an object, got ' + describeValue(v));
    const record = {};
    for (const name of fields) record[name] = v[name] === undefined ? defaultLayout[name] : fieldConverters[name](v[name]);
    return Object.freeze(record);
  }

  // ---- 视图的 id：ConstraintLayout 按 id 找约束的目标 ----
  //
  // 放进 ConstraintLayout 的视图、被约束指着的视图，第一次用到时发一个 id（View.generateViewId()），
  // 同一个视图一直用这一个。目标不在这个 ConstraintLayout 里时它找不到，这条约束不生效。
  //
  // id 要在放进原生的父视图之前设好：ConstraintLayout 在子视图加进来那一刻（onViewAdded）按当时的 id
  // 记一张表，基线约束按这张表找目标，之后再改 id 它不知道（实测：之后才设，基线约束不生效）。所以 id
  // 登记成普通的状态（不是 placement），挂上时和别的状态一起、在原生排子视图之前设；挂着时发的当场设
  const kViewId = Symbol('viewId');
  // 自己接住：状态名是 Symbol，10-view.js 的警告拼不出它的名字
  function applyViewId(standIn, id) {
    try {
      nativeSet(standIn, '@id', id);
    } catch (err) {
      console.warn('[Nacre] could not set the id of a view (' + String(err) + '), skipped');
    }
  }
  defineViewState(View, kViewId, {
    order: 0,
    initial: null,  // 原生的默认是 NO_ID，没发过就不设
    convert: (id) => id,
    apply: applyViewId,
  });
  const viewIdState = Object.getOwnPropertyDescriptor(View.prototype, kViewId);
  function idOf(view) {
    let id = viewIdState.get.call(view);
    if (id === null) {
      id = nativeClassCallValue('@layout', 'viewId', []);
      viewIdState.set.call(view, id);
    }
    return id;
  }

  // ---- 设到原生 ----
  //
  // 只有 JS 里的父视图读它：页面的 contentView 没有父视图，不设（系统让它铺满页面）。长度换成
  // 像素，约束的目标换成 id

  const anchorFields = {
    start: { start: 'startToStart', end: 'startToEnd' },
    end: { start: 'endToStart', end: 'endToEnd' },
    top: { top: 'topToTop', bottom: 'topToBottom' },
    bottom: { top: 'bottomToTop', bottom: 'bottomToBottom' },
    baseline: { baseline: 'baselineToBaseline', top: 'baselineToTop', bottom: 'baselineToBottom' },
  };

  // 目标换成原生认的：父视图（写 'parent' 或者就是父视图本身）是 'parent'；指向自己当成没写
  function targetOut(to, view, parent) {
    if (to === 'parent' || to === parent) return 'parent';
    if (to === view) return null;
    return idOf(to);
  }

  function constraintsOut(page, c, view, parent) {
    const anchors = {};
    for (const key of edges) {
      const t = c[key];
      if (t === null) continue;
      const plain = t === 'parent' || isView(t);
      const id = targetOut(plain ? t : t.to, view, parent);
      if (id !== null) anchors[anchorFields[key][plain ? key : t.edge]] = id;
    }
    const lengthOrNull = (n) => (n === null ? null : px(page, n));
    let circle = null;
    if (c.circle !== null) {
      const id = targetOut(c.circle.to, view, parent);
      if (id !== null) circle = [id, px(page, c.circle.radius), c.circle.angle];
    }
    return {
      anchors,
      horizontalBias: c.horizontalBias,
      verticalBias: c.verticalBias,
      horizontalChainStyle: c.horizontalChainStyle,
      verticalChainStyle: c.verticalChainStyle,
      horizontalWeight: c.horizontalWeight,
      verticalWeight: c.verticalWeight,
      dimensionRatio: c.dimensionRatio,
      constrainedWidth: c.constrainedWidth,
      constrainedHeight: c.constrainedHeight,
      minWidth: px(page, c.minWidth),
      minHeight: px(page, c.minHeight),
      maxWidth: lengthOrNull(c.maxWidth),
      maxHeight: lengthOrNull(c.maxHeight),
      widthPercent: c.widthPercent,
      heightPercent: c.heightPercent,
      circle,
      goneMargin: goneSides.map((side) => lengthOrNull(c.goneMargin[side])),
      baselineMargin: px(page, c.baselineMargin),
      wrapBehaviorInParent: c.wrapBehaviorInParent,
    };
  }

  function applyLayout(standIn, record, page, view) {
    const parent = view.parent;
    if (parent === null) return;
    const inConstraint = parent instanceof ConstraintLayout;
    // matchConstraint 只有 ConstraintLayout 认，别的父视图下当成 null（父视图的默认值）
    const sizeOut = (v) => (typeof v === 'number' ? px(page, v) : v === 'matchConstraint' && !inConstraint ? null : v);
    const m = record.margin;
    const spec = {
      width: sizeOut(record.width),
      height: sizeOut(record.height),
      margin: [m.start, m.top, m.end, m.bottom].map((n) => px(page, n)),
      weight: record.weight,
      gravity: record.gravity,
    };
    if (inConstraint) spec.constraints = constraintsOut(page, record.constraints, view, parent);
    nativeCall(standIn, '@layout', [spec]);
  }

  // 登记成 placement 状态：放进父视图之后由 10-view.js 设到原生，挂着时写了当场设
  defineViewState(View, 'layout', {
    order: 0,
    initial: defaultLayout,
    units: 'dp',
    placement: true,
    convert: (record) => record,  // 下面的 setter 已经转好了
    apply: applyLayout,
  });
  const layoutState = Object.getOwnPropertyDescriptor(View.prototype, 'layout');
  const recordOf = (view) => layoutState.get.call(view);

  // 写一次：转换（写错名字是 IGNORE），再交给登记的状态（挂着时当场设到原生）
  function writeLayout(view, makeRecord) {
    let record;
    try {
      record = makeRecord();
    } catch (err) {
      if (err === kIgnored) return;
      throw err;
    }
    layoutState.set.call(view, record);
  }

  // view.layout 读出来的活对象：每个视图一个，读写的都是那个视图现在的 layout，用法像 el.style
  const kInternal = Symbol('internal');
  class ViewLayout {
    #view;
    constructor(token, view) {
      if (token !== kInternal) throw new TypeError('Illegal constructor');
      this.#view = view;
    }
    static view(layout) { return layout.#view; }
  }
  for (const name of fields) {
    Object.defineProperty(ViewLayout.prototype, name, {
      get() { return recordOf(ViewLayout.view(this))[name]; },
      set(v) {
        const view = ViewLayout.view(this);
        writeLayout(view, () => Object.freeze({ ...recordOf(view), [name]: fieldConverters[name](v) }));
      },
      enumerable: true,
      configurable: true,
    });
  }

  const liveLayouts = new WeakMap();
  Object.defineProperty(View.prototype, 'layout', {
    get() {
      recordOf(this);  // 不是视图抛 TypeError
      let live = liveLayouts.get(this);
      if (live === undefined) {
        live = new ViewLayout(kInternal, this);
        liveLayouts.set(this, live);
      }
      return live;
    },
    // 整个写：没给的回到默认值
    set(v) {
      recordOf(this);
      writeLayout(this, () => toLayout(v));
    },
    enumerable: false,
    configurable: true,
  });

  // ---- 页面值：排版的结果，dp。自由时、还没排过版是 null ----

  function pageValue(view, name) {
    const standIn = attachedNative(view);
    if (standIn === null) return null;
    const raw = nativeGet(standIn, name);
    if (raw === null) return null;
    return { page: pageOf(view.activity), raw };
  }

  // 相对父视图的位置和大小
  Object.defineProperty(View.prototype, 'frame', {
    get() {
      const got = pageValue(this, '@frame');
      if (got === null) return null;
      const [x, y, width, height] = got.raw.map((n) => dp(got.page, n));
      return Object.freeze({ x, y, width, height });
    },
    enumerable: false,
    configurable: true,
  });
  for (const [name, nativeName] of [['locationInWindow', '@locationInWindow'], ['locationOnScreen', '@locationOnScreen']]) {
    Object.defineProperty(View.prototype, name, {
      get() {
        const got = pageValue(this, nativeName);
        if (got === null) return null;
        return Object.freeze({ x: dp(got.page, got.raw[0]), y: dp(got.page, got.raw[1]) });
      },
      enumerable: false,
      configurable: true,
    });
  }

  // 按给的条件量一次：width / height 是正好这么大，maxWidth / maxHeight 是最多这么大，都不给是不限。
  // 交回量出来的 { width, height }；自由时是 null。参数自由时也当场查
  function measureAxis(o, exact, max) {
    const e = o[exact] == null ? null : toNonNegative(o[exact], 'measure: ' + exact);
    const m = o[max] == null ? null : toNonNegative(o[max], 'measure: ' + max);
    if (e !== null && m !== null) {
      throw new TypeError("Failed to execute 'measure' on 'View': give " + exact + ' or ' + max + ', not both');
    }
    return e !== null ? ['exactly', e] : m !== null ? ['atMost', m] : ['unspecified', 0];
  }
  define(View.prototype, 'measure', function measure(options) {
    if (options != null && !isObject(options)) {
      throw new TypeError("Failed to execute 'measure' on 'View': parameter 1 is not of type 'object'.");
    }
    const o = options == null ? {} : options;
    const width = measureAxis(o, 'width', 'maxWidth');
    const height = measureAxis(o, 'height', 'maxHeight');
    const standIn = attachedNative(this);
    if (standIn === null) return null;
    const page = pageOf(this.activity);
    const [w, h] = nativeCall(standIn, '@measure', [width[0], px(page, width[1]), height[0], px(page, height[1])]);
    return Object.freeze({ width: dp(page, w), height: dp(page, h) });
  });

  // ---- layoutchange：位置或大小变了，下一轮派发，不带数据（位置读 frame）----
  //
  // 接在原来的订阅后面：layoutchange 告诉原生，别的交给原来那一个
  const subscribeBefore = View.prototype[kSubscribe];
  View.prototype[kSubscribe] = function (type, on) {
    if (type === 'layoutchange') subscribeNative(this, type, on);
    else subscribeBefore.call(this, type, on);
  };

  // ---- 各个类自己的状态（默认值照 Android 不带系统样式时的值）----

  const boolState = (Cls, name, initial, order) => defineViewState(Cls, name, {
    order,
    initial,
    convert: (v) => Boolean(v),
    apply: (standIn, value) => nativeSet(standIn, name, value),
  });
  const lengthState = (Cls, name, order, nullable) => defineViewState(Cls, name, {
    order,
    initial: nullable ? null : 0,
    units: 'dp',
    convert: (v, what) => (nullable && v == null ? null : (nullable ? toPositive : toNonNegative)(v, what)),
    apply: (standIn, value, page) => nativeSet(standIn, name, value === null ? null : px(page, value)),
  });

  // View：最小尺寸（wrapContent 时至少这么大）
  lengthState(View, 'minimumWidth', 200, false);
  lengthState(View, 'minimumHeight', 200, false);

  // ViewGroup：子视图超出自己的边界、伸进内边距时裁不裁掉
  boolState(ViewGroup, 'clipChildren', true, 150);
  boolState(ViewGroup, 'clipToPadding', true, 150);

  // LinearLayout
  defineViewState(LinearLayout, 'gravity', {
    order: 110,
    initial: Object.freeze(['start', 'top']),
    convert: guarded((v, what) => toGravity(v, what)),
    apply: (standIn, value) => nativeSet(standIn, 'gravity', value),
  });
  defineViewState(LinearLayout, 'weightSum', {
    order: 110,
    initial: null,
    convert: (v, what) => (v == null ? null : toPositive(v, what)),
    apply: (standIn, value) => nativeSet(standIn, 'weightSum', value),
  });
  boolState(LinearLayout, 'isBaselineAligned', true, 110);
  boolState(LinearLayout, 'isMeasureWithLargestChildEnabled', false, 110);
  defineViewState(LinearLayout, 'showDividers', {
    order: 110,
    initial: Object.freeze([]),
    convert: guarded((v, what) => Object.freeze(toNameList(v, what).map((name) => named('showDividers', name, what)))),
    apply: (standIn, value) => nativeSet(standIn, 'showDividers', value),
  });
  lengthState(LinearLayout, 'dividerPadding', 110, false);

  // 方向改了：宽高没写的子视图换成新方向的默认值（竖向是 matchParent × wrapContent，横向是
  // wrapContent × wrapContent）。Java 只在 addView 时给一次默认值，这里照「null 是父视图的默认值」重设
  const orientationState = Object.getOwnPropertyDescriptor(LinearLayout.prototype, 'orientation');
  Object.defineProperty(LinearLayout.prototype, 'orientation', {
    get: orientationState.get,
    set(v) {
      const before = orientationState.get.call(this);
      orientationState.set.call(this, v);
      if (orientationState.get.call(this) === before || attachedNative(this) === null) return;
      const page = pageOf(this.activity);
      for (const child of this.children) {
        const record = recordOf(child);
        if (record.width === null || record.height === null) applyLayout(child[kView].standIn, record, page, child);
      }
    },
    enumerable: false,
    configurable: true,
  });

  // ---- FrameLayout ----

  class FrameLayout extends ViewGroup {}
  defineNativeClass('FrameLayout', FrameLayout);
  // 子视图不可见（gone）时也量它
  boolState(FrameLayout, 'measureAllChildren', false, 110);

  // ---- ConstraintLayout（AndroidX）----

  class ConstraintLayout extends ViewGroup {
    // 加进来之前先发 id（见上面「视图的 id」）。已经有替身的当场设到原生：挂着的视图挪进来时，基础的
    // addView 不再设一遍状态；id 也可能是在整棵树挂上的半途发的（那时还不算挂着，只记在了 JS 里）
    addView(child) {
      if (isView(child)) {
        const id = idOf(child);
        const standIn = child[kView].standIn;
        if (standIn !== null) applyViewId(standIn, id);
      }
      return super.addView(...arguments);
    }
  }
  defineNativeClass('ConstraintLayout', ConstraintLayout);
  // 自己 wrapContent 时的最小、最大尺寸；最大是 null 时不限
  lengthState(ConstraintLayout, 'minWidth', 110, false);
  lengthState(ConstraintLayout, 'minHeight', 110, false);
  lengthState(ConstraintLayout, 'maxWidth', 110, true);
  lengthState(ConstraintLayout, 'maxHeight', 110, true);

  Object.assign(ctx, { toGravity: guarded((v, what) => toGravity(v, what)) });
})
