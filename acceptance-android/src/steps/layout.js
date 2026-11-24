// 布局这一组：ViewGroup.LayoutParams 一族、LinearLayout、FrameLayout、ConstraintLayout、
// 读布局结果、层级操作、layoutchange 事件。
//
// 单位都是像素，照 Android 原样。位置的期望值是按 Android 的排版规则算出来的（加权分配、
// 居中、约束），屏幕大小不同的只用相对的量（根视图的宽高）来写。

/**
 * 抛了什么：没抛是「没抛」，抛了是错误的 name
 * @param {() => unknown} fn
 */
function thrown(fn) {
  try {
    fn();
    return '没抛';
  } catch (err) {
    return err instanceof Error ? err.name : typeof err;
  }
}

/**
 * 跑 fn，收集这期间 console.warn 打的话
 * @param {() => unknown} fn
 * @returns {string[]}
 */
function warnings(fn) {
  /** @type {string[]} */
  const got = [];
  const original = console.warn;
  console.warn = (...args) => { got.push(args.map(String).join(' ')); };
  try {
    fn();
  } finally {
    console.warn = original;
  }
  return got;
}

/**
 * 一条警告、而且列出了可选值
 * @param {string[]} got
 */
const oneListingWarning = (got) => got.length === 1 && got[0].includes('expected one of');

/** @param {number} ms */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 等一个事件，最多等 ms 毫秒。等到了给事件，没等到给 null
 * @param {EventTarget} target
 * @param {string} type
 * @param {number} ms
 * @returns {Promise<any>}
 */
function nextEvent(target, type, ms) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      target.removeEventListener(type, on);
      resolve(null);
    }, ms);
    /** @param {Event} e */
    function on(e) {
      clearTimeout(timer);
      target.removeEventListener(type, on);
      resolve(e);
    }
    target.addEventListener(type, on);
  });
}

/** @param {any} v */
const box = (v) => /** @type {any} */ (v);

/** @param {any} e */
const bounds = (e) => [e.left, e.top, e.right, e.bottom].join(',');
/** @param {any} e */
const oldBounds = (e) => [e.oldLeft, e.oldTop, e.oldRight, e.oldBottom].join(',');

