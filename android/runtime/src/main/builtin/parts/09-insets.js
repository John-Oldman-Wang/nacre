// 窗口边衬（安全区域）的两个值类：Insets 和 WindowInsets。
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
//
// 它们是系统给的一份快照，不是原生对象的包装：字段只读，写了抛 TypeError（strict
// 模式下给只有 getter 的属性赋值就是这样），JS 不能 new。名字照 Android 的
// android.graphics.Insets 和 WindowInsets.Type，单位是 dp（可以是小数，原生按页面的密度换好了）。
(function (ctx) {
  'use strict';

  const { define } = ctx;
  const kToken = Symbol('insets');

  class Insets {
    #left; #top; #right; #bottom;
    constructor(token, left, top, right, bottom) {
      if (token !== kToken) throw new TypeError('Illegal constructor: Insets is given by the system');
      this.#left = left; this.#top = top; this.#right = right; this.#bottom = bottom;
    }
    get left() { return this.#left; }
    get top() { return this.#top; }
    get right() { return this.#right; }
    get bottom() { return this.#bottom; }
  }

  // 每类边衬一个只读字段。顺序和名字照 WindowInsets.Type
  const kinds = ['systemBars', 'statusBars', 'navigationBars', 'displayCutout', 'ime',
                 'systemGestures', 'tappableElement'];

  class WindowInsets {
    #values;
    constructor(token, values) {
      if (token !== kToken) throw new TypeError('Illegal constructor: WindowInsets is given by the system');
      this.#values = values;
    }
    // 每类一个只读字段。写在类里面（静态块），#values 才看得见
    static {
      for (const kind of kinds) {
        Object.defineProperty(this.prototype, kind, {
          get() { return this.#values[kind]; },
          enumerable: true,
          configurable: true,
        });
      }
    }
  }

  // 原生给的 { systemBars: [左, 上, 右, 下], … } → WindowInsets
  function makeWindowInsets(raw) {
    const values = Object.create(null);
    for (const kind of kinds) {
      const [l, t, r, b] = raw[kind];
      values[kind] = Object.freeze(new Insets(kToken, l, t, r, b));
    }
    return Object.freeze(new WindowInsets(kToken, values));
  }

  define(globalThis, 'Insets', Insets);
  define(globalThis, 'WindowInsets', WindowInsets);
  Object.assign(ctx, { makeWindowInsets });
})
