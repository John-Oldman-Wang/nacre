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
// 未处理拒绝的结算排在宿主队列尾部（对齐 Chromium），所以 setTimeout 里
// 补上的 handler 来得及抑制上报。日志里不该出现这条。
//
// 这条用例特意放在顶层而不是和 fetch 混在一起：延后结算只保证「晚于当前
// 已排队的任务」，并发网络请求的回调会插进来，那时就成了竞态。
const lateRejection = Promise.reject(new Error('这条不该被上报：handler 在 timer 里补上'));
setTimeout(() => lateRejection.catch(() => {}), 0);

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
let hits = 0;
const listener = () => { hits++; };
application.addEventListener('自测', listener);
application.addEventListener('自测', listener);          // 重复注册应被忽略
application.dispatchEvent(new Event('自测'));
console.log('重复注册只触发一次 =', hits === 1);

application.removeEventListener('自测', listener);
application.dispatchEvent(new Event('自测'));
console.log('移除后不再触发 =', hits === 1);

let onceCount = 0;
application.addEventListener('一次性', () => { onceCount++; }, { once: true });
application.dispatchEvent(new Event('一次性'));
application.dispatchEvent(new Event('一次性'));
console.log('once 只触发一次 =', onceCount === 1);

application.addEventListener('抛异常', () => { throw new Error('监听器炸了'); });
application.addEventListener('抛异常', () => console.log('✓ 前一个监听器抛异常不影响后续'));
application.dispatchEvent(new Event('抛异常'));

const cancelableEvent = new Event('可取消', { cancelable: true });
application.addEventListener('可取消', (e) => e.preventDefault());
console.log('JS 自己派发时 preventDefault 生效，dispatchEvent 返回 =',
            application.dispatchEvent(cancelableEvent));

