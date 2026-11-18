import { customEventWorks } from '../support.js';
// 别的 App 或者一条链接打开我们：application 的 openurl 事件。
//
// 自动跑的部分验事件类的形状、监听器的注册和摘掉；再试一次「自己打开自己的
// 协议」，系统把它送回来就验一遍真实的事件，等不到就报未验证。
//
// 从外面打开要人（或者合并方的命令）来做：
//   xcrun simctl openurl <设备> 'nacre-acceptance://hello?from=simctl'
// App 没启动时打开一次（冷启动）、运行中再打开一次。每收到一个 openurl，下面
// 顶层的监听器都打一行 [openurl]，看那一行就行。

// 每个场景的 sceneconnect 到了没有。冷启动带着的链接要排在它后面
/** @type {UIWindowScene[]} */
const connected = [];
application.addEventListener('sceneconnect', (e) => { connected.push(e.scene); });

// 监听器在脚本顶层就注册：冷启动带着的链接在第一个场景接入之后马上就来，
// 那时这一步还没跑到
/** @type {OpenURLEvent[]} */
const received = [];
application.addEventListener('openurl', (e) => {
  received.push(e);
  // 这几行不是断言（从外面打开不是每一遍都有），只把事实打出来
  const scene = e.scene;
  const where = scene instanceof UIWindowScene
    ? 'UIWindowScene ' + scene.session.persistentIdentifier
    : String(scene);
  console.log('  [openurl] #' + received.length +
              ' url=' + JSON.stringify(e.url) +
              ' sourceApplication=' + JSON.stringify(e.sourceApplication) +
              ' scene=' + where +
              ' 这个场景的 sceneconnect 已经到了=' + connected.includes(scene) +
              ' 是 application.scenes 里的那个=' + application.scenes.includes(scene) +
              ' cancelable=' + e.cancelable +
              ' 是 OpenURLEvent=' + (e instanceof OpenURLEvent));
});

const SELF_TEST_URL = 'nacre-acceptance://self-test?x=1';

