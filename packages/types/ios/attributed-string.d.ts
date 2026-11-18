// 富文本：NSAttributedString / NSMutableAttributedString，段落样式
// NSParagraphStyle / NSMutableParagraphStyle，阴影 NSShadow，图文混排的
// NSTextAttachment，以及显示富文本的那几处（UILabel、UITextField、
// UITextView、UIButton 上的成员，用声明合并加在文件末尾）。
//
// 富文本 = 一段文字 + 每一段上的一组属性（字体、颜色、下划线…）。范围一律
// 用 NSRange，单位是 UTF-16 码元，和 JS 字符串的下标是同一个。

/**
 * 属性的名字。对应 ObjC 的 `NS…AttributeName` 常量，去掉前后的壳、首字母小写：
 * `NSForegroundColorAttributeName` → `'foregroundColor'`。
 */
type NSAttributedStringKey =
  | 'font' | 'paragraphStyle' | 'foregroundColor' | 'backgroundColor'
  | 'ligature' | 'kern' | 'tracking' | 'strikethroughStyle' | 'underlineStyle'
  | 'strokeColor' | 'strokeWidth' | 'shadow' | 'attachment' | 'link'
  | 'baselineOffset' | 'underlineColor' | 'strikethroughColor';

/**
 * 下划线和删除线的画法，写成数组，三类各挑至多一个：
 *
 * - 线型：`'single'`（一条细线）、`'thick'`（一条粗线）、`'double'`（两条细线）
 * - 虚线：`'patternDot'`、`'patternDash'`、`'patternDashDot'`、
 *   `'patternDashDotDot'`；不写是实线
 * - `'byWord'`：只画在词下面，空格下面不画
 *
 * 空数组 `[]` 表示不画线。
 */
type NSUnderlineStyle =
  | 'single' | 'thick' | 'double'
  | 'patternDot' | 'patternDash' | 'patternDashDot' | 'patternDashDotDot'
  | 'byWord';

/**
 * 量尺寸时的选项。
 *
 * - `'usesLineFragmentOrigin'`：按多行排。**量多行文字必须带它**，不带时
 *   按一行算
 * - `'usesFontLeading'`：行高算上字体自带的行间距
 * - `'usesDeviceMetrics'`：按字形实际画出来的范围算，而不是排版用的范围
 * - `'truncatesLastVisibleLine'`：放不下时最后一行按截断算
 */
type NSStringDrawingOptions =
  | 'usesLineFragmentOrigin' | 'usesFontLeading' | 'usesDeviceMetrics'
  | 'truncatesLastVisibleLine';

/**
 * 一段文字从哪边开始排。
 *
 * - `'natural'`：按文字内容自己判断（默认）
 * - `'leftToRight'` / `'rightToLeft'`：固定方向
 */
type NSWritingDirection = 'natural' | 'leftToRight' | 'rightToLeft';

/**
 * **读出来的**一组属性。没有的键不出现。颜色是字符串，和别处读颜色一样。
 */
interface NSAttributedStringAttributes {
  /** 字体。不带时系统用 12 pt 的 Helvetica。 */
  font?: UIFont;
  /** 段落样式：对齐、行距、缩进。读出来的是写入时的一份副本。 */
  paragraphStyle?: NSParagraphStyle;
  /** 文字颜色。不带时是黑色。 */
  foregroundColor?: string;
  /** 文字背后的底色。不带时没有底色。 */
  backgroundColor?: string;
  /** 连字。`1` 用字体默认的连字（默认），`0` 不用。 */
  ligature?: number;
  /** 字距调整，pt。正数拉开，负数收紧。`0` 是关掉字体自带的字距调整。 */
  kern?: number;
  /** 字间距，pt。和 `kern` 的差别：它会连带关掉会被拉断的连字。 */
  tracking?: number;
  /** 删除线。 */
  strikethroughStyle?: NSUnderlineStyle[];
  /** 下划线。 */
  underlineStyle?: NSUnderlineStyle[];
  /** 描边的颜色。不带时和文字颜色相同。 */
  strokeColor?: string;
  /**
   * 描边的粗细，单位是字号的百分比。`0` 不描边；正数只描边不填充（空心字）；
   * 负数既描边又填充。空心字常用 `3`。
   */
  strokeWidth?: number;
  /** 文字的阴影。读出来的是写入时的一份副本。 */
  shadow?: NSShadow;
  /** 这一个字符的位置上显示的附件（图片）。 */
  attachment?: NSTextAttachment;
  /** 链接的地址。 */
  link?: string;
  /** 相对基线上移多少，pt。负数是下移。 */
  baselineOffset?: number;
  /** 下划线的颜色。不带时和文字颜色相同。 */
  underlineColor?: string;
  /** 删除线的颜色。不带时和文字颜色相同。 */
  strikethroughColor?: string;
}

