// iOS 原生符号。规则见 types/ios.d.ts 的说明。
//
// Auto Layout。锚点、约束、UILayoutGuide。

/**
 * 「某个 view 的某条边」的对象化。不能构造，只能从 UIView 或
 * UILayoutGuide 上取。
 *
 * 分三类，**不能互连**：横向、纵向、尺寸。连错了抛 TypeError——
 * 这一层 TypeScript 就能挡住，运行时再挡一次。
 */
declare class NSLayoutAnchor<T extends NSLayoutAnchor<T>> extends NSObject {
  protected constructor();
  constraintEqualToAnchor(other: T, options?: { constant?: number }): NSLayoutConstraint;
  constraintGreaterThanOrEqualToAnchor(
    other: T,
    options?: { constant?: number },
  ): NSLayoutConstraint;
  constraintLessThanOrEqualToAnchor(
    other: T,
    options?: { constant?: number },
  ): NSLayoutConstraint;
}

/** 横向：leading / trailing / left / right / centerX。 */
declare class NSLayoutXAxisAnchor extends NSLayoutAnchor<NSLayoutXAxisAnchor> {
  private constructor();
  /**
   * 系统标准间距。差多少由系统按上下文定（8pt 起步，靠近屏幕边缘、
   * 不同控件之间都不一样）。multiplier 省略时按 1。
   */
  constraintEqualToSystemSpacingAfterAnchor(
    other: NSLayoutXAxisAnchor,
    options?: { multiplier?: number },
  ): NSLayoutConstraint;
  constraintGreaterThanOrEqualToSystemSpacingAfterAnchor(
    other: NSLayoutXAxisAnchor,
    options?: { multiplier?: number },
  ): NSLayoutConstraint;
  constraintLessThanOrEqualToSystemSpacingAfterAnchor(
    other: NSLayoutXAxisAnchor,
    options?: { multiplier?: number },
  ): NSLayoutConstraint;
  /** 两个锚点之间的距离，本身又是一个可约束的量。 */
  anchorWithOffsetToAnchor(other: NSLayoutXAxisAnchor): NSLayoutDimension;
}

/** 纵向：top / bottom / centerY / firstBaseline / lastBaseline。 */
declare class NSLayoutYAxisAnchor extends NSLayoutAnchor<NSLayoutYAxisAnchor> {
  private constructor();
  constraintEqualToSystemSpacingBelowAnchor(
    other: NSLayoutYAxisAnchor,
    options?: { multiplier?: number },
  ): NSLayoutConstraint;
  constraintGreaterThanOrEqualToSystemSpacingBelowAnchor(
    other: NSLayoutYAxisAnchor,
    options?: { multiplier?: number },
  ): NSLayoutConstraint;
  constraintLessThanOrEqualToSystemSpacingBelowAnchor(
    other: NSLayoutYAxisAnchor,
    options?: { multiplier?: number },
  ): NSLayoutConstraint;
  anchorWithOffsetToAnchor(other: NSLayoutYAxisAnchor): NSLayoutDimension;
}

/** 尺寸：width / height。只有它能和常数比，也只有它能带 multiplier。 */
declare class NSLayoutDimension extends NSLayoutAnchor<NSLayoutDimension> {
  private constructor();
  constraintEqualToConstant(value: number): NSLayoutConstraint;
  constraintGreaterThanOrEqualToConstant(value: number): NSLayoutConstraint;
  constraintLessThanOrEqualToConstant(value: number): NSLayoutConstraint;
  constraintEqualToAnchor(
    other: NSLayoutDimension,
    options?: { multiplier?: number; constant?: number },
  ): NSLayoutConstraint;
  constraintGreaterThanOrEqualToAnchor(
    other: NSLayoutDimension,
    options?: { multiplier?: number; constant?: number },
  ): NSLayoutConstraint;
  constraintLessThanOrEqualToAnchor(
    other: NSLayoutDimension,
    options?: { multiplier?: number; constant?: number },
  ): NSLayoutConstraint;
}

/**
 * 一条约束：item1.attr1 <关系> multiplier × item2.attr2 + constant。
 * 由锚点造出来，建好之后只有 constant、priority、isActive、identifier 能改。
 */
declare class NSLayoutConstraint extends NSObject {
  private constructor();
  /** 激活时装到两端的最近公共祖先上。没有公共祖先就抛。 */
  isActive: boolean;
  /** 约束里唯一可写的数值，做动画改的就是它。 */
  constant: number;
  /** 写接受名字或数字，读永远返回数字。 */
  get priority(): number;
  set priority(value: UILayoutPriorityLike);
  /** 调试用。UIKit 报约束冲突时会把它打出来。 */
  identifier: string | null;

  readonly multiplier: number;
  readonly relation: NSLayoutRelation;
  readonly firstAttribute: NSLayoutAttribute;
  readonly secondAttribute: NSLayoutAttribute;
  /**
   * firstItem / secondItem 不暴露：原生是 assign，view 一死就是野指针，
   * 头文件自己写着不推荐用。要两端的 view，从锚点走。
   */
  readonly firstAnchor: NSLayoutXAxisAnchor | NSLayoutYAxisAnchor | NSLayoutDimension;
  readonly secondAnchor:
    | NSLayoutXAxisAnchor
    | NSLayoutYAxisAnchor
    | NSLayoutDimension
    | null;

  /** 批量比逐个 isActive = true 好：中间态不会短暂地不可满足。 */
  static activateConstraints(constraints: readonly NSLayoutConstraint[]): void;
  static deactivateConstraints(constraints: readonly NSLayoutConstraint[]): void;
}

/**
 * 不画东西的矩形。占位、分组、做间距，比塞一个透明 UIView 省一个图层。
 * 比 UIView 少两个锚点：没有基线，因为它没有文字。
 */
declare class UILayoutGuide extends NSObject {
  constructor();
  readonly owningView: UIView | null;
  /** 求解之后这个 guide 占的位置，在 owningView 的坐标系里。 */
  readonly layoutFrame: CGRect;
  identifier: string;

  readonly leadingAnchor: NSLayoutXAxisAnchor;
  readonly trailingAnchor: NSLayoutXAxisAnchor;
  readonly leftAnchor: NSLayoutXAxisAnchor;
  readonly rightAnchor: NSLayoutXAxisAnchor;
  readonly topAnchor: NSLayoutYAxisAnchor;
  readonly bottomAnchor: NSLayoutYAxisAnchor;
  readonly widthAnchor: NSLayoutDimension;
  readonly heightAnchor: NSLayoutDimension;
  readonly centerXAnchor: NSLayoutXAxisAnchor;
  readonly centerYAnchor: NSLayoutYAxisAnchor;
}
