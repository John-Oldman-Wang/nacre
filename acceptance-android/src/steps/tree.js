// 视图的基础：自由和挂上、树、内边距、方向。
//
// 视图建出来是自由的，不属于任何页面；放进某个页面的树（写 contentView，或者加进挂着的
// 父视图）才挂上，拿下来又变回自由。树记在 JS 里：自由的视图之间也能搭。状态（文字、
// 内边距、方向）以 JS 为准，自由时写读都行，挂上时才设到原生上；长度是 dp。
//
// 像素这一侧基础里没有成员读得出来，借了布局组的 frame（排出来的位置和大小，dp：原生的像素
// 除以页面的密度，期望值照同样的算法算）。密度用 App 层的 configuration.density（1 dp 是几个像素）。
//
// 最后一段改手机的显示密度：打「[acceptance] density 560」，android/scripts/run-device.sh
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
 * 抛的是不是 DOMException
 * @param {() => unknown} fn
 */
function thrownDOMException(fn) {
  try {
    fn();
    return false;
  } catch (err) {
    return err instanceof DOMException;
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
 * 等一个视图的 click，最多等 ms 毫秒。等到了是 true
 * @param {EventTarget} target
 * @param {number} ms
 * @returns {Promise<boolean>}
 */
function nextClick(target, ms) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      target.removeEventListener('click', onClick);
      resolve(false);
    }, ms);
    function onClick() {
      clearTimeout(timer);
      target.removeEventListener('click', onClick);
      resolve(true);
    }
    target.addEventListener('click', onClick);
  });
}

// dp 换成像素：四舍五入（正负对称），非 0 的至少 1 像素
/** @param {number} dp @param {number} density */
function px(dp, density) {
  const n = Math.round(Math.abs(dp) * density);
  return Math.sign(dp) * (dp !== 0 && n === 0 ? 1 : n);
}

/** @param {Activity} activity */
const densityOf = (activity) => activity.configuration.density;

/**
 * 等页面的密度变成 dpi，最多等 ms 毫秒。等到了是 true
 * @param {Activity} activity @param {number} dpi @param {number} ms
 */
async function waitForDensity(activity, dpi, ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (activity.configuration.density === dpi / 160) return true;
    await sleep(200);
  }
  return false;
}

/** 布局组的 frame：排出来的高，dp；还没排过版是 null @param {View} v */
const frameHeight = (v) => { const f = /** @type {any} */ (v).frame; return f === null ? null : f.height; };
/** @param {View} v */
const frameWidth = (v) => { const f = /** @type {any} */ (v).frame; return f === null ? null : f.width; };

