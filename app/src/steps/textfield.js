// 输入框和键盘。
//
// 三件事别的步骤替代不了：
//   - 键盘避让只要**一条约束**，收起和弹出两种状态都对
//   - 文字变化走 UIControl 的 editingChanged，不需要新机制
//   - textContentType 开启密码/验证码自动填充（这条只能肉眼看）

import { assert } from '../support.js';

/** @param {import("../main.js").StepContext} ctx */
export function stepTextField(ctx) {
  const { vc } = ctx;
  console.log('--- 输入框和键盘 ---');

  const field = new UITextField();
  assert('是 UIControl 的子类', field instanceof UIControl, true);
  assert('也是 UIView', field instanceof UIView, true);

  // ---- 默认值 ----
  assert('默认空串不是 null', field.text, '');
  assert('默认没有占位符', field.placeholder, null);
  assert('默认没在编辑', field.isEditing, false);
  assert('默认键盘', field.keyboardType, 'default');
  assert('默认回车键', field.returnKeyType, 'default');
  assert('默认不遮点', field.isSecureTextEntry, false);
  assert('默认句首大写', field.autocapitalizationType, 'sentences');
  assert('默认自动纠错', field.autocorrectionType, 'default');
  assert('默认无边框', field.borderStyle, 'none');
  assert('默认不显示清空按钮', field.clearButtonMode, 'never');
  assert('默认没配内容类型', field.textContentType, null);
  assert('默认回车键不自动变灰', field.enablesReturnKeyAutomatically, false);

  // ---- 写进去读回来 ----
  field.text = '你好';
  assert('文字写得进去', field.text, '你好');
  field.placeholder = '请输入账号';
  assert('占位符写得进去', field.placeholder, '请输入账号');
  field.keyboardType = 'emailAddress';
  assert('键盘类型', field.keyboardType, 'emailAddress');
  field.returnKeyType = 'done';
  assert('回车键文字', field.returnKeyType, 'done');
  field.autocapitalizationType = 'none';
  assert('不自动大写', field.autocapitalizationType, 'none');
  field.autocorrectionType = 'no';
  assert('不自动纠错', field.autocorrectionType, 'no');
  field.borderStyle = 'roundedRect';
  assert('圆角边框', field.borderStyle, 'roundedRect');
  field.clearButtonMode = 'whileEditing';
  assert('编辑时显示清空按钮', field.clearButtonMode, 'whileEditing');
  field.textContentType = 'username';
  assert('内容类型', field.textContentType, 'username');
  field.textContentType = null;
  assert('内容类型能清掉', field.textContentType, null);
  field.textColor = '#333333';
  assert('文字颜色也是字符串', field.textColor, '#333333');
  field.textAlignment = 'center';
  assert('对齐', field.textAlignment, 'center');

  // ---- 认不出的值当场抛，而且列出可选值 ----
  for (const [key, bad] of /** @type {[string, string][]} */ ([
    ['keyboardType', 'numeric'], ['returnKeyType', 'enter'],
    ['textContentType', 'passwd'], ['borderStyle', 'rounded'],
  ])) {
    try {
      /** @type {any} */ (field)[key] = bad;
      console.log('  ✗ ' + key + ' 写错居然通过了');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      assert(key + ' 写错被拒且列出了可选值',
             message.includes('expected one of') || message.includes('expected any of'), true);
    }
  }

  // ---- first responder ----
  assert('还没上屏时不是 first responder', field.isFirstResponder, false);

  // ---- 键盘避让：一条约束 ----
  const card = new UIView();
  card.translatesAutoresizingMaskIntoConstraints = false;
  card.backgroundColor = 'secondarySystemBackground';
  card.layer.cornerRadius = 12;
  vc.view.addSubview(card);

  field.translatesAutoresizingMaskIntoConstraints = false;
  card.addSubview(field);

  const guide = vc.view.keyboardLayoutGuide;
  assert('keyboardLayoutGuide 是 UIKeyboardLayoutGuide',
         guide instanceof UIKeyboardLayoutGuide, true);
  assert('它也是 UILayoutGuide（所以锚点能用）', guide instanceof UILayoutGuide, true);
  assert('读两次是同一个包装', vc.view.keyboardLayoutGuide === guide, true);
  assert('默认不跟浮动键盘', guide.followsUndockedKeyboard, false);
  // 两个开关都验「写得进去」，不是只看默认值——写不生效又不报错是最坏的
  // 那种。usesBottomSafeArea 就是这么被撤掉的：实测写 true 读回 false
  guide.followsUndockedKeyboard = true;
  assert('followsUndockedKeyboard 写得进去', guide.followsUndockedKeyboard, true);
  guide.keyboardDismissPadding = 20;
  assert('keyboardDismissPadding 写得进去', guide.keyboardDismissPadding, 20);
  guide.followsUndockedKeyboard = false;
  guide.keyboardDismissPadding = 0;
  assert('默认没有额外的收起留白', guide.keyboardDismissPadding, 0);

  const safe = vc.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    card.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
    card.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
    card.heightAnchor.constraintEqualToConstant(56),
    // **这一条就是全部的键盘避让**
    card.bottomAnchor.constraintEqualToAnchor(guide.topAnchor, { constant: -16 }),
    field.leadingAnchor.constraintEqualToAnchor(card.leadingAnchor, { constant: 12 }),
    field.trailingAnchor.constraintEqualToAnchor(card.trailingAnchor, { constant: -12 }),
    field.centerYAnchor.constraintEqualToAnchor(card.centerYAnchor),
  ]);
  vc.view.layoutIfNeeded();

  // 键盘没弹出来时，guide 的顶边就是安全区底边
  const bottomGap = vc.view.bounds.height - safe.layoutFrame.y - safe.layoutFrame.height;
  assert('键盘收起时 card 贴在安全区底边上方 16',
         Math.round(vc.view.bounds.height - bottomGap - card.frame.y - card.frame.height),
         16);

  // ---- 文字变化：走 UIControl 的事件，不需要新机制 ----
  /** @type {string[]} */
  const log = [];
  /** @type {UIControlEventType[]} */
  const watched = ['editingDidBegin', 'editingChanged',
                   'editingDidEnd', 'editingDidEndOnExit'];
  for (const type of watched) {
    field.addEventListener(type, () => log.push(type));
  }
  // 回车收键盘：听 editingDidEndOnExit，自己交出 first responder。
  // UITextFieldDelegate 的 textFieldShouldReturn: 要同步返回 BOOL，那条要 M1b
  field.addEventListener('editingDidEndOnExit', () => {
    field.resignFirstResponder();
    console.log('  ✓ 回车收起了键盘');
  });

  field.text = '';
  field.placeholder = '点我打字，回车收起';
  field.textContentType = 'username';
  field.keyboardType = 'default';
  field.returnKeyType = 'done';

  // 真实点击之前，程序性地 become 一次，验这条路通不通。
  //
  // **这一段一个写死的延迟都没有**，全是「等一个能观察到的条件，到点没等到
  // 就报未验证」。时机这件事在这里被咬过三次，三种写法的实测结果记下来：
  //
  //   setTimeout(900)  原来的写法，没写为什么要等。会落进 stepModal 的转场
  //                    中间，那时 UIKit **拒绝**交出 first responder（返回
  //                    false，是它的正常行为不是 bug）
  //   同步调            become 成功、isEditing 为真，但 **editingDidBegin
  //                    这个控件事件不发**。太早了
  //   等模态散场 + 固定 400ms  前两条都躲开了，但主线程被别的段堵了 2.7 秒，
  //                    endEditing 之后那条又没等到状态落定
  //   只等模态散场      presentedViewController 清了，但转场还没完全落定，
  //                    照样被拒
  //
  // 共同的病根是一样的：**在一个忙碌的主线程上赌固定时长**。
  // 真正该用的信号是「页面出现了」（viewDidAppear:），那是覆写点，要 M2。

  // 等一个条件成立。每 100ms 看一次，到点没等到就报未验证——
  // 不假装通过也不假装失败，和文件那条大写入一个规矩
  /**
   * @param {string} what
   * @param {() => boolean} ready
   * @param {() => void} then
   */
  function waitUntil(what, ready, then) {
    const deadline = Date.now() + 6000;
    const tick = () => {
      if (ready()) { then(); return; }
      if (Date.now() >= deadline) {
        console.log('  ! 6 秒内没等到「' + what + '」，这一组未验证');
        return;
      }
      setTimeout(tick, 100);
    };
    setTimeout(tick, 0);
  }

  // **直接拿「这次成没成」当条件。** becomeFirstResponder 本身就返回成没成，
  // 比猜前提准——试过「等模态散场」，但转场刚结束、还没完全落定时它照样拒。
  // 反复调是无害的：已经是 first responder 时直接返回 true。
  waitUntil('拿到 first responder', () => field.becomeFirstResponder(), () => {
    assert('成了 first responder', field.isFirstResponder, true);
    assert('isEditing 跟着为真', field.isEditing, true);

    // 控件事件延后一轮派发，而且主线程可能正忙，所以等它到达而不是等固定时长
    waitUntil('editingDidBegin', () => log.includes('editingDidBegin'), () => {
      assert('收到了 editingDidBegin', log.includes('editingDidBegin'), true);
      // 模拟器连着硬件键盘时**软键盘根本不弹**，guide 不会动。那不是 bug，
      // 所以先确认键盘真的出现了，没出现就报未验证
      const guideHeight = guide.layoutFrame.height;
      if (guideHeight > 40) {
        assert('键盘弹出之后 card 被顶上去了',
               card.frame.y + card.frame.height < vc.view.bounds.height - 100, true);
      } else {
        console.log('  ! 软键盘没弹出来（guide 高 ' + guideHeight +
                    '），多半是模拟器连着硬件键盘，这一条未验证');
      }

      vc.view.endEditing(true);
      waitUntil('交出 first responder', () => !field.isFirstResponder, () => {
        assert('endEditing 之后不再是 first responder', field.isFirstResponder, false);
        assert('收到了 editingDidEnd', log.includes('editingDidEnd'), true);
        console.log('  ✓ 屏幕底部有一个输入框：点它弹键盘、框会被顶上去、回车收起');
        console.log('  ✓ 配了 textContentType = username，键盘上方应出现钥匙串建议栏（肉眼看）');
        console.log('--- 输入框：以上异步断言跑完 ---');
      });
    });
  });
}
