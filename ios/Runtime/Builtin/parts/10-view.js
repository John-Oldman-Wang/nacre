// UIView
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const {
    DIRECTIONAL_INSETS_FIELDS,
    INSETS_FIELDS,
    POINT_FIELDS,
    RECT_FIELDS,
    SIZE_FIELDS,
    TRANSFORM_FIELDS,
    anchorOf,
    constructNative,
    defineNativeClass,
    disown,
    gestureViewOf,
    has,
    kSubscribe,
    nativeCall,
    nativeCallObject,
    nativeCallObjectArray,
    nativeGet,
    nativeGetObject,
    nativeGetObjectArray,
    nativeGetOwned,
    nativeSet,
    nativeSetOwned,
    ownAll,
    ownOne,
    requireNative,
    structArg,
    subscribeNative,
    superviewOf,
    toBoolean,
    toDirectionalInsets,
    toInsets,
    toInteger,
    toNumber,
    toNumberOrName,
    toPoint,
    toRect,
    toSize,
    toTransform,
  } = ctx;

  // 这几个定义在后面的 part 里，转发一道（原文整个是一个 IIFE，靠函数提升）
  const colorArg = (...a) => ctx.colorArg(...a);
  const colorString = (...a) => ctx.colorString(...a);

  const UIView = defineNativeClass('UIView', class UIView extends UIResponder {
    constructor() {
      super();
      constructNative(this, new.target, 'UIView', []);
    }

    // 普通视图只有一个要告诉原生的事件：traitchange（外观特征变了）。别的
    // 名字照旧只是 JS 这边的事件，不过桥。子类（控件、滚动视图）有自己的
    // 一套，会覆写这个钩子，但 traitchange 在原生那边是先按名字认走的，
    // 所以它们也都认
    [kSubscribe](type, on) {
      if (type === 'traitchange') subscribeNative(this, type, on);
    }

    // ---- 外观特征 ----
    // 这个视图所处的环境：深色还是浅色、屏幕几倍、文字多大。每次读都是当时的值
    get traitCollection() { return nativeGetObject(this, 'traitCollection'); }
    // 强制这个视图（连同它里面的一切）用浅色或深色。'unspecified' 是跟随外层
    get overrideUserInterfaceStyle() {
      requireNative(this, 'overrideUserInterfaceStyle');
      return nativeGet(this, 'overrideUserInterfaceStyle');
    }
    set overrideUserInterfaceStyle(value) {
      requireNative(this, 'overrideUserInterfaceStyle');
      nativeSet(this, 'overrideUserInterfaceStyle', value);
    }

    // ---- 几何 ----
    get frame() {
      requireNative(this, 'frame');
      return toRect(nativeGet(this, 'frame'));
    }
    set frame(value) {
      requireNative(this, 'frame');
      nativeSet(this, 'frame', structArg(value, RECT_FIELDS, 'frame'));
    }
    get bounds() {
      requireNative(this, 'bounds');
      return toRect(nativeGet(this, 'bounds'));
    }
    set bounds(value) {
      requireNative(this, 'bounds');
      nativeSet(this, 'bounds', structArg(value, RECT_FIELDS, 'bounds'));
    }
    get center() {
      requireNative(this, 'center');
      return toPoint(nativeGet(this, 'center'));
    }
    set center(value) {
      requireNative(this, 'center');
      nativeSet(this, 'center', structArg(value, POINT_FIELDS, 'center'));
    }
    get safeAreaInsets() {
      requireNative(this, 'safeAreaInsets');
      return toInsets(nativeGet(this, 'safeAreaInsets'));
    }
    // 内边距。两个属性是同一份数据的两个视图：directional 那个的
    // leading / trailing 跟着文字方向走，另一个的 left / right 写死。
    // 读出来的值**不一定等于写进去的**：insetsLayoutMarginsFromSafeArea
    // 为 true 时系统会把安全区加上去
    get layoutMargins() {
      requireNative(this, 'layoutMargins');
      return toInsets(nativeGet(this, 'layoutMargins'));
    }
    set layoutMargins(value) {
      requireNative(this, 'layoutMargins');
      nativeSet(this, 'layoutMargins', structArg(value, INSETS_FIELDS, 'layoutMargins'));
    }
    get directionalLayoutMargins() {
      requireNative(this, 'directionalLayoutMargins');
      return toDirectionalInsets(nativeGet(this, 'directionalLayoutMargins'));
    }
    set directionalLayoutMargins(value) {
      requireNative(this, 'directionalLayoutMargins');
      nativeSet(this, 'directionalLayoutMargins',
                structArg(value, DIRECTIONAL_INSETS_FIELDS, 'directionalLayoutMargins'));
    }
    get insetsLayoutMarginsFromSafeArea() {
      requireNative(this, 'insetsLayoutMarginsFromSafeArea');
      return nativeGet(this, 'insetsLayoutMarginsFromSafeArea');
    }
    set insetsLayoutMarginsFromSafeArea(value) {
      requireNative(this, 'insetsLayoutMarginsFromSafeArea');
      nativeSet(this, 'insetsLayoutMarginsFromSafeArea', toBoolean(value));
    }
    get preservesSuperviewLayoutMargins() {
      requireNative(this, 'preservesSuperviewLayoutMargins');
      return nativeGet(this, 'preservesSuperviewLayoutMargins');
    }
    set preservesSuperviewLayoutMargins(value) {
      requireNative(this, 'preservesSuperviewLayoutMargins');
      nativeSet(this, 'preservesSuperviewLayoutMargins', toBoolean(value));
    }
    sizeThatFits(size) {
      return toSize(nativeCall(this, 'sizeThatFits:',
                               [structArg(size, SIZE_FIELDS, 'sizeThatFits')]));
    }
    sizeToFit() { nativeCall(this, 'sizeToFit', []); }
    convertPoint(point, options) {
      const p = structArg(point, POINT_FIELDS, 'convertPoint');
      const o = options || {};
      if (has(o, 'toView')) return toPoint(nativeCall(this, 'convertPoint:toView:', [p, o.toView]));
      if (has(o, 'fromView')) return toPoint(nativeCall(this, 'convertPoint:fromView:', [p, o.fromView]));
      throw new TypeError('convertPoint needs { toView } or { fromView }');
    }
    convertRect(rect, options) {
      const r = structArg(rect, RECT_FIELDS, 'convertRect');
      const o = options || {};
      if (has(o, 'toView')) return toRect(nativeCall(this, 'convertRect:toView:', [r, o.toView]));
      if (has(o, 'fromView')) return toRect(nativeCall(this, 'convertRect:fromView:', [r, o.fromView]));
      throw new TypeError('convertRect needs { toView } or { fromView }');
    }
    hitTest(point) {
      return nativeCallObject(this, 'hitTest:withEvent:',
                              [structArg(point, POINT_FIELDS, 'hitTest')]);
    }

    // ---- 层级 ----
    get superview() {
      requireNative(this, 'superview');
      return nativeGetObject(this, 'superview');
    }
    // 读的同时按原生的真相重建这一层的持有列表（见「所有权镜像」）
    get subviews() {
      return ownAll(this, 'subviews', nativeGetObjectArray(this, 'subviews'));
    }
    get window() {
      requireNative(this, 'window');
      return nativeGetObject(this, 'window');
    }
    addSubview(view) {
      const from = superviewOf(view);
      nativeCall(this, 'addSubview:', [view]);
      disown(from, 'subviews', view);
      ownOne(this, 'subviews', view);
    }
    insertSubview(view, options) {
      const o = options || {};
      const from = superviewOf(view);
      if (has(o, 'atIndex')) {
        nativeCall(this, 'insertSubview:atIndex:', [view, toInteger(o.atIndex, 'atIndex')]);
      } else if (has(o, 'belowSubview')) {
        nativeCall(this, 'insertSubview:belowSubview:', [view, o.belowSubview]);
      } else if (has(o, 'aboveSubview')) {
        nativeCall(this, 'insertSubview:aboveSubview:', [view, o.aboveSubview]);
      } else {
        throw new TypeError(
          'insertSubview needs one of { atIndex } / { belowSubview } / { aboveSubview }');
      }
      disown(from, 'subviews', view);
      ownOne(this, 'subviews', view);
    }
    removeFromSuperview() {
      const from = superviewOf(this);
      nativeCall(this, 'removeFromSuperview', []);
      disown(from, 'subviews', this);
    }
    // 手势识别器。视图强持有它们，和子视图是同一种边。
    // 一个识别器同一时刻只能挂在一个视图上：挂到新的视图，UIKit 会把它
    // 从旧的那个上摘下来，所以这里也跟着断旧边
    get gestureRecognizers() {
      return ownAll(this, 'gestureRecognizers',
                    nativeGetObjectArray(this, 'gestureRecognizers'));
    }
    addGestureRecognizer(recognizer) {
      const from = gestureViewOf(recognizer);
      nativeCall(this, 'addGestureRecognizer:', [recognizer]);
      disown(from, 'gestureRecognizers', recognizer);
      ownOne(this, 'gestureRecognizers', recognizer);
    }
    removeGestureRecognizer(recognizer) {
      nativeCall(this, 'removeGestureRecognizer:', [recognizer]);
      disown(this, 'gestureRecognizers', recognizer);
    }
    bringSubviewToFront(view) { nativeCall(this, 'bringSubviewToFront:', [view]); }
    sendSubviewToBack(view) { nativeCall(this, 'sendSubviewToBack:', [view]); }
    isDescendantOfView(view) {
      return nativeCall(this, 'isDescendantOfView:', [view]);
    }
    viewWithTag(tag) { return nativeCallObject(this, 'viewWithTag:', [toInteger(tag, 'tag')]); }
    setNeedsLayout() { nativeCall(this, 'setNeedsLayout', []); }
    layoutIfNeeded() { nativeCall(this, 'layoutIfNeeded', []); }
    setNeedsDisplay() { nativeCall(this, 'setNeedsDisplay', []); }

    // 圆角、边框、阴影都在这上面。view 和 layer 是一对一的，取两次是同一个对象
    get layer() { return nativeGetOwned(this, 'layer'); }

    // ---- Auto Layout ----
    //
    // **用约束之前先把这个关掉**，否则系统会把 frame 翻译成一组
    // required 优先级的约束，和你写的那些直接打架。默认是 true，
    // 因为老代码全靠 frame。
    // 仿射变换。**非单位矩阵时 frame 就没有意义了**（UIKit 的规定），
    // 要改位置和大小请用 bounds 和 center
    get transform() {
      requireNative(this, 'transform');
      return toTransform(nativeGet(this, 'transform'));
    }
    set transform(value) {
      requireNative(this, 'transform');
      nativeSet(this, 'transform', structArg(value, TRANSFORM_FIELDS, 'transform'));
    }
    get translatesAutoresizingMaskIntoConstraints() {
      requireNative(this, 'translatesAutoresizingMaskIntoConstraints');
      return nativeGet(this, 'translatesAutoresizingMaskIntoConstraints');
    }
    set translatesAutoresizingMaskIntoConstraints(value) {
      requireNative(this, 'translatesAutoresizingMaskIntoConstraints');
      nativeSet(this, 'translatesAutoresizingMaskIntoConstraints', toBoolean(value));
    }

    get leadingAnchor() { return anchorOf(this, 'leadingAnchor'); }
    get trailingAnchor() { return anchorOf(this, 'trailingAnchor'); }
    // left / right 是物理左右，leading / trailing 跟书写方向走。
    // 除非真的是「屏幕左边」，否则用 leading / trailing
    get leftAnchor() { return anchorOf(this, 'leftAnchor'); }
    get rightAnchor() { return anchorOf(this, 'rightAnchor'); }
    get topAnchor() { return anchorOf(this, 'topAnchor'); }
    get bottomAnchor() { return anchorOf(this, 'bottomAnchor'); }
    get widthAnchor() { return anchorOf(this, 'widthAnchor'); }
    get heightAnchor() { return anchorOf(this, 'heightAnchor'); }
    get centerXAnchor() { return anchorOf(this, 'centerXAnchor'); }
    get centerYAnchor() { return anchorOf(this, 'centerYAnchor'); }
    // 按文字基线对齐，不是按边框。两行字号不同的文字并排时差别很明显
    get firstBaselineAnchor() { return anchorOf(this, 'firstBaselineAnchor'); }
    get lastBaselineAnchor() { return anchorOf(this, 'lastBaselineAnchor'); }

    // 刘海、Home 指示条、状态栏让出来的那块
    get safeAreaLayoutGuide() { return nativeGetOwned(this, 'safeAreaLayoutGuide'); }
    get layoutMarginsGuide() { return nativeGetOwned(this, 'layoutMarginsGuide'); }
    /**
     * 键盘避让。**收起时它贴安全区底边，弹出时贴键盘顶边**，所以把内容的
     * 底边约束到它的 topAnchor，一条约束管两种状态：
     *
     *     field.bottomAnchor
     *       .constraintEqualToAnchor(view.keyboardLayoutGuide.topAnchor,
     *                                { constant: -16 }).isActive = true;
     */
    get keyboardLayoutGuide() { return nativeGetOwned(this, 'keyboardLayoutGuide'); }
    /**
     * 让这棵子树里的 first responder 交出身份——收键盘最常用的那一个。
     * force 为 true 时不管对方愿不愿意。
     */
    endEditing(force) { return nativeCall(this, 'endEditing:', [!!force]); }
    // 一行字的舒适宽度，长文本用它比用 safeArea 好读
    get readableContentGuide() { return nativeGetOwned(this, 'readableContentGuide'); }

    // 装在这个 view 上的约束。注意**不是**「影响这个 view 的约束」——
    // 约束装在两端的最近公共祖先上，所以约束子视图的那些在父视图这里
    get constraints() {
      return ownAll(this, 'constraints', nativeGetObjectArray(this, 'constraints'));
    }
    get layoutGuides() {
      return ownAll(this, 'layoutGuides', nativeGetObjectArray(this, 'layoutGuides'));
    }
    addLayoutGuide(guide) {
      nativeCall(this, 'addLayoutGuide:', [guide]);
      ownOne(this, 'layoutGuides', guide);
    }
    removeLayoutGuide(guide) {
      nativeCall(this, 'removeLayoutGuide:', [guide]);
      disown(this, 'layoutGuides', guide);
    }

    // 固有尺寸变了要主动说一声，否则求解器还用着上一次的值
    invalidateIntrinsicContentSize() {
      nativeCall(this, 'invalidateIntrinsicContentSize', []);
    }

    // 内容抱紧 / 抗压缩。同一条约束的两个方向：
    //   抱紧  = 「别把我拉得比固有尺寸大」的坚持程度
    //   抗压缩 = 「别把我压得比固有尺寸小」的坚持程度
    // 想要 flex-1 的效果，就把那一个的抱紧优先级调低，它会去吃掉剩余空间
    contentHuggingPriorityForAxis(axis) {
      return nativeCall(this, 'contentHuggingPriorityForAxis:', [axis]);
    }
    setContentHuggingPriority(priority, options) {
      const o = options || {};
      if (!(has(o, 'forAxis'))) {
        throw new TypeError('setContentHuggingPriority needs { forAxis }');
      }
      nativeCall(this, 'setContentHuggingPriority:forAxis:',
                 [toNumberOrName(priority, 'priority'), o.forAxis]);
    }
    contentCompressionResistancePriorityForAxis(axis) {
      return nativeCall(this, 'contentCompressionResistancePriorityForAxis:', [axis]);
    }
    setContentCompressionResistancePriority(priority, options) {
      const o = options || {};
      if (!(has(o, 'forAxis'))) {
        throw new TypeError('setContentCompressionResistancePriority needs { forAxis }');
      }
      nativeCall(this, 'setContentCompressionResistancePriority:forAxis:',
                 [toNumberOrName(priority, 'priority'), o.forAxis]);
    }

    // 按约束算出来该多大。sizeThatFits 问的是 view 自己的意见，
    // 这个问的是**整棵子树的约束**解出来多大
    systemLayoutSizeFittingSize(size, options) {
      const target = structArg(size, SIZE_FIELDS, 'systemLayoutSizeFittingSize');
      const o = options || {};
      if (has(o, 'withHorizontalFittingPriority') || has(o, 'verticalFittingPriority')) {
        return toSize(nativeCall(
          this,
          'systemLayoutSizeFittingSize:withHorizontalFittingPriority:verticalFittingPriority:',
          [target, o.withHorizontalFittingPriority, o.verticalFittingPriority]));
      }
      return toSize(nativeCall(this, 'systemLayoutSizeFittingSize:', [target]));
    }

    // ---- 排版调试 ----
    // UIKit 在我们这个环境里对约束冲突**一声不吭**（stdout / stderr / os_log
    // 三路实测全空），JS 开发者也没有 Xcode 控制台可看，所以这三个是唯一的
    // 自查手段。
    get hasAmbiguousLayout() {
      requireNative(this, 'hasAmbiguousLayout');
      return nativeGet(this, 'hasAmbiguousLayout');
    }
    // 在几个同样合法的解之间跳一下，肉眼就能看出哪里没约束够
    exerciseAmbiguityInLayout() {
      nativeCall(this, 'exerciseAmbiguityInLayout', []);
    }
    constraintsAffectingLayoutForAxis(axis) {
      return nativeCallObjectArray(this, 'constraintsAffectingLayoutForAxis:', [axis]);
    }

    // ---- 外观 ----
    // 背景色。nil 表示透明，JS 侧用 null 表示。
    get backgroundColor() {
      requireNative(this, 'backgroundColor');
      return colorString(nativeGetOwned(this, 'backgroundColor'));
    }
    set backgroundColor(value) {
      requireNative(this, 'backgroundColor');
      {
      const color = colorArg(value, 'backgroundColor');
      if (color === undefined) return;   // 不合法，警告过了，保留旧值
      nativeSetOwned(this, 'backgroundColor', color);
    };
    }
    get alpha() { requireNative(this, 'alpha'); return nativeGet(this, 'alpha'); }
    set alpha(value) { requireNative(this, 'alpha'); nativeSet(this, 'alpha', toNumber(value, 'alpha')); }
    get isHidden() { requireNative(this, 'isHidden'); return nativeGet(this, 'isHidden'); }
    set isHidden(value) { requireNative(this, 'isHidden'); nativeSet(this, 'isHidden', toBoolean(value)); }
    get clipsToBounds() {
      requireNative(this, 'clipsToBounds');
      return nativeGet(this, 'clipsToBounds');
    }
    set clipsToBounds(value) {
      requireNative(this, 'clipsToBounds');
      nativeSet(this, 'clipsToBounds', toBoolean(value));
    }
    get isOpaque() { requireNative(this, 'isOpaque'); return nativeGet(this, 'isOpaque'); }
    set isOpaque(value) { requireNative(this, 'isOpaque'); nativeSet(this, 'isOpaque', toBoolean(value)); }
    get isUserInteractionEnabled() {
      requireNative(this, 'isUserInteractionEnabled');
      return nativeGet(this, 'isUserInteractionEnabled');
    }
    set isUserInteractionEnabled(value) {
      requireNative(this, 'isUserInteractionEnabled');
      nativeSet(this, 'isUserInteractionEnabled', toBoolean(value));
    }
    get tag() { requireNative(this, 'tag'); return nativeGet(this, 'tag'); }
    set tag(value) { requireNative(this, 'tag'); nativeSet(this, 'tag', toInteger(value, 'tag')); }
    get contentMode() {
      requireNative(this, 'contentMode');
      return nativeGet(this, 'contentMode');
    }
    set contentMode(value) {
      requireNative(this, 'contentMode');
      nativeSet(this, 'contentMode', value);
    }
    // 「我天生多大」。UILabel 按文字算，普通 UIView 返回 (-1, -1)
    // 表示没有固有尺寸——这是 UIViewNoIntrinsicMetric。
    get intrinsicContentSize() {
      requireNative(this, 'intrinsicContentSize');
      return toSize(nativeGet(this, 'intrinsicContentSize'));
    }
  });

  // 字体。不能直接构造，走类方法。

})
