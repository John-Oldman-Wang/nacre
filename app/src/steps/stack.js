// UIStackView：一维排列、嵌套、隐藏即塌陷。

/** @param {import("../main.js").StepContext} ctx */
export function stepStack(ctx) {
  const { assert, vc } = ctx;
  // ===== UIStackView =====
  //
  // 这一步的动机就在上面那段 Auto Layout 里：三个等距的块手写了 6 条约束。
  // 这里同样的排列是 4 行属性，而且多了一件约束做不到的事——隐藏某一项会
  // 让它塌陷、其余项自动补位。
  console.log('--- UIStackView ---');
  {
    const root = vc.view;
    const guide = root.safeAreaLayoutGuide;
    /** @param {UIColor} color */
    const block = (color) => {
      const v = new UIView();
      v.backgroundColor = color;
      v.layer.cornerRadius = 6;
      return v;
    };

    // ---- 默认值（头文件只写了 distribution / alignment / 两个布尔）----
    const fresh = new UIStackView();
    assert('是 UIView 的子类', fresh instanceof UIView, true);
    assert('默认 axis', fresh.axis, 'horizontal');
    assert('默认 distribution', fresh.distribution, 'fill');
    assert('默认 alignment', fresh.alignment, 'fill');
    assert('默认 spacing', fresh.spacing, 0);
    assert('默认不按基线排', fresh.isBaselineRelativeArrangement, false);
    assert('默认不按边距排', fresh.isLayoutMarginsRelativeArrangement, false);
    assert('空 stack 没有排列项', fresh.arrangedSubviews.length, 0);

    // ---- 构造时就把排列项给它 ----
    const a = block(UIColor.systemRedColor);
    const b = block(UIColor.systemOrangeColor);
    const inner = new UIStackView([block(UIColor.systemTealColor),
                                  block(UIColor.systemIndigoColor)]);
    inner.axis = 'vertical';
    inner.distribution = 'fillEqually';
    inner.spacing = 4;

    const row = new UIStackView([a, b, inner]);
    assert('构造参数进了排列', row.arrangedSubviews.length, 3);
    assert('包装身份一致', row.arrangedSubviews[0] === a, true);
    assert('排列项同时也是 subview', a.superview === row, true);
    assert('嵌套：里层还是 UIStackView', row.arrangedSubviews[2] === inner, true);
    assert('里层自己也有两项', inner.arrangedSubviews.length, 2);
    // 加进排列的 view 不用自己关 autoresizing：stack 负责给它们建约束
    assert('排列项的 translatesAutoresizing 被关掉',
           a.translatesAutoresizingMaskIntoConstraints, false);

    row.translatesAutoresizingMaskIntoConstraints = false;
    row.spacing = 12;
    row.distribution = 'fillEqually';
    root.addSubview(row);
    NSLayoutConstraint.activateConstraints([
      row.leadingAnchor.constraintEqualToAnchor(guide.leadingAnchor, { constant: 16 }),
      row.trailingAnchor.constraintEqualToAnchor(guide.trailingAnchor, { constant: -16 }),
      row.bottomAnchor.constraintEqualToAnchor(guide.bottomAnchor, { constant: -240 }),
      row.heightAnchor.constraintEqualToConstant(44),
    ]);
    root.layoutIfNeeded();

    // ---- 真的排开了 ----
    const total = row.frame.width;
    const widths = row.arrangedSubviews.map((v) => v.frame.width);
    assert('stack 宽 = 安全区宽 - 32', total, guide.layoutFrame.width - 32);
    assert('fillEqually：三项等宽', new Set(widths).size, 1);
    assert('三项宽 + 两个间距 = 总宽',
           Math.round(widths[0] * 3 + 24), Math.round(total));
    assert('第二项的起点 = 第一项宽 + 间距',
           Math.round(b.frame.x), Math.round(widths[0] + 12));
    assert('嵌套的里层被撑满高', inner.frame.height, 44);
    assert('里层两块各占一半减间距',
           inner.arrangedSubviews[0].frame.height, (44 - 4) / 2);

    // ---- 隐藏即塌陷：这是约束做不到的 ----
    b.isHidden = true;
    root.layoutIfNeeded();
    const twoUp = row.arrangedSubviews.map((v) => v.frame.width);
    assert('隐藏项宽度归零', twoUp[1], 0);
    assert('剩下两项平分', twoUp[0], twoUp[2]);
    assert('两项宽 + 一个间距 = 总宽',
           Math.round(twoUp[0] * 2 + 12), Math.round(total));
    assert('隐藏的那项还在排列里', row.arrangedSubviews.length, 3);
    b.isHidden = false;
    root.layoutIfNeeded();
    assert('显示回来又是三等分', row.arrangedSubviews[0].frame.width, widths[0]);

    // ---- 对齐的别名：leading 和 top 是同一个值 ----
    row.alignment = 'top';
    assert('写 top 读回 leading', row.alignment, 'leading');
    row.alignment = 'bottom';
    assert('写 bottom 读回 trailing', row.alignment, 'trailing');
    row.alignment = 'leading';
    assert('写 leading 当然也读回 leading', row.alignment, 'leading');
    row.alignment = 'fill';

    // ---- 间距的两个哨兵值在 JS 侧是字符串 ----
    row.spacing = 'system';
    assert('system 间距读回字符串', row.spacing, 'system');
    row.spacing = 12;
    assert('数字间距读回数字', row.spacing, 12);

    assert('没设过自定义间距就是 default', row.customSpacingAfterView(a), 'default');
    row.setCustomSpacing(40, { afterView: a });
    assert('自定义间距读回来', row.customSpacingAfterView(a), 40);
    root.layoutIfNeeded();
    assert('自定义间距真的生效了', Math.round(b.frame.x - a.frame.width), 40);
    row.setCustomSpacing('system', { afterView: a });
    assert('自定义间距也能要系统值', row.customSpacingAfterView(a), 'system');
    row.setCustomSpacing('default', { afterView: a });
    assert('撤回后回到 spacing', row.customSpacingAfterView(a), 'default');
    root.layoutIfNeeded();

    // ---- 排列和 subviews 是两件事 ----
    row.removeArrangedSubview(b);
    assert('移出排列', row.arrangedSubviews.length, 2);
    assert('但仍然是 subview', b.superview === row, true);
    assert('subviews 里还有三个', row.subviews.length, 3);
    row.insertArrangedSubview(b, { atIndex: 1 });
    assert('插回原位', row.arrangedSubviews[1] === b, true);

    b.removeFromSuperview();
    assert('removeFromSuperview 顺带出排列', row.arrangedSubviews.length, 2);
    assert('也不再是 subview', b.superview, null);
    row.insertArrangedSubview(b, { atIndex: 1 });
    assert('再插回来', row.arrangedSubviews[1] === b, true);
    assert('它又成了 subview', b.superview === row, true);

    // ---- 写错要抛，不静默 ----
    try {
      // @ts-expect-error 这是 flexbox 的词，不是 UIKit 的
      row.distribution = 'spaceBetween';
      console.log('  ✗ 不认识的 distribution 居然通过了');
    } catch (err) {
      console.log('  ✓ 不认识的 distribution 被拒:', err.message.slice(0, 48) + '…');
    }
    try {
      // @ts-expect-error UIKit 这里叫 firstBaseline / lastBaseline
      row.alignment = 'baseline';
      console.log('  ✗ 不认识的 alignment 居然通过了');
    } catch (err) {
      console.log('  ✓ 不认识的 alignment 被拒:', err.message.slice(0, 48) + '…');
    }
    try {
      // @ts-expect-error spacing 只认数字和 'system'
      row.spacing = 'default';
      console.log('  ✗ spacing 居然收下了 default');
    } catch (err) {
      console.log('  ✓ spacing 不认 default（设了效果是 0，没有意义）');
    }
    try {
      row.insertArrangedSubview(block(UIColor.systemPinkColor), { atIndex: 99 });
      console.log('  ✗ 越界的 atIndex 居然通过了');
    } catch (err) {
      console.log('  ✓ 越界的 atIndex 被拒:', err.message.slice(0, 48) + '…');
    }
    try {
      // @ts-expect-error 少了 atIndex
      row.insertArrangedSubview(block(UIColor.systemPinkColor), {});
      console.log('  ✗ 缺 atIndex 居然通过了');
    } catch (err) {
      console.log('  ✓ 缺 atIndex 被拒:', err.message);
    }
    try {
      // @ts-expect-error 少了 afterView
      row.setCustomSpacing(8, {});
      console.log('  ✗ 缺 afterView 居然通过了');
    } catch (err) {
      console.log('  ✓ 缺 afterView 被拒:', err.message);
    }

    // ---- 屏幕上留一排「中间那块是隐藏的」做对照 ----
    const left2 = block(UIColor.systemGreenColor);
    const gone = block(UIColor.systemGrayColor);
    const right2 = block(UIColor.systemPurpleColor);
    gone.isHidden = true;
    const rowB = new UIStackView([left2, gone, right2]);
    rowB.translatesAutoresizingMaskIntoConstraints = false;
    rowB.axis = 'horizontal';
    rowB.distribution = 'fillEqually';
    rowB.spacing = 12;
    root.addSubview(rowB);
    NSLayoutConstraint.activateConstraints([
      rowB.leadingAnchor.constraintEqualToAnchor(guide.leadingAnchor, { constant: 16 }),
      rowB.trailingAnchor.constraintEqualToAnchor(guide.trailingAnchor, { constant: -16 }),
      rowB.bottomAnchor.constraintEqualToAnchor(guide.bottomAnchor, { constant: -296 }),
      rowB.heightAnchor.constraintEqualToConstant(44),
    ]);
    root.layoutIfNeeded();
    assert('对照排：两块平分，中间那块不占位',
           Math.round(left2.frame.width * 2 + 12), Math.round(rowB.frame.width));
  }

  // ===== 内边距 =====
  //
  // 内边距是 UIView 的属性，不是 UIStackView 的。stack 这边只有一个开关
  // （isLayoutMarginsRelativeArrangement），决定排列项要不要按它缩进。
  console.log('--- 内边距（layoutMargins）---');
  {
    // leading 在从左往右的语言里是左，反过来是右。断言跟着环境走
    const ltr = application.layoutDirection === 'ltr';

    // ---- 默认值 ----
    const plain = new UIView();
    assert('默认 layoutMargins', '' + plain.layoutMargins, 'UIEdgeInsets(8, 8, 8, 8)');
    assert('默认 directionalLayoutMargins', '' + plain.directionalLayoutMargins,
           'NSDirectionalEdgeInsets(8, 8, 8, 8)');
    assert('默认会把安全区加上去', plain.insetsLayoutMarginsFromSafeArea, true);
    assert('默认不沿用父视图的边距', plain.preservesSuperviewLayoutMargins, false);
    assert('读出来是结构体类',
           plain.directionalLayoutMargins instanceof NSDirectionalEdgeInsets, true);

    // ---- 读写：两个属性是同一份数据 ----
    plain.directionalLayoutMargins = new NSDirectionalEdgeInsets(1, 2, 3, 4);
    assert('写进去读出来', '' + plain.directionalLayoutMargins,
           'NSDirectionalEdgeInsets(1, 2, 3, 4)');
    assert('layoutMargins 跟着变', '' + plain.layoutMargins,
           ltr ? 'UIEdgeInsets(1, 2, 3, 4)' : 'UIEdgeInsets(1, 4, 3, 2)');
    plain.layoutMargins = { top: 5, left: 6, bottom: 7, right: 8 };
    assert('反过来写，directional 也跟着变', '' + plain.directionalLayoutMargins,
           ltr ? 'NSDirectionalEdgeInsets(5, 6, 7, 8)'
               : 'NSDirectionalEdgeInsets(5, 8, 7, 6)');
    plain.preservesSuperviewLayoutMargins = true;
    assert('preservesSuperviewLayoutMargins 可写', plain.preservesSuperviewLayoutMargins, true);
    plain.insetsLayoutMarginsFromSafeArea = false;
    assert('insetsLayoutMarginsFromSafeArea 可写', plain.insetsLayoutMarginsFromSafeArea, false);

    // ---- 写错了要抛 ----
    try {
      // @ts-expect-error 少了 trailing
      plain.directionalLayoutMargins = { top: 1, leading: 2, bottom: 3 };
      console.log('  ✗ 缺字段居然通过了');
    } catch (err) {
      console.log('  ✓ 缺字段被拒:', err.message);
    }
    try {
      // @ts-expect-error 字段只读
      plain.directionalLayoutMargins.top = 9;
      console.log('  ✗ 结构体字段居然能写');
    } catch (err) {
      console.log('  ✓ 结构体字段只读:', err instanceof TypeError);
    }

    // ---- 效果：stack 的排列项按边距缩进 ----
    // 不挂进窗口也能算布局，而且这样安全区是 0，不会掺进来
    const cell = new UIView();
    const padded = new UIStackView([cell]);
    padded.frame = new CGRect(0, 0, 200, 100);
    padded.layoutIfNeeded();
    assert('开关没开：排列项贴边', '' + cell.frame, 'CGRect(0, 0, 200, 100)');
    padded.directionalLayoutMargins = { top: 10, leading: 20, bottom: 30, trailing: 40 };
    padded.layoutIfNeeded();
    assert('只设边距不开开关：还是贴边', '' + cell.frame, 'CGRect(0, 0, 200, 100)');
    padded.isLayoutMarginsRelativeArrangement = true;
    // 实测：不在窗口里、又已经布局过一次的 stack，改开关不会让它自己
    // 重新布局，只调 layoutIfNeeded() 排列项原地不动。要先 setNeedsLayout()。
    // 在窗口里的不用，见下面那一组
    padded.setNeedsLayout();
    padded.layoutIfNeeded();
    assert('开了开关：排列项缩进去', '' + cell.frame,
           ltr ? 'CGRect(20, 10, 140, 60)' : 'CGRect(40, 10, 140, 60)');

    // ---- 同一件事，在窗口里：改完直接布局就生效 ----
    // 垫在最底下、不收触摸，免得挡住别的步骤。安全区那条先关掉，
    // 单独在下一组验
    const cell2 = new UIView();
    const live = new UIStackView([cell2]);
    live.isUserInteractionEnabled = false;
    live.insetsLayoutMarginsFromSafeArea = false;
    live.frame = new CGRect(0, 0, 200, 100);
    vc.view.insertSubview(live, { atIndex: 0 });
    vc.view.layoutIfNeeded();
    assert('在窗口里，没开开关：贴边', '' + cell2.frame, 'CGRect(0, 0, 200, 100)');
    live.directionalLayoutMargins = { top: 10, leading: 20, bottom: 30, trailing: 40 };
    live.isLayoutMarginsRelativeArrangement = true;
    vc.view.layoutIfNeeded();
    assert('在窗口里，开了开关：缩进去', '' + cell2.frame,
           ltr ? 'CGRect(20, 10, 140, 60)' : 'CGRect(40, 10, 140, 60)');
    live.removeFromSuperview();

    // ---- 安全区：伸到安全区外面的视图，边距会被系统加上安全区 ----
    // 探针铺满根视图。垫在最底下、不收触摸，免得挡住别的步骤
    const root = vc.view;
    const probe = new UIView();
    probe.isUserInteractionEnabled = false;
    probe.frame = root.bounds;
    root.insertSubview(probe, { atIndex: 0 });
    root.layoutIfNeeded();
    const safeTop = probe.safeAreaInsets.top;
    probe.directionalLayoutMargins = { top: 16, leading: 16, bottom: 16, trailing: 16 };
    if (safeTop > 0) {
      assert('开着：上边距 = 写的 16 + 安全区',
             probe.directionalLayoutMargins.top, 16 + safeTop);
      probe.insetsLayoutMarginsFromSafeArea = false;
      assert('关掉：写多少就是多少', probe.directionalLayoutMargins.top, 16);
    } else {
      // 安全区要等窗口布局过才有值，没等到就不下结论
      console.log('  ! 这时候安全区还是 0，「边距自动加上安全区」这一组未验证');
    }
    probe.removeFromSuperview();
  }
}
