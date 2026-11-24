// 滚动：View 上的滚动位置、滚动条、越界效果、嵌套滚动、scroll 事件；ScrollView 和
// HorizontalScrollView。
//
// 单位是像素（时长是毫秒），照 Android 的 API 原样。枚举是字符串；属性写错打一条警告、
// 值不变，方法参数写错抛 TypeError。scroll 事件不带数据，位置读 scrollX / scrollY。
//
// 中间一段把 ScrollView 挂到屏幕上，用代码滚、用 fling 甩、再让脚本用手指（adb 的 swipe）
// 拖一下，看系统真的会滚、滚的时候 JS 收得到 scroll。

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

/** @param {import("../main.js").StepContext} ctx */
export async function stepScroll(ctx) {
  const { assert } = ctx;
  const activity = application.activity;
  /** @type {any} 故意写错类型的地方用它 */
  let bad;

  // ===== 类 =====
  console.log('  --- 滚动：类 ---');
  assert('ScrollView 在全局', typeof ScrollView, 'function');
  assert('HorizontalScrollView 在全局', typeof HorizontalScrollView, 'function');
  assert('不接 AndroidX 的 NestedScrollView', typeof (/** @type {any} */ (globalThis).NestedScrollView), 'undefined');
  const sv = new ScrollView(activity);
  assert('ScrollView 是 ViewGroup', sv instanceof ViewGroup, true);
  assert('HorizontalScrollView 是 ViewGroup', new HorizontalScrollView(activity) instanceof ViewGroup, true);
  assert('new ScrollView() 不给参数抛 TypeError', thrown(() => new /** @type {any} */ (ScrollView)()), 'TypeError');
  assert('new ScrollView 给普通对象抛 TypeError', thrown(() => new ScrollView(/** @type {any} */ ({}))), 'TypeError');
  class MyScroll extends ScrollView {}
  const mine = new MyScroll(activity);
  assert('ScrollView 能在 JS 里继承', mine instanceof ScrollView && mine instanceof MyScroll, true);

  // ===== View 上的滚动位置（任何视图都有，不限制范围） =====
  console.log('  --- 滚动：View 上的位置 ---');
  const plain = new View(activity);
  assert('scrollX 一开始是 0', plain.scrollX, 0);
  assert('scrollY 一开始是 0', plain.scrollY, 0);
  plain.scrollTo(10, 20);
  assert('scrollTo 之后 scrollX', plain.scrollX, 10);
  assert('scrollTo 之后 scrollY', plain.scrollY, 20);
  plain.scrollBy(5, -30);
  assert('scrollBy 之后 scrollX', plain.scrollX, 15);
  assert('普通视图不限制范围：scrollY 可以是负的', plain.scrollY, -10);
  plain.scrollX = '7.9';
  assert("scrollX 写 '7.9' 向零取整", plain.scrollX, 7);
  plain.scrollY = 3;
  assert('scrollY 写 3', plain.scrollY, 3);
  bad = 'abc';
  assert("scrollY 写 'abc' 抛 TypeError", thrown(() => { plain.scrollY = bad; }), 'TypeError');
  assert('scrollY 写错之后值不变', plain.scrollY, 3);
  assert('scrollTo 只给一个参数抛 TypeError', thrown(() => /** @type {any} */ (plain).scrollTo(1)), 'TypeError');
  assert('scrollBy 给 NaN 抛 TypeError', thrown(() => plain.scrollBy(NaN, 0)), 'TypeError');
  assert('canScrollVertically 没有内容的视图是 false', plain.canScrollVertically(1), false);
  assert('canScrollHorizontally 没有内容的视图是 false', plain.canScrollHorizontally(-1), false);
  assert('canScrollVertically 不给参数抛 TypeError',
         thrown(() => /** @type {any} */ (plain).canScrollVertically()), 'TypeError');

  // ===== 越界效果 =====
  console.log('  --- 滚动：越界效果 ---');
  for (const mode of /** @type {const} */ (['always', 'never', 'ifContentScrolls'])) {
    sv.overScrollMode = mode;
    assert('overScrollMode 写读 ' + mode, sv.overScrollMode, mode);
  }
  bad = 'sometimes';
  assert('overScrollMode 写错：一条警告',
         warnings(() => { sv.overScrollMode = bad; }),
         '[Nacre] overScrollMode has no value "sometimes"; expected one of: always / ifContentScrolls / never, ignored');
  assert('overScrollMode 写错之后值不变', sv.overScrollMode, 'ifContentScrolls');

  // 边缘效果的颜色（Android 12 起是拉伸，颜色只用在 11 的光晕上）
  sv.setEdgeEffectColor('#ff0000');
  assert('setEdgeEffectColor 之后上边是这个颜色', sv.topEdgeEffectColor, '#ff0000');
  assert('setEdgeEffectColor 之后下边是这个颜色', sv.bottomEdgeEffectColor, '#ff0000');
  sv.topEdgeEffectColor = '#00ff0080';
  assert('topEdgeEffectColor 单独写', sv.topEdgeEffectColor, '#00ff0080');
  assert('写上边不动下边', sv.bottomEdgeEffectColor, '#ff0000');
  sv.bottomEdgeEffectColor = 'rgb(0, 0, 255)';
  assert('bottomEdgeEffectColor 写 rgb()', sv.bottomEdgeEffectColor, '#0000ff');
  assert('bottomEdgeEffectColor 写错：一条警告',
         warnings(() => { sv.bottomEdgeEffectColor = 'blue'; }).startsWith('[Nacre] bottomEdgeEffectColor: '), true);
  assert('bottomEdgeEffectColor 写错之后值不变', sv.bottomEdgeEffectColor, '#0000ff');
  assert('setEdgeEffectColor 颜色写错抛 TypeError', thrown(() => sv.setEdgeEffectColor('nope')), 'TypeError');

  // ===== 滚动条 =====
  console.log('  --- 滚动：滚动条 ---');
  assert('ScrollView 默认有竖的滚动条', sv.isVerticalScrollBarEnabled, true);
  assert('ScrollView 默认没有横的滚动条', sv.isHorizontalScrollBarEnabled, false);
  sv.isVerticalScrollBarEnabled = false;
  assert('isVerticalScrollBarEnabled 写 false', sv.isVerticalScrollBarEnabled, false);
  sv.isVerticalScrollBarEnabled = 1;
  assert('isVerticalScrollBarEnabled 写 1 照 Boolean()', sv.isVerticalScrollBarEnabled, true);
  sv.isHorizontalScrollBarEnabled = true;
  assert('isHorizontalScrollBarEnabled 写 true', sv.isHorizontalScrollBarEnabled, true);
  sv.isHorizontalScrollBarEnabled = false;
  sv.isScrollbarFadingEnabled = false;
  assert('isScrollbarFadingEnabled 写 false', sv.isScrollbarFadingEnabled, false);
  sv.isScrollbarFadingEnabled = true;
  assert('isScrollbarFadingEnabled 写 true', sv.isScrollbarFadingEnabled, true);
  sv.scrollBarFadeDuration = 500;
  assert('scrollBarFadeDuration 写 500（毫秒）', sv.scrollBarFadeDuration, 500);
  sv.scrollBarDefaultDelayBeforeFade = 800;
  assert('scrollBarDefaultDelayBeforeFade 写 800（毫秒）', sv.scrollBarDefaultDelayBeforeFade, 800);
  sv.scrollBarSize = 12;
  assert('scrollBarSize 写 12（像素）', sv.scrollBarSize, 12);
  bad = 'wide';
  assert("scrollBarSize 写 'wide' 抛 TypeError", thrown(() => { sv.scrollBarSize = bad; }), 'TypeError');
  assert('verticalScrollbarWidth 是数', typeof sv.verticalScrollbarWidth, 'number');
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
  for (const pos of /** @type {const} */ (['left', 'right', 'default'])) {
    sv.verticalScrollbarPosition = pos;
    assert('verticalScrollbarPosition 写读 ' + pos, sv.verticalScrollbarPosition, pos);
  }
  bad = 'middle';
  assert('verticalScrollbarPosition 写错：一条警告',
         warnings(() => { sv.verticalScrollbarPosition = bad; }),
         '[Nacre] verticalScrollbarPosition has no value "middle"; expected one of: default / left / right, ignored');

  // 滑块和轨道：Drawable，视图持有它们
  const thumb = new GradientDrawable();
  thumb.color = '#3366cc';
  thumb.cornerRadius = 6;
  sv.verticalScrollbarThumbDrawable = thumb;
  assert('verticalScrollbarThumbDrawable 写读是同一个', sv.verticalScrollbarThumbDrawable === thumb, true);
  const track = new ColorDrawable('#00000010');
  sv.verticalScrollbarTrackDrawable = track;
  assert('verticalScrollbarTrackDrawable 写读是同一个', sv.verticalScrollbarTrackDrawable === track, true);
  const hThumb = new ColorDrawable('#cc3366');
  sv.horizontalScrollbarThumbDrawable = hThumb;
  assert('horizontalScrollbarThumbDrawable 写读是同一个', sv.horizontalScrollbarThumbDrawable === hThumb, true);
  const hTrack = new ColorDrawable('#00000010');
  sv.horizontalScrollbarTrackDrawable = hTrack;
  assert('horizontalScrollbarTrackDrawable 写读是同一个', sv.horizontalScrollbarTrackDrawable === hTrack, true);
  bad = {};
  assert('verticalScrollbarThumbDrawable 给普通对象抛 TypeError',
         thrown(() => { sv.verticalScrollbarThumbDrawable = bad; }), 'TypeError');
  assert('写错之后滑块不变', sv.verticalScrollbarThumbDrawable === thumb, true);

  // 滚动指示线（位掩码，字符串数组）
  assert('scrollIndicators 一开始是空的', sv.scrollIndicators.join(','), '');
  sv.scrollIndicators = ['bottom', 'top'];
  assert('scrollIndicators 写 bottom、top，按数值的顺序读出', sv.scrollIndicators.join(','), 'top,bottom');
  sv.scrollIndicators = ['start', 'end', 'left', 'right'];
  assert('scrollIndicators 写四个', sv.scrollIndicators.join(','), 'left,right,start,end');
  bad = ['top', 'sideways'];
  assert('scrollIndicators 有一个写错：一条警告',
         warnings(() => { sv.scrollIndicators = bad; }),
         '[Nacre] scrollIndicators has no value "sideways"; expected one of: ' +
         'top / bottom / left / right / start / end, ignored');
  assert('有一个写错，整次不生效', sv.scrollIndicators.join(','), 'left,right,start,end');
  bad = 'top';
  assert('scrollIndicators 写字符串（不是数组）抛 TypeError', thrown(() => { sv.scrollIndicators = bad; }), 'TypeError');
  sv.scrollIndicators = [];
  assert('scrollIndicators 写空数组', sv.scrollIndicators.join(','), '');

  // 边缘渐隐
  sv.isVerticalFadingEdgeEnabled = true;
  assert('isVerticalFadingEdgeEnabled 写 true', sv.isVerticalFadingEdgeEnabled, true);
  sv.isHorizontalFadingEdgeEnabled = true;
  assert('isHorizontalFadingEdgeEnabled 写 true', sv.isHorizontalFadingEdgeEnabled, true);
  sv.isHorizontalFadingEdgeEnabled = false;
  assert('isHorizontalFadingEdgeEnabled 写 false', sv.isHorizontalFadingEdgeEnabled, false);
  sv.setFadingEdgeLength(48);
  assert('setFadingEdgeLength(48) 之后竖的渐隐长度', sv.verticalFadingEdgeLength, 48);
  assert('setFadingEdgeLength 给 NaN 抛 TypeError', thrown(() => sv.setFadingEdgeLength(NaN)), 'TypeError');
  bad = 1;
  assert('verticalFadingEdgeLength 是只读的', thrown(() => { /** @type {any} */ (sv).verticalFadingEdgeLength = bad; }), 'TypeError');
  sv.isVerticalFadingEdgeEnabled = false;

  // 嵌套滚动
  sv.isNestedScrollingEnabled = true;
  assert('isNestedScrollingEnabled 写 true', sv.isNestedScrollingEnabled, true);
  sv.isNestedScrollingEnabled = false;
  assert('isNestedScrollingEnabled 写 false', sv.isNestedScrollingEnabled, false);

  // ===== ScrollView 自己的 =====
  console.log('  --- 滚动：ScrollView ---');
  assert('isFillViewport 默认 false', sv.isFillViewport, false);
  sv.isFillViewport = true;
  assert('isFillViewport 写 true', sv.isFillViewport, true);
  sv.isFillViewport = false;
  assert('isSmoothScrollingEnabled 默认 true', sv.isSmoothScrollingEnabled, true);
  sv.isSmoothScrollingEnabled = false;
  assert('isSmoothScrollingEnabled 写 false', sv.isSmoothScrollingEnabled, false);
  sv.isSmoothScrollingEnabled = true;

  // 内容：一段 5000 像素高的字（背景的固有高度撑起来）
  const content = new TextView(activity);
  content.text = '往上滑我';
  const tall = new GradientDrawable('topBottom', ['#e0e8ff', '#ffe0f0']);
  tall.setSize(100, 5000);
  content.background = tall;
  sv.addView(content);
  assert('ScrollView 只能放一个子视图：第二个是 Java 的异常',
         thrown(() => sv.addView(new View(activity))), 'IllegalStateException');
  assert('fullScroll 方向写错抛 TypeError', thrown(() => sv.fullScroll(/** @type {any} */ ('left'))), 'TypeError');
  assert('pageScroll 方向写错抛 TypeError', thrown(() => sv.pageScroll(/** @type {any} */ ('sideways'))), 'TypeError');
  assert('arrowScroll 不给方向抛 TypeError', thrown(() => /** @type {any} */ (sv).arrowScroll()), 'TypeError');
  assert('fling 给 NaN 抛 TypeError', thrown(() => sv.fling(NaN)), 'TypeError');
  assert('smoothScrollTo 只给一个参数抛 TypeError', thrown(() => /** @type {any} */ (sv).smoothScrollTo(1)), 'TypeError');
  assert('scrollToDescendant 给普通对象抛 TypeError',
         thrown(() => sv.scrollToDescendant(/** @type {any} */ ({}))), 'TypeError');

  activity.setContentView(sv);
  await sleep(400);

  assert('挂上之后能往下滚', sv.canScrollVertically(1), true);
  assert('在顶上不能往上滚', sv.canScrollVertically(-1), false);
  assert('maxScrollAmount 是正数（一次最多滚多少）', sv.maxScrollAmount > 0, true);

  sv.scrollTo(0, 500);
  assert('scrollTo(0, 500)', sv.scrollY, 500);
  sv.scrollTo(0, 1000000);
  const max = sv.scrollY;
  assert('ScrollView 的 scrollTo 夹在内容的范围里', max > 2000 && max < 5000, true);
  assert('滚到底不能再往下滚', sv.canScrollVertically(1), false);
  sv.scrollTo(0, -100);
  assert('scrollTo 负数夹到 0', sv.scrollY, 0);
  sv.scrollBy(0, 100);
  assert('scrollBy(0, 100)', sv.scrollY, 100);
  sv.scrollY = 300;
  assert('scrollY 写 300', sv.scrollY, 300);
  sv.scrollTo(300, 300);
  assert('竖着滚的 ScrollView 横着滚不动', sv.scrollX, 0);

  // scroll 事件：不带数据，延后一轮派发，位置读 scrollY
  /** @type {Event[]} */
  const events = [];
  /** @type {number[]} */
  const seenY = [];
  const onScroll = (/** @type {Event} */ e) => { events.push(e); seenY.push(sv.scrollY); };
  sv.addEventListener('scroll', onScroll);
  sv.scrollTo(0, 200);
  assert('scroll 不在 scrollTo 里当场派发', events.length, 0);
  await sleep(50);
  assert('scrollTo 之后收到一次 scroll', events.length, 1);
  const first = events[0];
  assert('scroll 是普通的 Event', first !== undefined && first.constructor === Event, true);
  assert('scroll 的 type', first !== undefined ? first.type : '', 'scroll');
  assert('scroll 的 target 是滚动的视图', first !== undefined && first.target === sv, true);
  assert('scroll 不可取消', first !== undefined ? first.cancelable : true, false);
  assert('监听器里读到的 scrollY', seenY[0], 200);
  sv.scrollTo(0, 200);
  await sleep(50);
  assert('滚到同一个位置不发 scroll', events.length, 1);

  // smoothScrollTo：动画着滚过去，一路发 scroll
  events.length = 0;
  sv.smoothScrollTo(0, 1200);
  assert('smoothScrollTo 不当场到位', sv.scrollY < 1200, true);
  assert('smoothScrollTo 一会儿就到位', await until(() => sv.scrollY === 1200, 2000), true);
  assert('smoothScrollTo 一路发了好几次 scroll', events.length > 2, true);
  sv.smoothScrollBy(0, -200);
  assert('smoothScrollBy(0, -200) 到位', await until(() => sv.scrollY === 1000, 2000), true);

  // fling：按初速度（像素每秒）甩出去
  sv.scrollTo(0, 0);
  await sleep(50);
  events.length = 0;
  sv.fling(6000);
  assert('fling 之后在动', await until(() => sv.scrollY > 0, 1000), true);
  await sleep(1500);
  assert('fling 甩出去一段距离', sv.scrollY > 300, true);
  assert('fling 一路发了好几次 scroll', events.length > 2, true);

  // fullScroll / pageScroll / arrowScroll：关了平滑滚动就当场到位
  sv.isSmoothScrollingEnabled = false;
  sv.scrollTo(0, 0);
  assert('fullScroll(down) 返回布尔值', typeof sv.fullScroll('down'), 'boolean');
  assert('fullScroll(down) 滚到底', sv.scrollY, max);
  sv.fullScroll('up');
  assert('fullScroll(up) 回到顶', sv.scrollY, 0);
  sv.pageScroll('down');
  assert('pageScroll(down) 往下翻一页', sv.scrollY > 500, true);
  const paged = sv.scrollY;
  sv.pageScroll('up');
  assert('pageScroll(up) 翻回来', sv.scrollY, 0);
  assert('arrowScroll(down) 返回布尔值', typeof sv.arrowScroll('down'), 'boolean');
  assert('arrowScroll(down) 往下滚一点', sv.scrollY > 0 && sv.scrollY < paged + 1, true);
  sv.scrollToDescendant(content);
  assert('scrollToDescendant 不抛', true, true);
  sv.isSmoothScrollingEnabled = true;

  // 摘掉监听器之后不再收到
  sv.removeEventListener('scroll', onScroll);
  events.length = 0;
  sv.scrollTo(0, 50);
  await sleep(50);
  assert('摘掉监听器之后不再收到 scroll', events.length, 0);

  // 用手指拖：脚本用 adb 从「往上滑我」的中间往上划 1000 像素
  sv.scrollTo(0, 0);
  await sleep(50);
  let dragged = 0;
  sv.addEventListener('scroll', () => { dragged++; });
  console.log('[acceptance] swipe 0 -1000 往上滑我');
  assert('用手指往上划，内容往下滚', await until(() => sv.scrollY > 300, 15000), true);
  assert('手指划的时候也收到 scroll', dragged > 2, true);

  // ===== HorizontalScrollView =====
  console.log('  --- 滚动：HorizontalScrollView ---');
  const hsv = new HorizontalScrollView(activity);
  assert('HorizontalScrollView 默认有横的滚动条', hsv.isHorizontalScrollBarEnabled, true);
  assert('isFillViewport 默认 false', hsv.isFillViewport, false);
  assert('isSmoothScrollingEnabled 默认 true', hsv.isSmoothScrollingEnabled, true);
  hsv.setEdgeEffectColor('#123456');
  assert('setEdgeEffectColor 之后左边', hsv.leftEdgeEffectColor, '#123456');
  assert('setEdgeEffectColor 之后右边', hsv.rightEdgeEffectColor, '#123456');
  hsv.rightEdgeEffectColor = '#654321';
  assert('rightEdgeEffectColor 单独写', hsv.rightEdgeEffectColor, '#654321');
  hsv.leftEdgeEffectColor = '#abcdef';
  assert('leftEdgeEffectColor 单独写', hsv.leftEdgeEffectColor, '#abcdef');
  assert('横的 fullScroll 方向写 up 抛 TypeError', thrown(() => hsv.fullScroll(/** @type {any} */ ('up'))), 'TypeError');
  const wide = new TextView(activity);
  wide.text = '往左滑我';
  const wideBg = new GradientDrawable('leftRight', ['#e0ffe8', '#fff0e0']);
  wideBg.setSize(5000, 300);
  wide.background = wideBg;
  hsv.addView(wide);
  activity.setContentView(hsv);
  await sleep(400);
  assert('挂上之后能往右滚', hsv.canScrollHorizontally(1), true);
  hsv.scrollTo(700, 0);
  assert('scrollTo(700, 0)', hsv.scrollX, 700);
  hsv.scrollTo(1000000, 0);
  const hmax = hsv.scrollX;
  assert('横的 scrollTo 夹在内容的范围里', hmax > 3000 && hmax < 5000, true);
  hsv.isSmoothScrollingEnabled = false;
  hsv.fullScroll('left');
  assert("fullScroll('left') 回到最左", hsv.scrollX, 0);
  hsv.fullScroll('right');
  assert("fullScroll('right') 到最右", hsv.scrollX, hmax);
  hsv.pageScroll('left');
  assert("pageScroll('left') 往左翻一页", hsv.scrollX < hmax, true);
  assert("arrowScroll('left') 返回布尔值", typeof hsv.arrowScroll('left'), 'boolean');
  hsv.isSmoothScrollingEnabled = true;
  hsv.scrollTo(0, 0);
  /** @type {number} */
  let hEvents = 0;
  hsv.addEventListener('scroll', () => { hEvents++; });
  hsv.smoothScrollTo(900, 0);
  assert('横的 smoothScrollTo 到位', await until(() => hsv.scrollX === 900, 2000), true);
  hsv.fling(5000);
  assert('横的 fling 在动', await until(() => hsv.scrollX > 900, 1000), true);
  assert('横着滚也发 scroll', hEvents > 2, true);
  assert('横的 maxScrollAmount 是正数', hsv.maxScrollAmount > 0, true);
}
