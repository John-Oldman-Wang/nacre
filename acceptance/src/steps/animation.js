// Core Animation：CABasicAnimation、时间曲线、事务。
//
// 这一步要验的核心事实有三条：
//   - fromValue / toValue 该放什么类型由 keyPath 决定，所以要先设 keyPath
//   - addAnimation 会**拷贝**，animationForKey 读回来的不是你给的那个对象
//   - 独立子图层改属性**默认就在动画**（隐式动画），CATransaction 才关得掉

/** @param {import("../main.js").StepContext} ctx */
export function stepAnimation(ctx) {
  const { assert, vc } = ctx;
  console.log('--- CAMediaTimingFunction：时间曲线 ---');

  const ease = CAMediaTimingFunction.functionWithName('easeInEaseOut');
  assert('按名字拿得到曲线', ease instanceof CAMediaTimingFunction, true);
  // 0 和 3 是端点，永远是 (0,0) 和 (1,1)
  assert('端点 0 是原点', '' + ease.controlPointAtIndex(0), 'CGPoint(0, 0)');
  assert('端点 3 是 (1,1)', '' + ease.controlPointAtIndex(3), 'CGPoint(1, 1)');
  console.log('  实测 easeInEaseOut 的两个控制点 = ' +
              ease.controlPointAtIndex(1) + ' ' + ease.controlPointAtIndex(2));
  const custom = CAMediaTimingFunction.functionWithControlPoints(0.25, 0.1, 0.25, 1);
  assert('控制点建得出来', custom instanceof CAMediaTimingFunction, true);
  try {
    // @ts-expect-error 只认那五个名字
    CAMediaTimingFunction.functionWithName('bounce');
    console.log('  ✗ 不认识的曲线名居然通过了');
  } catch (e) {
    const message = e instanceof Error ? e.message : '';
    assert('不认识的曲线名当场抛', e instanceof TypeError, true);
    assert('错误里列出了可选值', message.includes('easeInEaseOut'), true);
  }
  try {
    // @ts-expect-error CAMediaTimingFunction 不可构造
    new CAMediaTimingFunction();
    console.log('  ✗ CAMediaTimingFunction 居然构造出来了');
  } catch (e) {
    assert('CAMediaTimingFunction 不可构造', e instanceof TypeError, true);
  }

  console.log('--- CABasicAnimation：从一个值走到另一个值 ---');

  const anim = CABasicAnimation.animationWithKeyPath('opacity');
  assert('按 keyPath 建得出来', anim instanceof CABasicAnimation, true);
  assert('是个 CAPropertyAnimation', anim instanceof CAPropertyAnimation, true);
  assert('也是个 CAAnimation', anim instanceof CAAnimation, true);
  assert('keyPath 读得回来', anim.keyPath, 'opacity');

  // ---- 默认值，对着头文件核过 ----
  assert('默认 duration 是 0（加上去时会换成事务的值）', anim.duration, 0);
  assert('默认 beginTime', anim.beginTime, 0);
  assert('默认 speed', anim.speed, 1);
  assert('默认 timeOffset', anim.timeOffset, 0);
  assert('默认 repeatCount', anim.repeatCount, 0);
  assert('默认不回放', anim.autoreverses, false);
  assert('默认 fillMode', anim.fillMode, 'removed');
  assert('默认跑完就摘掉', anim.removedOnCompletion, true);
  assert('默认没有曲线', anim.timingFunction, null);
  assert('默认没有起点值', anim.fromValue, null);

  // ---- 时间属性读写 ----
  anim.duration = 0.4;
  anim.repeatCount = 2.5;
  anim.autoreverses = true;
  anim.speed = 2;
  anim.fillMode = 'forwards';
  anim.removedOnCompletion = false;
  anim.timingFunction = ease;
  assert('duration 写得进去', anim.duration, 0.4);
  assert('repeatCount 可以是小数', anim.repeatCount, 2.5);
  assert('autoreverses 写得进去', anim.autoreverses, true);
  assert('fillMode 写得进去', anim.fillMode, 'forwards');
  assert('曲线写进去读回来是同一个', anim.timingFunction === ease, true);
  anim.repeatCount = Infinity;
  assert('无限循环', anim.repeatCount, Infinity);

  try {
    // @ts-expect-error fillMode 只认那四个
    anim.fillMode = 'hold';
    console.log('  ✗ 不认识的 fillMode 居然通过了');
  } catch (e) {
    const message = e instanceof Error ? e.message : '';
    assert('不认识的 fillMode 当场抛', e instanceof TypeError, true);
    assert('错误里列出了可选值', message.includes('forwards'), true);
  }
  try {
    // @ts-expect-error keyPath 只认表里那些
    CABasicAnimation.animationWithKeyPath('frame');
    console.log('  ✗ frame 居然能动画');
  } catch (e) {
    const message = e instanceof Error ? e.message : '';
    assert('frame 不能动画（它是推出来的）', e instanceof TypeError, true);
    assert('错误里把能动的列出来了', message.includes('position'), true);
  }

  // ---- 值的类型由 keyPath 决定 ----
  const bare = new CABasicAnimation();
  assert('没有 keyPath 的动画也建得出来', bare.keyPath, null);
  try {
    bare.toValue = 1;
    console.log('  ✗ 没设 keyPath 居然能设值');
  } catch (e) {
    const message = e instanceof Error ? e.message : '';
    assert('没设 keyPath 就设值要抛', e instanceof TypeError, true);
    assert('错误说清了要先设 keyPath', message.includes('keyPath'), true);
  }

  anim.fromValue = 0;
  anim.toValue = 1;
  assert('数字值往返', anim.fromValue + '→' + anim.toValue, '0→1');

  const move = CABasicAnimation.animationWithKeyPath('position');
  move.toValue = new CGPoint(30, 40);
  assert('点值往返', '' + move.toValue, 'CGPoint(30, 40)');
  try {
    move.toValue = 5;
    console.log('  ✗ position 收了一个数字');
  } catch (e) {
    const message = e instanceof Error ? e.message : '';
    assert('值配不上 keyPath 就抛', e instanceof TypeError, true);
    assert('错误点名是哪个 keyPath', message.includes('position'), true);
  }

  const tint = CABasicAnimation.animationWithKeyPath('strokeColor');
  tint.fromValue = 'systemBlue';
  tint.toValue = '#FF2D55';
  assert('颜色值原样还回来', tint.toValue, '#FF2D55');
  try {
    tint.toValue = 0.5;
    console.log('  ✗ strokeColor 收了一个数字');
  } catch (e) {
    const message = e instanceof Error ? e.message : '';
    assert('颜色 keyPath 收到数字就抛', e instanceof TypeError, true);
    assert('错误说要一个颜色', message.includes('color'), true);
  }

  const morph = CABasicAnimation.animationWithKeyPath('path');
  const target = UIBezierPath.bezierPathWithRect(new CGRect(0, 0, 10, 10));
  morph.toValue = target;
  assert('路径值读回来是条路径', morph.toValue instanceof UIBezierPath, true);
  morph.toValue = null;
  assert('值能清掉', morph.toValue, null);

  console.log('--- 挂到图层上 ---');

  const probe = new CAShapeLayer();
  probe.path = UIBezierPath.bezierPathWithRect(new CGRect(0, 0, 20, 20));
  assert('一开始没有动画', probe.animationKeys().length, 0);

  const slow = CABasicAnimation.animationWithKeyPath('opacity');
  slow.duration = 20;          // 够长，断言期间不会自己结束
  slow.fromValue = 0;
  slow.toValue = 1;
  probe.addAnimation(slow, { forKey: 'fade' });
  assert('挂上之后查得到 key', probe.animationKeys().join(','), 'fade');
  const copy = probe.animationForKey('fade');
  assert('读回来的确实是个动画', copy instanceof CABasicAnimation, true);
  // **这是 addAnimation 的关键事实**：图层持有的是一份拷贝
  assert('读回来的不是原来那个对象', copy === slow, false);

  probe.removeAnimationForKey('fade');
  assert('摘掉之后 key 没了', probe.animationKeys().length, 0);
  assert('摘掉之后 animationForKey 给 null', probe.animationForKey('fade'), null);

  probe.addAnimation(slow, { forKey: 'a' });
  probe.addAnimation(slow, { forKey: 'b' });
  assert('能挂多个', probe.animationKeys().length, 2);
  probe.removeAllAnimations();
  assert('removeAllAnimations 清空', probe.animationKeys().length, 0);

  // ---- 隐式动画 ----
  //
  // 这条之前一直标着「未验证」。CA 给每个可动画属性一个默认 action，
  // 在 UIKit 的动画块外面改就会生成一个过渡。**要在图层树里才算数**：
  // 上面那个 probe 没有父图层，实测拿不到任何隐式动画
  probe.removeAllAnimations();
  probe.strokeEnd = 0.5;
  console.log('  实测：没有父图层时改 strokeEnd，animationKeys = [' +
              probe.animationKeys() + ']');

  const inTree = new CAShapeLayer();
  inTree.path = UIBezierPath.bezierPathWithRect(new CGRect(0, 0, 20, 20));
  vc.view.layer.addSublayer(inTree);
  inTree.strokeEnd = 0.5;
  console.log('  实测：在树里改 strokeEnd，animationKeys = [' +
              inTree.animationKeys() + ']');

  inTree.removeAllAnimations();
  CATransaction.begin();
  CATransaction.setDisableActions(true);
  assert('事务里 disableActions 为真', CATransaction.disableActions(), true);
  inTree.strokeEnd = 1;
  CATransaction.commit();
  assert('关掉之后不生成隐式动画', inTree.animationKeys().length, 0);
  assert('事务外面 disableActions 回到假', CATransaction.disableActions(), false);

  CATransaction.begin();
  CATransaction.setAnimationDuration(1.5);
  assert('事务的时长写得进去', CATransaction.animationDuration(), 1.5);
  CATransaction.commit();
  try {
    // @ts-expect-error CATransaction 没有实例
    new CATransaction();
    console.log('  ✗ CATransaction 居然构造出来了');
  } catch (e) {
    assert('CATransaction 不可构造', e instanceof TypeError, true);
  }

  // ---- 上屏：折线画出来 + 扇形脉动 ----
  const card = new UIView();
  card.frame = new CGRect(16, 0, 150, 90);
  card.backgroundColor = 'secondarySystemBackground';
  card.layer.cornerRadius = 10;
  ctx.section('CABasicAnimation：描线、脉动', 90).addSubview(card);

  const poly = new UIBezierPath();
  poly.moveToPoint(new CGPoint(12, 70));
  poly.addLineToPoint(new CGPoint(40, 28));
  poly.addLineToPoint(new CGPoint(62, 54));
  poly.addLineToPoint(new CGPoint(88, 18));
  const drawn = new CAShapeLayer();
  drawn.path = poly;
  drawn.fillColor = null;
  drawn.strokeColor = 'systemGreen';
  drawn.lineWidth = 3;
  drawn.lineCap = 'round';
  drawn.lineJoin = 'round';
  drawn.frame = card.bounds;
  card.layer.addSublayer(drawn);

  const draw = CABasicAnimation.animationWithKeyPath('strokeEnd');
  draw.fromValue = 0;
  draw.toValue = 1;
  draw.duration = 1.2;
  draw.timingFunction = ease;
  drawn.strokeEnd = 1;        // 模型值也设过去，否则动画完会弹回
  drawn.addAnimation(draw, { forKey: 'draw' });

  const dot = new CAShapeLayer();
  dot.path = UIBezierPath.bezierPathWithOvalInRect(new CGRect(112, 32, 26, 26));
  dot.fillColor = 'systemOrange';
  dot.frame = card.bounds;
  card.layer.addSublayer(dot);

  const pulse = CABasicAnimation.animationWithKeyPath('opacity');
  pulse.fromValue = 1;
  pulse.toValue = 0.2;
  pulse.duration = 0.7;
  pulse.autoreverses = true;
  pulse.repeatCount = Infinity;
  dot.addAnimation(pulse, { forKey: 'pulse' });
  assert('两个动画都挂上了',
         drawn.animationKeys().length + dot.animationKeys().length, 2);

  // ---- 事件：跑完的和被掐掉的 ----
  const host = new CALayer();
  host.frame = new CGRect(0, 0, 10, 10);
  card.layer.addSublayer(host);

  const quick = CABasicAnimation.animationWithKeyPath('opacity');
  quick.fromValue = 1;
  quick.toValue = 0;
  quick.duration = 0.1;
  /** @type {string[]} */
  const log = [];
  quick.addEventListener('start', () => { log.push('start'); });
  quick.addEventListener('stop', (e) => { log.push('stop:' + e.finished); });
  host.addAnimation(quick, { forKey: 'quick' });

  const killed = CABasicAnimation.animationWithKeyPath('opacity');
  killed.fromValue = 1;
  killed.toValue = 0;
  killed.duration = 30;
  /** @type {string[]} */
  const killedLog = [];
  killed.addEventListener('stop', (e) => { killedLog.push('stop:' + e.finished); });
  host.addAnimation(killed, { forKey: 'killed' });
  host.removeAnimationForKey('killed');

  // **不定长等待。** 实测动画要等主线程闲下来才开始跑：这一轮里
  // addAnimation 之后 751 ms 才 didStart，quick 的 stop 到 2.49 秒才来。
  // 写死一个 500 ms 就是在赌一个我们控制不了的时序，所以改成等事件到达，
  // 到点还没来就报未验证——和文件那条大写入同一个形状
  const deadline = Date.now() + 8000;
  const waitForEvents = () => {
    const done = log.includes('stop:true') && killedLog.length > 0;
    if (!done && Date.now() < deadline) {
      setTimeout(waitForEvents, 200);
      return;
    }
    if (done) {
      assert('动画开始发了 start', log.includes('start'), true);
      assert('跑完了发 stop 且 finished 为真', log.includes('stop:true'), true);
      assert('被摘掉的 finished 为假', killedLog.join(','), 'stop:false');
    } else {
      console.log('  ! 8 秒内没等到动画事件（收到的是 [' + log + '] [' +
                  killedLog + ']），这一组未验证');
    }
    // 这会儿图层已经渲染过一轮了，再量一次隐式动画——和场景接入那一刻比
    inTree.removeAllAnimations();
    inTree.strokeEnd = 0.25;
    console.log('  实测：渲染过之后再改 strokeEnd，animationKeys = [' +
                inTree.animationKeys() + ']');
    inTree.removeFromSuperlayer();

    try {
      // @ts-expect-error 动画只有这两个事件
      quick.addEventListener('finish', () => {});
      console.log('  ✗ 不认识的事件名居然通过了');
    } catch (e) {
      const message = e instanceof Error ? e.message : '';
      assert('不认识的事件名当场抛', e instanceof TypeError, true);
      assert('错误里列出了可选值', message.includes('stop'), true);
    }
    console.log('--- 动画：以上异步断言跑完 ---');
  };
  setTimeout(waitForEvents, 200);
}
