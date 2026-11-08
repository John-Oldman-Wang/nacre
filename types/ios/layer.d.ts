// iOS 原生符号。规则见 types/ios.d.ts 的说明。
//
// 图层。圆角、边框、阴影——UIView 自己没有的那些外观。

/**
 * 每个 `UIView` 背后都有一个图层，真正把东西画出来的是它。
 *
 * 这里**只暴露 `UIView` 上没有的**：圆角、边框、阴影。重叠的那些
 * （`opacity` / `backgroundColor` / `masksToBounds` / 几何）不开第二个
 * 写法——能力没丢，它们在 `UIView` 上。
 */
declare class CALayer extends NSObject {
  private constructor();

  /** 圆角半径。只圆背景；要连内容一起圆，还得 `view.clipsToBounds = true`。 */
  cornerRadius: number;
  /** `'continuous'` 是 Apple 自己在用的超椭圆圆角，过渡比正圆弧顺。默认 `'circular'`。 */
  cornerCurve: CALayerCornerCurve;
  /** 哪几个角要圆。位掩码，所以是字符串数组。默认四个角全圆。 */
  maskedCorners: CACornerMask[];

  borderWidth: number;
  /**
   * ObjC 里是 `CGColorRef`，JS 侧统一用 `UIColor`。
   *
   * **读出来是新建的对象**，和写进去的那个 `===` 不成立；而且动态色
   * （`UIColor.labelColor` 这类）在写入的那一刻就被定死，不会再跟着
   * 深浅色变。
   */
  borderColor: UIColor | null;

  /** 默认不透明黑。但 `shadowOpacity` 默认是 0，所以只设颜色看不见东西。 */
  shadowColor: UIColor | null;
  /** 默认 0——阴影默认是不显示的。 */
  shadowOpacity: number;
  /** 模糊半径，默认 3。 */
  shadowRadius: number;
  /** 默认 (0, -3)。UIKit 的 y 轴朝下，所以负值是往上偏。 */
  get shadowOffset(): CGSize;
  set shadowOffset(value: CGSizeLike);
}
