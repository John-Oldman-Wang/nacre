// 多行输入：UITextView、它的 NSTextContainer，和表示选区的结构体 NSRange。
//
// UITextView **是 UIScrollView**，不是 UIControl：滚动视图的属性和事件都在，
// 那 16 个控件事件没有。自己的事件是四个：focus / blur / input /
// selectionchange。

/**
 * 一段文字的范围：从 `location` 开始的 `length` 个 UTF-16 码元。
 *
 * 单位和 JS 字符串的下标是同一个，所以
 * `text.slice(range.location, range.location + range.length)` 取出来的就是
 * 这一段。一个表情占两个。`length` 为 0 表示光标。
 *
 * 和别的结构体一样，字段**只读**，写入直接抛 `TypeError`；要改就整体赋一个
 * 新的。两个字段都是非负整数：给小数向零取整，给负数抛 `TypeError`。
 */
declare class NSRange {
  constructor(location: number, length: number);
  readonly location: number;
  readonly length: number;
}

/** 写入时也收带同样字段的普通对象；读出来永远是 `NSRange`。 */
type NSRangeLike = NSRange | { location: number; length: number };

/**
 * `UITextView` 自己的四个事件。滚动视图的那八个它也有。
 *
 * `selectionchange`：选区或者光标的位置变了。用户移动光标、拖动选区、打字，
 * 以及代码写 `selectedRange`，都会派发。事件对象上不带选区，读
 * `event.target.selectedRange`；事件延后一轮派发，读到的是那一刻的选区。
 */
type UITextViewEventType = 'focus' | 'blur' | 'input' | 'selectionchange';

/**
 * 多行输入框上每个事件名对应的事件对象：滚动视图的那些，加上自己的四个。
 * 系统当场来问的四个（`beforeinput` 这些）在 text-view-should.d.ts 里合并进来。
 */
interface UITextViewEventMap extends UIScrollViewEventMap {
  'focus': Event;
  'blur': Event;
  'input': Event;
  'selectionchange': Event;
}

/**
 * 文字排在哪一块区域里。不能构造——每个 `UITextView` 自带一个，从
 * `textView.textContainer` 拿。
 */
declare class NSTextContainer extends NSObject {
  private constructor();
  /**
   * 每一行左右各空出多少，点。默认 `5`：文字比 `textContainerInset` 给的
   * 左边距再往里 5 pt。要和别的视图左对齐时设成 `0`。
   */
  lineFragmentPadding: number;
  /** 最多排几行。默认 `0`，不限。超出的不显示，`text` 本身不会被截掉。 */
  maximumNumberOfLines: number;
  /** 排不下时怎么处理。默认 `'byWordWrapping'`。 */
  lineBreakMode: NSLineBreakMode;
}

/**
 * 多行输入。
 *
 * ```js
 * const input = new UITextView();
 * input.font = UIFont.systemFontOfSize(16);
 * input.keyboardDismissMode = 'onDrag';
 * input.addEventListener('input', () => console.log(input.text));
 * ```
 *
 * 它是 `UIScrollView`：内容超过自己的高度就能滚，`keyboardDismissMode` 这些
 * 滚动视图的成员都在。把 `isScrollEnabled` 设成
 * `false` 之后它有固有大小，用约束定位时不给高度，高度跟着文字走。
 *
 * 代码写 `text` **不派发** `input`；用户打字、`insertText()`、
 * `deleteBackward()` 派发。
 */
declare class UITextView extends UIScrollView {
  constructor();

  /** 全部文字。写 `null` / `undefined` 得到空串。写完光标在末尾。 */
  text: string;
  /** 有没有内容。 */
  readonly hasText: boolean;
  /** 按用户打字的规矩改内容：插在光标处，有选区就换掉选中的那一段。 */
  insertText(text: string): void;
  /** 有选区就删掉选中的，没有就删光标前面那一个。 */
  deleteBackward(): void;

  /** 没设过是 `null`，这时用系统的默认字体。 */
  font: UIFont | null;
  /** 默认 `'label'`。写过 `null` 之后读出来是 `null`。 */
  get textColor(): string | null;
  set textColor(value: ColorValue | null);
  /** 默认 `'natural'`。 */
  textAlignment: NSTextAlignment;
  /** 文字离四边多远，点。默认上下各 `8`、左右 `0`。 */
  get textContainerInset(): UIEdgeInsets;
  set textContainerInset(value: UIEdgeInsetsLike);
  /** 文字排版的区域。每次读都是同一个对象。 */
  readonly textContainer: NSTextContainer;

  /** 用户能不能改。默认 `true`。代码改不受它管。 */
  isEditable: boolean;
  /** 用户能不能选中文字。默认 `true`。写 `false` 会连带把 `isEditable` 关掉。 */
  isSelectable: boolean;

  /**
   * 选中的范围，`length` 为 0 就是光标。越界不抛：位置超了停在末尾，长度
   * 超了变成 0。
   */
  get selectedRange(): NSRange;
  set selectedRange(value: NSRangeLike);
  /** 滚到这一段文字看得见为止。 */
  scrollRangeToVisible(range: NSRangeLike): void;

  keyboardType: UIKeyboardType;
  /** 回车键上印什么字。多行输入里按它是换行，不会结束输入。 */
  returnKeyType: UIReturnKeyType;
  keyboardAppearance: UIKeyboardAppearance;
  /** 没有内容时回车键变灰。 */
  enablesReturnKeyAutomatically: boolean;
  /**
   * 键盘弹出时贴在键盘上面的视图，最常见的是放一个 `UIToolbar`。默认 `null`。
   * 读回来的是写进去的那个对象。多行输入里回车是换行，「完成」按钮通常放在
   * 这里。正在输入时换，当场生效。写了不是视图的值抛 `TypeError`。
   */
  inputAccessoryView: UIView | null;

  isSecureTextEntry: boolean;
  autocapitalizationType: UITextAutocapitalizationType;
  autocorrectionType: UITextAutocorrectionType;
  spellCheckingType: UITextSpellCheckingType;
  /** 没配过是 `null`。 */
  textContentType: UITextContentType | null;

  addEventListener<K extends keyof UITextViewEventMap>(
    type: K,
    callback: ((event: UITextViewEventMap[K]) => void) | null,
    options?: AddEventListenerOptions,
  ): void;
  /** 别的名字当自定义事件：`dispatchEvent` 是公开 API，JS 可以派发自己的事件。 */
  addEventListener(type: string, callback: EventListener | null, options?: AddEventListenerOptions): void;
  removeEventListener<K extends keyof UITextViewEventMap>(
    type: K,
    callback: ((event: UITextViewEventMap[K]) => void) | null,
  ): void;
  removeEventListener(type: string, callback: EventListener | null): void;
}
