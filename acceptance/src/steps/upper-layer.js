// 上层的类不继承 NSObject。
//
// NSObject 是底层的：iOS 的类层级照实映射过来。我们自己定义的上层 API（Web 标准的
// WebSocket，照 Electron 的 WebContents / Session，application 上的那几个对象）
// 不该带着 ObjC 的概念：会发事件的直接继承 EventTarget，不发事件的不继承任何类。
// 底层的类照旧继承 NSObject。

/** @param {() => void} fn */
function thrown(fn) {
  try {
    fn();
    return '没抛';
  } catch (err) {
    return err instanceof Error ? err.name : String(err);
  }
}

/** @param {import("../main.js").StepContext} ctx */
export function stepUpperLayer(ctx) {
  const { assert } = ctx;
  console.log('--- 上层的类不继承 NSObject ---');
  const web = new WebView();
  const socket = new WebSocket('wss://echo.websocket.org');
  socket.close();
  // 会发事件的：直接继承 EventTarget
  /** @type {[string, Function, unknown][]} */
  const withEvents = [
    ['WebSocket', WebSocket, socket],
    ['Network', Network, application.network],
    ['WebContents', WebContents, web.webContents],
  ];
  for (const [name, cls, instance] of withEvents) {
    assert('上层：' + name + ' 的父类是 EventTarget',
           Object.getPrototypeOf(cls.prototype) === EventTarget.prototype, true);
    assert('上层：' + name + ' 的实例不是 NSObject', instance instanceof NSObject, false);
    assert('上层：' + name + ' 的实例是 EventTarget', instance instanceof EventTarget, true);
  }
  // 不发事件的：不继承任何类，和 Web 的 Storage、Crypto 一样
  /** @type {[string, Function, unknown][]} */
  const withoutEvents = [
    ['FileSystem', FileSystem, application.fileSystem],
    ['Keychain', Keychain, application.keychain],
    ['NativeModules', NativeModules, application.nativeModules],
    ['Session', Session, web.webContents.session],
  ];
  for (const [name, cls, instance] of withoutEvents) {
    assert('上层：' + name + ' 不继承任何类',
           Object.getPrototypeOf(cls.prototype) === Object.prototype, true);
    assert('上层：' + name + ' 的实例不是 NSObject', instance instanceof NSObject, false);
    assert('上层：' + name + ' 的实例不是 EventTarget', instance instanceof EventTarget, false);
    assert('上层：' + name + ' 没有 addEventListener',
           typeof /** @type {any} */ (instance).addEventListener, 'undefined');
  }
  // 原生类不许继承：原来在 NSObject 的构造函数里拦，WebSocket 不再经过它，要自己拦
  class MySocket extends WebSocket {}
  assert('上层：继承 WebSocket 在 new 时抛', thrown(() => new MySocket('wss://echo.websocket.org')), 'TypeError');
  // 底层照旧
  assert('底层：UIView 还是 NSObject', new UIView() instanceof NSObject, true);
  assert('底层：NSUserDefaults（application.storage）还是 NSObject', application.storage instanceof NSObject, true);
}
