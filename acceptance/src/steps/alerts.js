// 系统弹窗和分享面板：UIAlertController、UIAlertAction、UIActivityViewController。
//
// 验收是自动跑的，没有人去点弹窗上的按钮。所以分三层：
//   1. 不用呈现就能验的（默认值、读写、写错了抛什么）——同步跑完
//   2. 要呈现的——不带动画弹出来、立刻用代码关掉，等它关完
//   3. 只有真实触摸才验得到的（点按钮触发事件、分享完成）——留三个按钮给人点，
//      自动跑的那一遍不验这一层

import { collectGarbage, customEventWorks, enumIgnored, ENUM_IGNORED } from '../support.js';

/** @param {number} ms */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** @param {import("../main.js").StepContext} ctx */
export function stepAlerts(ctx) {
  const { assert, vc } = ctx;

  console.log('--- 系统弹窗和分享面板 ---');
  // 区块现在就建：呈现那一段要等别的步骤弹完才开始，那时再建位置就乱了
  const host = ctx.section('系统弹窗和分享面板（点这些按钮）', 44);

  /**
   * 断言一段代码抛 TypeError，并且报错里有指定的那几个字。
   *
   * @param {string} label
   * @param {() => unknown} fn
   * @param {string} needle
   */
  const rejects = (label, fn, needle) => {
    try {
      fn();
      console.log('  ✗ ' + label + '：居然通过了');
    } catch (err) {
      const message = String(/** @type {Error} */ (err).message);
      const passed = err instanceof TypeError && message.includes(needle);
      console.log((passed ? '  ✓ ' : '  ✗ ') + label + '：' + message +
                  (passed ? '' : '（期望是 TypeError，并且提到 ' + needle + '）'));
    }
  };

  // ===== UIAlertAction：弹窗上的一个按钮 =====

  rejects('UIAlertAction 不能 new',
          // @ts-expect-error 构造函数不公开
          () => new UIAlertAction(),
          'UIAlertAction.actionWithTitle');

  const ok = UIAlertAction.actionWithTitle('好', { style: 'default' });
  assert('actionWithTitle 给的是 UIAlertAction', ok instanceof UIAlertAction, true);
  assert('按钮：标题', ok.title, '好');
  assert('按钮：样式', ok.style, 'default');
  assert('按钮：默认可以点', ok.isEnabled, true);
  ok.isEnabled = false;
  assert('按钮：isEnabled 写得进去', ok.isEnabled, false);
  // @ts-expect-error 类型上是布尔；运行时照 Web IDL 转
  ok.isEnabled = 1;
  assert('按钮：isEnabled = 1 转成 true', ok.isEnabled, true);

  const cancel = UIAlertAction.actionWithTitle('取消', { style: 'cancel' });
  const destroy = UIAlertAction.actionWithTitle('删除', { style: 'destructive' });
  assert('取消样式读得回来', cancel.style, 'cancel');
  assert('破坏性样式读得回来', destroy.style, 'destructive');
  assert('每次调工厂得到新的对象',
         UIAlertAction.actionWithTitle('好', { style: 'default' }) !== ok, true);

  // 标题照 Web IDL 转成字符串。null 给空串：实测系统不收没有标题的按钮
  // （iPhone 上直接抛异常），空串可以
  // @ts-expect-error 类型上是字符串
  assert('标题给数字：转成字符串', UIAlertAction.actionWithTitle(5, { style: 'default' }).title, '5');
  // @ts-expect-error 类型上是字符串
  assert('标题给 null：空串', UIAlertAction.actionWithTitle(null, { style: 'default' }).title, '');

  rejects('不认识的按钮样式',
          // @ts-expect-error 没有这种样式
          () => UIAlertAction.actionWithTitle('好', { style: 'primary' }),
          'expected one of');
  rejects('按钮没给样式',
          // @ts-expect-error 少了 style
          () => UIAlertAction.actionWithTitle('好', {}),
          'style');
  rejects('按钮没给 options',
          // @ts-expect-error 少了 options
          () => UIAlertAction.actionWithTitle('好'),
          'style');
  rejects('按钮的标题是只读的',
          // @ts-expect-error 只读
          () => { ok.title = '行'; },
          'title');
  rejects('按钮的样式是只读的',
          // @ts-expect-error 只读
          () => { ok.style = 'cancel'; },
          'style');

  // 事件：订得上、退得掉，不认识的名字当自定义事件。真的点一下才会由系统派发，
  // 自动跑的这一遍验不到；这里只验监听器接得上
  let heard = 0;
  const onTriggered = () => { heard++; };
  ok.addEventListener('click', onTriggered);
  ok.dispatchEvent(new Event('click'));
  assert('按钮：监听器接得上（自己派发一次）', heard, 1);
  ok.removeEventListener('click', onTriggered);
  ok.dispatchEvent(new Event('click'));
  assert('按钮：退订之后不再收到', heard, 1);
  assert('按钮上不认识的事件名：当自定义事件', customEventWorks(ok, 'not-a-real-event'), '收到一次');

  // ===== UIAlertController：提示框和底部菜单 =====

  rejects('UIAlertController 不能 new',
          // @ts-expect-error 构造函数不公开
          () => new UIAlertController(),
          'UIAlertController.alertControllerWithTitle');

  const alert = UIAlertController.alertControllerWithTitle('删除这张照片？', {
    message: '删除之后不能恢复。',
    preferredStyle: 'alert',
  });
  assert('工厂给的是 UIAlertController', alert instanceof UIAlertController, true);
  assert('它也是 UIViewController', alert instanceof UIViewController, true);
  assert('提示框：标题', alert.title, '删除这张照片？');
  assert('提示框：说明', alert.message, '删除之后不能恢复。');
  assert('提示框：样式', alert.preferredStyle, 'alert');
  assert('提示框：默认严重程度', alert.severity, 'default');
  assert('提示框：一开始没有按钮', alert.actions.length, 0);
  assert('提示框：一开始没有输入框', alert.textFields.length, 0);
  assert('提示框：一开始没有首选按钮', alert.preferredAction, null);

  const sheet = UIAlertController.alertControllerWithTitle(null, { preferredStyle: 'actionSheet' });
  assert('底部菜单：样式', sheet.preferredStyle, 'actionSheet');
  assert('底部菜单：没给标题就是 null', sheet.title, null);
  assert('底部菜单：没给说明就是 null', sheet.message, null);
  assert('底部菜单：textFields 是空数组', sheet.textFields.length, 0);

  rejects('不认识的弹窗样式',
          // @ts-expect-error 这是 Web 的说法
          () => UIAlertController.alertControllerWithTitle('标题', { preferredStyle: 'modal' }),
          'expected one of');
  rejects('弹窗没给样式',
          // @ts-expect-error 少了 preferredStyle
          () => UIAlertController.alertControllerWithTitle('标题', { message: '说明' }),
          'preferredStyle');
  rejects('弹窗没给 options',
          // @ts-expect-error 少了 options
          () => UIAlertController.alertControllerWithTitle('标题'),
          'preferredStyle');

  // ---- 标题、说明、严重程度 ----
  alert.title = '换个标题';
  assert('标题写得进去', alert.title, '换个标题');
  alert.title = null;
  assert('标题可以写成 null', alert.title, null);
  alert.message = '换个说明';
  assert('说明写得进去', alert.message, '换个说明');
  // @ts-expect-error 类型上是字符串或 null
  alert.message = 5;
  assert('说明给数字：转成字符串', alert.message, '5');
  alert.message = null;
  assert('说明可以写成 null', alert.message, null);
  alert.title = '删除这张照片？';
  alert.severity = 'critical';
  assert('严重程度写得进去', alert.severity, 'critical');
  alert.severity = 'default';
  assert('不认识的严重程度：不抛、值不变', enumIgnored(() => {
    // @ts-expect-error 没有这个取值
    alert.severity = 'high';
  }, () => alert.severity), ENUM_IGNORED);
  rejects('弹窗的样式是只读的',
          // @ts-expect-error 只读
          () => { alert.preferredStyle = 'actionSheet'; },
          'preferredStyle');

  // ---- 加按钮 ----
  alert.addAction(ok);
  assert('加了一个按钮', alert.actions.length, 1);
  assert('读出来是同一个包装', alert.actions[0] === ok, true);
  alert.addAction(cancel);
  alert.addAction(destroy);
  assert('三个按钮，顺序就是加进去的顺序',
         alert.actions.map((a) => a.title).join(' / '), '好 / 取消 / 删除');
  rejects('一个弹窗只能有一个取消样式的按钮',
          () => alert.addAction(UIAlertAction.actionWithTitle('算了', { style: 'cancel' })),
          'cancel');
  assert('被拒之后按钮没有多出来', alert.actions.length, 3);
  rejects('addAction 给的不是按钮（颜色）',
          // @ts-expect-error 要的是 UIAlertAction
          () => alert.addAction(UIColor.redColor),
          'UIAlertAction');
  rejects('addAction 给的不是按钮（字符串）',
          // @ts-expect-error 要的是 UIAlertAction
          () => alert.addAction('好'),
          'UIAlertAction');
  // 实测（不带界面的小程序）：同一个按钮加两次，系统不拦，数组里出现两个
  const twice = UIAlertController.alertControllerWithTitle('重复', { preferredStyle: 'alert' });
  const again = UIAlertAction.actionWithTitle('再来', { style: 'default' });
  twice.addAction(again);
  twice.addAction(again);
  assert('实测：同一个按钮加两次，系统里是两个', twice.actions.length, 2);
  assert('两个都是同一个包装', twice.actions[0] === again && twice.actions[1] === again, true);

  // ---- 首选按钮 ----
  alert.preferredAction = ok;
  assert('首选按钮写得进去', alert.preferredAction === ok, true);
  alert.preferredAction = null;
  assert('首选按钮可以写成 null', alert.preferredAction, null);
  rejects('首选按钮必须是这个弹窗里的',
          () => { alert.preferredAction = UIAlertAction.actionWithTitle('外人', { style: 'default' }); },
          'actions');
  assert('被拒之后还是 null', alert.preferredAction, null);
  rejects('首选按钮给的不是按钮',
          // @ts-expect-error 要的是 UIAlertAction 或 null
          () => { alert.preferredAction = '好'; },
          'preferredAction');
  alert.preferredAction = ok;

  // ---- 输入框 ----
  const field = alert.addTextField();
  assert('addTextField 返回 UITextField', field instanceof UITextField, true);
  assert('弹窗里有一个输入框', alert.textFields.length, 1);
  assert('textFields 里就是返回的那个', alert.textFields[0] === field, true);
  field.placeholder = '输入 DELETE 确认';
  field.text = 'DELETE';
  assert('输入框照常配置：占位文字', alert.textFields[0].placeholder, '输入 DELETE 确认');
  assert('输入框照常配置：文字', alert.textFields[0].text, 'DELETE');
  const second = alert.addTextField();
  assert('再加一个：两个输入框', alert.textFields.length, 2);
  assert('顺序就是加进去的顺序', alert.textFields[1] === second, true);
  rejects('底部菜单不能加输入框', () => sheet.addTextField(), 'alert');
  assert('被拒之后底部菜单还是没有输入框', sheet.textFields.length, 0);

  // 实测值，不当断言：不带界面的小程序里量到的是 custom（提示框）和 popover
  // （底部菜单），放进真的 App 里系统会不会解析成别的，没量过
  console.log('  实测：提示框的 modalPresentationStyle = ' + alert.modalPresentationStyle +
              '，底部菜单的 = ' + sheet.modalPresentationStyle);

  // ===== UIActivityViewController：系统分享面板 =====

  rejects('分享面板必须给要分享的东西',
          // @ts-expect-error 少了 activityItems
          () => new UIActivityViewController(),
          'activityItems');
  rejects('要分享的东西必须是数组',
          // @ts-expect-error 要的是数组
          () => new UIActivityViewController('一段文字'),
          'activityItems');
  rejects('分享不了的东西（视图）',
          // @ts-expect-error 只收字符串、URL、UIImage
          () => new UIActivityViewController([new UIView()]),
          'activityItems[0]');
  rejects('分享不了的东西（null）',
          // @ts-expect-error 只收字符串、URL、UIImage
          () => new UIActivityViewController(['文字', null]),
          'activityItems[1]');
  rejects('自定义的分享动作还不支持',
          // @ts-expect-error 没有这个选项
          () => new UIActivityViewController(['文字'], { applicationActivities: [{}] }),
          'applicationActivities');

  const share = new UIActivityViewController(['Nacre 验收', new URL('https://example.com/a?b=1')]);
  assert('new 出来的是 UIActivityViewController', share instanceof UIActivityViewController, true);
  assert('它也是 UIViewController', share instanceof UIViewController, true);
  assert('分享面板：默认不排除任何动作', share.excludedActivityTypes, null);
  assert('分享面板：默认不隐藏任何分区', share.excludedActivitySectionTypes.length, 0);
  assert('分享面板：默认允许突出显示一个动作', share.allowsProminentActivity, true);

  const dot = UIImage.imageNamed('JS/assets/dot');
  if (dot != null) {
    const withImage = new UIActivityViewController([dot, '配一句话']);
    assert('图片也能分享', withImage instanceof UIActivityViewController, true);
  } else {
    console.log('  ! 找不到 JS/assets/dot，分享图片这一条未验证');
  }
  // 实测（不带界面的小程序）：空数组系统不拦
  assert('实测：空数组建得出来',
         new UIActivityViewController([]) instanceof UIActivityViewController, true);

  share.excludedActivityTypes = ['airDrop', 'copyToPasteboard'];
  assert('排除的动作写得进去',
         /** @type {string[]} */ (share.excludedActivityTypes).join(' / '),
         'airDrop / copyToPasteboard');
  share.excludedActivityTypes = [];
  assert('排除的动作可以写成空数组',
         Array.isArray(share.excludedActivityTypes) && share.excludedActivityTypes.length, 0);
  share.excludedActivityTypes = null;
  assert('排除的动作可以写回 null', share.excludedActivityTypes, null);
  assert('不认识的分享动作：不抛、值不变', enumIgnored(() => {
    // @ts-expect-error 没有这个动作
    share.excludedActivityTypes = ['airDrop', 'wechat'];
  }, () => share.excludedActivityTypes), ENUM_IGNORED);
  assert('被拒之后原值不动', share.excludedActivityTypes, null);
  rejects('排除的动作不是数组',
          // @ts-expect-error 要的是数组或 null
          () => { share.excludedActivityTypes = 'airDrop'; },
          'excludedActivityTypes');
  // 二十个动作名都认
  const everyType = /** @type {const} */ ([
    'postToFacebook', 'postToTwitter', 'postToWeibo', 'message', 'mail', 'print',
    'copyToPasteboard', 'assignToContact', 'saveToCameraRoll', 'addToReadingList',
    'postToFlickr', 'postToVimeo', 'postToTencentWeibo', 'airDrop', 'openInIBooks',
    'markupAsPDF', 'sharePlay', 'collaborationInviteWithLink', 'collaborationCopyLink',
    'addToHomeScreen',
  ]);
  share.excludedActivityTypes = [...everyType];
  assert('二十个动作名都写得进去、读得回来',
         /** @type {string[]} */ (share.excludedActivityTypes).join(','), everyType.join(','));
  share.excludedActivityTypes = null;

  share.excludedActivitySectionTypes = ['peopleSuggestions'];
  assert('隐藏的分区写得进去', share.excludedActivitySectionTypes.join(), 'peopleSuggestions');
  share.excludedActivitySectionTypes = [];
  assert('隐藏的分区可以写回空数组', share.excludedActivitySectionTypes.length, 0);
  assert('不认识的分区：不抛、值不变', enumIgnored(() => {
    // @ts-expect-error 没有这个分区
    share.excludedActivitySectionTypes = ['apps'];
  }, () => share.excludedActivitySectionTypes), ENUM_IGNORED);
  rejects('隐藏的分区不是数组',
          // @ts-expect-error 要的是数组
          () => { share.excludedActivitySectionTypes = 'peopleSuggestions'; },
          'excludedActivitySectionTypes');

  share.allowsProminentActivity = false;
  assert('allowsProminentActivity 写得进去', share.allowsProminentActivity, false);
  share.allowsProminentActivity = true;

  // 事件：complete 订得上；模态的那三个还在；别的名字当自定义事件
  const onComplete = () => {};
  share.addEventListener('complete', onComplete);
  share.removeEventListener('complete', onComplete);
  share.addEventListener('dismiss', onComplete);
  share.removeEventListener('dismiss', onComplete);
  console.log('  ✓ 分享面板：complete 和 dismiss 都订得上');
  assert('分享面板上不认识的事件名：当自定义事件', customEventWorks(share, 'not-a-real-event'), '收到一次');
  // 弹窗上不能监听页面的那三个关闭事件：它们靠的是呈现委托，而实测系统
  // 不许动提示框的呈现委托（一动就抛异常）。最初这里写的是「订得上」，
  // 合并后的第一轮验收证明那个假设是错的。两种样式一样处理
  for (const type of /** @type {const} */ (['beforedismiss', 'dismiss', 'dismissattempt'])) {
    assert('提示框上 ' + type + ' 当自定义事件', customEventWorks(alert, type), '收到一次');
  }
  assert('底部菜单上 dismiss 也当自定义事件', customEventWorks(sheet, 'dismiss'), '收到一次');
  assert('提示框上 dismiss 再来一遍，还是当自定义事件', customEventWorks(alert, 'dismiss'), '收到一次');
  assert('弹窗自己没有按钮的那个事件，当自定义事件', customEventWorks(alert, 'click'), '收到一次');

  // ===== 持有边：弹窗拿着它的按钮和输入框 =====
  //
  // 加进去之后 JS 这边丢掉引用，GC 之后从弹窗上读回来必须还是原来那个包装
  // （挂在包装上的东西还在）
  const keeper = UIAlertController.alertControllerWithTitle('持有边', { preferredStyle: 'alert' });
  (() => {
    const kept = UIAlertAction.actionWithTitle('留着', { style: 'default' });
    /** @type {any} */ (kept).probe = '挂在按钮包装上';
    keeper.addAction(kept);
    /** @type {any} */ (keeper.addTextField()).probe = '挂在输入框包装上';
  })();

  // ===== 留给真实触摸的三个按钮 =====
  const row = new UIStackView();
  row.axis = 'horizontal';
  row.distribution = 'fillEqually';
  row.spacing = 8;
  row.translatesAutoresizingMaskIntoConstraints = false;
  host.addSubview(row);
  NSLayoutConstraint.activateConstraints([
    row.leadingAnchor.constraintEqualToAnchor(host.leadingAnchor, { constant: 16 }),
    row.trailingAnchor.constraintEqualToAnchor(host.trailingAnchor, { constant: -16 }),
    row.topAnchor.constraintEqualToAnchor(host.topAnchor),
    row.bottomAnchor.constraintEqualToAnchor(host.bottomAnchor),
  ]);
  /**
   * @param {string} title
   * @param {() => void} onTap
   */
  const entry = (title, onTap) => {
    const button = UIButton.buttonWithType('system');
    button.setTitle(title, { forState: ['normal'] });
    button.backgroundColor = UIColor.systemOrangeColor;
    button.setTitleColor(UIColor.whiteColor, { forState: ['normal'] });
    button.layer.cornerRadius = 10;
    button.addEventListener('click', onTap);
    row.addArrangedSubview(button);
  };

  // 点了按钮之后弹窗是系统自己关掉的。这时「呈现它的页面持有它」那条边
  // 要有人放开，否则关掉的弹窗一直不被回收。JS 这边看不到那条边，只能看
  // 结果：登记一下，点完逼一次 GC，看弹窗的包装有没有被回收
  const reclaimed = new FinalizationRegistry((/** @type {{ gone: boolean }} */ token) => {
    token.gone = true;
  });
  /**
   * @param {{ gone: boolean }} token
   * @param {string} what
   */
  const checkReclaimed = (token, what) => {
    collectGarbage().then((ran) => {
      console.log(!ran ? '  ! 真实触摸：GC 没跑到，' + what + '有没有被回收这一条未验证'
        : token.gone ? '  ✓ 真实触摸：' + what + '被系统关掉之后，它的包装被回收了'
          : '  ✗ 真实触摸：' + what + '被系统关掉之后，它的包装还没被回收');
    });
  };

  // 每次点都新建一个：弹窗用完就丢，不复用
  entry('提示框', () => {
    const ask = UIAlertController.alertControllerWithTitle('改个名字', {
      message: '点一个按钮，终端里会打出是哪一个。',
      preferredStyle: 'alert',
    });
    const input = ask.addTextField();
    input.placeholder = '新名字';
    const token = { gone: false };
    reclaimed.register(ask, token);
    for (const [title, style] of /** @type {const} */ ([
      ['取消', 'cancel'], ['删除', 'destructive'], ['保存', 'default'],
    ])) {
      const action = UIAlertAction.actionWithTitle(title, { style });
      action.addEventListener('click', (e) => {
        console.log('  ✓ 真实触摸：点了「' + action.title + '」（' + action.style +
                    '），e.target 是这个按钮 = ' + (e.target === action) +
                    '，输入框里是 ' + JSON.stringify(input.text) +
                    '，这时 presentedViewController = ' + vc.presentedViewController);
        checkReclaimed(token, '提示框');
      });
      ask.addAction(action);
      if (style === 'default') ask.preferredAction = action;
    }
    vc.presentViewController(ask, { animated: true });
  });
  entry('底部菜单', () => {
    const menu = UIAlertController.alertControllerWithTitle('这张照片', {
      message: null,
      preferredStyle: 'actionSheet',
    });
    const token = { gone: false };
    reclaimed.register(menu, token);
    for (const [title, style] of /** @type {const} */ ([
      ['存到相册', 'default'], ['删除', 'destructive'], ['取消', 'cancel'],
    ])) {
      const action = UIAlertAction.actionWithTitle(title, { style });
      action.addEventListener('click', () => {
        console.log('  ✓ 真实触摸：底部菜单点了「' + action.title + '」');
        checkReclaimed(token, '底部菜单');
      });
      menu.addAction(action);
    }
    vc.presentViewController(menu, { animated: true });
  });
  entry('分享', () => {
    const panel = new UIActivityViewController(
      ['来自 Nacre 验收的一句话', new URL('https://example.com/')]);
    const token = { gone: false };
    reclaimed.register(panel, token);
    panel.addEventListener('complete', (e) => {
      const done = /** @type {UIActivityViewControllerCompletionEvent} */ (e);
      console.log('  ✓ 真实触摸：分享面板结束，completed = ' + done.completed +
                  '，activityType = ' + done.activityType +
                  '，activityError = ' + done.activityError);
      checkReclaimed(token, '分享面板');
    });
    vc.presentViewController(panel, { animated: true });
  });
  console.log('  ✓ 瀑布里多了「提示框 / 底部菜单 / 分享」三个按钮，点了之后看终端');

  // ===== 真的呈现一次，再用代码关掉 =====
  //
  // 排在别的步骤的呈现之后：同一时刻只能有一个模态在呈现中，撞上了系统会
  // 拒掉后来的那个。先等 2.5 秒（模态那一步在 600 毫秒时弹），再等到根页面
  // 上没有正在呈现的东西
  //
  // 这一段做完的时刻作为 Promise 返回：它占着根页面的呈现位置，排在后面的步骤
  // 要等它做完（见 main.js）
  /** @type {() => void} */
  let finished = () => {};
  /** @type {Promise<void>} */
  const done = new Promise((resolve) => { finished = resolve; });
  setTimeout(async () => { try {
    for (let waited = 0; vc.presentedViewController !== null && waited < 5000; waited += 200) {
      await sleep(200);
    }
    if (vc.presentedViewController !== null) {
      console.log('  ! 根页面上一直有别的模态在呈现，弹窗的呈现这一组未验证');
      return;
    }

    // 呈现的这一个不带输入框：带输入框的弹窗一出来键盘就会弹起，会把底部
    // 那张输入框卡片的焦点抢走
    const shownAlert = UIAlertController.alertControllerWithTitle('自动验收', {
      message: '这个提示框马上会被代码关掉。',
      preferredStyle: 'alert',
    });
    let fired = 0;
    const only = UIAlertAction.actionWithTitle('好', { style: 'default' });
    only.addEventListener('click', () => { fired++; });
    shownAlert.addAction(only);
    assert('提示框：present 兑现', await vc.presentViewController(shownAlert, { animated: false }), true);
    assert('提示框呈现中：presentedViewController 是它',
           vc.presentedViewController === shownAlert, true);
    assert('提示框：dismiss 兑现', await shownAlert.dismissViewController({ animated: false }), true);
    assert('提示框关掉之后 presentedViewController 清了', vc.presentedViewController, null);
    assert('用代码关掉不算点了按钮：事件没有派发', fired, 0);

    const shownSheet = UIAlertController.alertControllerWithTitle('自动验收', {
      preferredStyle: 'actionSheet',
    });
    shownSheet.addAction(UIAlertAction.actionWithTitle('取消', { style: 'cancel' }));
    assert('底部菜单：present 兑现', await vc.presentViewController(shownSheet, { animated: false }), true);
    assert('底部菜单呈现中：presentedViewController 是它',
           vc.presentedViewController === shownSheet, true);
    assert('底部菜单：dismiss 兑现', await shownSheet.dismissViewController({ animated: false }), true);
    assert('底部菜单关掉之后 presentedViewController 清了', vc.presentedViewController, null);

    // 分享面板。用代码关掉之后系统会不会调完成回调，没有依据，所以这一条
    // 等得到就验字段，等不到就报未验证
    const shownShare = new UIActivityViewController(['自动验收']);
    /** @type {UIActivityViewControllerCompletionEvent | null} */
    let completion = null;
    let completions = 0;
    shownShare.addEventListener('complete', (e) => {
      completions++;
      completion = /** @type {UIActivityViewControllerCompletionEvent} */ (e);
    });
    assert('分享面板：present 兑现', await vc.presentViewController(shownShare, { animated: false }), true);
    assert('分享面板呈现中：presentedViewController 是它',
           vc.presentedViewController === shownShare, true);
    assert('分享面板：dismiss 兑现', await shownShare.dismissViewController({ animated: false }), true);
    assert('分享面板关掉之后 presentedViewController 清了', vc.presentedViewController, null);
    for (let waited = 0; completion === null && waited < 3000; waited += 100) await sleep(100);
    const got = /** @type {UIActivityViewControllerCompletionEvent | null} */ (completion);
    if (got === null) {
      console.log('  ! 用代码关掉分享面板之后没等到 complete，事件带的数据这一条未验证（要真的点一次）');
    } else {
      assert('实测：用代码关掉也会派发 complete，只派发一次', completions, 1);
      assert('complete：target 是分享面板', got.target === shownShare, true);
      assert('complete：没有完成', got.completed, false);
      assert('complete：没有选任何动作', got.activityType, null);
      assert('complete：没有错误', got.activityError, null);
      assert('complete：是 UIActivityViewControllerCompletionEvent',
             got instanceof UIActivityViewControllerCompletionEvent, true);
    }

    // 持有边的 GC 回归
    const ran = await collectGarbage();
    if (!ran) {
      console.log('  ! GC 没跑到，弹窗的持有边这一条未验证');
    } else {
      assert('GC 之后：actions 里还是原来那个按钮的包装',
             /** @type {any} */ (keeper.actions[0]).probe, '挂在按钮包装上');
      assert('GC 之后：textFields 里还是原来那个输入框的包装',
             /** @type {any} */ (keeper.textFields[0]).probe, '挂在输入框包装上');
    }
  } finally { finished(); } }, 2500);
  return done;
}
