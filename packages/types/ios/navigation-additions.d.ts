// 初稿是 bindgen 生成的（docs/internals/bindgen.md）。之后它是普通的手写文件：直接改，bindgen 不会再碰它。
//
// UINavigationController 补上的成员。navigationBar 定了暂不接；delegate 的回调是事件 beforeshow / show。

interface UINavigationController {
  /** 底部的工具条是不是藏着。默认 `true`。 */
  isToolbarHidden: boolean;
  /** 导航控制器自己管的那条底部工具条。 */
  readonly toolbar: UIToolbar;
  /** 从屏幕左边缘向右划、返回上一页的那个手势。设它的 `isEnabled = false` 就关掉了左滑返回。 */
  readonly interactivePopGestureRecognizer: UIGestureRecognizer | null;
  /** iOS 26 起：在页面内容区任意位置向右划、返回上一页的手势。 */
  readonly interactiveContentPopGestureRecognizer: UIGestureRecognizer | null;
  /** 键盘出现时自动藏起导航条和工具条。默认 `false`。 */
  hidesBarsWhenKeyboardAppears: boolean;
  /** 往上划时藏起导航条和工具条、往下划时再显示。默认 `false`。 */
  hidesBarsOnSwipe: boolean;
  /** `hidesBarsOnSwipe` 用的那个拖动手势。 */
  readonly barHideOnSwipeGestureRecognizer: UIPanGestureRecognizer | null;
  /** 横屏这种高度紧张的时候自动藏起导航条。默认 `false`。 */
  hidesBarsWhenVerticallyCompact: boolean;
  /** 点一下页面就切换导航条和工具条的显示。默认 `false`。 */
  hidesBarsOnTap: boolean;
  /** `hidesBarsOnTap` 用的那个点按手势。 */
  readonly barHideOnTapGestureRecognizer: UITapGestureRecognizer | null;

  /** 藏起或显示工具条，可以带动画。 */
  setToolbarHidden(hidden: boolean, options?: { animated?: boolean }): void;
  /** 显示一个页面。在导航控制器上等同于 `pushViewController`（带动画）。 */
  showViewController(viewController: UIViewController, options?: { sender?: NSObject | null }): void;
}
