// 网页补的三样（客户反馈 2026-11-19）：
//   - loadURL 的 baseURLForDataURL：data: 地址里的 HTML 用相对路径引用别的文件
//   - webPreferences.javascript：关掉网页自己的脚本
//   - console-message 事件：网页的 console 和没被捕获的报错转给 App
//
// 都照 Electron。网页不加进界面也能加载，这一步不上屏。

/** @param {import("../main.js").StepContext} ctx */
export async function stepWebAdditions(ctx) {
  const { assert } = ctx;
  console.log('--- WebView：HTML 字符串、关掉 JS、console ---');

  /** @param {string} html */
  const dataURL = (html) => 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
  /** @param {number} ms */
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  /** 一个 Promise 是怎么结束的：兑现给 'ok'，拒绝给 name 和 message
   * @param {Promise<unknown>} promise */
  const outcome = (promise) => promise.then(
    () => 'ok', (err) => /** @type {Error} */ (err).name + ': ' + /** @type {Error} */ (err).message);
  /** @param {() => unknown} run */
  const thrown = (run) => {
    try { run(); return '没抛'; } catch (err) { return /** @type {Error} */ (err).name; }
  };

  // ===== baseURLForDataURL =====
  {
    const web = new WebView();
    const contents = web.webContents;
    const fileBase = 'file://' + application.fileSystem.assets + '/web/';
    // assets/web/sub/pic.png 是一张小图
    const html = '<!doctype html><title>base</title><img id="pic" src="sub/pic.png">';
    assert('带 baseURLForDataURL 的 data: 地址加载成功',
           await outcome(contents.loadURL(dataURL(html), { baseURLForDataURL: fileBase })), 'ok');
    assert('网页的 baseURI 是给的地址', await contents.executeJavaScript('document.baseURI'), fileBase);
    const width = await contents.executeJavaScript(
      'new Promise((resolve) => { const i = document.getElementById("pic");' +
      ' if (i.complete) resolve(i.naturalWidth);' +
      ' else { i.onload = () => resolve(i.naturalWidth); i.onerror = () => resolve(-1); } })');
    assert('相对路径的图片按 baseURLForDataURL 加载出来', Number(width) > 0, true);
    assert('标题照常', await contents.executeJavaScript('document.title'), 'base');
    console.log('  带 baseURLForDataURL 时 getURL() = ' + contents.getURL());

    const httpsBase = 'https://example.com/docs/';
    assert('https 的 baseURLForDataURL 也行',
           await outcome(contents.loadURL(dataURL('<title>h</title>'), { baseURLForDataURL: httpsBase })), 'ok');
    assert('https 的 baseURI', await contents.executeJavaScript('document.baseURI'), httpsBase);

    assert('不带 baseURLForDataURL：照旧',
           await outcome(contents.loadURL(dataURL('<title>plain</title>'))), 'ok');
    assert('不带 baseURLForDataURL：标题', await contents.executeJavaScript('document.title'), 'plain');
    assert('options 传 null 等于不传',
           await outcome(contents.loadURL(dataURL('<title>n</title>'), /** @type {any} */ (null))), 'ok');
    assert('baseURLForDataURL 不是完整的地址：拒绝',
           await outcome(contents.loadURL(dataURL('<title>x</title>'), { baseURLForDataURL: 'docs/' })),
           'TypeError: loadURL: baseURLForDataURL must be an absolute URL, like https://example.com/');
    contents.close();
  }

  // ===== webPreferences.javascript =====
  {
    // 脚本跑了，标题就被改成 ran。标题从网页里读：getTitle() 是系统通知过来的，
    // 加载兑现的那一刻可能还没跟上（红跑时默认网页也读到空串）
    const page = dataURL('<!doctype html><title>static</title><script>document.title = "ran"</script>');
    const on = new WebView();
    await on.webContents.loadURL(page);
    assert('默认网页的脚本会跑', await on.webContents.executeJavaScript('document.title'), 'ran');
    on.webContents.close();

    const off = new WebView({ webPreferences: { javascript: false } });
    await off.webContents.loadURL(page);
    assert('javascript: false：网页的脚本不跑', await off.webContents.executeJavaScript('document.title'), 'static');
    assert('javascript: false：executeJavaScript 照样能用',
           await off.webContents.executeJavaScript('1 + 1'), 2);
    off.webContents.close();

    assert('javascript: undefined 视为没带',
           thrown(() => new WebView({ webPreferences: { javascript: undefined } }).webContents.close()), '没抛');
    // 照 Web IDL 转布尔：'false' 是非空字符串，得到 true
    const truthy = new WebView({ webPreferences: { javascript: /** @type {any} */ ('false') } });
    await truthy.webContents.loadURL(page);
    assert("javascript: 'false' 按布尔转成 true，脚本会跑", await truthy.webContents.executeJavaScript('document.title'), 'ran');
    truthy.webContents.close();
  }

  // ===== console-message =====
  {
    const web = new WebView();
    const contents = web.webContents;
    /** @type {WebContentsConsoleMessageEvent[]} */
    const got = [];
    contents.addEventListener('console-message', (e) => { got.push(e); });
    const html = '<!doctype html><title>c</title><script>\n' +
      'console.log("hello", 1, true);\n' +
      'console.info("i");\n' +
      'console.warn("w");\n' +
      'console.error("e");\n' +
      'console.debug("d");\n' +
      'console.log({ a: 1 }, [1, 2], null, undefined);\n' +
      'console.log(new Error("x"));\n' +
      'console.log("%s=%d%%", "a", 5);\n' +
      'setTimeout(() => { throw new Error("boom"); });\n' +
      'Promise.reject(new Error("nope"));\n' +
      '</script>';
    await contents.loadURL(dataURL(html));
    for (let i = 0; i < 40 && got.length < 10; i++) await sleep(50);
    const lines = got.map((e) => e.level + ' ' + e.message);
    console.log('  收到的 console-message：' + JSON.stringify(lines));
    assert('收到 10 条', got.length, 10);
    const first = got[0];
    if (first !== undefined) {
      assert('事件是 Event', first instanceof Event, true);
      assert('事件是 WebContentsConsoleMessageEvent', first instanceof WebContentsConsoleMessageEvent, true);
      assert('type 是 console-message', first.type, 'console-message');
      assert('不能取消', first.cancelable, false);
      assert('第一条的 level', first.level, 'info');
      assert('第一条的 message：参数用空格连起来', first.message, 'hello 1 true');
      assert('lineNumber 是行号', first.lineNumber, 2);
      assert('sourceId 是字符串', typeof first.sourceId, 'string');
    }
    assert('五种方法的 level',
           got.slice(0, 5).map((e) => e.level).join(','), 'info,info,warning,error,debug');
    assert('对象按 JSON 写，undefined 写成 undefined',
           got[5] && got[5].message, '{"a":1} [1,2] null undefined');
    assert('Error 写成 名字: 说明', got[6] && got[6].message, 'Error: x');
    assert('%s %d %% 照格式替换', got[7] && got[7].message, 'a=5%');
    const uncaught = got.find((e) => e.message.includes('boom'));
    assert('没被捕获的异常：level 是 error', uncaught && uncaught.level, 'error');
    assert('没被捕获的异常：message', uncaught && uncaught.message, 'Uncaught Error: boom');
    const rejected = got.find((e) => e.message.includes('nope'));
    assert('没被处理的拒绝：level 是 error', rejected && rejected.level, 'error');
    assert('没被处理的拒绝：message', rejected && rejected.message, 'Uncaught (in promise) Error: nope');

    // App 用 executeJavaScript 打的也转过来
    got.length = 0;
    await contents.executeJavaScript('console.warn("from app")');
    for (let i = 0; i < 20 && got.length < 1; i++) await sleep(50);
    assert('executeJavaScript 里的 console 也转过来',
           got.length > 0 && got[0].level + ' ' + got[0].message, 'warning from app');
    // 网页里原来的 console 方法还在、还能调
    assert('网页里的 console.log 照常返回', await contents.executeJavaScript('typeof console.log("x")'), 'undefined');
    contents.close();

    // 关了 JS 的网页：网页自己的不会有，App 执行的照样转
    const off = new WebView({ webPreferences: { javascript: false } });
    /** @type {string[]} */
    const offGot = [];
    off.webContents.addEventListener('console-message', (e) => { offGot.push(e.message); });
    await off.webContents.loadURL(dataURL('<title>o</title><script>console.log("page")</script>'));
    await off.webContents.executeJavaScript('console.log("app")');
    for (let i = 0; i < 20 && offGot.length < 1; i++) await sleep(50);
    assert('关了 JS：只收到 App 执行的那条', offGot.join(','), 'app');
    off.webContents.close();
  }
}
