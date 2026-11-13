// iOS 原生符号。规则见 types/ios.d.ts 的说明。
//
// 图层。几何、层级、外观，以及渐变和形状。

/**
 * 每个 `UIView` 背后都有一个图层（`view.layer`），真正把东西画出来的是它。
 *
 * 也可以自己建一个挂上去：
 *
 * ```js
 * const g = new CAGradientLayer();
 * g.colors = ['#5856D6', '#FF2D55'];
 * card.layoutIfNeeded();        // 先让约束跑一遍，bounds 才是真的
 * g.frame = card.bounds;
 * card.layer.addSublayer(g);
 * ```
 *
 * **子图层不走 Auto Layout。** iOS 上 `CALayer` 的 `autoresizingMask` 和
 * `layoutManager` 都标了 `API_UNAVAILABLE(ios)`，约束也只作用于 view，
 * 所以子图层的 `frame` 得自己设——view 的大小变了（旋转、动态字体、
 * 键盘）也要自己重设一次。原生 App 在 `layoutSubviews` 里做这件事，
 * 运行时还没有那个覆写点。
 *
 * `frame` / `bounds` / `opacity` / `isHidden` 这些名字 `UIView` 上也有。
 * view 自己那一层**用 view 的写法**（它才是参与布局的那个）；独立建的
 * 子图层上 view 没有对应物，只能用这里的。
 */
declare class CALayer extends NSObject {
  constructor();

  // ---- 几何 ----
  /** 自己建的图层默认是 0×0，不设就什么都看不见。 */
  get frame(): CGRect;
  set frame(value: CGRectLike);
  get bounds(): CGRect;
  set bounds(value: CGRectLike);
  /** 图层在父图层里的位置。默认锚点在正中，所以这是**中心点**不是左上角。 */
  get position(): CGPoint;
  set position(value: CGPointLike);
  /** 不动 `sublayers` 的顺序就能改叠放次序。默认 0。 */
  zPosition: number;

  // ---- 层级 ----
  readonly superlayer: CALayer | null;
  readonly sublayers: CALayer[];
  addSublayer(layer: CALayer): void;
  insertSublayer(
    layer: CALayer,
    options: { atIndex: number } | { above: CALayer } | { below: CALayer },
  ): void;
  removeFromSuperlayer(): void;

  // ---- 动画 ----
  /**
   * 把动画挂上去。**这里会拷贝一份**——加完再改原来那个对象不会有任何
   * 效果，`animationForKey` 读回来的也是那份拷贝。
   *
   * 同一个 `forKey` 只能有一个动画，再加会顶掉前一个。
   */
  addAnimation(animation: CAAnimation, options?: { forKey?: string | null }): void;
  removeAllAnimations(): void;
  removeAnimationForKey(key: string): void;
  /** 当前挂着的动画的 key。没有时给 `[]`，不是 `null`。 */
  animationKeys(): string[];
  /** 给的是**图层持有的那份拷贝**。头文件原话：改它的任何属性都是未定义行为。 */
  animationForKey(key: string): CAAnimation | null;

  // ---- 外观 ----
  /** 0…1。`UIView` 上对应的是 `alpha`。 */
  opacity: number;
  isHidden: boolean;
  /** 子图层超出自己 `bounds` 的部分裁不裁掉。配 `cornerRadius` 用。 */
  masksToBounds: boolean;
  /**
   * **默认是 1，不是屏幕的 scale**，画出来会糊——在 3x 的机器上要设成 3。
   *
   * 实测 `view.layer` 在场景接入时**也是 1**，所以它当不了屏幕 scale 的
   * 替代品；而 `UIScreen` 和 `UITraitCollection.displayScale` 都还没暴露，
   * 所以现在只能把 3 写死在 JS 里。
   */
  contentsScale: number;
  /**
   * ObjC 里是 `CGColorRef`，JS 侧统一用颜色字符串。读写的注意事项和
   * `borderColor` 完全一样。
   */
  get backgroundColor(): string | null;
  set backgroundColor(value: ColorValue | null);

  // ---- 圆角 ----
  /** 圆角半径。只圆背景；要连内容一起圆，还得 `view.clipsToBounds = true`。 */
  cornerRadius: number;
  /** `'continuous'` 是 Apple 自己在用的超椭圆圆角，过渡比正圆弧顺。默认 `'circular'`。 */
  cornerCurve: CALayerCornerCurve;
  /** 哪几个角要圆。位掩码，所以是字符串数组。默认四个角全圆。 */
  maskedCorners: CACornerMask[];

  borderWidth: number;
  /**
   * ObjC 里是 `CGColorRef`，JS 侧统一用颜色字符串。
   *
   * **读出来是新建的对象**，和写进去的那个 `===` 不成立；而且动态色
   * （`'label'`、`'light-dark(…)'` 这类）在写入的那一刻就被定死，不会再
   * 跟着深浅色变。
   */
  get borderColor(): string | null;
  set borderColor(value: ColorValue | null);

