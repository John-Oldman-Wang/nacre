// 页面关了再开：运行时跟着 App 的进程生死，不跟着页面。
//
// 按返回让页面结束（adb 启动的页面按返回会结束，见 docs/internals/android.md「返回键」），
// 运行时照常跑；再用 am start 打开，是同一个进程里的新页面，main.js 不再跑，新页面从
// activitycreate 拿。旧页面上建的视图还是同一批 JS 对象，放进新页面就在那里重建。
//
// 打「[acceptance] key back」「[acceptance] relaunch」「[acceptance] tap 视图上的字」，
// android/scripts/run-device.sh 照做。放在页面那几步的最后：做完之后 ctx.activity 换成新页面。

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

/** @param {number} ms */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 一直记着一个视图被点了几次（监听器加上就不拿掉）
 * @param {EventTarget} target
 */
function clickCounter(target) {
  const c = { count: 0, /** @type {(() => void) | null} */ wake: null };
  target.addEventListener('click', () => {
    c.count++;
    if (c.wake !== null) c.wake();
  });
  return c;
}

/**
 * 等计数到 n，最多等 ms 毫秒。等到了是 true
 * @param {{ count: number, wake: (() => void) | null }} c
 * @param {number} n
 * @param {number} ms
 * @returns {Promise<boolean>}
 */
function untilClicked(c, n, ms) {
  return new Promise((resolve) => {
    if (c.count >= n) { resolve(true); return; }
    const timer = setTimeout(() => { c.wake = null; resolve(false); }, ms);
    c.wake = () => {
      if (c.count < n) return;
      clearTimeout(timer);
      c.wake = null;
      resolve(true);
    };
  });
}

/**
 * 等 application 上的下一个 type 事件，最多等 ms 毫秒；onEvent 在派发的当场跑，返回值交出来。
 * 没等到是 null
 * @template T
 * @param {string} type
 * @param {number} ms
 * @param {(e: ActivityEvent) => T} onEvent
 * @returns {Promise<T | null>}
 */
function nextApplicationEvent(type, ms, onEvent) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      application.removeEventListener(type, listener);
      resolve(null);
    }, ms);
    /** @param {Event} e */
    function listener(e) {
      clearTimeout(timer);
      application.removeEventListener(type, listener);
      resolve(onEvent(/** @type {ActivityEvent} */ (e)));
    }
    application.addEventListener(type, listener);
  });
}

