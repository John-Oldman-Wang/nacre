// 由 JS 创建窗口和根页面，再验 UIView 的几何、层级、外观和文字。

/** @param {import("../main.js").StepContext} ctx */
export function stepWindow(ctx) {
  const { assert, scene } = ctx;
  console.log('--- JS 创建窗口 ---');
  const win = new UIWindow(scene);
  console.log('✓ new UIWindow(scene) 成功');
  console.log('  instanceof UIWindow =', win instanceof UIWindow,
              '| instanceof UIView =', win instanceof UIView,
              '| instanceof UIResponder =', win instanceof UIResponder);
  console.log('  windowScene === 传进去的 scene =', win.windowScene === scene);
  console.log('  windowLevel =', win.windowLevel, '| isKeyWindow =', win.isKeyWindow);

  console.log('  --- 延迟创建：不传 scene ---');
  const lazy = new UIWindow();
  console.log('  无参构造成功，windowScene =', lazy.windowScene, '（还没连上）');
  try { lazy.makeKeyAndVisible(); console.log('  ✗ 未连接就能调方法'); }
  catch (err) { console.log('  ✓ 未连接时调方法被拒:', err.message); }
  lazy.windowScene = scene;
  console.log('  赋值 windowScene 后原生对象才创建，isKeyWindow =', lazy.isKeyWindow);
  console.log('  windowScene === scene =', lazy.windowScene === scene);

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

  ctx.vc = vc;
  ctx.win = win;
}