  /** 默认不透明黑。但 `shadowOpacity` 默认是 0，所以只设颜色看不见东西。 */
  get shadowColor(): string | null;
  set shadowColor(value: ColorValue | null);
  /** 默认 0——阴影默认是不显示的。 */
  shadowOpacity: number;
  /** 模糊半径，默认 3。 */
  shadowRadius: number;
  /** 默认 (0, -3)。UIKit 的 y 轴朝下，所以负值是往上偏。 */
  get shadowOffset(): CGSize;
  set shadowOffset(value: CGSizeLike);
}

/**
 * 渐变图层。一条直线（`axial`）、从中心往外（`radial`），或者绕中心转
 * 一圈（`conic`）。
 *
 * 它是个图层，所以和别的子图层一样**要自己设 `frame`**。颜色至少给两个，
 * 不然什么都看不见。
 */
declare class CAGradientLayer extends CALayer {
  constructor();

  /**
   * 渐变经过的颜色，按顺序。
   *
   * 写进去的是字符串（或 `UIColor`），**读出来是字符串，但不一定是写进去
   * 的那个串**：原生存的是 `CGColor`，动态色在写入那一刻就被定死了，
   * 读回来只剩当时解析出的那个具体颜色。
   */
  get colors(): (string | null)[];
  set colors(value: ColorValue[]);
  /** 每个颜色落在 0…1 的哪一处。`null` 表示均匀分布（默认），个数要和 `colors` 对得上。 */
  locations: number[] | null;
  /**
   * 单位坐标，不是点：(0, 0) 是左上角，(1, 1) 是右下角。默认从 (0.5, 0)
   * 到 (0.5, 1)，也就是从上到下。
   *
   * `radial` 时 `startPoint` 是圆心、`endPoint` 定半径；
   * `conic` 时 `startPoint` 是圆心、`endPoint` 定起始角度。
   */
  get startPoint(): CGPoint;
  set startPoint(value: CGPointLike);
  get endPoint(): CGPoint;
  set endPoint(value: CGPointLike);
  type: CAGradientLayerType;
}

/**
 * 画一条路径的图层。折线、扇形、饼图、K 线都靠它。
 *
 * ```js
 * const shape = new CAShapeLayer();
 * shape.path = somePath;
 * shape.strokeColor = 'systemBlue';
 * shape.fillColor = null;        // 默认是**黑色实心**，只要线的话必须设
 * shape.lineWidth = 3;
 * shape.frame = card.bounds;     // 和别的子图层一样要自己设
 * card.layer.addSublayer(shape);
 * ```
 *
 * 它不自己量尺寸：`path` 的坐标就是**图层自己坐标系里的点**，和 `frame`
 * 的大小没有关系，路径超出去的部分照样画（除非 `masksToBounds`）。
 */
declare class CAShapeLayer extends CALayer {
  constructor();

  /**
   * 要画的路径。`null` 表示什么都不画。
   *
   * **写进去的那个对象会原样还回来**——原生存的是 `CGPath`，读回来只能
   * 现包一个新的 `UIBezierPath`，所以 JS 这边记了一份。包装被回收重建过
   * 之后镜像就没了，那时读到的是按原生重建的新对象。
   *
   * 还有一条：存的是**副本**。写进去之后再改那条 `UIBezierPath`，图层
   * 不会跟着变，要再赋值一次。
   */
  get path(): UIBezierPath | null;
  set path(value: UIBezierPath | null);

  // ---- 填 ----
  /** 默认是**黑色**，不是透明：只想要一条线的话记得设成 `null`。 */
  get fillColor(): string | null;
  set fillColor(value: ColorValue | null);
  /** 只在路径自交或者嵌套时看得出区别。默认 `'nonZero'`。 */
  fillRule: CAShapeLayerFillRule;

  // ---- 描 ----
  /** 默认是 `null`，所以只设 `lineWidth` 看不见线。 */
  get strokeColor(): string | null;
  set strokeColor(value: ColorValue | null);
  /** 默认 1。线是**骑在路径上**的，两边各占一半。 */
  lineWidth: number;
  lineCap: CAShapeLayerLineCap;
  lineJoin: CAShapeLayerLineJoin;
  /** 尖角尖到什么程度就削平成 `bevel`。默认 10。 */
  miterLimit: number;
  /**
   * 只描路径的一段，0…1。配动画能做「线一点点画出来」；现在没有动画，
   * 直接设也能当进度条用。
   */
  strokeStart: number;
  strokeEnd: number;
  /** 虚线：画多长、空多长，按顺序循环。`null` 是实线（默认）。 */
  lineDashPattern: number[] | null;
  /** 虚线从哪里开始。默认 0。 */
  lineDashPhase: number;
}
