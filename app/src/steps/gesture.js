// 手势识别器：点按（UITapGestureRecognizer）、长按（UILongPressGestureRecognizer）。

/** @param {import("../main.js").StepContext} ctx */
export function stepGesture(ctx) {
  const { assert, vc } = ctx;
  // ===== 手势识别器 =====
  //
  // 它不是视图，是挂在视图上的对象。在这之前只有 UIControl 能收点击；
  // 有了它，任意视图都能点，而且识别器收的是视图**和所有子视图**上的触摸，
  // 所以在根上挂一个 + hitTest 就能在 JS 里自己做冒泡。
  console.log('--- 手势识别器 ---');

  // ---- 基类不能直接建 ----
  try {
    new UIGestureRecognizer();
    console.log('  ✗ 基类居然建出来了');
  } catch (err) {
    console.log('  ✓ 基类不能 new:', err.message);
  }

  // ---- 默认值（对头文件）----
  const tap = new UITapGestureRecognizer();
  assert('点按是 UIGestureRecognizer', tap instanceof UIGestureRecognizer, true);
  assert('它不是视图', /** @type {object} */ (tap) instanceof UIView, false);
  assert('默认 state', tap.state, 'possible');
  assert('没挂时 view 是 null', tap.view, null);
  assert('默认 isEnabled', tap.isEnabled, true);
  assert('默认 cancelsTouchesInView', tap.cancelsTouchesInView, true);
  assert('默认 delaysTouchesBegan', tap.delaysTouchesBegan, false);
  assert('默认 delaysTouchesEnded', tap.delaysTouchesEnded, true);
  assert('没有触摸时 numberOfTouches', tap.numberOfTouches, 0);
  assert('点按：默认点 1 下', tap.numberOfTapsRequired, 1);
  assert('点按：默认 1 根手指', tap.numberOfTouchesRequired, 1);

  const press = new UILongPressGestureRecognizer();
  assert('长按是 UIGestureRecognizer', press instanceof UIGestureRecognizer, true);
  assert('长按：默认按住 0.5 秒', press.minimumPressDuration, 0.5);
  assert('长按：默认允许挪 10 点', press.allowableMovement, 10);
  assert('长按：默认先点 0 下', press.numberOfTapsRequired, 0);
  assert('长按：默认 1 根手指', press.numberOfTouchesRequired, 1);

  // ---- 读写 ----
  tap.numberOfTapsRequired = 2;
  assert('numberOfTapsRequired 可写', tap.numberOfTapsRequired, 2);
  tap.numberOfTapsRequired = 1;
  tap.numberOfTouchesRequired = 2;
  assert('numberOfTouchesRequired 可写', tap.numberOfTouchesRequired, 2);
  tap.numberOfTouchesRequired = 1;
  tap.isEnabled = false;
  assert('isEnabled 可写', tap.isEnabled, false);
  tap.isEnabled = true;
  tap.cancelsTouchesInView = false;
  assert('cancelsTouchesInView 可写', tap.cancelsTouchesInView, false);
  tap.cancelsTouchesInView = true;
  tap.delaysTouchesBegan = true;
  assert('delaysTouchesBegan 可写', tap.delaysTouchesBegan, true);
  tap.delaysTouchesBegan = false;
  tap.delaysTouchesEnded = false;
  assert('delaysTouchesEnded 可写', tap.delaysTouchesEnded, false);
  tap.delaysTouchesEnded = true;
  press.minimumPressDuration = 0.3;
  assert('minimumPressDuration 可写', press.minimumPressDuration, 0.3);
  press.allowableMovement = 20;
  assert('allowableMovement 可写', press.allowableMovement, 20);
  press.numberOfTapsRequired = 1;
  assert('长按的 numberOfTapsRequired 可写', press.numberOfTapsRequired, 1);
  press.numberOfTapsRequired = 0;

  // ---- 写错了要抛 ----
  try {
    tap.numberOfTapsRequired = -1;
    console.log('  ✗ 负的次数居然收下了，读回来是', tap.numberOfTapsRequired);
  } catch (err) {
    console.log('  ✓ 负的次数被拒:', err.message);
  }
  try {
    tap.numberOfTapsRequired = 1.5;
    console.log('  ✗ 不是整数的次数居然收下了');
  } catch (err) {
    console.log('  ✓ 不是整数的次数被拒:', err.message);
  }
  try {
    // @ts-expect-error 时长要数字
    press.minimumPressDuration = '0.5';
    console.log('  ✗ 字符串时长居然收下了');
  } catch (err) {
    console.log('  ✓ 字符串时长被拒:', err.message);
  }
  assert('被拒之后原值没动', press.minimumPressDuration, 0.3);
  try {
    // @ts-expect-error state 只读
    tap.state = 'ended';
    console.log('  ✗ state 居然能写');
  } catch (err) {
    console.log('  ✓ state 只读:', err instanceof TypeError);
  }
  try {
    // @ts-expect-error 没有这个事件
    tap.addEventListener('tap', () => {});
    console.log('  ✗ 不认识的事件名居然订上了');
  } catch (err) {
    console.log('  ✓ 不认识的事件名被拒:', err.message);
  }

  // ---- 挂和摘 ----
  const a = new UIView();
  const b = new UIView();
  assert('没挂识别器的视图：空数组', a.gestureRecognizers.length, 0);
  a.addGestureRecognizer(tap);
  assert('挂上之后 view 指回来', tap.view === a, true);
  assert('视图上有它', a.gestureRecognizers.length, 1);
  assert('读出来是同一个包装', a.gestureRecognizers[0] === tap, true);
  a.addGestureRecognizer(tap);
  assert('重复挂不会变成两个', a.gestureRecognizers.length, 1);
  // 一个识别器同一时刻只能在一个视图上
  b.addGestureRecognizer(tap);
  assert('挂到另一个视图：view 换过去', tap.view === b, true);
  assert('原来那个视图上没有了', a.gestureRecognizers.length, 0);
  b.removeGestureRecognizer(tap);
  assert('摘掉之后 view 是 null', tap.view, null);
  assert('视图上也没有了', b.gestureRecognizers.length, 0);
  try {
    // @ts-expect-error 要的是识别器
    a.addGestureRecognizer(new UIView());
    console.log('  ✗ 把视图当识别器居然通过了');
  } catch (err) {
    console.log('  ✓ 参数不是识别器被拒:', err.message);
  }

  // ---- 订阅和退订 ----
  const noop = () => {};
  for (const type of /** @type {const} */ (['began', 'changed', 'ended', 'cancelled'])) {
    press.addEventListener(type, noop);
    press.removeEventListener(type, noop);
  }
  assert('四个事件名都能订、能退，state 没被碰', press.state, 'possible');

  // ---- 屏幕上：一块能点、能长按的容器，等真实触摸 ----
  //
  // 容器是普通 UIView，里面一个普通子块、一个 UIButton。识别器挂在容器上。
  // 要肉眼看的有三条：
  //   点子块   → 容器的点按触发，hitTest 找得到子块（JS 自己做冒泡的依据）
  //   点按钮   → 只有按钮自己的 touchUpInside，容器的点按不触发
  //   长按容器 → began，抬手 ended
  const pad = new UIView();
  pad.frame = new CGRect(270, 688, 140, 56);
  pad.backgroundColor = 'systemIndigo';
  pad.layer.cornerRadius = 10;
  const chip = new UIView();
  chip.frame = new CGRect(8, 8, 40, 40);
  chip.backgroundColor = 'systemOrange';
  chip.layer.cornerRadius = 6;
  pad.addSubview(chip);
  const button = UIButton.buttonWithType('system');
  button.frame = new CGRect(60, 8, 72, 40);
  button.setTitle('按钮', { forState: ['normal'] });
  button.setTitleColor('white', { forState: ['normal'] });
  pad.addSubview(button);
  vc.view.addSubview(pad);

  /** @param {UIView|null} hit */
  const nameOf = (hit) =>
    hit === chip ? '子块' : hit === button ? '按钮' : hit === pad ? '容器本身' : '别的视图';

  const padTap = new UITapGestureRecognizer();
  padTap.addEventListener('ended', (e) => {
    const { location, numberOfTouches } = /** @type {UIGestureRecognizerEvent} */ (e);
    const hit = location === null ? null : pad.hitTest(location);
    console.log('  ✓ 真实触摸：点按 ended，location = ' + location +
                '，hitTest 落在' + nameOf(hit) + '，numberOfTouches = ' + numberOfTouches +
                '，回调里读 state = ' + padTap.state);
  });
  pad.addGestureRecognizer(padTap);

  const padPress = new UILongPressGestureRecognizer();
  let moved = 0;
  padPress.addEventListener('began', (e) => {
    const { location } = /** @type {UIGestureRecognizerEvent} */ (e);
    moved = 0;
    console.log('  ✓ 真实触摸：长按 began，location = ' + location +
                '，回调里读 state = ' + padPress.state);
  });
  padPress.addEventListener('changed', () => { moved += 1; });
  padPress.addEventListener('ended', (e) => {
    const { location, numberOfTouches } = /** @type {UIGestureRecognizerEvent} */ (e);
    console.log('  ✓ 真实触摸：长按 ended，location = ' + location +
                '，中间 changed ' + moved + ' 次，numberOfTouches = ' + numberOfTouches);
  });
  padPress.addEventListener('cancelled', () => {
    console.log('  ✓ 真实触摸：长按 cancelled');
  });
  pad.addGestureRecognizer(padPress);

  button.addEventListener('touchUpInside', () => {
    console.log('  ✓ 真实触摸：按钮自己收到 touchUpInside（容器的点按不该跟着触发）');
  });

  assert('容器上挂了两个识别器', pad.gestureRecognizers.length, 2);
  console.log('  ✓ 靛蓝色容器已上屏（右下，橙色子块 + 按钮），等着被点和长按');
}
