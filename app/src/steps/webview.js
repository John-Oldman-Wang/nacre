// WebView：把网页放进界面。
//
// 形状照 Electron：WebView 是视图，webContents 是里面那张网页。
// 加载、导航、事件，以及拦住网页自己发起的跳转（will-navigate）。
// 执行脚本、cookie 是后面几步。
//
// 大部分用 data: 地址，不联网也能跑。要联网的只有两条（HTTP 状态码），
// 网不通时报未验证。

/** @param {import("../main.js").StepContext} ctx */
export function stepWebView(ctx) {
  const { assert } = ctx;
  const noop = () => {};
  /** @param {() => void} run */
  const thrown = (run) => {
    try { run(); return '没抛'; }
    catch (err) { return /** @type {Error} */ (err).name + ': ' + /** @type {Error} */ (err).message; }
  };
  /** 一个 Promise 是怎么结束的：兑现给 'ok'，拒绝给错误的 name
   * @param {Promise<unknown>} promise */
  const outcome = (promise) => promise.then(
    () => 'ok', (err) => /** @type {Error} */ (err).name);
  /** @param {number} ms */
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  /** 一张自带标题的小网页
   * @param {string} title @param {string} [body] */
  const pageURL = (title, body = '') =>
    'data:text/html;charset=utf-8,' + encodeURIComponent(
      '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>' + title + '</title>' +
      '<body style="font:17px -apple-system;padding:16px;color:#333">' +
      '<h3>' + title + '</h3>' + body);

  console.log('--- WebView ---');

  // ===== 建出来是什么 =====
  const web = new WebView();
  const contents = web.webContents;
  assert('WebView 是 UIView', web instanceof UIView, true);
  assert('webContents 是 WebContents', contents instanceof WebContents, true);
  assert('读两次 webContents 是同一个对象', web.webContents === contents, true);
  assert('WebContents 不能自己建',
         // @ts-expect-error 构造函数是私有的
         thrown(() => new WebContents()),
         'TypeError: Illegal constructor: WebContents is created by the runtime, not by new');
  assert('WebView 不能继承',
         thrown(() => { class MyWeb extends WebView {} return new MyWeb(); }).split(':')[1],
         ' Illegal constructor');

  assert('还没加载：getURL() 是空串', contents.getURL(), '');
  assert('还没加载：getTitle() 是空串', contents.getTitle(), '');
  assert('还没加载：isLoading() 是 false', contents.isLoading(), false);
  assert('isDestroyed() 是 false', contents.isDestroyed(), false);
  assert('isCrashed() 是 false', contents.isCrashed(), false);

  const history = contents.navigationHistory;
  assert('读两次 navigationHistory 是同一个对象', contents.navigationHistory === history, true);
  assert('还没加载：不能后退', history.canGoBack(), false);
  assert('还没加载：不能前进', history.canGoForward(), false);

  // 事件名写错当场抛，并且把能用的列出来
  // @ts-expect-error 没有这个事件
  const wrongName = thrown(() => contents.addEventListener('did-finsh-load', noop));
  assert('事件名写错当场抛', wrongName.split(':')[0], 'TypeError');
  assert('报错里列出了能用的名字', wrongName.includes('did-finish-load'), true);

  // ===== 选项的转换（照 Web IDL）=====
  assert('new WebView(null) 等于不传', thrown(() => new WebView(/** @type {any} */ (null))), '没抛');
  assert('webPreferences 传 null 等于不传',
         thrown(() => new WebView({ webPreferences: /** @type {any} */ (null) })), '没抛');
  assert('partition: undefined 视为没带',
         thrown(() => new WebView({ webPreferences: { partition: undefined } })), '没抛');
  assert('partition 给数字，按字符串转',
         thrown(() => new WebView({ webPreferences: { partition: /** @type {any} */ (5) } })),
         '没抛');

  // ===== 上屏 =====
  const host = ctx.section('WebView：网页（点下面的按钮）', 344);
  web.frame = new CGRect(16, 0, 100, 240);
  web.layer.cornerRadius = 10;
  web.layer.masksToBounds = true;
  web.layer.borderWidth = 1;
  web.layer.borderColor = 'separator';
  host.addSubview(web);
  // 宽度跟着区块走：左右各留 16
  const fit = () => { web.frame = new CGRect(16, 0, Math.max(0, host.bounds.width - 32), 240); };
  fit();
  setTimeout(fit, 0);
  setTimeout(fit, 1000);

  /** @type {[string, () => void][]} */
  const actions = [
    ['example.com', () => { contents.loadURL('https://example.com/'); }],
    ['后退', () => { history.goBack(); }],
    ['前进', () => { history.goForward(); }],
    ['刷新', () => { contents.reload(); }],
  ];
  actions.forEach(([title, run], index) => {
    const button = UIButton.buttonWithType('system');
    button.setTitle(title, { forState: ['normal'] });
    button.frame = new CGRect(16 + index * 92, 252, 88, 40);
    button.addEventListener('primaryActionTriggered', () => {
      console.log('  ✓ 真实触摸：' + title);
      run();
    });
    host.addSubview(button);
  });

  let blocking = false;
  const toggle = UIButton.buttonWithType('system');
  const showToggle = () => {
    toggle.setTitle(blocking ? '拦住网页里的跳转：开（点链接不会跳）' : '拦住网页里的跳转：关',
                    { forState: ['normal'] });
  };
  showToggle();
  toggle.frame = new CGRect(16, 296, 320, 40);
  toggle.contentHorizontalAlignment = 'leading';
  toggle.addEventListener('primaryActionTriggered', () => {
    blocking = !blocking;
    showToggle();
    console.log('  ✓ 真实触摸：拦住网页里的跳转 = ' + blocking);
  });
  host.addSubview(toggle);

  // ===== 事件 =====
  /** @type {string[]} */
  const seen = [];
  /** @type {WebContentsDidNavigateEvent[]} */
  const navigations = [];
  /** @type {WebContentsDidFailLoadEvent[]} */
  const failures = [];
  /** @type {string[]} */
  const titles = [];
  // 自动跑的那一段结束之后，事件改成打日志——给真实触摸看
  let live = false;
  contents.addEventListener('did-start-loading', (e) => {
    seen.push(e.type);
    if (live) console.log('  · did-start-loading');
  });
  contents.addEventListener('did-stop-loading', (e) => {
    seen.push(e.type);
    if (live) console.log('  · did-stop-loading，标题「' + contents.getTitle() + '」');
  });
  contents.addEventListener('did-finish-load', (e) => {
    seen.push(e.type);
    if (live) console.log('  · did-finish-load ' + contents.getURL().slice(0, 60));
  });
  contents.addEventListener('did-navigate', (e) => {
    seen.push(e.type);
    navigations.push(e);
    if (live) console.log('  · did-navigate ' + e.url.slice(0, 60) + '，状态码 ' + e.httpResponseCode);
  });
  contents.addEventListener('did-fail-load', (e) => {
    seen.push(e.type);
    failures.push(e);
    if (live) console.log('  · did-fail-load ' + e.errorCode + ' ' + e.errorDescription);
  });
  contents.addEventListener('page-title-updated', (e) => {
    titles.push(e.title);
    if (live) console.log('  · page-title-updated「' + e.title + '」');
  });
  contents.addEventListener('render-process-gone', () => {
    // 这一条只有网页的进程真的没了才会来。验收里不主动弄死它；从 Mac 上
    // 把模拟器里那个进程杀掉可以看到这一行
    console.log('  ✓ 实测：render-process-gone 到了，isCrashed() = ' + contents.isCrashed() +
                '；重新加载');
    contents.reload();
  });

  /** 等下一次某个事件
   * @param {WebContentsEventType} type @param {WebContents} [from] */
  const next = (type, from = contents) => new Promise((resolve) => {
    from.addEventListener(type, () => resolve(undefined), { once: true });
  });

  // 等标题变成某个值。**不能在 did-finish-load 里直接读标题**：实测刷新
  // 之后 did-finish-load 先到、标题后到（第一次加载时标题先到）
  /** @param {string} title @param {WebContents} [from] */
  const titled = async (title, from = contents) => {
    for (let i = 0; i < 30 && from.getTitle() !== title; i++) await sleep(100);
    return from.getTitle();
  };

  const run = async () => {
    // ----- 加载一张网页 -----
    const urlA = pageURL('第一页', '<p>这是 data: 地址里的一张网页。</p>');
    const urlB = pageURL('第二页', '<p>从第一页过来的。</p>');
    const loading = contents.loadURL(urlA);
    assert('loadURL 返回 Promise', loading instanceof Promise, true);
    console.log('  实测：loadURL 之后立刻读 isLoading() = ' + contents.isLoading());
    assert('加载完，Promise 兑现的值是 undefined', await loading, undefined);
    console.log('  实测：Promise 兑现那一刻的标题「' + contents.getTitle() + '」');
    assert('加载完：getTitle()', await titled('第一页'), '第一页');
    assert('加载完：getURL() 是那个地址', contents.getURL(), urlA);
    await sleep(200);   // did-stop-loading 和 did-finish-load 谁先到没有保证
    assert('加载完：isLoading() 是 false', contents.isLoading(), false);
    console.log('  实测：一次加载的事件顺序 ' + seen.join(' → '));
    assert('四个加载事件各来一次',
           ['did-start-loading', 'did-navigate', 'did-finish-load', 'did-stop-loading']
             .map((type) => seen.filter((s) => s === type).length).join(','), '1,1,1,1');
    assert('did-start-loading 在 did-navigate 之前',
           seen.indexOf('did-start-loading') < seen.indexOf('did-navigate'), true);
    assert('did-navigate 在 did-finish-load 之前',
           seen.indexOf('did-navigate') < seen.indexOf('did-finish-load'), true);
    assert('did-navigate 带着地址', navigations[0].url, urlA);
    assert('不是 HTTP 的导航，httpResponseCode 是 -1', navigations[0].httpResponseCode, -1);
    assert('page-title-updated 带着标题', titles.includes('第一页'), true);
    assert('事件的 target 是 webContents', navigations[0].target === contents, true);

    // ----- 后退和前进 -----
    await contents.loadURL(urlB);
    assert('第二页加载完', await titled('第二页'), '第二页');
    assert('现在能后退', history.canGoBack(), true);
    assert('还不能前进', history.canGoForward(), false);
    let arrived = next('did-finish-load');
    history.goBack();
    await arrived;
    assert('后退之后回到第一页', await titled('第一页'), '第一页');
    assert('后退之后能前进', history.canGoForward(), true);
    assert('后退到头了，不能再退', history.canGoBack(), false);
    assert('不能后退时 goBack() 是空操作', thrown(() => history.goBack()), '没抛');
    arrived = next('did-finish-load');
    history.goForward();
    await arrived;
    assert('前进之后是第二页', await titled('第二页'), '第二页');

    // ----- 重新加载 -----
    const mark = seen.length;
    arrived = next('did-finish-load');
    contents.reload();
    await arrived;
    console.log('  实测：reload() 到 did-finish-load 之间的事件 ' + seen.slice(mark).join(' → ') +
                '；did-finish-load 那一刻的标题「' + contents.getTitle() + '」');
    assert('reload() 之后还是第二页', await titled('第二页'), '第二页');

    // ----- 地址不对：当场拒绝，不发起加载 -----
    const before = seen.length;
    assert('地址没带协议：拒绝，TypeError',
           await outcome(contents.loadURL('example.com')), 'TypeError');
    assert('空地址：拒绝，TypeError', await outcome(contents.loadURL('')), 'TypeError');
    assert('地址不对时没有发起加载（没有新的事件）', seen.length, before);

    // ----- 加载失败 -----
    failures.length = 0;
    /** @type {any} */
    let failure = null;
    try { await contents.loadURL('https://nacre-does-not-exist.invalid/'); }
    catch (err) { failure = err; }
    assert('域名解析不了：Promise 拒绝', failure instanceof Error, true);
    assert('拒绝的错误 name 是 NetworkError', failure && failure.name, 'NetworkError');
    assert('错误上有系统的 domain', failure && failure.domain, 'NSURLErrorDomain');
    console.log('  实测：域名解析不了的 code = ' + (failure && failure.code) +
                '，message = ' + (failure && failure.message));
    assert('同时收到一次 did-fail-load', failures.length, 1);
    if (failures.length > 0) {
      assert('did-fail-load 的 errorCode 和拒绝的 code 是同一个数',
             failures[0].errorCode, failure && failure.code);
      assert('validatedURL 是失败的那个地址',
             failures[0].validatedURL, 'https://nacre-does-not-exist.invalid/');
      assert('isMainFrame 是 true', failures[0].isMainFrame, true);
      assert('errorDescription 是字符串', typeof failures[0].errorDescription, 'string');
    }
    assert('失败之后还停在原来那一页', await titled('第二页'), '第二页');

    // ----- 后一次加载顶掉前一次 -----
    const first = contents.loadURL(urlA);
    const second = contents.loadURL(urlB);
    assert('连着加载两次：前一次拒绝，AbortError', await outcome(first), 'AbortError');
    assert('连着加载两次：后一次兑现', await outcome(second), 'ok');
    assert('停在后一次的那一页', await titled('第二页'), '第二页');

    // ----- stop() -----
    failures.length = 0;
    const stopped = contents.loadURL('https://httpbin.org/delay/5');
    contents.stop();
    /** @type {any} */
    let stopError = null;
    try { await stopped; } catch (err) { stopError = err; }
    assert('stop() 停掉的加载：拒绝，AbortError', stopError && stopError.name, 'AbortError');
    assert('被停掉的 code 是 -999', stopError && stopError.code, -999);
    await sleep(200);
    console.log('  实测：被 stop() 停掉时 did-fail-load 来了 ' + failures.length + ' 次' +
                (failures.length > 0 ? '，errorCode = ' + failures[0].errorCode : ''));

    // ----- 不等 Promise 也不报未处理的拒绝 -----
    //
    // 只听事件、不管返回值是常见写法。失败时不该多报一条 unhandledrejection
    let unhandled = 0;
    const onUnhandled = () => { unhandled++; };
    application.addEventListener('unhandledrejection', onUnhandled);
    contents.loadURL('https://nacre-does-not-exist.invalid/');
    await next('did-fail-load');
    await sleep(300);
    application.removeEventListener('unhandledrejection', onUnhandled);
    assert('不接 loadURL 的 Promise，失败时也不报未处理的拒绝', unhandled, 0);

    // ----- HTTP 状态码（要联网）-----
    navigations.length = 0;
    const online = await outcome(contents.loadURL('https://httpbin.org/status/404'));
    if (online === 'ok' && navigations.length > 0) {
      assert('404 的网页：加载本身算成功，状态码在 did-navigate 上',
             navigations[navigations.length - 1].httpResponseCode, 404);
      navigations.length = 0;
      await outcome(contents.loadURL('https://httpbin.org/html'));
      assert('200 的网页：httpResponseCode 是 200',
             navigations.length > 0 && navigations[navigations.length - 1].httpResponseCode, 200);
      console.log('  实测：httpbin.org/html 的标题「' + contents.getTitle() +
                  '」，地址 ' + contents.getURL());
    } else {
      console.log('  ! httpbin.org 连不上（' + online + '），HTTP 状态码那两条未验证');
    }

    // ----- will-navigate：网页自己要跳的时候，先问一声 -----
    //
    // 用另一张网页来验（加进界面但隐藏，定时器才照常跑），屏幕上那一张
    // 在自动跑的这一段里**不挂** will-navigate——没人监听时的行为由上面
    // 那些断言盯着。
    //
    // 要去的地址都是解析不了的域名：拦住了就根本不会去连；放行了会收到
    // did-fail-load，正好当「确实放行了」的证据。所以这一段不用联网
    const gate = new WebView();
    const gated = gate.webContents;
    gate.isHidden = true;
    gate.frame = new CGRect(0, 0, 10, 10);
    host.addSubview(gate);
    /** @type {WebContentsWillNavigateEvent[]} */
    let asked = [];
    /** @type {string[]} */
    let loads = [];
    /** @type {number[]} */
    let failCodes = [];
    let refuse = true;
    gated.addEventListener('will-navigate', (e) => {
      asked.push(e);
      if (refuse) e.preventDefault();
    });
    /** @type {boolean[]} */
    const otherCancelable = [];
    gated.addEventListener('did-navigate', (e) => {
      loads.push(e.type);
      e.preventDefault();   // 不可取消的事件上调它，照标准静默无效
      otherCancelable.push(e.cancelable || e.defaultPrevented);
    });
    gated.addEventListener('did-start-loading', (e) => { loads.push(e.type); });
    gated.addEventListener('did-finish-load', (e) => { loads.push(e.type); });
    gated.addEventListener('did-fail-load', (e) => { loads.push(e.type); failCodes.push(e.errorCode); });
    /** 一张加载完 200 毫秒后自己执行一段脚本的网页
     * @param {string} title @param {string} script */
    const scripted = (title, script) => pageURL(title,
      '<a id="l" href="https://nacre-gate.invalid/link">link</a>' +
      '<form id="f" method="post" action="https://nacre-gate.invalid/form"></form>' +
      '<script>setTimeout(() => { ' + script + ' }, 200);</script>');
    /** 加载一张这样的网页，等它的脚本跑完。返回这期间问了几次
     * @param {string} title @param {string} script @param {() => boolean} [done] */
    const act = async (title, script, done = () => asked.length > 0) => {
      await gated.loadURL(scripted(title, script));
      asked = []; loads = []; failCodes = [];
      for (let i = 0; i < 25 && !done(); i++) await sleep(100);
      await sleep(300);   // 再等一会儿：拦住之后「不该发生」的事要给它时间发生
      return asked.length;
    };

    // App 自己发起的：不问
    const plainA = pageURL('甲');
    await gated.loadURL(plainA);
    await gated.loadURL(pageURL('乙'));
    arrived = next('did-finish-load', gated);
    gated.navigationHistory.goBack();
    await arrived;
    arrived = next('did-finish-load', gated);
    gated.navigationHistory.goForward();
    await arrived;
    arrived = next('did-finish-load', gated);
    gated.reload();
    await arrived;
    await sleep(200);
    assert('loadURL、后退、前进、reload()：都不派发 will-navigate', asked.length, 0);
    assert('别的事件不可取消，preventDefault() 无效', otherCancelable.includes(true), false);

    // 网页脚本改 location：问，拦得住
    assert('脚本改 location：派发一次 will-navigate',
           await act('改地址', "location.href = 'https://nacre-gate.invalid/href';"), 1);
    assert('will-navigate 带着要去的地址', asked[0].url, 'https://nacre-gate.invalid/href');
    assert('脚本改 location 的 navigationType 是 other', asked[0].navigationType, 'other');
    assert('isMainFrame 是 true', asked[0].isMainFrame, true);
    assert('will-navigate 是可取消的', asked[0].cancelable, true);
    assert('事件的 target 是 webContents', asked[0].target === gated, true);
    assert('拦住之后 defaultPrevented 是 true', asked[0].defaultPrevented, true);
    assert('拦住之后一个加载事件都没有', loads.join(','), '');
    assert('拦住之后网页留在原地', gated.getTitle(), '改地址');
    assert('拦住之后 isLoading() 是 false', gated.isLoading(), false);

    // 点链接（脚本替用户点）
    assert('点链接：派发一次 will-navigate',
           await act('点链接', "document.getElementById('l').click();"), 1);
    assert('点链接的 navigationType 是 linkActivated', asked[0].navigationType, 'linkActivated');
    assert('点链接：地址是链接的地址', asked[0].url, 'https://nacre-gate.invalid/link');
    assert('点链接：拦住了，没有加载事件', loads.join(','), '');

    // 提交表单
    assert('提交表单：派发一次 will-navigate',
           await act('表单', "document.getElementById('f').submit();"), 1);
    assert('提交表单的 navigationType 是 formSubmitted', asked[0].navigationType, 'formSubmitted');
    assert('提交表单：地址是表单的 action', asked[0].url, 'https://nacre-gate.invalid/form');

    // 网页不认识的协议：拦下来就可以自己处理
    assert('tel: 链接：派发一次 will-navigate',
           await act('电话', "location.href = 'tel:10086';"), 1);
    assert('tel: 链接：地址原样给', asked[0].url, 'tel:10086');
    assert('tel: 链接：拦住了，没有加载失败', loads.join(','), '');

    // App 自己定的协议：同样拦得到，地址原样给
    assert('自定义协议的链接：派发一次 will-navigate',
           await act('自定义协议', "location.href = 'myapp://share?id=1';"), 1);
    assert('自定义协议的链接：地址原样给', asked[0].url, 'myapp://share?id=1');
    assert('自定义协议的链接：拦住了，没有加载失败', loads.join(','), '');

    // 网页自己刷新。window.name 当「刷过一次了」的记号——data: 的网页
    // 用不了 sessionStorage
    assert('网页自己 location.reload()：派发一次 will-navigate',
           await act('自己刷新', "if (!window.name) { window.name = 'r'; location.reload(); }"), 1);
    assert('网页自己刷新的 navigationType 是 reload', asked[0].navigationType, 'reload');
    assert('网页自己刷新：拦住了，没有加载事件', loads.join(','), '');

    // 网页自己后退
    await gated.loadURL(plainA);
    assert('网页自己 history.back()：派发一次 will-navigate',
           await act('自己后退', 'history.back();'), 1);
    assert('网页自己后退的 navigationType 是 backForward', asked[0].navigationType, 'backForward');
    assert('网页自己后退：地址是上一页的', asked[0].url, plainA);
    assert('网页自己后退：拦住了，还在这一页', gated.getTitle(), '自己后退');

    // 只改 # 后面的部分：不问
    // iOS 26 上 data: 网页的地址里 # 读出来是 %23，两种都认
    const anchored = () => /(#|%23)x$/.test(gated.getURL());
    assert('只改 #：不派发 will-navigate',
           await act('锚点', "location.hash = 'x';", anchored), 0);
    assert('只改 #：地址确实变了', anchored(), true);
    console.log('  实测：data: 网页改锚点之后，getURL() 的结尾是 ' + gated.getURL().slice(-4));

    // <iframe> 里的加载：不问
    assert('<iframe> 里的加载：不派发 will-navigate',
           await act('内嵌', "const i = document.createElement('iframe'); " +
                     "i.src = 'https://nacre-gate.invalid/frame'; document.body.append(i);",
                     () => false), 0);

    // 不拦：照常跳。域名解析不了，所以会收到 did-fail-load
    refuse = false;
    assert('不调 preventDefault()：照样派发一次',
           await act('放行', "location.href = 'https://nacre-gate.invalid/allowed';",
                     () => loads.includes('did-fail-load')), 1);
    assert('不调 preventDefault()：defaultPrevented 是 false', asked[0].defaultPrevented, false);
    assert('不调 preventDefault()：跳转照常发生（解析不了，收到 did-fail-load）',
           loads.includes('did-fail-load'), true);

    // 不拦 tel:：系统的网页不认识这个协议，加载失败
    await act('电话放行', "location.href = 'tel:10086';", () => loads.includes('did-fail-load'));
    console.log('  实测：不拦 tel: 链接，did-fail-load 的 errorCode = ' + failCodes.join(','));
    assert('不拦 tel: 链接：加载失败，errorCode 是 -1002', failCodes[0], -1002);

    // 监听器抛了：按没取消算，跳转照常
    const thrower = () => { throw new Error('这条是验收故意抛的，下面应该打出一行 Event listener threw'); };
    gated.addEventListener('will-navigate', thrower);
    await act('监听器抛', "location.href = 'https://nacre-gate.invalid/thrown';",
              () => loads.includes('did-fail-load'));
    assert('监听器抛了：跳转照常发生', loads.includes('did-fail-load'), true);
    gated.removeEventListener('will-navigate', thrower);

    // 先拦住、异步查完再自己加载：loadURL 不派发 will-navigate，所以不会绕回来
    refuse = false;
    const later = pageURL('查完再去');
    const deferring = (/** @type {WebContentsWillNavigateEvent} */ e) => {
      e.preventDefault();
      sleep(150).then(() => gated.loadURL(later));
    };
    gated.addEventListener('will-navigate', deferring);
    await act('先拦住', "location.href = 'https://nacre-gate.invalid/later';",
              () => gated.getURL() === later);
    assert('先拦住再自己 loadURL：只派发了一次（loadURL 不会再绕回来）', asked.length, 1);
    assert('先拦住再自己 loadURL：最后到了自己加载的那一页', gated.getURL(), later);
    gated.removeEventListener('will-navigate', deferring);

    // 服务器重定向（要联网）：App 发起的不问；网页发起的只问第一个地址
    refuse = true;
    asked = [];
    const redirected = await outcome(gated.loadURL('https://httpbin.org/redirect/1'));
    if (redirected === 'ok') {
      assert('loadURL 到一个会重定向的地址：不派发 will-navigate', asked.length, 0);
      assert('loadURL 到一个会重定向的地址：落在重定向之后的地址',
             gated.getURL(), 'https://httpbin.org/get');
      refuse = false;
      await act('跳去重定向', "location.href = 'https://httpbin.org/redirect/1';",
                () => loads.includes('did-finish-load') || loads.includes('did-fail-load'));
      assert('网页跳到一个会重定向的地址：只问一次', asked.length, 1);
      assert('问的是重定向之前的那个地址',
             asked.length > 0 && asked[0].url, 'https://httpbin.org/redirect/1');
      assert('重定向本身没有再问，最后落在目标地址', gated.getURL(), 'https://httpbin.org/get');
    } else {
      console.log('  ! httpbin.org 连不上（' + redirected + '），服务器重定向那几条未验证');
    }

    // 在 will-navigate 的监听器里把网页销毁：答复照样送得到，不出事
    const fragile = new WebView();
    const fragileContents = fragile.webContents;
    fragile.isHidden = true;
    fragile.frame = new CGRect(0, 0, 10, 10);
    host.addSubview(fragile);
    let closedInside = false;
    fragileContents.addEventListener('will-navigate', () => {
      fragileContents.close();
      closedInside = true;
    });
    await fragileContents.loadURL(scripted('要被销毁', "location.href = 'https://nacre-gate.invalid/gone';"));
    for (let i = 0; i < 25 && !closedInside; i++) await sleep(100);
    await sleep(500);
    assert('在 will-navigate 里 close()：监听器跑到了', closedInside, true);
    assert('在 will-navigate 里 close()：销毁了，App 还在', fragileContents.isDestroyed(), true);
    fragile.removeFromSuperview();
    gate.removeFromSuperview();
    gated.close();

    // ----- loadFile：本地的网页文件 -----
    //
    // 包里有一组验收用的网页（ios/JS/assets/web/）。index.html 加载完之后
    // 把各项结果写成一段 JSON 放进标题。同样加进界面但隐藏
    const local = new WebView();
    const localContents = local.webContents;
    local.isHidden = true;
    local.frame = new CGRect(0, 0, 200, 100);
    host.addSubview(local);
    /** @type {WebContentsWillNavigateEvent[]} */
    let localAsked = [];
    /** @type {WebContentsDidNavigateEvent[]} */
    let localNavigations = [];
    /** @type {number[]} */
    let localFailures = [];
    localContents.addEventListener('will-navigate', (e) => { localAsked.push(e); });
    localContents.addEventListener('did-navigate', (e) => { localNavigations.push(e); });
    localContents.addEventListener('did-fail-load', (e) => { localFailures.push(e.errorCode); });
    /** 等 index.html 把结果写进标题，解出来
     * @returns {Promise<Record<string, any>>} */
    const localResult = async () => {
      for (let i = 0; i < 40 && localContents.getTitle()[0] !== '{'; i++) await sleep(100);
      try { return JSON.parse(localContents.getTitle()); } catch (err) { return {}; }
    };

    assert('loadFile 返回 Promise，兑现 undefined',
           await localContents.loadFile('JS/assets/web/index.html'), undefined);
    let found = await localResult();
    console.log('  实测：本地网页报上来的结果 ' + JSON.stringify(found));
    const localURL = localContents.getURL();
    assert('相对路径相对 App 包：地址是 file:// 开头', localURL.startsWith('file:///'), true);
    assert('地址落在包里那个文件上', localURL.endsWith('.app/JS/assets/web/index.html'), true);
    assert('本地网页的 httpResponseCode 是 -1',
           localNavigations.length > 0 && localNavigations[0].httpResponseCode, -1);
    assert('旁边的样式表生效了', found.css, '123px');
    assert('子目录里的普通脚本执行了', found.script, 'yes');
    assert('子目录里的图片加载出来了', found.sub > 0, true);
    assert('上一级目录的图片也加载出来了（包里的文件，整个包可读）', found.parent > 0, true);
    assert('localStorage 能用', typeof found.n, 'number');
    assert('本地网页的 origin 是 file://', found.origin, 'file://');
    // 下面三条是本地网页的硬限制，记成断言：哪天系统放开了会红，文档要跟着改
    assert('限制：<script type="module"> 不执行', found.module, 'no');
    assert('限制：fetch 读不了本地文件', found.fetch, 'ERR');
    assert('限制：XMLHttpRequest 也读不了', found.xhr, 'ERR');
    assert('App 发起的 loadFile 不派发 will-navigate', localAsked.length, 0);

    // options：照 Electron
    await localContents.loadFile('JS/assets/web/index.html',
                                 { query: { a: '1', b: 'x y' }, hash: 'top' });
    found = await localResult();
    assert('query 拼成地址里 ? 后面的部分', found.search, '?a=1&b=x+y');
    assert('hash 拼成 # 后面的部分', found.hash, '#top');
    await localContents.loadFile('JS/assets/web/index.html',
                                 { search: 'k=v', query: { ignored: '1' }, hash: '#h' });
    found = await localResult();
    assert('search 直接给字符串，和 query 都给时用 search', found.search, '?k=v');
    assert('hash 自己带了 # 也行', found.hash, '#h');
    const countBefore = found.n;

    // 另一个文件：同一个来源，localStorage 是接着的
    await localContents.loadFile('JS/assets/web/other.html');
    for (let i = 0; i < 30 && !localContents.getTitle().startsWith('other'); i++) await sleep(100);
    assert('所有本地网页是同一个来源：另一个文件里的计数是接着的',
           localContents.getTitle(), 'other n=' + (countBefore + 1));

    // 出错
    localFailures = [];
    /** @type {any} */
    let missing = null;
    try { await localContents.loadFile('JS/assets/web/nope.html'); } catch (err) { missing = err; }
    assert('文件不存在：拒绝，NetworkError', missing && missing.name, 'NetworkError');
    assert('文件不存在：code 是 -1100', missing && missing.code, -1100);
    assert('文件不存在：同时派发 did-fail-load', localFailures.join(','), '-1100');
    assert('路径是空串：拒绝，TypeError', await outcome(localContents.loadFile('')), 'TypeError');

    // loadURL 给 file:// 的地址，走的是同一条路
    await localContents.loadURL(localURL);
    found = await localResult();
    assert('loadURL 给 file:// 地址：一样加载得出来', found.css + ',' + found.script, '123px,yes');

    // 绝对路径：App 自己写到文档目录里的网页
    const { fileSystem } = application;
    const packDir = fileSystem.documents + '/acceptance-web';
    await fileSystem.makeDirectory(packDir);
    await fileSystem.writeText(packDir + '/a.css', '#box { width: 77px; }');
    await fileSystem.writeText(packDir + '/page.html',
      '<!doctype html><title>-</title><link rel="stylesheet" href="a.css"><div id="box"></div>' +
      '<script>addEventListener("load", () => { document.title = "docs " + ' +
      'getComputedStyle(document.getElementById("box")).width; });</script>');
    await localContents.loadFile(packDir + '/page.html');
    for (let i = 0; i < 30 && !localContents.getTitle().startsWith('docs'); i++) await sleep(100);
    assert('绝对路径：文档目录里的网页加载得出来，旁边的样式表也生效',
           localContents.getTitle(), 'docs 77px');
    await fileSystem.remove(packDir);

    // 本地网页里点链接到另一个本地文件：是网页发起的，照常派发 will-navigate
    localAsked = [];
    await localContents.loadFile('JS/assets/web/index.html', { query: { go: '1' } });
    for (let i = 0; i < 40 && !localContents.getTitle().startsWith('other'); i++) await sleep(100);
    assert('本地网页里点链接：派发一次 will-navigate', localAsked.length, 1);
    assert('本地网页里点链接：地址是另一个本地文件',
           localAsked.length > 0 && localAsked[0].url.endsWith('/JS/assets/web/other.html'), true);
    assert('本地网页里点链接：跳过去了', localContents.getTitle().startsWith('other'), true);
    local.removeFromSuperview();
    localContents.close();

    // ----- 网页感知得到什么：大小、深浅色、显示隐藏、安全区 -----
    //
    // 一张把这些都写进标题的网页：宽度 | 深浅色 | 安全区上 | 安全区下 |
    // resize 次数 | visibilitychange 的记录
    const senseURL = 'data:text/html;charset=utf-8,' + encodeURIComponent(
      '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1,' +
      'viewport-fit=cover"><title>-</title>' +
      '<div id="p" style="position:fixed;top:0;width:1px;height:env(safe-area-inset-top)"></div>' +
      '<div id="q" style="position:fixed;bottom:0;width:1px;height:env(safe-area-inset-bottom)"></div>' +
      '<script>const dark = matchMedia("(prefers-color-scheme: dark)"); let resizes = 0; const vis = [];' +
      'const show = () => { document.title = [innerWidth, dark.matches ? "dark" : "light", ' +
      'p.offsetHeight, q.offsetHeight, resizes, vis.join(">")].join("|"); };' +
      'addEventListener("resize", () => { resizes++; show(); });' +
      'dark.addEventListener("change", show);' +
      'document.addEventListener("visibilitychange", () => { vis.push(document.visibilityState); show(); });' +
      'show();</script>');
    const sensor = new WebView();
    const sensed = sensor.webContents;
    sensor.isHidden = true;    // 不挡住界面。隐藏的视图在网页看来照样是「看得见」
    sensor.frame = new CGRect(16, 0, 200, 100);
    host.addSubview(sensor);
    await sensed.loadURL(senseURL);
    /** 等标题满足条件，返回拆开的六段
     * @param {(parts: string[]) => boolean} ready */
    const sense = async (ready) => {
      for (let i = 0; i < 30 && !ready(sensed.getTitle().split('|')); i++) await sleep(100);
      return sensed.getTitle().split('|');
    };
    let parts = await sense((p) => p.length === 6);
    assert('网页的 innerWidth 等于视图的宽（pt）', parts[0], 200);
    assert('在安全区里面的网页，env(safe-area-inset-top) 是 0', parts[2], 0);
    const systemStyle = sensor.traitCollection.userInterfaceStyle;
    assert('网页的 prefers-color-scheme 跟视图的外观一致', parts[1], systemStyle);

    sensor.frame = new CGRect(16, 0, 300, 100);
    parts = await sense((p) => p[0] === '300');
    assert('改视图的宽：网页的 innerWidth 跟着变', parts[0], 300);
    assert('改视图的宽：网页收到 resize', Number(parts[4]) >= 1, true);

    const flippedStyle = systemStyle === 'dark' ? 'light' : 'dark';
    sensor.overrideUserInterfaceStyle = flippedStyle;
    parts = await sense((p) => p[1] === flippedStyle);
    assert('强制视图换外观：网页的 prefers-color-scheme 跟着变', parts[1], flippedStyle);
    sensor.overrideUserInterfaceStyle = 'unspecified';
    parts = await sense((p) => p[1] === systemStyle);

    sensor.isHidden = false;
    await sleep(300);
    sensor.isHidden = true;
    await sleep(300);
    assert('改 isHidden：网页收不到 visibilitychange', sensed.getTitle().split('|')[5], '');
    sensor.removeFromSuperview();
    parts = await sense((p) => p[5] === 'hidden');
    assert('从界面上拿掉：网页收到 visibilitychange，变成 hidden', parts[5], 'hidden');
    host.addSubview(sensor);
    parts = await sense((p) => p[5] === 'hidden>visible');
    assert('加回界面：网页收到 visibilitychange，变回 visible', parts[5], 'hidden>visible');

    // 铺满整个窗口（伸到刘海和底部横条下面）时，安全区的值网页读得到
    ctx.win.addSubview(sensor);
    sensor.frame = ctx.win.bounds;
    const insets = ctx.win.safeAreaInsets;
    parts = await sense((p) => Number(p[2]) > 0);
    console.log('  实测：铺满窗口的网页 env(safe-area-inset-top) = ' + parts[2] +
                'px，bottom = ' + parts[3] + 'px；窗口的安全区 top = ' + insets.top +
                ' pt，bottom = ' + insets.bottom + ' pt');
    assert('铺满窗口：env(safe-area-inset-top) 等于窗口安全区的 top', parts[2], insets.top);
    assert('铺满窗口：env(safe-area-inset-bottom) 等于窗口安全区的 bottom', parts[3], insets.bottom);
    sensor.removeFromSuperview();
    sensed.close();

    // ----- 不在界面里的网页：预加载 -----
    //
    // 两张网页各自每 100 毫秒把计数和 visibilityState 写进标题。一张不加进
    // 界面，一张加进界面但隐藏。系统只放慢前一种——网页「看不看得见」按
    // 它在不在窗口里算，不按 isHidden 算
    const ticker = pageURL('0',
      '<script>let n = 0; setInterval(() => { ' +
      'document.title = (++n) + "/" + document.visibilityState; }, 100);</script>');
    const detached = new WebView();
    const hidden = new WebView();
    hidden.isHidden = true;
    hidden.frame = new CGRect(0, 0, 10, 10);
    host.addSubview(hidden);
    await Promise.all([detached.webContents.loadURL(ticker), hidden.webContents.loadURL(ticker)]);
    assert('没加进界面的网页也加载得完', detached.webContents.getURL(), ticker);
    await sleep(3000);
    const [detachedTicks, detachedState] = detached.webContents.getTitle().split('/');
    const [hiddenTicks, hiddenState] = hidden.webContents.getTitle().split('/');
    console.log('  实测：跑 3 秒，100 毫秒的定时器：不在界面里 ' + detachedTicks + ' 次（' +
                detachedState + '），在界面里但隐藏 ' + hiddenTicks + ' 次（' + hiddenState + '）');
    assert('不在界面里的网页 visibilityState 是 hidden', detachedState, 'hidden');
    assert('不在界面里的网页，定时器被放慢了（3 秒不到 15 次）', Number(detachedTicks) < 15, true);
    assert('在界面里但隐藏的网页 visibilityState 是 visible', hiddenState, 'visible');
    assert('在界面里但隐藏的网页，定时器照常（3 秒至少 20 次）', Number(hiddenTicks) >= 20, true);
    hidden.removeFromSuperview();

    // ----- 销毁 -----
    const doomed = hidden;
    const doomedContents = doomed.webContents;
    let destroyedEvents = 0;
    doomedContents.addEventListener('destroyed', () => { destroyedEvents++; });
    const cut = doomedContents.loadURL(urlA);
    doomedContents.close();
    assert('close() 之后 isDestroyed() 是 true', doomedContents.isDestroyed(), true);
    assert('close() 时还在加载的那次：拒绝，AbortError', await outcome(cut), 'AbortError');
    await sleep(100);
    assert('收到一次 destroyed', destroyedEvents, 1);
    assert('销毁之后调别的方法抛',
           thrown(() => doomedContents.getURL()), 'TypeError: Object has been destroyed');
    assert('销毁之后后退前进也抛',
           thrown(() => doomedContents.navigationHistory.canGoBack()),
           'TypeError: Object has been destroyed');
    assert('销毁之后 loadURL 拒绝，TypeError',
           await outcome(doomedContents.loadURL(urlA)), 'TypeError');
    assert('再 close() 一次是空操作', thrown(() => doomedContents.close()), '没抛');
    await sleep(100);
    assert('destroyed 不会来第二次', destroyedEvents, 1);
    assert('WebView 本身还是一个能用的视图',
           thrown(() => { doomed.frame = new CGRect(0, 0, 10, 10); doomed.alpha = 0.5; }), '没抛');
    assert('里面已经空了', doomed.subviews.length, 0);
    detached.webContents.close();

    // ----- 屏幕上那一张回到第一页，留给真实触摸 -----
    await outcome(contents.loadURL(pageURL('WebView',
      '<p>这是屏幕上的一张网页，可以滚动、选字。</p>' +
      '<p><a href="https://example.com/">点这个链接去 example.com</a></p>' +
      '<p style="height:400px;background:linear-gradient(#e8f0ff,#fff)">往下滚</p>')));
    live = true;
    // 从这里起屏幕上那一张才挂 will-navigate：打日志，开关开着就拦
    contents.addEventListener('will-navigate', (e) => {
      if (blocking) e.preventDefault();
      console.log('  · will-navigate ' + e.url.slice(0, 60) + '（' + e.navigationType + '）' +
                  (blocking ? '，拦住了' : ''));
    });
    console.log('  ✓ 屏幕上有一张网页、四个按钮和一个开关：点链接或按钮会打出加载事件，开关开着时点链接不会跳');
    console.log('--- WebView：以上断言跑完 ---');
  };
  run().catch((err) => {
    console.log('  ✗ WebView 这一步中途抛了: ' + (err && err.stack || err));
    console.log('--- WebView：以上断言跑完 ---');
  });
}
