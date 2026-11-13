// UIButton：标题、颜色、图片按状态设。

/** @param {import("../main.js").StepContext} ctx */
export function stepButton(ctx) {
  const { assert, vc } = ctx;
  // ===== UIButton =====
  console.log('--- UIButton ---');
  {
    const button = UIButton.buttonWithType('system');
    button.translatesAutoresizingMaskIntoConstraints = false;
    const host = ctx.section('UIButton：按状态设标题和颜色', 44);
    host.addSubview(button);
    NSLayoutConstraint.activateConstraints([
      button.centerXAnchor.constraintEqualToAnchor(host.centerXAnchor),
      button.centerYAnchor.constraintEqualToAnchor(host.centerYAnchor),
    ]);

    assert('buttonWithType 给的是 UIButton', button instanceof UIButton, true);
    assert('也是 UIControl', button instanceof UIControl, true);
    assert('也是 UIView', button instanceof UIView, true);
    assert('buttonType 读回来', button.buttonType, 'system');
    assert('role 默认 normal', button.role, 'normal');
    assert('还没设标题时 currentTitle 是 null', button.currentTitle, null);

    try {
      // @ts-expect-error 没有这个类型
      UIButton.buttonWithType('squishy');
      console.log('  ✗ 不认识的按钮类型居然通过了');
    } catch (err) {
      console.log('  ✓ 不认识的按钮类型被拒:', err.message.slice(0, 40) + '…');
    }

    // 按状态设。只设 normal，别的状态回退到它
    button.setTitle('点我试试', { forState: ['normal'] });
    button.setTitle('按住啦', { forState: ['highlighted'] });
    assert('titleForState(normal)', button.titleForState('normal'), '点我试试');
    assert('titleForState(highlighted)', button.titleForState('highlighted'), '按住啦');
    // 实测：没设过的状态**回退到 normal**，不是 null
    assert('没设过的状态回退到 normal', button.titleForState('disabled'), '点我试试');
    assert('currentTitle 用的是当前状态那个', button.currentTitle, '点我试试');

    button.setTitleColor(UIColor.systemRedColor, { forState: ['normal'] });
    assert('颜色按状态取回来，是语义色的名字', button.titleColorForState('normal'),
           'systemRed');   // 写的是 UIColor 对象，所以走反查名字那条路
    assert('currentTitleColor 永远非空', typeof button.currentTitleColor, 'string');

    // 组合状态：选中且禁用
    button.setTitle('两个状态', { forState: ['selected', 'disabled'] });
    button.isSelected = true;
    button.isEnabled = false;
    assert('组合状态下的标题', button.currentTitle, '两个状态');
    button.isSelected = false;
    button.isEnabled = true;
    assert('恢复后又回到 normal 的标题', button.currentTitle, '点我试试');

    try {
      // @ts-expect-error forState 不能少
      button.setTitle('没给状态', {});
      console.log('  ✗ 缺 forState 居然通过了');
    } catch (err) {
      console.log('  ✓ 缺 forState 被拒:', err.message);
    }
    try {
      // @ts-expect-error 状态名写错
      button.setTitle('x', { forState: ['pressed'] });
      console.log('  ✗ 不认识的状态名居然通过了');
    } catch (err) {
      console.log('  ✓ 不认识的状态名被拒:', err.message.slice(0, 44) + '…');
    }

    // 实测：头文件注释写着 system 按钮的 titleLabel 返回 nil，不对
    assert('system 按钮也有 titleLabel', button.titleLabel instanceof UILabel, true);
    assert('titleLabel.text 就是当前标题',
           button.titleLabel && button.titleLabel.text, '点我试试');
    assert('imageView 也在', button.imageView instanceof UIImageView, true);

    button.addEventListener('primaryActionTriggered', () => {
      console.log('  ✓ 真实触摸：按钮收到 primaryActionTriggered');
    });
  }
}
