// 安全区域：系统栏、开孔、键盘各占了多少（窗口边衬），变化时有事件。
//
// activitycreate 是在页面的 onCreate 里派发的，那时窗口还没挂到屏幕上，系统还没分发过窗口
// 边衬，读出来是 null；挂上去之后第一次分发会触发一次 windowinsetschange。所以订阅
// 要在 activitycreate 里就做（watchSafeArea），后面的断言等它。
//
// 窗口边衬的单位是 dp（可以是小数），和内边距一样，按它往里缩不用换算。

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

/** @type {{ insetsAtStart: unknown, first: Promise<Event | null>, count: () => number } | null} */
let watched = null;

// activitycreate 里就调：记下 onCreate 那一刻读到的值，订阅变化
/** @param {Activity} activity */
export function watchSafeArea(activity) {
  const insetsAtStart = activity.windowInsets;
  let count = 0;
  /** @type {(e: Event | null) => void} */
  let resolveFirst = () => {};
  const first = new Promise((resolve) => { resolveFirst = resolve; });
  activity.addEventListener('windowinsetschange', (e) => {
    count++;
    const bars = activity.windowInsets?.systemBars;
    console.log('  windowinsetschange 第 ' + count + ' 次：systemBars = ' +
                (bars ? [bars.left, bars.top, bars.right, bars.bottom].join(',') : 'null'));
    resolveFirst(e);
  });
  setTimeout(() => resolveFirst(null), 10000);
  watched = { insetsAtStart, first, count: () => count };
}

/** @param {import("../main.js").StepContext} ctx */
export async function stepSafeArea(ctx) {
  const { assert } = ctx;
  console.log('  --- 安全区域 ---');
  const activity = /** @type {Activity} */ (ctx.activity);
  if (watched === null) throw new Error('watchSafeArea() was not called at startup');

  assert('onCreate 时窗口还没挂上，windowInsets 是 null', watched.insetsAtStart, null);

  const e = await watched.first;
  assert('窗口挂上之后来了一次 windowinsetschange', e !== null, true);
  if (e !== null) {
    assert('windowinsetschange 是普通的 Event', e.constructor === Event, true);
    assert('windowinsetschange 不可取消', e.cancelable, false);
    assert('windowinsetschange 的 target 是页面', e.target === activity, true);
  }

  const insets = activity.windowInsets;
  assert('挂上之后 windowInsets 是 WindowInsets', insets instanceof WindowInsets, true);
  if (!(insets instanceof WindowInsets)) return;
  const bars = insets.systemBars;
  assert('systemBars 是 Insets', bars instanceof Insets, true);
  assert('状态栏占了顶上一截', insets.statusBars.top > 0, true);
  assert('systemBars 的顶边是状态栏和导航条里大的那个',
         bars.top, Math.max(insets.statusBars.top, insets.navigationBars.top));
  assert('systemBars 的底边是状态栏和导航条里大的那个',
         bars.bottom, Math.max(insets.statusBars.bottom, insets.navigationBars.bottom));
  assert('键盘没弹出，ime 的底边是 0', insets.ime.bottom, 0);
  // 状态栏一般是 24–50 dp；要是还按像素交，这台手机上是 128
  assert('边衬的单位是 dp：状态栏的高在 10 到 80 之间', insets.statusBars.top > 10 && insets.statusBars.top < 80, true);
  for (const name of ['systemBars', 'statusBars', 'navigationBars', 'displayCutout', 'ime',
                      'systemGestures', 'tappableElement']) {
    const v = /** @type {any} */ (insets)[name];
    assert(name + ' 四边都是不小于 0 的有限数',
           v instanceof Insets && [v.left, v.top, v.right, v.bottom].every((n) => Number.isFinite(n) && n >= 0),
           true);
  }
  console.log('  实测：systemBars = ' + [bars.left, bars.top, bars.right, bars.bottom].join(',') +
              '，displayCutout = ' + [insets.displayCutout.left, insets.displayCutout.top,
                                     insets.displayCutout.right, insets.displayCutout.bottom].join(','));

  // ===== 快照、只读、不能 new =====
  assert('每次读是一份新的快照', activity.windowInsets !== insets, true);
  assert('两份快照的值一样', /** @type {WindowInsets} */ (activity.windowInsets).systemBars.top, bars.top);
  assert('Insets 的字段写了抛 TypeError', thrown(() => { /** @type {any} */ (bars).top = 1; }), 'TypeError');
  assert('WindowInsets 的字段写了抛 TypeError',
         thrown(() => { /** @type {any} */ (insets).systemBars = bars; }), 'TypeError');
  assert('new Insets() 抛 TypeError', thrown(() => new /** @type {any} */ (Insets)()), 'TypeError');
  assert('new WindowInsets() 抛 TypeError', thrown(() => new /** @type {any} */ (WindowInsets)()), 'TypeError');

  // ===== 按安全区域摆，点得到 =====
  // 边衬和内边距都是 dp，直接用
  const screen = new LinearLayout();
  screen.paddingStart = bars.left;
  screen.paddingTop = bars.top;
  screen.paddingEnd = bars.right;
  screen.paddingBottom = bars.bottom;
  const target = new TextView();
  target.text = '安全区里的字';
  screen.addView(target);
  activity.contentView = screen;
  const clicked = new Promise((resolve) => {
    const timer = setTimeout(() => resolve(false), 15000);
    target.addEventListener('click', () => { clearTimeout(timer); resolve(true); });
  });
  console.log('[acceptance] tap 安全区里的字');
  assert('按 systemBars 往里缩之后，顶上的字点得到', await clicked, true);
  console.log('  （转屏、键盘弹出时的变化要人手动验：转一下屏，日志里 windowinsetschange 的次数会加一）');
}
