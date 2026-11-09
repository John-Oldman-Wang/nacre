// 原生对象包装的身份一致，以及 UIWindowScene / UISceneSession。
//
// 这一段在脚本顶层执行，所以作为副作用导入——执行顺序就是
// src/main.js 里的 import 顺序。

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
