// 网页的自定义协议：session.protocol.serveDirectory(scheme, directory)。
//
// 之后新建的、用这个分区的网页里，scheme://任意主机/路径 从 directory 里取文件。
// 网页因此有一个正常的来源，模块脚本和同源的 fetch 能用（file:// 下都不行）。
//
// 素材在 acceptance/assets/web-protocol/。

/** @param {() => void} fn */
function thrown(fn) {
  try {
    fn();
    return '没抛';
  } catch (err) {
    return err instanceof Error ? err.name : String(err);
  }
}

/** @param {Promise<unknown>} p */
async function settles(p) {
  try {
    await p;
    return '兑现';
  } catch {
    return '拒绝';
  }
}

/** 网页里要跑的检查：结果拼成一段 JSON 交回来 */
const PAGE_CHECKS = `(async () => {
  const r = {};
  for (let i = 0; i < 40 && window.moduleAnswer === undefined; i++) {
    await new Promise((done) => setTimeout(done, 50));
  }
  r.origin = location.origin;
  r.module = window.moduleAnswer === undefined ? null : window.moduleAnswer;
  r.css = getComputedStyle(document.getElementById('head')).color;
  r.secure = window.isSecureContext;
  const data = await fetch('/data.json');
  r.jsonStatus = data.status;
  r.jsonType = data.headers.get('content-type');
  r.jsonLength = data.headers.get('content-length');
  r.jsonFrom = (await data.json()).from;
  r.mjsType = (await fetch('main.mjs')).headers.get('content-type');
  r.wasmType = (await fetch('empty.wasm')).headers.get('content-type');
  r.htmlType = (await fetch('index.html')).headers.get('content-type');
  r.missing = (await fetch('/nope.json')).status;
  const dir = await fetch('/sub/');
  r.dirStatus = dir.status;
  r.dirText = await dir.text();
  const dirNoSlash = await fetch('/sub');
  r.dirNoSlashStatus = dirNoSlash.status;
  r.escape = (await fetch('/%2e%2e/web/data.json')).status;
  r.post = (await fetch('/data.json', { method: 'POST', body: 'x' })).status;
  const head = await fetch('/data.json', { method: 'HEAD' });
  r.headStatus = head.status;
  r.headBody = (await head.text()).length;
  r.query = (await fetch('/data.json?x=1')).status;
  localStorage.setItem('nacre-protocol', 'from-app-scheme');
  r.storage = localStorage.getItem('nacre-protocol');
  return JSON.stringify(r);
})()`;

