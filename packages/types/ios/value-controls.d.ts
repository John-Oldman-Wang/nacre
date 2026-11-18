// iOS 原生符号。规则见 types/ios.d.ts 的说明。
//
// 数值控件：开关、滑块、步进器、分段选择、页码、日期选择器。
// 六个都是 UIControl 的子类，「值变了」听 `change`。

/** 滑块的样式。`thumbless` 没有那个圆钮，一般用在播放进度上。 */
type UISliderStyle = 'default' | 'thumbless';

/**
 * 页码背后那块底的样式。`automatic` 平时不显示、手指按上去才出现；
 * `prominent` 一直显示；`minimal` 一直不显示。
 */
type UIPageControlBackgroundStyle = 'automatic' | 'prominent' | 'minimal';

/** 页码的圆点往哪个方向排。`natural` 跟系统语言走（中文、英文是从左到右）。 */
type UIPageControlDirection =
  | 'natural' | 'leftToRight' | 'rightToLeft' | 'topToBottom' | 'bottomToTop';

/** 最近一次换页是怎么换的：没换过、点了一下、拖过去的。 */
type UIPageControlInteractionState = 'none' | 'discrete' | 'continuous';

/**
 * 日期选择器选什么。
 *
 * `countDownTimer`（选一段时长）和 `yearAndMonth` 只有滚轮样式，
 * 配 `compact` 或 `inline` 会抛。
 */
type UIDatePickerMode = 'time' | 'date' | 'dateAndTime' | 'countDownTimer' | 'yearAndMonth';

/**
 * 日期选择器的样式。
 *
 * - `wheels`：几列滚轮，直接嵌在页面里
 * - `compact`：一个小按钮，点了弹出日历
 * - `inline`：日历直接铺在页面里
 * - `automatic`：系统选（iPhone 上是 `compact`；倒计时和年月是 `wheels`）
 */
type UIDatePickerStyle = 'automatic' | 'wheels' | 'compact' | 'inline';

/**
 * 开关。
 *
 * ```js
 * const sw = new UISwitch();
 * sw.isOn = true;
 * sw.addEventListener('change', () => console.log(sw.isOn));
 * ```
 *
 * 大小由系统定，写 `frame` 的宽高不起作用。
 */
declare class UISwitch extends UIControl {
  constructor();

  /** 开着还是关着。默认 `false`。程序写它不派发 `change`。 */
  isOn: boolean;
  /** 和写 `isOn` 的差别只是可以带动画。`animated` 不带就是不要动画。 */
  setOn(on: boolean, options?: { animated?: boolean }): void;

  /** 开着的时候轨道的颜色。`null` 是系统的绿色。 */
  get onTintColor(): string | null;
  set onTintColor(value: ColorValue | null);
  /** 那个圆钮的颜色。`null` 是系统默认。 */
  get thumbTintColor(): string | null;
  set thumbTintColor(value: ColorValue | null);
}

/**
 * 滑块：在一个范围里拖着选一个数。
 *
 * ```js
 * const slider = new UISlider();
 * slider.maximumValue = 100;
 * slider.value = 40;
 * slider.addEventListener('change', () => console.log(slider.value));
 * ```
 *
 * 三个值在原生是 32 位浮点数：写 0.3 读回来是 0.30000001192092896。
 */
declare class UISlider extends UIControl {
  constructor();

  /** 当前的值。默认 0。超出范围的值被钉在两头。 */
  value: number;
  /** 默认 0。 */
  minimumValue: number;
  /** 默认 1。 */
  maximumValue: number;
  /** 和写 `value` 的差别只是可以带动画。 */
  setValue(value: number, options?: { animated?: boolean }): void;
  /**
   * `true`（默认）：拖动途中一直派发 `change`；
   * `false`：只在松手时派发一次。
   */
  isContinuous: boolean;
  sliderStyle: UISliderStyle;

  /** 圆钮左边那一段轨道的颜色。`null` 是系统默认。 */
  get minimumTrackTintColor(): string | null;
  set minimumTrackTintColor(value: ColorValue | null);
  /** 圆钮右边那一段轨道的颜色。 */
  get maximumTrackTintColor(): string | null;
  set maximumTrackTintColor(value: ColorValue | null);
  get thumbTintColor(): string | null;
  set thumbTintColor(value: ColorValue | null);

  /** 轨道左头外面的图（比如小音量的喇叭）。默认 `null`。 */
  minimumValueImage: UIImage | null;
  /** 轨道右头外面的图。 */
  maximumValueImage: UIImage | null;

