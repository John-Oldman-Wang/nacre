// UIControl 的控件事件。

/** @param {import("../main.js").StepContext} ctx */
export function stepControl(ctx) {
  const { assert, vc } = ctx;
  // ===== UIControl：控件事件 =====
  console.log('--- UIControl ---');
  {
    const btn = new UIControl();
    btn.translatesAutoresizingMaskIntoConstraints = false;
    btn.backgroundColor = UIColor.systemGreenColor;
    btn.layer.cornerRadius = 10;
    vc.view.addSubview(btn);
    NSLayoutConstraint.activateConstraints([
      btn.centerXAnchor.constraintEqualToAnchor(vc.view.centerXAnchor),
      btn.bottomAnchor.constraintEqualToAnchor(
        vc.view.safeAreaLayoutGuide.bottomAnchor, { constant: -110 }),
      btn.widthAnchor.constraintEqualToConstant(220),
      btn.heightAnchor.constraintEqualToConstant(52),
    ]);

    assert('默认 isEnabled', btn.isEnabled, true);
    assert('默认 isSelected', btn.isSelected, false);
    assert('默认 isHighlighted', btn.isHighlighted, false);
    assert('默认 state 是 normal', btn.state.join(','), 'normal');
    assert('默认不在跟踪触摸', btn.isTracking, false);
    assert('默认内容水平居中', btn.contentHorizontalAlignment, 'center');

    // state 是位掩码，由三个布尔合成
    btn.isSelected = true;
    assert('选中后 state', btn.state.join(','), 'selected');
    btn.isEnabled = false;
    assert('再禁用后 state 两个位都在', [...btn.state].sort().join(','), 'disabled,selected');
    btn.isEnabled = true;
    btn.isSelected = false;
    assert('恢复后又是 normal', btn.state.join(','), 'normal');

    btn.contentHorizontalAlignment = 'leading';
    assert('内容对齐能写', btn.contentHorizontalAlignment, 'leading');
    try {
      // @ts-expect-error 对齐方式只有那六个
      btn.contentHorizontalAlignment = '靠边';
      console.log('  ✗ 不认识的对齐方式居然通过了');
    } catch (err) {
      console.log('  ✓ 不认识的对齐方式被拒:', err.message.slice(0, 42) + '…');
    }
    btn.contentHorizontalAlignment = 'center';

    // 事件名认不出来要抛——控件的事件类型是有限的
    try {
      // @ts-expect-error 没有这个控件事件
      btn.addEventListener('mousedown', () => {});
      console.log('  ✗ 不认识的事件名居然通过了');
    } catch (err) {
      console.log('  ✓ 不认识的事件名被拒:', err.message.slice(0, 48) + '…');
    }

    /** @type {string[]} */ const fired = [];
    const onUp = (/** @type {Event} */ e) => {
      fired.push(e.type);
      // 事件对象的 target 就是这个控件
      if (e.target !== btn) fired.push('target 不对');
    };
    btn.addEventListener('touchUpInside', onUp);
    btn.addEventListener('touchDown', (e) => fired.push(e.type));

    // 主动触发：一次两个。注意这会真的走原生 sendActionsForControlEvents，
    // 不是 JS 侧自己派发
    btn.sendActionsForControlEvents(['touchDown', 'touchUpInside']);
    assert('主动触发是异步的，当场还没到', fired.length, 0);

    try {
      // @ts-expect-error 要数组不是字符串
      btn.sendActionsForControlEvents('touchDown');
      console.log('  ✗ 非数组居然通过了');
    } catch (err) {
      console.log('  ✓ 非数组被拒:', err.message.slice(0, 44) + '…');
    }

    // 不能靠「谁先发生」推断「谁先到 JS」：控件事件走 postToJS 排一跳，
    // 而定时器的唤醒可能早就排在队列里了。所以轮询等条件，别数轮次。
    /** @param {number} want @param {number} left @param {() => void} then */
    function waitFor(want, left, then) {
      if (fired.length >= want || left <= 0) { then(); return; }
      setTimeout(() => waitFor(want, left - 1, then), 10);
    }
    waitFor(2, 50, () => {
      assert('主动触发的两个事件都到了', [...fired].sort().join(','),
             'touchDown,touchUpInside');
      // 摘掉监听器之后不该再收到
      btn.removeEventListener('touchUpInside', onUp);
      fired.length = 0;
      btn.sendActionsForControlEvents(['touchUpInside']);
      // 这条是「不该发生」，只能等足够久
      setTimeout(() => {
        assert('removeEventListener 之后收不到', fired.length, 0);

        // ---- 触摸类事件带位置 ----
        //
        // 按事件**类型**分，和 Web 一样：clientX 在 MouseEvent 上，
        // KeyboardEvent 根本没这个字段，不是「有但为 null」。
        /** @type {any[]} */
        const touched = [];
        /** @type {any[]} */
        const plain = [];
        const onTouch = (/** @type {any} */ e) => touched.push(e);
        const onValue = (/** @type {any} */ e) => plain.push(e);
        btn.addEventListener('touchDown', onTouch);
        btn.addEventListener('valueChanged', onValue);
        btn.sendActionsForControlEvents(['touchDown', 'valueChanged']);
        setTimeout(() => {
          assert('主动触发的 touchDown 到了', touched.length, 1);
          // sendActionsForControlEvents 那条路上压根没有 UIEvent。
          // 给 null 不给 (0,0)——(0,0) 是合法坐标，和「没有触点」分不开
          assert('没有真实触点时 location 是 null', touched[0].location, null);
          assert('没有真实触点时 tapCount 是 0', touched[0].tapCount, 0);
          assert('valueChanged 上根本没有 location 这个字段',
                 'location' in plain[0], false);
          assert('valueChanged 上也没有 tapCount', 'tapCount' in plain[0], false);
          btn.removeEventListener('touchDown', onTouch);
          btn.removeEventListener('valueChanged', onValue);

          // 留一个监听器给真实触摸用。这条只能肉眼看：位置要落在按钮内
          btn.addEventListener('touchUpInside', (/** @type {any} */ e) => {
            console.log('  ✓ 真实触摸：收到 touchUpInside，state =',
                        btn.state.join(',') + '，location = ' + e.location +
                        '，tapCount = ' + e.tapCount);
          });
          btn.addEventListener('touchDown', (/** @type {any} */ e) => {
            console.log('  ✓ 真实触摸：收到 touchDown，isHighlighted = ' +
                        btn.isHighlighted + '，location = ' + e.location);
          });
          console.log('  ✓ 绿色按钮已上屏，等着被点（点下去会打出触点位置）');
        }, 200);
      }, 200);
    });
  }
}