/** @param {import("../main.js").StepContext} ctx */
export async function stepWebProtocol(ctx) {
  const { assert } = ctx;
  console.log('--- 网页的自定义协议 ---');
  const host = ctx.section('自定义协议', 160);
  const dir = 'JS/assets/web-protocol';
  const protocol = session.defaultSession.protocol;

  // ---- 对象 ----
  assert('自定义协议：session.protocol 每次读是同一个对象', session.defaultSession.protocol === protocol, true);
  assert('自定义协议：Protocol 不继承任何类', Object.getPrototypeOf(Protocol.prototype), Object.prototype);
  assert('自定义协议：Protocol 不能 new', thrown(() => new /** @type {any} */ (Protocol)()), 'TypeError');
  assert('自定义协议：分区不同，protocol 不同',
         session.fromPartition('nacre-protocol-test').protocol !== protocol, true);

  // 先建好的网页：之后的注册对它不起作用
  const early = new WebView();

  // ---- serveDirectory 的参数 ----
  assert('自定义协议：没注册过，isProtocolHandled 是 false', protocol.isProtocolHandled('nacre-test'), false);
  protocol.serveDirectory('nacre-test', dir);
  assert('自定义协议：注册之后 isProtocolHandled 是 true', protocol.isProtocolHandled('nacre-test'), true);
  assert('自定义协议：协议名有大写字母抛', thrown(() => protocol.serveDirectory('Nacre', dir)), 'TypeError');
  assert('自定义协议：协议名数字开头抛', thrown(() => protocol.serveDirectory('1app', dir)), 'TypeError');
  assert('自定义协议：协议名有空格抛', thrown(() => protocol.serveDirectory('my app', dir)), 'TypeError');
  assert('自定义协议：协议名是空串抛', thrown(() => protocol.serveDirectory('', dir)), 'TypeError');
  assert('自定义协议：https 是 WebKit 自己处理的，抛', thrown(() => protocol.serveDirectory('https', dir)), 'TypeError');
  assert('自定义协议：file 是 WebKit 自己处理的，抛', thrown(() => protocol.serveDirectory('file', dir)), 'TypeError');
  assert('自定义协议：目录不存在抛',
         thrown(() => protocol.serveDirectory('nacre-test', 'JS/assets/no-such-dir')), 'TypeError');
  assert('自定义协议：给的是文件不是目录，抛',
         thrown(() => protocol.serveDirectory('nacre-test', dir + '/data.json')), 'TypeError');
  assert('自定义协议：报错之后原来的注册还在', protocol.isProtocolHandled('nacre-test'), true);
  assert('自定义协议：unhandle 没注册过的不抛', thrown(() => protocol.unhandle('nacre-none')), '没抛');

  // ---- 加载 ----
  const web = new WebView();
  web.frame = new CGRect(0, 0, 300, 150);
  host.addSubview(web);
  const contents = web.webContents;
  /** @type {number[]} */
  const codes = [];
  contents.addEventListener('did-navigate', (e) => { codes.push(e.httpResponseCode); });
  const loaded = await settles(contents.loadURL('nacre-test://local/index.html'));
  assert('自定义协议：loadURL 兑现', loaded, '兑现');
  if (loaded !== '兑现') return;
  // WebKit 对自定义协议的主页面不给状态码，和 file:// 一样是 -1（实测）。网页里 fetch
  // 拿得到真实的状态码，见下面
  assert('自定义协议：主页面的 httpResponseCode 是 -1（WebKit 不给）', codes[codes.length - 1], -1);

  /** @type {Record<string, unknown>} */
  let r = {};
  try {
    r = JSON.parse(String(await contents.executeJavaScript(PAGE_CHECKS)));
  } catch (err) {
    assert('自定义协议：网页里的检查跑完了', String(err), '');
  }
  assert('自定义协议：location.origin 是 协议://主机', r.origin, 'nacre-test://local');
  assert('自定义协议：模块脚本执行了，import 到了同目录的模块', r.module, 42);
  assert('自定义协议：样式表加载了', r.css, 'rgb(255, 0, 0)');
  assert('自定义协议：同源的 fetch 能用', r.jsonStatus, 200);
  assert('自定义协议：.json 的类型是 application/json', r.jsonType, 'application/json');
  assert('自定义协议：Content-Length 是文件的字节数', r.jsonLength, '34');
  assert('自定义协议：取到的是映射目录里的那个文件', r.jsonFrom, 'web-protocol');
  assert('自定义协议：.mjs 的类型是 text/javascript', r.mjsType, 'text/javascript');
  assert('自定义协议：.wasm 的类型是 application/wasm', r.wasmType, 'application/wasm');
  assert('自定义协议：.html 的类型是 text/html', String(r.htmlType).startsWith('text/html'), true);
  assert('自定义协议：找不到的文件给 404', r.missing, 404);
  assert('自定义协议：以 / 结尾的目录给里面的 index.html',
         r.dirStatus === 200 && String(r.dirText).includes('sub/index.html'), true);
  assert('自定义协议：不以 / 结尾的目录也给 index.html', r.dirNoSlashStatus, 200);
  assert('自定义协议：编码过的 .. 跑不出目录，给 404', r.escape, 404);
  assert('自定义协议：POST 给 405', r.post, 405);
  assert('自定义协议：HEAD 给 200、没有内容', r.headStatus === 200 && r.headBody === 0, true);
  assert('自定义协议：带查询串也找得到文件', r.query, 200);
  assert('自定义协议：localStorage 能用', r.storage, 'from-app-scheme');
  console.log('  · 实测：自定义协议的网页 isSecureContext = ' + r.secure);

  // 主页面找不到：显示一句 Not Found，加载本身算成功
  assert('自定义协议：主页面找不到，loadURL 照样兑现',
         await settles(contents.loadURL('nacre-test://local/nope.html')), '兑现');
  assert('自定义协议：主页面找不到，显示的是 Not Found',
         await contents.executeJavaScript('document.body.innerText.trim()'), 'Not Found');

  // 来源和 file:// 分开
  const fileWeb = new WebView();
  if (await settles(fileWeb.webContents.loadFile('JS/assets/web/other.html')) === '兑现') {
    assert('自定义协议：file:// 的网页看不见它的 localStorage',
           await fileWeb.webContents.executeJavaScript("localStorage.getItem('nacre-protocol')"), null);
  } else {
    assert('自定义协议：file:// 的对照网页加载了', false, true);
  }

  // ---- 先建的网页不认 ----
  assert('自定义协议：注册之前建的网页加载不了', await settles(early.webContents.loadURL('nacre-test://local/index.html')), '拒绝');

  // ---- 绝对路径 ----
  protocol.serveDirectory('nacre-abs', application.fileSystem.assets + '/web-protocol');
  const abs = new WebView();
  assert('自定义协议：目录写绝对路径也行', await settles(abs.webContents.loadURL('nacre-abs://local/index.html')), '兑现');

  // ---- 换目录：只影响之后建的 ----
  protocol.serveDirectory('nacre-swap', dir);
  const before = new WebView();
  await settles(before.webContents.loadURL('nacre-swap://local/index.html'));
  protocol.serveDirectory('nacre-swap', 'JS/assets/web');
  const after = new WebView();
  await settles(after.webContents.loadURL('nacre-swap://local/index.html'));
  const fromCheck = "fetch('/data.json').then((r) => r.json()).then((d) => d.from === 'web-protocol')";
  assert('自定义协议：换目录之前建的网页还用原来的目录', await before.webContents.executeJavaScript(fromCheck), true);
  assert('自定义协议：换目录之后建的网页用新的目录', await after.webContents.executeJavaScript(fromCheck), false);

  // ---- unhandle ----
  protocol.unhandle('nacre-test');
  assert('自定义协议：unhandle 之后 isProtocolHandled 是 false', protocol.isProtocolHandled('nacre-test'), false);
  assert('自定义协议：unhandle 之前建的网页照旧能取文件',
         await contents.executeJavaScript("fetch('/data.json').then((r) => r.status)"), 200);
  const late = new WebView();
  assert('自定义协议：unhandle 之后建的网页加载不了', await settles(late.webContents.loadURL('nacre-test://local/index.html')), '拒绝');

  // ---- 分区 ----
  const partitioned = session.fromPartition('nacre-protocol-test');
  partitioned.protocol.serveDirectory('nacre-part', dir);
  assert('自定义协议：只注册在别的分区，默认分区不认', protocol.isProtocolHandled('nacre-part'), false);
  const plain = new WebView();
  assert('自定义协议：默认分区的网页加载不了别的分区的协议',
         await settles(plain.webContents.loadURL('nacre-part://local/index.html')), '拒绝');
  const inPartition = new WebView({ webPreferences: { partition: 'nacre-protocol-test' } });
  assert('自定义协议：那个分区的网页加载得了',
         await settles(inPartition.webContents.loadURL('nacre-part://local/index.html')), '兑现');

  protocol.unhandle('nacre-abs');
  protocol.unhandle('nacre-swap');
  partitioned.protocol.unhandle('nacre-part');
  web.removeFromSuperview();
}
