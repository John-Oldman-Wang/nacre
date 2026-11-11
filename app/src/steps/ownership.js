// 所有权镜像：GC 之后包装的身份还在不在。

/** @param {import("../main.js").StepContext} ctx */
export function stepOwnership(ctx) {
  const { assert } = ctx;
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
    // 子图层那条边：addSublayer 之后 JS 就丢掉引用了，包装必须还活着
    const probeGradient = new CAGradientLayer();
    /** @type {any} */ (probeGradient).probe = '挂在图层包装上';
    probeHost.layer.addSublayer(probeGradient);
    // 局部引用随这个块结束而消失，之后只有镜像还持有它们
  }

  // ===== 按状态存的东西（UIButton）=====
  //
  // 这一组曾经是真漏的：setImage:forState: 把图交给原生，原生 retain 了，
  // 但 JS 侧没记所有权边，读回来的 imageForState 也是普通取值器。丢掉 JS
  // 引用、GC 之后读回来就是个全新的包装。
  //
  // **四个对象必须放在完全对等的位置**：都用 let 存、都显式置空。
  // 否则第一轮 GC 时栈帧还活着，被测的在寄存器里被标成可达，而没存变量的
  // 对照组从来不在——谁活下来都说明不了问题。只有断言「应该死」的时候，
  // 位置对等才是必要条件。
  const stateButton = UIButton.buttonWithType('system');
  stateButton.frame = new CGRect(-200, -200, 10, 10);   // 不挡界面
  probeHost.addSubview(stateButton);                    // 按钮自己进树

  const dotBase = UIImage.imageNamed('JS/assets/dot');
  if (dotBase != null) {
    // 派生出来的是全新的原生对象，别处不会持有它
    let stateImage = /** @type {UIImage|null} */ (
      dotBase.imageWithRenderingMode('alwaysTemplate'));
    /** @type {any} */ (stateImage).probe = '按状态存的图';
    stateButton.setImage(stateImage, { forState: ['normal'] });
    assert('基线：setImage 之后读回来就是同一个包装',
           stateButton.imageForState('normal') === stateImage, true);

    // 这两个颜色常量别处没用过
    let stateColor = /** @type {UIColor|null} */ (UIColor.systemMintColor);
    /** @type {any} */ (stateColor).probe = '按状态存的颜色';
    stateButton.setTitleColor(stateColor, { forState: ['normal'] });

    let stateBg = /** @type {UIImage|null} */ (dotBase.imageWithRenderingMode('alwaysOriginal'));
    /** @type {any} */ (stateBg).probe = '按状态存的背景图';
    stateButton.setBackgroundImage(stateBg, { forState: ['normal'] });

    stateImage = null; stateColor = null; stateBg = null;
  } else {
    console.log('  ! 取不到 dot 图，按状态那一组未验证');
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
    // 颜色属性读出来是字符串了，挂不上 .probe。属性边本身改成验值还在
    assert('属性边：GC 后颜色属性还是那个值', probeHost.backgroundColor, 'systemGreen');
    // 子图层：probeHost.layer 上还挂着几个 subview 的图层，所以按 probe 筛
    const keptLayers = probeHost.layer.sublayers
      .map((l) => /** @type {any} */ (l).probe)
      .filter((probe) => probe !== undefined);
    assert('子图层：GC 后包装还是原来那个', keptLayers.join(','), '挂在图层包装上');

    // 这一条在补镜像之前是段错误，不是断言失败
    const late = orphanAnchor.constraintEqualToConstant(50);
    late.isActive = true;
    assert('GC 之后用孤儿锚点建约束并激活', late.constant, 50);
    assert('它的 view 还活着', late.isActive, true);

    // 按状态存的那三条。对照组已经丢了，所以它们也有资格被回收——
    // 还在就是所有权边真的起作用，不是没轮到它们
    if (dotBase != null) {
      assert('按状态：setImage 的图 GC 后还在',
             /** @type {any} */ (stateButton.imageForState('normal')).probe, '按状态存的图');
      assert('按状态：setTitleColor 的颜色 GC 后还在',
             stateButton.titleColorForState('normal'), 'systemMint');
      assert('按状态：setBackgroundImage 的图 GC 后还在',
             /** @type {any} */ (stateButton.backgroundImageForState('normal')).probe,
             '按状态存的背景图');
    }

    // 导航栈那条边：push 完 JS 就丢掉了引用，包装必须还活着。
    // 漏了 ownAll 的症状是这里读回来是个全新的包装——probe 没了、监听器也没了
    const nav = ctx.nav;
    if (nav != null) {
      const top = nav.topViewController;
      assert('导航栈：GC 后栈顶还是原来那个包装',
             /** @type {any} */ (top).probe, '挂在包装上的 JS 状态');
      assert('导航栈：标题也还在', top && top.title, '幽灵页');
    } else {
      console.log('  ! 没拿到导航控制器，这一条未验证');
    }
  }
  waitForRealGC(80);

}
