// 输入框后来补的那几个成员里，要拿到焦点才验得了的部分。
//
//   - inputAccessoryView：键盘弹出来之后它在不在屏幕上；正在编辑时换一个、
//     去掉；同一个工具条给两个输入框，焦点换过去它跟着走
//   - 单行输入框的 insertText() / deleteBackward() / hasText：正在编辑时的行为
//
// 不要焦点的读写在各自的步骤里（textfield.js、text-view.js）。分出来是因为
// 焦点同一时刻只有一个：单行输入框那一步排在最早那一批里，它自己那串等焦点
// 的断言已经卡着时间，再往里加会把后面排队的步骤挤掉。这一步排着队跑，
// 把「全部做完」作为 Promise 返回（见 main.js）。
//
// **这些用例是先按判断写的，写的时候不许跑模拟器，一条都没有跑过。** 里面
// 押了 UIKit 的几件事，哪条断言押的是什么都写在旁边：
//   甲  输入框成为 first responder 之后，它的 inputAccessoryView 会被系统放进
//       一个窗口里（键盘的那个窗口）。连着硬件键盘、软键盘不弹的时候也是
//   乙  正在编辑时写 inputAccessoryView，要调 reloadInputViews 才换（头文件
//       是这么说的）。运行时在原生那一侧补了这一下，所以这里断言「当场换」
//   丙  焦点从一个输入框换到另一个、两边用的是同一个工具条时，它留在屏幕上
//   丁  正在编辑的单行输入框上，insertText / deleteBackward 改的是 selectedRange
//       那一处，做完选区收成光标；它们派发 input，不经过 beforeinput

/**
 * 等一个条件成立，每 50 ms 看一次。等到了是 true，到点没等到是 false
 * @param {() => boolean} ready
 * @param {number} [limitMs]
 * @returns {Promise<boolean>}
 */
function until(ready, limitMs = 4000) {
  return new Promise((resolve) => {
    const deadline = Date.now() + limitMs;
    const tick = () => {
      let ok = false;
      try { ok = ready(); } catch { ok = false; }
      if (ok) { resolve(true); return; }
      if (Date.now() >= deadline) { resolve(false); return; }
      setTimeout(tick, 50);
    };
    setTimeout(tick, 0);
  });
}

/** @param {string} title */
function makeToolbar(title) {
  const bar = new UIToolbar();
  bar.items = [UIBarButtonItem.flexibleSpace(), new UIBarButtonItem({ title })];
  // 工具条新建出来是 0 × 0，量一次才有高度
  bar.sizeToFit();
  return bar;
}