/**
 * **写进去的**一组属性。和读出来的相比宽一些：颜色还收 `UIColor`，`link`
 * 还收 `URL`。
 *
 * - 值是 `undefined` 的键视为没带
 * - 不认识的键抛 `TypeError`，报错里列出全部能用的键
 * - 颜色写错（认不出的字符串）不抛：打一条警告，这个键不生效
 * - 字体、段落样式、阴影、附件必须是对应的类，否则抛 `TypeError`
 */
interface NSAttributedStringAttributesInit {
  font?: UIFont;
  paragraphStyle?: NSParagraphStyle;
  foregroundColor?: ColorValue;
  backgroundColor?: ColorValue;
  ligature?: number;
  kern?: number;
  tracking?: number;
  strikethroughStyle?: readonly NSUnderlineStyle[];
  underlineStyle?: readonly NSUnderlineStyle[];
  strokeColor?: ColorValue;
  strokeWidth?: number;
  shadow?: NSShadow;
  attachment?: NSTextAttachment;
  link?: string | URL;
  baselineOffset?: number;
  underlineColor?: ColorValue;
  strikethroughColor?: ColorValue;
}

/**
 * 段落样式：对齐、行距、段距、缩进、换行方式。作为 `paragraphStyle` 属性
 * 放进富文本里，对它覆盖到的整个段落生效。
 *
 * 这个类的属性全部只读。要改就建一个 `NSMutableParagraphStyle`，或者调
 * `mutableCopy()`。
 */
declare class NSParagraphStyle extends NSObject {
  /** 建出来的是默认样式，和 `NSParagraphStyle.defaultParagraphStyle` 的值相同。 */
  constructor();
  /** 系统的默认段落样式。 */
  static readonly defaultParagraphStyle: NSParagraphStyle;

  /** 对齐。默认 `'natural'`。 */
  readonly alignment: NSTextAlignment;
  /** 行与行之间额外加的距离，pt。默认 `0`。 */
  readonly lineSpacing: number;
  /** 这一段结束后空出的距离，pt。默认 `0`。 */
  readonly paragraphSpacing: number;
  /** 这一段开始前空出的距离，pt。默认 `0`。 */
  readonly paragraphSpacingBefore: number;
  /** 第一行左边缩进多少，pt。默认 `0`。 */
  readonly firstLineHeadIndent: number;
  /** 第一行以外的各行左边缩进多少，pt。默认 `0`。 */
  readonly headIndent: number;
  /**
   * 行的右边界，pt。正数从左边量起，`0` 或负数从右边量起（`-16` 是右边
   * 留 16 pt）。默认 `0`。
   */
  readonly tailIndent: number;
  /** 一行放不下时怎么处理。默认 `'byWordWrapping'`。 */
  readonly lineBreakMode: NSLineBreakMode;
  /** 行高的下限，pt。默认 `0`，不限。 */
  readonly minimumLineHeight: number;
  /** 行高的上限，pt。默认 `0`，不限。 */
  readonly maximumLineHeight: number;
  /** 行高是字体自然行高的几倍。默认 `0`，表示不调整。 */
  readonly lineHeightMultiple: number;
  /** 这一段从哪边开始排。默认 `'natural'`。 */
  readonly baseWritingDirection: NSWritingDirection;
  /** 断字的积极程度，0 到 1。`0` 不断字（默认），`1` 尽量断。 */
  readonly hyphenationFactor: number;
  /** 制表符之间的默认间隔，pt。默认 `0`。 */
  readonly defaultTabInterval: number;
  /** 文字要被截断时，是否允许系统先把字距收紧一点。头文件写的默认值是 `false`。 */
  readonly allowsDefaultTighteningForTruncation: boolean;

