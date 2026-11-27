// App 层：application 的包信息、openURL()、trimmemory、openurl；页面（activity）的生命周期、
// 返回、配置变化。
//
// 系统事件大多要靠外面帮忙才触发得了：按返回键、从屏幕边缘滑、切回前台、带着网址打开、
// 发内存告警、切深色模式。JS 打一行「[acceptance] <命令> <参数>」，run-device.sh 照做。
// 这一步会离开 App（openURL 打开浏览器），最后还把页面关掉、再带着网址打开一个新页面，
// 所以排在所有步骤之后。
//
// 页面建好时运行时当场派发 activitycreate，页面的 start、resume 要在这一刻订阅才接得住。
// main.js 在第一个 activitycreate 的监听器里调 watchApp(页面)；之后再建的页面（基础那几步的
// 最后一步关掉再开的、这一步最后带着网址打开的）由 watchApp 自己在 activitycreate 里订。

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

// ---- 收到的事件按先后记下来，等某一种的下一个 ----

/**
 * page：页面上的事件是那个页面，application 上的是 null。
 * pages：派发那一刻 application.activities 有几个
 * @typedef {{ type: string, event: Event, page: Activity | null, pages: number }} Entry
 */

/** @type {Entry[]} */
const record = [];
/** @type {{ type: string, test: (e: Entry) => boolean, resolve: (e: Event | null) => void, timer: ReturnType<typeof setTimeout> }[]} */
const waiters = [];

/** @param {string} type @param {Event} event @param {Activity | null} page */
function push(type, event, page) {
  const entry = { type, event, page, pages: application.activities.length };
  record.push(entry);
  for (const w of waiters.slice()) {
    if (w.type !== type || !w.test(entry)) continue;
    waiters.splice(waiters.indexOf(w), 1);
    clearTimeout(w.timer);
    w.resolve(event);
  }
}

// 从现在起这一种事件（满足 test 的）的下一个；超时给 null。要在触发之前调
/**
 * @param {string} type @param {number} ms
 * @param {(e: Entry) => boolean} [test]
 * @returns {Promise<Event | null>}
 */
function next(type, ms, test) {
  return new Promise((resolve) => {
    /** @type {{ type: string, test: (e: Entry) => boolean, resolve: (e: Event | null) => void, timer: ReturnType<typeof setTimeout> }} */
    const w = {
      type,
      test: test ?? (() => true),
      resolve,
      timer: setTimeout(() => {
        waiters.splice(waiters.indexOf(w), 1);
        resolve(null);
      }, ms),
    };
    waiters.push(w);
  });
}

// 某个页面从第 index 条起收到的事件名（不含 backprogress：它一次手势来很多个）
/** @param {number} index @param {Activity} page */
const typesSince = (index, page) =>
  record.slice(index).filter((r) => r.page === page).map((r) => r.type).filter((t) => t !== 'backprogress');

// 生命周期那四个，某个页面从第 index 条起
/** @param {number} index @param {Activity} page */
const lifecycleSince = (index, page) =>
  typesSince(index, page).filter((t) => ['start', 'resume', 'pause', 'stop'].includes(t)).join(',');

// application 上等下一个 type 事件，当场记下 onEvent 的返回值
/**
 * @template T
 * @param {string} type @param {number} ms @param {(e: Event) => T} onEvent
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
      resolve(onEvent(e));
    }
    application.addEventListener(type, listener);
  });
}

// ---- 每个页面建好那一刻 ----

const pageEvents = ['start', 'resume', 'pause', 'stop', 'back', 'backstart', 'backprogress', 'backcancel',
                    'configurationchange'];

/** @type {{ activity: Activity, stateAtCreate: string }[]} */
const created = [];

/** @param {Activity} activity */
function watchActivity(activity) {
  if (created.some((c) => c.activity === activity)) return;
  created.push({ activity, stateAtCreate: activity.lifecycleState });
  for (const type of pageEvents) {
    activity.addEventListener(type, (e) => {
      if (type !== 'backprogress') {
        console.log('  页面 ' + created.findIndex((c) => c.activity === activity) + ' 收到 ' + type +
                    '，此刻 lifecycleState = ' + activity.lifecycleState);
      }
      push(type, e, activity);
    });
  }
}

/** @param {Event} e */
function recordOpenURL(e) {
  console.log('  application 收到 openurl，url = ' + /** @type {any} */ (e).url);
  push('openurl', e, null);
}

