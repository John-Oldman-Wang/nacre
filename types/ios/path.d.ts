// iOS 原生符号。规则见 types/ios.d.ts 的说明。
//
// 路径。只管形状，画出来是 CAShapeLayer 的事。

/**
 * 一条路径。直线、曲线、圆弧，以及现成的矩形 / 椭圆 / 圆角矩形。
 *
 * ```js
 * const line = new UIBezierPath();
 * line.moveToPoint(new CGPoint(0, 60));
 * line.addLineToPoint(new CGPoint(40, 20));
 * line.addLineToPoint(new CGPoint(80, 50));
 *
 * const shape = new CAShapeLayer();
 * shape.path = line;
 * shape.strokeColor = 'systemBlue';
 * shape.fillColor = null;        // 默认是黑色实心，不设就糊一团
 * shape.lineWidth = 3;
 * shape.frame = card.bounds;
 * card.layer.addSublayer(shape);
 * ```
 *
 * **角度一律是弧度**，而且 UIKit 的 y 轴朝下：0 弧度在正右方，角度增大
 * 是**顺时针**，和数学课上的方向相反。
 *
 * **没有 `fill()` / `stroke()` / `addClip()`**，也没有路径自己那套
 * `lineWidth` / `lineCapStyle` / `lineJoinStyle` / `miterLimit` /
 * `flatness`：它们都只服务于那两个绘制方法，而绘制要当前的 `CGContext`
 * ——那是覆写 `drawRect:` 里的事，运行时还没有那个覆写点。路径画在
 * `CAShapeLayer` 上时，生效的是**图层**的同名属性。
 *
 * `bezierPathWithCGPath:` 也没有：`CGPathRef` 还没有包装。
 */
declare class UIBezierPath extends NSObject {
  /** 空路径。 */
  constructor();

  // ---- 现成的形状 ----
  static bezierPathWithRect(rect: CGRectLike): UIBezierPath;
  /** 内切椭圆。正方形进去就是个正圆。 */
  static bezierPathWithOvalInRect(rect: CGRectLike): UIBezierPath;
  /**
   * 圆角矩形。两种写法：`{ cornerRadius }` 四个角一样圆，
   * `{ byRoundingCorners, cornerRadii }` 挑角，半径是 `CGSize`（横纵可以不同）。
   */
  static bezierPathWithRoundedRect(
    rect: CGRectLike,
    options:
      | { cornerRadius: number }
      | { byRoundingCorners: UIRectCorner[]; cornerRadii: CGSizeLike },
  ): UIBezierPath;
  /** 一段圆弧。四个选项都要给——原生这里没有默认值。 */
  static bezierPathWithArcCenter(
    center: CGPointLike,
    options: {
      radius: number;
      startAngle: number;
      endAngle: number;
      clockwise: boolean;
    },
  ): UIBezierPath;

  // ---- 自己画 ----
  /** 抬笔移到某处，开一段新的子路径。 */
  moveToPoint(point: CGPointLike): void;
  /** 从 `currentPoint` 连一条直线过去。还没有 `currentPoint` 时什么都不画。 */
  addLineToPoint(point: CGPointLike): void;
  /** 三次贝塞尔，两个控制点。 */
  addCurveToPoint(
    point: CGPointLike,
    options: { controlPoint1: CGPointLike; controlPoint2: CGPointLike },
  ): void;
  /** 二次贝塞尔，一个控制点。 */
  addQuadCurveToPoint(
    point: CGPointLike,
    options: { controlPoint: CGPointLike },
  ): void;
  /** 接一段圆弧。已经有 `currentPoint` 的话会先连一条直线到弧的起点。 */
  addArcWithCenter(
    center: CGPointLike,
    options: {
      radius: number;
      startAngle: number;
      endAngle: number;
      clockwise: boolean;
    },
  ): void;
  /** 连回这段子路径的起点。填充时开口路径本来就按闭合算，但描边看得出区别。 */
  closePath(): void;
  removeAllPoints(): void;
  /** 把另一条路径整段接过来。接的是副本，之后改它不影响这一条。 */
  appendPath(path: UIBezierPath): void;
  /** **就地**变换，不返回新路径。 */
  applyTransform(transform: CGAffineTransform): void;
  /** 反向的一条新路径，原路径不动。方向只在 `nonZero` 填充规则下看得出来。 */
  bezierPathByReversingPath(): UIBezierPath;

  // ---- 问它 ----
  /** 只看**填充区域**，描边不算；开口路径按闭合之后算。 */
  containsPoint(point: CGPointLike): boolean;
  readonly isEmpty: boolean;
  /** 把路径包住的最小矩形。算的是**路径本身**，不含线宽。 */
  readonly bounds: CGRect;
  /** 笔尖在哪。空路径时是 (0, 0)。 */
  readonly currentPoint: CGPoint;
  /**
   * 默认 `false`，也就是 `nonZero`。
   *
   * 注意画在图层上时**不看这个**，看的是 `CAShapeLayer.fillRule`；
   * 这条只影响 `containsPoint()` 的判定。
   */
  usesEvenOddFillRule: boolean;
}
