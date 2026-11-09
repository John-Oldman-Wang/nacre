// router 用到的几个页面。也是用户侧代码。
//
// 每个页面就是一个 UIViewController，往它的 view 上挂东西——没有「组件」
// 这层抽象，那同样是 JS 侧可以自己搭的。

/**
 * 一个带标题和一列按钮的页面。
 *
 * @param {object} spec
 * @param {string} spec.title 导航条上的标题，也是下一页返回按钮的文字
 * @param {UIColor} spec.color 底色
 * @param {string} spec.heading 页面中间那行大字
 * @param {[string, () => void][]} spec.buttons [按钮文字, 点了干嘛]
 */
export function makePage(spec) {
  const page = new UIViewController();
  page.title = spec.title;

  const root = page.view;
  root.backgroundColor = spec.color;

  const column = new UIStackView();
  column.translatesAutoresizingMaskIntoConstraints = false;
  column.axis = 'vertical';
  column.alignment = 'fill';
  column.spacing = 12;
  root.addSubview(column);

  const heading = new UILabel();
  heading.text = spec.heading;
  heading.font = UIFont.systemFontOfSize(28, { weight: 'bold' });
  heading.textColor = UIColor.whiteColor;
  heading.textAlignment = 'center';
  heading.numberOfLines = 0;
  column.addArrangedSubview(heading);

  for (const [label, onTap] of spec.buttons) {
    const button = UIButton.buttonWithType('system');
    button.setTitle(label, { forState: ['normal'] });
    button.setTitleColor(spec.color, { forState: ['normal'] });
    button.backgroundColor = UIColor.whiteColor;
    button.layer.cornerRadius = 10;
    button.addEventListener('primaryActionTriggered', onTap);
    column.addArrangedSubview(button);
    NSLayoutConstraint.activateConstraints([
      button.heightAnchor.constraintEqualToConstant(44),
    ]);
  }

  const guide = root.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    column.leadingAnchor.constraintEqualToAnchor(guide.leadingAnchor, { constant: 24 }),
    column.trailingAnchor.constraintEqualToAnchor(guide.trailingAnchor, { constant: -24 }),
    column.topAnchor.constraintEqualToAnchor(guide.topAnchor, { constant: 40 }),
  ]);

  return page;
}