  /** 一份属性值相同、可以改的副本。 */
  mutableCopy(): NSMutableParagraphStyle;
  /** 一份属性值相同、不可改的副本。 */
  copy(): NSParagraphStyle;
}

/**
 * 可以改的段落样式。
 *
 * ```js
 * const style = new NSMutableParagraphStyle();
 * style.alignment = 'center';
 * style.lineSpacing = 6;
 * const text = new NSAttributedString('第一行\n第二行', { paragraphStyle: style });
 * ```
 *
 * 放进富文本的是**当时的一份副本**：之后再改 `style`，已经建好的富文本不变。
 */
declare class NSMutableParagraphStyle extends NSParagraphStyle {
  constructor();
  alignment: NSTextAlignment;
  lineSpacing: number;
  paragraphSpacing: number;
  paragraphSpacingBefore: number;
  firstLineHeadIndent: number;
  headIndent: number;
  tailIndent: number;
  lineBreakMode: NSLineBreakMode;
  minimumLineHeight: number;
  maximumLineHeight: number;
  lineHeightMultiple: number;
  baseWritingDirection: NSWritingDirection;
  hyphenationFactor: number;
  defaultTabInterval: number;
  allowsDefaultTighteningForTruncation: boolean;
  /** 把另一个段落样式的全部属性值抄过来。 */
  setParagraphStyle(style: NSParagraphStyle): void;
}

/**
 * 文字的阴影。作为 `shadow` 属性放进富文本里。
 *
 * 放进富文本的是**当时的一份副本**：之后再改这个对象，已经建好的富文本不变。
 */
declare class NSShadow extends NSObject {
  constructor();
  /** 阴影相对文字偏多少，pt。`height` 为正是往下。默认 `(0, 0)`。 */
  get shadowOffset(): CGSize;
  set shadowOffset(value: CGSize | { width: number; height: number });
  /** 模糊半径，pt。`0` 是边缘清晰的阴影。默认 `0`。 */
  shadowBlurRadius: number;
  /**
   * 阴影的颜色。默认是三分之一不透明的黑色；写 `null` 之后不画阴影。
   * 写错的颜色不抛：打一条警告，保留原值。
   */
  get shadowColor(): string | null;
  set shadowColor(value: ColorValue | null);
}

/**
 * 富文本里的一个附件：在一个字符的位置上显示一张图片。
 *
 * ```js
 * const attachment = NSTextAttachment.textAttachmentWithImage(UIImage.systemImageNamed('star.fill'));
 * const text = NSAttributedString.attributedStringWithAttachment(attachment);
 * ```
 */
declare class NSTextAttachment extends NSObject {
  constructor();
  /** 建一个显示这张图片的附件。 */
  static textAttachmentWithImage(image: UIImage): NSTextAttachment;
  /** 显示的图片。 */
  image: UIImage | null;
  /**
   * 图片画在哪、画多大，pt。原点在文字的基线上，`y` 为负是往下移。
   * 默认全是 `0`，表示用图片自己的大小、底边贴着基线。
   */
  get bounds(): CGRect;
  set bounds(value: CGRect | { x: number; y: number; width: number; height: number });
}