  /**
   * 把圆钮、左段轨道、右段轨道换成图，按状态设，写法和
   * `UIButton.setImage` 一样。缺了 `forState` 会抛。
   */
  setThumbImage(image: UIImage | null, options: { forState: readonly UIControlStateName[] }): void;
  setMinimumTrackImage(
    image: UIImage | null,
    options: { forState: readonly UIControlStateName[] },
  ): void;
  setMaximumTrackImage(
    image: UIImage | null,
    options: { forState: readonly UIControlStateName[] },
  ): void;
  /** 没设过的状态回退到 `normal` 那张；`normal` 也没设过是 `null`。 */
  thumbImageForState(state: UIControlStateName): UIImage | null;
  minimumTrackImageForState(state: UIControlStateName): UIImage | null;
  maximumTrackImageForState(state: UIControlStateName): UIImage | null;
  readonly currentThumbImage: UIImage | null;
  readonly currentMinimumTrackImage: UIImage | null;
  readonly currentMaximumTrackImage: UIImage | null;

  /**
   * 各部分画在哪，坐标是滑块自己的坐标系。`bounds` 一般传 `slider.bounds`。
   *
   * 用处是把别的东西对到圆钮上，比如拖动时跟着走的数值气泡。
   */
  trackRectForBounds(bounds: CGRectLike): CGRect;
  minimumValueImageRectForBounds(bounds: CGRectLike): CGRect;
  maximumValueImageRectForBounds(bounds: CGRectLike): CGRect;
  /** `trackRect` 传 `trackRectForBounds` 的结果，`value` 是要问的那个值。 */
  thumbRectForBounds(
    bounds: CGRectLike,
    options: { trackRect: CGRectLike; value: number },
  ): CGRect;
}

/**
 * 步进器：一个减号一个加号，点一下加减一档。
 *
 * ```js
 * const stepper = new UIStepper();
 * stepper.maximumValue = 10;
 * stepper.addEventListener('change', () => console.log(stepper.value));
 * ```
 */
declare class UIStepper extends UIControl {
  constructor();

  /** 默认 0。超出范围的值被钉在两头。 */
  value: number;
  /** 默认 0。 */
  minimumValue: number;
  /** 默认 100。 */
  maximumValue: number;
  /** 点一下加减多少。默认 1。必须大于 0，否则抛。 */
  stepValue: number;
  /** `true`（默认）：按住连加时每加一次都派发 `change`；`false`：松手才派发。 */
  isContinuous: boolean;
  /** 按住不放时连续加减。默认 `true`。 */
  autorepeat: boolean;
  /** 加到头再点回到最小值，反过来也是。默认 `false`。 */
  wraps: boolean;
}

/**
 * 分段选择：横着排开的几段，一次选中一段。
 *
 * ```js
 * const seg = new UISegmentedControl(['日', '周', '月']);
 * seg.selectedSegmentIndex = 0;
 * seg.addEventListener('change', () => console.log(seg.selectedSegmentIndex));
 * ```
 *
 * 每一段是一个标题或者一张图，二选一。下标从 0 数；下标越界会抛。
 */
declare class UISegmentedControl extends UIControl {
  /** 每一项是标题或者图，可以混着给。不给就是一段都没有。 */
  constructor(items?: readonly (string | UIImage)[] | null);

  readonly numberOfSegments: number;
  /** 选中的是第几段。`-1` 是一段都没选中（刚建出来就是这样）。 */
  selectedSegmentIndex: number;
  /** `true`：点完不保持选中，当一排按钮用。默认 `false`。 */
  isMomentary: boolean;
  /** `true`：每段的宽按内容分；`false`（默认）：各段等宽。 */
  apportionsSegmentWidthsByContent: boolean;
  /** 选中的那一段底下那块的颜色。`null` 是系统默认。 */
  get selectedSegmentTintColor(): string | null;
  set selectedSegmentTintColor(value: ColorValue | null);

  /** 插在第 `atIndex` 段前面。`atIndex` 超过段数就插在最后。 */
  insertSegmentWithTitle(
    title: string | null,
    options: { atIndex: number; animated?: boolean },
  ): void;
  insertSegmentWithImage(
    image: UIImage | null,
    options: { atIndex: number; animated?: boolean },
  ): void;
  removeSegmentAtIndex(index: number, options?: { animated?: boolean }): void;
  removeAllSegments(): void;

