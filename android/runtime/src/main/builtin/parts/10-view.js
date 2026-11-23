// 第一条竖切用到的原生类：Context、Activity、View、ViewGroup、LinearLayout、TextView。
//
// 不接 Button：它就是 TextView 加上系统主题的样式，没有 TextView 做不到的能力。
// 任何视图都能点，样式由 App 自己定（「组件不接」那条规矩）。
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
//
// 规矩（2026-11-23 定，第 3 步）：类用简单类名挂在全局；Java 的 getText() / setText()
// 合成一个属性 text；类的层级照 Android。手写的，以后由 bindgen 生成。
// JS 的类可以继承它们，但继承只在 JS 这一层（见 01-bridge.js 的 nearestNative）。
(function (ctx) {
  'use strict';

  const {
    EventTarget,
    abstractOnly,
    constructNative,
    defineNativeClass,
    kSubscribe,
    nativeCall,
    nativeCallObject,
    nativeGet,
    nativeOnly,
    nativeSet,
    own,
    ownOne,
    requireInstance,
    subscribeNative,
    toInteger,
    toText,
  } = ctx;

  // 原生真的会发的事件。别的名字是 JS 自己的自定义事件，不用告诉原生
  const viewEvents = new Set(['click']);

  // ---- Context、Activity：系统建的，不能 new ----

  class Context extends EventTarget {
    constructor() {
      nativeOnly(new.target);
      super();
    }
  }
  defineNativeClass('Context', Context);

  class Activity extends Context {
    // 把视图设成页面的内容。页面持有它
    setContentView(view) {
      requireInstance(view, View, 'setContentView');
      nativeCall(this, 'setContentView', [view]);
      own(this, 'contentView', view);
    }
  }
  defineNativeClass('Activity', Activity);

  // ---- View 一族 ----

  class View extends EventTarget {
    constructor(context) {
      super();
      if (arguments.length < 1) {
        throw new TypeError("Failed to construct '" + new.target.name + "': 1 argument required.");
      }
      requireInstance(context, Context, 'new ' + new.target.name);
      constructNative(this, new.target, 'View', [context]);
    }

    // 内边距，单位是像素，照 Android 的 API 原样。只有自己改得了，所以没有变化事件
    get paddingLeft() { return nativeGet(this, 'paddingLeft'); }
    get paddingTop() { return nativeGet(this, 'paddingTop'); }
    get paddingRight() { return nativeGet(this, 'paddingRight'); }
    get paddingBottom() { return nativeGet(this, 'paddingBottom'); }

    setPadding(left, top, right, bottom) {
      if (arguments.length < 4) {
        throw new TypeError("Failed to execute 'setPadding': 4 arguments required, but only " +
                            arguments.length + ' present.');
      }
      // 四个都转完再过桥：有一个不对就整次不生效
      const values = [
        toInteger(left, 'setPadding'),
        toInteger(top, 'setPadding'),
        toInteger(right, 'setPadding'),
        toInteger(bottom, 'setPadding'),
      ];
      nativeCall(this, 'setPadding', values);
    }

    [kSubscribe](type, on) {
      if (viewEvents.has(type)) subscribeNative(this, type, on);
    }
  }
  defineNativeClass('View', View);

  class ViewGroup extends View {
    constructor(context) {
      abstractOnly(new.target, ViewGroup);
      super(context);
    }

    get childCount() { return nativeGet(this, 'childCount'); }

    // 加一个子视图。父视图持有它。已经有父视图时 Java 抛 IllegalStateException
    addView(child) {
      requireInstance(child, View, 'addView');
      nativeCall(this, 'addView', [child]);
      ownOne(this, 'children', child);
    }

    // 第 index 个子视图，越界是 null
    getChildAt(index) {
      return nativeCallObject(this, 'getChildAt', [toInteger(index, 'getChildAt')]);
    }
  }
  defineNativeClass('ViewGroup', ViewGroup);

  class LinearLayout extends ViewGroup {
    constructor(context) {
      super(context);
      constructNative(this, new.target, 'LinearLayout', [context]);
    }
  }
  defineNativeClass('LinearLayout', LinearLayout);

  class TextView extends View {
    constructor(context) {
      super(context);
      constructNative(this, new.target, 'TextView', [context]);
    }

    get text() { return nativeGet(this, 'text'); }
    set text(v) { nativeSet(this, 'text', toText(v)); }
  }
  defineNativeClass('TextView', TextView);

})