// 在第一个 activitycreate 的监听器里调：记下这一刻读到的值，订阅这一组的全部事件
/** @param {Activity} activity */
export function watchApp(activity) {
  watchActivity(activity);
  application.addEventListener('activitycreate', (e) => watchActivity(/** @type {ActivityEvent} */ (e).activity));
  application.addEventListener('trimmemory', (e) => {
    console.log('  application 收到 trimmemory，level = ' + /** @type {any} */ (e).level +
                '，此刻有 ' + application.activities.length + ' 个页面');
    push('trimmemory', e, null);
  });
  application.addEventListener('openurl', recordOpenURL);
}

/** @param {import("../main.js").StepContext} ctx */
export async function stepApp(ctx) {
  const { assert } = ctx;
  console.log('  --- App 层 ---');
  if (created.length === 0) throw new Error('watchApp() was not called in the first activitycreate');
  const activity = ctx.activity;
  if (activity === undefined) throw new Error('no activity');

  // ===== 包信息 =====
  assert('packageName 是壳的包名', application.packageName, 'com.test.test');
  assert('versionName 是壳的版本名', application.versionName, '0.0.0');
  assert('versionCode 是壳的版本号', application.versionCode, 1);
  assert('packageName 写了抛 TypeError',
         thrown(() => { /** @type {any} */ (application).packageName = 'x'; }), 'TypeError');
  assert('versionName 写了抛 TypeError',
         thrown(() => { /** @type {any} */ (application).versionName = 'x'; }), 'TypeError');
  assert('versionCode 写了抛 TypeError',
         thrown(() => { /** @type {any} */ (application).versionCode = 2; }), 'TypeError');
  assert('没有 canOpenURL（明确不做）', typeof (/** @type {any} */ (application).canOpenURL), 'undefined');

  // ===== 页面的生命周期：每个页面在 activitycreate 里订 =====
  const first = created[0];
  assert('第一个页面：activitycreate 那一刻 lifecycleState 是 created', first.stateAtCreate, 'created');
  // 基础那几步的最后一步按返回把它关了
  assert('第一个页面：启动、被关掉，依次来了 start、resume、pause、stop', lifecycleSince(0, first.activity),
         'start,resume,pause,stop');
  assert('第一个页面关掉之后 lifecycleState 是 destroyed', first.activity.lifecycleState, 'destroyed');
  assert('基础最后一步再打开的页面也在 activitycreate 里订上了', created.length >= 2, true);
  const second = created[created.length - 1];
  assert('它就是现在的页面', second.activity === activity, true);
  assert('第二个页面：activitycreate 那一刻 lifecycleState 是 created', second.stateAtCreate, 'created');
  assert('第二个页面：activitycreate 里订的 start、resume 都来了', lifecycleSince(0, activity), 'start,resume');
  const startEvent = record.find((r) => r.type === 'start' && r.page === activity)?.event ?? null;
  assert('start 是普通的 Event', startEvent?.constructor === Event, true);
  assert('start 不可取消', startEvent?.cancelable, false);
  assert('start 的 target 是页面', startEvent?.target === activity, true);
  assert('resume 之后 lifecycleState 是 resumed', activity.lifecycleState, 'resumed');
  assert('lifecycleState 写了抛 TypeError',
         thrown(() => { /** @type {any} */ (activity).lifecycleState = 'created'; }), 'TypeError');
  assert('订阅 destroy 不抛，当自定义事件（明确不做）',
         thrown(() => activity.addEventListener('destroy', () => {})), '没抛');
  assert('订阅 create 不抛，当自定义事件（明确不做）',
         thrown(() => activity.addEventListener('create', () => {})), '没抛');
  assert('页面上没有 launchURL 了（冷启动带的地址也走 openurl）', 'launchURL' in activity, false);

  // ===== 配置 =====
  const config = activity.configuration;
  assert('configuration 是 Configuration', config instanceof Configuration, true);
  if (!(config instanceof Configuration)) return;
  console.log('  实测：' + JSON.stringify({
    orientation: config.orientation, screenWidth: config.screenWidth,
    screenHeight: config.screenHeight, smallestScreenWidth: config.smallestScreenWidth,
    density: config.density, fontScale: config.fontScale,
    isNightModeActive: config.isNightModeActive, locales: config.locales,
    layoutDirection: config.layoutDirection,
  }));
  /** @param {unknown} n */
  const positiveInt = (n) => typeof n === 'number' && Number.isInteger(n) && n > 0;
  assert('竖着拿，orientation 是 portrait', config.orientation, 'portrait');
  assert('screenWidth 是正整数（dp）', positiveInt(config.screenWidth), true);
  assert('screenHeight 是正整数（dp）', positiveInt(config.screenHeight), true);
  assert('竖屏时高比宽大', config.screenHeight > config.screenWidth, true);
  assert('竖屏时 smallestScreenWidth 就是宽', config.smallestScreenWidth, config.screenWidth);
  assert('density 是正数（1 dp 是几个像素）', typeof config.density === 'number' && config.density > 0, true);
  assert('density 乘 160 是整数（每英寸的点数）', Number.isInteger(config.density * 160), true);
  assert('fontScale 是正数', typeof config.fontScale === 'number' && config.fontScale > 0, true);
  assert('isNightModeActive 是布尔', typeof config.isNightModeActive, 'boolean');
  assert('locales 是非空的数组', Array.isArray(config.locales) && config.locales.length > 0, true);
  assert('locales 里都是字符串', config.locales.every((l) => typeof l === 'string' && l.length > 0), true);
  assert('locales 冻结着', Object.isFrozen(config.locales), true);
  assert('layoutDirection 是 ltr', config.layoutDirection, 'ltr');
  assert('没有带 Dp 后缀的旧名字', ['screenWidthDp', 'screenHeightDp', 'smallestScreenWidthDp', 'densityDpi']
    .some((n) => n in config), false);
  assert('每次读是一份新的快照', activity.configuration !== config, true);
  assert('Configuration 的字段写了抛 TypeError',
         thrown(() => { /** @type {any} */ (config).fontScale = 2; }), 'TypeError');
  assert('configuration 写了抛 TypeError',
         thrown(() => { /** @type {any} */ (activity).configuration = config; }), 'TypeError');
  assert('new Configuration() 抛 TypeError', thrown(() => new /** @type {any} */ (Configuration)()), 'TypeError');

  // ===== handlesBack：照 Web IDL 转成布尔 =====
  assert('handlesBack 默认是 false', activity.handlesBack, false);
  activity.handlesBack = /** @type {any} */ ('false');
  assert("handlesBack = 'false' 得到 true", activity.handlesBack, true);
  activity.handlesBack = /** @type {any} */ (0);
  assert('handlesBack = 0 得到 false', activity.handlesBack, false);
  activity.handlesBack = /** @type {any} */ (1);
  assert('handlesBack = 1 得到 true', activity.handlesBack, true);
  activity.handlesBack = /** @type {any} */ (null);
  assert('handlesBack = null 得到 false', activity.handlesBack, false);

  // ===== 事件类 =====
  const be = new BackEvent('backprogress', { progress: 0.5, touchX: 10, touchY: '20', swipeEdge: 'right' });
  assert('BackEvent 继承 Event', be instanceof Event, true);
  assert('BackEvent 的 progress', be.progress, 0.5);
  assert('BackEvent 的 touchX', be.touchX, 10);
  assert('BackEvent 的 touchY 照 Web IDL 转成数', be.touchY, 20);
  assert('BackEvent 的 swipeEdge', be.swipeEdge, 'right');
  const beDefault = new BackEvent('backstart');
  assert('BackEvent 不带 init 时：progress 0，touchX、touchY 是 null，swipeEdge 是 none',
         JSON.stringify([beDefault.progress, beDefault.touchX, beDefault.touchY, beDefault.swipeEdge]),
         '[0,null,null,"none"]');
  assert('BackEvent 的 touchX 可以给 null',
         new BackEvent('backstart', { touchX: null, touchY: null }).touchX, null);
  assert('BackEvent 的字段写了抛 TypeError',
         thrown(() => { /** @type {any} */ (be).progress = 1; }), 'TypeError');
  assert('BackEvent 的 progress 不是数抛 TypeError',
         thrown(() => new BackEvent('backprogress', { progress: /** @type {any} */ ('abc') })), 'TypeError');
  assert('BackEvent 的 touchX 不是数抛 TypeError',
         thrown(() => new BackEvent('backprogress', { touchX: /** @type {any} */ ('abc') })), 'TypeError');
  const te = new TrimMemoryEvent('trimmemory', { level: 'runningLow' });
  assert('TrimMemoryEvent 继承 Event', te instanceof Event, true);
  assert('TrimMemoryEvent 的 level', te.level, 'runningLow');
  const oe = new OpenURLEvent('openurl', { url: 'nacre-test://a', activity });
  assert('OpenURLEvent 继承 Event', oe instanceof Event, true);
  assert('OpenURLEvent 的 url', oe.url, 'nacre-test://a');
  assert('OpenURLEvent 的 activity', oe.activity === activity, true);
  assert('OpenURLEvent 不带 activity 抛 TypeError',
         thrown(() => new OpenURLEvent('openurl', /** @type {any} */ ({ url: 'nacre-test://a' }))), 'TypeError');
  assert('OpenURLEvent 的 activity 不是页面抛 TypeError',
         thrown(() => new OpenURLEvent('openurl', /** @type {any} */ ({ url: 'x', activity: {} }))), 'TypeError');

  // ===== openURL：出错的情况 =====
  assert('openURL() 不带参数抛 TypeError', thrown(() => /** @type {any} */ (application).openURL()), 'TypeError');
  const nobody = application.openURL('nacre-nonexistent-scheme://test');
  assert('openURL 返回 Promise', nobody instanceof Promise, true);
  assert('没有 App 能处理的协议兑现为 false', await nobody, false);
  assert('空串兑现为 false', await application.openURL(''), false);

  // ===== 返回：接着返回时按返回键 =====
  activity.handlesBack = true;
  let index = record.length;
  let pending = next('back', 10000);
  console.log('[acceptance] key back');
  let e = await pending;
  assert('接着返回时按返回键，来了 back', e !== null, true);
  assert('back 是普通的 Event', e?.constructor === Event, true);
  assert('back 不可取消', e?.cancelable, false);
  assert('back 的 target 是页面', e?.target === activity, true);
  assert('按返回键没有离开 App', lifecycleSince(index, activity), '');
  // 实测（Pixel 6，Android 17）：按键也走预测性返回那一套，先来一个没有边、progress 是 0 的
  // backstart，再来 back。中间没有 backprogress
  assert('按返回键的顺序是 backstart、back', typesSince(index, activity).join(','), 'backstart,back');
  const keyStart = /** @type {BackEvent | undefined} */ (
    record.slice(index).find((r) => r.type === 'backstart')?.event);
  assert('按返回键的 backstart 没有边，swipeEdge 是 none', keyStart?.swipeEdge, 'none');
  assert('按返回键的 backstart 的 progress 是 0', keyStart?.progress, 0);
  assert('按返回键的 backstart 没有手指，touchX、touchY 是 null',
         JSON.stringify([keyStart?.touchX, keyStart?.touchY]), '[null,null]');
  assert('按返回键没有 backprogress',
         record.slice(index).some((r) => r.type === 'backprogress'), false);

  // ===== 返回：从左边缘滑过去，松手 =====
  index = record.length;
  const started = next('backstart', 15000);
  pending = next('back', 15000);
  console.log('[acceptance] backswipe commit');
  e = await started;
  assert('从边缘滑，来了 backstart', e !== null, true);
  if (e !== null) {
    const b = /** @type {BackEvent} */ (e);
    console.log('  实测：backstart 的 touchX = ' + b.touchX + '，touchY = ' + b.touchY + '（dp），屏幕 ' +
                config.screenWidth + '×' + config.screenHeight + ' dp');
    assert('backstart 是 BackEvent', b.constructor === BackEvent, true);
    assert('backstart 不可取消', b.cancelable, false);
    assert('backstart 的 target 是页面', b.target === activity, true);
    assert('从左边缘滑，swipeEdge 是 left', b.swipeEdge, 'left');
    assert('backstart 的 progress 在 0 到 1 之间', b.progress >= 0 && b.progress <= 1, true);
    assert('backstart 的 touchX 是 dp：在屏幕的宽度里',
           typeof b.touchX === 'number' && b.touchX >= 0 && b.touchX <= config.screenWidth, true);
    // 手指在屏幕高度的一半（像素）。按像素给的话比屏幕的 dp 高度还大
    assert('backstart 的 touchY 是 dp：在屏幕高度的 30% 到 70% 之间',
           typeof b.touchY === 'number' && b.touchY > config.screenHeight * 0.3 &&
           b.touchY < config.screenHeight * 0.7, true);
  }
  e = await pending;
  assert('滑过去松手，来了 back', e !== null, true);
  const progresses = record.slice(index).filter((r) => r.type === 'backprogress')
    .map((r) => /** @type {BackEvent} */ (r.event));
  assert('滑动中来了 backprogress', progresses.length > 0, true);
  assert('backprogress 都是 BackEvent',
         progresses.every((p) => p.constructor === BackEvent && p.cancelable === false), true);
  assert('backprogress 的 progress 都在 0 到 1 之间',
         progresses.every((p) => p.progress >= 0 && p.progress <= 1), true);
  assert('backprogress 的 touchX、touchY 都是 dp（在屏幕里）',
         progresses.every((p) => typeof p.touchX === 'number' && typeof p.touchY === 'number' &&
                                 p.touchX <= config.screenWidth && p.touchY <= config.screenHeight), true);
  const last = progresses[progresses.length - 1];
  console.log('  实测：backprogress ' + progresses.length + ' 个，progress 从 ' +
              (progresses[0]?.progress ?? '-') + ' 到 ' + (last?.progress ?? '-') +
              '，最后一个的 touchX = ' + (last?.touchX ?? '-'));
  assert('滑过去松手的顺序是 backstart、back', typesSince(index, activity).join(','), 'backstart,back');

  // ===== 返回：滑出去又滑回来，松手 =====
  index = record.length;
  pending = next('backcancel', 15000);
  console.log('[acceptance] backswipe cancel');
  e = await pending;
  assert('滑回边缘松手，来了 backcancel', e !== null, true);
  assert('backcancel 是普通的 Event', e?.constructor === Event, true);
  assert('backcancel 不可取消', e?.cancelable, false);
  await sleep(500);
  assert('滑回边缘松手的顺序是 backstart、backcancel，没有 back',
         typesSince(index, activity).join(','), 'backstart,backcancel');

  // ===== 运行中被链接打开：application 上的 openurl，带着是哪个页面 =====
  let openURLOnActivity = 0;
  activity.addEventListener('openurl', () => { openURLOnActivity++; });
  const url = 'nacre-test://hello/path?x=1&y=2';
  index = record.length;
  pending = next('openurl', 10000);
  console.log('[acceptance] open ' + url);
  e = await pending;
  assert('运行中被链接打开，来了 openurl', e !== null, true);
  if (e !== null) {
    const o = /** @type {OpenURLEvent} */ (e);
    assert('openurl 是 OpenURLEvent', o.constructor === OpenURLEvent, true);
    assert('openurl 的 url 原样', o.url, url);
    assert('openurl 不可取消', o.cancelable, false);
    assert('openurl 的 target 是 application', o.target === application, true);
    assert('openurl 的 activity 是收到链接的页面', o.activity === activity, true);
  }
  await sleep(500);
  assert('openurl 只来了一个', record.slice(index).filter((r) => r.type === 'openurl').length, 1);
  assert('页面上订的 openurl 收不到（当自定义事件）', openURLOnActivity, 0);

  // ===== 配置变化：切深色模式再切回来 =====
  const nightBefore = config.isNightModeActive;
  pending = next('configurationchange', 10000);
  console.log('[acceptance] night ' + (nightBefore ? 'no' : 'yes'));
  e = await pending;
  assert('切深色模式，来了 configurationchange', e !== null, true);
  assert('configurationchange 是普通的 Event', e?.constructor === Event, true);
  assert('configurationchange 不可取消', e?.cancelable, false);
  assert('configurationchange 的 target 是页面', e?.target === activity, true);
  assert('isNightModeActive 跟着变了', activity.configuration.isNightModeActive, !nightBefore);
  await sleep(1000);
  pending = next('configurationchange', 10000);
  console.log('[acceptance] night ' + (nightBefore ? 'yes' : 'no'));
  e = await pending;
  assert('切回来又来了 configurationchange', e !== null, true);
  assert('isNightModeActive 回到原来的值', activity.configuration.isNightModeActive, nightBefore);
  assert('切深色模式没有重建页面，lifecycleState 还是 resumed', activity.lifecycleState, 'resumed');

  // ===== 内存告警 =====
  pending = next('trimmemory', 10000);
  console.log('[acceptance] trim-memory RUNNING_LOW');
  e = await pending;
  assert('发 RUNNING_LOW，application 上来了 trimmemory', e !== null, true);
  if (e !== null) {
    const t = /** @type {TrimMemoryEvent} */ (e);
    assert('trimmemory 是 TrimMemoryEvent', t.constructor === TrimMemoryEvent, true);
    assert('trimmemory 的 level', t.level, 'runningLow');
    assert('trimmemory 不可取消', t.cancelable, false);
    assert('trimmemory 的 target 是 application', t.target === application, true);
  }

  // ===== openURL 打开浏览器：离开 App，再切回来 =====
  activity.handlesBack = false;
  index = record.length;
  const stopped = next('stop', 15000);
  const trimmed = next('trimmemory', 15000);
  const opened = await application.openURL('https://example.com');
  assert('openURL 打开网址兑现为 true', opened, true);
  e = await stopped;
  assert('浏览器盖住 App，来了 stop', e !== null, true);
  assert('离开时依次来了 pause、stop', lifecycleSince(index, activity), 'pause,stop');
  assert('stop 之后 lifecycleState 是 created', activity.lifecycleState, 'created');
  e = await trimmed;
  assert('界面全看不见了，来了 trimmemory', e !== null, true);
  assert('这时的 level 是 uiHidden', /** @type {TrimMemoryEvent | null} */ (e)?.level, 'uiHidden');
  index = record.length;
  const resumed = next('resume', 15000);
  console.log('[acceptance] relaunch');
  e = await resumed;
  assert('切回 App，来了 resume', e !== null, true);
  assert('切回时依次来了 start、resume', lifecycleSince(index, activity), 'start,resume');
  assert('切回之后 lifecycleState 是 resumed', activity.lifecycleState, 'resumed');
  assert('切回来不带网址，不发 openurl', record.slice(index).some((r) => r.type === 'openurl'), false);

  // ===== 页面都关了：内存告警照样来，包信息照样读得到 =====
  // 下面要验「activitycreate 的监听器里才订的 openurl 收得到」，先让 application 上没有 openurl 的监听器
  application.removeEventListener('openurl', recordOpenURL);
  const destroyed = nextApplicationEvent('activitydestroy', 15000, (ev) => ev);
  console.log('[acceptance] key back');
  assert('不接返回时按返回键，页面结束了（来了 activitydestroy）', (await destroyed) !== null, true);
  assert('结束的页面 lifecycleState 是 destroyed', activity.lifecycleState, 'destroyed');
  assert('这时一个页面都没有', application.activities.length, 0);
  pending = next('trimmemory', 15000, (r) => /** @type {TrimMemoryEvent} */ (r.event).level === 'complete');
  console.log('[acceptance] trim-memory COMPLETE');
  e = await pending;
  assert('没有页面时发 COMPLETE，application 上照样来了 trimmemory', e !== null, true);
  const trimEntry = record.find((r) => r.event === e);
  assert('派发那一刻一个页面都没有', trimEntry?.pages, 0);
  assert('没有页面时 packageName 照样读得到', application.packageName, 'com.test.test');
  assert('没有页面时 openURL 不带参数照样抛 TypeError',
         thrown(() => /** @type {any} */ (application).openURL()), 'TypeError');

  // ===== 带着网址打开：新页面建好之后来 openurl，activitycreate 的监听器里订的收得到 =====
  const coldURL = 'nacre-test://cold/start?from=link';
  /** @type {Promise<{ page: Activity, event: OpenURLEvent, count: () => number, beforeOpen: string } | null>} */
  const cold = new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), 15000);
    application.addEventListener('activitycreate', (ce) => {
      const page = /** @type {ActivityEvent} */ (ce).activity;
      const at = record.length;
      let count = 0;
      application.addEventListener('openurl', (oev) => {
        count++;
        if (count !== 1) return;
        clearTimeout(timer);
        resolve({
          page,
          event: /** @type {OpenURLEvent} */ (oev),
          count: () => count,
          // 这个页面在 openurl 之前收到了哪些事件
          beforeOpen: typesSince(at, page).join(','),
        });
      });
    }, { once: true });
  });
  console.log('[acceptance] open ' + coldURL);
  const c = await cold;
  assert('带着网址打开，新页面建好之后来了 openurl（activitycreate 里订的收得到）', c !== null, true);
  if (c === null) return;
  console.log('  实测：openurl 之前新页面收到了「' + c.beforeOpen + '」');
  assert('新页面的 openurl 是 OpenURLEvent', c.event.constructor === OpenURLEvent, true);
  assert('新页面的 openurl 的 url 原样', c.event.url, coldURL);
  assert('新页面的 openurl 的 activity 是新页面', c.event.activity === c.page, true);
  assert('新页面的 openurl 的 target 是 application', c.event.target === application, true);
  assert('新页面的 openurl 不可取消', c.event.cancelable, false);
  ctx.activity = c.page;
  await sleep(1000);
  assert('新页面的 openurl 只来了一个', c.count(), 1);
  assert('新页面照样来了 start、resume', lifecycleSince(0, c.page), 'start,resume');
}
