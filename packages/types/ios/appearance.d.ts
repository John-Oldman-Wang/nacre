// iOS 原生符号。规则见 types/ios.d.ts 的说明。
//
// 页面的出现和消失：四个事件，挂在 UIViewController 和它的子类上。

/**
 * 页面出现和消失的四个事件。
 *
 * - `'beforeappear'` —— 页面的视图即将出现在屏幕上
 * - `'appear'` —— 页面的视图已经出现，转场动画结束了
 * - `'beforedisappear'` —— 页面的视图即将离开屏幕
 * - `'disappear'` —— 页面的视图已经离开屏幕
 *
 * 「出现」不只是第一次：从下一页返回、盖在上面的全屏页面关掉、切回这个标签，
 * 都会再派发一遍。
 */
type UIViewControllerAppearanceEventType =
  | 'beforeappear' | 'appear' | 'beforedisappear' | 'disappear';

/**
 * 那四个事件的事件对象。
 *
 * 页面的 `addEventListener` 没有为这四个名字单独声明回调的类型（几个页面
 * 子类各自重新声明过它，加不进去），回调收到的类型是普通的 `Event`。要读
 * `animated` 时，用 JSDoc 的 `@type` 把事件对象标成这个类型（写法见 API 文档）。
 */
declare interface UIViewControllerAppearanceEvent extends Event {
  /** 这一次出现或消失带不带转场动画。 */
  readonly animated: boolean;
}
