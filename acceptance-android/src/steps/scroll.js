// 滚动：View 上的滚动位置、滚动条、越界效果、边缘渐隐、嵌套滚动、scroll 事件；ScrollView 和
// HorizontalScrollView。
//
// 照「接类的总则」（2026-11-26）：
// - 视图建出来是自由的，状态以 JS 为准。scrollX / scrollY 是系统也会改的状态（手指一划就变）：挂着时读原生，
//   拿下来时把原生的值读回 JS；它们还要排完版才能设（排版之前设，ScrollView 会把它夹成 0），自由时写的
//   挂上、排完版再设。写 scrollX / scrollY 取代了 scrollTo / scrollBy。
// - 滚动视图只能有一份内容：不是 ViewGroup，没有 addView，内容是可读写的 contentView（和 activity.contentView 一样）。
// - canScroll('up' | 'down' | 'left' | 'right') 是页面值，自由时是 null；fling、fullScroll、pageScroll、
//   arrowScroll 是动作，自由时抛 InvalidStateError；smoothScrollTo(y) 自由时就是写 scrollY；
//   scrollToDescendant 自由时先记下，挂上、排完版再滚。
// - 长度是 dp，时长是毫秒，速度是 dp/秒。默认值照 Android 不带主题样式时的值（滚动条、渐隐都关着）。
// - 类型不对抛 TypeError、超出范围抛 RangeError；枚举名、颜色写错打警告、值不变。
//
// 中间一段把 ScrollView 挂到屏幕上，用代码滚、用 fling 甩、再让脚本用手指（adb 的 swipe）拖一下；
// 最后改一次手机的显示密度（[acceptance] density 560，脚本退出时还原），滚动位置按 dp 留着。

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
 * 跑 fn，收下这期间打的警告（console.warn 的第一个参数），用 ' | ' 连起来；没有警告是空串
 * @param {() => unknown} fn
 */
function warnings(fn) {
  const original = console.warn;
  /** @type {string[]} */
  const seen = [];
  console.warn = (/** @type {unknown} */ first) => { seen.push(String(first)); };
  try {
    fn();
  } finally {
    console.warn = original;
  }
  return seen.join(' | ');
}

/** @param {number} ms */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 等到 check() 为真，最多 ms 毫秒；返回最后一次 check() 的结果
 * @param {() => boolean} check
 * @param {number} ms
 */
async function until(check, ms) {
  const start = Date.now();
  while (!check() && Date.now() - start < ms) await sleep(20);
  return check();
}

/** a 和 b 差不到 tolerance @param {unknown} a @param {number} b @param {number} tolerance */
const near = (a, b, tolerance) => typeof a === 'number' && Math.abs(a - b) <= tolerance;

/**
 * 一段竖着的内容：上面一行字（手指从它这里往上划，上下留得很宽），中间撑高，再一行字，下面再撑高
 * @param {string} topText @param {string} bottomText @param {number} height 上面那段撑多高（dp）
 */
function tallContent(topText, bottomText, height) {
  const content = new LinearLayout();
  content.orientation = 'vertical';
  // 上下各留 400 dp：手指从它看得见的那一块的正中往上划 1000 像素，要从屏幕中间开始划（内容铺满全屏，
  // 太靠上会划在状态栏上）
  const top = new TextView();
  top.text = topText;
  top.paddingTop = 400;
  top.paddingBottom = 400;
  const spacer = new View();
  spacer.minimumHeight = height;
  const bottom = new TextView();
  bottom.text = bottomText;
  const tail = new View();
  tail.minimumHeight = 1000;
  for (const v of [top, spacer, bottom, tail]) content.addView(v);
  return { content, top, bottom };
}

