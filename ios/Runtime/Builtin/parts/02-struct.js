// 结构体：CGRect / CGPoint / CGSize 一组
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const { define, toNumber } = ctx;

  function defineStructFields(target, fields) {
    for (const [name, value] of fields) {
      Object.defineProperty(target, name, {
        enumerable: true,
        get: () => value,
        set() {
          throw new TypeError(
            name + ' is read-only: structs are values, assign a whole new one instead');
        },
      });
    }
    Object.preventExtensions(target);
  }
  // 结构体构造函数的参数。不给（undefined）按 0，和 Web 的 new DOMPoint()
  // 一致；给了就按数转，转不出有限数就抛——以前是静默变成 0
  function num(v) {
    return v === undefined ? 0 : toNumber(v, 'a struct field');
  }

  const CGPoint = define(globalThis, 'CGPoint', class CGPoint {
    constructor(x, y) {
      defineStructFields(this, [['x', num(x)], ['y', num(y)]]);
    }
    toString() { return 'CGPoint(' + this.x + ', ' + this.y + ')'; }
  });

  const CGSize = define(globalThis, 'CGSize', class CGSize {
    constructor(width, height) {
      defineStructFields(this, [['width', num(width)], ['height', num(height)]]);
    }
    toString() { return 'CGSize(' + this.width + ', ' + this.height + ')'; }
  });

  // 帧率区间。preferred 给 0 表示跟硬件走（默认就是三个 0）
  const CAFrameRateRange = define(globalThis, 'CAFrameRateRange', class CAFrameRateRange {
    constructor(minimum, maximum, preferred) {
      defineStructFields(this, [['minimum', num(minimum)], ['maximum', num(maximum)],
                                ['preferred', num(preferred === undefined ? 0 : preferred)]]);
    }
    toString() {
      return 'CAFrameRateRange(' + this.minimum + ', ' + this.maximum + ', ' +
             this.preferred + ')';
    }
  });

  // 线上格式是扁平的四个数，和 ObjC 的 {origin, size} 嵌套结构对应关系
  // 由 origin / size 两个取值器给出——它们在原型上，所以不参与
  // JSON.stringify，线上只走扁平的四个字段。
  const CGRect = define(globalThis, 'CGRect', class CGRect {
    constructor(x, y, width, height) {
      defineStructFields(this, [['x', num(x)], ['y', num(y)],
                                ['width', num(width)], ['height', num(height)]]);
    }
    get origin() { return new CGPoint(this.x, this.y); }
    get size() { return new CGSize(this.width, this.height); }
    toString() {
      return 'CGRect(' + this.x + ', ' + this.y + ', ' +
             this.width + ', ' + this.height + ')';
    }
  });

  const UIEdgeInsets = define(globalThis, 'UIEdgeInsets', class UIEdgeInsets {
    constructor(top, left, bottom, right) {
      defineStructFields(this, [['top', num(top)], ['left', num(left)],
                                ['bottom', num(bottom)], ['right', num(right)]]);
    }
    toString() {
      return 'UIEdgeInsets(' + this.top + ', ' + this.left + ', ' +
             this.bottom + ', ' + this.right + ')';
    }
  });

  // 带方向的边距。和 UIEdgeInsets 的区别只在左右：leading 是文字开始的
  // 那一侧（从左往右的语言里是左），trailing 是结束的那一侧
  const NSDirectionalEdgeInsets = define(globalThis, 'NSDirectionalEdgeInsets',
                                         class NSDirectionalEdgeInsets {
    constructor(top, leading, bottom, trailing) {
      defineStructFields(this, [['top', num(top)], ['leading', num(leading)],
                                ['bottom', num(bottom)], ['trailing', num(trailing)]]);
    }
    toString() {
      return 'NSDirectionalEdgeInsets(' + this.top + ', ' + this.leading + ', ' +
             this.bottom + ', ' + this.trailing + ')';
    }
  });

  // 2×3 的仿射矩阵：
  //
  //   | a  b  0 |
  //   | c  d  0 |
  //   | tx ty 1 |
  //
  // ObjC 侧造它的是一组 **C 函数**（CGAffineTransformMakeScale 之类），不是
  // 方法。但那几个函数全是**纯算术**——scale 就是把 a、d 填上，rotation 就是
  // 一对 sin/cos——所以不用把它们跨桥暴露，JS 自己算得出来。过桥的只有六个
  // 数。这一条省掉了「C 函数怎么暴露」那个一直悬着的问题。
  const CGAffineTransform = define(globalThis, 'CGAffineTransform',
                                   class CGAffineTransform {
    constructor(a, b, c, d, tx, ty) {
      defineStructFields(this, [['a', num(a)], ['b', num(b)], ['c', num(c)],
                                ['d', num(d)], ['tx', num(tx)], ['ty', num(ty)]]);
    }

    /** 单位矩阵：什么都不变 */
    static get identity() { return new CGAffineTransform(1, 0, 0, 1, 0, 0); }
    /** 缩放。只给一个参数时两轴相同 */
    static scale(sx, sy) {
      const x = num(sx);
      return new CGAffineTransform(x, 0, 0, sy === undefined ? x : num(sy), 0, 0);
    }
    /** 平移 */
    static translation(tx, ty) {
      return new CGAffineTransform(1, 0, 0, 1, num(tx), num(ty));
    }
    /** 旋转，**弧度**不是角度（和 Core Graphics 一致） */
    static rotation(radians) {
      const r = num(radians);
      const cos = Math.cos(r);
      const sin = Math.sin(r);
      return new CGAffineTransform(cos, sin, -sin, cos, 0, 0);
    }

    /** 先应用 this 再应用 other，等价于 CGAffineTransformConcat(this, other) */
    concat(other) {
      const o = structArg(other, TRANSFORM_FIELDS, 'concat');
      return new CGAffineTransform(
        this.a * o.a + this.b * o.c,
        this.a * o.b + this.b * o.d,
        this.c * o.a + this.d * o.c,
        this.c * o.b + this.d * o.d,
        this.tx * o.a + this.ty * o.c + o.tx,
        this.tx * o.b + this.ty * o.d + o.ty);
    }
    /** 逆矩阵。不可逆（行列式为 0）时返回 null，不抛也不悄悄给单位矩阵 */
    invert() {
      const det = this.a * this.d - this.b * this.c;
      if (det === 0) return null;
      return new CGAffineTransform(
        this.d / det, -this.b / det, -this.c / det, this.a / det,
        (this.c * this.ty - this.d * this.tx) / det,
        (this.b * this.tx - this.a * this.ty) / det);
    }
    get isIdentity() {
      return this.a === 1 && this.b === 0 && this.c === 0 &&
             this.d === 1 && this.tx === 0 && this.ty === 0;
    }
    toString() {
      return 'CGAffineTransform(' + this.a + ', ' + this.b + ', ' + this.c +
             ', ' + this.d + ', ' + this.tx + ', ' + this.ty + ')';
    }
  });

  // 读出来的永远是结构体类的实例；写进去的可以是实例，也可以是带同样
  // 字段的普通对象（写入宽、读出窄，和颜色同一套规则）。
  // 缺字段直接抛，不默认补 0——那是静默出错。
  function structArg(value, fields, what) {
    if (value == null || typeof value !== 'object') {
      throw new TypeError(
        what + ' needs an object with all of: ' + fields.join(', '));
    }
    const out = {};
    for (const f of fields) {
      const n = Number(value[f]);
      if (!Number.isFinite(n)) {
        throw new TypeError(
          what + ' is missing ' + f + ', or it is not a finite number');
      }
      out[f] = n;
    }
    return out;
  }
  const RECT_FIELDS = ['x', 'y', 'width', 'height'];
  const POINT_FIELDS = ['x', 'y'];
  const SIZE_FIELDS = ['width', 'height'];
  const FRAME_RATE_FIELDS = ['minimum', 'maximum', 'preferred'];
  const INSETS_FIELDS = ['top', 'left', 'bottom', 'right'];
  const DIRECTIONAL_INSETS_FIELDS = ['top', 'leading', 'bottom', 'trailing'];
  const TRANSFORM_FIELDS = ['a', 'b', 'c', 'd', 'tx', 'ty'];
  const toRect = (o) => (o == null ? null : new CGRect(o.x, o.y, o.width, o.height));
  const toPoint = (o) => (o == null ? null : new CGPoint(o.x, o.y));
  const toSize = (o) => (o == null ? null : new CGSize(o.width, o.height));
  const toFrameRateRange = (o) =>
    (o == null ? null : new CAFrameRateRange(o.minimum, o.maximum, o.preferred));
  const toTransform = (o) =>
    (o == null ? null : new CGAffineTransform(o.a, o.b, o.c, o.d, o.tx, o.ty));
  const toInsets = (o) =>
    (o == null ? null : new UIEdgeInsets(o.top, o.left, o.bottom, o.right));
  const toDirectionalInsets = (o) =>
    (o == null ? null
               : new NSDirectionalEdgeInsets(o.top, o.leading, o.bottom, o.trailing));

  // ---- 继承链的空壳 ----
  // 照搬 ObjC 的继承关系，现在先空着，以后往上加成员时子类自动继承。
  // NSObject 是 ObjC 的根类，所以也是这里所有原生类的根。
  // 让它继承 EventTarget：原生对象要发事件是常态，按原则 3 抽到基类，
  // 不让每个类各自发明一套回调。

  // 这个 part 对外提供的东西
  Object.assign(ctx, {
    DIRECTIONAL_INSETS_FIELDS,
    FRAME_RATE_FIELDS,
    INSETS_FIELDS,
    POINT_FIELDS,
    RECT_FIELDS,
    SIZE_FIELDS,
    TRANSFORM_FIELDS,
    structArg,
    toDirectionalInsets,
    toFrameRateRange,
    toInsets,
    toPoint,
    toRect,
    toSize,
    toTransform,
  });
})
