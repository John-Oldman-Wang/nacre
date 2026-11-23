// 第一条竖切：JS 拿到页面、建布局、放两段文字、点文字收得到事件。
// 盯的是包装（同一个 Java 对象是同一个 JS 对象）、所有权（界面上的东西没有变量
// 引用也不丢）、事件（系统的点击回调变成 JS 的 click）三件事。
//
// 点击由验收脚本完成：这里打一行「[acceptance] tap 视图上的字」，
// android/scripts/run-device.sh 看到后用 uiautomator 找到它、用 adb 点一下。

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

/** @param {import("../main.js").StepContext} ctx */
export async function stepSlice(ctx) {
  const { assert } = ctx;
  console.log('  --- 竖切：页面、布局、文字、点击 ---');

  // ===== 入口和身份 =====
  const activity = application.activity;
  assert('application.activity 是 Activity', activity instanceof Activity, true);
  assert('Activity 也是 Context', activity instanceof Context, true);
  assert('读两次是同一个包装', application.activity === activity, true);
  assert('application 是 EventTarget', application instanceof EventTarget, true);

  // ===== 明确不支持的 =====
  assert('new Activity() 抛 TypeError', thrown(() => new Activity()), 'TypeError');
  assert('new Context() 抛 TypeError', thrown(() => new Context()), 'TypeError');
  assert('new ViewGroup(activity) 抛 TypeError', thrown(() => new ViewGroup(activity)), 'TypeError');
  assert('new View() 不给 context 抛 TypeError', thrown(() => new View()), 'TypeError');
  assert('new TextView(123) 抛 TypeError', thrown(() => new TextView(/** @type {any} */ (123))), 'TypeError');
  // Button 是现成的部件（TextView 加系统主题的样式），不接：任何视图都能点，样式由 App 自己定
  assert('没有 Button 这个全局名字', 'Button' in globalThis, false);
  // 继承原生类的行为（JS 层的继承）在 inheritance.js 里测

  // ===== 建视图、文字 =====
  const plain = new View(activity);
  assert('new View(context) 能建', plain instanceof View, true);
  assert('View 是 EventTarget', plain instanceof EventTarget, true);

  const layout = new LinearLayout(activity);
  assert('LinearLayout 是 ViewGroup', layout instanceof ViewGroup, true);

  const label = new TextView(activity);
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
  assert('text 过 JNI 不拆坏四字节字符', label.text, '带 emoji 😀 的字');
  label.text = '还没点';

  const button = new TextView(activity);
  button.text = '点我';

  // ===== 内边距 =====
  // 安全区域（窗口边衬）还没交给 JS。Android 15 起内容强制铺满全屏，顶上被状态栏
  // 盖着的地方点不到，所以先用内边距把布局里的东西往下挪
  assert('新建的布局 paddingTop 是 0', layout.paddingTop, 0);
  layout.setPadding(1.9, '2', 3, 4);
  assert('setPadding 之后 paddingLeft（向零取整）', layout.paddingLeft, 1);
  assert('setPadding 之后 paddingTop（字符串按 Number() 转）', layout.paddingTop, 2);
  assert('setPadding 之后 paddingRight', layout.paddingRight, 3);
  assert('setPadding 之后 paddingBottom', layout.paddingBottom, 4);
  assert('setPadding 有一个不是有限数抛 TypeError',
         thrown(() => layout.setPadding(0, NaN, 0, 0)), 'TypeError');
  assert('setPadding 少给参数抛 TypeError',
         thrown(() => /** @type {any} */ (layout).setPadding(0, 0, 0)), 'TypeError');
  assert('抛了之后原来的内边距不变', layout.paddingTop, 2);
  layout.setPadding(0, 400, 0, 0);

  // ===== 子视图和所有权 =====
  assert('空布局 childCount 是 0', layout.childCount, 0);
  layout.addView(label);
  layout.addView(button);
  assert('加了两个 childCount 是 2', layout.childCount, 2);
  assert('getChildAt(0) 是同一个包装', layout.getChildAt(0) === label, true);
  assert('getChildAt(1) 是同一个包装', layout.getChildAt(1) === button, true);
  assert('getChildAt(1.9) 向零取整', layout.getChildAt(1.9) === button, true);
  assert('getChildAt 越界是 null', layout.getChildAt(5), null);
  assert('getChildAt(NaN) 抛 TypeError', thrown(() => layout.getChildAt(NaN)), 'TypeError');
  assert('addView 不是 View 抛 TypeError', thrown(() => layout.addView(/** @type {any} */ ('x'))), 'TypeError');
  assert('同一个子视图加两次：Java 的异常带类名', thrown(() => layout.addView(label)), 'IllegalStateException');
  assert('setContentView 不是 View 抛 TypeError',
         thrown(() => activity.setContentView(/** @type {any} */ ({}))), 'TypeError');

  activity.setContentView(layout);

  // ===== 第一次点击 =====
  let clicks = 0;
  button.addEventListener('click', (e) => {
    clicks++;
    label.text = '点到了 ' + clicks;
    assert('click 是普通的 Event', e.constructor === Event, true);
    assert('click 不可取消', e.cancelable, false);
    assert('click 的 target 是被点的视图', e.target === button, true);
  });
  const first = nextClick(button, 15000);
  requestTap('点我');
  assert('点一下文字，JS 收到 click', await first, true);
  assert('监听器改的文字读得回来', label.text, '点到了 1');

  // ===== 所有权：没有变量引用的视图，包装和监听器都不丢 =====
  // 第三个子视图只挂在布局上，JS 这边不留变量；包装上挂一个记号和一个监听器
  (() => {
    const kept = new TextView(activity);
    kept.text = '再点我';
    /** @type {any} */ (kept).marker = '还在';
    kept.addEventListener('click', () => { /** @type {any} */ (kept).clicked = true; });
    layout.addView(kept);
  })();
  // 对照组：没有任何所有者的包装。它被回收了，才说明这一轮 GC 真的跑过
  let control = new WeakRef(new TextView(activity));
  for (let round = 0; round < 6 && control.deref() !== undefined; round++) {
    let junk = [];
    for (let i = 0; i < 200000; i++) junk.push({ i, s: 'x' + i });
    junk = [];
    await sleep(50);
  }
  if (control.deref() !== undefined) {
    console.log('  ! 所有权：对照组没被回收，这一轮 GC 没跑到，下面两条不算数');
  }
  const kept = /** @type {any} */ (layout.getChildAt(2));
  assert('没有变量引用的子视图，包装上的记号还在', kept !== null && kept.marker, '还在');
  const second = nextClick(kept, 15000);
  requestTap('再点我');
  assert('它的监听器也还在：点了收得到', await second, true);
  assert('监听器里改的状态读得回来', kept.clicked, true);
}
