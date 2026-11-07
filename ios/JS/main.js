console.log('hello world');

// —— 以下是第 0 步的临时验收用例，验证通过后删除，只保留上面一行 ——
// 每行后面的注释是预期输出。

// 审阅问题 2：console 按类型分发，并且永不向 JS 抛异常
console.log(undefined, null, true, false);        // undefined null true false
console.log(0, -0, 1.5, NaN, Infinity, -1e21);    // 0 -0 1.5 NaN Infinity -1e+21
console.log(42n);                                 // 42n
console.log('裸字符串不加引号');                     // 裸字符串不加引号
console.log(Symbol('x'), Symbol());               // Symbol(x) Symbol()
console.log(function foo() {}, () => {});         // [Function: foo] [Function (anonymous)]
console.log([1, 'two', null]);                    // [1,"two",null]
console.log({ a: 1 });                            // {"a":1}
console.log(new Error('一个错误'));                 // Error: 一个错误 加调用栈

// 对象有 toString 也走 JSON.stringify（函数属性被跳过），toString 根本不会被调用
console.log({ toString() { throw new Error('boom'); } });   // {}

// getter 抛异常：JSON.stringify 失败，兜底到 Object.prototype.toString
console.log({ get a() { throw new Error('boom'); } });      // [object Object]

// 循环引用：JSON.stringify 失败，同样兜底
const circular = {};
circular.self = circular;
console.log(circular);                                      // [object Object]

// 兜底的字符串转换本身也抛异常：循环引用 + toString 抛异常。
// v8::String::Utf8Value 的构造函数内部自带 TryCatch，异常在那里就被吞掉了，
// 我们拿到的是空指针，所以打 <unprintable> 而不是 <throws on toString>。
const hostile = { toString() { throw new Error('boom'); } };
hostile.self = hostile;
console.log(hostile);                                       // <unprintable>

console.log('console 用例执行完毕，说明前面一条都没有抛异常');

// 审阅问题 3：未处理的拒绝要报出来，已处理的不报
Promise.reject(new Error('这条应该被报告为未处理的拒绝'));
Promise.reject(new Error('这条不应该被报告')).catch(() => {
  console.log('已处理的拒绝：catch 正常执行');
});

console.log('globalThis', Object.keys(globalThis))
console.log('typeof Date', typeof Date)
console.log('typeof Intl', typeof Intl)
// ===== 第 1 步：EventTarget 和 application 的验收用例 =====

console.log('--- 全局类型 ---');
console.log('EventTarget', typeof EventTarget, '| Event', typeof Event,
            '| Application', typeof Application, '| application', typeof application);
console.log('application instanceof EventTarget =', application instanceof EventTarget);

console.log('--- 原生桥不应该暴露给用户代码 ---');
console.log('typeof __nacre_native =', typeof __nacre_native);
console.log('globalThis 上还有吗 =', '__nacre_native' in globalThis);
console.log('能从属性名找到吗 =',
            Object.getOwnPropertyNames(globalThis).some(n => n.includes('nacre')));

console.log('--- 单例保护 ---');
try { new Application(); console.log('✗ 居然构造成功了'); }
catch (e) { console.log('✓', e.constructor.name + ':', e.message); }

console.log('--- Info.plist ---');
console.log('bundleIdentifier =', application.bundleIdentifier);
console.log('version =', application.version, '| build =', application.build);
console.log('info 的键数 =', Object.keys(application.info).length);
console.log('info 的全部键 =', Object.keys(application.info).sort().join(' '));
console.log('MinimumOSVersion =', application.info.MinimumOSVersion);
console.log('info 已冻结 =', Object.isFrozen(application.info),
            '| 嵌套也冻结 =', Object.isFrozen(application.info.UIApplicationSceneManifest));

console.log('--- 多场景：声明值 vs 实际能力 ---');
console.log('声明值 =', application.info.UIApplicationSceneManifest.UIApplicationSupportsMultipleScenes);
console.log('实际能力 =', application.supportsMultipleScenes);

console.log('--- 运行状态 ---');
console.log('state =', application.state);

console.log('--- EventTarget 语义 ---');
let 次数 = 0;
const 监听器 = () => { 次数++; };
application.addEventListener('自测', 监听器);
application.addEventListener('自测', 监听器);          // 重复注册应被忽略
application.dispatchEvent(new Event('自测'));
console.log('重复注册只触发一次 =', 次数 === 1);

application.removeEventListener('自测', 监听器);
application.dispatchEvent(new Event('自测'));
console.log('移除后不再触发 =', 次数 === 1);

let once次数 = 0;
application.addEventListener('一次性', () => { once次数++; }, { once: true });
application.dispatchEvent(new Event('一次性'));
application.dispatchEvent(new Event('一次性'));
console.log('once 只触发一次 =', once次数 === 1);

