// 无障碍：读屏（VoiceOver）要的那一组属性，挂在 UIView 上。

/**
 * 读屏眼里这个元素是什么样的东西。`accessibilityTraits` 是这些名字的数组，
 * 可以同时有好几个（`['button', 'selected']`）。
 */
type UIAccessibilityTraits =
  | 'button' | 'link' | 'header' | 'searchField' | 'image' | 'selected' | 'playsSound'
  | 'keyboardKey' | 'staticText' | 'summaryElement' | 'notEnabled' | 'updatesFrequently'
  | 'startsMediaSession' | 'adjustable' | 'allowsDirectInteraction' | 'causesPageTurn'
  | 'tabBar' | 'toggleButton' | 'supportsZoom';

interface UIView {
  /**
   * 读屏会不会停在这个视图上、把它当成一个整体念。`UIView` 默认 `false`
   * （读屏去念它的子视图），`UILabel`、`UIButton` 这类默认 `true`。
   */
  isAccessibilityElement: boolean;
  /** 读屏念的名字：它是什么。`UILabel`、`UIButton` 没设时取它们显示的文字。 */
  accessibilityLabel: string | null;
  /** 念完名字之后的提示：操作它会怎样。用户可以在设置里关掉提示。 */
  accessibilityHint: string | null;
  /** 现在的值，比如滑块的「50%」。会变的值放这里，不放在名字里。 */
  accessibilityValue: string | null;
  /** 给 UI 自动化测试找元素用的标识。读屏不念。 */
  accessibilityIdentifier: string | null;
  /**
   * 它是什么样的东西：按钮、标题、已选中……读屏按这个决定怎么念、怎么操作。
   * 名字写错时打一条警告，整次赋值不生效；写的不是数组抛 `TypeError`。
   */
  accessibilityTraits: UIAccessibilityTraits[];
  /** 子视图都不给读屏。默认 `false`。 */
  accessibilityElementsHidden: boolean;
  /** 读屏只在这个视图里面转，同一层的别的视图都跳过。弹层用。默认 `false`。 */
  accessibilityViewIsModal: boolean;
  /** 子视图按这个视图分组念，念完一组再念下一组。默认 `false`。 */
  shouldGroupAccessibilityChildren: boolean;
}
