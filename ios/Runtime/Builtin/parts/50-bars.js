// 两个条状的视图：UIToolbar（工具条）、UISearchBar（搜索框）
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const {
    colorArg,
    colorString,
    constructNative,
    defineNativeClass,
    kSubscribe,
    nativeCall,
    nativeGet,
    nativeGetObjectArray,
    nativeGetOwned,
    nativeSet,
    nativeSetObjectArray,
    nativeSetOwned,
    ownAll,
    requireNative,
    subscribeNative,
    toBoolean,
    toInteger,
    toText,
    toTextOrNull,
  } = ctx;

  // 「一组东西」的参数：数组，或者任何可迭代的对象。null 和 undefined 是
  // 「没有」，给空数组。照 Web IDL 的 sequence：数和字符串不是一组东西
  // ——'All' 不会被拆成 ['A', 'l', 'l']
  function listArg(value, what, of) {
    if (value == null) return [];
    if (typeof value !== 'object' || typeof value[Symbol.iterator] !== 'function') {
      throw new TypeError(what + ' needs an array of ' + of + ' or null');
    }
    return Array.from(value);
  }

  // 工具条：一横条，里面从左到右排着 UIBarButtonItem。
  //
  // 量出来的几条：
  //   - 新建的 frame 是 0×0。它自己想要的高在 App 里是 48（intrinsicContentSize；
  //     没有 UIApplication 的命令行探针里量到的是 44），
  //     宽没有主意：用约束定位时只给左右，不用给高；用 frame 定位时
  //     调 sizeToFit()
  //   - 项之间的空白靠 UIBarButtonItem.flexibleSpace() / fixedSpace()，
  //     不是靠工具条的属性
  defineNativeClass('UIToolbar', class UIToolbar extends UIView {
    constructor() {
      super();
      constructNative(this, new.target, 'UIToolbar', []);
    }

    // 工具条上的项，从左到右。读出来的是快照，改它不影响工具条；要改就
    // 整个重新赋值。工具条持有它的项，所以这里按原生的真相重建持有边
    get items() {
      return ownAll(this, 'items', nativeGetObjectArray(this, 'items'));
    }
    set items(value) {
      nativeSetObjectArray(this, 'items', listArg(value, 'items', 'UIBarButtonItem'));
      ownAll(this, 'items', nativeGetObjectArray(this, 'items'));
    }
    // 带动画地换一组项：新加的淡入、去掉的淡出、留下的挪到新位置。
    // items 属性当场就是新的，动的只是画面
    setItems(items, options) {
      const o = options || {};
      nativeCall(this, 'setItems:animated:',
                 [toBoolean(o.animated), ...listArg(items, 'setItems', 'UIBarButtonItem')]);
      ownAll(this, 'items', nativeGetObjectArray(this, 'items'));
    }

    // 'default' | 'black'
    get barStyle() { requireNative(this, 'barStyle'); return nativeGet(this, 'barStyle'); }
    set barStyle(value) { requireNative(this, 'barStyle'); nativeSet(this, 'barStyle', value); }
    get isTranslucent() {
      requireNative(this, 'isTranslucent');
      return nativeGet(this, 'isTranslucent');
    }
    set isTranslucent(value) {
      requireNative(this, 'isTranslucent');
      nativeSet(this, 'isTranslucent', toBoolean(value));
    }

    // ---- 颜色 ----
    // 项的颜色。读出来永远有值；写 null 是退回继承来的那个颜色，不是
    // 「没有颜色」——头文件标的是 null_resettable
    get tintColor() {
      requireNative(this, 'tintColor');
      return colorString(nativeGetOwned(this, 'tintColor'));
    }
    set tintColor(value) {
      requireNative(this, 'tintColor');
      const color = colorArg(value, 'tintColor');
      if (color === undefined) return;   // 不合法，警告过了，保留旧值
      nativeSetOwned(this, 'tintColor', color);
    }
    // 条自己的底色。null 是没设
    get barTintColor() {
      requireNative(this, 'barTintColor');
      return colorString(nativeGetOwned(this, 'barTintColor'));
    }
    set barTintColor(value) {
      requireNative(this, 'barTintColor');
      const color = colorArg(value, 'barTintColor');
      if (color === undefined) return;   // 不合法，警告过了，保留旧值
      nativeSetOwned(this, 'barTintColor', color);
    }
  });

  // 搜索框：一个带放大镜图标的输入框，外加可选的取消按钮、书签按钮和
  // 一排范围按钮。
  //
  // 它**不是控件**，文字变了、点了搜索这些事从它的委托来，这里是八个事件
  // （见 NacreBars.mm）。委托里要同步返回 BOOL 的那几个（能不能开始输入、
  // 让不让改文字）要同步回调，没接。
  //
  // 量出来的几条：
  //   - 新建的 frame 是 0×0，自己想要的高是 64；有 prompt 时 98，显示范围条
  //     （并且有两个以上的范围按钮）时 111
  //   - 用代码改 text、改 selectedScopeButtonIndex 都不派发事件
  //   - 点键盘上的「搜索」、点取消按钮之后键盘收不收，没量过（要真实触摸）。
  //     要收就在事件里自己 resignFirstResponder()
  defineNativeClass('UISearchBar', class UISearchBar extends UIView {
    constructor() {
      super();
      constructNative(this, new.target, 'UISearchBar', []);
    }

    // 所有事件名都交给原生去认：认不出来的抛，不当成只在 JS 这边的事件
    [kSubscribe](type, on) { subscribeNative(this, type, on); }

    // ---- 文字 ----
    // 没输入过是空串，不是 null
    get text() { requireNative(this, 'text'); return nativeGet(this, 'text'); }
    set text(value) { requireNative(this, 'text'); nativeSet(this, 'text', toText(value)); }
    // 没有内容时显示的灰字。null 和空串都是「没有」，UIKit 把它们当成同一个
    // 值：已经没有的时候再写另一种不会变（实测，和 UITextField 的一样）
    get placeholder() { requireNative(this, 'placeholder'); return nativeGet(this, 'placeholder'); }
    set placeholder(value) {
      requireNative(this, 'placeholder');
      nativeSet(this, 'placeholder', toTextOrNull(value));
    }
    // 输入框上面的一行说明。有它的搜索框更高
    get prompt() { requireNative(this, 'prompt'); return nativeGet(this, 'prompt'); }
    set prompt(value) { requireNative(this, 'prompt'); nativeSet(this, 'prompt', toTextOrNull(value)); }
    // 搜索框里的那个输入框。搜索框持有它，所以读出来的总是同一个包装。
    // 键盘的设置搜索框自己也有（下面「键盘」那一组），和它上面的是同一份
    get searchTextField() { return nativeGetOwned(this, 'searchTextField'); }

    // ---- 键盘 ----
    // 和 UITextView 上的是同一组九个属性，名字、取值、写错时的行为都一样。
    // 枚举值原样交给原生去认：不认识的打一条警告、值保持不变。
    // 和 searchTextField 上的同名属性是同一份设置，写哪一边另一边都读得到。
    //
    // 默认值有三个和新建的输入框不一样：returnKeyType 是 'search'，
    // enablesReturnKeyAutomatically 是 true，autocorrectionType 是 'no'
    get keyboardType() { requireNative(this, 'keyboardType'); return nativeGet(this, 'keyboardType'); }
    set keyboardType(value) {
      requireNative(this, 'keyboardType');
      nativeSet(this, 'keyboardType', value);
    }
    get returnKeyType() { requireNative(this, 'returnKeyType'); return nativeGet(this, 'returnKeyType'); }
    set returnKeyType(value) {
      requireNative(this, 'returnKeyType');
      nativeSet(this, 'returnKeyType', value);
    }
    // 'alert' 是 'dark' 的别名：两个都写得进去，读出来是 'dark'
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
    // 没配过是 null；写 null 清掉
    get textContentType() {
      requireNative(this, 'textContentType');
      return nativeGet(this, 'textContentType');
    }
    set textContentType(value) {
      requireNative(this, 'textContentType');
      nativeSet(this, 'textContentType', value);
    }

    // ---- 样式 ----
    // 'default' | 'black'
    get barStyle() { requireNative(this, 'barStyle'); return nativeGet(this, 'barStyle'); }
    set barStyle(value) { requireNative(this, 'barStyle'); nativeSet(this, 'barStyle', value); }
    // 'default' | 'prominent' | 'minimal'
    get searchBarStyle() {
      requireNative(this, 'searchBarStyle');
      return nativeGet(this, 'searchBarStyle');
    }
    set searchBarStyle(value) {
      requireNative(this, 'searchBarStyle');
      nativeSet(this, 'searchBarStyle', value);
    }
    get isTranslucent() {
      requireNative(this, 'isTranslucent');
      return nativeGet(this, 'isTranslucent');
    }
    set isTranslucent(value) {
      requireNative(this, 'isTranslucent');
      nativeSet(this, 'isTranslucent', toBoolean(value));
    }
    // false：整个搜索框不收触摸，里面的输入框也跟着禁用
    get isEnabled() { requireNative(this, 'isEnabled'); return nativeGet(this, 'isEnabled'); }
    set isEnabled(value) {
      requireNative(this, 'isEnabled');
      nativeSet(this, 'isEnabled', toBoolean(value));
    }

    // ---- 按钮 ----
    get showsCancelButton() {
      requireNative(this, 'showsCancelButton');
      return nativeGet(this, 'showsCancelButton');
    }
    set showsCancelButton(value) {
      requireNative(this, 'showsCancelButton');
      nativeSet(this, 'showsCancelButton', toBoolean(value));
    }
    setShowsCancelButton(showsCancelButton, options) {
      const o = options || {};
      nativeCall(this, 'setShowsCancelButton:animated:',
                 [toBoolean(showsCancelButton), toBoolean(o.animated)]);
    }
    get showsBookmarkButton() {
      requireNative(this, 'showsBookmarkButton');
      return nativeGet(this, 'showsBookmarkButton');
    }
    set showsBookmarkButton(value) {
      requireNative(this, 'showsBookmarkButton');
      nativeSet(this, 'showsBookmarkButton', toBoolean(value));
    }
    get showsSearchResultsButton() {
      requireNative(this, 'showsSearchResultsButton');
      return nativeGet(this, 'showsSearchResultsButton');
    }
    set showsSearchResultsButton(value) {
      requireNative(this, 'showsSearchResultsButton');
      nativeSet(this, 'showsSearchResultsButton', toBoolean(value));
    }
    get isSearchResultsButtonSelected() {
      requireNative(this, 'isSearchResultsButtonSelected');
      return nativeGet(this, 'isSearchResultsButtonSelected');
    }
    set isSearchResultsButtonSelected(value) {
      requireNative(this, 'isSearchResultsButtonSelected');
      nativeSet(this, 'isSearchResultsButtonSelected', toBoolean(value));
    }

    // ---- 范围按钮 ----
    // 输入框下面的一排分段按钮，用来在几个搜索范围之间切换。
    // 读出来的是快照；没设过是空数组。写了标题不会自己显示出来，
    // 还要 showsScopeBar = true
    get scopeButtonTitles() {
      requireNative(this, 'scopeButtonTitles');
      return nativeGet(this, 'scopeButtonTitles');
    }
    set scopeButtonTitles(value) {
      requireNative(this, 'scopeButtonTitles');
      nativeSet(this, 'scopeButtonTitles',
                listArg(value, 'scopeButtonTitles', 'strings').map(toText));
    }
    // 超出范围的值 UIKit 照样存下来，读回来就是它
    get selectedScopeButtonIndex() {
      requireNative(this, 'selectedScopeButtonIndex');
      return nativeGet(this, 'selectedScopeButtonIndex');
    }
    set selectedScopeButtonIndex(value) {
      requireNative(this, 'selectedScopeButtonIndex');
      nativeSet(this, 'selectedScopeButtonIndex', toInteger(value, 'selectedScopeButtonIndex'));
    }
    get showsScopeBar() {
      requireNative(this, 'showsScopeBar');
      return nativeGet(this, 'showsScopeBar');
    }
    set showsScopeBar(value) {
      requireNative(this, 'showsScopeBar');
      nativeSet(this, 'showsScopeBar', toBoolean(value));
    }
    setShowsScopeBar(showsScopeBar, options) {
      const o = options || {};
      nativeCall(this, 'setShowsScopeBar:animated:',
                 [toBoolean(showsScopeBar), toBoolean(o.animated)]);
    }

    // ---- 颜色 ----
    // 光标和按钮的颜色。读出来永远有值；写 null 是退回继承来的那个颜色
    get tintColor() {
      requireNative(this, 'tintColor');
      return colorString(nativeGetOwned(this, 'tintColor'));
    }
    set tintColor(value) {
      requireNative(this, 'tintColor');
      const color = colorArg(value, 'tintColor');
      if (color === undefined) return;   // 不合法，警告过了，保留旧值
      nativeSetOwned(this, 'tintColor', color);
    }
    // 条自己的底色。null 是没设
    get barTintColor() {
      requireNative(this, 'barTintColor');
      return colorString(nativeGetOwned(this, 'barTintColor'));
    }
    set barTintColor(value) {
      requireNative(this, 'barTintColor');
      const color = colorArg(value, 'barTintColor');
      if (color === undefined) return;   // 不合法，警告过了，保留旧值
      nativeSetOwned(this, 'barTintColor', color);
    }

    // ---- 键盘上方 ----
    // 键盘弹出时贴在它上面的那个视图，最常见的是放一个工具条。
    // 搜索框持有它
    get inputAccessoryView() { return nativeGetOwned(this, 'inputAccessoryView'); }
    set inputAccessoryView(value) { nativeSetOwned(this, 'inputAccessoryView', value); }
  });
})
