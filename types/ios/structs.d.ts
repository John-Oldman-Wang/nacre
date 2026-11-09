// iOS 原生符号。规则见 types/ios.d.ts 的说明。
//
// 结构体。读出来是只读的 JS 对象，写入时给普通对象也行。

// ---------------------------------------------------------------------------
// 结构体
// ---------------------------------------------------------------------------
//
// 字段**只读**：ObjC 里 view.frame.x = 10 是编译错误（改的是返回的临时副本），
// 用可写对象表示会让它变成静默无效。这里写入直接抛 TypeError。
//
// 要改就整体赋一个新的：view.frame = new CGRect(0, 0, 100, 50)

declare class CGPoint {
  constructor(x: number, y: number);
  readonly x: number;
  readonly y: number;
}

declare class CGSize {
  constructor(width: number, height: number);
  readonly width: number;
  readonly height: number;
}

declare class CGRect {
  constructor(x: number, y: number, width: number, height: number);
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  /** 嵌套访问，和 ObjC 的 {CGPoint origin; CGSize size;} 对得上。 */
  readonly origin: CGPoint;
  readonly size: CGSize;
}

declare class UIEdgeInsets {
  constructor(top: number, left: number, bottom: number, right: number);
  readonly top: number;
  readonly left: number;
  readonly bottom: number;
  readonly right: number;
}

// 写入宽、读出窄：赋值时给个普通对象也行（字段齐就认，少一个会抛），
// 读出来永远是结构体类。所以 setter 收 Like、getter 给类本身。
type CGPointLike = CGPoint | { x: number; y: number };
type CGSizeLike = CGSize | { width: number; height: number };
type CGRectLike =
  | CGRect
  | { x: number; y: number; width: number; height: number };
type UIEdgeInsetsLike =
  | UIEdgeInsets
  | { top: number; left: number; bottom: number; right: number };

/**
 * 2×3 的仿射矩阵。
 *
 * ```
 * | a  b  0 |
 * | c  d  0 |
 * | tx ty 1 |
 * ```
 *
 * ObjC 侧造它的是一组 C 函数（`CGAffineTransformMakeScale` 之类），但那几个
 * 函数全是纯算术，所以这里的静态工厂是 JS 自己算的，没有跨桥。
 *
 * 和别的结构体一样**字段只读**，要改就整个换一个新的。
 */
declare class CGAffineTransform {
  constructor(a: number, b: number, c: number, d: number, tx: number, ty: number);
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly d: number;
  readonly tx: number;
  readonly ty: number;

  /** 单位矩阵：什么都不变。 */
  static readonly identity: CGAffineTransform;
  /** 缩放。只给一个参数时两轴相同。 */
  static scale(sx: number, sy?: number): CGAffineTransform;
  /** 平移。 */
  static translation(tx: number, ty: number): CGAffineTransform;
  /** 旋转，**弧度**不是角度（和 Core Graphics 一致）。 */
  static rotation(radians: number): CGAffineTransform;

  /** 先应用自己再应用 other，等价于 `CGAffineTransformConcat(self, other)`。 */
  concat(other: CGAffineTransform): CGAffineTransform;
  /** 逆矩阵。不可逆（行列式为 0）时返回 `null`。 */
  invert(): CGAffineTransform | null;
  readonly isIdentity: boolean;
  toString(): string;
}