application.addEventListener('抛异常', () => { throw new Error('监听器炸了'); });
application.addEventListener('抛异常', () => console.log('✓ 前一个监听器抛异常不影响后续'));
application.dispatchEvent(new Event('抛异常'));

const 可取消 = new Event('可取消', { cancelable: true });
application.addEventListener('可取消', (e) => e.preventDefault());
console.log('JS 自己派发时 preventDefault 生效，dispatchEvent 返回 =',
            application.dispatchEvent(可取消));

const 不可取消 = new Event('不可取消');
application.addEventListener('不可取消', (e) => e.preventDefault());
console.log('cancelable=false 时静默失效，返回 =',
            application.dispatchEvent(不可取消));

console.log('--- 等待原生事件 ---');
console.log('在模拟器的设备菜单里选 Simulate Memory Warning 触发');
application.addEventListener('memorywarning', (e) => {
  console.log('✓ 收到原生事件:', e.type, '| target 是 application =', e.target === application,
              '| cancelable =', e.cancelable);
  // 顺便验证 state 会随通知更新：启动时是 background，场景激活后应该变成 active
  console.log('✓ 此刻 application.state =', application.state, '（启动时是 background）');
});

// ===== 全局错误出口的验收用例 =====

console.log('--- unhandledrejection ---');
application.addEventListener('unhandledrejection', (e) => {
  const msg = e.reason && e.reason.message;
  console.log('✓ 收到 unhandledrejection | reason =', msg,
              '| promise 是 Promise =', e.promise instanceof Promise,
              '| cancelable =', e.cancelable);
  if (String(msg).includes('要抑制')) {
    e.preventDefault();
    console.log('  → 已 preventDefault，下面不该再出现这条的默认日志');
  }
});
Promise.reject(new Error('这条不抑制，默认日志应该还在'));
Promise.reject(new Error('这条要抑制默认日志'));

console.log('--- error ---');
application.addEventListener('error', (e) => {
  console.log('✓ 收到 error | message =', e.message, '| filename =', e.filename,
              '| lineno =', e.lineno, '| cancelable =', e.cancelable);
  console.log('  error 是 Error 实例 =', e.error instanceof Error);
  e.preventDefault();
  console.log('  → 已 preventDefault，不该再出现默认的 Uncaught 日志');
});


// ===== 补充能力的验收用例 =====

console.log('--- 新增的环境属性 ---');
console.log('protectedDataAvailable =', application.protectedDataAvailable);
console.log('layoutDirection =', application.layoutDirection);
console.log('contentSizeCategory =', application.contentSizeCategory);
console.log('backgroundRefreshStatus =', application.backgroundRefreshStatus);
console.log('prefersReducedResourceUsage =', application.prefersReducedResourceUsage);

console.log('--- idleTimerDisabled 读写 ---');
console.log('写之前 =', application.idleTimerDisabled);
application.idleTimerDisabled = true;
console.log('刚写完立刻读 =', application.idleTimerDisabled, '（JS 已在主线程，写入同步生效，应该是 true）');

console.log('--- openURL 返回 Promise ---');
// 故意用一个没有 App 注册的 scheme：能走完整条链路（NSURL 合法 → UIKit 真的
// 去打开 → 失败），但不会把 App 切走，否则每次截图验证都要手动切回来
const p1 = application.openURL('nacre-nonexistent-scheme://test');
console.log('返回值是 Promise =', p1 instanceof Promise);
p1.then((ok) => {
  console.log('✓ openURL 兑现 =', ok, '（没有 App 注册这个 scheme，预期 false）',
              '| 此刻 idleTimerDisabled =', application.idleTimerDisabled);
  return application.openURL('这不是一个合法 URL::::');
}).then((ok) => {
  console.log('✓ 非法 URL 兑现为 =', ok);
});


// ===== 前后台事件的验收用例（把 App 切后台再切回来）=====
for (const type of ['active', 'inactive', 'background', 'foreground']) {
  application.addEventListener(type, (e) => {
    // 事件到达时环境快照应该已经更新，所以 state 读到的是新值
    console.log('✓ 生命周期事件:', e.type, '| 此刻 state =', application.state);
  });
}
console.log('--- 已监听 active / inactive / background / foreground ---');


// ===== 原生对象包装 + UIWindowScene 的验收用例 =====

console.log('--- UIWindowScene 类 ---');
console.log('typeof UIWindowScene =', typeof UIWindowScene);
try { new UIWindowScene(); console.log('✗ 居然构造成功了'); }
catch (e) { console.log('✓ 不可构造:', e.constructor.name + ':', e.message); }

console.log('--- 启动时 scenes 应该是空的 ---');
console.log('application.scenes.length =', application.scenes.length,
            '（场景在 didFinishLaunching 之后才接入）');

