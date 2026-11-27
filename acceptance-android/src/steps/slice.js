// 第一条竖切：JS 拿到页面、建布局、放两段文字、点文字收得到事件。
// 盯的是页面怎么交给 JS（activitycreate）、视图建出来是自由的（不传页面）、挂上之后
// 自由时加的监听器装到了原生上、界面上的东西没有变量引用也不丢。
//
// 点击由验收脚本完成：这里打一行「[acceptance] tap 视图上的字」，
// android/scripts/run-device.sh 看到后用 uiautomator 找到它、用 adb 点一下。

import { assert } from '../support.js';

/** @param {string} text */
function requestTap(text) {
  console.log('[acceptance] tap ' + text);
}

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

/** @param {number} ms */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** activitycreate 的监听器里设的内容，竖切那一步看它挂上了没有 @type {View | null} */
let firstContent = null;

// activitycreate 的监听器里当场调（还在页面的 onCreate 里）
/** @param {ActivityEvent} e */
export function onActivityCreate(e) {
  const activity = e.activity;
  assert('activitycreate 是 ActivityEvent', e instanceof ActivityEvent && e.constructor === ActivityEvent, true);
  assert('activitycreate 不可取消', e.cancelable, false);
  assert('activitycreate 的 target 是 application', e.target === application, true);
  assert('e.activity 是 Activity', activity instanceof Activity, true);
  assert('派发时页面已经在 application.activities 里',
         application.activities.length === 1 && application.activities[0] === activity, true);
  // 窗口还没挂上（系统还没分发过窗口边衬），所以这里设的内容赶得上第一帧
  assert('activitycreate 时窗口还没挂上（windowInsets 是 null）', activity.windowInsets, null);
  assert('新页面的 contentView 是 null', activity.contentView, null);
  const first = new TextView();
  first.text = '第一帧的字';
  activity.contentView = first;
  firstContent = first;
}

