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
  console.log('  scene.windows.length =', e.scene.windows ? e.scene.windows.length : '(未暴露)');

  console.log('  --- UIColor：类级属性 ---');
  const bg = UIColor.systemBackgroundColor;
  console.log('  UIColor.systemBackgroundColor instanceof UIColor =', bg instanceof UIColor,
              '| instanceof NSObject =', bg instanceof NSObject);
  console.log('  两次取同一个常量是同一个对象 =', bg === UIColor.systemBackgroundColor);
  console.log('  不同常量是不同对象 =', bg !== UIColor.labelColor);
  console.log('  不存在的颜色 =', UIColor.nosuchColor);
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
  try { r.x = 999; console.log('  ✗ 结构体居然能改'); }
  catch (err) { console.log('  ✓ 改结构体被拒:', err.message); }
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
  try { box.contentMode = 'cover'; console.log('  ✗ 瞎写的枚举值居然通过'); }
  catch (err) { console.log('  ✓ 认不出的枚举值被拒:', err.message); }
  console.log('  普通 UIView 的 intrinsicContentSize =',
              '' + box.intrinsicContentSize, '（-1 表示没有固有尺寸）');

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
  try { new UIFont(); console.log('  ✗ UIFont 居然能构造'); }
  catch (err) { console.log('  ✓ UIFont 不可直接构造:', err.message); }

  // 参数位的枚举和属性位一样抛，不静默返回 null、也不退回默认值
  try {
    UIFont.systemFontOfSize(17, { weight: 'extrabold' });
    console.log('  ✗ 瞎写的字重居然通过');
  } catch (err) {
    console.log('  ✓ 认不出的字重被拒:', err.constructor.name + ':', err.message);
  }
  try {
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

  mainWindow = win;
  console.log('✓ 屏幕上：三个色块 + 标题 + 两行说明 + 一行等宽数字');
});

application.addEventListener('scenedisconnect', (e) => {
  console.log('✓ 收到 scenedisconnect, scene =', e.scene instanceof UIWindowScene);
});

console.log('--- 以下故意抛出未捕获异常，main.js 会被标记为 failed，这是预期的 ---');
throw new Error('故意抛的未捕获异常');
