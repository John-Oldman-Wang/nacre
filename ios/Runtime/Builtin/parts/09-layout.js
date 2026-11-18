// Auto Layout、CATransaction、外观特征
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const {
    anchorOf,
    constraintOf,
    constructNative,
    define,
    defineNativeClass,
    has,
    nativeCallObject,
    nativeClassCall,
    nativeClassCallValue,
    nativeGet,
    nativeGetOwned,
    nativeOnly,
    nativeSet,
    own,
    requireNative,
    toBoolean,
    toNumber,
    toNumberOrName,
    toRect,
    toText,
    toTextOrNull,
  } = ctx;

  class CATransaction {
    constructor() {
      throw new TypeError(
        'Illegal constructor: CATransaction is a set of class methods, not an object');
    }
    static begin() { nativeClassCallValue('CATransaction', 'begin', []); }
    static commit() { nativeClassCallValue('CATransaction', 'commit', []); }
    static flush() { nativeClassCallValue('CATransaction', 'flush', []); }
    static disableActions() {
      return nativeClassCallValue('CATransaction', 'disableActions', []);
    }
    static setDisableActions(value) {
      nativeClassCallValue('CATransaction', 'setDisableActions:', [toBoolean(value)]);
    }
    static animationDuration() {
      return nativeClassCallValue('CATransaction', 'animationDuration', []);
    }
    static setAnimationDuration(value) {
      nativeClassCallValue('CATransaction', 'setAnimationDuration:', [toNumber(value, 'duration')]);
    }
    static animationTimingFunction() {
      return nativeClassCall('CATransaction', 'animationTimingFunction', []);
    }
    static setAnimationTimingFunction(value) {
      nativeClassCallValue('CATransaction', 'setAnimationTimingFunction:', [value]);
    }
  }
  define(globalThis, 'CATransaction', CATransaction);

  // ---------- Auto Layout ----------
  //
  // 一条约束就是一句等式：
  //
  //     item1.attr1  <关系>  multiplier × item2.attr2 + constant
  //
  // 求解器拿所有约束算出每个 view 的 frame。所以用了约束就**别再写 frame**
  // ——两边在写同一个值，谁最后写谁赢，而且下次布局还会被覆盖。
  //
  // 锚点是「某个 view 的某条边」的对象化。比 7 参的 constraintWithItem:…
  // 好在两点：短，而且**类型安全**——横向锚点连不上纵向锚点。原生那边是
  // 抛 NSInvalidArgumentException，我们在桥上先查、变成 TypeError。
  //
  // 锚点不能构造，只能从 view 或 UILayoutGuide 上取。

  // 「第一段 + options」还原成完整 selector。顺序显式写死，不遍历 options
  // ——键序靠不住，而 multiplier 和 constant 的先后决定了参数下标。
  function anchorConstraint(anchor, first, other, options) {
    const o = options || {};
    let selector = first + ':';
    const args = [other];
    if (has(o, 'multiplier')) {
      selector += 'multiplier:';
      args.push(toNumber(o.multiplier, 'multiplier'));
    }
    if (has(o, 'constant')) {
      selector += 'constant:';
      args.push(toNumber(o.constant, 'constant'));
    }
    return constraintOf(nativeCallObject(anchor, selector, args), anchor, other);
  }
  // 按状态设置时的 { forState: [...] }。缺了就抛，不默默当成 normal——
  // 「给哪个状态设的」是这类方法的核心语义，猜错了界面就不对。
  // 按状态存的东西（UIButton 的标题色 / 图 / 背景图）既不是父子边也不是
  // 属性边，所以躲过了 ownOne 和 nativeSetOwned 两张网。用「名字:状态」
  // 做所有权边的键：重设同一个状态时旧的会被顶掉，不留多余引用。
  // 实测过漏这条的后果：丢掉 JS 引用、GC 之后 imageForState 读回来是个
  // 全新的包装，挂在上面的东西全没了。Chrome 在同样的位置不丢（Attr 节点、
  // adoptedStyleSheets、getAnimations 实测都保住），所以这里也不该丢。
  function stateKey(what, state) {
    return what + ':' + (Array.isArray(state) ? state.join('|') : state);
  }

  function stateOption(options, what) {
    const o = options || {};
    if (!(has(o, 'forState'))) throw new TypeError(what + ' needs { forState }');
    return o.forState;
  }

  // 系统标准间距。差多少由系统按上下文定（8pt 起步，但靠近屏幕边缘、不同
  // 控件之间都不一样），这是 iOS 独有的能力，Web 里没有对应物。
  // multiplier 省略时按 1 ——它是乘法的单位元，省略的含义没有歧义。
  function systemSpacingConstraint(anchor, first, other, options) {
    const o = options || {};
    const multiplier = has(o, 'multiplier') ? toNumber(o.multiplier, 'multiplier') : 1;
    return constraintOf(
      nativeCallObject(anchor, first + ':multiplier:', [other, multiplier]),
      anchor, other);
  }

  const NSLayoutAnchor = defineNativeClass('NSLayoutAnchor',
      class NSLayoutAnchor extends NSObject {
    constructor() { nativeOnly(new.target); }

    constraintEqualToAnchor(other, options) {
      return anchorConstraint(this, 'constraintEqualToAnchor', other, options);
    }
    constraintGreaterThanOrEqualToAnchor(other, options) {
      return anchorConstraint(this, 'constraintGreaterThanOrEqualToAnchor', other, options);
    }
    constraintLessThanOrEqualToAnchor(other, options) {
      return anchorConstraint(this, 'constraintLessThanOrEqualToAnchor', other, options);
    }
  });

  // 横向：leading / trailing / left / right / centerX
  defineNativeClass('NSLayoutXAxisAnchor', class NSLayoutXAxisAnchor extends NSLayoutAnchor {
    constructor() { nativeOnly(new.target); }

    constraintEqualToSystemSpacingAfterAnchor(other, options) {
      return systemSpacingConstraint(
        this, 'constraintEqualToSystemSpacingAfterAnchor', other, options);
    }
    constraintGreaterThanOrEqualToSystemSpacingAfterAnchor(other, options) {
      return systemSpacingConstraint(
        this, 'constraintGreaterThanOrEqualToSystemSpacingAfterAnchor', other, options);
    }
    constraintLessThanOrEqualToSystemSpacingAfterAnchor(other, options) {
      return systemSpacingConstraint(
        this, 'constraintLessThanOrEqualToSystemSpacingAfterAnchor', other, options);
    }
    // 两个锚点之间的距离，本身又是一个可约束的量
    anchorWithOffsetToAnchor(other) {
      const dimension = nativeCallObject(this, 'anchorWithOffsetToAnchor:', [other]);
      own(dimension, 'from', this);
      own(dimension, 'to', other);
      return dimension;
    }
  });

  // 纵向：top / bottom / centerY / firstBaseline / lastBaseline
  defineNativeClass('NSLayoutYAxisAnchor', class NSLayoutYAxisAnchor extends NSLayoutAnchor {
    constructor() { nativeOnly(new.target); }

    constraintEqualToSystemSpacingBelowAnchor(other, options) {
      return systemSpacingConstraint(
        this, 'constraintEqualToSystemSpacingBelowAnchor', other, options);
    }
    constraintGreaterThanOrEqualToSystemSpacingBelowAnchor(other, options) {
      return systemSpacingConstraint(
        this, 'constraintGreaterThanOrEqualToSystemSpacingBelowAnchor', other, options);
    }
    constraintLessThanOrEqualToSystemSpacingBelowAnchor(other, options) {
      return systemSpacingConstraint(
        this, 'constraintLessThanOrEqualToSystemSpacingBelowAnchor', other, options);
    }
    anchorWithOffsetToAnchor(other) {
      const dimension = nativeCallObject(this, 'anchorWithOffsetToAnchor:', [other]);
      own(dimension, 'from', this);
      own(dimension, 'to', other);
      return dimension;
    }
  });

  // 尺寸：width / height。只有它能和常数比，也只有它能带 multiplier
  defineNativeClass('NSLayoutDimension', class NSLayoutDimension extends NSLayoutAnchor {
    constructor() { nativeOnly(new.target); }

    constraintEqualToConstant(value) {
      return nativeCallObject(this, 'constraintEqualToConstant:', [toNumber(value, 'constant')]);
    }
    constraintGreaterThanOrEqualToConstant(value) {
      return nativeCallObject(this, 'constraintGreaterThanOrEqualToConstant:', [toNumber(value, 'constant')]);
    }
    constraintLessThanOrEqualToConstant(value) {
      return nativeCallObject(this, 'constraintLessThanOrEqualToConstant:', [toNumber(value, 'constant')]);
    }
  });

  defineNativeClass('NSLayoutConstraint', class NSLayoutConstraint extends NSObject {
    constructor() { nativeOnly(new.target); }

    // 唯一的开关。激活时约束被装到两端的最近公共祖先上——所以**没有公共
    // 祖先就激活不了**，原生那边是抛异常，这里转成 TypeError。
    get isActive() { requireNative(this, 'isActive'); return nativeGet(this, 'isActive'); }
    set isActive(value) { requireNative(this, 'isActive'); nativeSet(this, 'isActive', toBoolean(value)); }

    // 约束里唯一可写的数值，做动画改的就是它
    get constant() { requireNative(this, 'constant'); return nativeGet(this, 'constant'); }
    set constant(value) { requireNative(this, 'constant'); nativeSet(this, 'constant', toNumber(value, 'constant')); }

    // **写接受字符串或数字，读永远返回数字。** UILayoutPriority 是 float，
    // 具名值只有七个，749 这种值没有名字——读出来硬编成字符串只能编一个。
    get priority() { requireNative(this, 'priority'); return nativeGet(this, 'priority'); }
    set priority(value) { requireNative(this, 'priority'); nativeSet(this, 'priority', toNumberOrName(value, 'priority')); }

    // 调试用。UIKit 报约束冲突时会把它打出来
    get identifier() { requireNative(this, 'identifier'); return nativeGet(this, 'identifier'); }
    set identifier(value) { requireNative(this, 'identifier'); nativeSet(this, 'identifier', toTextOrNull(value)); }

    // 建好就定死的部分
    get multiplier() { requireNative(this, 'multiplier'); return nativeGet(this, 'multiplier'); }
    get relation() { requireNative(this, 'relation'); return nativeGet(this, 'relation'); }
    get firstAttribute() {
      requireNative(this, 'firstAttribute');
      return nativeGet(this, 'firstAttribute');
    }
    get secondAttribute() {
      requireNative(this, 'secondAttribute');
      return nativeGet(this, 'secondAttribute');
    }
    // firstItem / secondItem 不暴露：原生是 assign，view 一死就是野指针，
    // 头文件自己写着「Access to these properties is not recommended」。
    // 要两端的 view，从锚点走。
    get firstAnchor() { return nativeGetOwned(this, 'firstAnchor'); }
    get secondAnchor() { return nativeGetOwned(this, 'secondAnchor'); }

    // 批量比逐个 isActive = true 好：中间态不会短暂地不可满足
    static activateConstraints(constraints) {
      nativeClassCall('NSLayoutConstraint', 'activateConstraints:',
                      Array.from(constraints));
    }
    static deactivateConstraints(constraints) {
      nativeClassCall('NSLayoutConstraint', 'deactivateConstraints:',
                      Array.from(constraints));
    }
  });

  // 不画东西的矩形。用来占位、分组、做间距，比塞一个透明 UIView 省一个图层。
  // 比 UIView 少两个锚点：没有基线，因为它没有文字。
  const UILayoutGuide = defineNativeClass('UILayoutGuide', class UILayoutGuide extends NSObject {
    constructor() {
      super();
      constructNative(this, new.target, 'UILayoutGuide', []);
    }
    get owningView() { return nativeGetOwned(this, 'owningView'); }
    // 求解之后这个 guide 占的位置，在 owningView 的坐标系里
    get layoutFrame() {
      requireNative(this, 'layoutFrame');
      return toRect(nativeGet(this, 'layoutFrame'));
    }
    get identifier() { requireNative(this, 'identifier'); return nativeGet(this, 'identifier'); }
    set identifier(value) { requireNative(this, 'identifier'); nativeSet(this, 'identifier', toText(value)); }

    get leadingAnchor() { return anchorOf(this, 'leadingAnchor'); }
    get trailingAnchor() { return anchorOf(this, 'trailingAnchor'); }
    get leftAnchor() { return anchorOf(this, 'leftAnchor'); }
    get rightAnchor() { return anchorOf(this, 'rightAnchor'); }
    get topAnchor() { return anchorOf(this, 'topAnchor'); }
    get bottomAnchor() { return anchorOf(this, 'bottomAnchor'); }
    get widthAnchor() { return anchorOf(this, 'widthAnchor'); }
    get heightAnchor() { return anchorOf(this, 'heightAnchor'); }
    get centerXAnchor() { return anchorOf(this, 'centerXAnchor'); }
    get centerYAnchor() { return anchorOf(this, 'centerYAnchor'); }
  });

  // 键盘避让的那条 guide。ObjC 的继承链是
  // UIKeyboardLayoutGuide : UITrackingLayoutGuide : UILayoutGuide，照着放。
  // UITrackingLayoutGuide 那组「按边缘远近自动启停约束」的方法 v1 没做
  const UITrackingLayoutGuide =
    defineNativeClass('UITrackingLayoutGuide', class UITrackingLayoutGuide
                      extends UILayoutGuide {
      constructor() { nativeOnly(new.target); }
    });

  // **键盘收起时它贴安全区底边，弹出时贴键盘顶边**，所以一条约束管两种
  // 状态——不用听键盘通知，也不用自己算动画曲线
  defineNativeClass('UIKeyboardLayoutGuide', class UIKeyboardLayoutGuide
                    extends UITrackingLayoutGuide {
    constructor() { nativeOnly(new.target); }

    /** iPad 的浮动/拆分键盘也跟。默认 false */
    get followsUndockedKeyboard() { return nativeGet(this, 'followsUndockedKeyboard'); }
    set followsUndockedKeyboard(value) {
      nativeSet(this, 'followsUndockedKeyboard', toBoolean(value));
    }
    /** 下滑收键盘时提前多少开始。默认 0 */
    get keyboardDismissPadding() { return nativeGet(this, 'keyboardDismissPadding'); }
    set keyboardDismissPadding(value) {
      nativeSet(this, 'keyboardDismissPadding', toNumber(value, 'keyboardDismissPadding'));
    }
  });

  // 外观特征：一组「当前环境是什么样」的值。从视图、页面、场景的
  // traitCollection 读，只读，不能自己建。先开了七个字段
  defineNativeClass('UITraitCollection', class UITraitCollection extends NSObject {
    constructor() { nativeOnly(new.target); }
    get userInterfaceStyle() {
      requireNative(this, 'userInterfaceStyle');
      return nativeGet(this, 'userInterfaceStyle');
    }
    // 屏幕上 1 pt 等于几个像素
    get displayScale() { requireNative(this, 'displayScale'); return nativeGet(this, 'displayScale'); }
    get preferredContentSizeCategory() {
      requireNative(this, 'preferredContentSizeCategory');
      return nativeGet(this, 'preferredContentSizeCategory');
    }
    get horizontalSizeClass() {
      requireNative(this, 'horizontalSizeClass');
      return nativeGet(this, 'horizontalSizeClass');
    }
    get verticalSizeClass() {
      requireNative(this, 'verticalSizeClass');
      return nativeGet(this, 'verticalSizeClass');
    }
    get accessibilityContrast() {
      requireNative(this, 'accessibilityContrast');
      return nativeGet(this, 'accessibilityContrast');
    }
    get layoutDirection() {
      requireNative(this, 'layoutDirection');
      return nativeGet(this, 'layoutDirection');
    }
  });


  // 这个 part 对外提供的东西
  Object.assign(ctx, { stateKey, stateOption });
})
