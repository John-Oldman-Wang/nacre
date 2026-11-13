// 锚点、约束、UILayoutGuide、抱紧和抗压缩，以及 CALayer 的圆角、边框、阴影。
//
// CALayer 那段嵌在 Auto Layout 的块里，用的是同一张卡片，所以不拆开。

/** @param {import("../main.js").StepContext} ctx */
export function stepAutolayout(ctx) {
  const { assert, vc } = ctx;
  // ===== Auto Layout =====
  console.log('--- Auto Layout ---');
  {
    // root 是这一步的区块。它在版面上的角色和以前的根视图一样：横向铺满，
    // 安全区就是它自己的范围
    const page = vc.view;
    const root = ctx.section('Auto Layout + CALayer：约束、圆角、阴影', 76);
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
      card.bottomAnchor.constraintEqualToAnchor(guide.bottomAnchor, { constant: -8 }),
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
    page.layoutIfNeeded();

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
    page.layoutIfNeeded();
    assert('改 constant 后重新布局', card.frame.height, 84);
    cardHeight.constant = 60;
    page.layoutIfNeeded();

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
      // 没绑场景的窗口还没有句柄。以前它会被当成普通值，原生收到 nil
      // 之后静默什么都不做——和只读属性写不进去是同一类错，所以要抛。
      // （原来这里还用一个 ES 子类实例做同样的测试，现在继承在构造时
      //   就被拒了，见 steps/subclass.js）
      try {
        card.addSubview(new UIWindow());
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
    page.layoutIfNeeded();
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
    page.layoutIfNeeded();
    // 高度塌成上下两个 8pt——子块的高度本来就是跟着 card 走的（没有固有高度），
    // 撤掉 card 的高度之后这一维谁都没定，求解器取了最小解
    assert('撤掉高度约束后塌成上下两个间距', card.frame.height, 16);
    cardHeight.isActive = true;
    page.layoutIfNeeded();

    // ===== CALayer：圆角、边框、阴影 =====
    console.log('--- CALayer ---');
    {
      // 用上面那张卡片：加圆角、边框、阴影，顺便验证 view 和 layer 一对一
      assert('layer 取两次是同一个对象', card.layer === card.layer, true);
      assert('两个 view 的 layer 不是同一个', card.layer === left.layer, false);

      const layer = card.layer;
      assert('cornerRadius 默认 0', layer.cornerRadius, 0);
      // 头文件写的是「Defaults to kCACornerCurveCircular」，实测不是——
    // 裸 CALayer 自己就是 continuous
    assert('cornerCurve 实测默认 continuous', layer.cornerCurve, 'continuous');
      assert('maskedCorners 默认四个角全圆',
             layer.maskedCorners.join(','), 'minXMinY,maxXMinY,minXMaxY,maxXMaxY');
      assert('borderWidth 默认 0', layer.borderWidth, 0);
      // 默认是不透明黑，不是空。配上默认 0 的 borderWidth，所以看不见
    assert('borderColor 默认是不透明黑，不是 null', layer.borderColor, '#000000');
      assert('shadowOpacity 默认 0——只设颜色看不见东西', layer.shadowOpacity, 0);
      assert('shadowRadius 默认 3', layer.shadowRadius, 3);
      assert('shadowOffset 默认 (0, -3)', '' + layer.shadowOffset, 'CGSize(0, -3)');

      layer.cornerRadius = 14;
      layer.cornerCurve = 'continuous';
      layer.borderWidth = 2;
      layer.borderColor = UIColor.systemBlueColor;
      layer.shadowColor = UIColor.blackColor;
      layer.shadowOpacity = 0.25;
      layer.shadowRadius = 8;
      layer.shadowOffset = new CGSize(0, 4);
      assert('圆角写进去了', layer.cornerRadius, 14);
      assert('cornerCurve 写进去了', layer.cornerCurve, 'continuous');
      assert('borderWidth 写进去了', layer.borderWidth, 2);
      assert('shadowOffset 写进去了', '' + layer.shadowOffset, 'CGSize(0, 4)');

      // 位掩码：第一个用字符串数组的属性
      layer.maskedCorners = ['minXMinY', 'maxXMinY'];
      assert('只圆上面两个角', layer.maskedCorners.join(','), 'minXMinY,maxXMinY');
      layer.maskedCorners = [];
      assert('空数组＝一个角都不圆', layer.maskedCorners.length, 0);
      layer.maskedCorners = ['minXMinY', 'maxXMinY', 'minXMaxY', 'maxXMaxY'];
      try {
        // @ts-expect-error 位掩码只认那四个名字
        layer.maskedCorners = ['topLeft'];
        console.log('  ✗ 不认识的角名居然通过了');
      } catch (err) {
        console.log('  ✓ 不认识的角名被拒:', err.message.slice(0, 44) + '…');
      }
      try {
        // @ts-expect-error 位掩码要数组，不是单个字符串
        layer.maskedCorners = 'minXMinY';
        console.log('  ✗ 位掩码给了非数组居然通过了');
      } catch (err) {
        console.log('  ✓ 位掩码给非数组被拒:', err.message.slice(0, 40) + '…');
      }
      try {
        // @ts-expect-error cornerCurve 只有两个值
        layer.cornerCurve = 'squircle';
        console.log('  ✗ 不认识的 cornerCurve 居然通过了');
      } catch (err) {
        console.log('  ✓ 不认识的 cornerCurve 被拒:', err.message.slice(0, 40) + '…');
      }

      // CGColorRef 的代价，现在看得更清楚了：写进去的是语义色 'systemBlue'，
      // 读回来却是一个定死的 #rrggbb——colorWithCGColor: 新建的那个 UIColor
      // 已经不是动态色了，所以反查不到名字，只能按当前外观合成
      assert('实测：语义色经过 CGColor 之后读回来是定死的十六进制',
             /^#[0-9a-f]{6}$/.test(String(layer.borderColor)), true);
      assert('实测：已经不是 systemBlue 了', layer.borderColor === 'systemBlue', false);
      // 读两次给同一个字符串——上层按值兜了一层，所以 CGColor 每次新建
      // 对象这件事在上层看不见了。对象身份的那条实测记在 internals 里
      assert('实测：上层按值兜了一层，所以读两次给同一个串',
             layer.borderColor === layer.borderColor, true);

      // 每个 view 都有自己的 layer——给三个子块也来点圆角，
      // 免得直角戳出卡片的圆角
      for (const child of [left, middle, right]) child.layer.cornerRadius = 6;
      assert('子块也圆了', left.layer.cornerRadius, 6);
    }
  }
}
