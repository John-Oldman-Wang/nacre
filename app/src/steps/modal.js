// 模态呈现：present / dismiss（都是 Promise）、呈现关系、三条关闭事件。

import { makePage } from '../pages.js';

/** @param {import("../main.js").StepContext} ctx */
export function stepModal(ctx) {
  const { assert, vc } = ctx;

  console.log('--- 模态呈现 ---');
  // 区块现在就建：按钮要等 600 ms 才加，那时再建区块，它在瀑布里的位置就乱了
  const modalHost = ctx.section('模态呈现：弹一张能拖走的卡片', 44);

  // ---- 默认值（不用上屏）----
  const sheet = new UIViewController();
  sheet.title = '卡片';
  // 实测：读出来**不是** 'automatic'——系统把它解析成了具体样式。头文件写的
  // 默认值是 UIModalPresentationAutomatic，但 getter 返回的是解析结果
  assert('实测：默认读回解析后的具体样式', sheet.modalPresentationStyle, 'formSheet');
  assert('默认转场', sheet.modalTransitionStyle, 'coverVertical');
  assert('默认拖得走', sheet.isModalInPresentation, false);
  assert('还没呈现时没有 presentingViewController', sheet.presentingViewController, null);
  assert('还没呈现时没有 presentedViewController', vc.presentedViewController, null);

  sheet.modalPresentationStyle = 'pageSheet';
  assert('呈现方式写得进去', sheet.modalPresentationStyle, 'pageSheet');
  sheet.modalTransitionStyle = 'crossDissolve';
  assert('转场写得进去', sheet.modalTransitionStyle, 'crossDissolve');
  sheet.modalTransitionStyle = 'coverVertical';

  try {
    // @ts-expect-error 这是 Web 的说法
    sheet.modalPresentationStyle = 'modal';
    console.log('  ✗ 不认识的呈现方式居然通过了');
  } catch (err) {
    console.log('  ✓ 不认识的呈现方式被拒:', err.message.slice(0, 46) + '…');
  }
  try {
    // 类型上放行（留了 string 口子），运行时拦
    sheet.addEventListener('dismiss', () => {});
    console.log('  ✗ 不认识的事件名居然通过了');
  } catch (err) {
    console.log('  ✓ 不认识的事件名被拒:', err.message.slice(0, 50) + '…');
  }

  // ---- 真的呈现一次，再关掉 ----
  // 等界面安定下来再弹：导航控制器刚接管窗口那一瞬 UIKit 还在做转场
  setTimeout(async () => {
    sheet.view.backgroundColor = UIColor.systemGreenColor;

    /** @type {string[]} */
    const dismissLog = [];
    for (const type of ['willdismiss', 'diddismiss', 'dismissattempted']) {
      sheet.addEventListener(type, () => dismissLog.push(type));
    }

    const shown = await vc.presentViewController(sheet, { animated: false });
    assert('present 兑现', shown, true);
    assert('presentedViewController 是它', vc.presentedViewController === sheet, true);
    // 实测：从导航控制器的子页面呈现，presentingViewController 是那个**容器**，
    // 不是发起呈现的子页面。vc.presentedViewController 那一侧倒是记在 vc 上
    assert('实测：presentingViewController 是导航控制器',
           sheet.presentingViewController === vc.navigationController, true);

    const closed = await sheet.dismissViewController({ animated: false });
    assert('dismiss 兑现', closed, true);
    assert('关掉之后 presentedViewController 清了', vc.presentedViewController, null);

    // 实测：程序调用 dismiss 到底会不会走那几个 delegate
    console.log('  实测：程序 dismiss 之后收到的事件 = [' + dismissLog.join(', ') + ']');

    // ---- 留一个入口给真实的拖拽测试 ----
    const draggable = makePage({
      title: '可以拖走',
      color: UIColor.systemGreenColor,
      heading: '向下拖我\n或者点「完成」',
      buttons: [
        ['完成', () => draggable.dismissViewController({ animated: true })],
        ['锁住（拖不走）', () => {
          draggable.isModalInPresentation = true;
          console.log('  ✓ 已锁住，再往下拖会收到 dismissattempted');
        }],
      ],
    });
    draggable.modalPresentationStyle = 'pageSheet';
    draggable.addEventListener('diddismiss', () => {
      // 关掉之后解锁，下一次又能拖
      draggable.isModalInPresentation = false;
    });
    for (const type of ['willdismiss', 'diddismiss', 'dismissattempted']) {
      draggable.addEventListener(type, (e) => {
        console.log('  ✓ 模态事件：' + e.type +
                    '（isModalInPresentation = ' + draggable.isModalInPresentation + '）');
      });
    }
    ctx.modalPage = draggable;

    const open = UIButton.buttonWithType('system');
    open.setTitle('弹一张卡片 ↑', { forState: ['normal'] });
    open.backgroundColor = UIColor.systemGreenColor;
    open.setTitleColor(UIColor.whiteColor, { forState: ['normal'] });
    open.layer.cornerRadius = 10;
    open.frame = new CGRect(16, 0, 150, 44);
    open.addEventListener('primaryActionTriggered', () => {
      vc.presentViewController(draggable, { animated: true });
    });
    modalHost.addSubview(open);
    console.log('  ✓ 第一页多了「弹一张卡片 ↑」，弹出来能拖走也能点「完成」');
  }, 600);
}
