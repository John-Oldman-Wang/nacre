// 滚动和一维排列
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const {
    INSETS_FIELDS,
    POINT_FIELDS,
    RECT_FIELDS,
    SIZE_FIELDS,
    constructNative,
    defineNativeClass,
    disown,
    has,
    kSubscribe,
    nativeCall,
    nativeGet,
    nativeGetObjectArray,
    nativeGetOwned,
    nativeSet,
    ownAll,
    ownOne,
    requireNative,
    structArg,
    subscribeNative,
    superviewOf,
    toBoolean,
    toInsets,
    toInteger,
    toNumberOrName,
    toPoint,
    toSize,
  } = ctx;

  defineNativeClass('UIScrollView', class UIScrollView extends UIView {
    constructor() {
      super();
      constructNative(this, new.target, 'UIScrollView', []);
    }

    // 事件全在 UIScrollViewDelegate 上，而 delegate 是一个对象不是一组
    // action，所以订阅状态记在原生侧；一个监听器都没有时 delegate 不挂，
    // 一次桥都不过
    [kSubscribe](type, on) { subscribeNative(this, type, on); }

    // ---- 内容和偏移 ----
    get contentOffset() {
      requireNative(this, 'contentOffset');
      return toPoint(nativeGet(this, 'contentOffset'));
    }
    set contentOffset(value) {
      requireNative(this, 'contentOffset');
      nativeSet(this, 'contentOffset', structArg(value, POINT_FIELDS, 'contentOffset'));
    }
    get contentSize() {
      requireNative(this, 'contentSize');
      return toSize(nativeGet(this, 'contentSize'));
    }
    set contentSize(value) {
      requireNative(this, 'contentSize');
      nativeSet(this, 'contentSize', structArg(value, SIZE_FIELDS, 'contentSize'));
    }
    get contentInset() {
      requireNative(this, 'contentInset');
      return toInsets(nativeGet(this, 'contentInset'));
    }
    set contentInset(value) {
      requireNative(this, 'contentInset');
      nativeSet(this, 'contentInset', structArg(value, INSETS_FIELDS, 'contentInset'));
    }
    // contentInset 加上安全区等系统自己补的那部分。只读
    get adjustedContentInset() {
      requireNative(this, 'adjustedContentInset');
      return toInsets(nativeGet(this, 'adjustedContentInset'));
    }
    get contentInsetAdjustmentBehavior() {
      requireNative(this, 'contentInsetAdjustmentBehavior');
      return nativeGet(this, 'contentInsetAdjustmentBehavior');
    }
    set contentInsetAdjustmentBehavior(value) {
      requireNative(this, 'contentInsetAdjustmentBehavior');
      nativeSet(this, 'contentInsetAdjustmentBehavior', value);
    }
    setContentOffset(offset, options) {
      const o = options || {};
      nativeCall(this, 'setContentOffset:animated:',
                 [structArg(offset, POINT_FIELDS, 'setContentOffset'), !!o.animated]);
    }
    scrollRectToVisible(rect, options) {
      const o = options || {};
      nativeCall(this, 'scrollRectToVisible:animated:',
                 [structArg(rect, RECT_FIELDS, 'scrollRectToVisible'), !!o.animated]);
    }

    // ---- 两个 layout guide：scroll 套 stack 的标准写法全靠它们 ----
    // contentLayoutGuide 定内容多大，frameLayoutGuide 定可视范围
    get contentLayoutGuide() { return nativeGetOwned(this, 'contentLayoutGuide'); }
    get frameLayoutGuide() { return nativeGetOwned(this, 'frameLayoutGuide'); }

    // ---- 开关 ----
    get isScrollEnabled() {
      requireNative(this, 'isScrollEnabled');
      return nativeGet(this, 'isScrollEnabled');
    }
    set isScrollEnabled(value) {
      requireNative(this, 'isScrollEnabled');
      nativeSet(this, 'isScrollEnabled', toBoolean(value));
    }
    get isDirectionalLockEnabled() {
      requireNative(this, 'isDirectionalLockEnabled');
      return nativeGet(this, 'isDirectionalLockEnabled');
    }
    set isDirectionalLockEnabled(value) {
      requireNative(this, 'isDirectionalLockEnabled');
      nativeSet(this, 'isDirectionalLockEnabled', toBoolean(value));
    }
    get bounces() { requireNative(this, 'bounces'); return nativeGet(this, 'bounces'); }
    set bounces(value) { requireNative(this, 'bounces'); nativeSet(this, 'bounces', toBoolean(value)); }
    get alwaysBounceVertical() {
      requireNative(this, 'alwaysBounceVertical');
      return nativeGet(this, 'alwaysBounceVertical');
    }
    set alwaysBounceVertical(value) {
      requireNative(this, 'alwaysBounceVertical');
      nativeSet(this, 'alwaysBounceVertical', toBoolean(value));
    }
    get alwaysBounceHorizontal() {
      requireNative(this, 'alwaysBounceHorizontal');
      return nativeGet(this, 'alwaysBounceHorizontal');
    }
    set alwaysBounceHorizontal(value) {
      requireNative(this, 'alwaysBounceHorizontal');
      nativeSet(this, 'alwaysBounceHorizontal', toBoolean(value));
    }
    // 翻页：停在 bounds 宽度的整数倍上。Swiper 就靠这个
    get isPagingEnabled() {
      requireNative(this, 'isPagingEnabled');
      return nativeGet(this, 'isPagingEnabled');
    }
    set isPagingEnabled(value) {
      requireNative(this, 'isPagingEnabled');
      nativeSet(this, 'isPagingEnabled', toBoolean(value));
    }
    // 点状态栏回到顶部。同一时刻只能有一个 scroll view 开着它
    get scrollsToTop() {
      requireNative(this, 'scrollsToTop');
      return nativeGet(this, 'scrollsToTop');
    }
    set scrollsToTop(value) {
      requireNative(this, 'scrollsToTop');
      nativeSet(this, 'scrollsToTop', toBoolean(value));
    }
    get delaysContentTouches() {
      requireNative(this, 'delaysContentTouches');
      return nativeGet(this, 'delaysContentTouches');
    }
    set delaysContentTouches(value) {
      requireNative(this, 'delaysContentTouches');
      nativeSet(this, 'delaysContentTouches', toBoolean(value));
    }
    get canCancelContentTouches() {
      requireNative(this, 'canCancelContentTouches');
      return nativeGet(this, 'canCancelContentTouches');
    }
    set canCancelContentTouches(value) {
      requireNative(this, 'canCancelContentTouches');
      nativeSet(this, 'canCancelContentTouches', toBoolean(value));
    }

    // ---- 指示条 ----
    get showsVerticalScrollIndicator() {
      requireNative(this, 'showsVerticalScrollIndicator');
      return nativeGet(this, 'showsVerticalScrollIndicator');
    }
    set showsVerticalScrollIndicator(value) {
      requireNative(this, 'showsVerticalScrollIndicator');
      nativeSet(this, 'showsVerticalScrollIndicator', toBoolean(value));
    }
    get showsHorizontalScrollIndicator() {
      requireNative(this, 'showsHorizontalScrollIndicator');
      return nativeGet(this, 'showsHorizontalScrollIndicator');
    }
    set showsHorizontalScrollIndicator(value) {
      requireNative(this, 'showsHorizontalScrollIndicator');
      nativeSet(this, 'showsHorizontalScrollIndicator', toBoolean(value));
    }
    get indicatorStyle() {
      requireNative(this, 'indicatorStyle');
      return nativeGet(this, 'indicatorStyle');
    }
    set indicatorStyle(value) {
      requireNative(this, 'indicatorStyle');
      nativeSet(this, 'indicatorStyle', value);
    }
    get verticalScrollIndicatorInsets() {
      requireNative(this, 'verticalScrollIndicatorInsets');
      return toInsets(nativeGet(this, 'verticalScrollIndicatorInsets'));
    }
    set verticalScrollIndicatorInsets(value) {
      requireNative(this, 'verticalScrollIndicatorInsets');
      nativeSet(this, 'verticalScrollIndicatorInsets',
                structArg(value, INSETS_FIELDS, 'verticalScrollIndicatorInsets'));
    }
    get horizontalScrollIndicatorInsets() {
      requireNative(this, 'horizontalScrollIndicatorInsets');
      return toInsets(nativeGet(this, 'horizontalScrollIndicatorInsets'));
    }
    set horizontalScrollIndicatorInsets(value) {
      requireNative(this, 'horizontalScrollIndicatorInsets');
      nativeSet(this, 'horizontalScrollIndicatorInsets',
                structArg(value, INSETS_FIELDS, 'horizontalScrollIndicatorInsets'));
    }
    get automaticallyAdjustsScrollIndicatorInsets() {
      requireNative(this, 'automaticallyAdjustsScrollIndicatorInsets');
      return nativeGet(this, 'automaticallyAdjustsScrollIndicatorInsets');
    }
    set automaticallyAdjustsScrollIndicatorInsets(value) {
      requireNative(this, 'automaticallyAdjustsScrollIndicatorInsets');
      nativeSet(this, 'automaticallyAdjustsScrollIndicatorInsets', toBoolean(value));
    }
    flashScrollIndicators() { nativeCall(this, 'flashScrollIndicators', []); }

    // ---- 减速 ----
    // 数字，或 'normal'（0.998）/ 'fast'（0.99）
    get decelerationRate() {
      requireNative(this, 'decelerationRate');
      return nativeGet(this, 'decelerationRate');
    }
    set decelerationRate(value) {
      requireNative(this, 'decelerationRate');
      nativeSet(this, 'decelerationRate', toNumberOrName(value, 'decelerationRate'));
    }

    // ---- 当前状态，只读 ----
    get isTracking() { requireNative(this, 'isTracking'); return nativeGet(this, 'isTracking'); }
    get isDragging() { requireNative(this, 'isDragging'); return nativeGet(this, 'isDragging'); }
    get isDecelerating() {
      requireNative(this, 'isDecelerating');
      return nativeGet(this, 'isDecelerating');
    }
    get isScrollAnimating() {
      requireNative(this, 'isScrollAnimating');
      return nativeGet(this, 'isScrollAnimating');
    }
  });

  // 一维排列容器。它自己不画东西，职责是把「排成一行 / 一列」翻译成约束：
  // 三个等宽等距的块原来要手写 6 条约束，这里是 4 行属性。
  defineNativeClass('UIStackView', class UIStackView extends UIView {
    // new UIStackView() 或 new UIStackView([a, b, c])。数组按「每个参数一个
    // 句柄」传给原生，和 NSLayoutConstraint.activateConstraints 一条路子。
    constructor(arrangedSubviews) {
      super();
      const views = arrangedSubviews == null ? [] : Array.from(arrangedSubviews);
      // 旧的 superview 要在原生动手之前读，之后它们已经挂到 stack 上了
      const from = views.map(superviewOf);
      constructNative(this, new.target, 'UIStackView', views);
      for (let i = 0; i < views.length; i++) {
        disown(from[i], 'subviews', views[i]);
        ownOne(this, 'subviews', views[i]);
      }
    }

    // ---- 排列 ----
    get axis() { requireNative(this, 'axis'); return nativeGet(this, 'axis'); }
    set axis(value) { requireNative(this, 'axis'); nativeSet(this, 'axis', value); }
    get distribution() {
      requireNative(this, 'distribution');
      return nativeGet(this, 'distribution');
    }
    set distribution(value) {
      requireNative(this, 'distribution');
      nativeSet(this, 'distribution', value);
    }
    // 'leading' 和 'top' 是同一个值（'trailing' / 'bottom' 同理）。两个名字
    // 都写得进去，读出来永远是 leading / trailing —— 头文件里 Top = Leading，
    // 别名那一侧没法反查
    get alignment() {
      requireNative(this, 'alignment');
      return nativeGet(this, 'alignment');
    }
    set alignment(value) {
      requireNative(this, 'alignment');
      nativeSet(this, 'alignment', value);
    }
    // 数字，或 'system' 要系统标准间距
    get spacing() { requireNative(this, 'spacing'); return nativeGet(this, 'spacing'); }
    set spacing(value) { requireNative(this, 'spacing'); nativeSet(this, 'spacing', toNumberOrName(value, 'spacing')); }
    get isBaselineRelativeArrangement() {
      requireNative(this, 'isBaselineRelativeArrangement');
      return nativeGet(this, 'isBaselineRelativeArrangement');
    }
    set isBaselineRelativeArrangement(value) {
      requireNative(this, 'isBaselineRelativeArrangement');
      nativeSet(this, 'isBaselineRelativeArrangement', toBoolean(value));
    }
    get isLayoutMarginsRelativeArrangement() {
      requireNative(this, 'isLayoutMarginsRelativeArrangement');
      return nativeGet(this, 'isLayoutMarginsRelativeArrangement');
    }
    set isLayoutMarginsRelativeArrangement(value) {
      requireNative(this, 'isLayoutMarginsRelativeArrangement');
      nativeSet(this, 'isLayoutMarginsRelativeArrangement', toBoolean(value));
    }

    // ---- 排列里的子视图 ----
    // arrangedSubviews 是 subviews 的子集，但顺序是排列顺序，不是 z 序
    get arrangedSubviews() {
      return ownAll(this, 'arrangedSubviews',
                    nativeGetObjectArray(this, 'arrangedSubviews'));
    }
    // 进了排列就一定也是 subview，所以持有边和 addSubview 走同一条
    addArrangedSubview(view) {
      const from = superviewOf(view);
      nativeCall(this, 'addArrangedSubview:', [view]);
      disown(from, 'subviews', view);
      ownOne(this, 'subviews', view);
    }
    // 只移出排列，view 仍然是 subview（只是不再被排版），所以那条持有边不动。
    // 真要移走用 view.removeFromSuperview()，stack 会自己把它从排列里摘掉
    removeArrangedSubview(view) {
      nativeCall(this, 'removeArrangedSubview:', [view]);
    }
    insertArrangedSubview(view, options) {
      const o = options || {};
      if (!(has(o, 'atIndex'))) {
        throw new TypeError('insertArrangedSubview needs { atIndex }');
      }
      const from = superviewOf(view);
      nativeCall(this, 'insertArrangedSubview:atIndex:', [view, toInteger(o.atIndex, 'atIndex')]);
      disown(from, 'subviews', view);
      ownOne(this, 'subviews', view);
    }

    // ---- 单独调某一项后面的间距 ----
    // spacing 可以是数字、'system'（系统标准间距）或 'default'（撤回，回到
    // spacing 属性）。两个哨兵在 ObjC 里是 FLT_MIN / FLT_MAX，不让它们进 JS
    setCustomSpacing(spacing, options) {
      const o = options || {};
      if (!(has(o, 'afterView'))) {
        throw new TypeError('setCustomSpacing needs { afterView }');
      }
      nativeCall(this, 'setCustomSpacing:afterView:',
                 [toNumberOrName(spacing, 'spacing'), o.afterView]);
    }
    customSpacingAfterView(view) {
      return nativeCall(this, 'customSpacingAfterView:', [view]);
    }
  });


})