/** @param {import("../main.js").StepContext} ctx */
export async function stepScroll(ctx) {
  const { assert } = ctx;
  const activity = /** @type {Activity} */ (ctx.activity);
  /** @type {any} 故意写错类型的地方用它 */
  let bad;

  // ===== 类 =====
  console.log('  --- 滚动：类 ---');
  assert('ScrollView 在全局', typeof ScrollView, 'function');
  assert('HorizontalScrollView 在全局', typeof HorizontalScrollView, 'function');
  assert('不接 AndroidX 的 NestedScrollView', typeof (/** @type {any} */ (globalThis).NestedScrollView), 'undefined');
  const sv = new ScrollView();
  const hsv = new HorizontalScrollView();
  assert('new ScrollView() 不收参数，建出来是自由的', sv.activity, null);
  assert('多给的参数不管', new ScrollView(/** @type {any} */ (activity)).activity, null);
  assert('ScrollView 是 View', sv instanceof View, true);
  // 只能有一份内容：不是 ViewGroup，没有 addView 一族
  assert('ScrollView 不是 ViewGroup（只有一份内容）', sv instanceof ViewGroup, false);
  assert('HorizontalScrollView 不是 ViewGroup', hsv instanceof ViewGroup, false);
  for (const name of ['addView', 'removeView', 'removeAllViews', 'children']) {
    assert('ScrollView 没有 ' + name, name in sv, false);
    assert('HorizontalScrollView 没有 ' + name, name in hsv, false);
  }
  class MyScroll extends ScrollView {}
  const mine = new MyScroll();
  assert('ScrollView 能在 JS 里继承', mine instanceof ScrollView && mine instanceof MyScroll, true);

  // ===== View 上的滚动成员：自由的视图 =====
  console.log('  --- 滚动：View 上的成员（自由）---');
  const plain = new TextView();
  plain.text = '普通视图也能滚';
  assert('scrollX 默认 0', plain.scrollX, 0);
  assert('scrollY 默认 0', plain.scrollY, 0);
  plain.scrollX = 10;
  plain.scrollY = 20;
  assert('scrollX 写读（dp）', plain.scrollX, 10);
  assert('scrollY 写读（dp）', plain.scrollY, 20);
  plain.scrollY = -12.5;
  assert('普通视图不限制范围：scrollY 可以是负的小数', plain.scrollY, -12.5);
  bad = '7.5';
  plain.scrollX = bad;
  assert("scrollX 写 '7.5' 照 Number()", plain.scrollX, 7.5);
  bad = 'abc';
  assert("scrollY 写 'abc' 抛 TypeError", thrown(() => { plain.scrollY = bad; }), 'TypeError');
  assert('scrollY 写 NaN 抛 TypeError', thrown(() => { plain.scrollY = NaN; }), 'TypeError');
  assert('写错之后 scrollY 不变', plain.scrollY, -12.5);
  plain.scrollY = 6;
  assert('自由时 canScroll 是 null（页面值）', plain.canScroll('down'), null);
  assert('canScroll 方向写错抛 TypeError（自由时也查）', thrown(() => plain.canScroll(/** @type {any} */ ('forward'))), 'TypeError');
  assert('canScroll 不给方向抛 TypeError', thrown(() => /** @type {any} */ (plain).canScroll()), 'TypeError');

  assert("overScrollMode 默认 'ifContentScrolls'", plain.overScrollMode, 'ifContentScrolls');
  for (const mode of /** @type {const} */ (['always', 'never', 'ifContentScrolls'])) {
    sv.overScrollMode = mode;
    assert('overScrollMode 写读 ' + mode, sv.overScrollMode, mode);
  }
  bad = 'sometimes';
  assert('overScrollMode 写错：一条警告',
         warnings(() => { sv.overScrollMode = bad; }),
         '[Nacre] overScrollMode has no value "sometimes"; expected one of: always / ifContentScrolls / never, ignored');
  assert('overScrollMode 写错之后值不变', sv.overScrollMode, 'ifContentScrolls');

  // 滚动条：不带主题样式时都关着（样式由 JS 定：要看得见，还要给滑块一个 Drawable）
  assert('isVerticalScrollBarEnabled 默认 false（ScrollView 也是）', sv.isVerticalScrollBarEnabled, false);
  assert('isHorizontalScrollBarEnabled 默认 false', hsv.isHorizontalScrollBarEnabled, false);
  sv.isVerticalScrollBarEnabled = true;
  assert('isVerticalScrollBarEnabled 写 true', sv.isVerticalScrollBarEnabled, true);
  bad = 0;
  sv.isHorizontalScrollBarEnabled = bad;
  assert('isHorizontalScrollBarEnabled 写 0 照 Boolean()', sv.isHorizontalScrollBarEnabled, false);
  assert('isScrollbarFadingEnabled 默认 false', sv.isScrollbarFadingEnabled, false);
  sv.isScrollbarFadingEnabled = true;
  assert('isScrollbarFadingEnabled 写 true', sv.isScrollbarFadingEnabled, true);
  assert('scrollBarFadeDuration 默认 250（毫秒）', sv.scrollBarFadeDuration, 250);
  assert('scrollBarDefaultDelayBeforeFade 默认 300（毫秒）', sv.scrollBarDefaultDelayBeforeFade, 300);
  sv.scrollBarFadeDuration = 500;
  assert('scrollBarFadeDuration 写 500', sv.scrollBarFadeDuration, 500);
  sv.scrollBarDefaultDelayBeforeFade = 800;
  assert('scrollBarDefaultDelayBeforeFade 写 800', sv.scrollBarDefaultDelayBeforeFade, 800);
  assert('scrollBarFadeDuration 写负数抛 RangeError', thrown(() => { sv.scrollBarFadeDuration = -1; }), 'RangeError');
  bad = 'slow';
  assert("scrollBarDefaultDelayBeforeFade 写 'slow' 抛 TypeError", thrown(() => { sv.scrollBarDefaultDelayBeforeFade = bad; }), 'TypeError');
  assert('scrollBarSize 默认 4（dp）', sv.scrollBarSize, 4);
  sv.scrollBarSize = 6;
  assert('scrollBarSize 写 6', sv.scrollBarSize, 6);
  assert('scrollBarSize 写负数抛 RangeError', thrown(() => { sv.scrollBarSize = -2; }), 'RangeError');
  assert("scrollBarStyle 默认 'insideOverlay'", sv.scrollBarStyle, 'insideOverlay');
  for (const style of /** @type {const} */ (['insideInset', 'outsideOverlay', 'outsideInset', 'insideOverlay'])) {
    sv.scrollBarStyle = style;
    assert('scrollBarStyle 写读 ' + style, sv.scrollBarStyle, style);
  }
  bad = 'floating';
  assert('scrollBarStyle 写错：一条警告',
         warnings(() => { sv.scrollBarStyle = bad; }),
         '[Nacre] scrollBarStyle has no value "floating"; expected one of: ' +
         'insideOverlay / insideInset / outsideOverlay / outsideInset, ignored');
  assert('scrollBarStyle 写错之后值不变', sv.scrollBarStyle, 'insideOverlay');
  assert("verticalScrollbarPosition 默认 'default'", sv.verticalScrollbarPosition, 'default');
  for (const pos of /** @type {const} */ (['left', 'right', 'default'])) {
    sv.verticalScrollbarPosition = pos;
    assert('verticalScrollbarPosition 写读 ' + pos, sv.verticalScrollbarPosition, pos);
  }
  bad = 'middle';
  assert('verticalScrollbarPosition 写错：一条警告',
         warnings(() => { sv.verticalScrollbarPosition = bad; }),
         '[Nacre] verticalScrollbarPosition has no value "middle"; expected one of: default / left / right, ignored');

  // 滑块和轨道：Drawable 或 null
  assert('verticalScrollbarThumbDrawable 默认 null', sv.verticalScrollbarThumbDrawable, null);
  assert('verticalScrollbarTrackDrawable 默认 null', sv.verticalScrollbarTrackDrawable, null);
  assert('horizontalScrollbarThumbDrawable 默认 null', sv.horizontalScrollbarThumbDrawable, null);
  assert('horizontalScrollbarTrackDrawable 默认 null', sv.horizontalScrollbarTrackDrawable, null);
  const thumb = new GradientDrawable();
  thumb.color = '#3366cc';
  thumb.cornerRadius = 3;
  sv.verticalScrollbarThumbDrawable = thumb;
  assert('verticalScrollbarThumbDrawable 写读是同一个', sv.verticalScrollbarThumbDrawable === thumb, true);
  const track = new ColorDrawable('#00000010');
  sv.verticalScrollbarTrackDrawable = track;
  assert('verticalScrollbarTrackDrawable 写读是同一个', sv.verticalScrollbarTrackDrawable === track, true);
  const hThumb = new ColorDrawable('#cc3366');
  hsv.horizontalScrollbarThumbDrawable = hThumb;
  assert('horizontalScrollbarThumbDrawable 写读是同一个', hsv.horizontalScrollbarThumbDrawable === hThumb, true);
  const hTrack = new ColorDrawable('#00000010');
  hsv.horizontalScrollbarTrackDrawable = hTrack;
  assert('horizontalScrollbarTrackDrawable 写读是同一个', hsv.horizontalScrollbarTrackDrawable === hTrack, true);
  bad = {};
  assert('verticalScrollbarThumbDrawable 给普通对象抛 TypeError', thrown(() => { sv.verticalScrollbarThumbDrawable = bad; }), 'TypeError');
  assert('写错之后滑块不变', sv.verticalScrollbarThumbDrawable === thumb, true);
  sv.verticalScrollbarTrackDrawable = null;
  assert('verticalScrollbarTrackDrawable 写 null', sv.verticalScrollbarTrackDrawable, null);
  sv.verticalScrollbarTrackDrawable = track;

  // 滚动指示线（位掩码，字符串数组）：照写进去的样子读回
  assert('scrollIndicators 默认是空数组', sv.scrollIndicators.join(','), '');
  assert('scrollIndicators 读出来是冻结的', Object.isFrozen(sv.scrollIndicators), true);
  sv.scrollIndicators = ['bottom', 'top'];
  assert('scrollIndicators 照写进去的样子读回', sv.scrollIndicators.join(','), 'bottom,top');
  sv.scrollIndicators = ['start', 'end', 'left', 'right'];
  assert('scrollIndicators 写四个', sv.scrollIndicators.join(','), 'start,end,left,right');
  bad = ['top', 'sideways'];
  assert('scrollIndicators 有一个写错：一条警告',
         warnings(() => { sv.scrollIndicators = bad; }),
         '[Nacre] scrollIndicators has no value "sideways"; expected one of: ' +
         'top / bottom / left / right / start / end, ignored');
  assert('有一个写错，整次不生效', sv.scrollIndicators.join(','), 'start,end,left,right');
  bad = 'top';
  assert('scrollIndicators 写字符串（不是数组）抛 TypeError', thrown(() => { sv.scrollIndicators = bad; }), 'TypeError');
  sv.scrollIndicators = [];
  assert('scrollIndicators 写空数组', sv.scrollIndicators.join(','), '');

  // 边缘渐隐
  assert('isVerticalFadingEdgeEnabled 默认 false', sv.isVerticalFadingEdgeEnabled, false);
  assert('isHorizontalFadingEdgeEnabled 默认 false', sv.isHorizontalFadingEdgeEnabled, false);
  sv.isVerticalFadingEdgeEnabled = true;
  assert('isVerticalFadingEdgeEnabled 写 true', sv.isVerticalFadingEdgeEnabled, true);
  assert('fadingEdgeLength 默认 12（dp）', sv.fadingEdgeLength, 12);
  sv.fadingEdgeLength = 48;
  assert('fadingEdgeLength 写 48', sv.fadingEdgeLength, 48);
  assert('fadingEdgeLength 写负数抛 RangeError', thrown(() => { sv.fadingEdgeLength = -1; }), 'RangeError');
  assert('isNestedScrollingEnabled 默认 false', sv.isNestedScrollingEnabled, false);
  sv.isNestedScrollingEnabled = true;
  assert('isNestedScrollingEnabled 写 true', sv.isNestedScrollingEnabled, true);
  sv.isNestedScrollingEnabled = false;

  // 一件事只说一次：旧的写法都没有了
  for (const name of ['scrollTo', 'scrollBy', 'canScrollVertically', 'canScrollHorizontally', 'setFadingEdgeLength',
    'verticalFadingEdgeLength', 'horizontalFadingEdgeLength', 'verticalScrollbarWidth']) {
    assert('View 上没有 ' + name + ' 了', name in plain, false);
  }
  for (const name of ['setEdgeEffectColor', 'maxScrollAmount', 'smoothScrollBy']) {
    assert('ScrollView 上没有 ' + name + ' 了', name in sv, false);
    assert('HorizontalScrollView 上没有 ' + name + ' 了', name in hsv, false);
  }

  // ===== ScrollView 自己的：自由 =====
  console.log('  --- 滚动：ScrollView（自由）---');
  assert('contentView 默认 null', sv.contentView, null);
  assert('isFillViewport 默认 false', sv.isFillViewport, false);
  sv.isFillViewport = true;
  assert('isFillViewport 写 true', sv.isFillViewport, true);
  sv.isFillViewport = false;
  assert('isSmoothScrollingEnabled 默认 true', sv.isSmoothScrollingEnabled, true);
  sv.isSmoothScrollingEnabled = false;
  assert('isSmoothScrollingEnabled 写 false', sv.isSmoothScrollingEnabled, false);
  sv.isSmoothScrollingEnabled = true;
  // ViewGroup 上的裁剪，滚动视图也有
  assert('clipToPadding 默认 true', sv.clipToPadding, true);
  sv.clipToPadding = false;
  assert('clipToPadding 写 false', sv.clipToPadding, false);
  sv.clipToPadding = true;
  assert('clipChildren 默认 true', hsv.clipChildren, true);

  // 越界效果的颜色（Android 12 起是拉伸，颜色只用在 11 的光晕上）
  assert("topEdgeEffectColor 默认 '#f5f5f533'", sv.topEdgeEffectColor, '#f5f5f533');
  assert("bottomEdgeEffectColor 默认 '#f5f5f533'", sv.bottomEdgeEffectColor, '#f5f5f533');
  sv.topEdgeEffectColor = '#00ff0080';
  assert('topEdgeEffectColor 写读', sv.topEdgeEffectColor, '#00ff0080');
  assert('写上边不动下边', sv.bottomEdgeEffectColor, '#f5f5f533');
  sv.bottomEdgeEffectColor = 'rgb(0, 0, 255)';
  assert('bottomEdgeEffectColor 原样读回', sv.bottomEdgeEffectColor, 'rgb(0, 0, 255)');
  assert('bottomEdgeEffectColor 写错：一条警告',
         warnings(() => { sv.bottomEdgeEffectColor = 'blue'; }),
         '[Nacre] bottomEdgeEffectColor: "blue" is not a valid color, ignored');
  assert('bottomEdgeEffectColor 写错之后值不变', sv.bottomEdgeEffectColor, 'rgb(0, 0, 255)');

  // 内容
  const { content, top, bottom } = tallContent('往上滑我', '底下的字', 2000);
  sv.contentView = content;
  assert('contentView 写读是同一个', sv.contentView === content, true);
  assert('内容的 parent 是滚动视图', content.parent === sv, true);
  bad = {};
  assert('contentView 写普通对象抛 TypeError', thrown(() => { sv.contentView = bad; }), 'TypeError');
  assert('contentView 写自己抛 HierarchyRequestError', thrown(() => { sv.contentView = sv; }), 'HierarchyRequestError');
  const holder = new LinearLayout();
  holder.addView(sv);
  assert('contentView 写祖先抛 HierarchyRequestError', thrown(() => { sv.contentView = holder; }), 'HierarchyRequestError');
  holder.removeView(sv);
  assert('写错之后内容不变', sv.contentView === content, true);
  const other = new TextView();
  sv.contentView = other;
  assert('换内容：原来的内容 parent 变 null', content.parent, null);
  assert('换内容：新内容的 parent 是滚动视图', other.parent === sv, true);
  holder.addView(other);
  assert('内容被 addView 到别处：滚动视图的 contentView 变 null', sv.contentView, null);
  assert('它现在在别处', other.parent === holder, true);
  sv.contentView = other;
  assert('从别处移过来：原来的父视图里没有它了', holder.children.length, 0);
  sv.contentView = null;
  assert('contentView 写 null：拿下来', other.parent, null);
  sv.contentView = content;

  // 动作：自由时抛 InvalidStateError；参数先查
  assert('fling 给 NaN 抛 TypeError', thrown(() => sv.fling(NaN)), 'TypeError');
  assert('fling 不给参数抛 TypeError', thrown(() => /** @type {any} */ (sv).fling()), 'TypeError');
  assert('自由时 fling 抛 InvalidStateError', thrown(() => sv.fling(1000)), 'InvalidStateError');
  assert("竖的 fullScroll 方向写 'left' 抛 TypeError", thrown(() => sv.fullScroll(/** @type {any} */ ('left'))), 'TypeError');
  assert('自由时 fullScroll 抛 InvalidStateError', thrown(() => sv.fullScroll('down')), 'InvalidStateError');
  assert("pageScroll 方向写 'sideways' 抛 TypeError", thrown(() => sv.pageScroll(/** @type {any} */ ('sideways'))), 'TypeError');
  assert('自由时 pageScroll 抛 InvalidStateError', thrown(() => sv.pageScroll('down')), 'InvalidStateError');
  assert('arrowScroll 不给方向抛 TypeError', thrown(() => /** @type {any} */ (sv).arrowScroll()), 'TypeError');
  assert('自由时 arrowScroll 抛 InvalidStateError', thrown(() => sv.arrowScroll('down')), 'InvalidStateError');
  // smoothScrollTo 只收一个方向；自由时就是写 scrollY
  assert('smoothScrollTo 不给参数抛 TypeError', thrown(() => /** @type {any} */ (sv).smoothScrollTo()), 'TypeError');
  assert("smoothScrollTo('x') 抛 TypeError", thrown(() => sv.smoothScrollTo(/** @type {any} */ ('x'))), 'TypeError');
  sv.smoothScrollTo(40);
  assert('自由时 smoothScrollTo(40) 就是 scrollY = 40', sv.scrollY, 40);
  assert('scrollToDescendant 给普通对象抛 TypeError', thrown(() => sv.scrollToDescendant(/** @type {any} */ ({}))), 'TypeError');
  assert('scrollToDescendant 给不是后代的视图抛 NotFoundError', thrown(() => sv.scrollToDescendant(new View())), 'NotFoundError');
  assert('scrollToDescendant 给自己抛 NotFoundError', thrown(() => sv.scrollToDescendant(sv)), 'NotFoundError');

  // ===== 挂上：滚动位置排完版才设 =====
  console.log('  --- 滚动：ScrollView 挂上 ---');
  sv.scrollY = 500;
  activity.contentView = sv;
  assert('刚挂上、还没排版：读到的是写进去的 500', sv.scrollY, 500);
  await sleep(400);
  assert('排完版：滚到了 500（排版之前设会被夹成 0）', sv.scrollY, 500);
  assert('挂上之后能往下滚', sv.canScroll('down'), true);
  assert('不在顶上能往上滚', sv.canScroll('up'), true);
  assert('竖着滚的不能往右滚', sv.canScroll('right'), false);

  sv.scrollY = 1000000;
  const max = sv.scrollY;
  assert('ScrollView 把 scrollY 夹在内容的范围里（读原生）', max > 1500 && max < 3200, true);
  assert('滚到底不能再往下滚', sv.canScroll('down'), false);
  sv.scrollY = -100;
  assert('scrollY 写负数夹到 0', sv.scrollY, 0);
  assert('在顶上不能往上滚', sv.canScroll('up'), false);
  sv.scrollY = 300;
  assert('scrollY 写 300', sv.scrollY, 300);
  sv.scrollX = 50;
  assert('竖着滚的 ScrollView 横着滚不动', sv.scrollX, 0);

  // 挂着时刚换了内容就写 scrollY：等这次排完版再设
  const taller = tallContent('换过的内容', '更底下的字', 4000);
  sv.contentView = taller.content;
  sv.scrollY = 3500;
  assert('刚换内容就写：还没排版时读到写进去的值', sv.scrollY, 3500);
  await sleep(400);
  assert('刚换内容就写：排完版滚到了 3500', sv.scrollY, 3500);
  sv.contentView = content;
  await sleep(300);

  // scroll 事件：不带数据，延后一轮派发，位置读 scrollY
  /** @type {Event[]} */
  const events = [];
  /** @type {number[]} */
  const seenY = [];
  const onScroll = (/** @type {Event} */ e) => { events.push(e); seenY.push(sv.scrollY); };
  sv.addEventListener('scroll', onScroll);
  sv.scrollY = 200;
  assert('scroll 不在写 scrollY 时当场派发', events.length, 0);
  await sleep(50);
  assert('写 scrollY 之后收到一次 scroll', events.length, 1);
  const first = events[0];
  assert('scroll 是普通的 Event', first !== undefined && first.constructor === Event, true);
  assert('scroll 的 type', first !== undefined ? first.type : '', 'scroll');
  assert('scroll 的 target 是滚动的视图', first !== undefined && first.target === sv, true);
  assert('scroll 不可取消', first !== undefined ? first.cancelable : true, false);
  assert('监听器里读到的 scrollY', seenY[0], 200);
  sv.scrollY = 200;
  await sleep(50);
  assert('滚到同一个位置不发 scroll', events.length, 1);

  // smoothScrollTo：动画着滚过去，一路发 scroll
  events.length = 0;
  sv.smoothScrollTo(1200);
  assert('smoothScrollTo 不当场到位', sv.scrollY < 1200, true);
  assert('smoothScrollTo 一会儿就到位', await until(() => sv.scrollY === 1200, 2000), true);
  assert('smoothScrollTo 一路发了好几次 scroll', events.length > 2, true);

  // fling：按初速度（dp/秒）甩出去
  sv.scrollY = 0;
  await sleep(50);
  events.length = 0;
  sv.fling(2500);
  assert('fling 之后在动', await until(() => sv.scrollY > 0, 1000), true);
  await sleep(1500);
  assert('fling 甩出去一段距离', sv.scrollY > 100, true);
  assert('fling 一路发了好几次 scroll', events.length > 2, true);

  // fullScroll / pageScroll / arrowScroll：关了平滑滚动就当场到位
  sv.isSmoothScrollingEnabled = false;
  sv.scrollY = 0;
  assert("fullScroll('down') 返回布尔值", typeof sv.fullScroll('down'), 'boolean');
  assert("fullScroll('down') 滚到底", sv.scrollY, max);
  sv.fullScroll('up');
  assert("fullScroll('up') 回到顶", sv.scrollY, 0);
  sv.pageScroll('down');
  const paged = sv.scrollY;
  assert("pageScroll('down') 往下翻一页", paged > 200, true);
  sv.pageScroll('up');
  assert("pageScroll('up') 翻回来", sv.scrollY, 0);
  assert("arrowScroll('down') 返回布尔值", typeof sv.arrowScroll('down'), 'boolean');
  assert("arrowScroll('down') 往下滚一点", sv.scrollY > 0 && sv.scrollY <= paged, true);
  sv.isSmoothScrollingEnabled = true;

  // scrollToDescendant：挂着时滚到让它露出来
  sv.scrollY = 0;
  await sleep(50);
  sv.scrollToDescendant(bottom);
  assert('scrollToDescendant 滚到了底下的字那里', await until(() => sv.scrollY > 1000, 2000), true);

  // 摘掉监听器之后不再收到
  sv.removeEventListener('scroll', onScroll);
  events.length = 0;
  sv.scrollY = 50;
  await sleep(50);
  assert('摘掉监听器之后不再收到 scroll', events.length, 0);

  // 用手指拖：脚本用 adb 从「往上滑我」的中间往上划 1000 像素
  sv.scrollY = 0;
  await sleep(100);
  let dragged = 0;
  const onDrag = () => { dragged++; };
  sv.addEventListener('scroll', onDrag);
  console.log('[acceptance] swipe 0 -1000 往上滑我');
  assert('用手指往上划，内容往下滚', await until(() => sv.scrollY > 100, 15000), true);
  assert('手指划的时候也收到 scroll', dragged > 2, true);
  await sleep(1500);
  sv.removeEventListener('scroll', onDrag);

  // 拿下来：系统改过的滚动位置读回 JS
  const fingerY = sv.scrollY;
  activity.contentView = null;
  assert('拿下来之后读到的是拿下来那一刻的位置', sv.scrollY, fingerY);
  sv.scrollY = 600;
  assert('拿下来时写 scrollY', sv.scrollY, 600);
  activity.contentView = sv;
  await sleep(400);
  assert('放回去、排完版滚到了拿下来时写的 600', sv.scrollY, 600);

  // 自由时先记下的 scrollToDescendant：挂上、排完版再滚
  const sv2 = new ScrollView();
  const tall2 = tallContent('第二个', '要露出来的字', 2500);
  sv2.contentView = tall2.content;
  sv2.scrollToDescendant(tall2.bottom);
  assert('自由时 scrollToDescendant 不抛、位置不变', sv2.scrollY, 0);
  activity.contentView = sv2;
  assert('挂上之后排完版滚到了那里', await until(() => sv2.scrollY > 1500, 2000), true);

  // 普通视图挂上：写过的滚动位置照样设上（不限制范围）
  const box = new LinearLayout();
  box.orientation = 'vertical';
  box.addView(plain);
  activity.contentView = box;
  await sleep(300);
  assert('普通视图挂上之后 scrollY 是写进去的 6', plain.scrollY, 6);
  plain.scrollY = -20;
  assert('普通视图挂着时写负数也照样', plain.scrollY, -20);
  plain.scrollY = 0;
  plain.scrollX = 0;

  // 密度变了：滚动位置按 dp 留着（系统改过的位置先读回来，再按新密度设）
  activity.contentView = sv;
  await sleep(300);
  sv.smoothScrollTo(640);
  assert('密度那段：先滚到 640', await until(() => sv.scrollY === 640, 2000), true);
  const changed = new Promise((resolve) => {
    activity.addEventListener('windowinsetschange', () => resolve(true), { once: true });
    setTimeout(() => resolve(false), 10000);
  });
  console.log('[acceptance] density 560');
  assert('密度改成 560 dpi（等到边衬变了）', await changed, true);
  await sleep(600);
  assert('密度变了之后 scrollY 还是 640 dp（差不到 1）', near(sv.scrollY, 640, 1), true);
  const restored = new Promise((resolve) => {
    activity.addEventListener('windowinsetschange', () => resolve(true), { once: true });
    setTimeout(() => resolve(false), 10000);
  });
  console.log('[acceptance] density restore');
  assert('密度还原', await restored, true);
  await sleep(600);
  assert('还原之后 scrollY 还是 640 dp（差不到 1）', near(sv.scrollY, 640, 1), true);

  // ===== HorizontalScrollView =====
  console.log('  --- 滚动：HorizontalScrollView ---');
  assert('isFillViewport 默认 false', hsv.isFillViewport, false);
  assert('isSmoothScrollingEnabled 默认 true', hsv.isSmoothScrollingEnabled, true);
  assert("leftEdgeEffectColor 默认 '#f5f5f533'", hsv.leftEdgeEffectColor, '#f5f5f533');
  assert("rightEdgeEffectColor 默认 '#f5f5f533'", hsv.rightEdgeEffectColor, '#f5f5f533');
  hsv.rightEdgeEffectColor = '#654321';
  assert('rightEdgeEffectColor 写读', hsv.rightEdgeEffectColor, '#654321');
  hsv.leftEdgeEffectColor = '#abcdef';
  assert('leftEdgeEffectColor 写读', hsv.leftEdgeEffectColor, '#abcdef');
  assert('HorizontalScrollView 没有 topEdgeEffectColor', 'topEdgeEffectColor' in hsv, false);
  assert('HorizontalScrollView 没有 scrollToDescendant（Java 里也没有）', 'scrollToDescendant' in hsv, false);
  assert("横的 fullScroll 方向写 'up' 抛 TypeError", thrown(() => hsv.fullScroll(/** @type {any} */ ('up'))), 'TypeError');
  assert('自由时横的 fling 抛 InvalidStateError', thrown(() => hsv.fling(1000)), 'InvalidStateError');
  const wide = new LinearLayout();
  const wideText = new TextView();
  wideText.text = '往左滑我';
  const wideSpacer = new View();
  wideSpacer.minimumWidth = 3000;
  wide.addView(wideText);
  wide.addView(wideSpacer);
  hsv.contentView = wide;
  hsv.scrollX = 700;
  hsv.smoothScrollTo(800);
  assert('自由时横的 smoothScrollTo(800) 就是 scrollX = 800', hsv.scrollX, 800);
  activity.contentView = hsv;
  await sleep(400);
  assert('横的挂上、排完版滚到了 800', hsv.scrollX, 800);
  assert('挂上之后能往右滚', hsv.canScroll('right'), true);
  assert('能往左滚', hsv.canScroll('left'), true);
  assert('横着滚的不能往下滚', hsv.canScroll('down'), false);
  hsv.scrollX = 1000000;
  const hmax = hsv.scrollX;
  assert('横的 scrollX 夹在内容的范围里', hmax > 2000 && hmax < 3200, true);
  hsv.scrollY = 50;
  assert('横着滚的不能竖着滚', hsv.scrollY, 0);
  hsv.isSmoothScrollingEnabled = false;
  hsv.fullScroll('left');
  assert("fullScroll('left') 回到最左", hsv.scrollX, 0);
  hsv.fullScroll('right');
  assert("fullScroll('right') 到最右", hsv.scrollX, hmax);
  hsv.pageScroll('left');
  assert("pageScroll('left') 往左翻一页", hsv.scrollX < hmax, true);
  assert("arrowScroll('left') 返回布尔值", typeof hsv.arrowScroll('left'), 'boolean');
  hsv.isSmoothScrollingEnabled = true;
  hsv.scrollX = 0;
  await sleep(50);
  let hEvents = 0;
  hsv.addEventListener('scroll', () => { hEvents++; });
  hsv.smoothScrollTo(900);
  assert('横的 smoothScrollTo 到位', await until(() => hsv.scrollX === 900, 2000), true);
  hsv.fling(2000);
  assert('横的 fling 在动', await until(() => hsv.scrollX > 900, 1000), true);
  assert('横着滚也发 scroll', hEvents > 2, true);

  activity.contentView = null;
  void top;
}
