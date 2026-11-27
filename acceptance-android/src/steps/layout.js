// 布局这一组（2026-11-27 照「接类的总则」重写）：子视图上的 view.layout（宽高、外边距、权重、对齐、
// 约束），读排版结果的 frame、locationInWindow / locationOnScreen、measure()，layoutchange 事件；
// LinearLayout、FrameLayout、ConstraintLayout 自己的状态，ViewGroup 的 clipChildren / clipToPadding。
//
// 长度都是 dp。位置的期望值照 Android 的排版规则先算好：尺寸都取 8 dp 的倍数，常见的密度（dpi 是 20 的
// 倍数，1 dp 是 k/8 像素）下换成像素都是整数，排出来的位置换回 dp 也是整数，期望值不用跟着密度算。
// 根视图的宽高（屏幕多大）只用相对的量来写。
//
// 中间一段改手机的显示密度：打「[acceptance] density 560」，android/scripts/run-device.sh
// 用 adb shell wm density 改，「density restore」还原；脚本退出时（含中途失败）也会还原。

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
 * 跑 fn，收下这期间打的警告（console.warn 的第一个参数）
 * @param {() => unknown} fn
 * @returns {string[]}
 */
function warnings(fn) {
  /** @type {string[]} */
  const got = [];
  const original = console.warn;
  console.warn = (/** @type {unknown} */ first) => { got.push(String(first)); };
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
 * @returns {Promise<Event | null>}
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

/** frame 写成「x,y,宽,高」，null 是 'null' @param {any} v */
const frameOf = (v) => {
  const f = v.frame;
  return f === null ? 'null' : [f.x, f.y, f.width, f.height].join(',');
};

/** 外边距按上、下、起、止写出来 @param {any} m */
const marginOf = (m) => [m.top, m.bottom, m.start, m.end].join(',');

/** 两个数差不到一点点就算一样（dp 是像素除以密度，换算的路不同时会差在最后一位） @param {number} a @param {number} b */
const near = (a, b) => Math.abs(a - b) < 1e-6;

/** @param {import("../main.js").StepContext} ctx */
export async function stepLayout(ctx) {
  const { assert } = ctx;
  const activity = /** @type {Activity} */ (ctx.activity);
  console.log('  --- 布局 ---');
  const G = /** @type {any} */ (globalThis);
  const { FrameLayout, ConstraintLayout } = G;

  // ===== 去掉的成员和类 =====
  const v0 = box(new View());
  const removed = ['layoutParams', 'left', 'top', 'right', 'bottom', 'width', 'height', 'measuredWidth',
                   'measuredHeight', 'isLaidOut', 'isLayoutRequested', 'id', 'requestLayout', 'forceLayout',
                   'getLocationOnScreen', 'getLocationInWindow'];
  assert('View 上去掉的成员一个都没有了', removed.filter((n) => n in v0).join(','), '');
  assert('没有 View.MeasureSpec、View.generateViewId',
         ['MeasureSpec', 'generateViewId'].filter((n) => n in G.View).join(','), '');
  assert('没有 LayoutParams 一族',
         [('LayoutParams' in G.ViewGroup), ('MarginLayoutParams' in G.ViewGroup), ('LayoutParams' in G.LinearLayout),
          ('LayoutParams' in FrameLayout), ('LayoutParams' in ConstraintLayout), ('LayoutParams' in globalThis)].join(','),
         'false,false,false,false,false,false');
  assert('没有 LayoutChangeEvent', 'LayoutChangeEvent' in globalThis, false);
  assert('不接 ConstraintSet', 'ConstraintSet' in globalThis, false);
  const lin0 = box(new LinearLayout());
  // baselineChild（原来的 baselineAlignedChildIndex）不接：设了下标之后子视图被拿掉、拿光，下一次排版就崩
  assert('LinearLayout 去掉的成员一个都没有了（不接 baselineChild）',
         ['setHorizontalGravity', 'setVerticalGravity', 'baselineAlignedChildIndex', 'baselineChild', 'dividerWidth']
           .filter((n) => n in lin0).join(','), '');

  // ===== 两个新的类 =====
  const fl0 = box(new FrameLayout());
  const cl0 = box(new ConstraintLayout());
  assert('FrameLayout 是 ViewGroup', fl0 instanceof ViewGroup, true);
  assert('ConstraintLayout 是 ViewGroup', cl0 instanceof ViewGroup, true);
  assert('new 出来是自由的', fl0.activity === null && cl0.activity === null, true);
  assert('构造多给的参数不管', thrown(() => new FrameLayout(activity)), '没抛');

  // ===== view.layout：活对象 =====
  const v = box(new View());
  const L = v.layout;
  assert('layout 每次读是同一个对象', v.layout === L, true);
  assert('每个视图一个', box(new View()).layout !== L, true);
  assert('默认宽高是 null（由父视图给默认值）', String(L.width) + ',' + String(L.height), 'null,null');
  assert('默认外边距四个 0', marginOf(L.margin), '0,0,0,0');
  assert('默认 weight 是 0', L.weight, 0);
  assert('默认 gravity 是 null（没指定）', L.gravity, null);

  // 宽高
  L.width = 96;
  assert('width 写数（dp）', L.width, 96);
  L.width = 12.5;
  assert('width 可以是小数', L.width, 12.5);
  L.width = '24';
  assert('数字字符串按 Number() 转', L.width, 24);
  L.width = 0;
  assert('width 写 0', L.width, 0);
  for (const name of ['matchParent', 'wrapContent', 'matchConstraint']) {
    L.width = name;
    assert('width 写 ' + name, L.width, name);
  }
  L.height = 'wrapContent';
  assert('height 写名字', L.height, 'wrapContent');
  L.width = null;
  assert('width 写 null 回到父视图的默认值', L.width, null);
  L.width = 40;
  L.width = undefined;
  assert('width 写 undefined 也是 null', L.width, null);
  L.width = 40;
  let got = warnings(() => { L.width = 'wrap'; });
  assert('width 名字写错打一条警告', got.join(' | '),
         '[Nacre] width has no value "wrap"; expected one of: wrapContent / matchParent / matchConstraint, ignored');
  assert('width 名字写错保持原值', L.width, 40);
  got = warnings(() => { L.width = 'fillParent'; });
  assert('不收废弃的 fillParent', oneListingWarning(got) && L.width === 40, true);
  assert('width 写负数抛 RangeError', thrown(() => { L.width = -1; }), 'RangeError');
  assert('width 写 NaN 抛 TypeError', thrown(() => { L.width = NaN; }), 'TypeError');
  assert('width 写 Infinity 抛 TypeError', thrown(() => { L.width = Infinity; }), 'TypeError');
  assert('width 写对象抛 TypeError', thrown(() => { L.width = {}; }), 'TypeError');
  assert('抛了之后保持原值', L.width, 40);

  // 外边距：{ top, bottom, start, end }，或者一个数（四边一样）
  L.margin = 8;
  assert('margin 写一个数：四边一样', marginOf(L.margin), '8,8,8,8');
  L.margin = { top: 4, start: '2' };
  assert('margin 写对象：没给的是 0，照 Number() 转', marginOf(L.margin), '4,0,2,0');
  L.margin = { top: -6, bottom: 1.5 };
  assert('外边距可以是负数、小数', marginOf(L.margin), '-6,1.5,0,0');
  const m1 = L.margin;
  assert('没变时读两次是同一个对象', L.margin === m1, true);
  assert('读出来是冻结的', Object.isFrozen(m1), true);
  assert('改它的字段抛 TypeError（要整个写回去）', thrown(() => { box(m1).top = 1; }), 'TypeError');
  L.margin = { left: 5, right: 5 };
  assert('margin 没有 left、right（水平方向只有 start / end）', marginOf(L.margin) + '/' + ('left' in L.margin), '0,0,0,0/false');
  L.margin = 3;
  L.margin = null;
  assert('margin 写 null 是四个 0', marginOf(L.margin), '0,0,0,0');
  L.margin = 3;
  assert('margin 有一边是 NaN 抛 TypeError', thrown(() => { L.margin = { top: NaN }; }), 'TypeError');
  assert('margin 写字符串（不是数）抛 TypeError', thrown(() => { L.margin = 'abc'; }), 'TypeError');
  assert('抛了之后外边距不变', marginOf(L.margin), '3,3,3,3');

  // weight
  L.weight = 2;
  assert('weight 写了读回来', L.weight, 2);
  L.weight = '1.5';
  assert('weight 照 Number() 转', L.weight, 1.5);
  assert('weight 写负数抛 RangeError', thrown(() => { L.weight = -1; }), 'RangeError');
  assert('weight 写 NaN 抛 TypeError', thrown(() => { L.weight = NaN; }), 'TypeError');
  L.weight = null;
  assert('weight 写 null 照 Number() 是 0', L.weight, 0);

  // gravity：字符串数组，水平方向只有 start / end
  L.gravity = ['end', 'bottom'];
  assert('gravity 写了读回来', L.gravity.join(','), 'end,bottom');
  assert('gravity 读出来是冻结的', Object.isFrozen(L.gravity), true);
  const arr = ['top'];
  L.gravity = arr;
  arr.push('end');
  assert('写进去之后改原来的数组不影响', L.gravity.join(','), 'top');
  L.gravity = ['clipHorizontal', 'centerVertical', 'fillHorizontal'];
  assert('照写进去的样子读回来（不重排）', L.gravity.join(','), 'clipHorizontal,centerVertical,fillHorizontal');
  L.gravity = [];
  assert('空数组是「没有对齐」，不是 null', Array.isArray(L.gravity) && L.gravity.length === 0, true);
  L.gravity = null;
  assert('gravity 写 null 回到没指定', L.gravity, null);
  L.gravity = ['end'];
  got = warnings(() => { L.gravity = ['left']; });
  assert('不收 left（水平方向只有 start / end），打一条警告', got.join(' | '),
         '[Nacre] gravity has no value "left"; expected one of: centerHorizontal / fillHorizontal / start / end / ' +
         'top / bottom / centerVertical / fillVertical / clipHorizontal / clipVertical, ignored');
  assert('不收 right', oneListingWarning(warnings(() => { L.gravity = ['right']; })), true);
  assert('不收合起来的 center', oneListingWarning(warnings(() => { L.gravity = ['center']; })), true);
  got = warnings(() => { L.gravity = ['top', 'bottom']; });
  assert('同一个方向两个，打一条警告', got.join(' | '),
         '[Nacre] gravity: "top" and "bottom" are both vertical; give at most one per direction, ignored');
  assert('写错之后保持原值', L.gravity.join(','), 'end');
  assert('gravity 写一个字符串（不是数组）抛 TypeError', thrown(() => { L.gravity = 'top'; }), 'TypeError');
  assert('gravity 写数抛 TypeError', thrown(() => { L.gravity = 5; }), 'TypeError');

  // 整个写：没给的回到默认值
  v.layout = { width: 48, margin: 4 };
  assert('整个写 layout 之后还是同一个活对象', v.layout === L, true);
  assert('整个写：给了的写进去', L.width + '/' + marginOf(L.margin), '48/4,4,4,4');
  assert('整个写：没给的回到默认值', String(L.height) + ',' + L.weight + ',' + String(L.gravity), 'null,0,null');
  Object.assign(v.layout, { weight: 3, gravity: ['top'] });
  assert('Object.assign 只改给的几项', [L.width, L.weight, L.gravity.join('')].join(','), '48,3,top');
  got = warnings(() => { v.layout = { width: 'wrap', weight: 9 }; });
  assert('整个写时有一项名字写错：打一条警告，整次不生效', oneListingWarning(got) && L.weight === 3, true);
  assert('整个写时有一项类型不对：抛 TypeError，整次不生效',
         thrown(() => { v.layout = { width: 10, weight: NaN }; }) + '/' + L.width, 'TypeError/48');
  const other = box(new View());
  other.layout = v.layout;
  assert('拿别的视图的 layout 写：照它现在的值', [other.layout.width, other.layout.weight].join(','), '48,3');
  assert('写过去的是值，不是同一个对象', other.layout !== v.layout, true);
  v.layout = null;
  assert('layout 写 null：全部回到默认值',
         [String(L.width), marginOf(L.margin), L.weight, String(L.gravity)].join('/'), 'null/0,0,0,0/0/null');
  assert('layout 写数抛 TypeError', thrown(() => { v.layout = 5; }), 'TypeError');
  assert('拼错的键不报错（照 Web IDL 的字典）', thrown(() => { v.layout = { widht: 5 }; }) + '/' + String(L.width), '没抛/null');

  // ===== 约束 =====
  const target = new View();
  const c0 = L.constraints;
  assert('默认没有约束：五条边都是 null',
         [c0.start, c0.end, c0.top, c0.bottom, c0.baseline].map(String).join(','), 'null,null,null,null,null');
  assert('默认的偏移比例 0.5、链 spread、链的权重 null',
         [c0.horizontalBias, c0.verticalBias, c0.horizontalChainStyle, c0.verticalChainStyle,
          String(c0.horizontalWeight), String(c0.verticalWeight)].join(','), '0.5,0.5,spread,spread,null,null');
  assert('默认的尺寸限制',
         [String(c0.dimensionRatio), c0.constrainedWidth, c0.constrainedHeight, c0.minWidth, c0.minHeight,
          String(c0.maxWidth), String(c0.maxHeight), String(c0.widthPercent), String(c0.heightPercent)].join(','),
         'null,false,false,0,0,null,null,null,null');
  assert('默认没有环形定位、隐藏时的外边距、基线外边距 0、wrapBehaviorInParent 是 included',
         [String(c0.circle), [c0.goneMargin.top, c0.goneMargin.bottom, c0.goneMargin.start, c0.goneMargin.end,
           c0.goneMargin.baseline].map(String).join(' '), c0.baselineMargin, c0.wrapBehaviorInParent].join(','),
         'null,null null null null null,0,included');
  assert('约束读出来是冻结的', Object.isFrozen(c0) && Object.isFrozen(c0.goneMargin), true);

  const input = { start: 'parent', end: target, top: { to: target, edge: 'bottom' } };
  L.constraints = input;
  const c1 = L.constraints;
  assert('写 parent', c1.start, 'parent');
  assert('写一个视图：对齐它的同一条边', c1.end === target, true);
  assert('写 { to, edge }：对齐它的另一条边', c1.top.to === target && c1.top.edge === 'bottom', true);
  assert('没写的边是 null', String(c1.bottom) + ',' + String(c1.baseline), 'null,null');
  assert('读出来的是整理过的副本，冻结的', c1 !== input && Object.isFrozen(c1) && Object.isFrozen(c1.top), true);
  assert('没变时读两次是同一个对象', L.constraints === c1, true);
  L.constraints = { baseline: { to: 'parent', edge: 'top' } };
  assert('整个换掉：原来的边没了', String(L.constraints.start) + '/' + L.constraints.baseline.to, 'null/parent');
  L.constraints = { start: { to: 'parent', edge: 'end' }, bottom: target };
  assert('{ to: parent, edge } 也行', L.constraints.start.edge + ',' + (L.constraints.bottom === target), 'end,true');
  const kept = L.constraints;
  got = warnings(() => { L.constraints = { start: { to: target, edge: 'top' } }; });
  assert('start 对齐竖直方向的边：打一条警告', got.join(' | '),
         '[Nacre] constraints.start.edge has no value "top"; expected one of: start / end, ignored');
  assert('写错之后保持原值', L.constraints === kept, true);
  assert('top 只能对 top / bottom',
         oneListingWarning(warnings(() => { L.constraints = { top: { to: target, edge: 'end' } }; })), true);
  assert('baseline 可以对 baseline / top / bottom',
         thrown(() => { L.constraints = { baseline: { to: target, edge: 'bottom' } }; }), '没抛');
  assert('baseline 对 start 打警告',
         oneListingWarning(warnings(() => { L.constraints = { baseline: { to: target, edge: 'start' } }; })), true);
  assert('边的名字写错打警告',
         oneListingWarning(warnings(() => { L.constraints = { top: { to: target, edge: 'middle' } }; })), true);
  got = warnings(() => { L.constraints = { start: 'parnt' }; });
  assert('目标写成别的字符串：打一条警告', got.join(' | '),
         '[Nacre] constraints.start has no value "parnt"; expected one of: parent, a View, { to, edge }, ignored');
  assert('目标写数（旧的 id）抛 TypeError', thrown(() => { L.constraints = { start: 5 }; }), 'TypeError');
  assert('{ to, edge } 少了 to 抛 TypeError', thrown(() => { L.constraints = { start: { edge: 'end' } }; }), 'TypeError');
  assert('to 是别的对象抛 TypeError', thrown(() => { L.constraints = { start: { to: {}, edge: 'end' } }; }), 'TypeError');
  assert('{ to } 不给 edge：对齐同一条边',
         thrown(() => { L.constraints = { end: { to: target } }; }) + '/' + L.constraints.end.edge, '没抛/end');

  L.constraints = { horizontalBias: '0.25', verticalBias: 1 };
  assert('偏移比例写了读回来', L.constraints.horizontalBias + ',' + L.constraints.verticalBias, '0.25,1');
  assert('偏移比例大于 1 抛 RangeError', thrown(() => { L.constraints = { horizontalBias: 1.5 }; }), 'RangeError');
  assert('偏移比例小于 0 抛 RangeError', thrown(() => { L.constraints = { verticalBias: -0.1 }; }), 'RangeError');
  assert('偏移比例 NaN 抛 TypeError', thrown(() => { L.constraints = { horizontalBias: NaN }; }), 'TypeError');
  L.constraints = { horizontalChainStyle: 'packed', verticalChainStyle: 'spreadInside', horizontalWeight: 2, verticalWeight: 0 };
  assert('链的样式和权重写了读回来',
         [L.constraints.horizontalChainStyle, L.constraints.verticalChainStyle, L.constraints.horizontalWeight,
          L.constraints.verticalWeight].join(','), 'packed,spreadInside,2,0');
  assert('链的样式写错打警告',
         oneListingWarning(warnings(() => { L.constraints = { horizontalChainStyle: 'tight' }; })), true);
  assert('链的权重写负数抛 RangeError', thrown(() => { L.constraints = { horizontalWeight: -1 }; }), 'RangeError');
  L.constraints = { dimensionRatio: 'H,16:9' };
  assert('dimensionRatio 写了读回来', L.constraints.dimensionRatio, 'H,16:9');
  L.constraints = { dimensionRatio: '0.5' };
  assert('dimensionRatio 也可以是一个比值', L.constraints.dimensionRatio, '0.5');
  got = warnings(() => { L.constraints = { dimensionRatio: 'wide' }; });
  assert('dimensionRatio 写的不是比例：打一条警告', got.join(' | '),
         '[Nacre] constraints.dimensionRatio: "wide" is not a ratio such as "2:1", "H,16:9" or "0.5", ignored');
  L.constraints = { constrainedWidth: 1, constrainedHeight: 'yes', minWidth: 16, maxWidth: 200, minHeight: '8',
                    maxHeight: 64, widthPercent: 0.5, heightPercent: 1 };
  const c2 = L.constraints;
  assert('尺寸限制写了读回来',
         [c2.constrainedWidth, c2.constrainedHeight, c2.minWidth, c2.maxWidth, c2.minHeight, c2.maxHeight,
          c2.widthPercent, c2.heightPercent].join(','), 'true,true,16,200,8,64,0.5,1');
  assert('最小尺寸写负数抛 RangeError', thrown(() => { L.constraints = { minWidth: -1 }; }), 'RangeError');
  assert('百分比写负数抛 RangeError', thrown(() => { L.constraints = { widthPercent: -0.5 }; }), 'RangeError');
  L.constraints = { circle: { to: target, radius: 64, angle: 90 } };
  const circle = L.constraints.circle;
  assert('环形定位写了读回来', circle.to === target && circle.radius === 64 && circle.angle === 90, true);
  L.constraints = { circle: { to: 'parent' } };
  assert('环形定位不给半径、角度是 0', [L.constraints.circle.to, L.constraints.circle.radius, L.constraints.circle.angle].join(','),
         'parent,0,0');
  assert('环形定位少了 to 抛 TypeError', thrown(() => { L.constraints = { circle: { radius: 4 } }; }), 'TypeError');
  L.constraints = { goneMargin: { start: 8, baseline: '2' }, baselineMargin: 4, wrapBehaviorInParent: 'skipped' };
  const g2 = L.constraints.goneMargin;
  assert('隐藏时的外边距：没给的是 null',
         [g2.top, g2.bottom, g2.start, g2.end, g2.baseline].map(String).join(','), 'null,null,8,null,2');
  assert('baselineMargin、wrapBehaviorInParent 写了读回来',
         L.constraints.baselineMargin + ',' + L.constraints.wrapBehaviorInParent, '4,skipped');
  assert('wrapBehaviorInParent 写错打警告',
         oneListingWarning(warnings(() => { L.constraints = { wrapBehaviorInParent: 'never' }; })), true);
  L.constraints = { left: 'parent' };
  assert('拼错的键不报错，也不留着', String(L.constraints.start) + '/' + ('left' in L.constraints), 'null/false');
  L.constraints = { start: 'parent' };
  L.constraints = null;
  assert('constraints 写 null 回到没有约束', L.constraints.start, null);
  assert('constraints 写数抛 TypeError', thrown(() => { L.constraints = 5; }), 'TypeError');

  // ===== 自由的视图：页面值是 null，参数照样当场查 =====
  assert('自由的视图 frame 是 null', v.frame, null);
  assert('自由的视图 locationInWindow、locationOnScreen 是 null',
         String(v.locationInWindow) + ',' + String(v.locationOnScreen), 'null,null');
  assert('自由的视图 measure() 是 null', v.measure({ width: 10 }), null);
  assert('frame 只读', thrown(() => { v.frame = {}; }), 'TypeError');
  assert('measure 同时给 width 和 maxWidth 抛 TypeError', thrown(() => v.measure({ width: 1, maxWidth: 2 })), 'TypeError');
  assert('measure 给负数抛 RangeError', thrown(() => v.measure({ height: -1 })), 'RangeError');
  assert('measure 给 NaN 抛 TypeError', thrown(() => v.measure({ maxHeight: NaN })), 'TypeError');
  assert('measure 的参数不是对象抛 TypeError', thrown(() => v.measure(5)), 'TypeError');

  // ===== 各个布局类自己的状态（默认值照 Android 不带系统样式时的值）=====
  assert('LinearLayout 的 gravity 默认 start、top', lin0.gravity.join(','), 'start,top');
  assert('LinearLayout 的 gravity 读出来是冻结的', Object.isFrozen(lin0.gravity), true);
  lin0.gravity = ['centerHorizontal'];
  assert('只给横向：照写进去的读回来（原生那边竖向补成 top）', lin0.gravity.join(','), 'centerHorizontal');
  assert('LinearLayout 的 gravity 不收 left', oneListingWarning(warnings(() => { lin0.gravity = ['left']; })), true);
  assert('LinearLayout 的 gravity 写字符串抛 TypeError', thrown(() => { lin0.gravity = 'top'; }), 'TypeError');
  assert('weightSum 默认 null（按子视图的权重加起来算）', lin0.weightSum, null);
  lin0.weightSum = 4;
  assert('weightSum 写了读回来', lin0.weightSum, 4);
  assert('weightSum 写 0 抛 RangeError', thrown(() => { lin0.weightSum = 0; }), 'RangeError');
  assert('weightSum 写 NaN 抛 TypeError', thrown(() => { lin0.weightSum = NaN; }), 'TypeError');
  lin0.weightSum = null;
  assert('weightSum 写 null', lin0.weightSum, null);
  assert('isBaselineAligned 默认 true', lin0.isBaselineAligned, true);
  lin0.isBaselineAligned = 0;
  assert('isBaselineAligned 照 Boolean() 转', lin0.isBaselineAligned, false);
  assert('isMeasureWithLargestChildEnabled 默认 false', lin0.isMeasureWithLargestChildEnabled, false);
  lin0.isMeasureWithLargestChildEnabled = 'yes';
  assert('isMeasureWithLargestChildEnabled 写了读回来', lin0.isMeasureWithLargestChildEnabled, true);
  assert('showDividers 默认空数组', Array.isArray(lin0.showDividers) && lin0.showDividers.length === 0, true);
  lin0.showDividers = ['end', 'middle'];
  assert('showDividers 照写进去的读回来', lin0.showDividers.join(','), 'end,middle');
  assert('showDividers 写错打警告', oneListingWarning(warnings(() => { lin0.showDividers = ['side']; })), true);
  assert('showDividers 写错保持原值', lin0.showDividers.join(','), 'end,middle');
  assert('showDividers 写字符串抛 TypeError', thrown(() => { lin0.showDividers = 'middle'; }), 'TypeError');
  assert('dividerPadding 默认 0', lin0.dividerPadding, 0);
  lin0.dividerPadding = 4.5;
  assert('dividerPadding 写了读回来（dp）', lin0.dividerPadding, 4.5);
  assert('dividerPadding 写负数抛 RangeError', thrown(() => { lin0.dividerPadding = -1; }), 'RangeError');

  assert('clipChildren、clipToPadding 默认 true', lin0.clipChildren + ',' + fl0.clipToPadding, 'true,true');
  fl0.clipChildren = false;
  cl0.clipToPadding = 0;
  assert('clipChildren、clipToPadding 写了读回来', fl0.clipChildren + ',' + cl0.clipToPadding, 'false,false');
  assert('FrameLayout 的 measureAllChildren 默认 false', fl0.measureAllChildren, false);
  fl0.measureAllChildren = 1;
  assert('measureAllChildren 写了读回来', fl0.measureAllChildren, true);
  assert('ConstraintLayout 的最小尺寸默认 0、最大尺寸默认 null',
         [cl0.minWidth, cl0.minHeight, String(cl0.maxWidth), String(cl0.maxHeight)].join(','), '0,0,null,null');
  cl0.minWidth = 64;
  cl0.minHeight = '32';
  cl0.maxWidth = 400;
  cl0.maxHeight = 300;
  assert('ConstraintLayout 的最小最大尺寸写了读回来',
         [cl0.minWidth, cl0.minHeight, cl0.maxWidth, cl0.maxHeight].join(','), '64,32,400,300');
  cl0.maxWidth = null;
  assert('maxWidth 写 null', cl0.maxWidth, null);
  assert('minWidth 写负数抛 RangeError', thrown(() => { cl0.minWidth = -1; }), 'RangeError');
  assert('View 的 minimumWidth、minimumHeight 默认 0', v0.minimumWidth + ',' + v0.minimumHeight, '0,0');
  v0.minimumWidth = '12';
  assert('minimumWidth 照 Number() 转', v0.minimumWidth, 12);
  assert('minimumHeight 写负数抛 RangeError', thrown(() => { v0.minimumHeight = -1; }), 'RangeError');

  // ===== 挂上去，真的排一次版 =====
  const root = box(new FrameLayout());

  // 横向 LinearLayout，加权：240 宽，固定的 48 排最后，剩下 192 按 1:2 分
  const lin = box(new LinearLayout());
  lin.layout = { width: 240, height: 64 };
  const wa = box(new View());
  wa.layout = { width: 0, height: 'matchParent', weight: 1 };
  const wb = box(new View());
  wb.layout = { width: 0, height: 'matchParent', weight: 2 };
  const wc = box(new View());
  wc.layout = { width: 48, height: 24, gravity: ['bottom'] };
  lin.addView(wa);
  lin.addView(wb);
  lin.addView(wc);
  root.addView(lin);

  // 竖向 LinearLayout，靠右上，高由内容撑开；子视图的宽没写（竖向的默认是 matchParent）
  const col = box(new LinearLayout());
  col.orientation = 'vertical';
  col.layout = { width: 120, height: 'wrapContent', gravity: ['end', 'top'] };
  const cp1 = box(new View());
  cp1.layout = { height: 24, margin: { top: 8 } };
  const cp2 = box(new View());
  cp2.layout = { height: 32 };
  col.addView(cp1);
  col.addView(cp2);
  root.addView(col);

  // FrameLayout 靠右下，里面一个居中的；matchConstraint 在 ConstraintLayout 以外当成 null
  const fl = box(new FrameLayout());
  fl.layout = { width: 120, height: 120, gravity: ['end', 'bottom'] };
  const centered = box(new View());
  centered.layout = { width: 40, height: 40, gravity: ['centerHorizontal', 'centerVertical'] };
  const filler = box(new View());
  filler.layout = { width: 'matchConstraint', height: 8 };
  fl.addView(centered);
  fl.addView(filler);
  root.addView(fl);

  // ConstraintLayout：320 × 160，往下挪 96
  const cl = box(new ConstraintLayout());
  cl.layout = { width: 320, height: 160, margin: { top: 96 } };
  /** @param {object} layout */
  const inCl = (layout) => {
    const view = box(new View());
    view.layout = layout;
    cl.addView(view);
    return view;
  };
  const box1 = inCl({ width: 80, height: 48, margin: { start: 8, top: 8 }, constraints: { start: 'parent', top: 'parent' } });
  const box2 = inCl({ width: 80, height: 48, constraints: { start: 'parent', end: 'parent', top: 'parent', bottom: 'parent' } });
  const box3 = inCl({ width: 'matchConstraint', height: 16,
                      constraints: { start: { to: box1, edge: 'end' }, end: 'parent', top: { to: box1, edge: 'bottom' } } });
  const box4 = inCl({ width: 96, height: 48,
                      constraints: { start: 'parent', end: 'parent', bottom: 'parent', horizontalBias: 0.25 } });
  const box5 = inCl({ width: 64, height: 'matchConstraint',
                      constraints: { start: 'parent', top: 'parent', bottom: 'parent', dimensionRatio: '2:1' } });
  // packed 链：两个 48 宽的整体居中。链的两头互相指，先建好再写约束
  const chainA = box(new View());
  const chainB = box(new View());
  chainA.layout = { width: 48, height: 16, constraints: { start: 'parent', end: { to: chainB, edge: 'start' },
                                                          bottom: 'parent', horizontalChainStyle: 'packed' } };
  chainB.layout = { width: 48, height: 16, constraints: { start: { to: chainA, edge: 'end' }, end: 'parent', bottom: 'parent' } };
  cl.addView(chainA);
  cl.addView(chainB);
  // 没写 layout 的：ConstraintLayout 的默认是 wrapContent。用有内容尺寸的 TextView 看：普通 View 的
  // wrapContent 在「最多这么大」下取满上限（Android 的 View.onMeasure），分不出 wrapContent 和 matchParent
  const bare = box(new TextView());
  bare.text = 'bare';
  cl.addView(bare);
  // 约束的目标不在这个 ConstraintLayout 里：这一条当成没写，不报错（ConstraintLayout 自己就这样）。
  // ghost 先放在别的地方，之后再挪进来
  const ghost = box(new View());
  ghost.layout = { width: 40, height: 8, margin: { start: 16 }, constraints: { start: 'parent', top: 'parent' } };
  fl.addView(ghost);
  const stray = inCl({ width: 48, height: 16, constraints: { start: { to: ghost, edge: 'end' }, top: 'parent' } });
  root.addView(cl);

  // 第二个 ConstraintLayout：尺寸限制、链的权重、偏移、环形定位、基线
  const cl2 = box(new ConstraintLayout());
  cl2.layout = { width: 320, height: 160, margin: { top: 352 } };
  /** @param {object} layout */
  const inCl2 = (layout) => {
    const view = box(new View());
    view.layout = layout;
    cl2.addView(view);
    return view;
  };
  const half = inCl2({ width: 'matchConstraint', height: 8,
                       constraints: { start: 'parent', end: 'parent', top: 'parent', widthPercent: 0.5 } });
  const capped = inCl2({ width: 'matchConstraint', height: 8,
                         constraints: { start: 'parent', end: 'parent', top: 'parent', maxWidth: 208 } });
  // 环形定位的中心 hub 在 (64, 64)，16 × 16；它的左边也当下面两个的锚点
  const hub = inCl2({ width: 16, height: 16, margin: { start: 64, top: 64 }, constraints: { start: 'parent', top: 'parent' } });
  // 一行字比两个锚点（父视图的左边到 hub 的左边，64 宽）宽：不限制时照它想要的宽、在两个锚点之间居中，
  // constrainedWidth 时夹到两个锚点之间（字折行）
  const wideText = box(new TextView());
  wideText.text = 'a line wider than its anchors';
  wideText.layout = { width: 'wrapContent', constraints: { start: 'parent', end: { to: hub, edge: 'start' }, bottom: 'parent' } };
  cl2.addView(wideText);
  const clampedText = box(new TextView());
  clampedText.text = 'a line wider than its anchors';
  clampedText.layout = { width: 'wrapContent',
                         constraints: { start: 'parent', end: { to: hub, edge: 'start' }, bottom: 'parent',
                                        constrainedWidth: true } };
  cl2.addView(clampedText);
  // 带权重的链：80 和 240
  const w1 = box(new View());
  const w2 = box(new View());
  w1.layout = { width: 'matchConstraint', height: 8,
                constraints: { start: 'parent', end: { to: w2, edge: 'start' }, top: 'parent', horizontalWeight: 1 } };
  w2.layout = { width: 'matchConstraint', height: 8,
                constraints: { start: { to: w1, edge: 'end' }, end: 'parent', top: 'parent', horizontalWeight: 3 } };
  cl2.addView(w1);
  cl2.addView(w2);
  // 环形定位：绕着 hub 的中心，半径 64，角度 90 度（0 度朝上，顺时针）
  const orbit = inCl2({ width: 16, height: 16, constraints: { circle: { to: hub, radius: 64, angle: 90 } } });
  // 基线对齐：两个默认字号的 TextView
  const t1 = box(new TextView());
  t1.text = 'Ag';
  t1.layout = { margin: { top: 24, start: 200 }, constraints: { start: 'parent', top: 'parent' } };
  const t2 = box(new TextView());
  t2.text = 'Ag';
  t2.layout = { constraints: { start: { to: t1, edge: 'end' }, baseline: t1 } };
  cl2.addView(t1);
  cl2.addView(t2);
  root.addView(cl2);

  // 「父视图不读的字段留着」：weight 在 FrameLayout 里不起作用，挪进 LinearLayout 才起作用
  const mover = box(new View());
  mover.layout = { width: 0, height: 16, weight: 1, margin: { top: 528 } };
  root.addView(mover);

  // 横向 LinearLayout 的 gravity：48 宽的子视图靠 end；weightSum 4 时 1 份是四分之一
  const lin2 = box(new LinearLayout());
  lin2.gravity = ['end'];
  lin2.layout = { width: 240, height: 32, margin: { top: 560 } };
  const pushed = box(new View());
  pushed.layout = { width: 48, height: 32 };
  lin2.addView(pushed);
  root.addView(lin2);
  const lin3 = box(new LinearLayout());
  lin3.weightSum = 4;
  lin3.layout = { width: 256, height: 8, margin: { top: 600 } };
  const quarter = box(new View());
  quarter.layout = { width: 0, height: 8, weight: 1 };
  lin3.addView(quarter);
  root.addView(lin3);

  // 最小尺寸、ConstraintLayout 自己的最小最大尺寸
  // 空的 TextView：内容是 0 宽、一行高（比 32 矮），wrapContent 量出来是最小尺寸。普通 View 的 wrapContent
  // 会取满上限，看不出最小尺寸
  const minSized = box(new TextView());
  minSized.minimumWidth = 40;
  minSized.minimumHeight = 32;
  minSized.layout = { width: 'wrapContent', height: 'wrapContent', margin: { top: 616 } };
  root.addView(minSized);
  const clMin = box(new ConstraintLayout());
  clMin.minWidth = 64;
  clMin.minHeight = 32;
  clMin.layout = { width: 'wrapContent', height: 'wrapContent', margin: { top: 648 } };
  root.addView(clMin);
  const clMax = box(new ConstraintLayout());
  clMax.maxWidth = 40;
  clMax.layout = { width: 'wrapContent', height: 'wrapContent', margin: { top: 688 } };
  const tooWide = box(new View());
  tooWide.layout = { width: 80, height: 8, constraints: { start: 'parent', top: 'parent' } };
  clMax.addView(tooWide);
  root.addView(clMax);

  // 布局事件：挂上去之前就订阅，收得到第一次排版
  const firstBox2 = nextEvent(box2, 'layoutchange', 5000);
  let box1Changes = 0;
  box1.addEventListener('layoutchange', () => { box1Changes++; });
  const firstBox1 = nextEvent(box1, 'layoutchange', 5000);

  activity.contentView = root;
  assert('刚挂上、还没排版：frame 是 null', root.frame, null);
  assert('刚挂上、还没排版：locationInWindow 是 null', root.locationInWindow, null);
  const e2 = await firstBox2;
  assert('挂上之后排完版来了 layoutchange', e2 !== null, true);
  if (e2 !== null) {
    assert('layoutchange 是普通的 Event', Object.getPrototypeOf(e2) === Event.prototype, true);
    assert('layoutchange 不可取消', e2.cancelable, false);
    assert('layoutchange 的 target 是公开的视图', e2.target === box2, true);
    assert('事件上不带位置（位置读 frame）', ['left', 'oldLeft', 'frame'].filter((n) => n in e2).join(','), '');
  }
  await firstBox1;
  await sleep(300);

  // ===== 排版的结果 =====
  const rf = root.frame;
  assert('根视图排过版了：frame 是 { x, y, width, height }', rf !== null && Object.keys(rf).join(','), 'x,y,width,height');
  assert('frame 是冻结的', Object.isFrozen(rf), true);
  assert('frame 只读', thrown(() => { root.frame = null; }), 'TypeError');
  const W = rf.width;
  const H = rf.height;
  assert('根视图铺满（宽高大于 0）', W > 0 && H > 0, true);
  assert('frame 是相对父视图的', frameOf(lin), '0,0,240,64');
  assert('加权：1 份的那个 64 宽', frameOf(wa), '0,0,64,64');
  assert('加权：2 份的那个 128 宽，接在后面', frameOf(wb), '64,0,128,64');
  assert('固定宽的排在最后，gravity 靠底', frameOf(wc), '192,40,48,24');
  assert('竖向 LinearLayout 靠右（layout.gravity 的 end）', near(col.frame.x, W - 120) && col.frame.y === 0, true);
  assert('wrapContent 的高是内容加外边距', col.frame.height, 64);
  assert('竖向 LinearLayout 里没写宽：默认 matchParent，带上外边距', frameOf(cp1), '0,8,120,24');
  assert('第二个接在后面', frameOf(cp2), '0,32,120,32');
  assert('FrameLayout 里靠右下', near(fl.frame.x, W - 120) && near(fl.frame.y, H - 120), true);
  assert('FrameLayout 里居中', frameOf(centered), '40,40,40,40');
  assert('matchConstraint 在 FrameLayout 里当成 null（FrameLayout 的默认是 matchParent）', frameOf(filler), '0,0,120,8');
  assert('ConstraintLayout 被 margin.top 往下挪', frameOf(cl), '0,96,320,160');
  assert('约束：贴左上，带外边距', frameOf(box1), '8,8,80,48');
  assert('约束：上下左右都连父视图就居中', frameOf(box2), '120,56,80,48');
  assert('约束：{ to, edge } 接在 box1 的右下，matchConstraint 填到父视图的右边', frameOf(box3), '88,56,232,16');
  assert('约束：horizontalBias 0.25，贴底', frameOf(box4), '56,112,96,48');
  assert('约束：dimensionRatio 2:1 算出高，上下居中', frameOf(box5), '0,64,64,32');
  assert('约束：packed 链整体居中', frameOf(chainA) + '/' + frameOf(chainB), '112,144,48,16/160,144,48,16');
  const bf = bare.frame;
  assert('ConstraintLayout 里没写 layout：wrapContent（文字多大就多大，在左上）',
         bf.x === 0 && bf.y === 0 && bf.width > 0 && bf.width < 320 && bf.height > 0 && bf.height < 160, true);
  assert('约束的目标不在这个 ConstraintLayout 里：这条约束不生效', frameOf(stray), '0,0,48,16');
  assert('widthPercent 0.5', frameOf(half), '80,0,160,8');
  assert('maxWidth 208：居中', frameOf(capped), '56,0,208,8');
  const wf = wideText.frame;
  assert('wrapContent 比两个锚点之间宽：不限制时照它想要的宽，在两个锚点之间居中',
         wf.width > 64 && Math.abs(wf.x - (64 - wf.width) / 2) < 1, true);
  const cf = clampedText.frame;
  assert('constrainedWidth：夹到两个锚点之间', cf.x + ',' + cf.width, '0,64');
  assert('带权重的链：1 : 3', frameOf(w1) + '/' + frameOf(w2), '0,0,80,8/80,0,240,8');
  const of = orbit.frame;
  assert('环形定位：hub 的中心往右 64（差不到半个 dp）', of !== null && Math.abs(of.x - (72 + 64 - 8)) < 0.5 &&
         Math.abs(of.y - (72 - 8)) < 0.5, true);
  assert('基线对齐：两个一样字号的字顶部对齐', near(t2.frame.y, t1.frame.y) && near(t2.frame.x, t1.frame.x + t1.frame.width), true);
  assert('weight 在 FrameLayout 里不起作用（宽就是写的 0）', mover.frame.width, 0);
  assert('LinearLayout 的 gravity end：靠右', frameOf(pushed), '192,0,48,32');
  assert('weightSum 4：1 份是四分之一', frameOf(quarter), '0,0,64,8');
  assert('minimumWidth、minimumHeight：wrapContent 量出来是最小尺寸', frameOf(minSized), '0,616,40,32');
  assert('ConstraintLayout 的 minWidth、minHeight', clMin.frame.width + ',' + clMin.frame.height, '64,32');
  assert('ConstraintLayout 的 maxWidth', clMax.frame.width, 40);

  // ===== 位置 =====
  const rootLoc = root.locationInWindow;
  const flLoc = fl.locationInWindow;
  assert('locationInWindow 是 { x, y }，冻结的', Object.keys(flLoc).join(',') + '/' + Object.isFrozen(flLoc), 'x,y/true');
  assert('窗口里的位置 = 父视图的位置 + 相对位置',
         near(flLoc.x, rootLoc.x + fl.frame.x) && near(flLoc.y, rootLoc.y + fl.frame.y), true);
  const onScreen = fl.locationOnScreen;
  assert('铺满全屏的窗口里，屏幕上的位置和窗口里的一样', onScreen.x === flLoc.x && onScreen.y === flLoc.y, true);

  // ===== 挂着时写 layout：运行时自己请求排版 =====
  const second = nextEvent(box2, 'layoutchange', 5000);
  box2.layout.width = 160;
  const e2b = await second;
  assert('改 layout 的一项就重新排版，来了 layoutchange', e2b !== null, true);
  assert('新的 frame', frameOf(box2), '80,56,160,48');
  const third = nextEvent(box2, 'layoutchange', 5000);
  box2.layout.constraints = { ...box2.layout.constraints, verticalBias: 0 };
  assert('改约束也重新排版', (await third) !== null && frameOf(box2) === '80,0,160,48', true);

  // 四边没变不发：动了 box4，ConstraintLayout 整个重排，box1 没动
  const before = box1Changes;
  const box4Moved = nextEvent(box4, 'layoutchange', 5000);
  box4.layout.constraints = { ...box4.layout.constraints, horizontalBias: 0 };
  assert('box4 挪了', (await box4Moved) !== null && frameOf(box4) === '0,112,96,48', true);
  await sleep(200);
  assert('重新排了版但 box1 没动，不发 layoutchange', box1Changes, before);

  // 监听器全摘掉再加回来，事件还在
  const fourth = nextEvent(box2, 'layoutchange', 5000);
  box2.layout.width = 80;
  assert('监听器全摘掉再加回来，事件还在', (await fourth) !== null && frameOf(box2) === '120,0,80,48', true);

  // 约束的目标挪进来：ConstraintLayout 下一次排版时这条约束就生效了
  const strayMoved = nextEvent(stray, 'layoutchange', 5000);
  cl.addView(ghost);
  assert('目标挪进同一个 ConstraintLayout 之后约束生效', (await strayMoved) !== null && frameOf(stray), '56,0,48,16');
  assert('ghost 在 ConstraintLayout 里照它自己的约束', frameOf(ghost), '16,0,40,8');

  // ===== 换父视图：layout 按新父视图重设 =====
  const wanderer = box(new View());
  wanderer.layout = { width: 48, height: 16, gravity: ['end', 'bottom'] };
  fl.addView(wanderer);
  const bareChild = box(new TextView());
  bareChild.text = 'bare child';
  const col2 = box(new LinearLayout());
  col2.orientation = 'vertical';
  col2.layout = { width: 120, height: 120, margin: { top: 720 } };
  col2.addView(bareChild);
  root.addView(col2);
  await sleep(300);
  assert('在 FrameLayout 里靠右下', frameOf(wanderer), '72,104,48,16');
  const bcf = bareChild.frame;
  assert('没写 layout，在竖向 LinearLayout 里：matchParent × wrapContent',
         bcf.x === 0 && bcf.y === 0 && bcf.width === 120 && bcf.height > 0 && bcf.height < 120, true);
  fl.addView(bareChild);
  col2.addView(wanderer);
  await sleep(300);
  assert('挪进竖向 LinearLayout：gravity 的 end 照样生效，bottom 不管', frameOf(wanderer), '72,0,48,16');
  assert('没写 layout 的挪进 FrameLayout：换成 FrameLayout 的默认（matchParent × matchParent）', frameOf(bareChild),
         '0,0,120,120');
  cl.addView(wanderer);
  await sleep(300);
  assert('挪进 ConstraintLayout：gravity 不管，没有约束就在左上', frameOf(wanderer), '0,0,48,16');
  cl.removeView(wanderer);
  assert('拿下来之后 frame 是 null', wanderer.frame, null);
  fl.addView(wanderer);
  await sleep(300);
  assert('拿下来再放进 FrameLayout：又靠右下', frameOf(wanderer), '72,104,48,16');
  lin3.addView(mover);
  await sleep(300);
  assert('weight 挪进 LinearLayout 之后起作用：和 quarter 各 1 份（weightSum 4），外边距照样带着',
         frameOf(quarter) + '/' + frameOf(mover), '0,0,64,8/64,528,64,16');
  // 竖向改成横向：没写宽高的子视图换成横向的默认（wrapContent × wrapContent）
  const flex = box(new TextView());
  flex.text = 'flex';
  col2.addView(flex);
  await sleep(300);
  const ff = flex.frame;
  assert('竖向 LinearLayout 里没写宽高：matchParent × wrapContent', ff.width === 120 && ff.height < 120, true);
  col2.orientation = 'horizontal';
  await sleep(300);
  const ff2 = flex.frame;
  assert('orientation 改成横向：没写宽高的子视图按横向的默认值（wrapContent）重设',
         ff2.width > 0 && ff2.width < 120 && ff2.height === ff.height, true);

  // ===== measure：按给的条件量，不改排出来的位置 =====
  const probe = box(new View());
  probe.minimumWidth = 40;
  probe.minimumHeight = 24;
  probe.layout = { width: 48, height: 48 };
  fl.addView(probe);
  await sleep(300);
  const sized = probe.measure();
  assert('measure() 不给条件：量出来是最小尺寸，{ width, height }', sized !== null && Object.keys(sized).join(',') + '=' +
         sized.width + ',' + sized.height, 'width,height=40,24');
  assert('measure 的结果是冻结的', Object.isFrozen(sized), true);
  const exact = probe.measure({ width: 64, height: 16 });
  assert('measure 给 width、height：就是这么大', exact.width + ',' + exact.height, '64,16');
  const capped2 = probe.measure({ maxWidth: 32, maxHeight: 200 });
  assert('measure 给 maxWidth：普通 View 取满上限', capped2.width + ',' + capped2.height, '32,200');
  assert('measure 的 options 是 null 当成空的', probe.measure(null).width, 40);
  await sleep(300);
  assert('量过之后，下一次排版还是原来的大小', frameOf(probe), '0,0,48,48');

  // ===== 密度变了：layout 里的 dp 按新密度重设 =====
  // 页面的密度是 App 层的 configuration.density（1 dp 是几个像素）
  const startDensity = /** @type {any} */ (activity).configuration?.density;
  if (typeof startDensity === 'number') {
    const startDpi = Math.round(startDensity * 160);
    const targetDpi = startDpi === 560 ? 480 : 560;
    const changed = nextEvent(box1, 'layoutchange', 10000);
    console.log('[acceptance] density ' + targetDpi);
    await changed;
    await sleep(500);
    assert('密度变了：layout 写的 dp 不变，排出来还是这么多 dp', frameOf(box1) + '/' + frameOf(wb),
           '8,8,80,48/64,0,128,64');
    console.log('[acceptance] density restore');
    await nextEvent(box1, 'layoutchange', 10000);
    await sleep(500);
    assert('密度还原之后也是', frameOf(box1), '8,8,80,48');
  } else {
    console.log('  ! 布局：读不到页面的密度，密度那一段没跑');
  }
}
