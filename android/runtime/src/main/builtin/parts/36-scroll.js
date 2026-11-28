// 滚动：View 上的滚动位置、滚动条、越界效果、边缘渐隐、嵌套滚动和 scroll 事件（任何视图都能滚，
// 普通视图不限制范围）；ScrollView 和 HorizontalScrollView（只有一份内容，滚动限制在内容的范围里）。
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
//
// 照「接类的总则」（2026-11-26，docs/project.md 第 4 节）：
//
// - 成员都是登记的状态（ctx.defineViewState），读回写进去的值；默认值照 Android 不带主题样式时的值。
// - scrollX / scrollY 是系统也会改的状态（手指一划就变）：挂着时读原生，拿下来时把原生的值读回 JS（read）。
//   它们还要排完版才能设（afterLayout）：排版之前 ScrollView 会把它夹成 0（实测）。写它们取代了 scrollTo / scrollBy。
// - canScroll(方向) 是页面值，自由时是 null；fling、fullScroll、pageScroll、arrowScroll 是动作，自由时抛
//   InvalidStateError；smoothScrollTo 自由时就是写滚动位置；scrollToDescendant 自由时先记下，挂上、排完版再滚。
// - 滚动视图只能有一份内容，所以不是 ViewGroup、没有 addView，内容是可读写的 contentView（和
//   activity.contentView 一样）。在 JS 的树里内容是它的子视图（content.parent 是它）。
// - 长度是 dp，时长是毫秒，速度是 dp/秒。scroll 事件不带数据（和 Web、iOS 一样），位置读 scrollX / scrollY。
// - 不接 AndroidX 的 NestedScrollView（project.md 第 4 节只允许两个 AndroidX 的类）。
//
// 原生那一侧是 android/runtime 的 ScrollDomain.kt。
(function (ctx) {
  'use strict';

  const {
    Drawable,
    IGNORE,
    adoptChild,
    attachedNative,
    colorState,
    define,
    defineModelSlot,
    defineNativeClass,
    defineViewState,
    describeValue,
    dropChild,
    enumArgument,
    enumNames,
    enumProperty,
    kContainer,
    kSubscribe,
    kView,
    nativeCall,
    nativeGet,
    nativeSet,
    pageOf,
    parseColor,
    px,
    requireAttached,
    subscribeNative,
  } = ctx;
  const { View } = globalThis;

  // ---- 参数转换（照 Web IDL）----

  function requireArgs(args, count, what) {
    if (args.length < count) {
      throw new TypeError("Failed to execute '" + what + "': " + count + ' argument' +
                          (count > 1 ? 's' : '') + ' required, but only ' + args.length + ' present.');
    }
  }
  function toNumber(v, what) {
    const n = Number(v);
    if (!Number.isFinite(n)) throw new TypeError(what + ': expected a finite number, got ' + describeValue(v));
    return n;
  }
  function nonNegative(v, what) {
    const n = toNumber(v, what);
    if (n < 0) throw new RangeError(what + ': expected a number not less than 0, got ' + n);
    return n;
  }
  const isView = (v) => v instanceof View && v[kView] !== undefined;

  // ---- View 上的滚动位置 ----

  // 写滚动位置时，ScrollView 自由时先记下的 scrollToDescendant 作废（后写的算）
  const kPendingDescendant = Symbol('pendingDescendant');

  for (const name of ['scrollX', 'scrollY']) {
    defineViewState(View, name, {
      order: 900,
      initial: 0,
      units: 'dp',
      afterLayout: true,
      convert: toNumber,
      // Java 收整数：四舍五入，不是 0 的至少 1 像素。ScrollView 夹在内容的范围里
      apply: (standIn, value, page) => nativeSet(standIn, name, px(page, value)),
      // 原生的像素和 JS 存的值对得上就给 JS 的值（不然 0.3 dp 会读成 0.38），对不上就换算原生的
      read: (standIn, page, view) => {
        const raw = nativeGet(standIn, name);
        const values = view[kView].values;
        const js = values.has(name) ? values.get(name) : 0;
        return px(page, js) === raw ? js : raw / page.density;
      },
    });
    const state = Object.getOwnPropertyDescriptor(View.prototype, name);
    Object.defineProperty(View.prototype, name, {
      get: state.get,
      set(v) {
        state.set.call(this, v);
        const st = this[kView];
        if (st !== undefined && st.values.has(kPendingDescendant)) st.values.delete(kPendingDescendant);
      },
      enumerable: false,
      configurable: true,
    });
  }

  // 能不能往这个方向滚：页面值，自由时是 null。方向自由时也当场查
  define(View.prototype, 'canScroll', function canScroll(direction) {
    requireArgs(arguments, 1, 'canScroll');
    const name = enumArgument('scrollDirection', direction, 'canScroll');
    const standIn = attachedNative(this);
    return standIn === null ? null : nativeCall(standIn, 'canScroll', [name]);
  });

  // ---- View 上的别的状态 ----

  const enumState = (name, table, initial) => defineViewState(View, name, {
    order: 800,
    initial,
    convert: (v, what) => enumProperty(table, v, what),
    apply: (standIn, value) => nativeSet(standIn, name, value),
  });
  const boolState = (Cls, name, initial, order = 800) => defineViewState(Cls, name, {
    order,
    initial,
    convert: (v) => Boolean(v),
    apply: (standIn, value) => nativeSet(standIn, name, value),
  });
  // 毫秒（Java 收整数）
  const msState = (name, initial) => defineViewState(View, name, {
    order: 800,
    initial,
    convert: nonNegative,
    apply: (standIn, value) => nativeSet(standIn, name, Math.round(value)),
  });
  // dp（Java 收整数像素）
  const lengthState = (name, initial) => defineViewState(View, name, {
    order: 800,
    initial,
    units: 'dp',
    convert: nonNegative,
    apply: (standIn, value, page) => nativeSet(standIn, name, px(page, value)),
  });

  // 滚到头之后还能不能往外拉（Android 12 起是拉伸，11 是光晕）
  enumState('overScrollMode', 'overScrollMode', 'ifContentScrolls');
  // 滚动条。不带主题样式时都关着，也没有滑块：要看得见，除了打开还要给滑块一个 Drawable
  boolState(View, 'isVerticalScrollBarEnabled', false);
  boolState(View, 'isHorizontalScrollBarEnabled', false);
  // 不滚的时候滚动条淡出；淡出用多久、停下来多久之后开始淡出
  boolState(View, 'isScrollbarFadingEnabled', false);
  msState('scrollBarFadeDuration', 250);
  msState('scrollBarDefaultDelayBeforeFade', 300);
  // 滚动条的粗细。系统的默认值是 4 dp（换成像素四舍五入，和 Java 一样）
  lengthState('scrollBarSize', 4);
  enumState('scrollBarStyle', 'scrollBarStyle', 'insideOverlay');
  enumState('verticalScrollbarPosition', 'verticalScrollbarPosition', 'default');
  // 滑块和轨道：Drawable 或 null（没有）
  for (const [name, setter] of [
    ['verticalScrollbarThumbDrawable', 'setVerticalScrollbarThumbDrawable'],
    ['verticalScrollbarTrackDrawable', 'setVerticalScrollbarTrackDrawable'],
    ['horizontalScrollbarThumbDrawable', 'setHorizontalScrollbarThumbDrawable'],
    ['horizontalScrollbarTrackDrawable', 'setHorizontalScrollbarTrackDrawable'],
  ]) {
    defineModelSlot(View, name, {
      order: 810,
      Cls: Drawable,
      set: (standIn, d) => nativeCall(standIn, setter, [d]),
    });
  }
  // 还能往哪边滚时，在那一边画一条细线。位掩码：字符串数组，照写进去的样子读回；有一个名字不认识，
  // 整次不生效
  defineViewState(View, 'scrollIndicators', {
    order: 800,
    initial: Object.freeze([]),
    convert: (v, what) => {
      if (v === null || typeof v !== 'object' || typeof v[Symbol.iterator] !== 'function') {
        throw new TypeError(what + ': expected an array, got ' + describeValue(v));
      }
      const names = Array.from(v, String);
      for (const name of names) {
        if (enumProperty('scrollIndicator', name, what) === IGNORE) return IGNORE;
      }
      return Object.freeze(names);
    },
    apply: (standIn, value) => nativeSet(standIn, 'scrollIndicators', value),
  });
  // 边缘渐隐：内容滚到边上时淡出。长度系统的默认值是 12 dp
  boolState(View, 'isVerticalFadingEdgeEnabled', false);
  boolState(View, 'isHorizontalFadingEdgeEnabled', false);
  lengthState('fadingEdgeLength', 12);
  boolState(View, 'isNestedScrollingEnabled', false);

  // scroll：原生真的会发。接在 View 原来的订阅后面
  const viewSubscribe = View.prototype[kSubscribe];
  Object.defineProperty(View.prototype, kSubscribe, {
    value(type, on) {
      if (type === 'scroll') subscribeNative(this, type, on);
      else viewSubscribe.call(this, type, on);
    },
    writable: true,
    enumerable: false,
    configurable: true,
  });

  // ---- ScrollView、HorizontalScrollView ----

  // 只收这几个方向（竖的 up / down，横的 left / right）。写错抛 TypeError，列出能写的
  function direction(v, allowed, what) {
    const name = String(v);
    if (allowed.includes(name)) return name;
    throw new TypeError(what + ' has no value ' + JSON.stringify(name) + '; expected one of: ' + allowed.join(' / '));
  }

  // axis：'y' 是竖着滚（ScrollView），'x' 是横着滚
  function defineScroller(Cls, axis, edges) {
    const nativeName = Cls.name;
    const position = axis === 'y' ? 'scrollY' : 'scrollX';
    const all = enumNames('scrollDirection');
    const allowed = axis === 'y' ? all.filter((d) => d === 'up' || d === 'down')
      : all.filter((d) => d === 'left' || d === 'right');
    const positionState = Object.getOwnPropertyDescriptor(View.prototype, position);

    Object.defineProperty(Cls.prototype, kContainer, { value: true });

    // 内容：一个视图或 null。写一个视图就是放进来（原来在别处就移过来），原来的内容拿下来
    Object.defineProperty(Cls.prototype, 'contentView', {
      get() {
        const st = this == null ? undefined : this[kView];
        if (st === undefined) throw new TypeError('contentView: Illegal invocation');
        return st.children.length > 0 ? st.children[0] : null;
      },
      set(v) {
        const st = this == null ? undefined : this[kView];
        if (st === undefined) throw new TypeError('contentView: Illegal invocation');
        const next = v == null ? null : v;
        if (next !== null && !isView(next)) {
          throw new TypeError("Failed to set the 'contentView' property on '" + nativeName +
                              "': the value is not of type 'View'.");
        }
        for (let p = this; next !== null && p !== null; p = p[kView].parent) {
          if (p === next) {
            throw new ctx.DOMException("Failed to set the 'contentView' property on '" + nativeName +
                                       "': the new content is this view or one of its ancestors", 'HierarchyRequestError');
          }
        }
        const old = st.children.length > 0 ? st.children[0] : null;
        if (old === next) return;
        if (old !== null) dropChild(this, old);
        if (next !== null) adoptChild(this, next, 0);
      },
      enumerable: false,
      configurable: true,
    });

    const methods = {
      // 带动画地滚到这个位置（dp），就是带动画地写滚动位置：JS 里记下目标，原生滚到了之后读回的就是它
      // （900 dp 是 2362.5 像素，原生只能停在 2363，不记下的话读出来是 900.19）。自由时（或者拿下来时）
      // 没有动画，就是写滚动位置；挂着、还在等排版时也是（等排完版再设，不然被夹成 0）
      smoothScrollTo(to) {
        requireArgs(arguments, 1, 'smoothScrollTo');
        const value = toNumber(to, 'smoothScrollTo');
        const standIn = attachedNative(this);
        const st = this[kView];
        if (standIn === null || st.layoutPending) {
          positionState.set.call(this, value);
          return;
        }
        st.values.set(position, value);
        nativeCall(standIn, 'smoothScrollTo', [px(pageOf(this.activity), value)]);
      },
      // 按初速度甩出去，dp/秒（正数往下、往右）
      fling(velocity) {
        requireArgs(arguments, 1, 'fling');
        const value = toNumber(velocity, 'fling');
        const standIn = requireAttached(this, 'fling');
        nativeCall(standIn, 'fling', [px(pageOf(this.activity), value)]);
      },
    };
    // 滚到头、翻一页、按方向键那样滚一下。关了 isSmoothScrollingEnabled 当场到位，不然带动画。
    // 返回滚没滚（Java 的「这个按键处理了没有」）
    for (const name of ['fullScroll', 'pageScroll', 'arrowScroll']) {
      methods[name] = {
        [name](dir) {
          requireArgs(arguments, 1, name);
          const d = direction(dir, allowed, name);
          return nativeCall(requireAttached(this, name), name, [d]);
        },
      }[name];
    }
    for (const name of Object.keys(methods)) define(Cls.prototype, name, methods[name]);

    boolState(Cls, 'isFillViewport', false, 820);
    boolState(Cls, 'isSmoothScrollingEnabled', true, 820);
    // ViewGroup 上的那两个裁剪（滚动视图在 Java 里是 ViewGroup；JS 里不是，另外登记）
    boolState(Cls, 'clipChildren', true, 150);
    boolState(Cls, 'clipToPadding', true, 150);
    // 越界效果的颜色（Android 12 起是拉伸，颜色只用在 11 的光晕上）。默认值是系统主题给的
    for (const edge of edges) {
      const name = edge + 'EdgeEffectColor';
      defineViewState(Cls, name, {
        order: 820,
        initial: '#f5f5f533',
        convert: colorState,
        apply: (standIn, value) => nativeSet(standIn, name, parseColor(value)),
      });
    }
  }

  // 不收参数，建出来是自由的（10-view.js 的 View 记下挂上时建 ScrollView）
  class ScrollView extends View {}
  defineNativeClass('ScrollView', ScrollView);
  defineScroller(ScrollView, 'y', ['top', 'bottom']);

  class HorizontalScrollView extends View {}
  defineNativeClass('HorizontalScrollView', HorizontalScrollView);
  defineScroller(HorizontalScrollView, 'x', ['left', 'right']);

  // ---- scrollToDescendant（只有 ScrollView 有，Java 里也是）----
  //
  // 滚到让这个后代视图露出来。挂着时当场滚（Java 自己会等这次排完版）；自由时先记下，挂上、排完版再滚。
  // 之后又写了滚动位置的，记下的作废
  const isDescendant = (view, ancestor) => {
    for (let p = view[kView].parent; p !== null; p = p[kView].parent) if (p === ancestor) return true;
    return false;
  };
  defineViewState(ScrollView, kPendingDescendant, {
    order: 950,
    initial: null,
    afterLayout: true,
    convert: (v) => v,
    apply: (standIn, value, page, view) => {
      view[kView].values.delete(kPendingDescendant);
      if (value !== null && isDescendant(value, view)) nativeCall(standIn, 'scrollToDescendant', [value]);
    },
  });
  const pendingState = Object.getOwnPropertyDescriptor(ScrollView.prototype, kPendingDescendant);
  define(ScrollView.prototype, 'scrollToDescendant', function scrollToDescendant(child) {
    requireArgs(arguments, 1, 'scrollToDescendant');
    if (!isView(child)) {
      throw new TypeError("Failed to execute 'scrollToDescendant' on 'ScrollView': parameter 1 is not of type 'View'.");
    }
    if (!isDescendant(child, this)) {
      throw new ctx.DOMException("Failed to execute 'scrollToDescendant' on 'ScrollView': " +
                                 'the view is not a descendant of this view', 'NotFoundError');
    }
    const standIn = attachedNative(this);
    if (standIn !== null) nativeCall(standIn, 'scrollToDescendant', [child]);
    else pendingState.set.call(this, child);
  });
})
