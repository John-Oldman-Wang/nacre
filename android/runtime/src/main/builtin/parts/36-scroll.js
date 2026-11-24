// 滚动：View 上的滚动位置、滚动条、越界效果、边缘渐隐、嵌套滚动和 scroll 事件（任何视图都能
// 滚，普通视图不限制范围）；ScrollView 和 HorizontalScrollView（一次只放一个子视图，滚动限制在
// 内容的范围里）。
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
//
// 单位是像素（时长是毫秒），照 Android 的 API 原样。枚举是字符串：属性写错打警告、值不变
// （原生那边判断），方法参数写错抛 TypeError。scroll 事件不带数据，和 Web、iOS 一样：位置读
// scrollX / scrollY。不接 AndroidX 的 NestedScrollView（project.md 第 4 节只允许两个 AndroidX 的类）。
//
// 原生那一侧是 android/runtime 的 ScrollDomain.kt。
(function (ctx) {
  'use strict';

  const {
    colorArgument,
    colorProperty,
    colorText,
    constructNative,
    describeValue,
    kSubscribe,
    nativeCall,
    nativeCallObject,
    nativeGet,
    nativeSet,
    own,
    requireInstance,
    subscribeNative,
    toInteger,
    toText,
  } = ctx;
  const { View, ViewGroup, Drawable } = globalThis;
  const { defineNativeClass } = ctx;

  // ---- 助手 ----

  function requireArgs(args, count, what) {
    if (args.length < count) {
      throw new TypeError("Failed to execute '" + what + "': " + count + ' argument' +
                          (count > 1 ? 's' : '') + ' required, but only ' + args.length + ' present.');
    }
  }
  // 往已有的类上加成员，照 class 语法的样子，不可枚举
  function addAccessors(proto, accessors) {
    for (const [name, [get, set]] of Object.entries(accessors)) {
      Object.defineProperty(proto, name, { get, set, enumerable: false, configurable: true });
    }
  }
  // 名字可以是 Symbol（kSubscribe），所以用 Reflect.ownKeys，不用 Object.entries
  function addMethods(proto, methods) {
    for (const name of Reflect.ownKeys(methods)) {
      Object.defineProperty(proto, name, {
        value: methods[name], writable: true, enumerable: false, configurable: true,
      });
    }
  }
  const integerProp = (name) => [
    function () { return nativeGet(this, name); },
    function (v) { nativeSet(this, name, toInteger(v, name)); },
  ];
  const booleanProp = (name) => [
    function () { return nativeGet(this, name); },
    function (v) { nativeSet(this, name, Boolean(v)); },
  ];
  // 枚举属性：原样转成字符串交过去，不认识的由原生打警告
  const enumProp = (name) => [
    function () { return nativeGet(this, name); },
    function (v) { nativeSet(this, name, toText(v)); },
  ];
  const colorProp = (name) => [
    function () { return colorText(nativeGet(this, name)); },
    function (v) {
      const argb = colorProperty(name, v);
      if (argb !== null) nativeSet(this, name, argb);
    },
  ];
  const readOnly = (name) => [function () { return nativeGet(this, name); }, undefined];
  // 滚动条的滑块和轨道：视图持有它们
  const drawableProp = (name, setter, getter) => [
    function () { return own(this, name, nativeCallObject(this, getter, [])); },
    function (v) {
      const d = v == null ? null : requireInstance(v, Drawable, name);
      nativeCall(this, setter, [d]);
      own(this, name, d);
    },
  ];
  // 两个整数参数的方法（scrollTo、smoothScrollBy……）
  const twoInts = (name) => function (x, y) {
    requireArgs(arguments, 2, name);
    nativeCall(this, name, [toInteger(x, name), toInteger(y, name)]);
  };
  // 方向参数：字符串，不认识的由原生抛 TypeError。返回滚没滚动
  const directional = (name) => function (direction) {
    requireArgs(arguments, 1, name);
    return nativeCall(this, name, [toText(direction)]);
  };

  // ---- View 上加的 ----

  addAccessors(View.prototype, {
    // 内容滚过去了多少，像素。写它就是 scrollTo
    scrollX: integerProp('scrollX'),
    scrollY: integerProp('scrollY'),
    // 滚到头之后还能不能往外拉（Android 12 起是拉伸，11 是光晕）
    overScrollMode: enumProp('overScrollMode'),
    isVerticalScrollBarEnabled: booleanProp('isVerticalScrollBarEnabled'),
    isHorizontalScrollBarEnabled: booleanProp('isHorizontalScrollBarEnabled'),
    // 不滚的时候滚动条淡出
    isScrollbarFadingEnabled: booleanProp('isScrollbarFadingEnabled'),
    // 淡出用多久、停下来多久之后开始淡出，毫秒
    scrollBarFadeDuration: integerProp('scrollBarFadeDuration'),
    scrollBarDefaultDelayBeforeFade: integerProp('scrollBarDefaultDelayBeforeFade'),
    // 滚动条的粗细，像素
    scrollBarSize: integerProp('scrollBarSize'),
    scrollBarStyle: enumProp('scrollBarStyle'),
    verticalScrollbarPosition: enumProp('verticalScrollbarPosition'),
    verticalScrollbarWidth: readOnly('verticalScrollbarWidth'),
    verticalScrollbarThumbDrawable: drawableProp('verticalScrollbarThumbDrawable',
      'setVerticalScrollbarThumbDrawable', 'getVerticalScrollbarThumbDrawable'),
    verticalScrollbarTrackDrawable: drawableProp('verticalScrollbarTrackDrawable',
      'setVerticalScrollbarTrackDrawable', 'getVerticalScrollbarTrackDrawable'),
    horizontalScrollbarThumbDrawable: drawableProp('horizontalScrollbarThumbDrawable',
      'setHorizontalScrollbarThumbDrawable', 'getHorizontalScrollbarThumbDrawable'),
    horizontalScrollbarTrackDrawable: drawableProp('horizontalScrollbarTrackDrawable',
      'setHorizontalScrollbarTrackDrawable', 'getHorizontalScrollbarTrackDrawable'),
    // 还能往哪边滚时，在那一边画一条细线。位掩码：字符串数组，有一个不认识整次不生效
    scrollIndicators: [
      function () { return nativeGet(this, 'scrollIndicators'); },
      function (v) {
        if (v === null || typeof v !== 'object' || typeof v[Symbol.iterator] !== 'function') {
          throw new TypeError('scrollIndicators: expected an array, got ' + describeValue(v));
        }
        nativeSet(this, 'scrollIndicators', Array.from(v, toText));
      },
    ],
    // 边缘渐隐：内容滚到边上时淡出
    isVerticalFadingEdgeEnabled: booleanProp('isVerticalFadingEdgeEnabled'),
    isHorizontalFadingEdgeEnabled: booleanProp('isHorizontalFadingEdgeEnabled'),
    verticalFadingEdgeLength: readOnly('verticalFadingEdgeLength'),
    horizontalFadingEdgeLength: readOnly('horizontalFadingEdgeLength'),
    isNestedScrollingEnabled: booleanProp('isNestedScrollingEnabled'),
  });

  addMethods(View.prototype, {
    scrollTo: twoInts('scrollTo'),
    scrollBy: twoInts('scrollBy'),
    // direction 是正负号：负数问能不能往上（左）滚，正数问往下（右）
    canScrollVertically(direction) {
      requireArgs(arguments, 1, 'canScrollVertically');
      return nativeCall(this, 'canScrollVertically', [toInteger(direction, 'canScrollVertically')]);
    },
    canScrollHorizontally(direction) {
      requireArgs(arguments, 1, 'canScrollHorizontally');
      return nativeCall(this, 'canScrollHorizontally', [toInteger(direction, 'canScrollHorizontally')]);
    },
    // 渐隐的长度，像素。Java 只有 setter，读用 verticalFadingEdgeLength / horizontalFadingEdgeLength
    setFadingEdgeLength(length) {
      requireArgs(arguments, 1, 'setFadingEdgeLength');
      nativeCall(this, 'setFadingEdgeLength', [toInteger(length, 'setFadingEdgeLength')]);
    },
  });

  // scroll：原生真的会发。接在 View 原来的订阅后面（click 在 10-view.js 里）
  const viewSubscribe = View.prototype[kSubscribe];
  addMethods(View.prototype, {
    [kSubscribe](type, on) {
      if (type === 'scroll') subscribeNative(this, type, on);
      else viewSubscribe.call(this, type, on);
    },
  });

  // ---- ScrollView、HorizontalScrollView ----

  // Java 里它们继承 FrameLayout。布局那一组定义了 FrameLayout 就接在它下面，没定义就接在
  // ViewGroup 下面（FrameLayout 那个 part 的文件名排在这个前面）
  const Base = typeof globalThis.FrameLayout === 'function' ? globalThis.FrameLayout : ViewGroup;

  const scrollerMembers = {
    // 子视图比自己矮时，把它拉到和自己一样高（横的是一样宽）
    isFillViewport: booleanProp('isFillViewport'),
    // 关掉之后 fullScroll / pageScroll / arrowScroll 当场到位，不带动画
    isSmoothScrollingEnabled: booleanProp('isSmoothScrollingEnabled'),
    // 按方向键时一次最多滚多少，像素
    maxScrollAmount: readOnly('maxScrollAmount'),
  };
  const scrollerMethods = {
    // 带动画地滚到、滚过一段距离
    smoothScrollTo: twoInts('smoothScrollTo'),
    smoothScrollBy: twoInts('smoothScrollBy'),
    // 按初速度甩出去，像素每秒
    fling(velocity) {
      requireArgs(arguments, 1, 'fling');
      nativeCall(this, 'fling', [toInteger(velocity, 'fling')]);
    },
    fullScroll: directional('fullScroll'),
    pageScroll: directional('pageScroll'),
    arrowScroll: directional('arrowScroll'),
    // 越界效果的颜色（两边一起）。Android 12 起是拉伸效果，颜色用不上
    setEdgeEffectColor(color) {
      requireArgs(arguments, 1, 'setEdgeEffectColor');
      nativeCall(this, 'setEdgeEffectColor', [colorArgument('setEdgeEffectColor', color)]);
    },
  };

  class ScrollView extends Base {
    constructor(context) {
      super(context);
      constructNative(this, new.target, 'ScrollView', [context]);
    }

    // 滚到让这个后代视图露出来
    scrollToDescendant(child) {
      requireArgs(arguments, 1, 'scrollToDescendant');
      nativeCall(this, 'scrollToDescendant', [requireInstance(child, View, 'scrollToDescendant')]);
    }
  }
  addAccessors(ScrollView.prototype, {
    ...scrollerMembers,
    topEdgeEffectColor: colorProp('topEdgeEffectColor'),
    bottomEdgeEffectColor: colorProp('bottomEdgeEffectColor'),
  });
  addMethods(ScrollView.prototype, scrollerMethods);
  defineNativeClass('ScrollView', ScrollView);

  class HorizontalScrollView extends Base {
    constructor(context) {
      super(context);
      constructNative(this, new.target, 'HorizontalScrollView', [context]);
    }
  }
  addAccessors(HorizontalScrollView.prototype, {
    ...scrollerMembers,
    leftEdgeEffectColor: colorProp('leftEdgeEffectColor'),
    rightEdgeEffectColor: colorProp('rightEdgeEffectColor'),
  });
  addMethods(HorizontalScrollView.prototype, scrollerMethods);
  defineNativeClass('HorizontalScrollView', HorizontalScrollView);
})
