// 控件：UIControl / UIButton / UILabel / UITextField / UIImageView
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const {
    SIZE_FIELDS,
    constructNative,
    defineNativeClass,
    kSubscribe,
    nativeCall,
    nativeCallObject,
    nativeClassCall,
    nativeGet,
    nativeGetOwned,
    nativeSet,
    nativeSetOwned,
    own,
    requireNative,
    stateKey,
    stateOption,
    structArg,
    subscribeNative,
    toBoolean,
    toInteger,
    toNumber,
    toSize,
    toText,
    toTextOrNull,
  } = ctx;

  // 这几个定义在后面的 part 里，转发一道（原文整个是一个 IIFE，靠函数提升）
  const colorArg = (...a) => ctx.colorArg(...a);
  const colorString = (...a) => ctx.colorString(...a);

  defineNativeClass('UIControl', class UIControl extends UIView {
    constructor() {
      super();
      constructNative(this, new.target, 'UIControl', []);
    }

    // ---- 状态 ----
    // 关掉之后不接收触摸，子类还会画成灰的
    get isEnabled() { requireNative(this, 'isEnabled'); return nativeGet(this, 'isEnabled'); }
    set isEnabled(value) { requireNative(this, 'isEnabled'); nativeSet(this, 'isEnabled', toBoolean(value)); }
    // 由 App 自己用，UIKit 不会自动改
    get isSelected() { requireNative(this, 'isSelected'); return nativeGet(this, 'isSelected'); }
    set isSelected(value) { requireNative(this, 'isSelected'); nativeSet(this, 'isSelected', toBoolean(value)); }
    // 手指按下时 UIKit 自动置上，抬起时清掉
    get isHighlighted() {
      requireNative(this, 'isHighlighted');
      return nativeGet(this, 'isHighlighted');
    }
    set isHighlighted(value) {
      requireNative(this, 'isHighlighted');
      nativeSet(this, 'isHighlighted', toBoolean(value));
    }
    // 只读，由上面三个合成。位掩码，所以是字符串数组；都没置上时是 ['normal']
    get state() { requireNative(this, 'state'); return nativeGet(this, 'state'); }
    // 只读，只在跟踪触摸期间有意义
    get isTracking() { requireNative(this, 'isTracking'); return nativeGet(this, 'isTracking'); }
    get isTouchInside() {
      requireNative(this, 'isTouchInside');
      return nativeGet(this, 'isTouchInside');
    }

    // ---- 内容对齐 ----
    get contentHorizontalAlignment() {
      requireNative(this, 'contentHorizontalAlignment');
      return nativeGet(this, 'contentHorizontalAlignment');
    }
    set contentHorizontalAlignment(value) {
      requireNative(this, 'contentHorizontalAlignment');
      nativeSet(this, 'contentHorizontalAlignment', value);
    }
    get contentVerticalAlignment() {
      requireNative(this, 'contentVerticalAlignment');
      return nativeGet(this, 'contentVerticalAlignment');
    }
    set contentVerticalAlignment(value) {
      requireNative(this, 'contentVerticalAlignment');
      nativeSet(this, 'contentVerticalAlignment', value);
    }

    // 主动触发，一次可以触发多个。注意 dispatchEvent 不走这条——
    // 那个是 EventTarget 的语义，只派发给 JS 监听器
    sendActionsForControlEvents(types) {
      nativeCall(this, 'sendActionsForControlEvents:', [types]);
    }

    // 惰性订阅：某个类型第一次有监听器时才告诉原生。
    // touchDragInside 在手指移动时每帧都发，没人听还过桥是白费。
    [kSubscribe](type, on) { subscribeNative(this, type, on); }
  });

  // 按钮。标题、颜色、图片都是**按状态**设的——同一个按钮在 normal /
  // highlighted / disabled 下可以不一样。
  defineNativeClass('UIButton', class UIButton extends UIControl {
    constructor() {
      super();
      constructNative(this, new.target, 'UIButton', []);
    }

    // 系统外观的按钮走这条；new UIButton() 得到的是 custom（什么都不画）
    static buttonWithType(type) {
      return nativeClassCall('UIButton', 'buttonWithType:', [type]);
    }

    get buttonType() { requireNative(this, 'buttonType'); return nativeGet(this, 'buttonType'); }
    // 语义角色，影响系统给它的配色
    get role() { requireNative(this, 'role'); return nativeGet(this, 'role'); }
    set role(value) { requireNative(this, 'role'); nativeSet(this, 'role', value); }

    // ---- 按状态设 ----
    // forState 是状态数组，和 control.state 读出来的形状一致。
    // 一般只设 ['normal']，别的状态没设就回退到它
    setTitle(title, options) {
      nativeCall(this, 'setTitle:forState:',
                 [toTextOrNull(title), stateOption(options, 'setTitle')]);
    }
    setTitleColor(color, options) {
      const state = stateOption(options, 'setTitleColor');
      const value = colorArg(color, 'setTitleColor');
      if (value === undefined) return;   // 不合法，警告过了
      nativeCall(this, 'setTitleColor:forState:', [value, state]);
      own(this, stateKey('titleColor', state), value);
    }
    setImage(image, options) {
      const state = stateOption(options, 'setImage');
      nativeCall(this, 'setImage:forState:', [image, state]);
      own(this, stateKey('image', state), image);
    }
    setBackgroundImage(image, options) {
      const state = stateOption(options, 'setBackgroundImage');
      nativeCall(this, 'setBackgroundImage:forState:', [image, state]);
      own(this, stateKey('backgroundImage', state), image);
    }

    // 取值这一侧**只认单个状态**，这是 UIKit 的规定（头文件原话
    // "these getters only take a single state value"）
    titleForState(state) { return nativeCall(this, 'titleForState:', [[state]]); }
    titleColorForState(state) {
      return colorString(own(this, stateKey('titleColor', state),
                             nativeCallObject(this, 'titleColorForState:', [[state]])));
    }
    imageForState(state) {
      return own(this, stateKey('image', state),
                 nativeCallObject(this, 'imageForState:', [[state]]));
    }
    backgroundImageForState(state) {
      return own(this, stateKey('backgroundImage', state),
                 nativeCallObject(this, 'backgroundImageForState:', [[state]]));
    }

    // ---- 当前状态下实际用的那些 ----
    get currentTitle() { requireNative(this, 'currentTitle'); return nativeGet(this, 'currentTitle'); }
    get currentTitleColor() {
      return colorString(nativeGetOwned(this, 'currentTitleColor'));
    }
    get currentImage() { return nativeGetOwned(this, 'currentImage'); }
    get currentBackgroundImage() { return nativeGetOwned(this, 'currentBackgroundImage'); }

    // 画标题和图的那两个子视图。字体、行数这些要通过它们设
    get titleLabel() { return nativeGetOwned(this, 'titleLabel'); }
    get imageView() { return nativeGetOwned(this, 'imageView'); }
  });

  // 文字。
  defineNativeClass('UILabel', class UILabel extends UIView {
    constructor() {
      super();
      constructNative(this, new.target, 'UILabel', []);
    }
    get text() { requireNative(this, 'text'); return nativeGet(this, 'text'); }
    set text(value) { requireNative(this, 'text'); nativeSet(this, 'text', toTextOrNull(value)); }
    get font() { requireNative(this, 'font'); return nativeGetOwned(this, 'font'); }
    set font(value) { requireNative(this, 'font'); nativeSetOwned(this, 'font', value); }
    get textColor() {
      requireNative(this, 'textColor');
      return colorString(nativeGetOwned(this, 'textColor'));
    }
    set textColor(value) {
      requireNative(this, 'textColor');
      {
      const color = colorArg(value, 'textColor');
      if (color === undefined) return;   // 不合法，警告过了，保留旧值
      nativeSetOwned(this, 'textColor', color);
    };
    }
    get textAlignment() {
      requireNative(this, 'textAlignment');
      return nativeGet(this, 'textAlignment');
    }
    set textAlignment(value) {
      requireNative(this, 'textAlignment');
      nativeSet(this, 'textAlignment', value);
    }
    get lineBreakMode() {
      requireNative(this, 'lineBreakMode');
      return nativeGet(this, 'lineBreakMode');
    }
    set lineBreakMode(value) {
      requireNative(this, 'lineBreakMode');
      nativeSet(this, 'lineBreakMode', value);
    }
    get numberOfLines() {
      requireNative(this, 'numberOfLines');
      return nativeGet(this, 'numberOfLines');
    }
    set numberOfLines(value) {
      requireNative(this, 'numberOfLines');
      nativeSet(this, 'numberOfLines', toInteger(value, 'numberOfLines'));
    }
    get adjustsFontSizeToFitWidth() {
      requireNative(this, 'adjustsFontSizeToFitWidth');
      return nativeGet(this, 'adjustsFontSizeToFitWidth');
    }
    set adjustsFontSizeToFitWidth(value) {
      requireNative(this, 'adjustsFontSizeToFitWidth');
      nativeSet(this, 'adjustsFontSizeToFitWidth', toBoolean(value));
    }
    get minimumScaleFactor() {
      requireNative(this, 'minimumScaleFactor');
      return nativeGet(this, 'minimumScaleFactor');
    }
    set minimumScaleFactor(value) {
      requireNative(this, 'minimumScaleFactor');
      nativeSet(this, 'minimumScaleFactor', toNumber(value, 'minimumScaleFactor'));
    }
    get baselineAdjustment() {
      requireNative(this, 'baselineAdjustment');
      return nativeGet(this, 'baselineAdjustment');
    }
    set baselineAdjustment(value) {
      requireNative(this, 'baselineAdjustment');
      nativeSet(this, 'baselineAdjustment', value);
    }
    get isHighlighted() {
      requireNative(this, 'isHighlighted');
      return nativeGet(this, 'isHighlighted');
    }
    set isHighlighted(value) {
      requireNative(this, 'isHighlighted');
      nativeSet(this, 'isHighlighted', toBoolean(value));
    }
    get highlightedTextColor() {
      requireNative(this, 'highlightedTextColor');
      return colorString(nativeGetOwned(this, 'highlightedTextColor'));
    }
    set highlightedTextColor(value) {
      requireNative(this, 'highlightedTextColor');
      {
      const color = colorArg(value, 'highlightedTextColor');
      if (color === undefined) return;   // 不合法，警告过了，保留旧值
      nativeSetOwned(this, 'highlightedTextColor', color);
    };
    }
    get isEnabled() { requireNative(this, 'isEnabled'); return nativeGet(this, 'isEnabled'); }
    set isEnabled(value) {
      requireNative(this, 'isEnabled');
      nativeSet(this, 'isEnabled', toBoolean(value));
    }
    get shadowColor() {
      requireNative(this, 'shadowColor');
      return colorString(nativeGetOwned(this, 'shadowColor'));
    }
    set shadowColor(value) {
      requireNative(this, 'shadowColor');
      {
      const color = colorArg(value, 'shadowColor');
      if (color === undefined) return;   // 不合法，警告过了，保留旧值
      nativeSetOwned(this, 'shadowColor', color);
    };
    }
    get shadowOffset() {
      requireNative(this, 'shadowOffset');
      return toSize(nativeGet(this, 'shadowOffset'));
    }
    set shadowOffset(value) {
      requireNative(this, 'shadowOffset');
      nativeSet(this, 'shadowOffset', structArg(value, SIZE_FIELDS, 'shadowOffset'));
    }
    // 多行文字算固有高度时要先知道宽度，就靠这个
    get preferredMaxLayoutWidth() {
      requireNative(this, 'preferredMaxLayoutWidth');
      return nativeGet(this, 'preferredMaxLayoutWidth');
    }
    set preferredMaxLayoutWidth(value) {
      requireNative(this, 'preferredMaxLayoutWidth');
      nativeSet(this, 'preferredMaxLayoutWidth', toNumber(value, 'preferredMaxLayoutWidth'));
    }
  });

  // 单行输入框。它**是 UIControl**，所以 4a 那 16 个控件事件直接可用：
  //   editingDidBegin / editingChanged / editingDidEnd / editingDidEndOnExit
  // 「文字变了」不需要新机制，听 editingChanged 就行。
  //
  // UITextFieldDelegate 里那几个要**同步返回 BOOL** 的（shouldChangeCharacters、
  // shouldReturn…）要 M1b，v1 不做。常见的两个需求能绕：
  //   输入过滤 → 听 editingChanged，事后截断
  //   回车收键盘 → 听 editingDidEndOnExit，自己 resignFirstResponder()
  defineNativeClass('UITextField', class UITextField extends UIControl {
    constructor() {
      super();
      constructNative(this, new.target, 'UITextField', []);
    }

    get text() { requireNative(this, 'text'); return nativeGet(this, 'text'); }
    set text(value) { requireNative(this, 'text'); nativeSet(this, 'text', toText(value)); }
    get placeholder() { requireNative(this, 'placeholder'); return nativeGet(this, 'placeholder'); }
    set placeholder(value) {
      requireNative(this, 'placeholder');
      nativeSet(this, 'placeholder', toTextOrNull(value));
    }
    /** 正在编辑（已经是 first responder 并且键盘起来了） */
    get isEditing() { requireNative(this, 'isEditing'); return nativeGet(this, 'isEditing'); }

    // ---- 键盘长什么样 ----
    get keyboardType() { requireNative(this, 'keyboardType'); return nativeGet(this, 'keyboardType'); }
    set keyboardType(value) {
      requireNative(this, 'keyboardType');
      nativeSet(this, 'keyboardType', value);
    }
    /** 回车键上印什么字 */
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
    /** 没有内容时回车键变灰 */
    get enablesReturnKeyAutomatically() {
      requireNative(this, 'enablesReturnKeyAutomatically');
      return nativeGet(this, 'enablesReturnKeyAutomatically');
    }
    set enablesReturnKeyAutomatically(value) {
      requireNative(this, 'enablesReturnKeyAutomatically');
      nativeSet(this, 'enablesReturnKeyAutomatically', toBoolean(value));
    }

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
    /**
     * 这个框装的是什么。配上 'username' + 'password' 开启密码自动填充，
     * 'oneTimeCode' 开启短信验证码自动填充。不配就全都没有。
     */
    get textContentType() {
      requireNative(this, 'textContentType');
      return nativeGet(this, 'textContentType');
    }
    set textContentType(value) {
      requireNative(this, 'textContentType');
      nativeSet(this, 'textContentType', value);
    }
    get clearsOnBeginEditing() {
      requireNative(this, 'clearsOnBeginEditing');
      return nativeGet(this, 'clearsOnBeginEditing');
    }
    set clearsOnBeginEditing(value) {
      requireNative(this, 'clearsOnBeginEditing');
      nativeSet(this, 'clearsOnBeginEditing', toBoolean(value));
    }

    // ---- 外观 ----
    get borderStyle() { requireNative(this, 'borderStyle'); return nativeGet(this, 'borderStyle'); }
    set borderStyle(value) {
      requireNative(this, 'borderStyle');
      nativeSet(this, 'borderStyle', value);
    }
    /** 右边那个清空按钮什么时候出现 */
    get clearButtonMode() {
      requireNative(this, 'clearButtonMode');
      return nativeGet(this, 'clearButtonMode');
    }
    set clearButtonMode(value) {
      requireNative(this, 'clearButtonMode');
      nativeSet(this, 'clearButtonMode', value);
    }
    get textAlignment() {
      requireNative(this, 'textAlignment');
      return nativeGet(this, 'textAlignment');
    }
    set textAlignment(value) {
      requireNative(this, 'textAlignment');
      nativeSet(this, 'textAlignment', value);
    }
    get adjustsFontSizeToFitWidth() {
      requireNative(this, 'adjustsFontSizeToFitWidth');
      return nativeGet(this, 'adjustsFontSizeToFitWidth');
    }
    set adjustsFontSizeToFitWidth(value) {
      requireNative(this, 'adjustsFontSizeToFitWidth');
      nativeSet(this, 'adjustsFontSizeToFitWidth', toBoolean(value));
    }
    get minimumFontSize() {
      requireNative(this, 'minimumFontSize');
      return nativeGet(this, 'minimumFontSize');
    }
    set minimumFontSize(value) {
      requireNative(this, 'minimumFontSize');
      nativeSet(this, 'minimumFontSize', toNumber(value, 'minimumFontSize'));
    }
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
  });

  // 图片上屏。
  //
  // 「图比容器大/小/比例不一样怎么办」全靠 UIView 的 contentMode，
  // 不是这个类的事——那 13 个取值第 2.5 步就有了。
  // scaleAspectFill 记得配 clipsToBounds，否则溢出会画到容器外面。
  defineNativeClass('UIImageView', class UIImageView extends UIView {
    constructor() {
      super();
      constructNative(this, new.target, 'UIImageView', []);
    }
    get image() { requireNative(this, 'image'); return nativeGetOwned(this, 'image'); }
    set image(value) {
      requireNative(this, 'image');
      nativeSetOwned(this, 'image', value);
    }
    // isHighlighted 为 true 时显示这张，用于按下态
    get highlightedImage() {
      requireNative(this, 'highlightedImage');
      return nativeGetOwned(this, 'highlightedImage');
    }
    set highlightedImage(value) {
      requireNative(this, 'highlightedImage');
      nativeSetOwned(this, 'highlightedImage', value);
    }
    get isHighlighted() {
      requireNative(this, 'isHighlighted');
      return nativeGet(this, 'isHighlighted');
    }
    set isHighlighted(value) {
      requireNative(this, 'isHighlighted');
      nativeSet(this, 'isHighlighted', toBoolean(value));
    }
    // 模板图（renderingMode 为 alwaysTemplate，SF Symbols 默认如此）按这个颜色上色
    get tintColor() {
      requireNative(this, 'tintColor');
      return colorString(nativeGetOwned(this, 'tintColor'));
    }
    set tintColor(value) {
      requireNative(this, 'tintColor');
      {
      const color = colorArg(value, 'tintColor');
      if (color === undefined) return;   // 不合法，警告过了，保留旧值
      nativeSetOwned(this, 'tintColor', color);
    };
    }
    // 逐帧动画还没做（要先能把 GIF 拆成帧），但这个事实先给出来
    get isAnimating() {
      requireNative(this, 'isAnimating');
      return nativeGet(this, 'isAnimating');
    }
  });

  // 颜色。基础色和语义色都是 ObjC 的类级只读属性，按原名暴露。
  // 语义色（systemBackgroundColor、labelColor 等）是动态颜色：
  // 它在绘制时按当时的外观（深色/浅色）解析，所以取一次就能一直用。
  // 带参数的类方法（colorWithRed:green:blue:alpha:）等方法名映射定了再加。
  // 可滚动的视图。滚动本身由 UIKit 在主线程驱动，JS 只是收通知。
  //
  // 事件只有 type 和 target，状态去对象上读（contentOffset、isDecelerating）。
  // 正因为不带数据，同一轮里的多次 scroll 可以无损合并成一次 —— 和 CSSOM
  // 「每帧最多一个 scroll 事件」是同一个做法。

})