/** @param {import("../main.js").StepContext} ctx */
export async function stepLayout(ctx) {
  const { assert } = ctx;
  console.log('  --- 布局 ---');
  const activity = application.activity;
  const G = /** @type {any} */ (globalThis);
  const VGLayoutParams = G.ViewGroup.LayoutParams;
  const MarginLayoutParams = G.ViewGroup.MarginLayoutParams;
  const LLParams = G.LinearLayout.LayoutParams;
  const FLParams = G.FrameLayout?.LayoutParams;
  const CLParams = G.ConstraintLayout?.LayoutParams;

  // ===== 类和名字 =====
  assert('ViewGroup.LayoutParams 是类', typeof VGLayoutParams, 'function');
  assert('MarginLayoutParams 继承 LayoutParams',
         MarginLayoutParams.prototype instanceof VGLayoutParams, true);
  assert('LinearLayout.LayoutParams 继承 MarginLayoutParams', LLParams.prototype instanceof MarginLayoutParams, true);
  assert('FrameLayout.LayoutParams 继承 MarginLayoutParams', FLParams.prototype instanceof MarginLayoutParams, true);
  assert('ConstraintLayout.LayoutParams 继承 MarginLayoutParams', CLParams.prototype instanceof MarginLayoutParams, true);
  assert('FrameLayout 是 ViewGroup', G.FrameLayout.prototype instanceof ViewGroup, true);
  assert('ConstraintLayout 是 ViewGroup', G.ConstraintLayout.prototype instanceof ViewGroup, true);
  assert('LayoutParams 是嵌套的类，不挂在全局', 'LayoutParams' in globalThis, false);
  assert('带点的名字也不挂在全局', 'LinearLayout.LayoutParams' in globalThis, false);
  assert('不接 ConstraintSet', 'ConstraintSet' in globalThis, false);
  assert('LayoutParams 不是 EventTarget', new VGLayoutParams(1, 1) instanceof EventTarget, false);

  // ===== ViewGroup.LayoutParams：宽高 =====
  const p = new VGLayoutParams(100, 'wrapContent');
  assert('构造给的宽读回来', p.width, 100);
  assert('构造给的 wrapContent 读回来是名字', p.height, 'wrapContent');
  const p2 = new VGLayoutParams('matchParent', 2.7);
  assert('matchParent 读回来是名字', p2.width, 'matchParent');
  assert('宽高向零取整', p2.height, 2);
  assert('数字字符串按 Number() 转', new VGLayoutParams('50', 1).width, 50);
  assert('构造时名字写错抛 TypeError', thrown(() => new VGLayoutParams('big', 1)), 'TypeError');
  assert('构造时不收 fillParent（废弃的名字）', thrown(() => new VGLayoutParams('fillParent', 1)), 'TypeError');
  assert('构造时负数抛 RangeError', thrown(() => new VGLayoutParams(-5, 1)), 'RangeError');
  assert('构造时 -1 也抛 RangeError（要写 matchParent）', thrown(() => new VGLayoutParams(-1, 1)), 'RangeError');
  assert('构造时 NaN 抛 TypeError', thrown(() => new VGLayoutParams(NaN, 1)), 'TypeError');
  assert('构造不给参数抛 TypeError', thrown(() => new VGLayoutParams()), 'TypeError');
  assert('构造只给一个数抛 TypeError', thrown(() => new VGLayoutParams(10)), 'TypeError');
  assert('不接 XML 样式的构造（给 Context）抛 TypeError',
         thrown(() => new MarginLayoutParams(activity, null)), 'TypeError');
  assert('非 ConstraintLayout 的不收 matchConstraint', thrown(() => new VGLayoutParams('matchConstraint', 1)), 'TypeError');

  p.width = 'wrapContent';
  assert('width 写名字', p.width, 'wrapContent');
  p.width = '7';
  assert('width 写数字字符串', p.width, 7);
  p.width = 0;
  assert('width 写 0', p.width, 0);
  let got = warnings(() => { p.width = 'wrap'; });
  assert('width 名字写错打一条警告、列出可选值', oneListingWarning(got), true);
  assert('width 名字写错保持原值', p.width, 0);
  assert('width 写负数抛 RangeError', thrown(() => { p.width = -3; }), 'RangeError');
  assert('width 写 NaN 抛 TypeError', thrown(() => { p.width = NaN; }), 'TypeError');
  assert('抛了之后保持原值', p.width, 0);

  // 拷贝构造
  const copy = new VGLayoutParams(p2);
  assert('拷贝构造是新对象', copy !== p2, true);
  assert('拷贝构造带上宽', copy.width, 'matchParent');
  assert('拷贝构造带上高', copy.height, 2);

  // ===== MarginLayoutParams =====
  const m = new MarginLayoutParams(10, 20);
  assert('外边距默认是 0', [m.leftMargin, m.topMargin, m.rightMargin, m.bottomMargin].join(','), '0,0,0,0');
  m.setMargins(1, '2', 3.9, 4);
  assert('setMargins 四个都写进去（照 Web IDL 转）',
         [m.leftMargin, m.topMargin, m.rightMargin, m.bottomMargin].join(','), '1,2,3,4');
  m.leftMargin = -10;
  assert('外边距可以是负数', m.leftMargin, -10);
  assert('setMargins 少给参数抛 TypeError', thrown(() => m.setMargins(1, 2, 3)), 'TypeError');
  assert('setMargins 有一个是 NaN 抛 TypeError', thrown(() => m.setMargins(1, NaN, 3, 4)), 'TypeError');
  assert('抛了之后外边距不变', m.topMargin, 2);
  assert('没设 marginStart 时读到的是左外边距', m.marginStart, -10);
  assert('没设 marginStart 时 isMarginRelative 是 false', m.isMarginRelative, false);
  m.marginStart = 7;
  m.marginEnd = 8;
  assert('marginStart 写了读回来', m.marginStart, 7);
  assert('marginEnd 写了读回来', m.marginEnd, 8);
  assert('设了 marginStart 之后 isMarginRelative 是 true', m.isMarginRelative, true);
  assert('isMarginRelative 只读', thrown(() => { box(m).isMarginRelative = false; }), 'TypeError');
  const mSource = new MarginLayoutParams(30, 40);
  mSource.setMargins(5, 6, 7, 8);
  const llFromMargin = new LLParams(mSource);
  assert('LinearLayout.LayoutParams 从 MarginLayoutParams 拷贝：带上外边距',
         [llFromMargin.width, llFromMargin.height, llFromMargin.leftMargin, llFromMargin.bottomMargin].join(','),
         '30,40,5,8');

  // ===== LinearLayout.LayoutParams =====
  const ll = new LLParams('matchParent', 'wrapContent');
  assert('weight 默认是 0', ll.weight, 0);
  assert('gravity 默认没指定，是 null', ll.gravity, null);
  assert('第三个参数是 weight', new LLParams(0, 10, 2.5).weight, 2.5);
  ll.weight = '1.5';
  assert('weight 写字符串按 Number() 转', ll.weight, 1.5);
  assert('weight 写 NaN 抛 TypeError', thrown(() => { ll.weight = NaN; }), 'TypeError');
  ll.gravity = ['bottom'];
  assert('gravity 写了读回来', ll.gravity.join(','), 'bottom');
  ll.gravity = null;
  assert('gravity 写 null 回到没指定', ll.gravity, null);
  ll.gravity = ['end', 'centerVertical'];
  got = warnings(() => { ll.gravity = ['nope']; });
  assert('gravity 名字写错打一条警告、列出可选值', oneListingWarning(got), true);
  assert('gravity 名字写错保持原值', ll.gravity.join(','), 'end,centerVertical');
  got = warnings(() => { ll.gravity = ['left', 'right']; });
  assert('gravity 同一个方向写两个，打一条警告', got.length, 1);
  assert('同一个方向写两个保持原值', ll.gravity.join(','), 'end,centerVertical');
  got = warnings(() => { ll.gravity = ['center']; });
  assert('不收合起来的名字 center', got.length, 1);
  got = warnings(() => { ll.gravity = ['fill']; });
  assert('不收合起来的名字 fill', got.length, 1);
  assert('gravity 写一个字符串（不是数组）抛 TypeError', thrown(() => { ll.gravity = 'bottom'; }), 'TypeError');
  ll.gravity = ['fillHorizontal', 'clipVertical', 'top'];
  assert('读回来按横、竖、裁切的顺序', ll.gravity.join(','), 'fillHorizontal,top,clipVertical');
  ll.gravity = [];
  assert('空数组是「没有对齐」，不是没指定', ll.gravity.join(','), '');
  ll.gravity = ['start'];
  assert('start 读回来是 start（不是 left）', ll.gravity.join(','), 'start');

  // ===== FrameLayout.LayoutParams =====
  const fp = new FLParams(10, 10, ['right']);
  assert('FrameLayout.LayoutParams 第三个参数是 gravity', fp.gravity.join(','), 'right');
  assert('FrameLayout.LayoutParams 不给 gravity 是 null', new FLParams(1, 1).gravity, null);
  assert('构造时 gravity 写错抛 TypeError', thrown(() => new FLParams(1, 1, ['nope'])), 'TypeError');
  assert('构造时 gravity 同一个方向两个抛 TypeError', thrown(() => new FLParams(1, 1, ['top', 'bottom'])), 'TypeError');

  // ===== ConstraintLayout.LayoutParams =====
  const cp = new CLParams('matchConstraint', 100);
  assert('ConstraintLayout 的宽可以是 matchConstraint', cp.width, 'matchConstraint');
  cp.width = 0;
  assert('ConstraintLayout 的宽写 0 读回来是 matchConstraint', cp.width, 'matchConstraint');
  cp.width = 'matchParent';
  assert('ConstraintLayout 的宽也收 matchParent', cp.width, 'matchParent');
  assert('约束默认没设，是 null', cp.topToTop, null);
  cp.topToTop = 'parent';
  assert('约束写 parent', cp.topToTop, 'parent');
  cp.topToTop = 42;
  assert('约束写视图的 id', cp.topToTop, 42);
  cp.topToTop = null;
  assert('约束写 null 清掉', cp.topToTop, null);
  cp.topToTop = 42;
  got = warnings(() => { cp.topToTop = 'parnt'; });
  assert('约束名字写错打一条警告', oneListingWarning(got), true);
  assert('约束名字写错保持原值', cp.topToTop, 42);
  assert('约束写 NaN 抛 TypeError', thrown(() => { cp.topToTop = NaN; }), 'TypeError');
  const anchors = ['leftToLeft', 'leftToRight', 'rightToLeft', 'rightToRight', 'topToTop', 'topToBottom',
                   'bottomToTop', 'bottomToBottom', 'baselineToBaseline', 'baselineToTop', 'baselineToBottom',
                   'startToEnd', 'startToStart', 'endToStart', 'endToEnd', 'circleConstraint'];
  const anchorProbe = new CLParams(1, 1);
  assert('16 个约束都能写能读', anchors.every((name, i) => {
    const a = /** @type {any} */ (anchorProbe);
    if (a[name] !== null) return false;
    a[name] = i + 1;
    return a[name] === i + 1;
  }), true);
  assert('偏移比例默认 0.5', cp.horizontalBias, 0.5);
  cp.horizontalBias = 0.25;
  assert('horizontalBias 写了读回来', cp.horizontalBias, 0.25);
  cp.verticalBias = 1;
  assert('verticalBias 写了读回来', cp.verticalBias, 1);
  assert('dimensionRatio 默认 null', cp.dimensionRatio, null);
  cp.dimensionRatio = 'H,16:9';
  assert('dimensionRatio 写了读回来', cp.dimensionRatio, 'H,16:9');
  cp.dimensionRatio = null;
  assert('dimensionRatio 写 null', cp.dimensionRatio, null);
  assert('链的权重默认没设，是 null', cp.horizontalWeight, null);
  cp.horizontalWeight = 2;
  cp.verticalWeight = 3;
  assert('链的权重写了读回来', [cp.horizontalWeight, cp.verticalWeight].join(','), '2,3');
  cp.horizontalWeight = null;
  assert('链的权重写 null 清掉', cp.horizontalWeight, null);
  assert('链的样式默认 spread', cp.horizontalChainStyle, 'spread');
  cp.horizontalChainStyle = 'packed';
  cp.verticalChainStyle = 'spreadInside';
  assert('链的样式写了读回来', [cp.horizontalChainStyle, cp.verticalChainStyle].join(','), 'packed,spreadInside');
  got = warnings(() => { cp.horizontalChainStyle = 'tight'; });
  assert('链的样式写错打一条警告', oneListingWarning(got), true);
  assert('链的样式写错保持原值', cp.horizontalChainStyle, 'packed');
  assert('matchConstraintDefaultWidth 默认 spread', cp.matchConstraintDefaultWidth, 'spread');
  cp.matchConstraintDefaultWidth = 'percent';
  cp.matchConstraintDefaultHeight = 'wrap';
  assert('matchConstraintDefault 写了读回来',
         [cp.matchConstraintDefaultWidth, cp.matchConstraintDefaultHeight].join(','), 'percent,wrap');
  cp.matchConstraintMinWidth = 10;
  cp.matchConstraintMinHeight = 11;
  cp.matchConstraintMaxWidth = 12;
  cp.matchConstraintMaxHeight = 13;
  assert('matchConstraint 的最小最大值',
         [cp.matchConstraintMinWidth, cp.matchConstraintMinHeight, cp.matchConstraintMaxWidth,
          cp.matchConstraintMaxHeight].join(','), '10,11,12,13');
  assert('matchConstraintPercentWidth 默认 1', cp.matchConstraintPercentWidth, 1);
  cp.matchConstraintPercentWidth = 0.5;
  cp.matchConstraintPercentHeight = 0.75;
  assert('matchConstraintPercent 写了读回来',
         [cp.matchConstraintPercentWidth, cp.matchConstraintPercentHeight].join(','), '0.5,0.75');
  assert('constrainedWidth 默认 false', cp.constrainedWidth, false);
  cp.constrainedWidth = 1;
  cp.constrainedHeight = 'yes';
  assert('constrained 照 Boolean() 转', [cp.constrainedWidth, cp.constrainedHeight].join(','), 'true,true');
  assert('wrapBehaviorInParent 默认 included', cp.wrapBehaviorInParent, 'included');
  cp.wrapBehaviorInParent = 'verticalOnly';
  assert('wrapBehaviorInParent 写了读回来', cp.wrapBehaviorInParent, 'verticalOnly');
  cp.circleRadius = 80;
  cp.circleAngle = 45.5;
  assert('环形定位的半径和角度', [cp.circleRadius, cp.circleAngle].join(','), '80,45.5');
  assert('视图隐藏时的外边距默认没设，是 null', cp.goneTopMargin, null);
  const goneNames = ['goneLeftMargin', 'goneTopMargin', 'goneRightMargin', 'goneBottomMargin',
                     'goneStartMargin', 'goneEndMargin', 'goneBaselineMargin'];
  assert('7 个隐藏时的外边距都能写能读', goneNames.every((name, i) => {
    const a = /** @type {any} */ (cp);
    a[name] = i + 5;
    const ok = a[name] === i + 5;
    a[name] = null;
    return ok && a[name] === null;
  }), true);
  cp.baselineMargin = 6;
  assert('baselineMargin 写了读回来', cp.baselineMargin, 6);

  // ===== id =====
  const idView = new View(activity);
  assert('新建的视图没有 id，是 null', idView.id, null);
  const id1 = G.View.generateViewId();
  const id2 = G.View.generateViewId();
  assert('generateViewId 给正整数', Number.isInteger(id1) && id1 > 0, true);
  assert('generateViewId 每次不一样', id1 !== id2, true);
  idView.id = id1;
  assert('id 写了读回来', idView.id, id1);
  idView.id = '12';
  assert('id 写数字字符串', idView.id, 12);
  idView.id = null;
  assert('id 写 null 清掉', idView.id, null);
  assert('id 写 NaN 抛 TypeError', thrown(() => { idView.id = NaN; }), 'TypeError');

  // ===== 读布局结果：没挂上的视图 =====
  const loose = new View(activity);
  assert('没排过版的视图宽高是 0', [loose.left, loose.top, loose.width, loose.height].join(','), '0,0,0,0');
  assert('没排过版 isLaidOut 是 false', loose.isLaidOut, false);
  assert('left 只读', thrown(() => { box(loose).left = 1; }), 'TypeError');
  assert('width 只读', thrown(() => { box(loose).width = 1; }), 'TypeError');
  assert('measuredWidth 只读', thrown(() => { box(loose).measuredWidth = 1; }), 'TypeError');
  assert('没加进布局的视图 parent 是 null', loose.parent, null);
  assert('没加进布局的视图 layoutParams 是 null', loose.layoutParams, null);

  // measure 和 MeasureSpec
  const MeasureSpec = G.View.MeasureSpec;
  const exactly = MeasureSpec.makeMeasureSpec(123, 'exactly');
  assert('MeasureSpec.getMode', MeasureSpec.getMode(exactly), 'exactly');
  assert('MeasureSpec.getSize', MeasureSpec.getSize(exactly), 123);
  assert('MeasureSpec 的 atMost', MeasureSpec.getMode(MeasureSpec.makeMeasureSpec(10, 'atMost')), 'atMost');
  assert('MeasureSpec 的 unspecified', MeasureSpec.getMode(MeasureSpec.makeMeasureSpec(0, 'unspecified')), 'unspecified');
  assert('makeMeasureSpec 模式写错抛 TypeError', thrown(() => MeasureSpec.makeMeasureSpec(1, 'exact')), 'TypeError');
  assert('makeMeasureSpec 尺寸是负数抛 RangeError', thrown(() => MeasureSpec.makeMeasureSpec(-1, 'exactly')), 'RangeError');
  assert('makeMeasureSpec 尺寸超过 2^30-1 抛 RangeError',
         thrown(() => MeasureSpec.makeMeasureSpec(0x40000000, 'exactly')), 'RangeError');
  assert('MeasureSpec 不是类，不能 new', thrown(() => new MeasureSpec()), 'TypeError');
  loose.measure(exactly, MeasureSpec.makeMeasureSpec(45, 'exactly'));
  assert('measure 之后 measuredWidth / measuredHeight', [loose.measuredWidth, loose.measuredHeight].join(','), '123,45');
  assert('measure 不改 width（那是排版的结果）', loose.width, 0);
  loose.measure(MeasureSpec.makeMeasureSpec(77, 'atMost'), MeasureSpec.makeMeasureSpec(0, 'unspecified'));
  assert('普通 View 在 atMost 下取满上限', loose.measuredWidth, 77);
  assert('measure 少给参数抛 TypeError', thrown(() => box(loose).measure(exactly)), 'TypeError');
  // minimumWidth / minimumHeight：在 unspecified 下普通 View 量出来就是最小尺寸
  assert('minimumWidth 默认 0', loose.minimumWidth, 0);
  loose.minimumWidth = 150;
  loose.minimumHeight = '60';
  assert('minimumWidth / minimumHeight 写了读回来', [loose.minimumWidth, loose.minimumHeight].join(','), '150,60');
  loose.measure(MeasureSpec.makeMeasureSpec(0, 'unspecified'), MeasureSpec.makeMeasureSpec(0, 'unspecified'));
  assert('unspecified 下量出来是最小尺寸', [loose.measuredWidth, loose.measuredHeight].join(','), '150,60');
  loose.forceLayout();
  assert('forceLayout 之后 isLayoutRequested 是 true', loose.isLayoutRequested, true);

  // ===== LinearLayout 的属性 =====
  const lin0 = new LinearLayout(activity);
  assert('orientation 默认 horizontal', lin0.orientation, 'horizontal');
  lin0.orientation = 'vertical';
  assert('orientation 写了读回来', lin0.orientation, 'vertical');
  got = warnings(() => { lin0.orientation = 'diagonal'; });
  assert('orientation 写错打一条警告、列出可选值', oneListingWarning(got), true);
  assert('orientation 写错保持原值', lin0.orientation, 'vertical');
  assert('gravity 默认 start、top', lin0.gravity.join(','), 'start,top');
  lin0.gravity = ['centerHorizontal'];
  assert('只给横向时竖向补成 top（Android 的规则）', lin0.gravity.join(','), 'centerHorizontal,top');
  lin0.gravity = [];
  assert('空数组补成 start、top', lin0.gravity.join(','), 'start,top');
  lin0.setHorizontalGravity(['right']);
  assert('setHorizontalGravity 只改横向', lin0.gravity.join(','), 'right,top');
  lin0.setVerticalGravity(['bottom']);
  assert('setVerticalGravity 只改竖向', lin0.gravity.join(','), 'right,bottom');
  assert('setHorizontalGravity 给竖向的名字抛 TypeError',
         thrown(() => lin0.setHorizontalGravity(['top'])), 'TypeError');
  assert('setVerticalGravity 名字写错抛 TypeError',
         thrown(() => lin0.setVerticalGravity(['middle'])), 'TypeError');
  got = warnings(() => { lin0.gravity = ['center']; });
  assert('LinearLayout 的 gravity 写错打一条警告', oneListingWarning(got), true);
  assert('weightSum 默认 -1（按子视图的权重算）', lin0.weightSum, -1);
  lin0.weightSum = 3;
  assert('weightSum 写了读回来', lin0.weightSum, 3);
  assert('weightSum 写 NaN 抛 TypeError', thrown(() => { lin0.weightSum = NaN; }), 'TypeError');
  assert('isBaselineAligned 默认 true', lin0.isBaselineAligned, true);
  lin0.isBaselineAligned = false;
  assert('isBaselineAligned 写了读回来', lin0.isBaselineAligned, false);
  assert('baselineAlignedChildIndex 默认没设，是 null', lin0.baselineAlignedChildIndex, null);
  lin0.addView(new View(activity));
  lin0.baselineAlignedChildIndex = 0;
  assert('baselineAlignedChildIndex 写了读回来', lin0.baselineAlignedChildIndex, 0);
  assert('baselineAlignedChildIndex 越界：Java 的异常',
         thrown(() => { lin0.baselineAlignedChildIndex = 5; }), 'IllegalArgumentException');
  assert('isMeasureWithLargestChildEnabled 默认 false', lin0.isMeasureWithLargestChildEnabled, false);
  lin0.isMeasureWithLargestChildEnabled = true;
  assert('isMeasureWithLargestChildEnabled 写了读回来', lin0.isMeasureWithLargestChildEnabled, true);
  assert('showDividers 默认是空数组', lin0.showDividers.join(','), '');
  lin0.showDividers = ['end', 'middle'];
  assert('showDividers 写了按 beginning、middle、end 的顺序读回来', lin0.showDividers.join(','), 'middle,end');
  got = warnings(() => { lin0.showDividers = ['side']; });
  assert('showDividers 写错打一条警告', oneListingWarning(got), true);
  assert('showDividers 写错保持原值', lin0.showDividers.join(','), 'middle,end');
  lin0.dividerPadding = 8;
  assert('dividerPadding 写了读回来', lin0.dividerPadding, 8);
  // getDividerWidth() 在 SDK 里是隐藏的接口，不接
  assert('没有 dividerWidth', 'dividerWidth' in lin0, false);

  // ===== FrameLayout、ConstraintLayout 的属性 =====
  const frame0 = new G.FrameLayout(activity);
  assert('measureAllChildren 默认 false', frame0.measureAllChildren, false);
  frame0.measureAllChildren = true;
  assert('measureAllChildren 写了读回来', frame0.measureAllChildren, true);
  const cl0 = new G.ConstraintLayout(activity);
  assert('ConstraintLayout 的 minWidth 默认 0', cl0.minWidth, 0);
  assert('ConstraintLayout 的 maxWidth 默认是 int 的最大值', cl0.maxWidth, 2147483647);
  cl0.minWidth = 10;
  cl0.minHeight = 11;
  cl0.maxWidth = 500;
  cl0.maxHeight = 600;
  assert('ConstraintLayout 的最小最大尺寸写了读回来',
         [cl0.minWidth, cl0.minHeight, cl0.maxWidth, cl0.maxHeight].join(','), '10,11,500,600');
  assert('new FrameLayout() 不给 context 抛 TypeError', thrown(() => new G.FrameLayout()), 'TypeError');
  assert('new ConstraintLayout(123) 抛 TypeError', thrown(() => new G.ConstraintLayout(123)), 'TypeError');

  // ===== addView 的五种写法 =====
  const g = new LinearLayout(activity);
  g.orientation = 'vertical';
  const a = new View(activity);
  g.addView(a);
  assert('addView(child)：竖向 LinearLayout 给的默认参数是 LinearLayout.LayoutParams',
         a.layoutParams instanceof LLParams, true);
  assert('竖向 LinearLayout 的默认宽高是 matchParent、wrapContent',
         [a.layoutParams.width, a.layoutParams.height].join(','), 'matchParent,wrapContent');
  assert('读两次 layoutParams 是同一个包装', a.layoutParams === a.layoutParams, true);
  assert('addView 之后 parent 是这个布局', a.parent === g, true);
  const b = new View(activity);
  g.addView(b, 0);
  assert('addView(child, index)', g.getChildAt(0) === b, true);
  const c = new View(activity);
  const cParams = new LLParams(10, 20, 1);
  g.addView(c, cParams);
  assert('addView(child, params)：类型对的就是同一个对象', c.layoutParams === cParams, true);
  const d = new View(activity);
  const dParams = new VGLayoutParams(11, 22);
  g.addView(d, dParams);
  assert('类型不对时系统换成 LinearLayout.LayoutParams（新对象）',
         d.layoutParams !== dParams && d.layoutParams instanceof LLParams, true);
  assert('换出来的带着宽高', [d.layoutParams.width, d.layoutParams.height].join(','), '11,22');
  const e = new View(activity);
  g.addView(e, 30, 'wrapContent');
  assert('addView(child, width, height)', [e.layoutParams.width, e.layoutParams.height].join(','), '30,wrapContent');
  const f = new View(activity);
  const fParams = new LLParams(1, 2);
  g.addView(f, 1, fParams);
  assert('addView(child, index, params)：位置', g.indexOfChild(f), 1);
  assert('addView(child, index, params)：参数', f.layoutParams === fParams, true);
  assert('现在一共 6 个', g.childCount, 6);
  assert('addView 下标越界：Java 的异常',
         thrown(() => g.addView(new View(activity), 99)), 'IndexOutOfBoundsException');
  assert('addView 下标不是数抛 TypeError', thrown(() => g.addView(new View(activity), 'abc')), 'TypeError');
  assert('addView 第三个参数不是 LayoutParams 也不是尺寸抛 TypeError',
         thrown(() => g.addView(new View(activity), 1, {})), 'TypeError');
  assert('addView(child, width, height) 名字写错抛 TypeError',
         thrown(() => g.addView(new View(activity), 'big', 1)), 'TypeError');
  assert('addView 不给参数抛 TypeError', thrown(() => box(g).addView()), 'TypeError');
  assert('抛了的那几次一个都没加进去', g.childCount, 6);

  // ===== 层级操作 =====
  const stranger = new View(activity);
  assert('indexOfChild 不是子视图给 -1', g.indexOfChild(stranger), -1);
  assert('indexOfChild 不是 View 抛 TypeError', thrown(() => g.indexOfChild(box('x'))), 'TypeError');
  g.removeView(b);
  assert('removeView 之后少一个', g.childCount, 5);
  assert('removeView 之后 parent 是 null', b.parent, null);
  assert('removeView 不是子视图什么都不做', thrown(() => g.removeView(stranger)), '没抛');
  assert('removeView 不是 View 抛 TypeError', thrown(() => g.removeView(box(null))), 'TypeError');
  const first = g.getChildAt(0);
  g.removeViewAt(0);
  assert('removeViewAt 去掉那一个', first !== null && first.parent === null && g.childCount === 4, true);
  assert('removeViewAt 越界：Java 的异常', thrown(() => g.removeViewAt(99)), 'IndexOutOfBoundsException');
  assert('removeViewAt 负数：Java 的异常', thrown(() => g.removeViewAt(-1)), 'IndexOutOfBoundsException');
  assert('removeViewAt(NaN) 抛 TypeError', thrown(() => g.removeViewAt(NaN)), 'TypeError');
  const head = g.getChildAt(0);
  g.bringChildToFront(/** @type {View} */ (head));
  assert('bringChildToFront 挪到最后', g.getChildAt(3) === head, true);
  const r0 = g.getChildAt(0);
  const r1 = g.getChildAt(1);
  g.removeViews(0, 2);
  assert('removeViews 去掉一段', g.childCount === 2 && r0?.parent === null && r1?.parent === null, true);
  assert('removeViews 越界：Java 的异常', thrown(() => g.removeViews(0, 99)), 'IndexOutOfBoundsException');
  const remaining = [g.getChildAt(0), g.getChildAt(1)];
  g.removeAllViews();
  assert('removeAllViews 之后是空的', g.childCount, 0);
  assert('removeAllViews 之后它们的 parent 都是 null', remaining.every((v) => v !== null && v.parent === null), true);

  // updateViewLayout 和写 layoutParams
  const host = new LinearLayout(activity);
  const kid = new View(activity);
  host.addView(kid);
  const newParams = new LLParams(5, 6);
  host.updateViewLayout(kid, newParams);
  assert('updateViewLayout 换上新参数', kid.layoutParams === newParams, true);
  assert('updateViewLayout 给不是子视图的：Java 的异常',
         thrown(() => host.updateViewLayout(stranger, new LLParams(1, 1))), 'IllegalArgumentException');
  assert('updateViewLayout 给父视图不认的参数：Java 的异常',
         thrown(() => host.updateViewLayout(kid, new FLParams(1, 1))), 'IllegalArgumentException');
  const assigned = new LLParams(7, 8);
  kid.layoutParams = assigned;
  assert('写 layoutParams 是同一个对象', kid.layoutParams === assigned, true);
  assert('有父视图时写它不认的类型抛 TypeError',
         thrown(() => { kid.layoutParams = new FLParams(1, 1); }), 'TypeError');
  assert('抛了之后 layoutParams 不变', kid.layoutParams === assigned, true);
  stranger.layoutParams = new FLParams(3, 4);
  assert('没有父视图时什么类型都收', stranger.layoutParams instanceof FLParams, true);
  assert('layoutParams 写 null 抛 TypeError', thrown(() => { kid.layoutParams = box(null); }), 'TypeError');
  assert('layoutParams 写普通对象抛 TypeError', thrown(() => { kid.layoutParams = box({ width: 1 }); }), 'TypeError');

  // ===== 挂到屏幕上：真的排一次版 =====
  const root = new G.FrameLayout(activity);

  // 横向 LinearLayout，加权分配：600 宽，c 占 100，剩下 500 按 1:2 分
  const lin = new LinearLayout(activity);
  root.addView(lin, new FLParams(600, 200, ['left', 'top']));
  const wa = new View(activity);
  const wb = new View(activity);
  const wc = new View(activity);
  lin.addView(wa, new LLParams(0, 'matchParent', 1));
  lin.addView(wb, new LLParams(0, 'matchParent', 2));
  const wcParams = new LLParams(100, 50);
  wcParams.gravity = ['bottom'];
  lin.addView(wc, wcParams);

  // 竖向 LinearLayout，靠右上，高度由内容撑开，带外边距
  const col = new LinearLayout(activity);
  col.orientation = 'vertical';
  root.addView(col, new FLParams(300, 'wrapContent', ['right', 'top']));
  const cp1 = new View(activity);
  const cp1Params = new LLParams('matchParent', 50);
  cp1Params.topMargin = 10;
  col.addView(cp1, cp1Params);
  const cp2 = new View(activity);
  col.addView(cp2, new LLParams('matchParent', 70));

  // FrameLayout 靠右下，里面一个居中的
  const fl = new G.FrameLayout(activity);
  root.addView(fl, new FLParams(300, 300, ['right', 'bottom']));
  const centered = new View(activity);
  fl.addView(centered, new FLParams(100, 100, ['centerHorizontal', 'centerVertical']));

  // ConstraintLayout：1000 × 500，往下挪 300
  const cl = new G.ConstraintLayout(activity);
  const clParams = new FLParams(1000, 500);
  clParams.topMargin = 300;
  root.addView(cl, clParams);
  /** @param {number|string} w @param {number|string} h */
  const constrained = (w, h) => {
    const v = new View(activity);
    v.id = G.View.generateViewId();
    const lp = new CLParams(w, h);
    return { v, lp };
  };
  const box1 = constrained(200, 100);
  box1.lp.startToStart = 'parent';
  box1.lp.topToTop = 'parent';
  box1.lp.setMargins(10, 10, 0, 0);
  box1.lp.marginStart = 10;
  cl.addView(box1.v, box1.lp);
  const box2 = constrained(200, 100);
  box2.lp.leftToLeft = 'parent';
  box2.lp.rightToRight = 'parent';
  box2.lp.topToTop = 'parent';
  box2.lp.bottomToBottom = 'parent';
  cl.addView(box2.v, box2.lp);
  const box3 = constrained('matchConstraint', 50);
  box3.lp.leftToRight = box1.v.id;
  box3.lp.rightToRight = 'parent';
  box3.lp.topToBottom = box1.v.id;
  cl.addView(box3.v, box3.lp);
  const box4 = constrained(200, 100);
  box4.lp.leftToLeft = 'parent';
  box4.lp.rightToRight = 'parent';
  box4.lp.horizontalBias = 0.25;
  box4.lp.bottomToBottom = 'parent';
  cl.addView(box4.v, box4.lp);
  const box5 = constrained(100, 'matchConstraint');
  box5.lp.dimensionRatio = '2:1';
  box5.lp.leftToLeft = 'parent';
  box5.lp.topToTop = 'parent';
  box5.lp.bottomToBottom = 'parent';
  cl.addView(box5.v, box5.lp);
  const chainA = constrained(100, 30);
  const chainB = constrained(100, 30);
  chainA.lp.leftToLeft = 'parent';
  chainA.lp.rightToLeft = chainB.v.id;
  chainA.lp.horizontalChainStyle = 'packed';
  chainA.lp.bottomToBottom = 'parent';
  chainB.lp.leftToRight = chainA.v.id;
  chainB.lp.rightToRight = 'parent';
  chainB.lp.bottomToBottom = 'parent';
  cl.addView(chainA.v, chainA.lp);
  cl.addView(chainB.v, chainB.lp);

  // 横向 LinearLayout 的 gravity：100 宽的子视图靠右
  const lin2 = new LinearLayout(activity);
  lin2.gravity = ['right'];
  const lin2Params = new FLParams(600, 100);
  lin2Params.topMargin = 900;
  root.addView(lin2, lin2Params);
  const pushed = new View(activity);
  lin2.addView(pushed, new LLParams(100, 100));

  // 布局事件：挂上去之前就订阅
  const firstBox2 = nextEvent(box2.v, 'layoutchange', 5000);
  let box1Changes = 0;
  box1.v.addEventListener('layoutchange', () => { box1Changes++; });
  const firstBox1 = nextEvent(box1.v, 'layoutchange', 5000);

  activity.setContentView(root);
  assert('setContentView 给根视图的参数是 matchParent',
         [root.layoutParams?.width, root.layoutParams?.height].join(','), 'matchParent,matchParent');
  const contentParent = root.parent;
  assert('根视图的 parent 是系统放内容的 FrameLayout', contentParent instanceof G.FrameLayout, true);
  let top = /** @type {any} */ (root);
  let depth = 0;
  while (top.parent !== null && depth < 20) { top = top.parent; depth++; }
  assert('往上走到最外层的视图，它的 parent 是 null（再往上不是视图）', top.parent === null && depth < 20, true);

  const e2 = await firstBox2;
  assert('挂上去排完版来了 layoutchange', e2 !== null, true);
  if (e2 !== null) {
    assert('layoutchange 是 LayoutChangeEvent', e2 instanceof G.LayoutChangeEvent, true);
    assert('layoutchange 不可取消', e2.cancelable, false);
    assert('layoutchange 的 target 是视图', e2.target === box2.v, true);
    assert('事件带着新的四边（居中）', bounds(e2), '400,200,600,300');
    assert('事件带着旧的四边（第一次是 0）', oldBounds(e2), '0,0,0,0');
    assert('事件的字段只读', thrown(() => { e2.left = 1; }), 'TypeError');
  }
  await firstBox1;
  await sleep(200);

  // 排版的结果
  assert('根视图排过版了', root.isLaidOut, true);
  assert('排完之后 isLayoutRequested 是 false', root.isLayoutRequested, false);
  const W = root.width;
  const H = root.height;
  assert('根视图铺满（宽高大于 0）', W > 0 && H > 0, true);
  assert('加权：1 份的那个宽 166', wa.width, 166);
  assert('加权：2 份的那个宽 334，接在后面', [wb.left, wb.width].join(','), '166,334');
  assert('固定宽的排在最后', [wc.left, wc.width].join(','), '500,100');
  assert('LinearLayout.LayoutParams 的 gravity：靠底', [wc.top, wc.bottom].join(','), '150,200');
  assert('matchParent 的高是父视图的高', wa.height, 200);
  assert('right 和 bottom 是 left + width、top + height', [wb.right, wb.bottom].join(','), '500,200');
  assert('measuredWidth 和排出来的一样', wb.measuredWidth, 334);
  assert('竖向 LinearLayout 靠右', col.left, W - 300);
  assert('wrapContent 的高是内容加外边距', col.height, 130);
  assert('第一个子视图带上外边距', [cp1.top, cp1.width].join(','), '10,300');
  assert('第二个接在后面', cp2.top, 60);
  assert('FrameLayout.LayoutParams 的 gravity：靠右下', [fl.left, fl.top].join(','), (W - 300) + ',' + (H - 300));
  assert('FrameLayout 里居中', [centered.left, centered.top].join(','), '100,100');
  assert('topMargin 把 ConstraintLayout 往下挪', [cl.left, cl.top, cl.width, cl.height].join(','), '0,300,1000,500');
  assert('约束：贴左上，带外边距', [box1.v.left, box1.v.top].join(','), '10,10');
  assert('约束：上下左右都连父视图就居中', [box2.v.left, box2.v.top].join(','), '400,200');
  assert('约束：matchConstraint 填满两个锚点之间', [box3.v.left, box3.v.width, box3.v.top].join(','), '210,790,110');
  assert('约束：horizontalBias 0.25，贴底', [box4.v.left, box4.v.top].join(','), '200,400');
  assert('约束：dimensionRatio 2:1 算出高', [box5.v.height, box5.v.top].join(','), '50,225');
  assert('约束：packed 链整体居中', [chainA.v.left, chainB.v.left].join(','), '400,500');
  assert('LinearLayout 的 gravity：靠右', pushed.left, 500);

  // 位置
  const rootLoc = root.getLocationInWindow();
  const flLoc = fl.getLocationInWindow();
  assert('getLocationInWindow 给 [x, y]', Array.isArray(flLoc) && flLoc.length === 2, true);
  assert('窗口里的位置 = 根视图的位置 + 相对位置',
         flLoc.join(','), (rootLoc[0] + fl.left) + ',' + (rootLoc[1] + fl.top));
  assert('铺满全屏的窗口里，屏幕上的位置和窗口里的一样',
         fl.getLocationOnScreen().join(','), flLoc.join(','));

  // 改了参数不会自己重排；requestLayout 之后才排
  const lp2 = /** @type {any} */ (box2.v.layoutParams);
  assert('读回来的参数就是 addView 时给的那个', lp2 === box2.lp, true);
  lp2.width = 400;
  await sleep(300);
  assert('只改参数的字段，不会重新排版', box2.v.width, 200);
  const second = nextEvent(box2.v, 'layoutchange', 5000);
  box2.v.requestLayout();
  assert('requestLayout 之后 isLayoutRequested 是 true', box2.v.isLayoutRequested, true);
  const e2b = await second;
  assert('requestLayout 之后重新排版，来了 layoutchange', e2b !== null, true);
  if (e2b !== null) {
    assert('新的四边', bounds(e2b), '300,200,700,300');
    assert('旧的四边', oldBounds(e2b), '400,200,600,300');
  }
  assert('重新排版之后宽是 400', box2.v.width, 400);

  // 再赋一次 layoutParams 本身就会请求排版
  const third = nextEvent(box2.v, 'layoutchange', 5000);
  lp2.height = 200;
  box2.v.layoutParams = lp2;
  const e2c = await third;
  assert('赋一次 layoutParams 就重新排版', e2c !== null && bounds(e2c) === '300,150,700,350', true);

  // 四边没变不发
  const beforeCount = box1Changes;
  box1.v.requestLayout();
  await sleep(400);
  assert('重新排了版但四边没变，不发 layoutchange', box1Changes, beforeCount);
  assert('那一次确实排过了', box1.v.isLayoutRequested, false);

  // 摘掉监听器之后再订阅，还收得到
  const fourth = nextEvent(box2.v, 'layoutchange', 5000);
  lp2.width = 100;
  box2.v.requestLayout();
  const e2d = await fourth;
  assert('监听器全摘掉再加回来，事件还在', e2d !== null && bounds(e2d) === '450,150,550,350', true);

  // 自己 new 一个
  const made = new G.LayoutChangeEvent('layoutchange', { left: 1, oldBottom: '7' });
  assert('new LayoutChangeEvent：字段从 init 来，照 Web IDL 转',
         [made.left, made.top, made.oldBottom].join(','), '1,0,7');

  // ===== 所有权：没有变量引用的参数和子视图 =====
  const holder = new LinearLayout(activity);
  const tagged = new View(activity);
  (() => {
    const lp = new LLParams(3, 4);
    /** @type {any} */ (lp).marker = '参数还在';
    tagged.layoutParams = lp;
    const kid2 = new View(activity);
    /** @type {any} */ (kid2).marker = '子视图还在';
    holder.addView(kid2, new LLParams(1, 1));
  })();
  let control = new WeakRef(new View(activity));
  for (let round = 0; round < 6 && control.deref() !== undefined; round++) {
    let junk = [];
    for (let i = 0; i < 200000; i++) junk.push({ i, s: 'x' + i });
    junk = [];
    await sleep(50);
  }
  if (control.deref() !== undefined) {
    console.log('  ! 布局的所有权：对照组没被回收，这一轮 GC 没跑到，下面两条不算数');
  }
  assert('视图持有它的参数：包装上的记号还在', box(tagged.layoutParams)?.marker, '参数还在');
  assert('addView(child, params) 也记了父视图持有子视图', box(holder.getChildAt(0))?.marker, '子视图还在');
}