application.addEventListener('sceneconnect', (e) => {
  const scene = e.scene;
  console.log('✓ 收到 sceneconnect');
  console.log('  scene instanceof UIWindowScene =', scene instanceof UIWindowScene);
  console.log('  scene instanceof EventTarget   =', scene instanceof EventTarget);
  console.log('  activationState =', scene.activationState);

  // 身份一致：同一个原生对象必须返回同一个 JS 包装
  const fromList = application.scenes[0];
  console.log('  === application.scenes[0] =', scene === fromList);

  // 身份一致的实际意义：挂在包装上的自定义属性要能读回来
  scene.我的数据 = { 页面: '首页' };
  console.log('  自定义属性能从另一处读回 =',
              application.scenes[0].我的数据?.页面 === '首页');

  console.log('  再取一次还是同一个 =', application.scenes[0] === fromList);

  console.log('  --- session ---');
  const session = scene.session;
  console.log('  session instanceof UISceneSession =', session instanceof UISceneSession);
  console.log('  role =', session.role);
  console.log('  persistentIdentifier =', session.persistentIdentifier);
  console.log('  session 身份也一致 =', scene.session === session);

  console.log('  --- session.userInfo 往返 ---');
  console.log('  初始值 =', JSON.stringify(session.userInfo));
  session.userInfo = { 类型: '收件箱', 数量: 42, 已读: true, 列表: [1, 2] };
  console.log('  写入后读回 =', JSON.stringify(session.userInfo));
  try {
    session.userInfo = { 有个空值: null };
    console.log('  含 null 写入后读回 =', JSON.stringify(session.userInfo),
                '（plist 不接受 NSNull，看会不会出问题）');
  } catch (e) {
    console.log('  ✗ 含 null 写入抛异常:', e.message);
  }
  session.userInfo = null;
  console.log('  置空后 =', JSON.stringify(session.userInfo));

  console.log('  --- 可读写属性 ---');
  console.log('  isFullScreen =', scene.isFullScreen);
  console.log('  title 原值 =', JSON.stringify(scene.title));
  scene.title = '来自 JS 的标题';
  console.log('  写入后读回 =', JSON.stringify(scene.title));
  scene.subtitle = '副标题';
  console.log('  subtitle =', JSON.stringify(scene.subtitle));

  console.log('  --- 场景级生命周期事件（按 HOME 再切回来触发）---');
  for (const type of ['active', 'inactive', 'foreground', 'background']) {
    scene.addEventListener(type, (ev) => {
      console.log('✓ 场景事件:', ev.type, '| activationState =', scene.activationState,
                  '| target 是这个场景 =', ev.target === scene);
    });
  }

  console.log('  --- 场景级 openURL ---');
  scene.openURL('nacre-nonexistent-scheme://test').then((ok) => {
    console.log('✓ scene.openURL 兑现 =', ok, '（同样不会切走 App）');
  });
});

// ===== 由 JS 创建窗口和根页面 =====
// 必须保持引用：包装对象被 GC 后运行时会 release，原生 window 可能被释放
let mainWindow = null;

application.addEventListener('sceneconnect', (e) => {
  console.log('--- JS 创建窗口 ---');
  const win = new UIWindow(e.scene);
  console.log('✓ new UIWindow(scene) 成功');
  console.log('  instanceof UIWindow =', win instanceof UIWindow,
              '| instanceof UIView =', win instanceof UIView,
              '| instanceof UIResponder =', win instanceof UIResponder);
  console.log('  windowScene === 传进去的 scene =', win.windowScene === e.scene);
  console.log('  windowLevel =', win.windowLevel, '| isKeyWindow =', win.isKeyWindow);

  try { new UIWindow(); console.log('  ✗ 无参构造居然成功了'); }
  catch (err) { console.log('  ✓ 无参构造被拒:', err.message); }

  const vc = new UIViewController();
  console.log('  new UIViewController() 成功, instanceof =', vc instanceof UIViewController);
  win.rootViewController = vc;
  console.log('  rootViewController 写入后读回是同一个 =', win.rootViewController === vc);

  win.makeKeyAndVisible();
  console.log('  makeKeyAndVisible 后 isKeyWindow =', win.isKeyWindow);
  console.log('  scene.windows.length =', e.scene.windows ? e.scene.windows.length : '(未暴露)');

  mainWindow = win;
  console.log('✓ 界面已由 JS 创建，屏幕应该不再是黑的');
});

application.addEventListener('scenedisconnect', (e) => {
  console.log('✓ 收到 scenedisconnect, scene =', e.scene instanceof UIWindowScene);
});

console.log('--- 以下故意抛出未捕获异常，main.js 会被标记为 failed，这是预期的 ---');
throw new Error('故意抛的未捕获异常');
