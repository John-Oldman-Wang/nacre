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
// @ts-expect-error 对象字面量上加属性
hostile.self = hostile;
console.log(hostile);                                       // <unprintable>

console.log('console 用例执行完毕，说明前面一条都没有抛异常');

// 审阅问题 3：未处理的拒绝要报出来，已处理的不报
Promise.reject(new Error('这条应该被报告为未处理的拒绝'));
Promise.reject(new Error('这条不应该被报告')).catch(() => {
  console.log('已处理的拒绝：catch 正常执行');
});

// 内置属性都是 non-enumerable，Object.keys 看不见，要用 getOwnPropertyNames。
// 这份清单是 types/ 里 lib 配置的依据：运行时实际有什么，类型定义就声明什么。
console.log('globalThis 的全部属性 =',
            Object.getOwnPropertyNames(globalThis).sort().join(' '));
console.log('这些不存在 =',
            ['setTimeout', 'setInterval', 'queueMicrotask', 'Intl', 'fetch', 'URL',
             'TextEncoder', 'structuredClone', 'WebAssembly', 'SharedArrayBuffer']
              .filter(n => !(n in globalThis)).join(' '));
// ===== 第 1 步：EventTarget 和 application 的验收用例 =====

console.log('--- 全局类型 ---');
console.log('EventTarget', typeof EventTarget, '| Event', typeof Event,
            '| Application', typeof Application, '| application', typeof application);
console.log('application instanceof EventTarget =', application instanceof EventTarget);