/** @param {import("../main.js").StepContext} ctx */
export async function stepTree(ctx) {
  const { assert } = ctx;
  const activity = /** @type {Activity} */ (ctx.activity);
  console.log('  --- 基础：自由和挂上、树、内边距、方向 ---');

  // 给视图起名字，好把 children 的顺序打出来
  /** @type {Map<View, string>} */
  const names = new Map();
  /** @param {View} v @param {string} name */
  const named = (v, name) => { names.set(v, name); return v; };
  /** @param {readonly View[]} list */
  const order = (list) => list.map((v) => names.get(v) || '?').join(',');

  // ===== 自由的视图 =====
  const root = /** @type {LinearLayout} */ (named(new LinearLayout(), 'root'));
  const a = named(new TextView(), 'a');
  const b = named(new View(), 'b');
  const c = /** @type {LinearLayout} */ (named(new LinearLayout(), 'c'));
  const d = /** @type {LinearLayout} */ (named(new LinearLayout(), 'd'));
  assert('自由的视图 activity 是 null', a.activity, null);
  assert('自由的视图 parent 是 null', a.parent, null);
  assert('新建的布局 children 是空数组', Array.isArray(root.children) && root.children.length === 0, true);
  assert('children 是冻结的', Object.isFrozen(root.children), true);
  assert('树没变时 children 读两次是同一个数组', root.children === root.children, true);
  assert('children 不能写', thrown(() => { /** @type {any} */ (root).children = []; }), 'TypeError');
  assert('activity 不能写', thrown(() => { /** @type {any} */ (a).activity = activity; }), 'TypeError');
  assert('parent 不能写', thrown(() => { /** @type {any} */ (a).parent = root; }), 'TypeError');

  // ===== addView =====
  root.addView(a);
  const snapshot = root.children;
  root.addView(b);
  assert('addView 加到最后', order(root.children), 'a,b');
  assert('树变了 children 换了一个新数组', root.children !== snapshot, true);
  assert('旧的那个数组不跟着变（快照）', order(snapshot), 'a');
  assert('子视图的 parent 是父视图', a.parent === root && b.parent === root, true);
  assert('自由的视图之间搭的树还是自由的', a.activity, null);
  root.addView(c, { index: 0 });
  assert('addView 带 index 插到那个位置', order(root.children), 'c,a,b');
  root.addView(b, { index: 0 });
  assert('同一个父视图里再加一次是挪位置（index 是挪完之后排第几）', order(root.children), 'b,c,a');
  root.addView(b, { index: 2 });
  assert('挪到最后', order(root.children), 'c,a,b');
  root.addView(b);
  assert('不带 index 再加一次是挪到最后（已经在最后，不变）', order(root.children), 'c,a,b');
  root.addView(a, /** @type {any} */ (null));
  assert('options 是 null 当成空的：挪到最后', order(root.children), 'c,b,a');
  root.addView(a, { index: /** @type {any} */ ('1') });
  assert('index 是字符串按 Number() 转', order(root.children), 'c,a,b');
  root.addView(a, { index: 2.9 });
  assert('index 向零取整', order(root.children), 'c,b,a');
  root.addView(a, { index: undefined });
  assert('index 是 undefined 当成没给', order(root.children), 'c,b,a');

  assert('index 是负数抛 RangeError', thrown(() => root.addView(d, { index: -1 })), 'RangeError');
  assert('加一个新的，index 超过个数抛 RangeError', thrown(() => root.addView(d, { index: 4 })), 'RangeError');
  assert('加一个新的，index 等于个数是加到最后（不抛）', thrown(() => root.addView(d, { index: 3 })), '没抛');
  assert('加到最后了', order(root.children), 'c,b,a,d');
  assert('挪一个已经在里面的，index 超过挪完的个数 - 1 抛 RangeError',
         thrown(() => root.addView(a, { index: 4 })), 'RangeError');
  assert('index 是 NaN 抛 TypeError', thrown(() => root.addView(a, { index: NaN })), 'TypeError');
  assert('index 是 Infinity 抛 TypeError', thrown(() => root.addView(a, { index: Infinity })), 'TypeError');
  assert('抛了之后树不变', order(root.children), 'c,b,a,d');
  assert('addView 不是视图抛 TypeError', thrown(() => root.addView(/** @type {any} */ ('x'))), 'TypeError');
  assert('addView 页面抛 TypeError', thrown(() => root.addView(/** @type {any} */ (activity))), 'TypeError');
  assert('addView 不给参数抛 TypeError', thrown(() => /** @type {any} */ (root).addView()), 'TypeError');

  // 换父视图：移过来
  c.addView(d);
  assert('加到别的父视图下是移过来：原来的父视图里没了', order(root.children), 'c,b,a');
  assert('新的父视图里有了', order(c.children), 'd');
  assert('parent 跟着变', d.parent === c, true);

  // 成环
  assert('加自己抛 HierarchyRequestError', thrown(() => root.addView(root)), 'HierarchyRequestError');
  assert('HierarchyRequestError 是 DOMException', thrownDOMException(() => root.addView(root)), true);
  assert('加自己的父视图抛 HierarchyRequestError', thrown(() => c.addView(root)), 'HierarchyRequestError');
  assert('加隔了几层的祖先抛 HierarchyRequestError', thrown(() => d.addView(root)), 'HierarchyRequestError');
  assert('成环被拒之后树不变', order(root.children) + '/' + order(c.children) + '/' + order(d.children), 'c,b,a/d/');
  assert('成环被拒之后 parent 不变', root.parent === null && d.parent === c, true);

  // ===== removeView、removeAllViews =====
  root.removeView(b);
  assert('removeView 拿掉了', order(root.children), 'c,a');
  assert('拿掉的 parent 是 null', b.parent, null);
  assert('不是子视图的 removeView 抛 NotFoundError', thrown(() => root.removeView(b)), 'NotFoundError');
  assert('NotFoundError 是 DOMException', thrownDOMException(() => root.removeView(b)), true);
  assert('孙子视图不是子视图：NotFoundError', thrown(() => root.removeView(d)), 'NotFoundError');
  assert('removeView 不是视图抛 TypeError', thrown(() => root.removeView(/** @type {any} */ ({}))), 'TypeError');
  root.removeAllViews();
  assert('removeAllViews 之后 children 是空的', root.children.length, 0);
  assert('removeAllViews 之后原来的子视图 parent 是 null', a.parent === null && c.parent === null, true);
  assert('removeAllViews 不动孙子辈', d.parent === c, true);

  // ===== 内边距：四个 dp 属性 =====
  const p = new LinearLayout();
  assert('四个内边距默认都是 0',
         [p.paddingTop, p.paddingBottom, p.paddingStart, p.paddingEnd].join(','), '0,0,0,0');
  p.paddingTop = 12.5;
  assert('paddingTop 写小数读回原样（dp，不取整）', p.paddingTop, 12.5);
  p.paddingStart = /** @type {any} */ ('8');
  assert('字符串按 Number() 转', p.paddingStart, 8);
  p.paddingEnd = /** @type {any} */ (null);
  assert('null 按 Number() 转成 0', p.paddingEnd, 0);
  p.paddingBottom = -4;
  assert('负数照收（Android 允许）', p.paddingBottom, -4);
  assert('NaN 抛 TypeError', thrown(() => { p.paddingTop = NaN; }), 'TypeError');
  assert('Infinity 抛 TypeError', thrown(() => { p.paddingTop = Infinity; }), 'TypeError');
  assert('undefined 抛 TypeError', thrown(() => { p.paddingTop = /** @type {any} */ (undefined); }), 'TypeError');
  assert('抛了之后值不变', p.paddingTop, 12.5);
  assert('没有 paddingLeft（水平方向只有 start / end）', 'paddingLeft' in p, false);
  assert('没有 paddingRight', 'paddingRight' in p, false);
  assert('没有 setPadding 了', 'setPadding' in p, false);
  assert('没有 childCount 了', 'childCount' in p, false);
  assert('没有 getChildAt 了', 'getChildAt' in p, false);

  // ===== 方向：枚举的名字由原生在启动时交给 JS，自由时就能当场查 =====
  const o = new LinearLayout();
  assert('orientation 默认 horizontal', o.orientation, 'horizontal');
  o.orientation = 'vertical';
  assert('orientation 写 vertical 读回来', o.orientation, 'vertical');
  assert('orientation 写错名字：自由时就打警告',
         warnings(() => { o.orientation = /** @type {any} */ ('diagonal'); }),
         '[Nacre] orientation has no value "diagonal"; expected one of: horizontal / vertical, ignored');
  assert('写错之后值不变', o.orientation, 'vertical');
  assert('写对的不打警告', warnings(() => { o.orientation = 'horizontal'; }), '');

  // ===== 挂上、拿下来 =====
  const screen = new LinearLayout();
  screen.orientation = 'vertical';
  screen.paddingTop = 160;
  const box = new LinearLayout();
  const inner = new TextView();
  inner.text = '树里的字';
  box.addView(inner);
  screen.addView(box);
  let innerClicks = 0;
  inner.addEventListener('click', () => { innerClicks++; });

  activity.contentView = screen;
  assert('挂上之后 contentView 是它', activity.contentView === screen, true);
  assert('contentView 的 parent 是 null', screen.parent, null);
  assert('挂上之后整棵树的 activity 都是这个页面',
         screen.activity === activity && box.activity === activity && inner.activity === activity, true);
  const tap1 = nextClick(inner, 15000);
  console.log('[acceptance] tap 树里的字');
  assert('挂上之后，隔了一层的视图点得到', await tap1, true);

  // removeView：拿下来，替身留着；拿下来时写的状态放回去之后生效
  screen.removeView(box);
  assert('从挂着的父视图拿下来：activity 是 null', box.activity === null && inner.activity === null, true);
  assert('拿下来之后状态还读得到', inner.text, '树里的字');
  inner.text = '放回来的字';
  assert('拿下来时写的状态读回来', inner.text, '放回来的字');
  screen.addView(box);
  assert('放回挂着的父视图：又挂上了', box.activity === activity && inner.activity === activity, true);
  const tap2 = nextClick(inner, 15000);
  console.log('[acceptance] tap 放回来的字');
  assert('拿下来时写的文字放回去之后在屏幕上，监听器也还在', await tap2, true);
  assert('一共收到两次点击', innerClicks, 2);

  // 挂着时加的子视图当场挂上
  const late = new TextView();
  late.text = '后加的字';
  let lateClicked = false;
  late.addEventListener('click', () => { lateClicked = true; });
  box.addView(late, { index: 0 });
  assert('加进挂着的父视图：当场挂上', late.activity, activity);
  const tap3 = nextClick(late, 15000);
  console.log('[acceptance] tap 后加的字');
  assert('后加的字点得到', await tap3, true);
  assert('它的监听器收到了', lateClicked, true);

  // 换 contentView、写 null
  const other = new TextView();
  other.text = '换上来的';
  activity.contentView = other;
  assert('换 contentView：原来的内容拿下来了', screen.activity === null && inner.activity === null, true);
  assert('换上来的挂上了', other.activity, activity);
  activity.contentView = other;
  assert('写同一个什么都不变', activity.contentView === other && other.activity === activity, true);
  activity.contentView = null;
  assert('contentView 写 null：拿下来', activity.contentView === null && other.activity === null, true);
  assert('contentView 写字符串抛 TypeError',
         thrown(() => { activity.contentView = /** @type {any} */ ('x'); }), 'TypeError');
  assert('contentView 写普通对象抛 TypeError',
         thrown(() => { activity.contentView = /** @type {any} */ ({}); }), 'TypeError');
  assert('抛了之后 contentView 不变', activity.contentView, null);

  // 别处的视图写进 contentView 是移过来；contentView 加进别的父视图也是移过去
  const holder = new LinearLayout();
  const moved = new TextView();
  holder.addView(moved);
  activity.contentView = moved;
  assert('父视图下的视图写进 contentView：从父视图里移出来', holder.children.length === 0 && moved.parent === null, true);
  assert('移过来之后挂上了', moved.activity, activity);
  holder.addView(moved);
  assert('contentView 加进别的父视图：页面的内容空了', activity.contentView, null);
  assert('跟着父视图变回自由', moved.activity, null);

  // ===== 像素：挂上时 dp 按页面的密度换成像素 =====
  activity.contentView = screen;
  const density = densityOf(activity);
  const startDpi = density * 160;
  console.log('  实测：密度 ' + startDpi + ' dpi（1 dp = ' + density + ' 像素）');
  // 只有内边距的空布局，在竖排的布局里高度就是上下内边距之和
  const pad = new LinearLayout();
  pad.paddingTop = 10;
  pad.paddingBottom = 20.5;
  screen.addView(pad);
  // 拿下来、密度变了再放回去的那个
  const away = new LinearLayout();
  away.paddingTop = 10;
  screen.addView(away);
  await sleep(300);
  assert('挂上之后内边距按密度换成像素', frameHeight(pad), (px(10, density) + px(20.5, density)) / density);
  pad.paddingTop = 30;
  await sleep(300);
  assert('挂着时写的内边距当场设到原生', frameHeight(pad), (px(30, density) + px(20.5, density)) / density);
  const tiny = new LinearLayout();
  tiny.paddingTop = 0.1;
  screen.addView(tiny);
  await sleep(300);
  assert('不是 0 的内边距至少 1 像素', frameHeight(tiny), 1 / density);
  screen.removeView(away);

  // TextView 带着系统主题建：默认的内边距应该是 0（不是的话要回去讨论默认值）。
  // 一个没写过内边距（原生是主题给的），一个写了 0（四个都按 JS 的值设到原生），量出来一样大
  const row = new LinearLayout();
  const themed = new TextView();
  themed.text = '量内边距';
  const zeroed = new TextView();
  zeroed.text = '量内边距';
  zeroed.paddingTop = 0;
  row.addView(themed);
  row.addView(zeroed);
  screen.addView(row);
  await sleep(300);
  assert('TextView 主题给的内边距是 0（宽高和四边写了 0 的一样）',
         frameWidth(themed) + 'x' + frameHeight(themed), frameWidth(zeroed) + 'x' + frameHeight(zeroed));

  // ===== 密度变了：挂着的视图里 dp 的状态按新密度重设 =====
  const targetDpi = startDpi === 560 ? 480 : 560;
  console.log('[acceptance] density ' + targetDpi);
  assert('手机的显示密度改过来了', await waitForDensity(activity, targetDpi, 10000), true);
  await sleep(500);
  const density2 = densityOf(activity);
  assert('密度变了，挂着的内边距按新密度重设', frameHeight(pad), (px(30, density2) + px(20.5, density2)) / density2);
  assert('JS 里的值不变（还是 dp）', pad.paddingTop, 30);
  screen.addView(away);
  await sleep(300);
  assert('拿下来时密度变了，放回去之后按新密度设', frameHeight(away), px(10, density2) / density2);
  console.log('[acceptance] density restore');
  assert('手机的显示密度还原了', await waitForDensity(activity, startDpi, 10000), true);
  await sleep(500);
  assert('密度还原之后内边距也跟着回来', frameHeight(pad), (px(30, density) + px(20.5, density)) / density);
}
