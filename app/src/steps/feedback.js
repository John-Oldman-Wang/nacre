// 触感反馈：UIImpactFeedbackGenerator、UISelectionFeedbackGenerator、
// UINotificationFeedbackGenerator。

import { panelRow, systemPanel } from './pasteboard.js';

/** @param {import("../main.js").StepContext} ctx */
export function stepFeedback(ctx) {
  const { assert, vc } = ctx;
  // ===== 触感反馈 =====
  //
  // 让手机震一下。模拟器没有震动，所以这里能自动验的只有「建得出来、
  // 调了不抛、写错了会抛」；震没震只能在真机上用手感受。
  console.log('--- 触感反馈 ---');

  // ---- 四个类都不能 new ----
  for (const Kind of [UIFeedbackGenerator, UIImpactFeedbackGenerator,
                      UISelectionFeedbackGenerator, UINotificationFeedbackGenerator]) {
    try {
      // @ts-expect-error 构造函数不公开
      new Kind();
      console.log('  ✗ ' + Kind.name + ' 居然能 new');
    } catch (err) {
      console.log('  ✓ ' + Kind.name + ' 不能 new:', err.message);
    }
  }

  // ---- 工厂 ----
  const host = vc.view;
  const impact = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('medium', { forView: host });
  assert('撞击：工厂给的是 UIImpactFeedbackGenerator',
         impact instanceof UIImpactFeedbackGenerator, true);
  assert('它也是 UIFeedbackGenerator', impact instanceof UIFeedbackGenerator, true);
  const selection = UISelectionFeedbackGenerator.feedbackGeneratorForView(host);
  assert('选择：工厂给的是 UISelectionFeedbackGenerator',
         selection instanceof UISelectionFeedbackGenerator, true);
  const notification = UINotificationFeedbackGenerator.feedbackGeneratorForView(host);
  assert('通知：工厂给的是 UINotificationFeedbackGenerator',
         notification instanceof UINotificationFeedbackGenerator, true);
  assert('每次调工厂得到新的对象',
         UISelectionFeedbackGenerator.feedbackGeneratorForView(host) !== selection, true);

  // 五种力度都建得出来
  let made = 0;
  for (const style of /** @type {const} */ (['light', 'medium', 'heavy', 'soft', 'rigid'])) {
    const g = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle(style, { forView: host });
    if (g instanceof UIImpactFeedbackGenerator) made += 1;
  }
  assert('五种力度都建得出来', made, 5);

  // ---- 写错了要抛 ----
  try {
    // @ts-expect-error 没有这种力度
    UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('strong', { forView: host });
    console.log('  ✗ 不认识的力度居然通过了');
  } catch (err) {
    console.log('  ✓ 不认识的力度被拒:', err.message);
  }
  try {
    // @ts-expect-error 少了 forView
    UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('light', {});
    console.log('  ✗ 缺 forView 居然通过了');
  } catch (err) {
    console.log('  ✓ 缺 forView 被拒:', err.message);
  }
  try {
    // @ts-expect-error 要的是视图
    UISelectionFeedbackGenerator.feedbackGeneratorForView(UIDevice.currentDevice);
    console.log('  ✗ 不是视图居然通过了');
  } catch (err) {
    console.log('  ✓ 参数不是视图被拒:', err.message);
  }

  // ---- 调用：模拟器上不震，但不能抛 ----
  let calls = 0;
  impact.prepare(); calls += 1;
  impact.impactOccurred(); calls += 1;
  impact.impactOccurredWithIntensity(0.5); calls += 1;
  impact.impactOccurredWithIntensity(0); calls += 1;
  impact.impactOccurredWithIntensity(1); calls += 1;
  selection.prepare(); calls += 1;
  selection.selectionChanged(); calls += 1;
  notification.prepare(); calls += 1;
  for (const type of /** @type {const} */ (['success', 'warning', 'error'])) {
    notification.notificationOccurred(type); calls += 1;
  }
  assert('十一次调用都没抛', calls, 11);

  try {
    impact.impactOccurredWithIntensity(2);
    console.log('  ✗ 强度 2 居然通过了');
  } catch (err) {
    console.log('  ✓ 强度超出 0 到 1 被拒:', err.message);
  }
  try {
    // @ts-expect-error 强度要数字
    impact.impactOccurredWithIntensity('max');
    console.log('  ✗ 字符串强度居然通过了');
  } catch (err) {
    console.log('  ✓ 强度转不出数被拒:', err.message);
  }
  try {
    // @ts-expect-error 没有这种通知
    notification.notificationOccurred('info');
    console.log('  ✗ 不认识的通知类型居然通过了');
  } catch (err) {
    console.log('  ✓ 不认识的通知类型被拒:', err.message);
  }

  // ---- 屏幕上：两排按钮，在真机上点了才知道震没震 ----
  const panel = systemPanel(ctx);
  /** @param {UIImpactFeedbackStyle} style */
  const hit = (style) => {
    const g = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle(style, { forView: panel });
    return () => {
      g.impactOccurred();
      console.log('  ✓ 真实触摸：撞击 ' + style);
    };
  };
  panelRow(panel, [['轻', hit('light')], ['中', hit('medium')], ['重', hit('heavy')]]);
  const pick = UISelectionFeedbackGenerator.feedbackGeneratorForView(panel);
  const notify = UINotificationFeedbackGenerator.feedbackGeneratorForView(panel);
  panelRow(panel, [
    ['选择', () => { pick.selectionChanged(); console.log('  ✓ 真实触摸：选择'); }],
    ['成功', () => { notify.notificationOccurred('success'); console.log('  ✓ 真实触摸：通知 success'); }],
    ['失败', () => { notify.notificationOccurred('error'); console.log('  ✓ 真实触摸：通知 error'); }],
  ]);
  console.log('  ✓ 右上角的面板里多了两排按钮：轻 / 中 / 重，选择 / 成功 / 失败');
}
