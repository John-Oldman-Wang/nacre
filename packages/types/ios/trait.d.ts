// 外观特征（trait）：当前环境是深色还是浅色、屏幕几倍、文字多大。

/**
 * 一组「当前环境是什么样」的值。从视图、页面或场景的 `traitCollection` 读，
 * 全部只读，不能自己建。
 *
 * ```js
 * if (view.traitCollection.userInterfaceStyle === 'dark') {
 *   // 现在是深色
 * }
 * ```
 *
 * 每次读 `traitCollection` 得到的是当时的值，不会自己跟着变。要在变化时
 * 得到通知，监听 `traitchange` 事件。
 */
declare class UITraitCollection extends NSObject {
  private constructor();
  /** 深色还是浅色。 */
  readonly userInterfaceStyle: UIUserInterfaceStyle;
  /** 屏幕上 1 pt 等于几个像素。现在的 iPhone 是 3。 */
  readonly displayScale: number;
  /** 用户在系统设置里选的文字大小。 */
  readonly preferredContentSizeCategory: UIContentSizeCategory;
  /** 横向地方宽不宽裕。 */
  readonly horizontalSizeClass: UIUserInterfaceSizeClass;
  /** 纵向地方宽不宽裕。 */
  readonly verticalSizeClass: UIUserInterfaceSizeClass;
  /** 用户有没有打开「增强对比度」。 */
  readonly accessibilityContrast: UIAccessibilityContrast;
  /** 文字从左往右还是从右往左。 */
  readonly layoutDirection: UITraitEnvironmentLayoutDirection;
}

/** `traitchange` 事件。 */
interface UITraitChangeEvent extends Event {
  /** 变化之前的那一组值。现在的值从 `event.target.traitCollection` 读。 */
  readonly previousTraitCollection: UITraitCollection;
}
