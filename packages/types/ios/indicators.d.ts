// iOS 原生符号。规则见 types/ios.d.ts 的说明。
//
// 表示「正在进行」的两个视图：转圈和进度条。

/**
 * 转圈的大小。
 *
 * - `'medium'` —— 20 × 20 pt
 * - `'large'` —— 37 × 37 pt
 *
 * ObjC 里另外三个值（`whiteLarge` / `white` / `gray`）从 iOS 13 起废弃，没有接。
 */
type UIActivityIndicatorViewStyle = 'medium' | 'large';

/**
 * 进度条的样式，决定它的高度。
 *
 * - `'default'` —— 高 4 pt
 * - `'bar'` —— 更细，给工具栏里用的
 */
type UIProgressViewStyle = 'default' | 'bar';

/**
 * 转圈：一件事正在进行、但不知道还要多久时显示它。
 *
 * **新建的转圈是隐藏的**，调 `startAnimating()` 它才显示出来并开始转，调
 * `stopAnimating()` 它停下并隐藏。
 *
 * 新建的转圈 `frame` 是 0 × 0。用 Auto Layout 定位时不用给宽高，它按样式
 * 给出自己的大小；用 `frame` 定位时调一次 `sizeToFit()`。
 *
 * ```js
 * const spinner = new UIActivityIndicatorView();
 * spinner.startAnimating();
 * // ……事情做完了
 * spinner.stopAnimating();
 * ```
 *
 * 它不是控件，没有事件。
 */
declare class UIActivityIndicatorView extends UIView {
  constructor();
  /**
   * 默认 `'medium'`。换样式只改它想要的大小（`intrinsicContentSize`），
   * `frame` 不跟着变，颜色也不变。
   */
  activityIndicatorViewStyle: UIActivityIndicatorViewStyle;
  /**
   * 默认 `true`：没在转的时候隐藏（由它来写 `isHidden`）。`false`：停下之后
   * 留在屏幕上，是一个不动的转圈。
   *
   * 改它当场生效：没在转的时候写 `false` 立刻显示出来，写回 `true` 立刻隐藏。
   */
  hidesWhenStopped: boolean;
  /**
   * 转圈的颜色。默认 `'secondaryLabel'`。读出来永远有值；写 `null` 是退回
   * 默认颜色。
   */
  get color(): string;
  set color(value: ColorValue | null);
  /** 是不是在转。只由 `startAnimating()` / `stopAnimating()` 改变。 */
  readonly isAnimating: boolean;
  /** 开始转。`hidesWhenStopped` 是 `true` 时同时把它显示出来。已经在转时调没有效果。 */
  startAnimating(): void;
  /** 停下。`hidesWhenStopped` 是 `true` 时同时把它隐藏。没在转时调没有效果。 */
  stopAnimating(): void;
}

/**
 * 进度条：一件事完成了多少。一条横线，左边一段是已完成的部分。
 *
 * 高度由样式决定（`'default'` 是 4 pt），**写 `frame` 改不了高度**，只有宽度
 * 写得进去。要更粗的进度条，加一条高度约束。
 *
 * ```js
 * const bar = new UIProgressView();
 * bar.progress = 0.25;
 * bar.setProgress(0.5, { animated: true });
 * ```
 *
 * 它不是控件：不能拖，没有事件。
 */
declare class UIProgressView extends UIView {
  constructor();
  /** 默认 `'default'`。 */
  progressViewStyle: UIProgressViewStyle;
  /**
   * 完成的比例，0 到 1。默认 0。小于 0 的按 0，大于 1 的按 1，不抛。
   *
   * 存的是 32 位浮点数：写 `0.3` 读回来是 `0.30000001192092896`
   * （`Math.fround(0.3)`）。要比较就和 `Math.fround()` 的结果比。
   *
   * 写这个属性不带动画，要动画用 `setProgress()`。
   */
  progress: number;
  /**
   * 改进度。`animated` 是 `true` 时进度条滑到新位置，不传或 `false` 时直接跳过去。
   *
   * 带动画时 `progress` 属性当场就是新的值，不是滑到一半的值。
   */
  setProgress(progress: number, options?: { animated?: boolean }): void;
  /**
   * 已完成部分的颜色。默认 `null`：没有单独设，用系统默认的颜色。
   *
   * 和 `progressImage` 二选一：写入一个颜色时，`progressImage` 变成 `null`。
   */
  get progressTintColor(): string | null;
  set progressTintColor(value: ColorValue | null);
  /**
   * 未完成部分的颜色。默认 `null`：没有单独设，用系统默认的颜色。
   *
   * 和 `trackImage` 二选一：写入一个颜色时，`trackImage` 变成 `null`。
   */
  get trackTintColor(): string | null;
  set trackTintColor(value: ColorValue | null);
  /**
   * 已完成部分用的图片。默认 `null`。
   *
   * 和 `progressTintColor` 二选一：写了图片，`progressTintColor` 变成 `null`。
   */
  progressImage: UIImage | null;
  /**
   * 未完成部分用的图片。默认 `null`。
   *
   * 和 `trackTintColor` 二选一：写了图片，`trackTintColor` 变成 `null`。
   */
  trackImage: UIImage | null;
}