console.log('--- 原生桥不应该暴露给用户代码 ---');
// @ts-expect-error 原生桥故意不声明在类型里，用户代码不该碰它
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
// info 是 Info.plist 的原样内容，运行时不知道里面长什么样，所以是 unknown。
// 取嵌套字段要自己断言——这正是类型定义该有的诚实。
const manifest = /** @type {any} */ (application.info.UIApplicationSceneManifest);
console.log('声明值 =', manifest.UIApplicationSupportsMultipleScenes);
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
  // reason 是 unknown：JS 允许拒绝任何值，不保证是 Error
  const reason = /** @type {any} */ (e.reason);
  const msg = reason && reason.message;
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
// @ts-expect-error 场景由系统创建，不可直接构造
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
  // @ts-expect-error 往原生对象上挂自定义属性，运行时允许（见 project.md 的 TODO）
  scene.我的数据 = { 页面: '首页' };
  console.log('  自定义属性能从另一处读回 =',
              /** @type {any} */ (application.scenes[0]).我的数据?.页面 === '首页');

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

  console.log('  --- 延迟创建：不传 scene ---');
  const lazy = new UIWindow();
  console.log('  无参构造成功，windowScene =', lazy.windowScene, '（还没连上）');
  try { lazy.makeKeyAndVisible(); console.log('  ✗ 未连接就能调方法'); }
  catch (err) { console.log('  ✓ 未连接时调方法被拒:', err.message); }
  lazy.windowScene = e.scene;
  console.log('  赋值 windowScene 后原生对象才创建，isKeyWindow =', lazy.isKeyWindow);
  console.log('  windowScene === scene =', lazy.windowScene === e.scene);

  const vc = new UIViewController();
  console.log('  new UIViewController() 成功, instanceof =', vc instanceof UIViewController);
  win.rootViewController = vc;
  console.log('  rootViewController 写入后读回是同一个 =', win.rootViewController === vc);

  // isKeyWindow / isHidden 的变化通知。监听器要在 makeKeyAndVisible 之前
  // 注册，否则事件已经发过了
  for (const type of ['becomekey', 'resignkey', 'becomevisible', 'becomehidden']) {
    win.addEventListener(type, (e) => {
      console.log('✓ 窗口事件:', e.type,
                  '| isKeyWindow =', win.isKeyWindow,
                  '| isHidden =', win.isHidden,
                  '| target 是这个窗口 =', e.target === win);
    });
  }

  win.makeKeyAndVisible();
  console.log('  makeKeyAndVisible 后 isKeyWindow =', win.isKeyWindow);
  // UIWindowScene.windows 还没暴露（ObjC 里有，我们没做），所以这里没得看

  console.log('  --- UIColor：类级属性 ---');
  const bg = UIColor.systemBackgroundColor;
  console.log('  UIColor.systemBackgroundColor instanceof UIColor =', bg instanceof UIColor,
              '| instanceof NSObject =', bg instanceof NSObject);
  console.log('  两次取同一个常量是同一个对象 =', bg === UIColor.systemBackgroundColor);
  console.log('  不同常量是不同对象 =', bg !== UIColor.labelColor);
  // @ts-expect-error 没有这个颜色常量
  console.log('  不存在的颜色 =', UIColor.nosuchColor);
  // @ts-expect-error UIColor 不可直接构造
  try { new UIColor(); console.log('  ✗ UIColor 居然能构造'); }
  catch (err) { console.log('  ✓ UIColor 不可直接构造:', err.message); }

  vc.view.backgroundColor = UIColor.systemBackgroundColor;
  console.log('  写入后读回是同一个 =',
              vc.view.backgroundColor === UIColor.systemBackgroundColor);
  vc.view.backgroundColor = null;
  console.log('  置 null 后读回 =', vc.view.backgroundColor);
  vc.view.backgroundColor = UIColor.systemBackgroundColor;
  console.log('  最终底色 = systemBackgroundColor（跟随深色模式）');

  console.log('  --- 结构体 ---');
  const r = new CGRect(10, 20, 100, 50);
  console.log('  ' + r, '| origin =', '' + r.origin, '| size =', '' + r.size);
  console.log('  origin / size 不参与 JSON =', JSON.stringify(r));
  // @ts-expect-error 结构体字段只读
  try { r.x = 999; console.log('  ✗ 结构体居然能改'); }
  catch (err) { console.log('  ✓ 改结构体被拒:', err.message); }
  // @ts-expect-error 缺 height，结构体字段要齐
  try { vc.view.frame = { x: 0, y: 0, width: 10 }; console.log('  ✗ 缺字段居然通过'); }
  catch (err) { console.log('  ✓ 缺字段被拒:', err.message); }

  console.log('  --- UIView 的几何 ---');
  console.log('  rootView.frame =', '' + vc.view.frame);
  console.log('  rootView.bounds =', '' + vc.view.bounds);
  console.log('  rootView.center =', '' + vc.view.center);
  console.log('  safeAreaInsets =', '' + vc.view.safeAreaInsets);

  console.log('  --- 建子视图 ---');
  const box = new UIView();
  console.log('  new UIView() 成功, instanceof UIView =', box instanceof UIView,
              '| instanceof UIResponder =', box instanceof UIResponder);
  box.frame = new CGRect(40, 120, 200, 120);
  setInterval(() => {
    box.frame = new CGRect(box.frame.x, box.frame.y + 1, box.frame.width, box.frame.height)
  } , 16)
  box.backgroundColor = UIColor.systemIndigoColor;
  console.log('  写入 frame 后读回 =', '' + box.frame);
  console.log('  写入时用普通对象也行：');
  const box2 = new UIView();
  box2.frame = { x: 60, y: 270, width: 160, height: 80 };
  box2.backgroundColor = UIColor.systemTealColor;
  box2.alpha = 0.6;
  console.log('    box2.frame =', '' + box2.frame, '| alpha =', box2.alpha);

  console.log('  --- 层级 ---');
  console.log('  加之前 superview =', box.superview, '| window =', box.window);
  vc.view.addSubview(box);
  vc.view.addSubview(box2);
  console.log('  addSubview 之后 superview === rootView =', box.superview === vc.view);
  console.log('  box.window === win =', box.window === win);
  console.log('  rootView.subviews.length =', vc.view.subviews.length);
  console.log('  subviews[0] === box =', vc.view.subviews[0] === box);
  console.log('  isDescendantOfView(rootView) =', box.isDescendantOfView(vc.view));

  box.tag = 42;
  console.log('  viewWithTag(42) === box =', vc.view.viewWithTag(42) === box);
  console.log('  viewWithTag(99) =', vc.view.viewWithTag(99));

  console.log('  --- insertSubview 的 options ---');
  const box3 = new UIView();
  box3.frame = new CGRect(100, 170, 120, 120);
  box3.backgroundColor = UIColor.systemOrangeColor;
  vc.view.insertSubview(box3, { aboveSubview: box });
  console.log('  insertSubview(aboveSubview) 后 subviews.length =',
              vc.view.subviews.length);
  console.log('  box3 在 box 之后 =',
              vc.view.subviews.indexOf(box3) > vc.view.subviews.indexOf(box));
  // @ts-expect-error options 必须指明插到哪
  try { vc.view.insertSubview(box3, {}); console.log('  ✗ 空 options 居然通过'); }
  catch (err) { console.log('  ✓ 空 options 被拒:', err.message); }

  console.log('  --- 坐标转换 ---');
  console.log('  box 的原点转到 rootView =',
              '' + box.convertPoint(new CGPoint(0, 0), { toView: vc.view }));
  console.log('  sizeThatFits({200,200}) =',
              '' + box.sizeThatFits(new CGSize(200, 200)));

  console.log('  --- 移除 ---');
  const tmp = new UIView();
  vc.view.addSubview(tmp);
  const before = vc.view.subviews.length;
  tmp.removeFromSuperview();
  console.log('  removeFromSuperview:', before, '→', vc.view.subviews.length,
              '| superview =', tmp.superview);

  console.log('  --- 枚举：字符串 ---');
  box.contentMode = 'scaleAspectFit';
  console.log('  contentMode 写入后读回 =', box.contentMode);
  // @ts-expect-error 'cover' 不是 UIViewContentMode
  try { box.contentMode = 'cover'; console.log('  ✗ 瞎写的枚举值居然通过'); }
  catch (err) { console.log('  ✓ 认不出的枚举值被拒:', err.message); }
  // 已知缺口：属性名拼错了不报错。JS 包装对象是可扩展的，赋值就在 JS
  // 对象上挂了个普通属性，根本不走桥，原生层那句「没有这个可写属性」
  // 现在触发不到
  // @ts-expect-error 这正是下面说的缺口：运行时不拦，类型检查拦得住
  box.noSuchPropertyOops = 1;
  // @ts-expect-error 同上
  console.log('  属性名拼错 =', box.noSuchPropertyOops,
              '← 悄悄挂在 JS 对象上了，没到原生层（已知缺口）');
  console.log('  普通 UIView 的 intrinsicContentSize =',
              '' + box.intrinsicContentSize, '（-1 表示没有固有尺寸）');

  console.log('  --- 严格模式 ---');
  // 只读属性：iOS 层就是 readonly，写不进去是对的，但不能静默
  try {
    // @ts-expect-error superview 只读
    box.superview = null;
    console.log('  ✗ 写只读属性居然没动静');
  } catch (err) {
    console.log('  ✓ 写只读属性被拒:', err.constructor.name);
  }
  // 结构体字段：这条本来就抛（自带 throwing setter），严格模式下照样抛
  // @ts-expect-error 结构体字段只读
  try { box.frame.x = 10; console.log('  ✗ 改结构体字段居然通过'); }
  catch (err) { console.log('  ✓ 改结构体字段被拒:', err.message); }
  // 未声明的赋值：非严格模式下会悄悄建一个全局
  try {
    // @ts-expect-error 未声明的变量
    undeclaredOops = 1;
    console.log('  ✗ 未声明的赋值建出了 globalThis.undeclaredOops =',
                /** @type {any} */ (globalThis).undeclaredOops);
  } catch (err) {
    console.log('  ✓ 未声明的赋值被拒:', err.constructor.name);
  }

  console.log('  --- UIFont ---');
  const f17 = UIFont.systemFontOfSize(17);
  console.log('  systemFontOfSize(17):', f17.fontName, '| pointSize =', f17.pointSize,
              '| lineHeight =', f17.lineHeight.toFixed(2));
  const bold = UIFont.systemFontOfSize(28, { weight: 'bold' });
  console.log('  systemFontOfSize(28, {weight:bold}):', bold.fontName);
  const body = UIFont.preferredFontForTextStyle('body');
  console.log('  preferredFontForTextStyle(body): pointSize =', body.pointSize,
              '（跟随系统文字大小设置）');
  console.log('  同一个 systemFontOfSize(17) 取两次 ===',
              UIFont.systemFontOfSize(17) === f17);
  // @ts-expect-error UIFont 不可直接构造，走类方法
  try { new UIFont(); console.log('  ✗ UIFont 居然能构造'); }
  catch (err) { console.log('  ✓ UIFont 不可直接构造:', err.message); }

  // 参数位的枚举和属性位一样抛，不静默返回 null、也不退回默认值
  try {
    // @ts-expect-error 'extrabold' 不是 UIFontWeight
    UIFont.systemFontOfSize(17, { weight: 'extrabold' });
    console.log('  ✗ 瞎写的字重居然通过');
  } catch (err) {
    console.log('  ✓ 认不出的字重被拒:', err.constructor.name + ':', err.message);
  }
  try {
    // @ts-expect-error 'subtitle' 不是 UIFontTextStyle
    UIFont.preferredFontForTextStyle('subtitle');
    console.log('  ✗ 瞎写的文本样式居然通过');
  } catch (err) {
    console.log('  ✓ 认不出的文本样式被拒:', err.message);
  }
  // 「没有这个东西」和「你问错了」要分得开：找不到的字体名是合法答案
  console.log('  找不到的字体名 =', UIFont.fontWithName('NoSuchFont', { size: 17 }),
              '← 合法答案，不是错误');

  console.log('  --- UILabel ---');
  const title = new UILabel();
  console.log('  instanceof UILabel =', title instanceof UILabel,
              '| instanceof UIView =', title instanceof UIView);
  title.text = 'Hello, Nacre';
  const titleFont = UIFont.systemFontOfSize(34, { weight: 'bold' });
  title.font = titleFont;
  title.textColor = UIColor.labelColor;
  title.textAlignment = 'center';
  console.log('  text =', JSON.stringify(title.text),
              '| textAlignment =', title.textAlignment);
  console.log('  font 读回 === 刚设进去的那个 =', title.font === titleFont);

  // 固有尺寸：文字自己知道该多大。这就是同步读布局
  const fit = title.intrinsicContentSize;
  console.log('  intrinsicContentSize =', '' + fit, '← 文字自己算出来的');
  console.log('  sizeThatFits({402,999}) =',
              '' + title.sizeThatFits(new CGSize(402, 999)));

  const safe = vc.view.safeAreaInsets;
  title.frame = new CGRect(0, safe.top + 16, vc.view.bounds.width, fit.height);
  vc.view.addSubview(title);

  console.log('  --- 多行 + 截断 ---');
  const body2 = new UILabel();
  // 故意写长，确保不限行数时会超过两行，行数限制才测得出来
  body2.text = '这是一段刻意写得很长的说明文字，用来验证多行排版、行数限制和' +
               '尾部截断是不是真的生效了。如果行数限制没起作用，不限行数时' +
               '算出来的高度就会和限制两行时一样，那这个用例就白写了。';
  body2.font = UIFont.systemFontOfSize(15);
  body2.textColor = UIColor.secondaryLabelColor;
  body2.lineBreakMode = 'byTruncatingTail';
  body2.textAlignment = 'natural';
  const w = vc.view.bounds.width - 48;
  body2.preferredMaxLayoutWidth = w;

  body2.numberOfLines = 0;
  const freeFit = body2.sizeThatFits(new CGSize(w, 9999));
  body2.numberOfLines = 2;
  const bodyFit = body2.sizeThatFits(new CGSize(w, 9999));
  console.log('  numberOfLines = 2 | lineBreakMode =', body2.lineBreakMode);
  console.log('  限两行 =', '' + bodyFit, '| 不限行数 =', '' + freeFit);
  console.log('  行数限制生效 =', freeFit.height > bodyFit.height,
              '（不限行数更高）');
  body2.frame = new CGRect(24, 420, w, bodyFit.height);
  vc.view.addSubview(body2);

  console.log('  --- 等宽字体 ---');
  const mono = new UILabel();
  mono.text = '0123456789';
  mono.font = UIFont.monospacedSystemFontOfSize(20, { weight: 'medium' });
  mono.textColor = UIColor.systemTealColor;
  mono.textAlignment = 'center';
  const monoFit = mono.intrinsicContentSize;
  mono.frame = new CGRect(0, 500, vc.view.bounds.width, monoFit.height);
  vc.view.addSubview(mono);
  console.log('  等宽字体 =', mono.font.fontName);

  // 断言要能失败：只打印数值的「用例」给不了任何保证
  /**
   * @param {string} 说明
   * @param {unknown} 实际
   * @param {unknown} 期望
   */
  function 断言(说明, 实际, 期望) {
    const 过了 = String(实际) === String(期望);
    console.log((过了 ? '  ✓ ' : '  ✗ ') + 说明 + ' = ' + 实际 +
                (过了 ? '' : '（期望 ' + 期望 + '）'));
  }

  // ===== URL / URLSearchParams / Headers =====
  console.log('  --- URL ---');
  {
    const u = new URL('https://u:p@EXAMPLE.com:443/a/b/../c?x=1&y=2#f');
    断言('host 小写化且去掉默认端口', u.host, 'example.com');
    断言('点段规范化', u.pathname, '/a/c');
    断言('port 为默认时读出空串', u.port, '');
    断言('protocol 带冒号', u.protocol, 'https:');
    断言('search 带问号', u.search, '?x=1&y=2');
    断言('hash 带井号', u.hash, '#f');
    断言('origin 不含 userinfo', u.origin, 'https://example.com');
    断言('username', u.username, 'u');
    断言('href 能拼回去', u.href, 'https://u:p@example.com/a/c?x=1&y=2#f');

    断言('空路径补成斜杠', new URL('https://a.com').pathname, '/');
    断言('非特殊 scheme 的 origin 是 null', new URL('foo://bar/baz').origin, 'null');
    断言('已编码的不重复编码', new URL('https://a.com/%7Eu').pathname, '/%7Eu');
    断言('空格编码', new URL('https://a.com/a b').pathname, '/a%20b');

    // 没有 base 是这个运行时的硬事实，不是 bug。
    // 注意这里不标 @ts-expect-error：类型上 new URL(string) 完全合法，
    // 它是**运行时**才抛——这正是和浏览器的差异所在，类型系统看不出来。
    try { new URL('/x'); console.log('  ✗ 相对 URL 居然解析成功'); }
    catch (err) { 断言('相对 URL 无 base 时抛', err.constructor.name, 'TypeError'); }
    断言('有 base 就能解析', new URL('/x', 'https://a.com').href, 'https://a.com/x');
    断言('base 下的点段', new URL('../y', 'https://a.com/a/b/c').pathname, '/a/y');
    断言('canParse 不抛', String(URL.canParse('/x')), 'false');
    断言('parse 失败返回 null', String(URL.parse('/x')), 'null');

    const w = new URL('https://a.com/p');
    w.pathname = 'q';           // 不带斜杠也要补上
    w.hash = 'top';             // 不带井号也要补上
    断言('setter 会规范化', w.href, 'https://a.com/q#top');
  }

  console.log('  --- URLSearchParams ---');
  {
    const q = new URLSearchParams('a=1&b=2&a=3');
    断言('get 取第一个', q.get('a'), '1');
    断言('getAll 取全部', q.getAll('a').join(','), '1,3');
    断言('size', q.size, 3);
    q.set('a', '9');
    断言('set 替换首个、删其余、位置不变', q.toString(), 'a=9&b=2');
    q.append('c', '中 文');
    断言('空格编码成加号', q.toString(), 'a=9&b=2&c=%E4%B8%AD+%E6%96%87');
    断言('读回来是解码的', q.get('c'), '中 文');
    q.delete('a');
    断言('delete', q.toString(), 'b=2&c=%E4%B8%AD+%E6%96%87');

    // 和宿主 URL 双向绑定
    const u2 = new URL('https://a.com/?k=1');
    u2.searchParams.append('k2', 'v2');
    断言('改 searchParams，search 跟着变', u2.search, '?k=1&k2=v2');
    u2.search = '?z=9';
    断言('改 search，searchParams 跟着变', u2.searchParams.get('z'), '9');
  }

  console.log('  --- Headers ---');
  {
    const h = new Headers({ 'Content-Type': 'application/json' });
    断言('名字大小写不敏感', h.get('CONTENT-TYPE'), 'application/json');
    h.append('Accept', 'a');
    h.append('accept', 'b');
    断言('同名多值合并', h.get('Accept'), 'a, b');
    h.append('Set-Cookie', 'x=1');
    h.append('Set-Cookie', 'y=2');
    断言('Set-Cookie 不合并', h.getSetCookie().join('|'), 'x=1|y=2');
    断言('迭代按名字排序', [...h.keys()].join(','),
         'accept,content-type,set-cookie,set-cookie');
    h.set('Accept', '只剩这个');
    断言('set 覆盖全部同名', h.get('accept'), '只剩这个');
    h.delete('ACCEPT');
    断言('delete 大小写不敏感', String(h.has('accept')), 'false');
    try { h.set('坏 名字', 'v'); console.log('  ✗ 非法首部名居然通过'); }
    catch (err) { 断言('非法首部名被拒', err.constructor.name, 'TypeError'); }
    try { h.set('X', '值里有\r\n换行'); console.log('  ✗ CRLF 居然通过'); }
    catch (err) { 断言('首部值里的 CRLF 被拒', err.constructor.name, 'TypeError'); }
    断言('首尾空白被去掉', new Headers({ a: '  v  ' }).get('a'), 'v');
  }

  // ===== fetch =====
  // 对着本地测试服务器跑。服务器没起的时候这几条会全红，是预期的。
  (async () => {
    const 根 = 'http://127.0.0.1:8099';
    console.log('  --- fetch ---');
    try {
      const res = await fetch(根 + '/json');
      断言('status', res.status, 200);
      断言('ok', res.ok, true);
      断言('url 是绝对的', res.url, 根 + '/json');
      断言('响应首部大小写不敏感', res.headers.get('CONTENT-TYPE'), 'application/json');
      断言('同名多值合并', res.headers.get('x-multi'), 'one, two');
      const data = await res.json();
      断言('json() 解析出中文', data.hello, '世界');
      断言('json() 解析出数字', data.n, 42);
      断言('body 读过之后 bodyUsed', res.bodyUsed, true);
      try { await res.json(); console.log('  ✗ body 居然能读第二次'); }
      catch (err) { 断言('body 不能读第二次', err.constructor.name, 'TypeError'); }

      const t = await (await fetch(根 + '/text')).text();
      断言('text()', t, '纯文本 body');

      // 404 不是网络错误：fetch 照样兑现，只是 ok 为 false
      const r404 = await fetch(根 + '/404');
      断言('404 不拒绝，只是 ok=false', r404.ok, false);
      断言('404 的 status', r404.status, 404);

      // arrayBuffer 走零拷贝那条路
      const buf = await (await fetch(根 + '/bytes')).arrayBuffer();
      断言('arrayBuffer 是 ArrayBuffer', buf instanceof ArrayBuffer, true);
      断言('arrayBuffer 长度', buf.byteLength, 256);
      const view = new Uint8Array(buf);
      断言('arrayBuffer 内容对得上', view[0] + ',' + view[255], '0,255');

      // POST 带 body 和自定义首部
      const post = await fetch(根 + '/echo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 来自: 'nacre' }),
      });
      const echo = await post.json();
      断言('POST 的 method 到了服务器', echo.method, 'POST');
      断言('POST 的 body 到了服务器', JSON.parse(echo['收到']).来自, 'nacre');
      断言('自定义首部到了服务器', echo.ct, 'application/json');

      // 网络层失败才拒绝
      try {
        await fetch('http://127.0.0.1:1/nope');
        console.log('  ✗ 连不上居然没拒绝');
      } catch (err) {
        断言('连不上时拒绝', err.constructor.name, 'TypeError');
      }
      try { await fetch('/相对路径'); console.log('  ✗ 相对 URL 居然通过'); }
      catch (err) { 断言('相对 URL 被拒（没有 base）', err.constructor.name, 'TypeError'); }

      // 并发：20 个一起发，验证不串行
      const t0 = Date.now();
      const 批 = await Promise.all(
        Array.from({ length: 20 }, () => fetch(根 + '/json').then((r) => r.json())));
      断言('20 个并发请求都成功', 批.every((d) => d.n === 42), true);
      console.log('  ✓ 20 个并发请求耗时', Date.now() - t0, 'ms（串行的话要 20 倍）');
    } catch (err) {
      console.log('  ✗ fetch 用例整体出错:', err && err.message);
    }
  })();

  // ===== 定时器 =====
  console.log('  --- 定时器 ---');

  // 1. 同时到期必须按注册顺序（HTML 规范要求，也是我们自己管堆的理由）
  /** @type {number[]} */ const 顺序 = [];
  for (let i = 1; i <= 5; i++) setTimeout(() => 顺序.push(i), 30);

  // 2. 取消
  let 被取消了 = false;
  const 要取消的 = setTimeout(() => { 被取消了 = true; }, 30);
  clearTimeout(要取消的);
  clearTimeout(要取消的);        // 重复取消不该炸
  clearTimeout(999999);          // 不认识的 id 静默忽略

  // 3. 嵌套不饿死：每一次都该落在不同轮唤醒上
  let 嵌套次数 = 0;
  const 嵌套开始 = Date.now();
  setTimeout(function 再来一次() {
    if (++嵌套次数 < 5) setTimeout(再来一次, 0);
  }, 0);

  // 4. setInterval + clearInterval
  let 重复次数 = 0;
  const 定时 = setInterval(() => {
    if (++重复次数 >= 3) clearInterval(定时);
  }, 10);

  // 5. 宏任务 / 微任务的交错顺序，经典用例
  /** @type {string[]} */ const 交错 = [];
  setTimeout(() => 交错.push('宏任务'), 0);
  Promise.resolve().then(() => 交错.push('微任务'));
  queueMicrotask(() => 交错.push('queueMicrotask'));
  交错.push('同步');

  // 6. 额外参数透传
  /** @type {string | null} */ let 透传结果 = null;
  setTimeout((a, b) => { 透传结果 = a + b; }, 0, '参数', '透传');

  // 7. 非函数参数要抛
  // @ts-expect-error 第一个参数必须是函数
  try { setTimeout(123, 0); console.log('  ✗ 非函数居然通过'); }
  catch (err) { console.log('  ✓ setTimeout 拒绝非函数:', err.constructor.name); }

  // 8. 未处理拒绝：排在队尾结算，所以 setTimeout 里补的 handler 来得及抑制
  //    这条是「对齐 Chromium」的验收点——日志里不该出现这条的上报
  const 迟到的 = Promise.reject(new Error('这条不该被上报：handler 在 timer 里补上'));
  setTimeout(() => 迟到的.catch(() => {}), 0);

  // 9. 和原生事件的顺序：两者在同一个主队列里，按入队时刻 FIFO
  /** @type {string[]} */ const 混排 = [];
  setTimeout(() => 混排.push('timer'), 0);
  win.addEventListener('becomekey', () => 混排.push('窗口事件'), { once: true });

  // 不用固定延迟汇总：App 启动时主线程很忙（首次布局、字体、首帧渲染），
  // 实测 0ms 的定时器可能等 250ms 才轮到。用轮询等条件齐了再汇总，
  // 既不依赖绝对时间，本身也是一次「定时器确实在推进」的验证。
  /** @param {number} 剩余轮次 */
  function 等齐了再汇总(剩余轮次) {
    const 齐了 = 嵌套次数 >= 5 && 重复次数 >= 3 && 顺序.length >= 5;
    if (!齐了 && 剩余轮次 > 0) {
      setTimeout(() => 等齐了再汇总(剩余轮次 - 1), 20);
      return;
    }
    断言('同时到期按注册顺序', 顺序.join(''), '12345');
    断言('clearTimeout 生效', !被取消了, true);
    断言('嵌套跑满且每次一轮唤醒', 嵌套次数, 5);
    断言('setInterval 被自己的 clearInterval 停住', 重复次数, 3);
    断言('同步 → 微任务 → 宏任务', 交错.join(','),
         '同步,微任务,queueMicrotask,宏任务');
    断言('额外参数透传', 透传结果, '参数透传');
    断言('timer 和原生事件在同一队列', 混排.join(','), '窗口事件,timer');
    console.log('  ✓ 上面不该出现「这条不该被上报」的 Uncaught',
                '（从注册到跑满', Date.now() - 嵌套开始, 'ms，含启动时的主线程繁忙）');
  }
  等齐了再汇总(50);

  mainWindow = win;
  console.log('✓ 屏幕上：三个色块 + 标题 + 两行说明 + 一行等宽数字');
});

application.addEventListener('scenedisconnect', (e) => {
  console.log('✓ 收到 scenedisconnect, scene =', e.scene instanceof UIWindowScene);
});

console.log('--- 以下故意抛出未捕获异常，main.js 会被标记为 failed，这是预期的 ---');
throw new Error('故意抛的未捕获异常');