/** @param {import("../main.js").StepContext} ctx */
export async function stepSlice(ctx) {
  const activity = /** @type {Activity} */ (ctx.activity);
  console.log('  --- 竖切：页面、布局、文字、点击 ---');

  // ===== 页面 =====
  assert('activitycreate 里设的内容挂上了', firstContent !== null && firstContent.activity === activity, true);
  assert('activitycreate 里设的内容就是 contentView', activity.contentView === firstContent, true);
  const list = application.activities;
  assert('application.activities 是冻结的', Object.isFrozen(list), true);
  assert('application.activities 没变时读两次是同一个数组', application.activities === list, true);
  assert('application.activities 里只有这一个页面', list.length === 1 && list[0] === activity, true);
  assert('application.activities 不能写',
         thrown(() => { /** @type {any} */ (application).activities = []; }), 'TypeError');
  assert('application 上没有 activity 了', 'activity' in application, false);
  assert('application 是 EventTarget', application instanceof EventTarget, true);
  assert('Activity 是 EventTarget', activity instanceof EventTarget, true);

  // ===== ActivityEvent =====
  const made = new ActivityEvent('x', { activity });
  assert('new ActivityEvent 带页面能建', made.activity === activity, true);
  assert('ActivityEvent 的 activity 只读',
         thrown(() => { /** @type {any} */ (made).activity = null; }), 'TypeError');
  assert('new ActivityEvent 不给页面抛 TypeError',
         thrown(() => new ActivityEvent('x', /** @type {any} */ ({}))), 'TypeError');
  assert('new ActivityEvent 的 activity 不是页面抛 TypeError',
         thrown(() => new ActivityEvent('x', /** @type {any} */ ({ activity: {} }))), 'TypeError');

  // ===== 明确不支持的 =====
  assert('new Activity() 抛 TypeError', thrown(() => new /** @type {any} */ (Activity)()), 'TypeError');
  assert('new ViewGroup() 抛 TypeError', thrown(() => new /** @type {any} */ (ViewGroup)()), 'TypeError');
  // 视图不再传页面，没人用 Context 了
  assert('没有 Context 这个全局名字', 'Context' in globalThis, false);
  // Button 是现成的部件（TextView 加系统主题的样式），不接：任何视图都能点，样式由 App 自己定
  assert('没有 Button 这个全局名字', 'Button' in globalThis, false);
  assert('没有 setContentView 了', 'setContentView' in activity, false);
  // 继承原生类的行为（JS 层的继承）在 inheritance.js 里测，树和内边距在 tree.js 里测

  // ===== 建视图、文字：不传页面，建出来是自由的 =====
  const plain = new View();
  assert('new View() 能建', plain instanceof View, true);
  assert('View 是 EventTarget', plain instanceof EventTarget, true);
  assert('新建的视图是自由的：activity 是 null', plain.activity, null);

  const layout = new LinearLayout();
  assert('LinearLayout 是 ViewGroup', layout instanceof ViewGroup, true);

  const label = new TextView();
  assert('新建的 TextView 文字是空串', label.text, '');
  label.text = '还没点';
  assert('text 写了读回来', label.text, '还没点');
  label.text = /** @type {any} */ (null);
  assert('text 写 null 得到空串', label.text, '');
  label.text = /** @type {any} */ (undefined);
  assert('text 写 undefined 得到空串', label.text, '');
  label.text = /** @type {any} */ (5);
  assert('text 写数字按 String() 转', label.text, '5');
  label.text = '带 emoji 😀 的字';
  assert('text 自由时读回写进去的', label.text, '带 emoji 😀 的字');
  label.text = '还没点';

  const button = new TextView();
  button.text = '点我';

  // ===== 搭树：自由的视图之间就能搭 =====
  layout.orientation = 'vertical';
  // 内容铺满全屏，顶上被状态栏盖着，往下挪一截（单位 dp）
  layout.paddingTop = 160;
  layout.addView(label);
  layout.addView(button);
  assert('搭好的树还是自由的', layout.activity === null && button.activity === null, true);

  // 监听器在自由时加：记在 JS 里，挂上时才装到原生上
  let clicks = 0;
  button.addEventListener('click', (e) => {
    clicks++;
    label.text = '点到了 ' + clicks;
    assert('click 是普通的 Event', e.constructor === Event, true);
    assert('click 不可取消', e.cancelable, false);
    assert('click 的 target 是被点的视图（公开的那个对象）', e.target === button, true);
  });

  activity.contentView = layout;
  assert('挂上之后 contentView 是它', activity.contentView === layout, true);
  assert('挂上之后整棵树的 activity 是这个页面',
         layout.activity === activity && label.activity === activity && button.activity === activity, true);
  assert('换掉的内容拿下来了', firstContent !== null && firstContent.activity === null, true);
  assert('挂上之后文字读回来不变', label.text, '还没点');

  // ===== 第一次点击 =====
  const first = nextClick(button, 15000);
  requestTap('点我');
  assert('自由时加的监听器，挂上之后点一下收得到', await first, true);
  assert('监听器改的文字读得回来', label.text, '点到了 1');

  // ===== 所有权：没有变量引用的视图，包装和监听器都不丢 =====
  // 第三个子视图只挂在树上，JS 这边不留变量；包装上挂一个记号和一个监听器。
  // 监听器在它还自由时加，加进挂着的布局时装到原生上
  (() => {
    const kept = new TextView();
    kept.text = '再点我';
    /** @type {any} */ (kept).marker = '还在';
    kept.addEventListener('click', () => { /** @type {any} */ (kept).clicked = true; });
    layout.addView(kept);
  })();
  // 对照组：没有任何所有者的视图。它被回收了，才说明这一轮 GC 真的跑过
  let control = new WeakRef(new TextView());
  for (let round = 0; round < 6 && control.deref() !== undefined; round++) {
    let junk = [];
    for (let i = 0; i < 200000; i++) junk.push({ i, s: 'x' + i });
    junk = [];
    await sleep(50);
  }
  if (control.deref() !== undefined) {
    console.log('  ! 所有权：对照组没被回收，这一轮 GC 没跑到，下面两条不算数');
  }
  const kept = /** @type {any} */ (layout.children[2]);
  assert('没有变量引用的子视图，包装上的记号还在', kept !== undefined && kept.marker, '还在');
  const second = nextClick(kept, 15000);
  requestTap('再点我');
  assert('它的监听器也还在：点了收得到', await second, true);
  assert('监听器里改的状态读得回来', kept.clicked, true);
}
