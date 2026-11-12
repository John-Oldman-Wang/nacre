// UIPasteboard：系统剪贴板上的字符串。

/**
 * 屏幕右上的「系统能力」面板：一个纵向的排列容器，每一步往里加一排按钮。
 * 剪贴板和触感反馈都要真的点一下才看得出效果，所以给它们留一块地方。
 *
 * @param {import("../main.js").StepContext} ctx
 * @returns {UIStackView}
 */
export function systemPanel(ctx) {
  if (ctx.systemPanel) return ctx.systemPanel;
  const card = new UIView();
  card.frame = new CGRect(250, 128, 160, 106);
  card.backgroundColor = 'secondarySystemBackground';
  card.layer.cornerRadius = 10;
  const column = new UIStackView();
  column.axis = 'vertical';
  column.distribution = 'fillEqually';
  column.spacing = 6;
  // 四周留 8 点：内边距那一步做的能力，这里是第一处真用上的
  column.isLayoutMarginsRelativeArrangement = true;
  column.directionalLayoutMargins = { top: 8, leading: 8, bottom: 8, trailing: 8 };
  column.frame = new CGRect(0, 0, 160, 106);
  card.addSubview(column);
  ctx.vc.view.addSubview(card);
  ctx.systemPanel = column;
  return column;
}

/**
 * 面板里的一排按钮。
 *
 * @param {UIStackView} panel
 * @param {Array<[string, () => void]>} items 标题和点击时做的事
 */
export function panelRow(panel, items) {
  const row = new UIStackView();
  row.axis = 'horizontal';
  row.distribution = 'fillEqually';
  row.spacing = 6;
  for (const [title, onTap] of items) {
    const button = UIButton.buttonWithType('system');
    button.setTitle(title, { forState: ['normal'] });
    // 颜色表里还没有 systemFill 那一组，先用背景色
    button.backgroundColor = 'systemBackground';
    button.layer.cornerRadius = 6;
    button.addEventListener('touchUpInside', onTap);
    row.addArrangedSubview(button);
  }
  panel.addArrangedSubview(row);
}

/** @param {import("../main.js").StepContext} ctx */
export function stepPasteboard(ctx) {
  const { assert } = ctx;
  // ===== UIPasteboard =====
  //
  // 复制订单号、粘贴验证码。在这之前 JS 碰不到剪贴板。
  console.log('--- UIPasteboard ---');

  const pasteboard = UIPasteboard.generalPasteboard;
  assert('generalPasteboard 是 UIPasteboard', pasteboard instanceof UIPasteboard, true);
  assert('每次读是同一个包装', UIPasteboard.generalPasteboard === pasteboard, true);
  try {
    // @ts-expect-error 构造函数是私有的
    new UIPasteboard();
    console.log('  ✗ UIPasteboard 居然能 new');
  } catch (err) {
    console.log('  ✓ UIPasteboard 不能 new:', err.message);
  }
  // 这两个只是查询，不取内容，在真机上也不会引出系统提示
  assert('hasStrings 是布尔', typeof pasteboard.hasStrings, 'boolean');
  assert('changeCount 是数', typeof pasteboard.changeCount, 'number');
  try {
    // @ts-expect-error 要字符串
    pasteboard.string = 42;
    console.log('  ✗ 数字居然写进去了');
  } catch (err) {
    console.log('  ✓ 写的不是字符串被拒:', err.message);
  }
  try {
    // @ts-expect-error 只读
    pasteboard.changeCount = 0;
    console.log('  ✗ changeCount 居然能写');
  } catch (err) {
    console.log('  ✓ changeCount 只读:', err instanceof TypeError);
  }
  try {
    // @ts-expect-error 没有这个事件
    pasteboard.addEventListener('paste', () => {});
    console.log('  ✗ 不认识的事件名居然订上了');
  } catch (err) {
    console.log('  ✓ 不认识的事件名被拒:', err.message);
  }

  // ---- 屏幕上：两个按钮，等真实点击 ----
  let changes = 0;
  pasteboard.addEventListener('change', () => {
    changes += 1;
    console.log('  ✓ 剪贴板 change 事件（第 ' + changes + ' 次），changeCount = ' +
                pasteboard.changeCount);
  });
  panelRow(systemPanel(ctx), [
    ['复制', () => {
      const text = 'NACRE-' + crypto.randomUUID().slice(0, 8);
      pasteboard.string = text;
      console.log('  ✓ 真实触摸：已复制 ' + text + '，changeCount = ' + pasteboard.changeCount +
                  '（到别的 App 里粘贴看看）');
    }],
    ['粘贴', () => {
      const before = performance.now();
      const text = pasteboard.string;
      const cost = performance.now() - before;
      console.log('  ✓ 真实触摸：读到 ' +
                  (text === null ? 'null' : JSON.stringify(text.slice(0, 40))) +
                  '，hasStrings = ' + pasteboard.hasStrings +
                  '，changeCount = ' + pasteboard.changeCount +
                  '，读这一下用了 ' + cost.toFixed(1) + ' ms');
    }],
  ]);
  console.log('  ✓ 右上角的面板里有「复制」「粘贴」两个按钮');

  // ---- 自动的读写断言：只在模拟器上跑 ----
  //
  // 真机上不跑：一是会把用户剪贴板里的东西冲掉，二是读别的 App 复制的内容
  // 系统可能弹提示，卡住启动。分清模拟器和真机靠 Info.plist 里的事实
  if (application.info.DTPlatformName !== 'iphonesimulator') {
    console.log('  ! 不在模拟器上，自动的读写断言不跑（免得冲掉剪贴板），请用面板里的按钮');
    return;
  }

  const countBefore = pasteboard.changeCount;
  const changesBefore = changes;
  const text = 'nacre 剪贴板 ' + crypto.randomUUID();
  pasteboard.string = text;
  assert('写进去读出来', pasteboard.string, text);
  assert('写了之后 hasStrings', pasteboard.hasStrings, true);
  assert('写了之后 changeCount 变大', pasteboard.changeCount > countBefore, true);

  // 写 null 原样交给 UIKit。实测它的效果是清空，所以固化成断言
  const countMid = pasteboard.changeCount;
  pasteboard.string = null;
  assert('写 null 之后读到 null', pasteboard.string, null);
  assert('写 null 之后 hasStrings 是 false', pasteboard.hasStrings, false);
  assert('写 null 也算一次变化', pasteboard.changeCount > countMid, true);

  // change 事件延后一轮才到，等它；到点没来就报未验证
  const deadline = Date.now() + 3000;
  (function wait() {
    if (changes > changesBefore) {
      assert('自己写剪贴板也会收到 change', changes > changesBefore, true);
      return;
    }
    if (Date.now() > deadline) {
      console.log('  ! 3 秒内没等到 change 事件，「自己写也会收到」这一条未验证');
      return;
    }
    setTimeout(wait, 50);
  })();
}
