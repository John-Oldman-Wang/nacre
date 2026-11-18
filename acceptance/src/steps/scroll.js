import { customEventWorks, enumIgnored, ENUM_IGNORED } from '../support.js';
// UIScrollView：滚动、两个 layout guide、事件合并。

/** @param {import("../main.js").StepContext} ctx */

export function stepScroll(ctx) {
  const { assert, vc } = ctx;
  // ===== UIScrollView =====
  //
  // 滚动是主线程驱动的，JS 只收通知。所以这一段除了验属性，更要验两件事：
  // 事件真的到得了 JS，以及同一轮里的多次滚动被合并成一次。
  console.log('--- UIScrollView ---');
  {
    const page = vc.view;
    const root = ctx.section('UIScrollView：滚动、事件合并（滑它）', 150);
    const guide = root.safeAreaLayoutGuide;

    const scroller = new UIScrollView();
    assert('是 UIView 的子类', scroller instanceof UIView, true);
    assert('默认能滚', scroller.isScrollEnabled, true);
    assert('默认回弹', scroller.bounces, true);
    assert('默认不翻页', scroller.isPagingEnabled, false);
    assert('默认不锁方向', scroller.isDirectionalLockEnabled, false);
    assert('默认内容小也不纵向拖', scroller.alwaysBounceVertical, false);
    assert('默认显示纵向指示条', scroller.showsVerticalScrollIndicator, true);
    assert('默认指示条外观', scroller.indicatorStyle, 'default');
    assert('默认 inset 自适应行为', scroller.contentInsetAdjustmentBehavior, 'automatic');
    assert('默认减速速率', scroller.decelerationRate, 'normal');
    assert('默认点状态栏回顶', scroller.scrollsToTop, true);
    assert('默认延迟交出触摸', scroller.delaysContentTouches, true);
    assert('一开始偏移是 0', scroller.contentOffset.y, 0);
    assert('一开始没在拖', scroller.isDragging, false);
    assert('一开始没在减速', scroller.isDecelerating, false);

    scroller.translatesAutoresizingMaskIntoConstraints = false;
    scroller.backgroundColor = UIColor.systemBackgroundColor;
    scroller.layer.borderWidth = 2;
    scroller.layer.borderColor = UIColor.systemTealColor;
    scroller.layer.cornerRadius = 10;
    scroller.clipsToBounds = true;
    root.addSubview(scroller);

    // 内容：一个纵向 stack，这就是 iOS 长表单的标准写法
    const column = new UIStackView();
    // stack 自己也要关：排列项是 stack 替它们关的，stack 本身没人管
    column.translatesAutoresizingMaskIntoConstraints = false;
    column.axis = 'vertical';
    column.spacing = 6;
    scroller.addSubview(column);
    for (let i = 1; i <= 12; i++) {
      const cell = new UILabel();
      cell.text = '第 ' + i + ' 行';
      cell.textAlignment = 'center';
      cell.backgroundColor = i % 2 ? UIColor.secondarySystemBackgroundColor
                                   : UIColor.tertiarySystemBackgroundColor;
      column.addArrangedSubview(cell);
      NSLayoutConstraint.activateConstraints([
        cell.heightAnchor.constraintEqualToConstant(36),
      ]);
    }

    const content = scroller.contentLayoutGuide;
    const frame = scroller.frameLayoutGuide;
    assert('contentLayoutGuide 是 UILayoutGuide', content instanceof UILayoutGuide, true);
    assert('两个 guide 不是同一个', content === frame, false);
    assert('guide 读两次是同一个包装', scroller.contentLayoutGuide === content, true);
    assert('guide 的 owningView 就是它', content.owningView === scroller, true);

    NSLayoutConstraint.activateConstraints([
      scroller.leadingAnchor.constraintEqualToAnchor(guide.leadingAnchor, { constant: 16 }),
      scroller.trailingAnchor.constraintEqualToAnchor(guide.trailingAnchor, { constant: -16 }),
      scroller.bottomAnchor.constraintEqualToAnchor(guide.bottomAnchor),
      scroller.heightAnchor.constraintEqualToConstant(150),
      // 四边钉 contentLayoutGuide：内容多大由内容自己说了算
      column.topAnchor.constraintEqualToAnchor(content.topAnchor),
      column.bottomAnchor.constraintEqualToAnchor(content.bottomAnchor),
      column.leadingAnchor.constraintEqualToAnchor(content.leadingAnchor),
      column.trailingAnchor.constraintEqualToAnchor(content.trailingAnchor),
      // 宽度钉 frameLayoutGuide：横向不滚
      column.widthAnchor.constraintEqualToAnchor(frame.widthAnchor),
    ]);
    page.layoutIfNeeded();

    // contentSize 没有手设，是约束自己算出来的
    const expectedHeight = 12 * 36 + 11 * 6;
    assert('contentSize 由约束算出来', scroller.contentSize.height, expectedHeight);
    assert('contentSize 宽 = 可视宽（横向不滚）',
           scroller.contentSize.width, scroller.frame.width);
    assert('内容比可视区高，所以能滚',
           scroller.contentSize.height > scroller.frame.height, true);
    // 这个 scroller 不碰安全区，所以系统没往 inset 里加东西
    assert('adjustedContentInset 这里等于 contentInset',
           scroller.adjustedContentInset.top, scroller.contentInset.top);

    // ---- 减速速率：数字或具名值 ----
    scroller.decelerationRate = 'fast';
    assert('fast 读回字符串', scroller.decelerationRate, 'fast');
    // 实测：UIKit 把任意数字**吸附**到两个具名值之一（最近的那个赢），
    // 所以 decelerationRate 实际上只有 normal / fast 两档。头文件没写这条。
    scroller.decelerationRate = 0.95;
    assert('实测：0.95 被吸附成 fast', scroller.decelerationRate, 'fast');
    scroller.decelerationRate = 0.994;
    assert('实测：0.994 被吸附成 normal（两值的中点往上）',
           scroller.decelerationRate, 'normal');
    scroller.decelerationRate = 1.5;
    assert('实测：超范围也不抛，吸附成 normal', scroller.decelerationRate, 'normal');
    scroller.decelerationRate = 'normal';

    // ---- 指示条边距是结构体 ----
    scroller.verticalScrollIndicatorInsets = new UIEdgeInsets(4, 0, 4, 0);
    assert('指示条边距往返', scroller.verticalScrollIndicatorInsets.top, 4);
    scroller.flashScrollIndicators();

    // ---- 写错要抛 ----
    assert('不认识的 indicatorStyle：不抛、值不变', enumIgnored(() => {
      // @ts-expect-error 没有这个外观
      scroller.indicatorStyle = 'gray';
    }, () => scroller.indicatorStyle), ENUM_IGNORED);
    assert('不认识的减速速率：不抛、值不变', enumIgnored(() => {
      // @ts-expect-error 不是具名值
      scroller.decelerationRate = 'slow';
    }, () => scroller.decelerationRate), ENUM_IGNORED);
    // ---- 拖动时收键盘：keyboardDismissMode ----
    // 原生它是 UIScrollView 的属性。原来只在 UITextView 上有，现在定义在
    // UIScrollView 上，子类靠继承得到。默认值是多行输入那一步动手前用探针
    // 量的（不带窗口的 UITextView 是 none）；普通滚动视图的默认值按头文件
    // 写的也是 none，没有单独量过
    assert('滚动视图：默认拖动时不收键盘', scroller.keyboardDismissMode, 'none');
    for (const mode of /** @type {UIScrollViewKeyboardDismissMode[]} */ (
           ['onDrag', 'interactive', 'onDragWithAccessory', 'interactiveWithAccessory',
            'none'])) {
      scroller.keyboardDismissMode = mode;
      assert('滚动视图：keyboardDismissMode = ' + mode, scroller.keyboardDismissMode, mode);
    }
    scroller.keyboardDismissMode = 'onDrag';
    assert('滚动视图：keyboardDismissMode 写错：不抛、值不变', enumIgnored(() => {
      // @ts-expect-error 没有这个值
      scroller.keyboardDismissMode = 'drag';
    }, () => scroller.keyboardDismissMode), ENUM_IGNORED);
    assert('滚动视图：写错之后还是写错之前的 onDrag', scroller.keyboardDismissMode, 'onDrag');
    // 不是字符串的值也当「不认识的值」：警告加值不变，不按 String() 转
    assert('滚动视图：keyboardDismissMode 给数字：不抛、值不变', enumIgnored(() => {
      // @ts-expect-error 要的是那五个名字
      scroller.keyboardDismissMode = 1;
    }, () => scroller.keyboardDismissMode), ENUM_IGNORED);
    scroller.keyboardDismissMode = 'none';
    // 只有一份：定义在 UIScrollView 的原型上，UITextView 自己不再有
    assert('滚动视图：keyboardDismissMode 定义在 UIScrollView 上',
           Object.prototype.hasOwnProperty.call(UIScrollView.prototype, 'keyboardDismissMode'),
           true);
    assert('滚动视图：UITextView 靠继承得到，自己不再定义一份',
           Object.prototype.hasOwnProperty.call(UITextView.prototype, 'keyboardDismissMode'),
           false);
    // 别的子类也跟着有了：列表是滚动视图
    assert('滚动视图：UICollectionView 也继承到了',
           'keyboardDismissMode' in UICollectionView.prototype, true);

    // 不认识的事件名不拒绝，当自定义事件（和浏览器里的 EventTarget 一样）
    assert('滚动视图：不认识的事件名当自定义事件', customEventWorks(scroller, 'not-a-real-event'), '收到一次');

    // ---- 事件：合并是这一步最要紧的一条 ----
    let scrollCount = 0;
    /** @type {string[]} */
    const scrollLog = [];
    const onScroll = () => { scrollCount++; };
    scroller.addEventListener('scroll', onScroll);
    for (const t of ['dragbegin', 'dragend', 'deceleratebegin', 'decelerateend',
                     'scrollanimationend']) {
      scroller.addEventListener(t, (e) => { scrollLog.push(e.type); });
    }

    // 这几条都要等窗口真的起来：实测在 becomevisible 之前写 contentOffset，
    // UIScrollView 压根不叫 delegate（下面那条断言就是这么发现的）
    setTimeout(() => {
      // 同一轮里连写三次偏移：原生的 didScroll 会被调三次，但排到 JS 的
      // 派发只该有一个 —— 事件不带数据，所以合并无损
      scrollCount = 0;
      scroller.contentOffset = new CGPoint(0, 10);
      scroller.contentOffset = new CGPoint(0, 20);
      scroller.contentOffset = new CGPoint(0, 30);
      assert('偏移写进去了', scroller.contentOffset.y, 30);

      setTimeout(() => {
        assert('同一轮三次滚动合并成一个 scroll 事件', scrollCount, 1);

        // 带动画地滚回顶部，等 scrollanimationend
        scrollCount = 0;
        scroller.setContentOffset(new CGPoint(0, 0), { animated: true });
        /** @param {number} left */
        function waitAnim(left) {
          if (scrollLog.includes('scrollanimationend') || left <= 0) {
            assert('动画结束发了 scrollanimationend',
                   scrollLog.includes('scrollanimationend'), true);
            // 只断言「发了」，不断言「不止一次」：运行时把同一轮里的 scroll
            // 合并成一个，而这段动画只有 30pt——主线程一忙就整段落在两次 JS
            // 轮次之间，合并成一次。次数打出来看趋势，但不拿它当通过条件
            assert('动画期间 scroll 也在发', scrollCount >= 1, true);
            console.log('  实测：这段动画里收到 ' + scrollCount + ' 个 scroll 事件');

            // 摘掉 scroll 监听器之后，原生侧应该连 delegate 都不挂了
            scroller.removeEventListener('scroll', onScroll);
            scrollCount = 0;
            scroller.contentOffset = new CGPoint(0, 40);
            setTimeout(() => {
              assert('removeEventListener 之后收不到 scroll', scrollCount, 0);
              scroller.contentOffset = new CGPoint(0, 0);
              // 真实滑动用：重新挂上，顺便统计一次滑动派发多少次
              let frames = 0;
              let firstAt = 0;
              scroller.addEventListener('scroll', () => {
                if (frames === 0) firstAt = Date.now();
                frames++;
              });
              scroller.addEventListener('decelerateend', () => {
                console.log('  ✓ 真实滑动：一次滑动派发了 ' + frames + ' 次 scroll，历时 ' +
                            (Date.now() - firstAt) + ' ms，最终偏移 ' +
                            Math.round(scroller.contentOffset.y));
                console.log('  ✓ 真实滑动的事件顺序 = ' +
                            scrollLog.filter((t) => t !== 'scrollanimationend').join(' → '));
              });
              console.log('  ✓ 列表已上屏，等着被滑');
            }, 60);
            return;
          }
          setTimeout(() => waitAnim(left - 1), 10);
        }
        waitAnim(80);
      }, 40);
    }, 400);
  }
}