/** @param {import("../main.js").StepContext} ctx */
export async function stepActivityLifecycle(ctx) {
  const { assert } = ctx;
  const old = ctx.activity;
  if (old === undefined) return;

  // ===== 关之前：一棵树挂在页面上 =====
  const tree = new LinearLayout();
  tree.orientation = 'vertical';
  tree.paddingTop = 160;
  const inner = new TextView();
  inner.text = '旧页面上的字';
  tree.addView(inner);
  old.contentView = tree;
  // 挂着时加的监听器，一直留着：放进新页面之后还要收得到
  const innerClicks = clickCounter(inner);

  // 另一个视图先挂上、加监听器，再拿下来：替身留着，属于旧页面
  const leftover = new TextView();
  leftover.text = '留着替身的字';
  tree.addView(leftover);
  const leftoverClicks = clickCounter(leftover);
  tree.removeView(leftover);
  assert('关之前：拿下来的视图是自由的', leftover.activity, null);

  // ===== 按返回：页面结束 =====
  const atDestroy = nextApplicationEvent('activitydestroy', 15000, (e) => ({
    isActivityEvent: e instanceof ActivityEvent,
    cancelable: e.cancelable,
    targetIsApplication: e.target === application,
    sameActivity: e.activity === old,
    stillListed: application.activities.includes(old),
    contentStillThere: old.contentView === tree,
    stillAttached: tree.activity === old && inner.activity === old,
  }));
  console.log('[acceptance] key back');
  const seen = await atDestroy;
  assert('按返回之后 15 秒内收到了 activitydestroy', seen !== null, true);
  if (seen === null) return;
  assert('activitydestroy 的事件是 ActivityEvent', seen.isActivityEvent, true);
  assert('activitydestroy 不可取消', seen.cancelable, false);
  assert('activitydestroy 的 target 是 application', seen.targetIsApplication, true);
  assert('activitydestroy 的 activity 是结束的那个页面', seen.sameActivity, true);
  assert('派发时 application.activities 里还有它', seen.stillListed, true);
  assert('派发时它的 contentView 还是那棵树', seen.contentStillThere, true);
  assert('派发时那棵树还挂在它上面', seen.stillAttached, true);

  // ===== 派发完之后 =====
  assert('派发完之后 application.activities 里没有它了', application.activities.includes(old), false);
  assert('派发完之后 application.activities 是空数组', application.activities.length, 0);
  assert('它原来的内容变成自由的', tree.activity, null);
  assert('内容的子视图也是自由的', inner.activity, null);
  assert('内容还是那棵树（JS 里的树不动）', tree.children.length === 1 && tree.children[0] === inner, true);
  assert('内容的 parent 是 null', tree.parent, null);
  assert('销毁的页面 contentView 读出 null', old.contentView, null);
  assert('销毁的页面写一个视图抛 InvalidStateError',
         thrown(() => { old.contentView = new TextView(); }), 'InvalidStateError');
  assert('抛的是 DOMException', thrownDOMException(() => { old.contentView = new TextView(); }), true);
  const stray = new TextView();
  thrown(() => { old.contentView = stray; });
  assert('写不进去的视图还是自由的', stray.activity === null && stray.parent === null, true);
  assert('销毁的页面写 null 不抛', thrown(() => { old.contentView = null; }), '没抛');
  assert('销毁的页面写 undefined 不抛', thrown(() => { old.contentView = undefined; }), '没抛');
  assert('销毁的页面写不是视图的值照样抛 TypeError',
         thrown(() => { old.contentView = /** @type {any} */ ({}); }), 'TypeError');

  // ===== 没有页面的这段时间：运行时照常跑 =====
  const before = performance.now();
  await sleep(1000);
  assert('没有页面时定时器照常到期', performance.now() - before >= 1000, true);
  assert('这时 application.activities 还是空的', application.activities.length, 0);

  // ===== 再打开：同一个进程里的新页面 =====
  const atCreate = nextApplicationEvent('activitycreate', 15000, (e) => ({
    activity: e.activity,
    onlyItListed: application.activities.length === 1 && application.activities[0] === e.activity,
    contentView: e.activity.contentView,
  }));
  console.log('[acceptance] relaunch');
  const created = await atCreate;
  assert('再打开之后 15 秒内收到了新的 activitycreate', created !== null, true);
  if (created === null) return;
  const fresh = created.activity;
  assert('新页面不是原来那个', fresh !== old, true);
  assert('派发时 application.activities 里只有新页面', created.onlyItListed, true);
  assert('新页面一开始 contentView 是 null', created.contentView, null);
  ctx.activity = fresh;

  // ===== 旧页面上的树放进新页面 =====
  fresh.contentView = tree;
  assert('旧页面上的树挂到了新页面', tree.activity, fresh);
  assert('它的子视图也挂到了新页面', inner.activity, fresh);
  console.log('[acceptance] tap 旧页面上的字');
  assert('在新页面上点得到旧页面上的字（挂在旧页面时加的监听器）', await untilClicked(innerClicks, 1, 15000), true);

  // 拿下来时还留着旧页面替身的那个：丢掉旧替身，在新页面上重建
  tree.addView(leftover);
  assert('留着旧替身的视图挂到了新页面', leftover.activity, fresh);
  console.log('[acceptance] tap 留着替身的字');
  assert('留着旧替身的视图在新页面上重建了，点得到', await untilClicked(leftoverClicks, 1, 15000), true);
}
