// App 层：application 的包信息、openURL()、trimmemory；activity 的生命周期、返回、
// 配置变化、被链接打开。
//
// 系统事件大多要靠外面帮忙才触发得了：按返回键、从屏幕边缘滑、切回前台、带着网址打开、
// 发内存告警、切深色模式。JS 打一行「[acceptance] <命令> <参数>」，run-device.sh 照做。
// 这一步会离开 App 一次（openURL 打开浏览器），所以排在所有要点击的步骤和网络那两步之后。
//
// main.js 是在页面的 onCreate 里执行的。启动时的 start、resume 要在一开始就订阅才接得住，
// 所以订阅放在 watchApp() 里，入口最先调它。

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

/** @type {{ type: string, event: Event }[]} */
const record = [];
/** @type {{ type: string, resolve: (e: Event | null) => void, timer: ReturnType<typeof setTimeout> }[]} */
const waiters = [];

/** @param {string} type @param {Event} event */
function push(type, event) {
  record.push({ type, event });
  for (const w of waiters.slice()) {
    if (w.type !== type) continue;
    waiters.splice(waiters.indexOf(w), 1);
    clearTimeout(w.timer);
    w.resolve(event);
  }
}

// 从现在起这一种事件的下一个；超时给 null。要在触发之前调
/** @param {string} type @param {number} ms @returns {Promise<Event | null>} */
function next(type, ms) {
  return new Promise((resolve) => {
    /** @type {{ type: string, resolve: (e: Event | null) => void, timer: ReturnType<typeof setTimeout> }} */
    const w = {
      type,
      resolve,
      timer: setTimeout(() => {
        waiters.splice(waiters.indexOf(w), 1);
        resolve(null);
      }, ms),
    };
    waiters.push(w);
  });
}

// 从第 index 条起收到的事件名（不含 backprogress：它一次手势来很多个）
/** @param {number} index */
const typesSince = (index) =>
  record.slice(index).map((r) => r.type).filter((t) => t !== 'backprogress');

// 生命周期那四个，从第 index 条起
/** @param {number} index */
const lifecycleSince = (index) =>
  typesSince(index).filter((t) => ['start', 'resume', 'pause', 'stop'].includes(t)).join(',');

/** @type {{ stateAtCreate: unknown, launchURLAtCreate: unknown } | null} */
let watched = null;

// 启动时就调：记下 onCreate 那一刻读到的值，订阅这一组的全部事件
export function watchApp() {
  const activity = application.activity;
  watched = {
    stateAtCreate: activity.lifecycleState,
    launchURLAtCreate: activity.launchURL,
  };
  for (const type of ['start', 'resume', 'pause', 'stop', 'back', 'backstart', 'backprogress',
                      'backcancel', 'configurationchange', 'openurl']) {
    activity.addEventListener(type, (e) => {
      if (type !== 'backprogress') {
        console.log('  activity 收到 ' + type + '，此刻 lifecycleState = ' + activity.lifecycleState);
      }
      push(type, e);
    });
  }
  application.addEventListener('trimmemory', (e) => {
    console.log('  application 收到 trimmemory，level = ' + /** @type {any} */ (e).level);
    push('trimmemory', e);
  });
}

