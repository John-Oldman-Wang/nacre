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

  // 4×4 的矩阵，图层的 3D 变换。和 Core Animation 一样用**行向量**：点乘在
  // 矩阵的左边，所以平移在第四行（m41 m42 m43），透视在第三行第四列（m34）。
  //
  // 和 CGAffineTransform 一样，ObjC 侧造它的那组 C 函数（CATransform3DMake…、
  // CATransform3DConcat……）全是纯算术，在 JS 里算，过桥的只有 16 个数。
  const T3D = ['m11', 'm12', 'm13', 'm14', 'm21', 'm22', 'm23', 'm24',
               'm31', 'm32', 'm33', 'm34', 'm41', 'm42', 'm43', 'm44'];
  // 两个 4×4 相乘，参数和结果都是 16 个数的数组，按行排
  function mul4(a, b) {
    const out = new Array(16);
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) sum += a[r * 4 + k] * b[k * 4 + c];
        out[r * 4 + c] = sum;
      }
    }
    return out;
  }
  // 16 个数（按行排）造一个矩阵。不挂在类上：它不是 Core Animation 的接口
  const fromArray = (list) => new CATransform3D(...list);
  const CATransform3D = define(globalThis, 'CATransform3D', class CATransform3D {
    constructor(m11, m12, m13, m14, m21, m22, m23, m24,
                m31, m32, m33, m34, m41, m42, m43, m44) {
      const values = [m11, m12, m13, m14, m21, m22, m23, m24,
                      m31, m32, m33, m34, m41, m42, m43, m44];
      defineStructFields(this, T3D.map((name, i) => [name, num(values[i])]));
    }
    /** 单位矩阵：什么都不变（CATransform3DIdentity） */
    static get identity() {
      return new CATransform3D(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    }
    /** 平移（CATransform3DMakeTranslation）。不给 tz 是 0 */
    static translation(tx, ty, tz) {
      return new CATransform3D(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0,
                               num(tx), num(ty), num(tz), 1);
    }
    /** 缩放（CATransform3DMakeScale）。只给一个时 x、y 相同，不给 sz 是 1 */
    static scale(sx, sy, sz) {
      const x = num(sx);
      const y = sy === undefined ? x : num(sy);
      const z = sz === undefined ? 1 : num(sz);
      return new CATransform3D(x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1);
    }
    /**
     * 绕 (x, y, z) 这根轴转 radians 弧度（CATransform3DMakeRotation），右手定则。
     * 轴是零向量时 Apple 说结果没有定义，这里抛 RangeError
     */
    static rotation(radians, x, y, z) {
      const r = num(radians);
      let ax = num(x);
      let ay = num(y);
      let az = num(z);
      const len = Math.hypot(ax, ay, az);
      if (len === 0) throw new RangeError('rotation needs a non-zero axis (x, y, z)');
      ax /= len; ay /= len; az /= len;
      const c = Math.cos(r);
      const s = Math.sin(r);
      const t = 1 - c;
      return new CATransform3D(
        c + t * ax * ax, t * ax * ay + s * az, t * ax * az - s * ay, 0,
        t * ax * ay - s * az, c + t * ay * ay, t * ay * az + s * ax, 0,
        t * ax * az + s * ay, t * ay * az - s * ax, c + t * az * az, 0,
        0, 0, 0, 1);
    }
    /** 把 2D 的仿射变换变成 3D 的（CATransform3DMakeAffineTransform） */
    static fromAffineTransform(transform) {
      const t = structArg(transform, TRANSFORM_FIELDS, 'fromAffineTransform');
      return new CATransform3D(t.a, t.b, 0, 0, t.c, t.d, 0, 0, 0, 0, 1, 0, t.tx, t.ty, 0, 1);
    }

    /** 先应用自己再应用 other（CATransform3DConcat(self, other)） */
    concat(other) {
      const o = structArg(other, T3D, 'concat');
      return fromArray(mul4(T3D.map((f) => this[f]), T3D.map((f) => o[f])));
    }
    /** 先平移再应用自己（CATransform3DTranslate） */
    translate(tx, ty, tz) { return CATransform3D.translation(tx, ty, tz).concat(this); }
    /** 先缩放再应用自己（CATransform3DScale） */
    scale(sx, sy, sz) { return CATransform3D.scale(sx, sy, sz).concat(this); }
    /** 先旋转再应用自己（CATransform3DRotate） */
    rotate(radians, x, y, z) { return CATransform3D.rotation(radians, x, y, z).concat(this); }
    /** 逆矩阵。不可逆时返回 null，不抛也不悄悄给原样（CATransform3DInvert 给原样） */
    invert() {
      const m = T3D.map((f) => this[f]);
      // 高斯-约旦消元，带部分主元
      const a = m.slice();
      const inv = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
      for (let col = 0; col < 4; col++) {
        let pivot = col;
        for (let r = col + 1; r < 4; r++) {
          if (Math.abs(a[r * 4 + col]) > Math.abs(a[pivot * 4 + col])) pivot = r;
        }
        if (Math.abs(a[pivot * 4 + col]) < 1e-12) return null;
        if (pivot !== col) {
          for (let k = 0; k < 4; k++) {
            [a[col * 4 + k], a[pivot * 4 + k]] = [a[pivot * 4 + k], a[col * 4 + k]];
            [inv[col * 4 + k], inv[pivot * 4 + k]] = [inv[pivot * 4 + k], inv[col * 4 + k]];
          }
        }
        const p = a[col * 4 + col];
        for (let k = 0; k < 4; k++) { a[col * 4 + k] /= p; inv[col * 4 + k] /= p; }
        for (let r = 0; r < 4; r++) {
          if (r === col) continue;
          const f = a[r * 4 + col];
          if (f === 0) continue;
          for (let k = 0; k < 4; k++) {
            a[r * 4 + k] -= f * a[col * 4 + k];
            inv[r * 4 + k] -= f * inv[col * 4 + k];
          }
        }
      }
      return fromArray(inv);
    }
    get isIdentity() {
      return T3D.every((f, i) => this[f] === (i % 5 === 0 ? 1 : 0));
    }
    /** 能不能用 2D 的仿射变换表示（CATransform3DIsAffine） */
    get isAffine() {
      return this.m13 === 0 && this.m14 === 0 && this.m23 === 0 && this.m24 === 0 &&
             this.m31 === 0 && this.m32 === 0 && this.m33 === 1 && this.m34 === 0 &&
             this.m43 === 0 && this.m44 === 1;
    }
    /** 2D 的那一部分（CATransform3DGetAffineTransform） */
    get affineTransform() {
      return new CGAffineTransform(this.m11, this.m12, this.m21, this.m22, this.m41, this.m42);
    }
    toString() {
      return 'CATransform3D(' + T3D.map((f) => this[f]).join(', ') + ')';
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
  const TRANSFORM3D_FIELDS = T3D;
  const toTransform3D = (o) => (o == null ? null : fromArray(T3D.map((f) => o[f])));
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
    TRANSFORM3D_FIELDS,
    structArg,
    toDirectionalInsets,
    toFrameRateRange,
    toInsets,
    toPoint,
    toRect,
    toSize,
    toTransform,
    toTransform3D,
  });
})
