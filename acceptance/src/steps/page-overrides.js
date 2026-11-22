// 页面的覆写点：方向、状态栏；场景的几何信息和转屏。（出现和消失早就有了，在 appearance.js）
//
// 原生层给三个页面类各预置了一个子类，把 UIKit 只能靠覆写拿到的几项接出来：
// 方向和状态栏是可写的属性（系统来问时由运行时替页面回答）。
// 场景上是 effectiveGeometry、requestGeometryUpdateWithPreferences 和当场派发的
// geometrychange（实测它在转屏动画里，监听器里改的布局跟着转）。
//
// 验收 App 在配置里声明了横屏，根页面在建窗口那一步就限定成只能竖屏，
// 这一步临时放开，转过去再转回来。

/** @param {import("../main.js").StepContext} ctx */
export async function stepPageOverrides(ctx) {
  const { assert } = ctx;
  console.log('--- 页面的方向和状态栏 ---');

  /** @param {number} ms */
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  /** @param {() => boolean} ready @param {number} ms */
  const until = async (ready, ms) => {
    for (let waited = 0; waited < ms && !ready(); waited += 50) await sleep(50);
    return ready();
  };
  /** @param {() => unknown} run */
  const thrown = (run) => {
    try { run(); return '没抛'; } catch (err) { return /** @type {Error} */ (err).name; }
  };
  /** @param {Promise<unknown>} promise */
  const outcome = (promise) => promise.then(
    () => 'ok', (err) => /** @type {Error} */ (err).name + ': ' + /** @type {Error} */ (err).message);

  // ===== 属性：默认值和读写 =====
  const page = new UIViewController();
  // 实测默认是四个方向都允许（Apple 文档说 iPhone 上默认不含倒竖，和实测不符）
  assert('supportedInterfaceOrientations 默认：四个方向',
         page.supportedInterfaceOrientations.join(','), 'portrait,portraitUpsideDown,landscapeLeft,landscapeRight');
  assert('prefersInterfaceOrientationLocked 默认 false', page.prefersInterfaceOrientationLocked, false);
  assert('prefersStatusBarHidden 默认 false', page.prefersStatusBarHidden, false);
  assert('preferredStatusBarStyle 默认 default', page.preferredStatusBarStyle, 'default');
  assert('preferredInterfaceOrientationForPresentation 默认是一个方向名',
         ['portrait', 'portraitUpsideDown', 'landscapeLeft', 'landscapeRight', 'unknown']
           .includes(page.preferredInterfaceOrientationForPresentation), true);
  console.log('  preferredInterfaceOrientationForPresentation 默认 = ' + page.preferredInterfaceOrientationForPresentation);

  page.supportedInterfaceOrientations = ['portrait'];
  assert('supportedInterfaceOrientations 写进去读得回来', page.supportedInterfaceOrientations.join(','), 'portrait');
  page.supportedInterfaceOrientations = ['landscape'];
  assert('landscape 是两种横屏的合称，读回来拆开',
         page.supportedInterfaceOrientations.join(','), 'landscapeLeft,landscapeRight');
  page.supportedInterfaceOrientations = /** @type {any} */ (['portrait', 'sideways']);
  assert('有一个不认识的名字：整次不生效', page.supportedInterfaceOrientations.join(','), 'landscapeLeft,landscapeRight');
  page.supportedInterfaceOrientations = [];
  assert('空数组不生效（系统要求至少一个方向）',
         page.supportedInterfaceOrientations.join(','), 'landscapeLeft,landscapeRight');

  page.preferredInterfaceOrientationForPresentation = 'landscapeRight';
  assert('preferredInterfaceOrientationForPresentation 写得进去',
         page.preferredInterfaceOrientationForPresentation, 'landscapeRight');
  page.prefersInterfaceOrientationLocked = true;
  assert('prefersInterfaceOrientationLocked 写得进去', page.prefersInterfaceOrientationLocked, true);
  page.prefersStatusBarHidden = /** @type {any} */ (1);
  assert('prefersStatusBarHidden 按布尔转', page.prefersStatusBarHidden, true);
  page.preferredStatusBarStyle = 'lightContent';
  assert('preferredStatusBarStyle 写得进去', page.preferredStatusBarStyle, 'lightContent');
  page.preferredStatusBarStyle = /** @type {any} */ ('purple');
  assert('preferredStatusBarStyle 写错：不变', page.preferredStatusBarStyle, 'lightContent');
  for (const name of /** @type {const} */ (['setNeedsUpdateOfSupportedInterfaceOrientations',
                                             'setNeedsStatusBarAppearanceUpdate',
                                             'setNeedsUpdateOfPrefersInterfaceOrientationLocked'])) {
    assert(name + '() 能调', thrown(() => page[name]()), '没抛');
  }

  const nav = new UINavigationController(new UIViewController());
  nav.supportedInterfaceOrientations = ['portrait'];
  nav.preferredStatusBarStyle = 'darkContent';
  assert('导航控制器也有这几个属性',
         nav.supportedInterfaceOrientations.join(',') + ' ' + nav.preferredStatusBarStyle, 'portrait darkContent');
  // 系统的页面（弹窗、分享面板这些）不是运行时预置的子类，设这几个属性要抛
  const alert = UIAlertController.alertControllerWithTitle('t', { message: null, preferredStyle: 'alert' });
  assert('系统的页面上设 prefersStatusBarHidden：抛 TypeError',
         thrown(() => { alert.prefersStatusBarHidden = true; }), 'TypeError');
  assert('系统的页面上读得到系统的值', typeof alert.prefersStatusBarHidden, 'boolean');
  const tabs = new UITabBarController();
  tabs.prefersStatusBarHidden = true;
  assert('标签控制器也有这几个属性', tabs.prefersStatusBarHidden, true);

  // ===== 状态栏：写了之后系统真的照着做 =====
  // 系统听的是最上面那个全屏的页面。全屏弹出一个自己的页面来测，不依赖根页面是什么
  const scene = ctx.scene;
  const root = /** @type {UIViewController} */ (ctx.win.rootViewController);
  let host = root;
  while (host.presentedViewController !== null) host = host.presentedViewController;
  const bar = scene.statusBarManager;
  assert('statusBarManager 是 UIStatusBarManager', bar instanceof UIStatusBarManager, true);
  assert('statusBarFrame 是 CGRect', bar.statusBarFrame instanceof CGRect, true);
  {
    const shown = new UIViewController();
    shown.modalPresentationStyle = 'fullScreen';
    await host.presentViewController(shown, { animated: false });
    assert('全屏弹出的页面：状态栏默认显示', await until(() => !bar.isStatusBarHidden, 2000), true);
    shown.prefersStatusBarHidden = true;
    assert('prefersStatusBarHidden = true：状态栏藏起来了', await until(() => bar.isStatusBarHidden, 2000), true);
    shown.prefersStatusBarHidden = false;
    assert('改回 false：状态栏又出来了', await until(() => !bar.isStatusBarHidden, 2000), true);
    shown.preferredStatusBarStyle = 'lightContent';
    assert('preferredStatusBarStyle：状态栏的样式跟着变',
           await until(() => bar.statusBarStyle === 'lightContent', 2000), true);
    await host.dismissViewController({ animated: false });
  }
  {
    // 导航控制器里：系统听的是导航控制器显示的那个页面
    const top = new UIViewController();
    const stack = new UINavigationController(top);
    stack.modalPresentationStyle = 'fullScreen';
    await host.presentViewController(stack, { animated: false });
    stack.prefersStatusBarHidden = true;
    await sleep(500);
    console.log('  设在导航控制器上：状态栏藏没藏 = ' + bar.isStatusBarHidden);
    stack.prefersStatusBarHidden = false;
    top.prefersStatusBarHidden = true;
    assert('导航控制器里：设在它显示的页面上，状态栏藏起来了',
           await until(() => bar.isStatusBarHidden, 2000), true);
    top.prefersStatusBarHidden = false;
    await host.dismissViewController({ animated: false });
  }

  // ===== 场景的几何信息 =====
  const geometry = scene.effectiveGeometry;
  assert('effectiveGeometry 是 UIWindowSceneGeometry', geometry instanceof UIWindowSceneGeometry, true);
  assert('现在是竖屏', geometry.interfaceOrientation, 'portrait');
  assert('isInterfaceOrientationLocked 是布尔', typeof geometry.isInterfaceOrientationLocked, 'boolean');
  assert('isInteractivelyResizing 是 false', geometry.isInteractivelyResizing, false);
  assert('UIWindowSceneGeometry 不能 new', thrown(() => new (/** @type {any} */ (UIWindowSceneGeometry))()), 'TypeError');

  const prefs = new UIWindowSceneGeometryPreferencesIOS(['landscapeRight']);
  assert('偏好的方向读得回来', prefs.interfaceOrientations.join(','), 'landscapeRight');
  prefs.interfaceOrientations = ['portrait', 'landscapeLeft'];
  assert('偏好的方向可写', prefs.interfaceOrientations.join(','), 'portrait,landscapeLeft');
  assert('不带参数：没有偏好', new UIWindowSceneGeometryPreferencesIOS().interfaceOrientations.length, 0);
  assert('构造时写错方向名：抛 TypeError',
         thrown(() => new UIWindowSceneGeometryPreferencesIOS(/** @type {any} */ (['sideways']))), 'TypeError');

  // ===== 请求转屏 =====
  assert('已经是竖屏，请求竖屏：当场兑现',
         await outcome(scene.requestGeometryUpdateWithPreferences(new UIWindowSceneGeometryPreferencesIOS(['portrait']))),
         'ok');
  assert('没有偏好的方向：抛 TypeError',
         thrown(() => scene.requestGeometryUpdateWithPreferences(new UIWindowSceneGeometryPreferencesIOS())), 'TypeError');
  assert('参数不是偏好对象：抛 TypeError',
         thrown(() => scene.requestGeometryUpdateWithPreferences(/** @type {any} */ ({}))), 'TypeError');
  // 根页面只允许竖屏（建窗口那一步设的）：系统拒绝。这条说明页面的属性真的被系统问到了
  root.supportedInterfaceOrientations = ['portrait'];
  const refused = await outcome(scene.requestGeometryUpdateWithPreferences(
    new UIWindowSceneGeometryPreferencesIOS(['landscapeRight'])));
  assert('根页面只允许竖屏时请求横屏：拒绝，是系统给的 NSError', refused.startsWith('NSError: '), true);
  assert('拒绝的原因是页面不支持', refused.includes('supported by the view controller'), true);

  // 放开之后转过去
  root.supportedInterfaceOrientations = ['portrait', 'landscapeRight'];
  const follower = new UIView();
  follower.frame = new CGRect(0, 0, 10, 10);
  root.view.addSubview(follower);
  /** @type {{ previous: string, now: string, animated: string[] }[]} */
  const changes = [];
  /** @param {Event} e */
  const onGeometry = (e) => {
    follower.frame = new CGRect(0, 100, 10, 10);
    changes.push({
      previous: /** @type {UIWindowSceneGeometryChangeEvent} */ (e).previousInterfaceOrientation,
      now: scene.effectiveGeometry.interfaceOrientation,
      animated: follower.layer.animationKeys(),
    });
  };
  scene.addEventListener('geometrychange', onGeometry);
  const turned = await outcome(scene.requestGeometryUpdateWithPreferences(
    new UIWindowSceneGeometryPreferencesIOS(['landscapeRight'])));
  assert('请求横屏：兑现', turned, 'ok');
  assert('兑现时已经是横屏', scene.effectiveGeometry.interfaceOrientation, 'landscapeRight');
  const change = changes[0];
  assert('geometrychange 来了', change !== undefined, true);
  if (change !== undefined) {
    assert('geometrychange：previousInterfaceOrientation', change.previous, 'portrait');
    assert('geometrychange：监听器里读到的已经是新方向', change.now, 'landscapeRight');
    assert('geometrychange：监听器里挪的视图跟着转屏动画走', change.animated.includes('position'), true);
  }
  assert('横屏时根视图变宽了', root.view.bounds.width > root.view.bounds.height, true);

  // 转回来，再收紧
  assert('请求竖屏：兑现', await outcome(scene.requestGeometryUpdateWithPreferences(
    new UIWindowSceneGeometryPreferencesIOS(['portrait']))), 'ok');
  assert('转回竖屏了', scene.effectiveGeometry.interfaceOrientation, 'portrait');
  scene.removeEventListener('geometrychange', onGeometry);
  root.supportedInterfaceOrientations = ['portrait'];
  follower.removeFromSuperview();
}