/** @param {import("../main.js").StepContext} ctx */
export async function stepApp(ctx) {
  const { assert } = ctx;
  console.log('  --- App 层 ---');
  const activity = application.activity;
  if (watched === null) throw new Error('watchApp() was not called at startup');

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

  // ===== 启动时的生命周期 =====
  assert('onCreate 那一刻 lifecycleState 是 initialized', watched.stateAtCreate, 'initialized');
  if (!record.some((r) => r.type === 'resume')) await next('resume', 10000);
  assert('启动时依次来了 start、resume', lifecycleSince(0), 'start,resume');
  const startEvent = record.find((r) => r.type === 'start')?.event ?? null;
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

  // ===== 启动的链接 =====
  assert('从桌面那样启动，onCreate 时 launchURL 是 null', watched.launchURLAtCreate, null);
  assert('launchURL 写了抛 TypeError',
         thrown(() => { /** @type {any} */ (activity).launchURL = 'x'; }), 'TypeError');

  // ===== 配置 =====
  const config = activity.configuration;
  assert('configuration 是 Configuration', config instanceof Configuration, true);
  if (!(config instanceof Configuration)) return;
  console.log('  实测：' + JSON.stringify({
    orientation: config.orientation, screenWidthDp: config.screenWidthDp,
    screenHeightDp: config.screenHeightDp, smallestScreenWidthDp: config.smallestScreenWidthDp,
    densityDpi: config.densityDpi, fontScale: config.fontScale,
    isNightModeActive: config.isNightModeActive, locales: config.locales,
    layoutDirection: config.layoutDirection,
  }));
  /** @param {unknown} n */
  const positiveInt = (n) => typeof n === 'number' && Number.isInteger(n) && n > 0;
  assert('竖着拿，orientation 是 portrait', config.orientation, 'portrait');
  assert('screenWidthDp 是正整数', positiveInt(config.screenWidthDp), true);
  assert('screenHeightDp 是正整数', positiveInt(config.screenHeightDp), true);
  assert('竖屏时高比宽大', config.screenHeightDp > config.screenWidthDp, true);
  assert('竖屏时 smallestScreenWidthDp 就是宽', config.smallestScreenWidthDp, config.screenWidthDp);
  assert('densityDpi 是正整数', positiveInt(config.densityDpi), true);
  assert('fontScale 是正数', typeof config.fontScale === 'number' && config.fontScale > 0, true);
  assert('isNightModeActive 是布尔', typeof config.isNightModeActive, 'boolean');
  assert('locales 是非空的数组', Array.isArray(config.locales) && config.locales.length > 0, true);
  assert('locales 里都是字符串', config.locales.every((l) => typeof l === 'string' && l.length > 0), true);
  assert('locales 冻结着', Object.isFrozen(config.locales), true);
  assert('layoutDirection 是 ltr', config.layoutDirection, 'ltr');
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
  assert('BackEvent 不带 init 时的默认值',
         [beDefault.progress, beDefault.touchX, beDefault.touchY, beDefault.swipeEdge].join(','), '0,0,0,none');
  assert('BackEvent 的字段写了抛 TypeError',
         thrown(() => { /** @type {any} */ (be).progress = 1; }), 'TypeError');
  assert('BackEvent 的 progress 不是数抛 TypeError',
         thrown(() => new BackEvent('backprogress', { progress: /** @type {any} */ ('abc') })), 'TypeError');
  const te = new TrimMemoryEvent('trimmemory', { level: 'runningLow' });
  assert('TrimMemoryEvent 继承 Event', te instanceof Event, true);
  assert('TrimMemoryEvent 的 level', te.level, 'runningLow');
  const oe = new OpenURLEvent('openurl', { url: 'nacre-test://a' });
  assert('OpenURLEvent 继承 Event', oe instanceof Event, true);
  assert('OpenURLEvent 的 url', oe.url, 'nacre-test://a');

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
  assert('按返回键没有离开 App', lifecycleSince(index), '');
  // 实测（Pixel 6，Android 17）：按键也走预测性返回那一套，先来一个没有边、progress 是 0 的
  // backstart，再来 back。中间没有 backprogress
  assert('按返回键的顺序是 backstart、back', typesSince(index).join(','), 'backstart,back');
  const keyStart = /** @type {BackEvent | undefined} */ (record.slice(index).find((r) => r.type === 'backstart')?.event);
  assert('按返回键的 backstart 没有边，swipeEdge 是 none', keyStart?.swipeEdge, 'none');
  assert('按返回键的 backstart 的 progress 是 0', keyStart?.progress, 0);
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
    assert('backstart 是 BackEvent', b.constructor === BackEvent, true);
    assert('backstart 不可取消', b.cancelable, false);
    assert('backstart 的 target 是页面', b.target === activity, true);
    assert('从左边缘滑，swipeEdge 是 left', b.swipeEdge, 'left');
    assert('backstart 的 progress 在 0 到 1 之间', b.progress >= 0 && b.progress <= 1, true);
    assert('backstart 的 touchX、touchY 是数',
           typeof b.touchX === 'number' && typeof b.touchY === 'number', true);
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
  console.log('  实测：backprogress ' + progresses.length + ' 个，progress 从 ' +
              (progresses[0]?.progress ?? '-') + ' 到 ' + (progresses[progresses.length - 1]?.progress ?? '-'));
  assert('滑过去松手的顺序是 backstart、back', typesSince(index).join(','), 'backstart,back');

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
         typesSince(index).join(','), 'backstart,backcancel');

  // ===== 运行中被链接打开 =====
  const url = 'nacre-test://hello/path?x=1&y=2';
  pending = next('openurl', 10000);
  console.log('[acceptance] open ' + url);
  e = await pending;
  assert('运行中被链接打开，来了 openurl', e !== null, true);
  if (e !== null) {
    const o = /** @type {OpenURLEvent} */ (e);
    assert('openurl 是 OpenURLEvent', o.constructor === OpenURLEvent, true);
    assert('openurl 的 url 原样', o.url, url);
    assert('openurl 不可取消', o.cancelable, false);
    assert('openurl 的 target 是页面', o.target === activity, true);
  }
  assert('运行中被打开之后 launchURL 还是启动时的', activity.launchURL, null);

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
  let stopped = next('stop', 15000);
  const trimmed = next('trimmemory', 15000);
  const opened = await application.openURL('https://example.com');
  assert('openURL 打开网址兑现为 true', opened, true);
  e = await stopped;
  assert('浏览器盖住 App，来了 stop', e !== null, true);
  assert('离开时依次来了 pause、stop', lifecycleSince(index), 'pause,stop');
  assert('stop 之后 lifecycleState 是 created', activity.lifecycleState, 'created');
  e = await trimmed;
  assert('界面全看不见了，来了 trimmemory', e !== null, true);
  assert('这时的 level 是 uiHidden', /** @type {TrimMemoryEvent | null} */ (e)?.level, 'uiHidden');
  index = record.length;
  let resumed = next('resume', 15000);
  console.log('[acceptance] relaunch');
  e = await resumed;
  assert('切回 App，来了 resume', e !== null, true);
  assert('切回时依次来了 start、resume', lifecycleSince(index), 'start,resume');
  assert('切回之后 lifecycleState 是 resumed', activity.lifecycleState, 'resumed');
  assert('切回来不带网址，不发 openurl', typesSince(index).includes('openurl'), false);

  // 不接返回时按返回键没有放进来：系统只对从桌面启动的任务「退到后台、不结束」，验收的 App
  // 是 adb 启动的，按返回会把页面结束、运行时跟着关，后面什么都报不出来（实测）。
  // 从桌面启动时的行为要人手动验，见 docs/internals/android.md「App 层」
}