/** @param {import("../main.js").StepContext} ctx */
export function stepOpenURL(ctx) {
  const { assert } = ctx;
  ctx.section('被链接打开：openurl（没有界面，看日志里的 [openurl]）', 8);
  console.log('  --- openurl：事件类的形状 ---');

  // ===================================================================
  // 1. 事件类
  assert('OpenURLEvent 是全局的类', typeof OpenURLEvent, 'function');
  {
    const e = new OpenURLEvent('openurl', {
      url: 'myapp://orders/42?ref=mail',
      scene: ctx.scene,
      sourceApplication: 'com.example.mail',
    });
    assert('自己构造的：type', e.type, 'openurl');
    assert('自己构造的：url 原样', e.url, 'myapp://orders/42?ref=mail');
    assert('自己构造的：scene 是给进去的那个', e.scene === ctx.scene, true);
    assert('自己构造的：sourceApplication', e.sourceApplication, 'com.example.mail');
    assert('它是 Event', e instanceof Event, true);
    assert('不指定时不可取消', e.cancelable, false);
    let threw = '';
    // @ts-expect-error url 是只读的
    try { e.url = 'myapp://other'; } catch (err) { threw = /** @type {Error} */ (err).constructor.name; }
    assert('写 url：抛 TypeError', threw, 'TypeError');
    assert('写不进去', e.url, 'myapp://orders/42?ref=mail');
  }
  {
    // url 和 scene 必填
    /** @param {() => unknown} fn */
    const thrown = (fn) => {
      try { fn(); return '没抛'; } catch (err) { return /** @type {Error} */ (err).constructor.name; }
    };
    // @ts-expect-error 第二个参数必填
    assert('什么都不给：抛 TypeError', thrown(() => new OpenURLEvent('openurl')), 'TypeError');
    // @ts-expect-error 缺 scene
    assert('不给 scene：抛 TypeError', thrown(() => new OpenURLEvent('openurl', { url: 'myapp://a' })), 'TypeError');
    // @ts-expect-error 缺 url
    assert('不给 url：抛 TypeError', thrown(() => new OpenURLEvent('openurl', { scene: ctx.scene })), 'TypeError');
    assert('scene 不是场景：抛 TypeError',
           thrown(() => new OpenURLEvent('openurl', /** @type {any} */ ({ url: 'myapp://a', scene: {} }))),
           'TypeError');
  }
  {
    // 字段照 Web IDL 转：url 转成字符串，sourceApplication 是可空的字符串
    const e = new OpenURLEvent('openurl', /** @type {any} */ ({ url: 42, scene: ctx.scene }));
    assert('url 给了数：转成字符串', e.url, '42');
    assert('不给 sourceApplication：是 null', e.sourceApplication, null);
    const cancelable = new OpenURLEvent('openurl', { url: 'myapp://a', scene: ctx.scene, cancelable: true });
    assert('自己构造时可以指定 cancelable', cancelable.cancelable, true);
  }

  // ===================================================================
  // 2. 监听器的注册和摘掉（用自己派发的事件验，走的是同一个 dispatchEvent）
  console.log('  --- openurl：监听器 ---');
  {
    /** @type {string[]} */
    const seen = [];
    const listener = (/** @type {Event} */ e) => { seen.push(/** @type {OpenURLEvent} */ (e).url); };
    application.addEventListener('openurl', listener);
    application.addEventListener('openurl', listener);   // 重复注册不算
    const first = new OpenURLEvent('openurl', { url: 'myapp://synthetic/1', scene: ctx.scene });
    const returned = application.dispatchEvent(first);
    assert('注册之后收得到', seen.join(','), 'myapp://synthetic/1');
    assert('事件的 target 是 application', first.target === application, true);
    assert('dispatchEvent 返回 true', returned, true);
    application.removeEventListener('openurl', listener);
    application.dispatchEvent(new OpenURLEvent('openurl', { url: 'myapp://synthetic/2', scene: ctx.scene }));
    assert('摘掉之后收不到', seen.join(','), 'myapp://synthetic/1');

    let once = 0;
    application.addEventListener('openurl', () => { once++; }, { once: true });
    application.dispatchEvent(new OpenURLEvent('openurl', { url: 'myapp://synthetic/3', scene: ctx.scene }));
    application.dispatchEvent(new OpenURLEvent('openurl', { url: 'myapp://synthetic/4', scene: ctx.scene }));
    assert('once 的监听器只收一次', once, 1);

    // 不可取消：preventDefault() 不起作用
    const quiet = new OpenURLEvent('openurl', { url: 'myapp://synthetic/5', scene: ctx.scene });
    const prevent = (/** @type {Event} */ e) => { e.preventDefault(); };
    application.addEventListener('openurl', prevent);
    const result = application.dispatchEvent(quiet);
    application.removeEventListener('openurl', prevent);
    assert('preventDefault() 不起作用：defaultPrevented 还是 false', quiet.defaultPrevented, false);
    assert('dispatchEvent 照常返回 true', result, true);
  }
  {
    // openurl 只在 application 上。页面不认识这个名字，当自定义事件
    assert('页面上的 openurl 当自定义事件', customEventWorks(new UIViewController(), 'openurl'), '收到一次');
  }

  // ===================================================================
  // 3. 自己打开自己的协议。系统会不会把它送回来不确定，等不到就报未验证
  console.log('  --- openurl：自己打开自己的协议 ---');
  const declared = /** @type {any} */ (application.info).CFBundleURLTypes;
  const schemes = Array.isArray(declared)
    ? declared.flatMap((/** @type {any} */ entry) => entry.CFBundleURLSchemes || [])
    : [];
  assert('Info.plist 里声明了 nacre-acceptance 这个协议', schemes.includes('nacre-acceptance'), true);

  const before = received.length;
  return (async () => {
    const opened = await application.openURL(SELF_TEST_URL);
    const deadline = performance.now() + 5000;
    /** @type {OpenURLEvent | undefined} */
    let event;
    while (performance.now() < deadline) {
      event = received.slice(before).find((e) => e.url === SELF_TEST_URL);
      if (event !== undefined) break;
      await new Promise((resolve) => { setTimeout(resolve, 100); });
    }
    if (event === undefined) {
      console.log('  ! 自己打开自己的协议（openURL 兑现为 ' + opened +
                  '）：5 秒里没有收到 openurl，真实事件这一组未验证。' +
                  '用 xcrun simctl openurl 从外面打开来验');
      return;
    }
    assert('自己打开自己：openURL 兑现为 true', opened, true);
    assert('收到的 url 和打开的一字不差', event.url, SELF_TEST_URL);
    assert('它是 OpenURLEvent', event instanceof OpenURLEvent, true);
    assert('type 是 openurl', event.type, 'openurl');
    assert('scene 就是这个场景', event.scene === ctx.scene, true);
    assert('target 是 application', event.target === application, true);
    assert('原生派发的不可取消', event.cancelable, false);
    assert('sourceApplication 是字符串或者 null',
           event.sourceApplication === null || typeof event.sourceApplication === 'string', true);
    console.log('  （sourceApplication = ' + JSON.stringify(event.sourceApplication) + '）');
    // 再等一小会儿，看它是不是只来了一次
    await new Promise((resolve) => { setTimeout(resolve, 500); });
    assert('同一次打开只派发一次',
           received.slice(before).filter((e) => e.url === SELF_TEST_URL).length, 1);
    console.log('  --- openurl：以上断言跑完 ---');
  })().catch((err) => {
    console.log('  ✗ openurl 这一步的异步部分中途抛了: ' + (err instanceof Error ? err.message : String(err)));
  });
}
