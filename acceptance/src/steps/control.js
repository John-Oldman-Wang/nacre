import { customEventWorks, enumIgnored, ENUM_IGNORED } from '../support.js';
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
    const host = ctx.section('UIControl：控件事件（点它）', 52);
    host.addSubview(btn);
    NSLayoutConstraint.activateConstraints([
      btn.centerXAnchor.constraintEqualToAnchor(host.centerXAnchor),
      btn.bottomAnchor.constraintEqualToAnchor(host.bottomAnchor),
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
    assert('不认识的对齐方式：不抛、值不变', enumIgnored(() => {
      // @ts-expect-error 对齐方式只有那六个
      btn.contentHorizontalAlignment = '靠边';
    }, () => btn.contentHorizontalAlignment), ENUM_IGNORED);
    btn.contentHorizontalAlignment = 'center';

    // 事件名认不出来要抛——控件的事件类型是有限的
    // 不认识的事件名不拒绝，当自定义事件（和浏览器里的 EventTarget 一样）
    assert('控件：不认识的事件名当自定义事件', customEventWorks(btn, 'not-a-real-event'), '收到一次');

    // 订阅失败不能留下半截状态（回归）。原来是先登记监听器、再去订阅，订阅
    // 一失败，登记的那条还在：同一个回调第二次注册被当成重复，静默返回；
    // 换一个回调也因为「这个类型已经有人听了」不再去订阅。
    // 不认识的事件名现在不算失败（当自定义事件），还会失败的是 @ 开头的
    // 保留名字，所以拿它来验
    {
      const probe = new UIControl();
      let reached = false;
      const handler = () => { reached = true; };
      /** @param {() => void} callback */
      const tryAdd = (callback) => {
        try {
          // @ts-expect-error @ 开头的名字是运行时保留的
          probe.addEventListener('@reserved', callback);
          return '没抛';
        } catch (err) {
          return err instanceof TypeError ? 'TypeError' : String(err);
        }
      };
      assert('保留的事件名：第一次注册抛', tryAdd(handler), 'TypeError');
      assert('保留的事件名：同一个回调再注册，照样抛', tryAdd(handler), 'TypeError');
      assert('保留的事件名：换一个回调注册，照样抛', tryAdd(() => {}), 'TypeError');
      probe.dispatchEvent(new Event('@reserved'));
      assert('保留的事件名：没有留下监听器', reached, false);

      // 失败过之后，合法的注册、去重、移除、once 照常
      let ups = 0;
      const onProbeUp = () => { ups++; };
      probe.addEventListener('touchupinside', onProbeUp);
      probe.addEventListener('touchupinside', onProbeUp);
      probe.dispatchEvent(new Event('touchupinside'));
      assert('失败之后：合法事件重复注册只算一次', ups, 1);
      probe.removeEventListener('touchupinside', onProbeUp);
      probe.dispatchEvent(new Event('touchupinside'));
      assert('失败之后：移除了就不再收到', ups, 1);
      let downs = 0;
      probe.addEventListener('touchdown', () => { downs++; }, { once: true });
      probe.dispatchEvent(new Event('touchdown'));
      probe.dispatchEvent(new Event('touchdown'));
      assert('失败之后：once 只收到一次', downs, 1);
    }

    // 输入框上「用户按了回车」那个控件事件叫 return（原来是这张表里唯一一个
    // 驼峰的名字）。旧名字不保留：订阅时当自定义事件，主动触发时被拒、列出可用的名字
    {
      const oldName = 'editingDidEnd' + 'OnExit';
      assert('控件：回车事件的旧名字当自定义事件', customEventWorks(btn, oldName), '收到一次');
      let message = '没有抛';
      try {
        /** @type {any} */ (btn).sendActionsForControlEvents([oldName]);
      } catch (err) {
        message = err instanceof TypeError ? err.message : '抛的不是 TypeError：' + String(err);
      }
      assert('控件：主动触发不认回车事件的旧名字，报错里列出 return',
             message.includes('expected one of') && message.includes('return'), true);
      let accepted = '没有抛';
      try { btn.sendActionsForControlEvents(['return']); } catch (err) { accepted = String(err); }
      assert('控件：主动触发认 return', accepted, '没有抛');
    }

    /** @type {string[]} */ const fired = [];
    const onUp = (/** @type {Event} */ e) => {
      fired.push(e.type);
      // 事件对象的 target 就是这个控件
      if (e.target !== btn) fired.push('target 不对');
    };
    btn.addEventListener('touchupinside', onUp);
    btn.addEventListener('touchdown', (e) => fired.push(e.type));

    // 主动触发：一次两个。注意这会真的走原生 sendActionsForControlEvents，
    // 不是 JS 侧自己派发
    btn.sendActionsForControlEvents(['touchdown', 'touchupinside']);
    assert('主动触发是异步的，当场还没到', fired.length, 0);

    try {
      // @ts-expect-error 要数组不是字符串
      btn.sendActionsForControlEvents('touchdown');
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
             'touchdown,touchupinside');
      // 摘掉监听器之后不该再收到
      btn.removeEventListener('touchupinside', onUp);
      fired.length = 0;
      btn.sendActionsForControlEvents(['touchupinside']);
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
        btn.addEventListener('touchdown', onTouch);
        btn.addEventListener('change', onValue);
        btn.sendActionsForControlEvents(['touchdown', 'change']);
        setTimeout(() => {
          assert('主动触发的 touchdown 到了', touched.length, 1);
          // sendActionsForControlEvents 那条路上压根没有 UIEvent。
          // 给 null 不给 (0,0)——(0,0) 是合法坐标，和「没有触点」分不开
          assert('没有真实触点时 location 是 null', touched[0].location, null);
          assert('没有真实触点时 tapCount 是 0', touched[0].tapCount, 0);
          assert('touchdown 是 UIControlTouchEvent', touched[0] instanceof UIControlTouchEvent, true);
          assert('touchdown 的 location 不是实例自己的属性',
                 Object.prototype.hasOwnProperty.call(touched[0], 'location'), false);
          assert('change 不是 UIControlTouchEvent', plain[0] instanceof UIControlTouchEvent, false);
          assert('change 上根本没有 location 这个字段',
                 'location' in plain[0], false);
          assert('change 上也没有 tapCount', 'tapCount' in plain[0], false);
          btn.removeEventListener('touchdown', onTouch);
          btn.removeEventListener('change', onValue);

          // 留一个监听器给真实触摸用。这条只能肉眼看：位置要落在按钮内
          btn.addEventListener('touchupinside', (/** @type {any} */ e) => {
            console.log('  ✓ 真实触摸：收到 touchupinside，state =',
                        btn.state.join(',') + '，location = ' + e.location +
                        '，tapCount = ' + e.tapCount);
          });
          btn.addEventListener('touchdown', (/** @type {any} */ e) => {
            console.log('  ✓ 真实触摸：收到 touchdown，isHighlighted = ' +
                        btn.isHighlighted + '，location = ' + e.location);
          });
          console.log('  ✓ 绿色按钮已上屏，等着被点（点下去会打出触点位置）');
        }, 200);
      }, 200);
    });
  }
}