/** @param {import("../main.js").StepContext} ctx */
export async function stepInputEditing(ctx) {
  const { assert } = ctx;
  const host = ctx.section('输入框：键盘上方的工具条（点输入框，键盘上面有一排按钮）', 164);
  console.log('--- 输入框：键盘上方的工具条（要焦点的部分） ---');

  const field = new UITextField();
  field.borderStyle = 'roundedRect';
  field.placeholder = '单行，键盘上方有「完成」';
  const other = new UITextField();
  other.borderStyle = 'roundedRect';
  other.placeholder = '另一个单行，共用同一个工具条';
  const area = new UITextView();
  area.font = UIFont.systemFontOfSize(15);
  area.backgroundColor = 'secondarySystemBackground';
  area.layer.cornerRadius = 8;
  area.text = '多行，键盘上方有「收起」';

  // 两个单行各占一行：并排的时候每个只有半屏宽，真机上占位文字显示不全
  const column = new UIStackView([field, other, area]);
  column.translatesAutoresizingMaskIntoConstraints = false;
  column.axis = 'vertical';
  column.spacing = 8;
  host.addSubview(column);
  const safe = host.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    column.topAnchor.constraintEqualToAnchor(safe.topAnchor),
    column.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
    column.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
    column.bottomAnchor.constraintEqualToAnchor(safe.bottomAnchor),
    field.heightAnchor.constraintEqualToConstant(36),
    other.heightAnchor.constraintEqualToConstant(36),
  ]);
  host.layoutIfNeeded();

  // 真实触摸用：三个输入框都留着一个能收键盘的工具条
  const done = makeToolbar('完成');
  const doneItem = done.items[1];
  doneItem.addEventListener('click', () => { host.endEditing(true); });
  const hide = makeToolbar('收起');
  hide.items[1].addEventListener('click', () => { area.resignFirstResponder(); });

  // 这一步里拿过焦点的都在这里交回去。哪条路走完都要经过它：后面的步骤等着用焦点
  const release = () => {
    try {
      if (field.isFirstResponder) field.resignFirstResponder();
      if (other.isFirstResponder) other.resignFirstResponder();
      if (area.isFirstResponder) area.resignFirstResponder();
    } catch { /* 交不回去也不能让这一步的 Promise 悬着 */ }
  };

  try {
    await accessoryWhileEditing();
  } catch (err) {
    console.log('  ✗ 输入框：键盘上方的工具条这一组中断了 = ' +
                (err instanceof Error ? err.message : String(err)) + '（期望跑完）');
  }
  release();
  try {
    await insertWhileEditing();
  } catch (err) {
    console.log('  ✗ 输入框：正在编辑时 insertText 这一组中断了 = ' +
                (err instanceof Error ? err.message : String(err)) + '（期望跑完）');
  }
  release();
  // 留给真实触摸的样子
  field.inputAccessoryView = done;
  other.inputAccessoryView = done;
  area.inputAccessoryView = hide;
  console.log('  ✓ 屏幕上：两个单行输入框和一块多行输入，点任意一个，键盘上面有一条工具条，' +
              '右端的按钮能收键盘（肉眼看）');
  console.log('--- 输入框：键盘上方的工具条（要焦点的部分）跑完 ---');

  // ---- 所有权：输入框持有它的工具条 ----
  // JS 这边不留引用，GC 之后读回来要还是原来那个包装。这里不自己逼 GC
  // （别的步骤在逼），只放一个没人持有的视图当对照。不算在这一步的 Promise
  // 里：它不占焦点，后面的步骤不用等它
  ownership();

  async function accessoryWhileEditing() {
    // ---- 单行输入框 ----
    const first = makeToolbar('甲');
    const second = makeToolbar('乙');
    field.inputAccessoryView = first;
    assert('键盘上方：还没聚焦时工具条不在任何窗口里', first.window, null);

    // 转场中途 UIKit 会拒绝交出 first responder，所以拿「这次成没成」当条件
    // （见 textfield.js 里记的那几次）。这一条等不到就是窗口没落定，报未验证
    if (!await until(() => field.becomeFirstResponder(), 8000)) {
      console.log('  ! 8 秒内没拿到 first responder，「键盘上方的工具条」要焦点的部分未验证');
      return;
    }
    // 押的是「甲」
    assert('键盘上方：单行输入框聚焦之后，工具条进了窗口',
           await until(() => first.window !== null), true);
    assert('键盘上方：聚焦之后读回来还是写进去的那个', field.inputAccessoryView === first, true);

    // 正在编辑时换一个。押的是「乙」
    field.inputAccessoryView = second;
    assert('键盘上方：正在编辑时换工具条，读回来是新的', field.inputAccessoryView === second, true);
    assert('键盘上方：正在编辑时换工具条，新的当场进了窗口',
           await until(() => second.window !== null), true);
    assert('键盘上方：正在编辑时换工具条，旧的离开了窗口',
           await until(() => first.window === null), true);
    assert('键盘上方：换工具条不会让输入框丢掉焦点', field.isFirstResponder, true);

    // 写同一个：什么都不做
    field.inputAccessoryView = second;
    assert('键盘上方：写同一个工具条，它还在窗口里', second.window !== null, true);

    // 正在编辑时去掉
    field.inputAccessoryView = null;
    assert('键盘上方：正在编辑时写 null，读回来是 null', field.inputAccessoryView, null);
    assert('键盘上方：正在编辑时写 null，工具条离开了窗口',
           await until(() => second.window === null), true);
    assert('键盘上方：去掉工具条不会让输入框丢掉焦点', field.isFirstResponder, true);

    // 正在编辑时写错：照旧抛，原来的不动
    field.inputAccessoryView = first;
    let rejected = '没有抛';
    try {
      // @ts-expect-error 要一个视图
      field.inputAccessoryView = UIColor.redColor;
    } catch (err) {
      rejected = err instanceof TypeError ? err.message : '抛的不是 TypeError：' + String(err);
    }
    assert('键盘上方：正在编辑时写了不是视图的对象，照旧抛', rejected,
           'inputAccessoryView needs a UIView or null');
    assert('键盘上方：被拒之后还是原来那个', field.inputAccessoryView === first, true);
    assert('键盘上方：正在编辑时从没有到有，也当场进了窗口',
           await until(() => first.window !== null), true);

    // ---- 同一个工具条给两个输入框 ----
    // 押的是「丙」：焦点换到另一个输入框，两边用的是同一个，它留在屏幕上
    other.inputAccessoryView = first;
    if (await until(() => other.becomeFirstResponder(), 4000)) {
      assert('键盘上方：焦点换到另一个输入框', other.isFirstResponder && !field.isFirstResponder, true);
      assert('键盘上方：两个输入框共用的工具条，焦点换过去之后还在窗口里',
             await until(() => first.window !== null), true);
      assert('键盘上方：两个输入框读到的都还是它',
             field.inputAccessoryView === first && other.inputAccessoryView === first, true);
      other.resignFirstResponder();
    } else {
      console.log('  ! 另一个输入框没拿到 first responder，「共用工具条」这一段未验证');
      field.resignFirstResponder();
    }
    assert('键盘上方：结束输入之后工具条离开了窗口',
           await until(() => first.window === null), true);
    assert('键盘上方：结束输入之后属性还在', field.inputAccessoryView === first, true);

    // ---- 多行输入 ----
    const third = makeToolbar('丙');
    const fourth = makeToolbar('丁');
    area.inputAccessoryView = third;
    if (!await until(() => area.becomeFirstResponder(), 4000)) {
      console.log('  ! 多行输入没拿到 first responder，它的工具条要焦点的部分未验证');
      return;
    }
    assert('键盘上方：多行输入聚焦之后，工具条进了窗口',
           await until(() => third.window !== null), true);
    area.inputAccessoryView = fourth;
    assert('键盘上方：多行输入正在编辑时换工具条，新的当场进了窗口',
           await until(() => fourth.window !== null), true);
    assert('键盘上方：多行输入正在编辑时换工具条，旧的离开了窗口',
           await until(() => third.window === null), true);
    area.inputAccessoryView = null;
    assert('键盘上方：多行输入正在编辑时写 null，工具条离开了窗口',
           await until(() => fourth.window === null), true);
    assert('键盘上方：多行输入换工具条、去掉工具条都不丢焦点', area.isFirstResponder, true);
    area.resignFirstResponder();
    await until(() => !area.isFirstResponder);
  }

  // 单行输入框正在编辑时的 insertText / deleteBackward / hasText。押的是「丁」。
  // 不在编辑时的那一半在 textfield.js
  async function insertWhileEditing() {
    /** @param {NSRange} r */
    const show = (r) => '(' + r.location + ', ' + r.length + ')';
    field.inputAccessoryView = null;
    if (!await until(() => field.becomeFirstResponder(), 4000)) {
      console.log('  ! 没拿到 first responder，「正在编辑时 insertText」这一组未验证');
      return;
    }
    console.log('--- 输入框：insertText / deleteBackward / hasText（正在编辑时） ---');
    let inputs = 0;
    let asks = 0;
    const onInput = () => { inputs++; };
    const onAsk = () => { asks++; };
    try {
      // 内容先摆好再订：代码写 text 不该派发，但这里不靠它
      field.text = '0123456789';
      field.addEventListener('input', onInput);
      // beforeinput 订着（委托装着）：看代码的插入和删除问不问它
      field.addEventListener('beforeinput', onAsk);

      field.selectedRange = new NSRange(3, 0);
      field.insertText('X');
      assert('编辑中插入：insertText 插在光标处', field.text, '012X3456789');
      assert('编辑中插入：插完光标在插入的内容后面', show(field.selectedRange), '(4, 0)');
      field.selectedRange = new NSRange(0, 3);
      field.insertText('ab');
      assert('编辑中插入：选中一段时 insertText 是替换', field.text, 'abX3456789');
      assert('编辑中插入：换完选区收成光标', show(field.selectedRange), '(2, 0)');
      field.deleteBackward();
      assert('编辑中插入：deleteBackward 删光标前面那一个', field.text, 'aX3456789');
      field.selectedRange = new NSRange(0, 0);
      field.deleteBackward();
      assert('编辑中插入：光标在开头时 deleteBackward 什么都不删', field.text, 'aX3456789');
      field.selectedRange = new NSRange(1, 3);
      field.deleteBackward();
      // 选中的是 'X34' 三个字符
      assert('编辑中插入：有选区时 deleteBackward 删掉选中的', field.text, 'a56789');
      assert('编辑中插入：有内容时 hasText 为真', field.hasText, true);
      assert('编辑中插入：改内容不会让输入框丢掉焦点', field.isFirstResponder, true);

      // 上面一共四次改了内容（开头的那次删除什么都没删）。input 是延后派发的。
      // 只断言「到了」：开头那次什么都没删的 deleteBackward 派不派发没有量过
      // （UITextView 上量到的是不派发），次数打出来看
      assert('编辑中插入：insertText / deleteBackward 派发 input',
             await until(() => inputs >= 1), true);
      await until(() => inputs >= 5, 500);
      console.log('  · 四次改了内容、一次什么都没删，收到 ' + inputs + ' 次 input' +
                  '（UITextView 上什么都没删的那次不派发；单行的没有量过，这里只打印）');
      assert('编辑中插入：代码的插入和删除不经过 beforeinput', asks, 0);

      // 删到空
      field.text = 'z';
      field.selectedRange = new NSRange(1, 0);
      field.deleteBackward();
      assert('编辑中插入：删空之后 hasText 为假',
             field.hasText + ' / ' + JSON.stringify(field.text), 'false / ""');
    } finally {
      field.removeEventListener('input', onInput);
      field.removeEventListener('beforeinput', onAsk);
      field.text = '';
    }
    field.resignFirstResponder();
    await until(() => !field.isFirstResponder);
    console.log('--- 输入框：insertText / deleteBackward / hasText（正在编辑时）跑完 ---');
  }

  function ownership() {
    const keptField = new UITextField();
    const keptArea = new UITextView();
    let controlCollected = false;
    const registry = new FinalizationRegistry(() => { controlCollected = true; });
    (() => {
      const forField = new UIView();
      /** @type {any} */ (forField).probe = '挂在视图的包装上（单行）';
      keptField.inputAccessoryView = forField;
      const forArea = new UIView();
      /** @type {any} */ (forArea).probe = '挂在视图的包装上（多行）';
      keptArea.inputAccessoryView = forArea;
      registry.register(new UIView(), 'control');
    })();
    let waited = 0;
    const check = () => {
      // registry 要有人拿着，不然回调永远不来
      if (registry === null) return;
      if (!controlCollected) {
        waited += 1;
        if (waited < 45) { setTimeout(check, 1000); return; }
        console.log('--- 输入框：工具条的持有边 ---');
        console.log('  ! 对照组 45 秒里没被回收，GC 没跑到，这一组未验证');
        return;
      }
      console.log('--- 输入框：工具条的持有边 ---');
      try {
        assert('键盘上方：对照组（没人持有的视图）被回收了', controlCollected, true);
        assert('键盘上方：单行输入框的工具条，GC 后读回来还是原来那个包装',
               /** @type {any} */ (keptField.inputAccessoryView).probe, '挂在视图的包装上（单行）');
        assert('键盘上方：多行输入的工具条，GC 后读回来还是原来那个包装',
               /** @type {any} */ (keptArea.inputAccessoryView).probe, '挂在视图的包装上（多行）');
      } catch (err) {
        console.log('  ✗ 输入框：工具条的持有边这一组中断了 = ' +
                    (err instanceof Error ? err.message : String(err)) + '（期望跑完）');
      }
      console.log('--- 输入框：工具条的持有边跑完 ---');
    };
    setTimeout(check, 8000);
  }
}