  /** 给一段设了标题，它原来的图就没了。 */
  setTitle(title: string | null, options: { forSegmentAtIndex: number }): void;
  titleForSegmentAtIndex(index: number): string | null;
  /** 给一段设了图，它原来的标题就没了。 */
  setImage(image: UIImage | null, options: { forSegmentAtIndex: number }): void;
  imageForSegmentAtIndex(index: number): UIImage | null;
  /** 这一段的宽，点。0（默认）是自动。 */
  setWidth(width: number, options: { forSegmentAtIndex: number }): void;
  widthForSegmentAtIndex(index: number): number;
  /** 把这一段里的标题或图挪一点，点。`width` 往右，`height` 往下。默认 0, 0。 */
  setContentOffset(offset: CGSizeLike, options: { forSegmentAtIndex: number }): void;
  contentOffsetForSegmentAtIndex(index: number): CGSize;
  /** 单独禁用一段。默认每段都可用。 */
  setEnabled(enabled: boolean, options: { forSegmentAtIndex: number }): void;
  isEnabledForSegmentAtIndex(index: number): boolean;
}

/**
 * 页码：一排小圆点，表示「一共几页、现在第几页」。
 *
 * ```js
 * const pages = new UIPageControl();
 * pages.numberOfPages = 5;
 * pages.addEventListener('change', () => console.log(pages.currentPage));
 * ```
 *
 * 它只管显示和点选，不会替你翻页——收到 `change` 之后自己去滚动内容。
 */
declare class UIPageControl extends UIControl {
  constructor();

  /** 默认 0。负数会抛。 */
  numberOfPages: number;
  /** 现在第几页，从 0 数。超出范围的值被钉到 0 和最后一页之间。 */
  currentPage: number;
  /** 只有一页时把自己藏起来。默认 `false`。 */
  hidesForSinglePage: boolean;
  /** 能不能按住这排点左右拖着翻页。默认 `true`。 */
  allowsContinuousInteraction: boolean;
  backgroundStyle: UIPageControlBackgroundStyle;
  direction: UIPageControlDirection;
  readonly interactionState: UIPageControlInteractionState;

  /** 不是当前页的那些点的颜色。`null` 是系统默认。 */
  get pageIndicatorTintColor(): string | null;
  set pageIndicatorTintColor(value: ColorValue | null);
  /** 当前页那个点的颜色。 */
  get currentPageIndicatorTintColor(): string | null;
  set currentPageIndicatorTintColor(value: ColorValue | null);

  /** 把所有的点换成这张图。默认 `null`（圆点）。 */
  preferredIndicatorImage: UIImage | null;
  /** 当前页那个点用的图。`null` 时和别的点用同一张。 */
  preferredCurrentPageIndicatorImage: UIImage | null;
  /** 单独给某一页换图。给 `null` 回到默认。页码越界会抛。 */
  setIndicatorImage(image: UIImage | null, options: { forPage: number }): void;
  /** 没单独设过的页是 `null`。 */
  indicatorImageForPage(page: number): UIImage | null;
  setCurrentPageIndicatorImage(image: UIImage | null, options: { forPage: number }): void;
  currentPageIndicatorImageForPage(page: number): UIImage | null;

  /** 放得下这么多页至少要多大，点。负数会抛。 */
  sizeForNumberOfPages(pageCount: number): CGSize;
}

/**
 * 日期选择器。日期在 JS 这一侧是 `Date`。
 *
 * ```js
 * const picker = new UIDatePicker();
 * picker.datePickerMode = 'date';
 * picker.addEventListener('change', () => console.log(picker.date));
 * ```
 */
declare class UIDatePicker extends UIControl {
  constructor();

  /**
   * 选中的日期和时间。默认是创建那一刻。每次读得到一个新的 `Date` 对象。
   *
   * 只收 `Date`，不从字符串或时间戳转；无效的 `Date` 会抛。
   * 超出 `minimumDate` 到 `maximumDate` 的值被钉在两头。
   */
  date: Date;
  /** 和写 `date` 的差别只是可以带动画。 */
  setDate(date: Date, options?: { animated?: boolean }): void;
  /** 能选的最早的时刻。默认 `null`（不限）。 */
  minimumDate: Date | null;
  /** 能选的最晚的时刻。默认 `null`（不限）。 */
  maximumDate: Date | null;

  /** 默认 `'dateAndTime'`。 */
  datePickerMode: UIDatePickerMode;
  /** 想要的样式。默认 `'automatic'`。 */
  preferredDatePickerStyle: UIDatePickerStyle;
  /** 实际用的样式，不会是 `'automatic'`。 */
  readonly datePickerStyle: Exclude<UIDatePickerStyle, 'automatic'>;

  /**
   * 倒计时模式下选中的时长，**秒**。只能在 `datePickerMode` 是
   * `'countDownTimer'` 时写，范围 0 到 86399；不足一分钟的零头会被丢掉。
   */
  countDownDuration: number;
  /** 分钟那一栏隔几分钟一档。默认 1。必须能整除 60，并且在 1 到 30 之间。 */
  minuteInterval: number;
  /** 日期是不是总取整到 `minuteInterval` 上。默认 `true`。 */
  roundsToMinuteInterval: boolean;
}