/**
 * 富文本：一段文字，加上每一段上的一组属性。建好之后不能改；要改用
 * `NSMutableAttributedString`。
 *
 * ```js
 * const text = new NSAttributedString('重要', {
 *   font: UIFont.boldSystemFontOfSize(17),
 *   foregroundColor: 'systemRed',
 * });
 * label.attributedText = text;
 * ```
 */
declare class NSAttributedString extends NSObject {
  /** 没有文字的富文本。 */
  constructor();
  /** 整段文字用同一组属性。`string` 按字符串转，`null` / `undefined` 是空串。 */
  constructor(string: string, attributes?: NSAttributedStringAttributesInit | null);
  /** 照另一个富文本抄一份。 */
  constructor(attributedString: NSAttributedString);

  /** 只含一个附件的富文本：一个占位字符，带着 `attachment` 属性。 */
  static attributedStringWithAttachment(
    attachment: NSTextAttachment,
    options?: { attributes?: NSAttributedStringAttributesInit | null },
  ): NSAttributedString;

  /** 不带属性的文字。附件的位置上是字符 `￼`。 */
  readonly string: string;
  /** 长度，UTF-16 码元的个数，和 `string.length` 相等。 */
  readonly length: number;

  /** 第 `index` 个码元上的全部属性。`index` 越界抛 `TypeError`。 */
  attributesAtIndex(index: number): NSAttributedStringAttributes;
  /** 第 `atIndex` 个码元上某一个属性的值，没有是 `null`。 */
  attribute<K extends NSAttributedStringKey>(
    name: K,
    options: { atIndex: number },
  ): NonNullable<NSAttributedStringAttributes[K]> | null;
  /**
   * 把 `range` 里的文字按「属性相同的连续一段」切开，每一段调一次 `callback`，
   * 从前往后。`callback` 是当场同步执行的，这个方法返回时已经全部调完。
   * 没有中途停下的办法；遍历的是调用那一刻的内容。
   */
  enumerateAttributesInRange(
    range: NSRangeLike,
    callback: (attributes: NSAttributedStringAttributes, range: NSRange) => void,
  ): void;
  /** 取出一段，属性跟着走。越界抛 `TypeError`。 */
  attributedSubstringFromRange(range: NSRangeLike): NSAttributedString;
  /** 文字和每一处的属性都相同才是 `true`。 */
  isEqualToAttributedString(other: NSAttributedString): boolean;
  /** `range` 里有没有附件。 */
  containsAttachmentsInRange(range: NSRangeLike): boolean;

  /** 排成一行需要多大，pt。 */
  size(): CGSize;
  /**
   * 限定在 `size` 里排，需要多大，pt。量多行文字时 `options` 要带
   * `'usesLineFragmentOrigin'`；某个方向不限就给一个很大的数
   * （`Number.MAX_VALUE`）。结果带小数，用作视图大小时向上取整。
   */
  boundingRectWithSize(
    size: CGSize | { width: number; height: number },
    options?: { options?: readonly NSStringDrawingOptions[] },
  ): CGRect;

  /** 一份内容相同、不可改的副本。 */
  copy(): NSAttributedString;
  /** 一份内容相同、可以改的副本。 */
  mutableCopy(): NSMutableAttributedString;
}

/**
 * 可以改的富文本：给某一段加属性、拼接、替换文字。
 *
 * ```js
 * const text = new NSMutableAttributedString('合计 ¥128.00');
 * text.addAttribute('foregroundColor', { value: 'systemRed', range: new NSRange(3, 7) });
 * label.attributedText = text;
 * ```
 *
 * 视图拿走的是赋值那一刻的内容。之后再改这个对象，视图上显示的不变，
 * 要重新赋值一次。
 */
declare class NSMutableAttributedString extends NSAttributedString {
  constructor();
  constructor(string: string, attributes?: NSAttributedStringAttributesInit | null);
  constructor(attributedString: NSAttributedString);

