// iOS 原生符号。规则见 types/ios.d.ts 的说明。
//
// 继承链的根。

// ---------------------------------------------------------------------------
// 基础类
// ---------------------------------------------------------------------------

/**
 * ObjC 的根类，所以也是这里所有原生类的根。
 *
 * 它继承 EventTarget：原生对象要发事件是常态，抽到基类，不让每个类各自
 * 发明一套回调。
 */
declare class NSObject extends EventTarget {
  /** protected 而不是 private：自己不可构造，但原生子类要能 super()。 */
  protected constructor();
}

declare class UIResponder extends NSObject {
  protected constructor();

  /**
   * 成为 first responder——输入框弹键盘就靠它。
   *
   * 返回「成没成」：系统可能拒绝（比如视图还没上屏），别忽略返回值。
   */
  becomeFirstResponder(): boolean;
  resignFirstResponder(): boolean;
  readonly isFirstResponder: boolean;
  readonly canBecomeFirstResponder: boolean;
}
