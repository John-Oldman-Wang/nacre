// iOS 原生符号。规则见 types/ios.d.ts 的说明。
//
// 触感反馈：让手机震一下。

/** 撞击的力度。前三个从轻到重；`soft` 发闷，`rigid` 发脆。 */
type UIImpactFeedbackStyle = 'light' | 'medium' | 'heavy' | 'soft' | 'rigid';

/** 通知的类型。三种的震动节奏不同。 */
type UINotificationFeedbackType = 'success' | 'warning' | 'error';

/**
 * 触感反馈的基类。不能 `new`，也不能直接用，用它的三个子类。
 *
 * 三个子类都**没有构造函数**，只有和视图绑定的工厂方法。
 */
declare class UIFeedbackGenerator extends NSObject {
  protected constructor();
  /**
   * 提前让触感引擎就绪。马上就要触发时先调它（比如手指按下时），真正触发
   * 时的延迟更小。不调也能用。
   */
  prepare(): void;
}

/**
 * 撞击：按钮按下、东西落位、拖到边界。
 *
 * ```js
 * const tick = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('medium', { forView: button });
 * button.addEventListener('touchDown', () => tick.impactOccurred());
 * ```
 */
declare class UIImpactFeedbackGenerator extends UIFeedbackGenerator {
  private constructor();
  static feedbackGeneratorWithStyle(
    style: UIImpactFeedbackStyle,
    options: { forView: UIView },
  ): UIImpactFeedbackGenerator;
  /** 震一下，按创建时给的力度。 */
  impactOccurred(): void;
  /** 震一下。`intensity` 是 0 到 1 之间的比例，1 是这种力度的满强度。 */
  impactOccurredWithIntensity(intensity: number): void;
}

/** 选择变了：滚轮转过一格、滑块经过一个刻度。很轻的一下。 */
declare class UISelectionFeedbackGenerator extends UIFeedbackGenerator {
  private constructor();
  static feedbackGeneratorForView(view: UIView): UISelectionFeedbackGenerator;
  selectionChanged(): void;
}

/** 通知：一件事成功了、要注意、失败了。 */
declare class UINotificationFeedbackGenerator extends UIFeedbackGenerator {
  private constructor();
  static feedbackGeneratorForView(view: UIView): UINotificationFeedbackGenerator;
  notificationOccurred(type: UINotificationFeedbackType): void;
}
