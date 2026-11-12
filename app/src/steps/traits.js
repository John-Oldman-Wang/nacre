// 外观特征：深色还是浅色、屏幕几倍、文字多大。读、强制、变化通知。

/** @param {import("../main.js").StepContext} ctx */
export function stepTraits(ctx) {
  const { assert, scene } = ctx;
  const noop = () => {};
  /** @param {() => void} run */
  const thrown = (run) => {
    try { run(); return '没抛'; }
    catch (err) { return /** @type {Error} */ (err).name + ': ' + /** @type {Error} */ (err).message; }
  };
  /** @param {UITraitCollection} t */
  const describe = (t) =>
    'style=' + t.userInterfaceStyle + ' scale=' + t.displayScale +
    ' 文字=' + t.preferredContentSizeCategory + ' 横=' + t.horizontalSizeClass +
    ' 纵=' + t.verticalSizeClass + ' 对比度=' + t.accessibilityContrast +
    ' 方向=' + t.layoutDirection;

  console.log('--- 外观特征 ---');

  // ===== 读 =====
  const traits = scene.traitCollection;
  assert('scene.traitCollection 是 UITraitCollection', traits instanceof UITraitCollection, true);
  assert('UITraitCollection 不能自己建',
         // @ts-expect-error 构造函数是私有的
         thrown(() => new UITraitCollection()),
         'TypeError: Illegal constructor: UITraitCollection is created by the runtime, not by new');
  console.log('  实测：场景的外观特征 ' + describe(traits));
  assert('userInterfaceStyle 是 light 或 dark',
         ['light', 'dark'].includes(traits.userInterfaceStyle), true);
  assert('displayScale 是正数', traits.displayScale > 0, true);
  assert('文字大小是表里的一档', traits.preferredContentSizeCategory !== 'unspecified', true);
  assert('横向的 size class', ['compact', 'regular'].includes(traits.horizontalSizeClass), true);
  assert('纵向的 size class', ['compact', 'regular'].includes(traits.verticalSizeClass), true);
  assert('对比度', ['normal', 'high'].includes(traits.accessibilityContrast), true);
  assert('文字方向', ['leftToRight', 'rightToLeft'].includes(traits.layoutDirection), true);
  assert('字段只读',
         // @ts-expect-error 只读
         thrown(() => { traits.userInterfaceStyle = 'dark'; }).split(':')[0], 'TypeError');

  // 页面和视图上也有
  assert('页面有 traitCollection', ctx.vc.traitCollection instanceof UITraitCollection, true);
  assert('视图有 traitCollection', ctx.vc.view.traitCollection instanceof UITraitCollection, true);
  // 还没进窗口的视图读到什么
  const loose = new UIView();
  console.log('  实测：还没进窗口的视图 ' + describe(loose.traitCollection));

  // ===== 写：强制深浅色 =====
  assert('overrideUserInterfaceStyle 默认', loose.overrideUserInterfaceStyle, 'unspecified');
  const systemStyle = traits.userInterfaceStyle;
  const otherStyle = systemStyle === 'dark' ? 'light' : 'dark';
  loose.overrideUserInterfaceStyle = otherStyle;
  assert('overrideUserInterfaceStyle 写得进去', loose.overrideUserInterfaceStyle, otherStyle);
  // 实测：写完**立刻**读 traitCollection，拿到的还是旧值。系统把特征的更新
  // 攒到稍后统一做，做完才派发 traitchange。所以要在事件里读，不要写完就读
  assert('强制之后立刻读 traitCollection：还是原来的',
         loose.traitCollection.userInterfaceStyle, systemStyle);
  const inner = new UIView();
  loose.addSubview(inner);
  assert('overrideUserInterfaceStyle 写错',
         // @ts-expect-error 只有那三个
         thrown(() => { loose.overrideUserInterfaceStyle = 'night'; }),
         'TypeError: overrideUserInterfaceStyle has no value "night"; expected one of: ' +
         'unspecified / light / dark');
  assert('写错之后原值没动', loose.overrideUserInterfaceStyle, otherStyle);
  // 这两个视图一直不进窗口。过一会儿再读，看系统有没有替它们更新
  setTimeout(() => {
    console.log('  实测：不在窗口里的视图，强制成 ' + otherStyle + ' 之后过 2 秒，自己 = ' +
                loose.traitCollection.userInterfaceStyle + '，它的子视图 = ' +
                inner.traitCollection.userInterfaceStyle);
  }, 2000);

  const probePage = new UIViewController();
  assert('页面的 overrideUserInterfaceStyle 默认', probePage.overrideUserInterfaceStyle, 'unspecified');
  probePage.overrideUserInterfaceStyle = 'dark';
  assert('页面的 overrideUserInterfaceStyle 写得进去', probePage.overrideUserInterfaceStyle, 'dark');
  assert('页面强制之后，它的视图跟着', probePage.view.traitCollection.userInterfaceStyle, 'dark');

  // ===== 变化通知：事件名 =====
  //
  // traitchange 在视图、页面、场景上都能订，包括那些「只认自己那几个事件名」
  // 的子类。它们报「不认识这个名字」时，名单的末尾也要有它
  /** @type {[string, EventTarget][]} */
  const targets = [
    ['普通视图', new UIView()],
    ['UILabel', new UILabel()],
    ['UIControl', new UIControl()],
    ['UIButton', UIButton.buttonWithType('system')],
    ['UIScrollView', new UIScrollView()],
    ['UIWindow', ctx.win],
    ['UIViewController', new UIViewController()],
    ['UINavigationController', new UINavigationController()],
    ['UITabBarController', new UITabBarController()],
    ['UIWindowScene', scene],
  ];
  for (const [label, target] of targets) {
    assert(label + '：traitchange 能订也能退',
           thrown(() => {
             target.addEventListener('traitchange', noop);
             target.removeEventListener('traitchange', noop);
           }), '没抛');
  }
  assert('不是视图也不是页面的对象不认 traitchange',
         // @ts-expect-error 手势识别器没有这个事件
         thrown(() => new UITapGestureRecognizer().addEventListener('traitchange', noop)).split(';')[0],
         'TypeError: addEventListener has no value "traitchange"');
  assert('控件报不认识的事件名时，名单末尾有 traitchange',
         // @ts-expect-error 没有这个事件
         thrown(() => new UIControl().addEventListener('mousedown', noop)).endsWith(' / traitchange'), true);

  // ===== 变化通知：真的会来 =====
  //
  // 一张卡片挂在界面上，强制它换一种外观，看它自己收不收得到 traitchange。
  // 下面三个按钮改的是整个窗口，卡片会跟着变
  const host = ctx.section('外观特征：强制深浅色（点按钮）', 110);
  const card = new UIView();
  card.frame = new CGRect(16, 0, 200, 56);
  card.backgroundColor = 'secondarySystemBackground';
  card.layer.cornerRadius = 10;
  card.layer.borderWidth = 2;
  card.layer.borderColor = 'label';
  host.addSubview(card);
  const caption = new UILabel();
  caption.frame = new CGRect(12, 0, 180, 56);
  caption.textColor = 'label';
  caption.font = UIFont.systemFontOfSize(14, { weight: 'medium' });
  card.addSubview(caption);
  const refresh = () => {
    caption.text = '现在是 ' + card.traitCollection.userInterfaceStyle;
    // 图层的颜色在写入那一刻就定死了，外观变了要自己重设一遍
    card.layer.borderColor = 'label';
  };
  refresh();

  /** @type {string[]} */
  const seen = [];
  card.addEventListener('traitchange', (e) => {
    const before = /** @type {UITraitChangeEvent} */ (e).previousTraitCollection;
    const change = before.userInterfaceStyle + ' → ' + card.traitCollection.userInterfaceStyle;
    seen.push(change);
    refresh();
    console.log('  ✓ 卡片收到 traitchange：' + change +
                '，previousTraitCollection 是 UITraitCollection = ' +
                (before instanceof UITraitCollection));
  });

  /** @type {[string, UIUserInterfaceStyle][]} */
  const choices = [['跟随系统', 'unspecified'], ['浅色', 'light'], ['深色', 'dark']];
  choices.forEach(([title, style], index) => {
    const button = UIButton.buttonWithType('system');
    button.setTitle(title, { forState: ['normal'] });
    button.frame = new CGRect(16 + index * 100, 64, 92, 40);
    button.addEventListener('primaryActionTriggered', () => {
      ctx.win.overrideUserInterfaceStyle = style;
      console.log('  ✓ 真实触摸：窗口的 overrideUserInterfaceStyle = ' + style);
    });
    host.addSubview(button);
  });

  // 等界面上屏之后再动：先记下现在是什么，强制成另一种，再改回去
  setTimeout(() => {
    const original = card.traitCollection.userInterfaceStyle;
    const flipped = original === 'dark' ? 'light' : 'dark';
    card.overrideUserInterfaceStyle = flipped;
    assert('强制卡片换外观：立刻读还是旧的', card.traitCollection.userInterfaceStyle, original);
    setTimeout(() => {
      assert('强制卡片换外观：收到一次 traitchange', seen.join(' | '), original + ' → ' + flipped);
      assert('强制卡片换外观：这时读到的是新的', card.traitCollection.userInterfaceStyle, flipped);
      assert('卡片里的子视图也跟着变了', caption.traitCollection.userInterfaceStyle, flipped);
      card.overrideUserInterfaceStyle = 'unspecified';
      setTimeout(() => {
        assert('改回跟随：又收到一次',
               seen.join(' | '), original + ' → ' + flipped + ' | ' + flipped + ' → ' + original);
        console.log('--- 外观特征：以上断言跑完 ---');
      }, 500);
    }, 500);
  }, 1500);

  // 系统切换深浅色（设置里改，或者模拟器菜单 Features → Toggle Appearance）
  scene.addEventListener('traitchange', (e) => {
    const before = /** @type {UITraitChangeEvent} */ (e).previousTraitCollection;
    console.log('  ✓ 系统的外观变了：场景收到 traitchange，' + before.userInterfaceStyle +
                ' → ' + scene.traitCollection.userInterfaceStyle +
                '；文字大小 ' + before.preferredContentSizeCategory +
                ' → ' + scene.traitCollection.preferredContentSizeCategory);
  });
}