  /**
   * 把 `range` 里的文字换掉，要给 `withString` 或 `withAttributedString` 中的
   * 一个。换成字符串时，新文字沿用被换掉那一段第一个字符的属性（`range` 的
   * 长度是 0 时沿用前一个字符的）。
   */
  replaceCharactersInRange(
    range: NSRangeLike,
    options: { withString: string } | { withAttributedString: NSAttributedString },
  ): void;
  /** 把 `range` 里的属性**整个换成**这一组，原来有的其他属性被去掉。 */
  setAttributes(
    attributes: NSAttributedStringAttributesInit | null,
    options: { range: NSRangeLike },
  ): void;
  /** 给 `range` 加一个属性，同名的被覆盖，其他属性不动。 */
  addAttribute<K extends NSAttributedStringKey>(
    name: K,
    options: { value: NonNullable<NSAttributedStringAttributesInit[K]>; range: NSRangeLike },
  ): void;
  /** 给 `range` 加一组属性，同名的被覆盖，其他属性不动。 */
  addAttributes(
    attributes: NSAttributedStringAttributesInit,
    options: { range: NSRangeLike },
  ): void;
  /** 去掉 `range` 里的某个属性。本来没有也不报错。 */
  removeAttribute(name: NSAttributedStringKey, options: { range: NSRangeLike }): void;
  /** 接在末尾。 */
  appendAttributedString(attributedString: NSAttributedString): void;
  /** 插在第 `atIndex` 个码元前面。`atIndex` 等于长度时是接在末尾。 */
  insertAttributedString(
    attributedString: NSAttributedString,
    options: { atIndex: number },
  ): void;
  /** 删掉 `range` 里的文字。 */
  deleteCharactersInRange(range: NSRangeLike): void;
  /** 把全部内容换成另一个富文本的内容。 */
  setAttributedString(attributedString: NSAttributedString): void;
}

// ---- 显示富文本的地方 ----
// 这些成员是这个域从自己的文件里加到已有的类上的，所以用声明合并写在这里。

interface UILabel {
  /**
   * 带样式的文字。写了它，`text` 读出来是其中的纯文字。之后再写 `text`，
   * 文字换了，**原来的样式留着**（下划线还在）——和输入框、文本视图不一样。
   * 没有内容时是 `null`。
   *
   * 读出来的是一份快照，每次读可能是不同的对象，用
   * `isEqualToAttributedString()` 比较内容。
   */
  attributedText: NSAttributedString | null;
}

interface UITextField {
  /**
   * 带样式的内容。写了它，`text` 读出来是其中的纯文字；之后再写 `text`，
   * 文字跟着变。读出来的是一份快照，用 `isEqualToAttributedString()` 比较
   * 内容。
   */
  attributedText: NSAttributedString | null;
  /** 带样式的占位文字。写了它，`placeholder` 读出来是其中的纯文字。 */
  attributedPlaceholder: NSAttributedString | null;
}

interface UITextView {
  /**
   * 带样式的内容。读出来的是一份快照。写了它，`text` 读出来是其中的纯文字；
   * 之后再写 `text`，原来的样式被换掉。写 `null` 是清空。代码写它不派发
   * `input`。
   */
  attributedText: NSAttributedString | null;
}

interface UIButton {
  /**
   * 按状态设带样式的标题。某个状态设了它，这个状态下就不再显示 `setTitle()`
   * 给的文字，`setTitleColor()` 的颜色也不起作用。写 `null` 是去掉，这个
   * 状态回到使用 `normal` 的。
   */
  setAttributedTitle(
    title: NSAttributedString | null,
    options: { forState: readonly UIControlStateName[] },
  ): void;
  /**
   * 这个状态用的带样式标题。没单独设过的状态返回 `normal` 的那个，和
   * `titleForState()` 一样；`normal` 也没设过时是 `null`。只认单个状态。
   */
  attributedTitleForState(state: UIControlStateName): NSAttributedString | null;
  /** 当前状态下实际显示的带样式标题，没有是 `null`。 */
  readonly currentAttributedTitle: NSAttributedString | null;
}
