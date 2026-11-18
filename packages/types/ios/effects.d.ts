// iOS 原生符号。规则见 types/ios.d.ts 的说明。
//
// 毛玻璃：UIVisualEffectView，和它显示的效果。

/**
 * 模糊的样式。
 *
 * - 以 `system` 开头的十五种是「材质」，从薄到厚：`UltraThin` 透得最多，
 *   `Thick` 最不透，`Chrome` 是系统的工具栏用的那种。不带后缀的跟随深浅色，
 *   带 `Light` / `Dark` 后缀的固定成浅色 / 深色
 * - `regular`、`prominent` 是早期的两种，也跟随深浅色
 * - `extraLight`、`light`、`dark` 是最早的三种，不跟随深浅色
 */
type UIBlurEffectStyle =
  | 'extraLight' | 'light' | 'dark' | 'regular' | 'prominent'
  | 'systemUltraThinMaterial' | 'systemThinMaterial' | 'systemMaterial'
  | 'systemThickMaterial' | 'systemChromeMaterial'
  | 'systemUltraThinMaterialLight' | 'systemThinMaterialLight' | 'systemMaterialLight'
  | 'systemThickMaterialLight' | 'systemChromeMaterialLight'
  | 'systemUltraThinMaterialDark' | 'systemThinMaterialDark' | 'systemMaterialDark'
  | 'systemThickMaterialDark' | 'systemChromeMaterialDark';

/**
 * 鲜明效果的样式，按内容是什么来选。
 *
 * - 文字：`label`、`secondaryLabel`、`tertiaryLabel`、`quaternaryLabel`，依次变淡
 * - 填充的色块：`fill`、`secondaryFill`、`tertiaryFill`，依次变淡
 * - 分隔线：`separator`
 */
type UIVibrancyEffectStyle =
  | 'label' | 'secondaryLabel' | 'tertiaryLabel' | 'quaternaryLabel'
  | 'fill' | 'secondaryFill' | 'tertiaryFill' | 'separator';

/** 玻璃的样式。`regular` 是标准的那种，`clear` 是透明的那种。 */
type UIGlassEffectStyle = 'regular' | 'clear';

/**
 * 效果的基类。不能 `new`，用它的子类。
 *
 * 效果自己不显示任何东西，要交给 `UIVisualEffectView` 才看得见。
 */
declare class UIVisualEffect extends NSObject {
  protected constructor();
  /** 只给类型检查用：让「不是效果的对象」赋不进 `effect`。运行时没有这个成员。 */
  private readonly __visualEffect: void;
}

/**
 * 模糊：把视图后面的画面糊掉。
 *
 * ```js
 * const blur = UIBlurEffect.effectWithStyle('systemMaterial');
 * const panel = new UIVisualEffectView(blur);
 * ```
 *
 * 不可变。同一个对象可以给多个视图用。
 */
declare class UIBlurEffect extends UIVisualEffect {
  private constructor();
  /** 只给类型检查用：让别的效果传不进要模糊效果的地方。运行时没有这个成员。 */
  private readonly __blurEffect: void;
  /** 每次调用得到一个新的对象，同一种样式也是。 */
  static effectWithStyle(style: UIBlurEffectStyle): UIBlurEffect;
}

/**
 * 鲜明：让放在模糊上面的文字和图标透出底下的颜色，不是平平的一层灰。
 *
 * 它照着一个模糊效果来建，用在**另一个**效果视图上，那个视图放在模糊视图的
 * `contentView` 里：
 *
 * ```js
 * const blur = UIBlurEffect.effectWithStyle('systemMaterial');
 * const panel = new UIVisualEffectView(blur);
 * const vivid = new UIVisualEffectView(
 *   UIVibrancyEffect.effectForBlurEffect(blur, { style: 'label' }));
 * panel.contentView.addSubview(vivid);
 * vivid.contentView.addSubview(label);   // 字放在鲜明那一层的 contentView 里
 * ```
 */
declare class UIVibrancyEffect extends UIVisualEffect {
  private constructor();
  /**
   * `blurEffect` 是底下那块模糊用的效果。不给 `style` 时是 iOS 13 之前的那种
   * 鲜明效果；配 `system…Material` 的模糊时给一个 `style`。
   */
  static effectForBlurEffect(
    blurEffect: UIBlurEffect,
    options?: { style?: UIVibrancyEffectStyle },
  ): UIVibrancyEffect;
}

/**
 * 玻璃（iOS 26 的新材质）。
 *
 * ```js
 * const glass = UIGlassEffect.effectWithStyle('regular');
 * glass.tintColor = 'rgba(255, 45, 85, 0.35)';
 * const chip = new UIVisualEffectView(glass);
 * ```
 *
 * **效果视图存的是赋值那一刻的副本。** 赋值之后再改这个对象，视图不跟着变，
 * 要重新赋一次；从视图读回来的也是一份副本，不是写进去的那个对象。
 */
declare class UIGlassEffect extends UIVisualEffect {
  private constructor();
  static effectWithStyle(style: UIGlassEffectStyle): UIGlassEffect;
  /** 手指按上去时玻璃要不要有反应。默认 `false`。 */
  isInteractive: boolean;
  /** 给玻璃染的颜色。默认 `null`（不染）。读出来是字符串。 */
  get tintColor(): string | null;
  set tintColor(value: ColorValue | null);
}

/**
 * 玻璃容器（iOS 26）：把几块玻璃合成一组来画，靠得够近的会融在一起。
 *
 * 用法是把它给一个效果视图，再把几个用 `UIGlassEffect` 的效果视图放进这个
 * 视图的 `contentView`。
 *
 * 和 `UIGlassEffect` 一样，效果视图存的是赋值那一刻的副本。
 */
declare class UIGlassContainerEffect extends UIVisualEffect {
  constructor();
  /** 两块玻璃相距多近开始融合，单位是点。默认 0。不能是负数。 */
  spacing: number;
}

/**
 * 把一个效果显示出来的视图。
 *
 * **内容加在 `contentView` 上，不加在它自己上面**——`addSubview` /
 * `insertSubview` 直接加会抛 `TypeError`：
 *
 * ```js
 * const panel = new UIVisualEffectView(UIBlurEffect.effectWithStyle('systemMaterial'));
 * panel.contentView.addSubview(label);
 * ```
 *
 * 默认不裁剪。要圆角就设 `layer.cornerRadius` 并打开 `clipsToBounds`。
 */
declare class UIVisualEffectView extends UIView {
  /** 效果可以不给，之后再设 `effect`。 */
  constructor(effect?: UIVisualEffect | null);
  /**
   * 显示哪个效果。`null` 是没有效果。
   *
   * 模糊和鲜明读回来是写进去的那个对象。玻璃和玻璃容器读回来是一份副本，
   * 每次读都是新的对象。
   */
  effect: UIVisualEffect | null;
  /** 放内容的视图，大小跟着效果视图走。换效果、清效果都还是同一个。 */
  readonly contentView: UIView;
}
