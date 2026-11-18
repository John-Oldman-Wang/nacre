// 多行输入：UITextView、NSTextContainer，和表示选区的结构体 NSRange
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const {
    INSETS_FIELDS,
    colorArg,
    colorString,
    constructNative,
    define,
    defineNativeClass,
    nativeCall,
    nativeGet,
    nativeGetOwned,
    nativeOnly,
    nativeSet,
    nativeSetOwned,
    requireNative,
    structArg,
    toBoolean,
    toInsets,
    toInteger,
    toNumber,
    toText,
  } = ctx;

  // ---- NSRange ----
  // 一段文字的范围：从 location 开始的 length 个 UTF-16 码元。单位和 JS
  // 字符串的下标是同一个，所以 text.slice(location, location + length)
  // 取出来的就是这一段；一个表情占两个。
  //
  // 照已有结构体的规矩：JS 类，字段只读，写入即抛（见 02-struct.js）。
  // 那边定义字段的助手没有导出，这里照着写了一份
  function defineStructFields(target, fields) {
    for (const [name, value] of fields) {
      Object.defineProperty(target, name, {
        enumerable: true,
        get: () => value,
        set() {
          throw new TypeError(
            name + ' is read-only: structs are values, assign a whole new one instead');
        },
      });
    }
    Object.preventExtensions(target);
  }
  // 两个字段在 ObjC 里是无符号整数。不给（undefined）按 0，和别的结构体
  // 一致；给了就按整数转（向零取整），负数没有对应的值，抛
  function count(v, what) {
    const n = v === undefined ? 0 : toInteger(v, what);
    if (n < 0) throw new TypeError(what + ' must be a non-negative integer, got ' + n);
    return n;
  }

  const NSRange = define(globalThis, 'NSRange', class NSRange {
    constructor(location, length) {
      defineStructFields(this, [['location', count(location, 'NSRange location')],
                                ['length', count(length, 'NSRange length')]]);
    }
    toString() { return 'NSRange(' + this.location + ', ' + this.length + ')'; }
  });

  const RANGE_FIELDS = ['location', 'length'];
  const toRange = (o) => (o == null ? null : new NSRange(o.location, o.length));
  // 写进去的可以是 NSRange，也可以是带同样字段的普通对象。字段按整数转；
  // 负数由原生拒（它的报错带着是哪个属性的哪个字段）
  function rangeArg(value, what) {
    const o = structArg(value, RANGE_FIELDS, what);
    return { location: Math.trunc(o.location) + 0, length: Math.trunc(o.length) + 0 };
  }

  // ---- NSTextContainer ----
  // 文字排在哪一块区域里。每个 UITextView 自带一个，从 textView.textContainer
  // 拿，不能 new。
  defineNativeClass('NSTextContainer', class NSTextContainer extends NSObject {
    constructor() { nativeOnly(new.target); }

    // 每一行左右各空出多少，点。默认 5——文字比 textContainerInset 给的
    // 左边距再往里 5 pt，要和别的视图左对齐时把它设成 0
    get lineFragmentPadding() {
      requireNative(this, 'lineFragmentPadding');
      return nativeGet(this, 'lineFragmentPadding');
    }
    set lineFragmentPadding(value) {
      requireNative(this, 'lineFragmentPadding');
      nativeSet(this, 'lineFragmentPadding', toNumber(value, 'lineFragmentPadding'));
    }
    // 最多排几行，0 是不限。超出的不显示，文字本身不会被截掉
    get maximumNumberOfLines() {
      requireNative(this, 'maximumNumberOfLines');
      return nativeGet(this, 'maximumNumberOfLines');
    }
    set maximumNumberOfLines(value) {
      requireNative(this, 'maximumNumberOfLines');
      nativeSet(this, 'maximumNumberOfLines', toInteger(value, 'maximumNumberOfLines'));
    }
    // 排不下的那一行怎么处理。配合 maximumNumberOfLines 用：
    // 'byTruncatingTail' 让最后一行以省略号结尾
    get lineBreakMode() {
      requireNative(this, 'lineBreakMode');
      return nativeGet(this, 'lineBreakMode');
    }
    set lineBreakMode(value) {
      requireNative(this, 'lineBreakMode');
      nativeSet(this, 'lineBreakMode', value);
    }
  });

  // ---- UITextView ----
  // 多行输入。它**是 UIScrollView**：内容超过自己的高度就能滚，滚动视图的
  // 属性和八个事件都在。它不是 UIControl，没有那 16 个控件事件；自己的事件
  // 是四个：focus / blur / input / selectionchange。
  //
  // 量出来的几条：
  //   - 代码写 text 不派发 input；insertText() / deleteBackward() 派发
  //   - isEditable 管的是用户能不能改，代码照样改得动
  //   - 关掉 isSelectable 会连带关掉 isEditable；打开 isEditable 会连带
  //     打开 isSelectable
  //   - 关掉 isScrollEnabled 之后它有固有大小，高度跟着文字走
  //
  // UITextViewDelegate 里要**同步返回 BOOL** 的那几个（shouldChangeText、
  // shouldBeginEditing…）没做。「选区变了」只有委托方法能知道，原生那一侧把
  // 自己的委托加进和滚动事件共用的槽位里（见 NacreTextView.mm），这里不用写
  // 什么：订阅的钩子是从 UIScrollView 继承来的，名字原样交给原生。
  defineNativeClass('UITextView', class UITextView extends UIScrollView {
    constructor() {
      super();
      constructNative(this, new.target, 'UITextView', []);
    }

    // ---- 内容 ----
    get text() { requireNative(this, 'text'); return nativeGet(this, 'text'); }
    set text(value) { requireNative(this, 'text'); nativeSet(this, 'text', toText(value)); }
    get hasText() { requireNative(this, 'hasText'); return nativeGet(this, 'hasText'); }
    // 按用户打字的规矩改内容：插在光标处，有选区就换掉选中的那一段
    insertText(text) {
      nativeCall(this, 'insertText:', [toText(text)]);
    }
    // 有选区就删掉选中的，没有就删光标前面那一个；光标在开头时什么都不做
    deleteBackward() {
      nativeCall(this, 'deleteBackward', []);
    }

    // ---- 外观 ----
    // 没设过是 null，这时用的是系统的默认字体
    get font() { requireNative(this, 'font'); return nativeGetOwned(this, 'font'); }
    set font(value) { requireNative(this, 'font'); nativeSetOwned(this, 'font', value); }
    get textColor() {
      requireNative(this, 'textColor');
      return colorString(nativeGetOwned(this, 'textColor'));
    }
    set textColor(value) {
      requireNative(this, 'textColor');
      const color = colorArg(value, 'textColor');
      if (color === undefined) return;   // 不合法，警告过了，保留旧值
      nativeSetOwned(this, 'textColor', color);
    }
    get textAlignment() {
      requireNative(this, 'textAlignment');
      return nativeGet(this, 'textAlignment');
    }
    set textAlignment(value) {
      requireNative(this, 'textAlignment');
      nativeSet(this, 'textAlignment', value);
    }
    // 文字离四边多远。默认上下各 8、左右 0（左右另有 lineFragmentPadding 的 5）
    get textContainerInset() {
      requireNative(this, 'textContainerInset');
      return toInsets(nativeGet(this, 'textContainerInset'));
    }
    set textContainerInset(value) {
      requireNative(this, 'textContainerInset');
      nativeSet(this, 'textContainerInset',
                structArg(value, INSETS_FIELDS, 'textContainerInset'));
    }
    // 文本视图一直持有它，所以是一条所有权边
    get textContainer() { return nativeGetOwned(this, 'textContainer'); }

    // ---- 行为 ----
    get isEditable() { requireNative(this, 'isEditable'); return nativeGet(this, 'isEditable'); }
    set isEditable(value) {
      requireNative(this, 'isEditable');
      nativeSet(this, 'isEditable', toBoolean(value));
    }
    get isSelectable() {
      requireNative(this, 'isSelectable');
      return nativeGet(this, 'isSelectable');
    }
    set isSelectable(value) {
      requireNative(this, 'isSelectable');
      nativeSet(this, 'isSelectable', toBoolean(value));
    }

    // ---- 选区 ----
    // length 为 0 就是光标。越界不抛：位置超了停在末尾，长度超了变成 0
    get selectedRange() {
      requireNative(this, 'selectedRange');
      return toRange(nativeGet(this, 'selectedRange'));
    }
    set selectedRange(value) {
      requireNative(this, 'selectedRange');
      nativeSet(this, 'selectedRange', rangeArg(value, 'selectedRange'));
    }
    scrollRangeToVisible(range) {
      nativeCall(this, 'scrollRangeToVisible:', [rangeArg(range, 'scrollRangeToVisible')]);
    }

    // ---- 键盘长什么样 ----
    get keyboardType() { requireNative(this, 'keyboardType'); return nativeGet(this, 'keyboardType'); }
    set keyboardType(value) {
      requireNative(this, 'keyboardType');
      nativeSet(this, 'keyboardType', value);
    }
    /** 回车键上印什么字。多行输入里按它是换行，不会结束输入 */
    get returnKeyType() { requireNative(this, 'returnKeyType'); return nativeGet(this, 'returnKeyType'); }
    set returnKeyType(value) {
      requireNative(this, 'returnKeyType');
      nativeSet(this, 'returnKeyType', value);
    }
    get keyboardAppearance() {
      requireNative(this, 'keyboardAppearance');
      return nativeGet(this, 'keyboardAppearance');
    }
    set keyboardAppearance(value) {
      requireNative(this, 'keyboardAppearance');
      nativeSet(this, 'keyboardAppearance', value);
    }
    get enablesReturnKeyAutomatically() {
      requireNative(this, 'enablesReturnKeyAutomatically');
      return nativeGet(this, 'enablesReturnKeyAutomatically');
    }
    set enablesReturnKeyAutomatically(value) {
      requireNative(this, 'enablesReturnKeyAutomatically');
      nativeSet(this, 'enablesReturnKeyAutomatically', toBoolean(value));
    }
    // 拖动时要不要收键盘是 keyboardDismissMode，从 UIScrollView 继承来的
    // （13-scroll.js）。回车在这里是换行，收键盘靠它

    // 键盘弹出时贴在它上面的那个视图，最常见的是放一个工具条。没设过是
    // null。文本视图持有它，所以是一条所有权边。正在编辑时换，当场生效
    get inputAccessoryView() { return nativeGetOwned(this, 'inputAccessoryView'); }
    set inputAccessoryView(value) { nativeSetOwned(this, 'inputAccessoryView', value); }

    // ---- 输入行为 ----
    get isSecureTextEntry() {
      requireNative(this, 'isSecureTextEntry');
      return nativeGet(this, 'isSecureTextEntry');
    }
    set isSecureTextEntry(value) {
      requireNative(this, 'isSecureTextEntry');
      nativeSet(this, 'isSecureTextEntry', toBoolean(value));
    }
    get autocapitalizationType() {
      requireNative(this, 'autocapitalizationType');
      return nativeGet(this, 'autocapitalizationType');
    }
    set autocapitalizationType(value) {
      requireNative(this, 'autocapitalizationType');
      nativeSet(this, 'autocapitalizationType', value);
    }
    get autocorrectionType() {
      requireNative(this, 'autocorrectionType');
      return nativeGet(this, 'autocorrectionType');
    }
    set autocorrectionType(value) {
      requireNative(this, 'autocorrectionType');
      nativeSet(this, 'autocorrectionType', value);
    }
    get spellCheckingType() {
      requireNative(this, 'spellCheckingType');
      return nativeGet(this, 'spellCheckingType');
    }
    set spellCheckingType(value) {
      requireNative(this, 'spellCheckingType');
      nativeSet(this, 'spellCheckingType', value);
    }
    get textContentType() {
      requireNative(this, 'textContentType');
      return nativeGet(this, 'textContentType');
    }
    set textContentType(value) {
      requireNative(this, 'textContentType');
      nativeSet(this, 'textContentType', value);
    }
  });
})
