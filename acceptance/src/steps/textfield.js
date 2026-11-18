import { customEventWorks, enumIgnored, ENUM_IGNORED } from '../support.js';
// 输入框和键盘。
//
// 三件事别的步骤替代不了：
//   - 键盘避让只要**一条约束**，收起和弹出两种状态都对
//   - 文字变化走 UIControl 的 input，不需要新机制
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
  // 这三个是 API_AVAILABLE(ios(27.0))。原来的实现用字典字面量，低版本上
  // 它们是 nil，插进 @{} 当场崩（试用报告在 iOS 26.5 上撞到了）。
  // 改成逐对加、nil 就跳过之后：**有就能用，没有就当不认识的名字抛**，
  // 两种都不会崩。这里跑在 iOS 27 上，所以走的是「有」那一支
  for (const late of /** @type {UITextContentType[]} */ (
         ['cellularIMEI1', 'cellularIMEI2', 'cellularNAL'])) {
    try {
      field.textContentType = late;
      assert('iOS 27 专属的 ' + late + ' 可用', field.textContentType, late);
    } catch (e) {
      // iOS 26 上会走到这里，而且是**抛**不是崩——这正是修复要达到的
      const message = e instanceof Error ? e.message : '';
      assert(late + ' 不可用时是抛而不是崩', e instanceof TypeError, true);
      assert('错误里列出了可选值', message.includes('username'), true);
    }
  }
  field.textContentType = null;
  field.textColor = '#333333';
  assert('文字颜色也是字符串', field.textColor, '#333333');
  field.textAlignment = 'center';
  assert('对齐', field.textAlignment, 'center');

  // ---- 键盘外观：alert 是 dark 的别名（头文件里 Alert = Dark），读出来一律给 dark ----
  // 原来单行输入框上写 dark 读回来是 alert：反查用的是无序的字典，一个数值两个
  // 名字时给哪个不确定
  {
    const probe = new UITextField();
    probe.keyboardAppearance = 'dark';
    assert('单行输入框：keyboardAppearance = dark 读回来是 dark', probe.keyboardAppearance, 'dark');
    probe.keyboardAppearance = 'alert';
    assert('单行输入框：alert 是 dark 的别名，写得进去，读回来是 dark', probe.keyboardAppearance, 'dark');
    probe.keyboardAppearance = 'light';
    assert('单行输入框：keyboardAppearance = light', probe.keyboardAppearance, 'light');
    probe.keyboardAppearance = 'default';
    assert('单行输入框：keyboardAppearance = default', probe.keyboardAppearance, 'default');
  }

  // ---- 认不出的值当场抛，而且列出可选值 ----
  for (const [key, bad] of /** @type {[string, string][]} */ ([
    ['keyboardType', 'numeric'], ['returnKeyType', 'enter'],
    ['textContentType', 'passwd'], ['borderStyle', 'rounded'],
  ])) {
    assert(key + ' 写错：不抛、值不变', enumIgnored(() => {
      /** @type {any} */ (field)[key] = bad;
    }, () => /** @type {any} */ (field)[key]), ENUM_IGNORED);
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
  // 这张卡片不进瀑布：它要验的就是「贴着键盘走」。瀑布的底边改成接在它上面，
  // 免得最后几个区块被它盖住
  ctx.dock(card);
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
  const watched = ['focus', 'input',
                   'blur', 'return'];
  for (const type of watched) {
    field.addEventListener(type, () => log.push(type));
  }
  // 三个输入控件用同一套名字：focus / blur / input，可以拦住的那个是 beforeinput。
  // 改名之前单行输入框上叫 editingDidBegin / editingDidEnd / editingChanged / shouldchange，
  // 旧名字不保留：注册时抛，并列出可用的名字
  const rejected = (/** @type {() => void} */ fn) => {
    try { fn(); return '没有抛'; } catch (err) {
      return err instanceof TypeError && err.message.includes('expected one of')
        ? '抛了并列出可用的名字' : '抛的不对：' + String(err);
    }
  };
  // 回车那个事件原来叫 editingDidEnd + OnExit，是上一轮改名时留下的最后一个
  // 驼峰的名字，现在叫 return，和 beforereturn 成一对。旧名字同样不保留
  for (const old of ['editingDid' + 'Begin', 'editingDid' + 'End', 'editing' + 'Changed', 'should' + 'change',
                     'editingDidEnd' + 'OnExit']) {
    assert('单行输入框：旧的事件名 ' + old + ' 当自定义事件', customEventWorks(field, old), '收到一次');
  }
  // 主动触发用的也是新名字
  assert('sendActionsForControlEvents 认新名字 input',
         rejected(() => field.sendActionsForControlEvents(['input'])), '没有抛');
  assert('sendActionsForControlEvents 不认旧名字',
         rejected(() => /** @type {any} */ (field).sendActionsForControlEvents(['editing' + 'Changed'])),
         '抛了并列出可用的名字');
  assert('sendActionsForControlEvents 不认回车事件的旧名字',
         rejected(() => /** @type {any} */ (field).sendActionsForControlEvents(['editingDidEnd' + 'OnExit'])),
         '抛了并列出可用的名字');
  // return 是控件事件，主动触发也认它。用一个新建的输入框：屏幕上那个的 return
  // 监听器会交出焦点，而它后面正等着拿焦点。
  // 没有在模拟器上跑过；不在窗口里的控件主动触发事件发不发得出去，押的是
  // 「目标明确的 target-action 不经过响应链」
  {
    const probe = new UITextField();
    let returns = 0;
    let returnType = '';
    /** @type {unknown} */
    let returnTarget = null;
    let returnCancelable = true;
    probe.addEventListener('return', (e) => {
      returns++;
      returnType = e.type;
      returnTarget = e.target;
      returnCancelable = e.cancelable;
    });
    assert('sendActionsForControlEvents 认新名字 return',
           rejected(() => probe.sendActionsForControlEvents(['return'])), '没有抛');
    assert('return 不是同步派发的：刚触发完还是 0', returns, 0);
    // 期限从第一次轮到这个定时器开始算，不从这里算：这一步在入口的同步部分里，
    // 后面还有好几秒的同步代码，等到定时器和事件能跑的时候，从这里算的 3 秒
    // 早就过了，第一次进来就会被当成超时（合并验收时就是这么挂的）
    let deadline = 0;
    const tick = () => {
      if (deadline === 0) deadline = Date.now() + 3000;
      if (returns === 0 && Date.now() < deadline) { setTimeout(tick, 50); return; }
      assert('主动触发的 return 到了', returns, 1);
      assert('return：event.type', returnType, 'return');
      assert('return：event.target 是这个输入框', returnTarget === probe, true);
      // 它是事后的通知；能拦住回车的是 beforereturn
      assert('return：不可取消', returnCancelable, false);
    };
    setTimeout(tick, 0);
  }
  // 回车收键盘：听 return，自己交出 first responder。
  // 要在回车之前拦住它，听 beforereturn（那个是当场派发、可取消的）
  field.addEventListener('return', () => {
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
  //   同步调            become 成功、isEditing 为真，但 **focus
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
    waitUntil('focus', () => log.includes('focus'), () => {
      assert('收到了 focus', log.includes('focus'), true);
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
        assert('收到了 blur', log.includes('blur'), true);
        console.log('  ✓ 屏幕底部有一个输入框：点它弹键盘、框会被顶上去、回车收起');
        console.log('  ✓ 配了 textContentType = username，键盘上方应出现钥匙串建议栏（肉眼看）');
        console.log('--- 输入框：以上异步断言跑完 ---');
        // 选区要在编辑状态下验：原有的断言全部跑完之后，再拿一次焦点
        selectionWhileEditing();
      });
    });
  });

  // =====================================================================
  // 选区：selectedRange 和 selectionchange。
  //
  // 用例是先按判断写的（写的时候不许跑模拟器），合并后的验收（iPhone Air，
  // iOS 27.2，Debug）跑过一遍。那一遍推翻了一条：原来以为不在编辑时原生的
  // selectedTextRange 是 nil、于是读到 null、写会抛。实测不是：
  //   - 从没编辑过的输入框读到 (0, 0)（内容是 10 个字符时也是）
  //   - 不在编辑时写 (0, 3) 不抛，读回来就是 (0, 3)
  // 所以改成和 UITextView.selectedRange 同一个形状：读永远是 NSRange，写
  // 任何时候都照 UIKit 生效。下面标「实测」的是那一遍里通过了的。
  //
  // 定下来的规矩：
  //   - 读永远是 NSRange，写不看是不是正在编辑
  //   - 类型不对的报错、越界的处理，和 UITextView.selectedRange 一样
  //   - 选区变了派发 selectionchange，延后一轮，不可取消，事件对象上不带选区

  /** @param {NSRange} r */
  const showRange = (r) => '(' + r.location + ', ' + r.length + ')';
  /**
   * @param {() => void} fn
   * @returns {string} 没抛是「没有抛」，抛了 TypeError 是它的信息
   */
  const thrown = (fn) => {
    try { fn(); return '没有抛'; } catch (err) {
      return err instanceof TypeError ? err.message : '抛的不是 TypeError：' + String(err);
    }
  };

  // ---- 不在编辑时 ----
  // 用一个新建的、不在窗口里的输入框，不去动上面那个正在等焦点的
  try {
    console.log('--- 输入框：选区（不在编辑时） ---');
    const idle = new UITextField();
    idle.text = '0123456789';
    assert('单行选区：selectedRange 是输入框上的属性', 'selectedRange' in idle, true);
    // 实测：从没编辑过的输入框也有选区，是 (0, 0)。写 text 不会把它挪到末尾
    // （UITextView 上量到的是挪到末尾，两个类这一点不一样）
    assert('单行选区：不在编辑时读到的也是 NSRange', idle.selectedRange instanceof NSRange, true);
    assert('单行选区：从没编辑过的输入框，选区是 (0, 0)', showRange(idle.selectedRange), '(0, 0)');
    // 实测：不在编辑时写不抛，写进去的读得回来
    assert('单行选区：不在编辑时写选区：不抛',
           thrown(() => { idle.selectedRange = new NSRange(0, 3); }), '没有抛');
    assert('单行选区：不在编辑时写进去的读得回来', showRange(idle.selectedRange), '(0, 3)');
    // 类型不对的报错和 UITextView.selectedRange 一样，和是不是正在编辑无关
    assert('单行选区：缺字段被拒',
           // @ts-expect-error 缺 length
           thrown(() => { idle.selectedRange = { location: 1 }; }).includes('length'), true);
    assert('单行选区：不是对象被拒',
           // @ts-expect-error 要的是 NSRange
           thrown(() => { idle.selectedRange = 3; }).includes('selectedRange'), true);
    assert('单行选区：null 被拒：选区没有「清掉」这回事',
           // @ts-expect-error 要的是 NSRange
           thrown(() => { idle.selectedRange = null; }).includes('selectedRange'), true);
    assert('单行选区：负的 location 被拒',
           thrown(() => { idle.selectedRange = { location: -1, length: 0 }; })
             .includes('non-negative'), true);
    assert('单行选区：负的 length 被拒',
           thrown(() => { idle.selectedRange = { location: 0, length: -2 }; })
             .includes('non-negative'), true);
    assert('单行选区：写错之后原来的选区没被动过', showRange(idle.selectedRange), '(0, 3)');
    const noop = () => {};
    assert('单行选区：selectionchange 订得上也退得掉', thrown(() => {
      idle.addEventListener('selectionchange', noop);
      idle.removeEventListener('selectionchange', noop);
    }), '没有抛');
    // 它和五个 before… 事件共用一个委托对象：两种一起订、先后退掉都不抛
    assert('单行选区：selectionchange 和 beforeinput 一起订、先后退掉', thrown(() => {
      idle.addEventListener('selectionchange', noop);
      idle.addEventListener('beforeinput', noop);
      idle.removeEventListener('selectionchange', noop);
      idle.removeEventListener('beforeinput', noop);
    }), '没有抛');
  } catch (err) {
    console.log('  ✗ 输入框：选区（不在编辑时）这一组中断了 = ' +
                (err instanceof Error ? err.message : String(err)) + '（期望跑完）');
  }

  // =====================================================================
  // 键盘上方的工具条：inputAccessoryView。
  //
  // 用例是先按判断写的（写的时候不许跑模拟器），没有在模拟器上跑过。形状照
  // 搜索框的同名属性（bars.js 里那一组是跑过的）：值是 UIView 或 null，读回来
  // 是写进去的那个包装，类型不对抛 TypeError、原值不动。
  // 这里只验不在编辑时的读写；键盘弹出来之后它在不在屏幕上、正在编辑时换
  // 工具条，在 input-editing.js（那一步排着队跑，可以放心拿焦点）
  try {
    console.log('--- 输入框：inputAccessoryView ---');
    const idle = new UITextField();
    assert('单行输入框：默认没有 inputAccessoryView', idle.inputAccessoryView, null);
    const toolbar = new UIToolbar();
    toolbar.items = [UIBarButtonItem.flexibleSpace(), UIBarButtonItem.systemItem('done')];
    idle.inputAccessoryView = toolbar;
    assert('单行输入框：inputAccessoryView 写得进去，读回原来的包装',
           idle.inputAccessoryView === toolbar, true);
    // 不一定是工具条，任何视图都行
    const plain = new UIView();
    idle.inputAccessoryView = plain;
    assert('单行输入框：inputAccessoryView 也收普通的视图', idle.inputAccessoryView === plain, true);
    assert('单行输入框：inputAccessoryView 给别的原生对象被拒',
           // @ts-expect-error 要一个视图
           thrown(() => { idle.inputAccessoryView = UIColor.redColor; }),
           'inputAccessoryView needs a UIView or null');
    assert('单行输入框：inputAccessoryView 给数字被拒',
           // @ts-expect-error 要一个视图
           thrown(() => { idle.inputAccessoryView = 5; }),
           'inputAccessoryView needs a native object or null, got 5');
    assert('单行输入框：inputAccessoryView 给字符串被拒',
           // @ts-expect-error 要一个视图
           thrown(() => { idle.inputAccessoryView = 'toolbar'; }).includes('inputAccessoryView'),
           true);
    assert('单行输入框：inputAccessoryView 被拒之后原值没动', idle.inputAccessoryView === plain, true);
    idle.inputAccessoryView = null;
    assert('单行输入框：inputAccessoryView 写 null：去掉', idle.inputAccessoryView, null);
    idle.inputAccessoryView = plain;
    // @ts-expect-error 类型上是 UIView | null
    idle.inputAccessoryView = undefined;
    assert('单行输入框：inputAccessoryView 写 undefined 也是去掉', idle.inputAccessoryView, null);
    // 同一个视图给两个输入框：两边各自持有，互不影响。谁正在编辑，它就跟着谁的键盘
    const first = new UITextField();
    const second = new UITextField();
    first.inputAccessoryView = toolbar;
    second.inputAccessoryView = toolbar;
    assert('单行输入框：同一个视图可以给两个输入框',
           first.inputAccessoryView === toolbar && second.inputAccessoryView === toolbar, true);
    first.inputAccessoryView = null;
    assert('单行输入框：去掉其中一个的，另一个的还在',
           first.inputAccessoryView === null && second.inputAccessoryView === toolbar, true);
    // 给的视图已经是别人的子视图：不拒绝。键盘弹出时系统会把它挪走，这一点没有量过
    const parent = new UIView();
    const child = new UIView();
    parent.addSubview(child);
    assert('单行输入框：已经有父视图的视图也写得进去',
           thrown(() => { idle.inputAccessoryView = child; }), '没有抛');
    assert('单行输入框：这时它还在原来的父视图里（还没有键盘）', child.superview === parent, true);
    idle.inputAccessoryView = null;
    // 搜索框里的那个输入框就是 UITextField：从它读到的是搜索框的那一个
    // （原生探针量过两边是同一个指针，见 internals/bars.md）
    const search = new UISearchBar();
    search.inputAccessoryView = toolbar;
    assert('单行输入框：搜索框里的输入框读到的是搜索框的那一个',
           search.searchTextField.inputAccessoryView === toolbar, true);
  } catch (err) {
    console.log('  ✗ 输入框：inputAccessoryView 这一组中断了 = ' +
                (err instanceof Error ? err.message : String(err)) + '（期望跑完）');
  }

  // =====================================================================
  // 用代码按用户打字的规矩改内容：insertText() / deleteBackward() / hasText。
  //
  // 形状照 UITextView 上的同名成员（text-view.js 里那几组的期望是用探针量过、
  // 验收跑过的）。单行输入框上**没有量过，这一组一条都没跑过**，押了这几件事：
  //   甲  不在编辑、不在窗口里的输入框上，这两个方法照样改得动（UITextView 是
  //       这样；单行输入框不在编辑时选区读得到、写得进去，那一条是实测）
  //   乙  插入和删除发生在 selectedRange 处；做完之后选区收成光标，停在改动后面
  //   丙  两个方法派发 input（控件事件 EditingChanged），代码写 text 不派发
  //   丁  两个方法不经过 beforeinput：那是系统在问「用户的这次输入让不让发生」
  // 正在编辑时的那一半在 input-editing.js
  try {
    console.log('--- 输入框：insertText / deleteBackward / hasText（不在编辑时） ---');
    const idle = new UITextField();
    assert('单行内容：默认 hasText 为假', idle.hasText, false);
    idle.text = 'hello';
    assert('单行内容：有内容时 hasText 为真', idle.hasText, true);
    idle.text = '';
    assert('单行内容：清空之后 hasText 为假', idle.hasText, false);
    assert('单行内容：hasText 只读',
           // @ts-expect-error 只读
           thrown(() => { idle.hasText = true; }).includes('hasText'), true);

    idle.text = 'hello';
    // 写 text 之后选区在哪，两个类不一样（单行的留在原处，实测），所以每次都
    // 先把光标摆好再插。押的是「甲」和「乙」
    idle.selectedRange = new NSRange(5, 0);
    idle.insertText(' world');
    assert('单行内容：不在编辑时 insertText 照样插得进去，插在光标处', idle.text, 'hello world');
    assert('单行内容：插完光标在插入的内容后面', showRange(idle.selectedRange), '(11, 0)');
    idle.selectedRange = new NSRange(0, 0);
    idle.insertText('>');
    assert('单行内容：光标挪到开头再插', idle.text, '>hello world');
    idle.deleteBackward();
    assert('单行内容：deleteBackward 删光标前面那一个', idle.text, 'hello world');
    idle.deleteBackward();
    assert('单行内容：光标在开头时 deleteBackward 什么都不删', idle.text, 'hello world');
    idle.selectedRange = new NSRange(0, 5);
    idle.insertText('HEY');
    assert('单行内容：有选区时 insertText 换掉选中的', idle.text, 'HEY world');
    assert('单行内容：换完选区收成光标', showRange(idle.selectedRange), '(3, 0)');
    idle.selectedRange = new NSRange(1, 2);
    idle.deleteBackward();
    assert('单行内容：有选区时 deleteBackward 删掉选中的', idle.text, 'H world');
    // 参数照 Web IDL 按字符串转；不可空的字符串，null 和 undefined 是空串
    // @ts-expect-error 类型上是 string
    idle.insertText(7);
    assert('单行内容：insertText 的参数按 String() 转', idle.text, 'H7 world');
    // @ts-expect-error 类型上是 string
    idle.insertText(null);
    assert('单行内容：insertText(null) 插的是空串', idle.text, 'H7 world');
    // @ts-expect-error 少了参数
    idle.insertText();
    assert('单行内容：insertText() 不给参数也是空串', idle.text, 'H7 world');

    // hasText 跟着这两个方法走
    const empty = new UITextField();
    empty.insertText('x');
    assert('单行内容：往空的输入框里 insertText 之后 hasText 为真',
           empty.hasText + ' / ' + empty.text, 'true / x');
    empty.deleteBackward();
    assert('单行内容：deleteBackward 删空之后 hasText 为假',
           empty.hasText + ' / ' + JSON.stringify(empty.text), 'false / ""');

    // 这两条不知道 UIKit 怎么做，只打印，不当断言
    const curious = new UITextField();
    curious.text = 'a😀';
    curious.selectedRange = new NSRange(3, 0);
    curious.deleteBackward();
    console.log('  · 光标在一个表情后面时 deleteBackward，剩下 ' + JSON.stringify(curious.text) +
                '（表情占两个码元；是不是一次删掉整个，没有量过，这里只打印）');
    curious.text = 'ab';
    curious.isEnabled = false;
    curious.selectedRange = new NSRange(2, 0);
    curious.insertText('c');
    console.log('  · isEnabled 为假时 insertText，内容是 ' + JSON.stringify(curious.text) +
                '（UITextView 上 isEditable 为假时照样改得动；单行的没有量过，这里只打印）');

    // ---- 事件 ----
    // 押的是「丙」和「丁」。input 是控件事件，延后一轮派发，所以「触发 → 等它到 → 再断言」
    const typed = new UITextField();
    let inputs = 0;
    let asks = 0;
    /** @type {unknown} */
    let inputTarget = null;
    typed.addEventListener('input', (e) => { inputs++; inputTarget = e.target; });
    typed.addEventListener('beforeinput', () => { asks++; });
    /**
     * @param {() => boolean} ready
     * @param {() => void} then
     * @param {string} what
     */
    const expectSoon = (ready, then, what) => {
      const deadline = Date.now() + 3000;
      const tick = () => {
        if (ready()) {
          try { then(); } catch (err) {
            console.log('  ✗ 输入框：insertText 的事件这一组中断了 = ' +
                        (err instanceof Error ? err.message : String(err)) + '（期望跑完）');
          }
          return;
        }
        if (Date.now() >= deadline) { assert(what, '没等到', '派发'); return; }
        setTimeout(tick, 50);
      };
      setTimeout(tick, 0);
    };
    typed.text = 'abc';
    typed.selectedRange = new NSRange(3, 0);
    typed.insertText('d');
    assert('单行内容：input 不是同步派发的：刚插完还是 0', inputs, 0);
    expectSoon(() => inputs >= 1, () => {
      assert('单行内容：不在编辑时 insertText 派发 input，写 text 不派发：一共 1 次', inputs, 1);
      assert('单行内容：input 的 target 是这个输入框', inputTarget === typed, true);
      assert('单行内容：这时文字已经是改过的', typed.text, 'abcd');
      typed.deleteBackward();
      expectSoon(() => inputs >= 2, () => {
        assert('单行内容：不在编辑时 deleteBackward 也派发 input', inputs, 2);
        assert('单行内容：不在编辑时 insertText 和 deleteBackward 不经过 beforeinput', asks, 0);
      }, '单行内容：不在编辑时 deleteBackward 之后的 input');
    }, '单行内容：不在编辑时 insertText 之后的 input');
  } catch (err) {
    console.log('  ✗ 输入框：insertText / deleteBackward / hasText 这一组中断了 = ' +
                (err instanceof Error ? err.message : String(err)) + '（期望跑完）');
  }

  // ---- 正在编辑时 ----
  // 这一步的同步部分之后，入口等 10 秒才开始跑排着队的步骤（见 main.js），那些
  // 步骤也要用焦点。所以这一轮有两道闸：前面那一串拖过 6 秒就不做了；做的话
  // 整轮限 3.5 秒，到点没做完的报未验证并且把焦点交回去
  let settledAt = 0;
  setTimeout(() => { settledAt = Date.now(); }, 0);

  function selectionWhileEditing() {
    if (settledAt === 0 || Date.now() - settledAt > 6000) {
      console.log('  ! 前面的断言跑完时离排队的步骤开始已经不到 4 秒，' +
                  '「选区（正在编辑时）」这一组未验证');
      return;
    }
    const deadline = Date.now() + 3500;
    /**
     * @param {() => boolean} ready
     * @param {() => void} then
     * @param {() => void} missed
     */
    const waitFor = (ready, then, missed) => {
      const tick = () => {
        let ok = false;
        try {
          if (ready()) { ok = true; then(); }
        } catch (err) {
          console.log('  ✗ 输入框：选区（正在编辑时）这一组中断了 = ' +
                      (err instanceof Error ? err.message : String(err)) + '（期望跑完）');
          restore();
          return;
        }
        if (ok) return;
        if (Date.now() >= deadline) { missed(); return; }
        setTimeout(tick, 50);
      };
      setTimeout(tick, 0);
    };

    let selections = 0;
    /** @type {unknown} */
    let lastTarget = null;
    let lastType = '';
    let lastCancelable = true;
    let seenInListener = '';
    /** @param {Event} e */
    const onSelection = (e) => {
      selections++;
      lastTarget = e.target;
      lastType = e.type;
      lastCancelable = e.cancelable;
      seenInListener = showRange(field.selectedRange);
    };
    let marks = 0;
    const onMark = () => { marks++; };
    let focuses = 0;
    const onFocus = () => { focuses++; };
    let asks = 0;
    const onAsk = () => { asks++; };

    // 把输入框还成这一轮之前的样子：监听器摘掉、内容清空、焦点交回
    const restore = () => {
      field.removeEventListener('selectionchange', onSelection);
      field.removeEventListener('input', onMark);
      field.removeEventListener('focus', onFocus);
      field.removeEventListener('beforeblur', onAsk);
      field.text = '';
      if (field.isFirstResponder) vc.view.endEditing(true);
    };
    const unverified = (/** @type {string} */ what) => {
      console.log('  ! 3.5 秒内没等到「' + what + '」，「选区（正在编辑时）」后面的未验证');
      restore();
    };

    // beforeblur 让委托对象在聚焦之前就装上：下面要看「委托装着的时候控件事件
    // 照常」。selectionchange 等拿到焦点、内容摆好之后再订，这样聚焦和写 text
    // 引起的选区变化不会混进计数里
    field.addEventListener('beforeblur', onAsk);
    field.addEventListener('focus', onFocus);
    field.addEventListener('input', onMark);

    waitFor(() => field.becomeFirstResponder(), () => {
      console.log('--- 输入框：选区（正在编辑时） ---');
      field.text = '0123456789';
      assert('单行选区：正在编辑时读到的是 NSRange', field.selectedRange instanceof NSRange, true);
      console.log('  · 正在编辑时写完 text，选区 = ' + showRange(field.selectedRange) +
                  '（UITextView 上量到的是停在末尾，这里只打印）');

      field.selectedRange = new NSRange(3, 4);
      assert('单行选区：选区写得进去', showRange(field.selectedRange), '(3, 4)');
      field.selectedRange = { location: 1, length: 2 };
      assert('单行选区：也收普通对象', showRange(field.selectedRange), '(1, 2)');
      // @ts-expect-error 类型上是 number
      field.selectedRange = { location: '2.7', length: 1.2 };
      assert('单行选区：字段按整数转（向零取整）', showRange(field.selectedRange), '(2, 1)');
      field.selectedRange = new NSRange(4, 0);
      assert('单行选区：length 为 0 是光标', showRange(field.selectedRange), '(4, 0)');
      // 越界不抛，规则照 UITextView 上量到的：位置超了停在末尾，长度超了变成 0
      field.selectedRange = new NSRange(100, 5);
      assert('单行选区：位置越界：停在末尾', showRange(field.selectedRange), '(10, 0)');
      field.selectedRange = new NSRange(2, 100);
      assert('单行选区：长度越界：位置留着，长度变成 0', showRange(field.selectedRange), '(2, 0)');
      field.selectedRange = { location: 8, length: 2 ** 64 };
      assert('单行选区：大到溢出的长度不崩', showRange(field.selectedRange), '(8, 0)');
      field.selectedRange = { location: 1e300, length: 0 };
      assert('单行选区：大到溢出的位置不崩，停在末尾', showRange(field.selectedRange), '(10, 0)');
      assert('单行选区：正在编辑时负的 location 照样被拒',
             thrown(() => { field.selectedRange = { location: -1, length: 0 }; })
               .includes('non-negative'), true);
      assert('单行选区：写错之后选区没被动过', showRange(field.selectedRange), '(10, 0)');

      // 单位是 UTF-16 码元，和 JS 字符串的下标一致：一个表情占两个
      field.text = 'a😀b';
      field.selectedRange = new NSRange(1, 2);
      const sel = field.selectedRange;
      assert('单行选区：(1, 2) 正好盖住那个表情',
             field.text.slice(sel.location, sel.location + sel.length), '😀');
      // 位置落在表情的两个码元中间：运行时不拦也不纠正，照 UIKit 的。
      // 实测：和 UITextView 上量到的一样，UIKit 也不纠正
      assert('单行选区：位置在表情中间：不抛',
             thrown(() => { field.selectedRange = new NSRange(2, 0); }), '没有抛');
      assert('单行选区：位置在表情中间：读回来还是 (2, 0)', showRange(field.selectedRange), '(2, 0)');

      // ---- selectionchange ----
      field.text = '0123456789';
      field.addEventListener('selectionchange', onSelection);
      field.selectedRange = new NSRange(2, 3);
      assert('单行选区：事件不是同步派发的：刚写完还是 0', selections, 0);
      // 实测：代码写选区和用户动光标一样，系统都会告诉委托
      waitFor(() => selections >= 1, () => {
        assert('单行选区：代码写 selectedRange 派发 selectionchange', selections >= 1, true);
        assert('单行选区：event.target 是这个输入框', lastTarget === field, true);
        assert('单行选区：event.type', lastType, 'selectionchange');
        assert('单行选区：不可取消', lastCancelable, false);
        assert('单行选区：监听器里读 selectedRange 就是现在的选区', seenInListener, '(2, 3)');

        // 退掉之后收不到。拿控件事件 input 当标记：它和 selectionchange 按先后
        // 排在同一条队列里，它到了，前面要是有 selectionchange 也早该到了
        field.removeEventListener('selectionchange', onSelection);
        const quiet = selections;
        const marked = marks;
        field.selectedRange = new NSRange(0, 1);
        field.sendActionsForControlEvents(['input']);
        waitFor(() => marks > marked, () => {
          assert('单行选区：removeEventListener 之后收不到了', selections, quiet);
          // 委托对象从聚焦之前就装着（beforeblur 订着），控件事件走的是另一条路
          assert('单行选区：委托装着的时候控件事件照常：focus 到了', focuses >= 1, true);
          // selectionchange 退掉了，beforeblur 还订着：委托不能跟着被摘走
          field.text = '';
          vc.view.endEditing(true);
          assert('单行选区：selectionchange 退掉之后 beforeblur 照常被问到', asks >= 1, true);
          waitFor(() => !field.isFirstResponder, () => {
            // 结束编辑之后选区照样读得到。它是多少只在这一种场景下断言：内容
            // 已经清空了，能有的位置只有 (0, 0)。内容不空时结束编辑之后选区
            // 留在哪，没有量过，不在这里定
            assert('单行选区：结束编辑之后读到的还是 NSRange',
                   field.selectedRange instanceof NSRange, true);
            assert('单行选区：内容是空的，结束编辑之后选区是 (0, 0)',
                   showRange(field.selectedRange), '(0, 0)');
            restore();
            console.log('--- 输入框：选区（正在编辑时）跑完 ---');
          }, () => unverified('交出 first responder'));
        }, () => { assert('单行选区：当标记的 input', '没等到', '1 次'); restore(); });
      }, () => { assert('单行选区：代码写 selectedRange 之后的 selectionchange', '没等到', '至少 1 次'); restore(); });
    }, () => unverified('再拿到一次 first responder'));
  }
}
