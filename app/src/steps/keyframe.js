// A6-2：关键帧、动画组、弹簧。
//
// 要验的核心事实三条：
//   - values 的类型和 toValue 一样由 keyPath 决定，颜色走对象数组通道
//   - 给了 path，values 就作废
//   - 弹簧不看 duration，要知道多久停下来看 settlingDuration

/** @param {import("../main.js").StepContext} ctx */
export function stepKeyframe(ctx) {
  const { assert, vc } = ctx;
  console.log('--- CAKeyframeAnimation：关键帧 ---');

  const frames = CAKeyframeAnimation.animationWithKeyPath('opacity');
  assert('按 keyPath 建得出来', frames instanceof CAKeyframeAnimation, true);
  assert('是个 CAPropertyAnimation', frames instanceof CAPropertyAnimation, true);
  assert('不是 CABasicAnimation', frames instanceof CABasicAnimation, false);
  assert('默认没有 values', frames.values, null);
  assert('默认没有 path', frames.path, null);
  assert('默认没有 keyTimes', frames.keyTimes, null);
  assert('默认插值方式', frames.calculationMode, 'linear');
  assert('默认不跟着转向', frames.rotationMode, null);
  assert('默认没有分段曲线', frames.timingFunctions.length, 0);

  // ---- 数字的 values 走标量通道 ----
  frames.values = [0, 1, 0.3, 1];
  assert('数字 values 往返', (frames.values || []).join(','), '0,1,0.3,1');
  frames.keyTimes = [0, 0.25, 0.6, 1];
  assert('keyTimes 往返', (frames.keyTimes || []).join(','), '0,0.25,0.6,1');
  frames.values = null;
  assert('values 能清掉', frames.values, null);

  // ---- 点的 values ----
  const move = CAKeyframeAnimation.animationWithKeyPath('position');
  move.values = [new CGPoint(0, 0), new CGPoint(10, 20), new CGPoint(30, 5)];
  const pts = move.values || [];
  assert('点 values 的个数', pts.length, 3);
  assert('点 values 读回来是结构体', '' + pts[1], 'CGPoint(10, 20)');

  // ---- 颜色的 values 走对象数组通道 ----
  const flash = CAKeyframeAnimation.animationWithKeyPath('fillColor');
  flash.values = ['systemRed', '#FFCC00', 'systemGreen'];
  const colors = flash.values || [];
  assert('颜色 values 的个数', colors.length, 3);
  // 走的是 CGColor，所以读回来是解析后的具体颜色，不是写进去的那个串
  console.log('  实测：颜色 values 读回来 = ' + colors.join(' '));

  try {
    // 这里**没有 @ts-expect-error**：values 的类型声明是所有可能类型的并集，
    // 类型层表达不了「具体哪一种由 keyPath 决定」。所以这条只能靠运行时拦
    frames.values = ['systemRed'];
    console.log('  ✗ opacity 的 values 收了颜色');
  } catch (e) {
    assert('values 配不上 keyPath 就抛', e instanceof TypeError, true);
  }
  const bare = new CAKeyframeAnimation();
  try {
    bare.values = [1, 2];
    console.log('  ✗ 没设 keyPath 居然能设 values');
  } catch (e) {
    const message = e instanceof Error ? e.message : '';
    assert('没设 keyPath 就设 values 要抛', e instanceof TypeError, true);
    assert('错误说清了要先设 keyPath', message.includes('keyPath'), true);
  }

  // ---- 两个枚举 ----
  frames.calculationMode = 'discrete';
  assert('calculationMode 写得进去', frames.calculationMode, 'discrete');
  frames.rotationMode = 'auto';
  assert('rotationMode 写得进去', frames.rotationMode, 'auto');
  frames.rotationMode = null;
  assert('rotationMode 能设回 null', frames.rotationMode, null);
  for (const [key, bad, expected] of /** @type {[string, string, string][]} */ ([
    ['calculationMode', 'ease', 'cubicPaced'],
    ['rotationMode', 'reverse', 'autoReverse'],
  ])) {
    try {
      /** @type {any} */ (frames)[key] = bad;
      console.log('  ✗ ' + key + ' 写错了居然通过了');
    } catch (e) {
      const message = e instanceof Error ? e.message : '';
      assert(key + ' 写错当场抛', e instanceof TypeError, true);
      assert(key + ' 的错误里列出了可选值', message.includes(expected), true);
    }
  }

  // ---- 分段曲线 ----
  const ease = CAMediaTimingFunction.functionWithName('easeInEaseOut');
  const linear = CAMediaTimingFunction.functionWithName('linear');
  frames.timingFunctions = [ease, linear, ease];
  assert('分段曲线的个数', frames.timingFunctions.length, 3);
  assert('读回来还是同一批对象', frames.timingFunctions[0] === ease, true);

  // ---- path 盖掉 values ----
  const trail = new UIBezierPath();
  trail.moveToPoint(new CGPoint(20, 70));
  trail.addQuadCurveToPoint(new CGPoint(120, 70), { controlPoint: new CGPoint(70, 10) });
  const walk = CAKeyframeAnimation.animationWithKeyPath('position');
  walk.path = trail;
  assert('写进去的路径原样还回来', walk.path === trail, true);
  walk.path = null;
  assert('path 能清掉', walk.path, null);

  console.log('--- CASpringAnimation：弹簧 ---');

  const spring = CASpringAnimation.animationWithKeyPath('position');
  assert('弹簧是 CABasicAnimation 的子类', spring instanceof CABasicAnimation, true);
  // 默认值对着头文件核过
  assert('默认 mass', spring.mass, 1);
  assert('默认 stiffness', spring.stiffness, 100);
  assert('默认 damping', spring.damping, 10);
  assert('默认 initialVelocity', spring.initialVelocity, 0);
  assert('默认不允许过阻尼', spring.allowsOverdamping, false);
  const settled = spring.settlingDuration;
  assert('settlingDuration 是算出来的正数', settled > 0, true);
  console.log('  实测：默认弹簧 settlingDuration = ' + settled.toFixed(3) +
              ' s，bounce = ' + spring.bounce.toFixed(3) +
              '，perceptualDuration = ' + spring.perceptualDuration.toFixed(3));
  // 阻尼调大，晃得更快停
  spring.damping = 40;
  assert('阻尼变大之后更快停下', spring.settlingDuration < settled, true);
  console.log('  实测：damping 10 → 40，settlingDuration ' + settled.toFixed(3) +
              ' → ' + spring.settlingDuration.toFixed(3));
  spring.damping = 12;
  spring.mass = 1.2;
  spring.initialVelocity = 2;
  assert('mass 写得进去', spring.mass, 1.2);
  assert('initialVelocity 写得进去', spring.initialVelocity, 2);
  // 它是 CABasicAnimation，所以 toValue 照用
  spring.toValue = new CGPoint(10, 10);
  assert('弹簧也能设 toValue', '' + spring.toValue, 'CGPoint(10, 10)');

  console.log('--- CAAnimationGroup：一组一起跑 ---');

  const group = new CAAnimationGroup();
  assert('动画组建得出来', group instanceof CAAnimationGroup, true);
  assert('是个 CAAnimation', group instanceof CAAnimation, true);
  assert('默认是空的', group.animations.length, 0);
  const fade = CABasicAnimation.animationWithKeyPath('opacity');
  fade.fromValue = 1;
  fade.toValue = 0.2;
  const grow = CABasicAnimation.animationWithKeyPath('cornerRadius');
  grow.fromValue = 0;
  grow.toValue = 12;
  group.animations = [fade, grow];
  group.duration = 1.4;
  assert('组里有两个', group.animations.length, 2);
  assert('读回来还是原来那两个对象', group.animations[0] === fade, true);
  assert('第二个也是', group.animations[1] === grow, true);
  try {
    // @ts-expect-error 只收动画
    group.animations = [fade, UIColor.redColor];
    console.log('  ✗ 动画组收了一个颜色');
  } catch (e) {
    assert('动画组收到非动画就抛', e instanceof TypeError, true);
  }

  // ---- 上屏：沿路径走 + 跳色 + 弹进来 ----
  const card = new UIView();
  card.frame = new CGRect(230, 514, 150, 90);
  card.backgroundColor = 'secondarySystemBackground';
  card.layer.cornerRadius = 10;
  vc.view.addSubview(card);

  // 一个圆点沿曲线来回走，跟着切线转
  const dot = new CAShapeLayer();
  dot.path = UIBezierPath.bezierPathWithOvalInRect(new CGRect(-5, -3, 10, 6));
  dot.fillColor = 'systemBlue';
  dot.frame = card.bounds;
  card.layer.addSublayer(dot);

  const walkIt = CAKeyframeAnimation.animationWithKeyPath('position');
  walkIt.path = trail;
  walkIt.rotationMode = 'auto';
  walkIt.calculationMode = 'paced';   // 匀速，忽略 keyTimes
  walkIt.duration = 2.4;
  walkIt.autoreverses = true;
  walkIt.repeatCount = Infinity;
  dot.addAnimation(walkIt, { forKey: 'walk' });

  // 一个方块在三个颜色之间跳（discrete：到点直接换，不渐变）
  const chip = new CAShapeLayer();
  chip.path = UIBezierPath.bezierPathWithRoundedRect(
    new CGRect(16, 16, 22, 22), { cornerRadius: 5 });
  chip.fillColor = 'systemRed';
  chip.frame = card.bounds;
  card.layer.addSublayer(chip);

  const jump = CAKeyframeAnimation.animationWithKeyPath('fillColor');
  jump.values = ['systemRed', '#FFCC00', 'systemGreen'];
  jump.calculationMode = 'discrete';
  jump.duration = 1.8;
  jump.repeatCount = Infinity;
  chip.addAnimation(jump, { forKey: 'jump' });

  // 一个方块弹进来，同时圆角长出来（动画组）
  const box = new UIView();
  box.frame = new CGRect(100, 24, 40, 40);
  box.backgroundColor = 'systemIndigo';
  card.addSubview(box);

  const bounceIn = CASpringAnimation.animationWithKeyPath('position');
  bounceIn.fromValue = new CGPoint(box.layer.position.x, -40);
  bounceIn.toValue = box.layer.position;
  bounceIn.mass = 1;
  bounceIn.stiffness = 120;
  bounceIn.damping = 8;
  box.layer.addAnimation(bounceIn, { forKey: 'bounce' });

  const together = new CAAnimationGroup();
  const radius = CABasicAnimation.animationWithKeyPath('cornerRadius');
  radius.fromValue = 0;
  radius.toValue = 10;
  const dim = CABasicAnimation.animationWithKeyPath('opacity');
  dim.fromValue = 0;
  dim.toValue = 1;
  together.animations = [radius, dim];
  together.duration = 1.2;
  box.layer.cornerRadius = 10;    // 模型值也设过去
  box.layer.addAnimation(together, { forKey: 'together' });

  assert('卡片上三个图层都挂了动画',
         dot.animationKeys().length + chip.animationKeys().length +
         box.layer.animationKeys().length, 4);
  assert('动画组读回来还是 CAAnimationGroup',
         box.layer.animationForKey('together') instanceof CAAnimationGroup, true);
  assert('弹簧读回来还是 CASpringAnimation',
         box.layer.animationForKey('bounce') instanceof CASpringAnimation, true);
}
