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

/** 那四个事件的事件对象。 */
declare class UIViewControllerAppearanceEvent extends Event {
  constructor(type: string, init?: EventInit & Partial<Pick<UIViewControllerAppearanceEvent, 'animated'>>);
  /** 这一次出现或消失带不带转场动画。 */
  readonly animated: boolean;
}

// 合并进页面的事件表，页面的子类（导航控制器、tab 控制器……）跟着继承
interface UIViewControllerEventMap {
  'beforeappear': UIViewControllerAppearanceEvent;
  'appear': UIViewControllerAppearanceEvent;
  'beforedisappear': UIViewControllerAppearanceEvent;
  'disappear': UIViewControllerAppearanceEvent;
}
