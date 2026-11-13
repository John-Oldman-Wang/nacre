// 验收界面的版面：一个纵向滚动的「瀑布」，每一步占一个区块。
//
// 以前各步把自己的东西直接摆在根视图上，位置各写各的固定坐标，十几块东西
// 互相压着；而且坐标是按 iPhone Air 的宽度写的，换一台窄一点的机器右边就
// 被切掉。现在每一步向这里要一个区块（一行小标题 + 一块固定高度的内容区），
// 区块从上往下排，排不下就滚。
//
// 内容区在版面上的角色和以前的根视图一样：横向铺满安全区，各步照旧用
// 「左右各留 16」的约束或者固定 frame 往里放。所以搬进来之后，依赖宽度的
// 断言（card 宽 = 安全区宽 - 32）一个数都不用改。

/**
 * @typedef {object} Waterfall
 * @property {(title: string, height: number) => UIView} section
 *   新开一个区块，返回它的内容区。区块按调用的先后从上往下排
 * @property {UIStackView} column 装着所有区块的那个纵向排列容器
 * @property {(view: UIView) => void} dock
 *   让瀑布的底边接在 view 的上面。输入框那张卡片贴着键盘，不进瀑布
 */

/**
 * @param {UIViewController} vc
 * @returns {Waterfall}
 */
export function createWaterfall(vc) {
  const page = vc.view;
  const safe = page.safeAreaLayoutGuide;

  // 滚动视图整个待在安全区里面。这样里面每个区块的安全区就等于它自己的
  // 范围，各步拿 host.safeAreaLayoutGuide 当边界用，不会被刘海掺进来
  const scroller = new UIScrollView();
  scroller.translatesAutoresizingMaskIntoConstraints = false;
  page.addSubview(scroller);

  const column = new UIStackView();
  column.translatesAutoresizingMaskIntoConstraints = false;
  column.axis = 'vertical';
  column.spacing = 28;
  // 上下留白用内边距，不用再套一层视图
  column.isLayoutMarginsRelativeArrangement = true;
  column.directionalLayoutMargins = { top: 12, leading: 0, bottom: 32, trailing: 0 };
  scroller.addSubview(column);

  const content = scroller.contentLayoutGuide;
  const frame = scroller.frameLayoutGuide;
  let bottom = scroller.bottomAnchor.constraintEqualToAnchor(safe.bottomAnchor);
  NSLayoutConstraint.activateConstraints([
    scroller.topAnchor.constraintEqualToAnchor(safe.topAnchor),
    scroller.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor),
    scroller.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor),
    bottom,
    // 内容多高由内容自己说了算；宽度钉住，横向不滚
    column.topAnchor.constraintEqualToAnchor(content.topAnchor),
    column.bottomAnchor.constraintEqualToAnchor(content.bottomAnchor),
    column.leadingAnchor.constraintEqualToAnchor(content.leadingAnchor),
    column.trailingAnchor.constraintEqualToAnchor(content.trailingAnchor),
    column.widthAnchor.constraintEqualToAnchor(frame.widthAnchor),
  ]);

  /**
   * @param {string} title
   * @param {number} height 内容区的高，点
   */
  function section(title, height) {
    const label = new UILabel();
    label.text = title;
    label.font = UIFont.systemFontOfSize(13, { weight: 'semibold' });
    label.textColor = 'secondaryLabel';
    // 标题左右缩进 16，和内容区里各步自己留的边对齐
    const header = new UIStackView([label]);
    header.isLayoutMarginsRelativeArrangement = true;
    header.directionalLayoutMargins = { top: 0, leading: 16, bottom: 0, trailing: 16 };

    const host = new UIView();
    host.heightAnchor.constraintEqualToConstant(height).isActive = true;

    const block = new UIStackView([header, host]);
    block.axis = 'vertical';
    block.spacing = 8;
    column.addArrangedSubview(block);
    return host;
  }

  /** @param {UIView} view */
  function dock(view) {
    bottom.isActive = false;
    bottom = scroller.bottomAnchor.constraintEqualToAnchor(view.topAnchor, { constant: -8 });
    bottom.isActive = true;
  }

  return { section, column, dock };
}
