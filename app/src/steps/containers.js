// 容器控制器：父子控制器那一组，和 UITabBarController。

import { collectGarbage } from '../support.js';

/** @param {import("../main.js").StepContext} ctx */
export function stepContainers(ctx) {
  const { assert } = ctx;
  /**
   * 调一下，给出抛出来的错误的 name 和 message；没抛就是「没抛」
   * @param {() => void} run
   */
  const thrown = (run) => {
    try { run(); return '没抛'; }
    catch (err) { return /** @type {Error} */ (err).name + ': ' + /** @type {Error} */ (err).message; }
  };

  // ===== 父子控制器 =====
  console.log('--- 父子控制器 ---');
  const parent = new UIViewController();
  const child = new UIViewController();
  assert('一开始没有子控制器', parent.childViewControllers.length, 0);
  assert('一开始没有父控制器', child.parentViewController, null);

  parent.addChildViewController(child);
  parent.view.addSubview(child.view);
  child.didMoveToParentViewController(parent);
  assert('加进去之后 childViewControllers 有一个', parent.childViewControllers.length, 1);
  assert('读回来就是那个对象', parent.childViewControllers[0] === child, true);
  assert('child.parentViewController 是它', child.parentViewController === parent, true);

  // 已经有父控制器的再加给别人：UIKit 会先把它从原来那边摘下来
  const other = new UIViewController();
  other.addChildViewController(child);
  assert('换了父控制器：原来那边没有了', parent.childViewControllers.length, 0);
  assert('换了父控制器：新的那边有了', other.childViewControllers[0] === child, true);

  child.willMoveToParentViewController(null);
  child.view.removeFromSuperview();
  child.removeFromParentViewController();
  assert('移除之后 childViewControllers 空了', other.childViewControllers.length, 0);
  assert('移除之后没有父控制器', child.parentViewController, null);
  assert('没有父控制器时再移除一次不出错', thrown(() => child.removeFromParentViewController()), '没抛');

  // 写错的
  assert('addChildViewController 给的不是页面',
         // @ts-expect-error 要的是 UIViewController
         thrown(() => parent.addChildViewController(UIColor.redColor)),
         'TypeError: addChildViewController needs a UIViewController');
  assert('addChildViewController 给 null',
         // @ts-expect-error 不能是 null
         thrown(() => parent.addChildViewController(null)),
         'TypeError: addChildViewController needs a UIViewController');
  assert('didMoveToParentViewController 给的不是页面',
         // @ts-expect-error 要的是 UIViewController 或 null
         thrown(() => child.didMoveToParentViewController('parent')),
         'TypeError: didMoveToParentViewController needs a UIViewController or null');
  assert('willMoveToParentViewController 可以给 null', thrown(() => child.willMoveToParentViewController(null)), '没抛');
  // 成环的两种。UIKit 自己不拦，照加不误，之后一沿着父链往上找就无限递归、
  // 栈溢出崩掉（实测）。运行时在加之前拦下来
  const cycleError = 'TypeError: addChildViewController: a view controller cannot be added ' +
                     'as a child of itself or of one of its own descendants';
  assert('把自己加成自己的子控制器', thrown(() => parent.addChildViewController(parent)), cycleError);
  const grandchild = new UIViewController();
  parent.addChildViewController(child);
  child.addChildViewController(grandchild);
  assert('把祖先加成子控制器', thrown(() => grandchild.addChildViewController(parent)), cycleError);
  assert('被拒之后原来的关系没动', grandchild.parentViewController === child, true);
  grandchild.removeFromParentViewController();
  child.removeFromParentViewController();

  // additionalSafeAreaInsets：读写往返
  const insets = child.additionalSafeAreaInsets;
  assert('additionalSafeAreaInsets 默认四边都是 0',
         [insets.top, insets.left, insets.bottom, insets.right].join(','), '0,0,0,0');
  child.additionalSafeAreaInsets = new UIEdgeInsets(1, 2, 44, 4);
  const written = child.additionalSafeAreaInsets;
  assert('additionalSafeAreaInsets 写进去读得回来',
         [written.top, written.left, written.bottom, written.right].join(','), '1,2,44,4');
  assert('additionalSafeAreaInsets 读回来的是 UIEdgeInsets', written instanceof UIEdgeInsets, true);
  assert('additionalSafeAreaInsets 给的不是结构体',
         // @ts-expect-error 要的是 UIEdgeInsets
         thrown(() => { child.additionalSafeAreaInsets = 44; }).split(':')[0], 'TypeError');

  // ===== 自己画 tab 条的容器（点下面三个按钮切换）=====
  //
  // 这就是 UITabBarController 在做的事，用父子控制器自己搭一遍：一个壳页面，
  // 里面一次只放一个子页面，底下一排按钮切换。
  const host = ctx.section('父子控制器：自己画的 tab 条（点按钮切换）', 150);
  const shell = new UIViewController();
  ctx.vc.addChildViewController(shell);
  shell.view.translatesAutoresizingMaskIntoConstraints = false;
  shell.view.backgroundColor = 'secondarySystemBackground';
  shell.view.layer.cornerRadius = 12;
  shell.view.clipsToBounds = true;
  host.addSubview(shell.view);
  NSLayoutConstraint.activateConstraints([
    shell.view.leadingAnchor.constraintEqualToAnchor(host.leadingAnchor, { constant: 16 }),
    shell.view.trailingAnchor.constraintEqualToAnchor(host.trailingAnchor, { constant: -16 }),
    shell.view.topAnchor.constraintEqualToAnchor(host.topAnchor),
    shell.view.bottomAnchor.constraintEqualToAnchor(host.bottomAnchor),
  ]);
  shell.didMoveToParentViewController(ctx.vc);

  const barHeight = 44;
  const bar = new UIStackView();
  bar.translatesAutoresizingMaskIntoConstraints = false;
  bar.axis = 'horizontal';
  bar.distribution = 'fillEqually';
  bar.backgroundColor = 'systemBackground';
  shell.view.addSubview(bar);
  NSLayoutConstraint.activateConstraints([
    bar.leadingAnchor.constraintEqualToAnchor(shell.view.leadingAnchor),
    bar.trailingAnchor.constraintEqualToAnchor(shell.view.trailingAnchor),
    bar.bottomAnchor.constraintEqualToAnchor(shell.view.bottomAnchor),
    bar.heightAnchor.constraintEqualToConstant(barHeight),
  ]);

  /** @type {[string, string][]} */
  const specs = [['首页', 'systemIndigo'], ['行情', 'systemTeal'], ['我的', 'systemOrange']];
  const pages = specs.map(([name, color]) => {
    const page = new UIViewController();
    page.view.backgroundColor = color;
    // 壳的 tab 条盖在子页面上面，所以让子页面的安全区底边往上让出一条
    page.additionalSafeAreaInsets = new UIEdgeInsets(0, 0, barHeight, 0);
    const label = new UILabel();
    label.translatesAutoresizingMaskIntoConstraints = false;
    label.text = name + '（这行字贴着安全区的底边）';
    label.textColor = 'white';
    label.font = UIFont.systemFontOfSize(14, { weight: 'semibold' });
    page.view.addSubview(label);
    const safe = page.view.safeAreaLayoutGuide;
    NSLayoutConstraint.activateConstraints([
      label.centerXAnchor.constraintEqualToAnchor(safe.centerXAnchor),
      label.bottomAnchor.constraintEqualToAnchor(safe.bottomAnchor, { constant: -8 }),
    ]);
    return page;
  });

  let current = -1;
  /** @param {number} index */
  const show = (index) => {
    if (index === current) return;
    if (current >= 0) {
      const leaving = pages[current];
      leaving.willMoveToParentViewController(null);
      leaving.view.removeFromSuperview();
      leaving.removeFromParentViewController();
    }
    const entering = pages[index];
    shell.addChildViewController(entering);
    entering.view.translatesAutoresizingMaskIntoConstraints = false;
    shell.view.insertSubview(entering.view, { atIndex: 0 });
    NSLayoutConstraint.activateConstraints([
      entering.view.leadingAnchor.constraintEqualToAnchor(shell.view.leadingAnchor),
      entering.view.trailingAnchor.constraintEqualToAnchor(shell.view.trailingAnchor),
      entering.view.topAnchor.constraintEqualToAnchor(shell.view.topAnchor),
      entering.view.bottomAnchor.constraintEqualToAnchor(shell.view.bottomAnchor),
    ]);
    entering.didMoveToParentViewController(shell);
    current = index;
  };
  specs.forEach(([name], index) => {
    const button = UIButton.buttonWithType('system');
    button.setTitle(name, { forState: ['normal'] });
    button.addEventListener('primaryActionTriggered', () => {
      show(index);
      console.log('  ✓ 真实触摸：自己画的 tab 条切到「' + name + '」，壳里的子控制器 = ' +
                  shell.childViewControllers.length + ' 个');
    });
    bar.addArrangedSubview(button);
  });
  show(0);
  assert('壳是根页面的子控制器', shell.parentViewController === ctx.vc, true);
  assert('壳里一次只有一个子控制器', shell.childViewControllers.length, 1);
  show(1);
  assert('切换之后还是一个', shell.childViewControllers.length, 1);
  assert('切换之后是第二页', shell.childViewControllers[0] === pages[1], true);
  assert('离开的那一页没有父控制器了', pages[0].parentViewController, null);
  show(0);

  // 安全区真的让出来了吗。子页面不贴屏幕边，系统那一份是 0，剩下的就是
  // additionalSafeAreaInsets 自己
  // 实测：页面还没进窗口时 view.safeAreaInsets 是 0，写了 additionalSafeAreaInsets
  // 也读不出来；进了窗口、布局过一轮之后才有。所以等一秒再量。
  // 那行字的底边约束在安全区底边上方 8 pt，所以它离页面底边应该是 44 + 8
  setTimeout(() => {
    const page = pages[0];
    const label = page.view.subviews[0];
    assert('additionalSafeAreaInsets 生效：子页面的安全区底边 = 44',
           page.view.safeAreaInsets.bottom, barHeight);
    assert('additionalSafeAreaInsets 生效：贴着安全区的那行字离页面底边 52 pt',
           page.view.bounds.height - label.frame.y - label.frame.height, barHeight + 8);
  }, 1000);

  // ===== 持有边（GC 之后）=====
  (async () => {
    const keeper = new UIViewController();
    /** @type {Set<string>} */
    const collected = new Set();
    const registry = new FinalizationRegistry((/** @type {string} */ name) => { collected.add(name); });
    (() => {
      const kept = new UIViewController();
      /** @type {any} */ (kept).probe = '挂在子控制器的包装上';
      keeper.addChildViewController(kept);
      registry.register(kept, '还在父控制器里的');
      const gone = new UIViewController();
      keeper.addChildViewController(gone);
      gone.removeFromParentViewController();
      registry.register(gone, '移除了的');
    })();
    const ran = await collectGarbage();
    console.log('--- 父子控制器：持有边 ---');
    if (!ran) {
      console.log('  ! 对照组没被回收，GC 没跑到，这一组未验证');
      return;
    }
    assert('还在父控制器里的子控制器：没被回收', collected.has('还在父控制器里的'), false);
    assert('读回来还是原来那个包装',
           /** @type {any} */ (keeper.childViewControllers[0]).probe, '挂在子控制器的包装上');
    assert('移除了的子控制器：被回收', collected.has('移除了的'), true);
    console.log('--- 父子控制器：以上断言跑完 ---');
  })();
}