const plainEvent = new Event('不可取消');
application.addEventListener('不可取消', (e) => e.preventDefault());
console.log('cancelable=false 时静默失效，返回 =',
            application.dispatchEvent(plainEvent));

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
  scene.myData = { 页面: '首页' };
  console.log('  自定义属性能从另一处读回 =',
              /** @type {any} */ (application.scenes[0]).myData?.页面 === '首页');

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
// 这里原来有一个 `let mainWindow`，注释写着「必须保持引用：包装被 GC 后
// 运行时会 release，原生 window 可能被释放」。所有权镜像做好之后这条仪式
// 没有了——场景的包装持有窗口的包装（UIWindowScene.windows 就是原生侧的
// 所有权），而场景由 application 持有。
//
// 故意不再留这个变量：屏幕上还有东西，就说明这条链真的接上了。

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
   * @param {string} label
   * @param {unknown} actual
   * @param {unknown} expected
   */
  function assert(label, actual, expected) {
    const passed = String(actual) === String(expected);
    console.log((passed ? '  ✓ ' : '  ✗ ') + label + ' = ' + actual +
                (passed ? '' : '（期望 ' + expected + '）'));
  }

  // ===== 图片 =====
  console.log('  --- UIImage ---');
  {
    // 1. bundle 里的普通文件。JS/ 是 folder reference，目录结构原样进
    // bundle，所以名字里带路径。实测 imageNamed 认子目录（但不递归搜）。
    const dot = UIImage.imageNamed('JS/assets/dot');
    if (dot === null) {
      console.log('  ✗ JS/assets/dot 没找到');
    } else {
      // size 是**点**：三个文件分别是 10/20/30 像素，读出来都该是 10x10
      assert('size 是点，不随倍率变', dot.size.width + 'x' + dot.size.height, '10x10');
      assert('@2x/@3x 被自动选中（倍率 > 1）', dot.scale > 1, true);
      assert('像素 = size × scale', dot.size.width * dot.scale >= 20, true);
      assert('普通图片不是 symbol', dot.isSymbolImage, false);
      assert('方向默认朝上', dot.imageOrientation, 'up');
      assert('普通图片没有九宫格边距', dot.capInsets.top, 0);
      assert('静态图 duration 为 0', dot.duration, 0);
    }

    // 2. 找不到是**合法答案**，返回 null 而不是抛
    assert('名字不存在返回 null', UIImage.imageNamed('根本没有这张图'), null);
    assert('路径读不到也返回 null',
         UIImage.imageWithContentsOfFile('/nonexistent/x.png'), null);

    // 3. SF Symbols：上千个图标，不占包体积
    const star = UIImage.systemImageNamed('star.fill');
    assert('SF Symbol 拿得到', star !== null, true);
    if (star) {
      assert('isSymbolImage 为真', star.isSymbolImage, true);
      // 实测纠正：SF Symbol 的 renderingMode 是 'automatic'，不是
      // 'alwaysTemplate'。「按 tintColor 上色」是**绘制上下文**决定的，
      // 不写在图片上——automatic 的意思正是「由用的地方决定」。
      assert('symbol 的渲染模式是 automatic', star.renderingMode, 'automatic');
    }

    // 4. 不可变性：这些方法返回新图，原图不动
    if (star) {
      const originalMode = star.imageWithRenderingMode('alwaysOriginal');
      assert('改渲染模式返回新对象', originalMode === star, false);
      assert('新图的渲染模式变了', originalMode.renderingMode, 'alwaysOriginal');
      assert('原图没被改', star.renderingMode, 'automatic');
    }

    // 5. 九宫格：四条边不拉伸，只拉中间。小图铺大容器的正解。
    const frame = UIImage.imageNamed('JS/assets/frame');
    if (frame === null) {
      console.log('  ✗ JS/assets/frame 没找到');
    } else {
      assert('原图没有 capInsets', frame.capInsets.left, 0);
      const stretchable = frame.resizableImage({
        withCapInsets: new UIEdgeInsets(6, 6, 6, 6),
      });
      assert('九宫格边距读得回来', stretchable.capInsets.left, 6);
      // 实测纠正：resizableImageWithCapInsets: 这个单参重载默认是 tile，
      // 要 stretch 得用带 resizingMode 的那个重载显式指定
      assert('单参重载默认平铺', stretchable.resizingMode, 'tile');
      const tiled = frame.resizableImage({
        withCapInsets: new UIEdgeInsets(6, 6, 6, 6),
        resizingMode: 'stretch',
      });
      assert('显式指定 stretch 才拉伸', tiled.resizingMode, 'stretch');
      // 普通对象也认（写入宽、读出窄）
      const fromPlainObject = frame.resizableImage({
        withCapInsets: { top: 2, left: 3, bottom: 4, right: 5 },
      });
      assert('capInsets 收普通对象', fromPlainObject.capInsets.right, 5);
      assert('读出来的是 UIEdgeInsets',
           fromPlainObject.capInsets instanceof UIEdgeInsets, true);
    }

    // 6. 枚举写错要抛，不静默忽略也不退回默认值
    try {
      // @ts-expect-error 'template' 不是合法的渲染模式
      star.imageWithRenderingMode('template');
      console.log('  ✗ 枚举写错居然通过了');
    } catch (err) {
      console.log('  ✓ 渲染模式写错被拒:', err.message);
    }

    // 7. Blob → UIImage：字节全程不进 V8 堆。
    // 这里用手搓的 2x2 PNG，fetch 下来的 Blob 走的是同一条路。
    const pngBytes = new Uint8Array([
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 2,
      0, 0, 0, 2, 8, 6, 0, 0, 0, 114, 182, 13, 36, 0, 0, 0, 17, 73, 68, 65, 84,
      120, 218, 99, 248, 127, 144, 253, 63, 8, 51, 192, 24, 0, 101, 94, 11, 25,
      206, 178, 233, 129, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130,
    ]);
    const blob = new Blob([pngBytes], { type: 'image/png' });
    const fromBytes = UIImage.imageWithData(blob);
    assert('Blob 解得出图', fromBytes !== null, true);
    if (fromBytes) {
      assert('没给 scale 时按 1 算', fromBytes.scale, 1);
      assert('2x2 像素、scale 1 → size 2x2',
           fromBytes.size.width + 'x' + fromBytes.size.height, '2x2');
    }
    const atScale2 = UIImage.imageWithData(blob, { scale: 2 });
    assert('给了 scale 之后 size 减半', atScale2 === null ? '?' : atScale2.size.width, 1);
    assert('不是图片的字节返回 null',
         UIImage.imageWithData(new Blob(['这不是图片'])), null);
  }

  // ===== UIImageView =====
  console.log('  --- UIImageView ---');
  {
    const dotImage = UIImage.imageNamed('JS/assets/dot');
    const iv = new UIImageView();
    assert('UIImageView 是 UIView', iv instanceof UIView, true);
    assert('默认没有图', iv.image, null);

    iv.image = dotImage;
    assert('写进去读回来是同一个对象', iv.image === dotImage, true);

    // 固有尺寸就是图片尺寸——第 3c 步做完 Auto Layout 之后，
    // 「比例对不上」这个问题大半会自己消失
    assert('intrinsicContentSize 等于图片尺寸',
         iv.intrinsicContentSize.width, dotImage === null ? '?' : dotImage.size.width);

    // 小图放进大容器：靠 contentMode，不是 UIImageView 自己的事
    iv.contentMode = 'scaleAspectFit';
    iv.clipsToBounds = true;      // scaleAspectFill 时必须配，否则溢出画到外面
    assert('contentMode 写入生效', iv.contentMode, 'scaleAspectFit');

    const symbol = UIImage.systemImageNamed('star.fill');
    iv.highlightedImage = symbol;
    assert('highlightedImage 读回来', iv.highlightedImage === symbol, true);
    iv.isHighlighted = true;
    assert('isHighlighted 写入生效', iv.isHighlighted, true);
    iv.isHighlighted = false;
    assert('逐帧动画没在跑', iv.isAnimating, false);

    // 上屏：左边原尺寸居中（小图不该被放大），右边等比填满并裁掉溢出
    const centeredView = new UIImageView();
    centeredView.image = dotImage;
    centeredView.contentMode = 'center';
    centeredView.backgroundColor = UIColor.secondarySystemBackgroundColor;
    centeredView.frame = new CGRect(20, 560, 100, 60);
    vc.view.addSubview(centeredView);

    const fillView = new UIImageView();
    fillView.image = dotImage;
    fillView.contentMode = 'scaleAspectFill';
    fillView.clipsToBounds = true;
    fillView.frame = new CGRect(140, 560, 100, 60);
    vc.view.addSubview(fillView);

    // 九宫格铺满：20pt 的边框图拉成 100x60，四角不变形
    const nineSliceView = new UIImageView();
    const frameImage = UIImage.imageNamed('JS/assets/frame');
    if (frameImage) {
      nineSliceView.image = frameImage.resizableImage({
        withCapInsets: new UIEdgeInsets(6, 6, 6, 6),
      });
    }
    nineSliceView.frame = new CGRect(260, 560, 100, 60);
    vc.view.addSubview(nineSliceView);

    // 模板图 + tintColor：同一张 symbol 按颜色重新上色
    const tintedView = new UIImageView();
    tintedView.image = symbol;
    tintedView.tintColor = UIColor.systemPinkColor;
    tintedView.contentMode = 'scaleAspectFit';
    tintedView.frame = new CGRect(20, 630, 60, 40);
    vc.view.addSubview(tintedView);
    assert('tintColor 读回来', tintedView.tintColor === UIColor.systemPinkColor, true);

    // 后台解码：解码默认在绘制时发生（主线程），这个把它挪到后台
    if (dotImage) {
      dotImage.prepareForDisplay().then((ready) => {
        assert('prepareForDisplay 给回一张图', ready !== null, true);
        assert('解好的图尺寸不变',
             ready === null ? '?' : ready.size.width, dotImage.size.width);
      });
      dotImage.prepareThumbnail(new CGSize(5, 5)).then((thumbnail) => {
        assert('prepareThumbnail 给回一张图', thumbnail !== null, true);
      });
    }
  }

  // ===== 真实的网络图片：fetch → Blob → UIImage =====
  //
  // 这是第 6 步（fetch / Blob）的直接收益：字节从 NSURLSession 下来之后
  // 一路留在原生的 NSData 里，变成 UIImage 再上屏，**全程不进 V8 堆**。
  // JS 侧从头到尾只拿着两个句柄。
  const remoteView = new UIImageView();
  remoteView.contentMode = 'scaleAspectFill';
  remoteView.clipsToBounds = true;
  remoteView.backgroundColor = UIColor.secondarySystemBackgroundColor;
  remoteView.frame = new CGRect(100, 630, 160, 110);
  vc.view.addSubview(remoteView);

  (async () => {
    const imageURL = 'https://picsum.photos/200/200?random=1';
    console.log('  --- 网络图片 ---');
    const t0 = Date.now();
    try {
      const res = await fetch(imageURL);
      assert('HTTP 状态', res.ok, true);
      const blob = await res.blob();
      console.log('  ✓ 下载完成', blob.size, '字节，type =', blob.type,
                  '，耗时', Date.now() - t0, 'ms');

      const img = UIImage.imageWithData(blob);
      if (img === null) {
        console.log('  ✗ 字节解不成图片');
        return;
      }
      assert('网络图解出来了', img.size.width + 'x' + img.size.height, '200x200');
      assert('没给 scale，按 1 算', img.scale, 1);

      // 解码挪到后台再上屏。200x200 其实不至于掉帧，但大图必须这么做——
      // 不走这条，解码会发生在第一次绘制时，也就是主线程。
      const ready = await img.prepareForDisplay();
      assert('后台解码后尺寸不变',
           ready === null ? '?' : ready.size.width, 200);
      remoteView.image = ready ?? img;
      console.log('  ✓ 网络图已上屏，全程', Date.now() - t0, 'ms（字节没进过 V8 堆）');
    } catch (err) {
      // 没网就是没网，说清楚而不是装作通过了
      console.log('  ! 网络图片这一段没跑成:', err.message,
                  '（需要能访问 picsum.photos）');
    }
  })();

  // ===== URL / URLSearchParams / Headers =====
  console.log('  --- URL ---');
  {
    const u = new URL('https://u:p@EXAMPLE.com:443/a/b/../c?x=1&y=2#f');
    assert('host 小写化且去掉默认端口', u.host, 'example.com');
    assert('点段规范化', u.pathname, '/a/c');
    assert('port 为默认时读出空串', u.port, '');
    assert('protocol 带冒号', u.protocol, 'https:');
    assert('search 带问号', u.search, '?x=1&y=2');
    assert('hash 带井号', u.hash, '#f');
    assert('origin 不含 userinfo', u.origin, 'https://example.com');
    assert('username', u.username, 'u');
    assert('href 能拼回去', u.href, 'https://u:p@example.com/a/c?x=1&y=2#f');

    assert('空路径补成斜杠', new URL('https://a.com').pathname, '/');
    assert('非特殊 scheme 的 origin 是 null', new URL('foo://bar/baz').origin, 'null');
    assert('已编码的不重复编码', new URL('https://a.com/%7Eu').pathname, '/%7Eu');
    assert('空格编码', new URL('https://a.com/a b').pathname, '/a%20b');

    // 没有 base 是这个运行时的硬事实，不是 bug。
    // 注意这里不标 @ts-expect-error：类型上 new URL(string) 完全合法，
    // 它是**运行时**才抛——这正是和浏览器的差异所在，类型系统看不出来。
    try { new URL('/x'); console.log('  ✗ 相对 URL 居然解析成功'); }
    catch (err) { assert('相对 URL 无 base 时抛', err.constructor.name, 'TypeError'); }
    assert('有 base 就能解析', new URL('/x', 'https://a.com').href, 'https://a.com/x');
    assert('base 下的点段', new URL('../y', 'https://a.com/a/b/c').pathname, '/a/y');
    assert('canParse 不抛', String(URL.canParse('/x')), 'false');
    assert('parse 失败返回 null', String(URL.parse('/x')), 'null');

    const w = new URL('https://a.com/p');
    w.pathname = 'q';           // 不带斜杠也要补上
    w.hash = 'top';             // 不带井号也要补上
    assert('setter 会规范化', w.href, 'https://a.com/q#top');
  }

  console.log('  --- URLSearchParams ---');
  {
    const q = new URLSearchParams('a=1&b=2&a=3');
    assert('get 取第一个', q.get('a'), '1');
    assert('getAll 取全部', q.getAll('a').join(','), '1,3');
    assert('size', q.size, 3);
    q.set('a', '9');
    assert('set 替换首个、删其余、位置不变', q.toString(), 'a=9&b=2');
    q.append('c', '中 文');
    assert('空格编码成加号', q.toString(), 'a=9&b=2&c=%E4%B8%AD+%E6%96%87');
    assert('读回来是解码的', q.get('c'), '中 文');
    q.delete('a');
    assert('delete', q.toString(), 'b=2&c=%E4%B8%AD+%E6%96%87');

    // 和宿主 URL 双向绑定
    const u2 = new URL('https://a.com/?k=1');
    u2.searchParams.append('k2', 'v2');
    assert('改 searchParams，search 跟着变', u2.search, '?k=1&k2=v2');
    u2.search = '?z=9';
    assert('改 search，searchParams 跟着变', u2.searchParams.get('z'), '9');
  }

  console.log('  --- Headers ---');
  {
    const h = new Headers({ 'Content-Type': 'application/json' });
    assert('名字大小写不敏感', h.get('CONTENT-TYPE'), 'application/json');
    h.append('Accept', 'a');
    h.append('accept', 'b');
    assert('同名多值合并', h.get('Accept'), 'a, b');
    h.append('Set-Cookie', 'x=1');
    h.append('Set-Cookie', 'y=2');
    assert('Set-Cookie 不合并', h.getSetCookie().join('|'), 'x=1|y=2');
    assert('迭代按名字排序', [...h.keys()].join(','),
         'accept,content-type,set-cookie,set-cookie');
    h.set('Accept', '只剩这个');
    assert('set 覆盖全部同名', h.get('accept'), '只剩这个');
    h.delete('ACCEPT');
    assert('delete 大小写不敏感', String(h.has('accept')), 'false');
    try { h.set('坏 名字', 'v'); console.log('  ✗ 非法首部名居然通过'); }
    catch (err) { assert('非法首部名被拒', err.constructor.name, 'TypeError'); }
    try { h.set('X', '值里有\r\n换行'); console.log('  ✗ CRLF 居然通过'); }
    catch (err) { assert('首部值里的 CRLF 被拒', err.constructor.name, 'TypeError'); }
    assert('首尾空白被去掉', new Headers({ a: '  v  ' }).get('a'), 'v');
  }

  // ===== fetch =====
  // 对着公开的 httpbin.org 跑，不需要本地起服务。代价是这些断言依赖外网：
  // 没网或者 httpbin 挂了就会整体报错，这是预期的，不是运行时的问题。
  // 另外耗时里现在含真实的 RTT（实测单次约 1.5 s），别拿来衡量桥的开销。
  (async () => {
    const base = 'https://httpbin.org';
    console.log('  --- fetch ---');
    try {
      // /response-headers 把查询参数原样回成响应首部，同名的真发两条，
      // 正好验证「同名多值用 ', ' 合并」
      const res = await fetch(base + '/response-headers?x-multi=one&x-multi=two');
      assert('status', res.status, 200);
      assert('ok', res.ok, true);
      assert('url 是绝对的', res.url,
             base + '/response-headers?x-multi=one&x-multi=two');
      assert('响应首部大小写不敏感', res.headers.get('CONTENT-TYPE'), 'application/json');
      assert('同名多值合并', res.headers.get('x-multi'), 'one, two');
      const data = await res.json();
      assert('json() 解析出数组', Array.isArray(data['x-multi']), true);
      assert('body 读过之后 bodyUsed', res.bodyUsed, true);
      try { await res.json(); console.log('  ✗ body 居然能读第二次'); }
      catch (err) { assert('body 不能读第二次', err.constructor.name, 'TypeError'); }

      // text()：后台 UTF-8 解码
      const t = await (await fetch(base + '/range/16')).text();
      assert('text()', t, 'abcdefghijklmnop');

      // 404 不是网络错误：fetch 照样兑现，只是 ok 为 false
      const r404 = await fetch(base + '/status/404');
      assert('404 不拒绝，只是 ok=false', r404.ok, false);
      assert('404 的 status', r404.status, 404);

      // arrayBuffer 走零拷贝那条路。/range/N 是确定的 a-z 循环，不是随机字节
      const buf = await (await fetch(base + '/range/256')).arrayBuffer();
      assert('arrayBuffer 是 ArrayBuffer', buf instanceof ArrayBuffer, true);
      assert('arrayBuffer 长度', buf.byteLength, 256);
      const view = new Uint8Array(buf);
      assert('arrayBuffer 内容对得上', view[0] + ',' + view[255], '97,118');  // 'a','v'

      // POST 带 body 和自定义首部，/post 把收到的原样回显
      const post = await fetch(base + '/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 来自: 'nacre' }),
      });
      const echo = await post.json();
      assert('POST 的 method 到了服务器', echo.method, 'POST');
      assert('POST 的 body 到了服务器（含中文）', echo.json.来自, 'nacre');
      assert('自定义首部到了服务器', echo.headers['Content-Type'], 'application/json');

      // 网络层失败才拒绝
      try {
        await fetch('http://127.0.0.1:1/nope');
        console.log('  ✗ 连不上居然没拒绝');
      } catch (err) {
        assert('连不上时拒绝', err.constructor.name, 'TypeError');
      }
      try { await fetch('/相对路径'); console.log('  ✗ 相对 URL 居然通过'); }
      catch (err) { assert('相对 URL 被拒（没有 base）', err.constructor.name, 'TypeError'); }

      // --- Blob：字节不进 V8 堆 ---
      const blob = await (await fetch(base + '/range/256')).blob();
      assert('blob() 返回 Blob', blob instanceof Blob, true);
      assert('blob.size', blob.size, 256);
      const blobBuf = await blob.arrayBuffer();
      assert('Blob 能取出字节', new Uint8Array(blobBuf)[255], 118);
      const textBlob = new Blob(['前缀-', '后缀'], { type: 'text/plain' });
      assert('new Blob 拼字符串', await textBlob.text(), '前缀-后缀');
      assert('new Blob 的 type', textBlob.type, 'text/plain');
      assert('new Blob 的 size（UTF-8 字节数）', textBlob.size, 13);  // 6+1+6
      const bytesBlob = new Blob([new Uint8Array([1, 2, 3])]);
      assert('new Blob 吃 TypedArray', bytesBlob.size, 3);

      // --- AbortController ---
      const ctrl = new AbortController();
      assert('signal 初始未中止', ctrl.signal.aborted, false);
      let gotAbortEvent = false;
      ctrl.signal.addEventListener('abort', () => { gotAbortEvent = true; });
      // /delay/5 要 5 秒才回，足够在它回来之前把它取消掉
      const slowRequest = fetch(base + '/delay/5', { signal: ctrl.signal });
      setTimeout(() => ctrl.abort(), 200);
      try {
        await slowRequest;
        console.log('  ✗ 取消了居然还成功');
      } catch (err) {
        assert('取消后拒绝，name 是 AbortError', err.name, 'AbortError');
      }
      assert('abort 事件派发了', gotAbortEvent, true);
      assert('中止后 aborted', ctrl.signal.aborted, true);
      // reason 的类型是 unknown——任何值都能当中止原因，这是 Web 的语义
      assert('reason 默认是 AbortError',
           /** @type {Error} */ (ctrl.signal.reason).name, 'AbortError');
      ctrl.abort();   // 重复中止是空操作，不该再派发
      assert('重复 abort 不出错', ctrl.signal.aborted, true);

      // 已经中止的 signal，请求根本不该发出去
      try {
        await fetch(base + '/get', { signal: AbortSignal.abort() });
        console.log('  ✗ 已中止的 signal 居然还发请求');
      } catch (err) {
        assert('已中止的 signal 直接拒绝', err.name, 'AbortError');
      }
      // 超时：有了定时器才做得了
      try {
        await fetch(base + '/delay/5', { signal: AbortSignal.timeout(300) });
        console.log('  ✗ 超时了居然还成功');
      } catch (err) {
        assert('AbortSignal.timeout 到点中止', err.name, 'AbortError');
      }
      try { AbortSignal.abort().throwIfAborted(); console.log('  ✗ throwIfAborted 没抛'); }
      catch (err) { assert('throwIfAborted 抛的是 reason', err.name, 'AbortError'); }

      // 并发：验证请求是并行发出去的，不是一个接一个。
      //
      // 断言的是**耗时**不是成功率：httpbin 对突发并发会回 429（实测 10 个
      // 一起发有 6 个被限流），那是公开服务的配额，不是运行时的问题。
      // 而 429 本身也是服务器正常答复，照样证明请求发出去了。
      const single0 = Date.now();
      await fetch(base + '/range/8?warm=1');
      const singleMs = Date.now() - single0;

      const t0 = Date.now();
      const batch = await Promise.allSettled(
        Array.from({ length: 10 }, (_, i) =>
          fetch(base + '/range/8?i=' + i).then((r) => r.status)));
      const batchMs = Date.now() - t0;
      const ok200 = batch.filter(
        (r) => r.status === 'fulfilled' && r.value === 200).length;
      assert('10 个请求全都有结果', batch.length, 10);
      assert('没有串行（10 个的耗时 < 单次的 4 倍）', batchMs < singleMs * 4, true);
      console.log('  ✓ 单次', singleMs, 'ms，10 个并发', batchMs,
                  'ms，其中 200 的有', ok200, '个（其余被 httpbin 限流）');
    } catch (err) {
      console.log('  ✗ fetch 用例整体出错:', err && err.message);
    }
  })();

  // ===== 定时器 =====
  console.log('  --- 定时器 ---');

  // 1. 同时到期必须按注册顺序（HTML 规范要求，也是我们自己管堆的理由）
  /** @type {number[]} */ const order = [];
  for (let i = 1; i <= 5; i++) setTimeout(() => order.push(i), 30);

  // 2. 取消
  let wasCancelled = false;
  const toCancel = setTimeout(() => { wasCancelled = true; }, 30);
  clearTimeout(toCancel);
  clearTimeout(toCancel);        // 重复取消不该炸
  clearTimeout(999999);          // 不认识的 id 静默忽略

  // 3. 嵌套不饿死：每一次都该落在不同轮唤醒上
  let nestCount = 0;
  const nestStart = Date.now();
  setTimeout(function again() {
    if (++nestCount < 5) setTimeout(again, 0);
  }, 0);

  // 4. setInterval + clearInterval
  let repeatCount = 0;
  const repeater = setInterval(() => {
    if (++repeatCount >= 3) clearInterval(repeater);
  }, 10);

  // 5. 宏任务 / 微任务的交错顺序，经典用例
  /** @type {string[]} */ const interleaved = [];
  setTimeout(() => interleaved.push('宏任务'), 0);
  Promise.resolve().then(() => interleaved.push('微任务'));
  queueMicrotask(() => interleaved.push('queueMicrotask'));
  interleaved.push('同步');

  // 6. 额外参数透传
  /** @type {string | null} */ let passthroughResult = null;
  setTimeout((a, b) => { passthroughResult = a + b; }, 0, '参数', '透传');

  // 7. 非函数参数要抛
  // @ts-expect-error 第一个参数必须是函数
  try { setTimeout(123, 0); console.log('  ✗ 非函数居然通过'); }
  catch (err) { console.log('  ✓ setTimeout 拒绝非函数:', err.constructor.name); }


  // 9. 和原生事件的顺序。
  //
  // 定时器和原生事件确实都在主队列上按 FIFO 跑，但**不能用窗口通知来验证
  // 这一点**：观察者是 addObserverForName:object:queue:（mainQueue）注册的，
  // UIKit 发通知时先把观察者块排进主队列，块跑起来之后才 postToJS 排第二次；
  // 而 setTimeout(fn, 0) 只排一跳。两跳里第一跳什么时候入队由 UIKit 决定，
  // 所以相对顺序**不是确定的**——两种顺序都实测到过。
  //
  // 这里只断言两边都到了。顺序那条由上面的「同时到期按注册顺序」保证，
  // 那个才是我们自己的队列说了算的。
  /** @type {string[]} */ const mixedOrder = [];
  setTimeout(() => mixedOrder.push('timer'), 0);
  win.addEventListener('becomekey', () => mixedOrder.push('窗口事件'), { once: true });

  // 不用固定延迟汇总：App 启动时主线程很忙（首次布局、字体、首帧渲染），
  // 实测 0ms 的定时器可能等 250ms 才轮到。用轮询等条件齐了再汇总，
  // 既不依赖绝对时间，本身也是一次「定时器确实在推进」的验证。
  /** @param {number} roundsLeft */
  function summarizeWhenReady(roundsLeft) {
    const allDone = nestCount >= 5 && repeatCount >= 3 && order.length >= 5 &&
                    mixedOrder.length >= 2;
    if (!allDone && roundsLeft > 0) {
      setTimeout(() => summarizeWhenReady(roundsLeft - 1), 20);
      return;
    }
    assert('同时到期按注册顺序', order.join(''), '12345');
    assert('clearTimeout 生效', !wasCancelled, true);
    assert('嵌套跑满且每次一轮唤醒', nestCount, 5);
    assert('setInterval 被自己的 clearInterval 停住', repeatCount, 3);
    assert('同步 → 微任务 → 宏任务', interleaved.join(','),
         '同步,微任务,queueMicrotask,宏任务');
    assert('额外参数透传', passthroughResult, '参数透传');
    assert('timer 和窗口事件都到了 JS',
           [...mixedOrder].sort().join(','), 'timer,窗口事件');
    console.log('  ✓ 定时器全部跑完（从注册到跑满',
                Date.now() - nestStart, 'ms，含启动时的主线程繁忙）');
  }
  summarizeWhenReady(50);

  // ===== Auto Layout =====
  console.log('--- Auto Layout ---');
  {
    const root = vc.view;
    const guide = root.safeAreaLayoutGuide;

    const card = new UIView();
    card.translatesAutoresizingMaskIntoConstraints = false;
    card.backgroundColor = UIColor.secondarySystemBackgroundColor;
    root.addSubview(card);

    const left = new UIView();
    const middle = new UIView();
    const right = new UIView();
    const colors = [UIColor.systemRedColor, UIColor.systemOrangeColor,
                    UIColor.systemBlueColor];
    [left, middle, right].forEach((v, i) => {
      v.translatesAutoresizingMaskIntoConstraints = false;
      v.backgroundColor = colors[i];
      card.addSubview(v);
    });

    const cardHeight = card.heightAnchor.constraintEqualToConstant(60);
    const batch = [
      card.leadingAnchor.constraintEqualToAnchor(guide.leadingAnchor, { constant: 16 }),
      card.trailingAnchor.constraintEqualToAnchor(guide.trailingAnchor, { constant: -16 }),
      card.bottomAnchor.constraintEqualToAnchor(guide.bottomAnchor, { constant: -24 }),
      cardHeight,
      left.leadingAnchor.constraintEqualToAnchor(card.leadingAnchor, { constant: 8 }),
      left.widthAnchor.constraintEqualToConstant(60),
      middle.leadingAnchor.constraintEqualToAnchor(left.trailingAnchor, { constant: 8 }),
      right.leadingAnchor.constraintEqualToAnchor(middle.trailingAnchor, { constant: 8 }),
      right.trailingAnchor.constraintEqualToAnchor(card.trailingAnchor, { constant: -8 }),
      right.widthAnchor.constraintEqualToConstant(60),
    ];
    for (const v of [left, middle, right]) {
      batch.push(v.topAnchor.constraintEqualToAnchor(card.topAnchor, { constant: 8 }));
      batch.push(v.bottomAnchor.constraintEqualToAnchor(card.bottomAnchor, { constant: -8 }));
    }
    NSLayoutConstraint.activateConstraints(batch);
    root.layoutIfNeeded();

    const safeWidth = guide.layoutFrame.width;
    assert('card 宽 = 安全区宽 - 32', card.frame.width, safeWidth - 32);
    assert('card 高 = 常数约束', card.frame.height, 60);
    assert('左块固定宽', left.frame.width, 60);
    assert('右块固定宽', right.frame.width, 60);
    // 中间那块没给宽度，被左右和间距挤出来——这就是 flex-1 的做法
    assert('中间自动占满剩下的', middle.frame.width, card.frame.width - 152);
    assert('三块等高（上下各留 8）', left.frame.height, 44);

    // constant 是建好之后唯一能改的数值，改完重新布局就生效
    cardHeight.constant = 84;
    root.layoutIfNeeded();
    assert('改 constant 后重新布局', card.frame.height, 84);
    cardHeight.constant = 60;
    root.layoutIfNeeded();

    // 约束装在两端的最近公共祖先上：card 的位置约束在 root 上，
    // 子块之间的约束在 card 上
    assert('card 自己身上有约束', card.constraints.length > 0, true);
    assert('约束对象能从 view 读回来', card.constraints.includes(cardHeight), true);

    console.log('  --- 约束对象本身 ---');
    assert('relation 是字符串', cardHeight.relation, 'equal');
    assert('firstAttribute', cardHeight.firstAttribute, 'height');
    assert('没有第二端时 secondAttribute', cardHeight.secondAttribute, 'notAnAttribute');
    assert('multiplier 默认 1', cardHeight.multiplier, 1);
    assert('isActive', cardHeight.isActive, true);
    assert('firstAnchor 就是建它的那个锚点',
           cardHeight.firstAnchor === card.heightAnchor, true);
    assert('常数约束没有第二个锚点', cardHeight.secondAnchor, null);
    cardHeight.identifier = 'card-height';
    assert('identifier 能写能读', cardHeight.identifier, 'card-height');

    // 优先级：写接受名字或数字，读永远是数字
    cardHeight.priority = 'defaultHigh';
    assert('写名字读数字', cardHeight.priority, 750);
    cardHeight.priority = 749;
    assert('没有名字的值只能用数字', cardHeight.priority, 749);
    cardHeight.priority = 'required';
    try {
      // @ts-expect-error 不是具名优先级，类型这一层就该挡住
      cardHeight.priority = 'veryImportant';
      console.log('  ✗ 不认识的优先级名字居然通过了');
    } catch (err) {
      console.log('  ✓ 不认识的优先级名字被拒:', err.message.slice(0, 40) + '…');
    }

    console.log('  --- 锚点的类型安全 ---');
    assert('同一个锚点取两次是同一个对象', card.topAnchor === card.topAnchor, true);
    assert('不同锚点不是同一个', card.topAnchor === card.bottomAnchor, false);
    try {
      // @ts-expect-error 纵向锚点连横向锚点，类型就该挡住
      card.topAnchor.constraintEqualToAnchor(card.leadingAnchor);
      console.log('  ✗ 跨轴连接居然通过了');
    } catch (err) {
      console.log('  ✓ 跨轴连接被拒:', err.message);
    }

    console.log('  --- 参数没有原生对象 ---');
    {
      // ES 子类的 super() 不建原生对象（UIView 构造函数里 new.target 那道闸），
      // 所以这个实例没有句柄。以前它会被当成普通值，原生收到 nil 静默忽略
      class ProbeSubview extends UIView {}
      try {
        card.addSubview(new ProbeSubview());
        console.log('  ✗ 没有原生对象的参数居然通过了');
      } catch (err) {
        console.log('  ✓ 没有原生对象的参数被拒:', err.message);
      }
      try {
        card.addSubview(new UIWindow());   // 没绑场景，同样没有句柄
        console.log('  ✗ 没绑场景的 UIWindow 居然通过了');
      } catch (err) {
        console.log('  ✓ 没绑场景的 UIWindow 被拒:', err.message);
      }
      assert('被拒之后 card 的子视图没变多', card.subviews.length, 3);
    }

    console.log('  --- 没有公共祖先 ---');
    {
      const a = new UIView();
      const b = new UIView();
      a.translatesAutoresizingMaskIntoConstraints = false;
      try {
        a.leadingAnchor.constraintEqualToAnchor(b.leadingAnchor).isActive = true;
        console.log('  ✗ 两个孤立 view 之间的约束居然激活了');
      } catch (err) {
        // 关键在于这里是 TypeError 不是进程崩溃
        console.log('  ✓ 激活被拒:', err.message.slice(0, 48) + '…');
      }
    }

    console.log('  --- 内容抱紧和抗压缩 ---');
    const probeLabel = new UILabel();
    probeLabel.text = '抱紧';
    probeLabel.translatesAutoresizingMaskIntoConstraints = false;
    card.addSubview(probeLabel);
    // 实测四个默认值。UILabel 和普通 UIView 的抱紧都是 250，**没有差别**
    // ——「标签抱得更紧」是以讹传讹
    console.log('  UILabel   抱紧 横/纵 =',
                probeLabel.contentHuggingPriorityForAxis('horizontal'),
                probeLabel.contentHuggingPriorityForAxis('vertical'),
                '| 抗压缩 横/纵 =',
                probeLabel.contentCompressionResistancePriorityForAxis('horizontal'),
                probeLabel.contentCompressionResistancePriorityForAxis('vertical'));
    console.log('  普通 UIView 抱紧 横/纵 =',
                left.contentHuggingPriorityForAxis('horizontal'),
                left.contentHuggingPriorityForAxis('vertical'),
                '| 抗压缩 横/纵 =',
                left.contentCompressionResistancePriorityForAxis('horizontal'),
                left.contentCompressionResistancePriorityForAxis('vertical'));
    assert('标签默认水平抱紧', probeLabel.contentHuggingPriorityForAxis('horizontal'), 250);
    assert('标签默认水平抗压缩',
           probeLabel.contentCompressionResistancePriorityForAxis('horizontal'), 750);
    probeLabel.setContentHuggingPriority('defaultLow', { forAxis: 'horizontal' });
    assert('调低抱紧后读回', probeLabel.contentHuggingPriorityForAxis('horizontal'), 250);
    probeLabel.setContentCompressionResistancePriority(999, { forAxis: 'vertical' });
    assert('抗压缩也接受数字',
           probeLabel.contentCompressionResistancePriorityForAxis('vertical'), 999);
    try {
      // @ts-expect-error 轴只有 horizontal / vertical
      probeLabel.setContentHuggingPriority('defaultLow', { forAxis: '斜着' });
      console.log('  ✗ 不认识的轴居然通过了');
    } catch (err) {
      console.log('  ✓ 不认识的轴被拒:', err.message.slice(0, 36) + '…');
    }
    probeLabel.removeFromSuperview();

    console.log('  --- UILayoutGuide ---');
    const spacer = new UILayoutGuide();
    spacer.identifier = 'spacer';
    card.addLayoutGuide(spacer);
    assert('owningView 是加它的那个 view', spacer.owningView === card, true);
    assert('identifier', spacer.identifier, 'spacer');
    assert('layoutGuides 里有它', card.layoutGuides.includes(spacer), true);
    NSLayoutConstraint.activateConstraints([
      spacer.leadingAnchor.constraintEqualToAnchor(left.trailingAnchor),
      spacer.trailingAnchor.constraintEqualToAnchor(middle.leadingAnchor),
      spacer.topAnchor.constraintEqualToAnchor(card.topAnchor),
      spacer.heightAnchor.constraintEqualToConstant(4),
    ]);
    root.layoutIfNeeded();
    assert('guide 占的就是那 8pt 间距', spacer.layoutFrame.width, 8);
    assert('guide 不画东西但有尺寸', spacer.layoutFrame.height, 4);

    console.log('  --- 调试接口 ---');
    assert('约束齐了就不含糊', card.hasAmbiguousLayout, false);
    assert('影响横向布局的约束不止一条',
           left.constraintsAffectingLayoutForAxis('horizontal').length > 1, true);
    const fitted = card.systemLayoutSizeFittingSize(new CGSize(0, 0));
    assert('systemLayoutSizeFittingSize 解出高度', fitted.height, 60);

    // 批量停用：card 的高度约束一撤，高度就由子块撑起来（8 + 44 + 8）
    NSLayoutConstraint.deactivateConstraints([cardHeight]);
    assert('停用后 isActive 变 false', cardHeight.isActive, false);
    root.layoutIfNeeded();
    // 高度塌成上下两个 8pt——子块的高度本来就是跟着 card 走的（没有固有高度），
    // 撤掉 card 的高度之后这一维谁都没定，求解器取了最小解
    assert('撤掉高度约束后塌成上下两个间距', card.frame.height, 16);
    cardHeight.isActive = true;
    root.layoutIfNeeded();
  }

  // ===== 所有权镜像 =====
  //
  // 原生对象的 JS 包装是弱的，所以要验的是「GC 之后包装的身份还在不在」。
  // 运行时没有强制 GC 的手段，只能制造垃圾逼 V8 回收，再拿一个**没有
  // 所有者**的包装当对照组：只有对照组的身份也丢了，才说明 GC 真跑过，
  // 这一轮的结论才算数。对照组没丢就报「未验证」，不假装通过。
  console.log('--- 所有权镜像（GC 之后身份是否保持）---');
  const probeHost = new UIView();
  // 第 3c 步那个洞的回归：原生侧锚点对 view 是 weak，JS 只留锚点、view 的
  // 包装被 GC 之后拿它建约束再激活——补所有权镜像之前实测是 SIGSEGV。
  const orphanAnchor = (() => new UIView().widthAnchor)();
  {
    const probeBox = new UIView();
    /** @type {any} */ (probeBox).probe = '挂在包装上的 JS 状态';
    probeHost.addSubview(probeBox);
    // 另一条所有权边：属性写入。颜色挑一个别处没用过的，免得被别人持有
    /** @type {any} */ (UIColor.systemGreenColor).probe = '挂在颜色包装上';
    probeHost.backgroundColor = UIColor.systemGreenColor;
    // 对照组：类常量的包装，JS 侧谁都不持有它
    /** @type {any} */ (UIColor.systemBrownColor).probe = '对照';
    // 局部引用随这个块结束而消失，之后只有镜像还持有它们
  }

  function makeGarbage() {
    for (let i = 0; i < 20; i++) {
      /** @type {object[]} */ const junk = [];
      for (let j = 0; j < 3000; j++) junk.push({ i, j, s: 'x'.repeat(16) + j });
    }
  }

  /** @param {number} roundsLeft */
  function waitForRealGC(roundsLeft) {
    makeGarbage();
    const controlCollected = /** @type {any} */ (UIColor.systemBrownColor).probe === undefined;
    if (!controlCollected && roundsLeft > 0) {
      setTimeout(() => waitForRealGC(roundsLeft - 1), 0);
      return;
    }
    if (!controlCollected) {
      console.log('  ! 对照组始终没被回收，GC 没跑够，这一轮未验证');
      return;
    }
    assert('对照组（无所有者）GC 后身份丢失', controlCollected, true);
    const kids = probeHost.subviews;
    assert('镜像持有的 view，GC 后挂在包装上的状态还在',
           /** @type {any} */ (kids[0]).probe, '挂在包装上的 JS 状态');
    assert('属性边：GC 后读回的 UIColor 还是同一个包装',
           /** @type {any} */ (probeHost.backgroundColor).probe, '挂在颜色包装上');
    // 这一条在补镜像之前是段错误，不是断言失败
    const late = orphanAnchor.constraintEqualToConstant(50);
    late.isActive = true;
    assert('GC 之后用孤儿锚点建约束并激活', late.constant, 50);
    assert('它的 view 还活着', late.isActive, true);
  }
  waitForRealGC(80);

  console.log('✓ 屏幕上：三个色块 + 标题 + 两行说明 + 一行等宽数字');
});

application.addEventListener('scenedisconnect', (e) => {
  console.log('✓ 收到 scenedisconnect, scene =', e.scene instanceof UIWindowScene);
});

console.log('--- 以下故意抛出未捕获异常，main.js 会被标记为 failed，这是预期的 ---');
throw new Error('故意抛的未捕获异常');
