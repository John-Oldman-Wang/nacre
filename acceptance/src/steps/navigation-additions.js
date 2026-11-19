// UINavigationController 补上的成员：工具条、返回手势、自动隐藏导航条、showViewController。
// 初稿是 bindgen 生成的（docs/internals/bindgen.md），之后是手写的。
//
// 默认值是 2026-11-19 在 iPhone Air 模拟器（iOS 27.2）上量的；头文件和 Apple 文档写了的，
// 和它们对过。界面上的效果（工具条出现、导航条被藏起来）这里看不到，验的是状态。
//
// 返回手势这几个识别器要等导航控制器的视图建出来才有，所以先读一次 nav.view。

// 一组断言中途抛了只废这一组，不连累后面的
/**
 * @param {string} name
 * @param {() => void} fn
 */
function group(name, fn) {
  try {
    fn();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log('  ✗ ' + name + ' 这一组中断了 = ' + message + '（期望跑完）');
  }
}

/**
 * 做一件该抛异常的事，把实际发生的写成一句话
 * @param {() => void} fn
 * @returns {string}
 */
function thrown(fn) {
  try {
    fn();
    return '没抛';
  } catch (err) {
    return err instanceof Error ? err.name + ': ' + err.message : String(err);
  }
}

/** 一个视图已经建出来的导航控制器 */
function makeNav() {
  const nav = new UINavigationController(new UIViewController());
  void nav.view;
  return nav;
}

/** @param {import("../main.js").StepContext} ctx */
export function stepNavigationAdditions(ctx) {
  const { assert } = ctx;
  console.log('--- UINavigationController 补上的成员 ---');

  group('默认值', () => {
    const nav = makeNav();
    assert('工具条默认是藏着的', nav.isToolbarHidden, true);
    assert('hidesBarsWhenKeyboardAppears 默认 false', nav.hidesBarsWhenKeyboardAppears, false);
    assert('hidesBarsOnSwipe 默认 false', nav.hidesBarsOnSwipe, false);
    assert('hidesBarsWhenVerticallyCompact 默认 false', nav.hidesBarsWhenVerticallyCompact, false);
    assert('hidesBarsOnTap 默认 false', nav.hidesBarsOnTap, false);
  });

  group('工具条', () => {
    const nav = makeNav();
    assert('toolbar 是 UIToolbar', nav.toolbar instanceof UIToolbar, true);
    assert('toolbar 读两次是同一个对象', nav.toolbar === nav.toolbar, true);
    nav.isToolbarHidden = false;
    assert('isToolbarHidden 写 false', nav.isToolbarHidden, false);
    nav.isToolbarHidden = /** @type {any} */ (1);
    assert('isToolbarHidden 写 1 得到 true', nav.isToolbarHidden, true);
    nav.setToolbarHidden(false);
    assert('setToolbarHidden(false) 之后显示', nav.isToolbarHidden, false);
    nav.setToolbarHidden(true, { animated: true });
    assert('setToolbarHidden(true, { animated: true }) 之后藏起', nav.isToolbarHidden, true);
    nav.setToolbarHidden(false, /** @type {any} */ (null));
    assert('options 传 null 当成空对象', nav.isToolbarHidden, false);
    assert('toolbar 写了抛 TypeError',
           thrown(() => { /** @type {any} */ (nav).toolbar = null; }).startsWith('TypeError'), true);
  });

  group('返回手势', () => {
    const nav = makeNav();
    const pop = nav.interactivePopGestureRecognizer;
    assert('interactivePopGestureRecognizer 是识别器', pop instanceof UIGestureRecognizer, true);
    assert('interactivePopGestureRecognizer 读两次是同一个对象', nav.interactivePopGestureRecognizer === pop, true);
    if (pop !== null) {
      assert('返回手势默认开着', pop.isEnabled, true);
      pop.isEnabled = false;
      assert('返回手势能关掉', nav.interactivePopGestureRecognizer?.isEnabled, false);
      pop.isEnabled = true;
      assert('返回手势能再打开', nav.interactivePopGestureRecognizer?.isEnabled, true);
      assert('返回手势挂在导航控制器的视图上', pop.view === nav.view, true);
    }
    const content = nav.interactiveContentPopGestureRecognizer;
    assert('interactiveContentPopGestureRecognizer 是识别器', content instanceof UIGestureRecognizer, true);
    assert('两个返回手势不是同一个', content !== pop, true);
    assert('interactivePopGestureRecognizer 写了抛 TypeError',
           thrown(() => { /** @type {any} */ (nav).interactivePopGestureRecognizer = null; }).startsWith('TypeError'), true);
  });

  group('自动隐藏导航条', () => {
    const nav = makeNav();
    nav.hidesBarsOnSwipe = true;
    assert('hidesBarsOnSwipe 写 true', nav.hidesBarsOnSwipe, true);
    nav.hidesBarsOnTap = true;
    assert('hidesBarsOnTap 写 true', nav.hidesBarsOnTap, true);
    nav.hidesBarsWhenKeyboardAppears = true;
    assert('hidesBarsWhenKeyboardAppears 写 true', nav.hidesBarsWhenKeyboardAppears, true);
    nav.hidesBarsWhenVerticallyCompact = /** @type {any} */ ('yes');
    assert("hidesBarsWhenVerticallyCompact 写 'yes' 得到 true", nav.hidesBarsWhenVerticallyCompact, true);
    nav.hidesBarsOnSwipe = /** @type {any} */ (0);
    assert('hidesBarsOnSwipe 写 0 得到 false', nav.hidesBarsOnSwipe, false);
    const swipe = nav.barHideOnSwipeGestureRecognizer;
    assert('barHideOnSwipeGestureRecognizer 是拖动识别器', swipe instanceof UIPanGestureRecognizer, true);
    assert('barHideOnSwipeGestureRecognizer 读两次是同一个对象', nav.barHideOnSwipeGestureRecognizer === swipe, true);
    const tap = nav.barHideOnTapGestureRecognizer;
    assert('barHideOnTapGestureRecognizer 是点按识别器', tap instanceof UITapGestureRecognizer, true);
    assert('barHideOnTapGestureRecognizer 读两次是同一个对象', nav.barHideOnTapGestureRecognizer === tap, true);
  });

  group('showViewController', () => {
    const nav = makeNav();
    const next = new UIViewController();
    nav.showViewController(next);
    assert('showViewController 之后栈里两页', nav.viewControllers.length, 2);
    assert('showViewController 之后栈顶是它', nav.topViewController === next, true);
    const third = new UIViewController();
    const sender = new UIView();
    nav.showViewController(third, { sender });
    assert('带 sender 也照常 push', nav.topViewController === third, true);
    const fourth = new UIViewController();
    nav.showViewController(fourth, { sender: null });
    assert('sender 是 null 也照常 push', nav.topViewController === fourth, true);
    assert('第一个参数不是页面抛 TypeError',
           thrown(() => nav.showViewController(/** @type {any} */ ('home'))),
           'TypeError: showViewController: expects a UIViewController');
    assert('抛了之后栈没变', nav.viewControllers.length, 4);
  });

  // 明确不接的：navigationBar 定了暂不接（它返回的 UINavigationBar 没接）；
  // delegate 的两个回调已经是事件 beforeshow / show；popViewControllerAnimated 已经有了，叫 popViewController
  group('明确不接的', () => {
    const nav = makeNav();
    assert('没有 navigationBar', 'navigationBar' in nav, false);
    assert('没有 delegate', 'delegate' in nav, false);
    assert('没有 popViewControllerAnimated（已有 popViewController）', 'popViewControllerAnimated' in nav, false);
  });
}
