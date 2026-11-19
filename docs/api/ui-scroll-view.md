---
type: reference
native: UIScrollView
status: partial
---

# `UIScrollView`

**`UIScrollView`** 表示一个可以滚动的视图，称为滚动视图。放在它里面的内容比它自己大时，用户用手指拖动来查看其余部分。拖动、松手后的惯性滑动、滚到头之后的回弹、滚动指示条，都由系统完成，不需要写代码。

滚动视图不会自己量里面的子视图。内容有多大要由 App 告诉它：用约束把内容的四条边和 [`contentLayoutGuide`](ui-scroll-view/contentlayoutguide.md) 对齐，或者直接写 [`contentSize`](ui-scroll-view/contentsize.md)。滚动的位置从 [`contentOffset`](ui-scroll-view/contentoffset.md) 读，位置变了派发 [`scroll`](ui-scroll-view/scroll-event.md) 事件。

[`UITextView`](ui-text-view.md) 和 [`UICollectionView`](ui-collection-view.md) 都是滚动视图，这一页的成员它们都有。

所有长度和位置的单位都是 [pt](units.md)。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → `UIScrollView`

怎么搭一个能滚动的页面、滚不动时查什么、怎么做轮播和「到底加载更多」，见指南[做一个能滚动的页面](../guides/scrolling.md)。

## 构造函数

[`UIScrollView()`](ui-scroll-view/constructor.md)

创建一个滚动视图。大小是 0，内容区也是 0。

## 实例属性

还继承 [`UIView`](ui-view.md) 的属性。滚动视图常用的继承属性是 `bounds`、`backgroundColor`、`keyboardLayoutGuide`。

位置和内容大小：

| 属性 | 说明 |
| --- | --- |
| [`contentOffset`](ui-scroll-view/contentoffset.md) | 当前滚到的位置 |
| [`contentSize`](ui-scroll-view/contentsize.md) | 内容区的大小 |
| [`contentInset`](ui-scroll-view/contentinset.md) | 在内容四周额外留的空白 |
| [`adjustedContentInset`](ui-scroll-view/adjustedcontentinset.md) <small>只读</small> | 实际生效的空白，包括系统为安全区加的部分 |
| [`contentInsetAdjustmentBehavior`](ui-scroll-view/contentinsetadjustmentbehavior.md) | 系统是否自动为安全区留白 |
| [`contentLayoutGuide`](ui-scroll-view/contentlayoutguide.md) <small>只读</small> | 写约束用的参照物，代表内容区 |
| [`frameLayoutGuide`](ui-scroll-view/framelayoutguide.md) <small>只读</small> | 写约束用的参照物，代表可视区 |
| [`contentAlignmentPoint`](ui-scroll-view/contentalignmentpoint.md) | 内容比可视区小时怎么摆 |

行为开关：

| 属性 | 说明 |
| --- | --- |
| [`isScrollEnabled`](ui-scroll-view/isscrollenabled.md) | 用户能不能拖动 |
| [`bounces`](ui-scroll-view/bounces.md) | 滚到头后能不能再拉一段 |
| [`bouncesHorizontally`](ui-scroll-view/bounceshorizontally.md) | 横向能不能回弹 |
| [`bouncesVertically`](ui-scroll-view/bouncesvertically.md) | 纵向能不能回弹 |
| [`alwaysBounceVertical`](ui-scroll-view/alwaysbouncevertical.md) | 内容不足一屏时纵向也能拉动 |
| [`alwaysBounceHorizontal`](ui-scroll-view/alwaysbouncehorizontal.md) | 内容不足一屏时横向也能拉动 |
| [`isPagingEnabled`](ui-scroll-view/ispagingenabled.md) | 一页一页地翻 |
| [`isDirectionalLockEnabled`](ui-scroll-view/isdirectionallockenabled.md) | 一次拖动只沿一个方向 |
| [`scrollsToTop`](ui-scroll-view/scrollstotop.md) | 点状态栏时滚回顶部 |
| [`delaysContentTouches`](ui-scroll-view/delayscontenttouches.md) | 先判断是不是滚动，再把触摸交给里面的按钮 |
| [`canCancelContentTouches`](ui-scroll-view/cancancelcontenttouches.md) | 按在按钮上再移动能不能改成滚动 |
| [`transfersHorizontalScrollingToParent`](ui-scroll-view/transfershorizontalscrollingtoparent.md) | 横向滚到头时把滚动交给外层的滚动视图 |
| [`transfersVerticalScrollingToParent`](ui-scroll-view/transfersverticalscrollingtoparent.md) | 纵向滚到头时把滚动交给外层的滚动视图 |
| [`allowsKeyboardScrolling`](ui-scroll-view/allowskeyboardscrolling.md) | 能不能用硬件键盘滚动 |
| [`decelerationRate`](ui-scroll-view/decelerationrate.md) | 松手后滑多远才停 |
| [`keyboardDismissMode`](ui-scroll-view/keyboarddismissmode.md) | 用户拖动时要不要收起键盘 |

滚动指示条：

| 属性 | 说明 |
| --- | --- |
| [`showsVerticalScrollIndicator`](ui-scroll-view/showsverticalscrollindicator.md) | 纵向滚动时是否显示指示条 |
| [`showsHorizontalScrollIndicator`](ui-scroll-view/showshorizontalscrollindicator.md) | 横向滚动时是否显示指示条 |
| [`indicatorStyle`](ui-scroll-view/indicatorstyle.md) | 指示条的颜色 |
| [`verticalScrollIndicatorInsets`](ui-scroll-view/verticalscrollindicatorinsets.md) | 纵向指示条离边缘的距离 |
| [`horizontalScrollIndicatorInsets`](ui-scroll-view/horizontalscrollindicatorinsets.md) | 横向指示条离边缘的距离 |
| [`scrollIndicatorInsets`](ui-scroll-view/scrollindicatorinsets.md) | 两个指示条离边缘的距离（iOS 13 起废弃） |
| [`automaticallyAdjustsScrollIndicatorInsets`](ui-scroll-view/automaticallyadjustsscrollindicatorinsets.md) | 系统是否按安全区调整指示条的距离 |
| [`indexDisplayMode`](ui-scroll-view/indexdisplaymode.md) | 索引条什么时候显示 |

缩放：

| 属性 | 说明 |
| --- | --- |
| [`zoomScale`](ui-scroll-view/zoomscale.md) | 当前的缩放比例 |
| [`minimumZoomScale`](ui-scroll-view/minimumzoomscale.md) | 最小的缩放比例 |
| [`maximumZoomScale`](ui-scroll-view/maximumzoomscale.md) | 最大的缩放比例 |
| [`bouncesZoom`](ui-scroll-view/bounceszoom.md) | 缩放超出范围后是否弹回 |
| [`isZooming`](ui-scroll-view/iszooming.md) <small>只读</small> | 是否正在缩放 |
| [`isZoomBouncing`](ui-scroll-view/iszoombouncing.md) <small>只读</small> | 是否正在弹回缩放范围 |
| [`isZoomAnimating`](ui-scroll-view/iszoomanimating.md) <small>只读</small> | 是否正在执行缩放动画 |

当前状态和手势：

| 属性 | 说明 |
| --- | --- |
| [`isTracking`](ui-scroll-view/istracking.md) <small>只读</small> | 手指是否按在上面 |
| [`isDragging`](ui-scroll-view/isdragging.md) <small>只读</small> | 用户是否正在拖动 |
| [`isDecelerating`](ui-scroll-view/isdecelerating.md) <small>只读</small> | 松手后内容是否还在滑 |
| [`isScrollAnimating`](ui-scroll-view/isscrollanimating.md) <small>只读</small> | 是否正在执行 `setContentOffset()` 的动画 |
| [`panGestureRecognizer`](ui-scroll-view/pangesturerecognizer.md) <small>只读</small> | 识别拖动的手势识别器 |
| [`pinchGestureRecognizer`](ui-scroll-view/pinchgesturerecognizer.md) <small>只读</small> | 识别双指捏合的手势识别器 |
| [`directionalPressGestureRecognizer`](ui-scroll-view/directionalpressgesturerecognizer.md) <small>只读</small> | 识别方向键的手势识别器 |

## 实例方法

还继承 [`UIView`](ui-view.md) 的方法，比如 `addSubview()`、`convertRect()`。

| 方法 | 说明 |
| --- | --- |
| [`setContentOffset()`](ui-scroll-view/setcontentoffset.md) | 滚到指定位置，可以带动画 |
| [`scrollRectToVisible()`](ui-scroll-view/scrollrecttovisible.md) | 滚动最短的距离，让一个矩形完整可见 |
| [`flashScrollIndicators()`](ui-scroll-view/flashscrollindicators.md) | 让指示条闪一下 |
| [`setZoomScale()`](ui-scroll-view/setzoomscale.md) | 改缩放比例，可以带动画 |
| [`zoomToRect()`](ui-scroll-view/zoomtorect.md) | 缩放到让一个矩形占满可视区 |
| [`stopScrollingAndZooming()`](ui-scroll-view/stopscrollingandzooming.md) | 立刻停下正在进行的滚动和缩放 |

## 事件

用 `addEventListener()` 监听。

| 事件 | 什么时候派发 |
| --- | --- |
| [`scroll`](ui-scroll-view/scroll-event.md) | 位置变了。用户滚动、惯性滑动、代码写入都会派发 |
| [`dragbegin`](ui-scroll-view/dragbegin-event.md) | 用户开始拖动 |
| [`dragend`](ui-scroll-view/dragend-event.md) | 用户松手 |
| [`deceleratebegin`](ui-scroll-view/deceleratebegin-event.md) | 松手后内容开始继续滑 |
| [`decelerateend`](ui-scroll-view/decelerateend-event.md) | 内容完全停下 |
| [`scrollanimationend`](ui-scroll-view/scrollanimationend-event.md) | `setContentOffset()` 的动画结束 |
| [`scrolltotop`](ui-scroll-view/scrolltotop-event.md) | 用户点状态栏，滚回顶部之后 |
| [`adjustedcontentinsetchange`](ui-scroll-view/adjustedcontentinsetchange-event.md) | `adjustedContentInset` 变了 |
| `traitchange` | [外观特征](ui-trait-collection.md)变化，继承自 `UIView` |

八个滚动事件共同的规则：

- **事件不带数据。** 事件对象只有 `type` 和 `target`。位置读 `contentOffset`，状态读 `isDragging`、`isDecelerating`。回调执行时读到的是那一刻最新的值。
- **都不能取消。** 滚动由系统驱动，不等 JS 的回答：手指拖动时内容先移动，之后系统才通知 JS。JS 不能拦住或取消一次滚动。
- **在事情发生之后派发。** 回调执行时滚动视图的状态已经是新的。比如 `dragend` 的回调里读 `isDecelerating`，得到的是「松手后是否还在滑」的实际结果。
- **在当前这段 JS 执行完之后才派发。** 回调不会在一次赋值的中途被调用。
- **没有监听器时没有开销。** 没有监听任何滚动事件的滚动视图，滚动时不调用 JS。
- **不认识的事件名不报错。** 它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。所以事件名拼错（比如 `scrol`）时没有提示，监听器只是不被调用。

用户拖一下再松手，派发顺序是 `dragbegin` → `dragend` → `deceleratebegin` → `decelerateend`，期间不断派发 `scroll`（实测）。松手时内容已经停住的话，没有后两个事件（**未在模拟器验证**）。

## 三个基本概念

滚动视图的属性都围绕三个量。

```
        内容区（contentSize）
      ┌───────────────────┐  ─┐
      │                   │   │ contentOffset.y
      │                   │   │（已经滚过去的距离）
      │┌─────────────────┐│  ─┘
      ││                 ││
      ││     可视区       ││   屏幕上实际看到的部分
      ││  （bounds 的大小）││
      │└─────────────────┘│
      │                   │
      │                   │
      └───────────────────┘
```

| 概念 | 是什么 | 对应的属性 |
| --- | --- | --- |
| 可视区 | 滚动视图自己在屏幕上占的矩形 | `bounds` 的宽高 |
| 内容区 | 全部内容占的矩形，通常比可视区大 | `contentSize` |
| 偏移 | 内容区的左上角相对可视区的左上角移出去了多少 | `contentOffset` |

某个方向上能滚的最大距离，等于内容区的尺寸减去可视区的尺寸（系统加了留白时再加上留白，见[安全区](#安全区)）。内容区不比可视区大，这个方向就不能滚。

## 内容区的大小

内容区的大小有两种说法：

| 方式 | 写法 | 适用 |
| --- | --- | --- |
| 用约束 | 把放内容的容器的四条边和 [`contentLayoutGuide`](ui-scroll-view/contentlayoutguide.md) 对齐。容器多大，内容区就多大 | 推荐。内容增减时内容区自动跟着变 |
| 直接写 | `scroller.contentSize = new CGSize(宽, 高)` | 子视图用 `frame` 定位时。内容变了要自己重新写 |

两种方式不要同时用。用约束时，内容区的大小在系统完成布局之后才算出来：激活约束后紧接着读 `contentSize`，读到的还是旧值；先在页面的根视图上调 `layoutIfNeeded()` 再读。

另一个参照物 [`frameLayoutGuide`](ui-scroll-view/framelayoutguide.md) 代表可视区。哪个方向的尺寸和它相等，哪个方向就不能滚。

## 安全区

安全区是屏幕上不会被刘海、圆角和底部横条遮挡的区域。

滚动视图铺满屏幕时，系统默认在内容的上方和下方自动留白，让第一行和最后一行停在安全区内。滚动过程中内容仍然会从刘海和横条下面经过。这带来两个结果：

- 内容在最顶部时，`contentOffset.y` 不是 `0`，是一个负数，大小等于顶部留白的高度。
- 实际的留白要读 [`adjustedContentInset`](ui-scroll-view/adjustedcontentinset.md)，它等于 App 设的 `contentInset` 加上系统自动加的部分。留白变化时派发 `adjustedcontentinsetchange`。

铺满屏幕时的留白和负的偏移是 iOS 的定义，**未在模拟器验证**。验收用例里断言的是相反的情况：滚动视图整个在安全区里面时，系统不加留白，`adjustedContentInset.top` 等于 `contentInset.top`。

系统要不要留白由 [`contentInsetAdjustmentBehavior`](ui-scroll-view/contentinsetadjustmentbehavior.md) 决定。

## 滚动和 JS 的关系

**在 `scroll` 回调里读位置、改视图是正常用法**，比如按滚动的距离改标题栏的透明度、滚到底部时加载下一页。依据是三条实测的事实：

- `scroll` 事件不会堆积。上一个 `scroll` 还没派发时又发生的滚动，不会再排一个事件，回调执行时读到的是最新的位置。
- 读一次属性、写一次属性各需要几微秒（实测一次读写 1.3–7 µs）。
- 一次真实的滑动历时 1819 ms，派发了 100 次 `scroll`（模拟器，Debug 构建）。

`scroll` 回调和界面的更新在同一个线程上依次执行，背景见[运行时怎么工作](how-it-works.md)。

滚动视图里放了多少视图，就创建多少视图，不会只创建屏幕上看得见的那些。实测创建一个视图约 4 µs，写一个属性 2–7 µs，建一条约束约 10 µs，`addSubview()` 一次约 12 µs。行数很多（几百行以上）时一次建出全部行的总耗时和内存占用，**没有测量数据**。只创建看得见的行用 [`UICollectionView`](ui-collection-view.md)。

## 示例

### 40 行文字的滚动页面

从空白 App 开始，做一个可以上下滚动的页面，里面有 40 行文字。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const scroller = new UIScrollView();
  scroller.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(scroller);

  const column = new UIStackView();
  column.translatesAutoresizingMaskIntoConstraints = false;
  column.axis = 'vertical';
  column.spacing = 12;
  scroller.addSubview(column);

  for (let i = 1; i <= 40; i++) {
    const label = new UILabel();
    label.text = `第 ${i} 行`;
    column.addArrangedSubview(label);
  }

  const content = scroller.contentLayoutGuide;
  const frame = scroller.frameLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    scroller.topAnchor.constraintEqualToAnchor(page.view.topAnchor),
    scroller.bottomAnchor.constraintEqualToAnchor(page.view.bottomAnchor),
    scroller.leadingAnchor.constraintEqualToAnchor(page.view.leadingAnchor),
    scroller.trailingAnchor.constraintEqualToAnchor(page.view.trailingAnchor),
    column.topAnchor.constraintEqualToAnchor(content.topAnchor),
    column.bottomAnchor.constraintEqualToAnchor(content.bottomAnchor),
    column.leadingAnchor.constraintEqualToAnchor(content.leadingAnchor),
    column.trailingAnchor.constraintEqualToAnchor(content.trailingAnchor),
    column.widthAnchor.constraintEqualToAnchor(frame.widthAnchor),
  ]);
});
```

**效果**

- 屏幕上从上到下排着「第 1 行」「第 2 行」……，一屏放不下 40 行。
- 手指上下拖动，内容跟着移动。松手后内容继续滑一段再停。
- 滚到最顶或最底后还能再拉一小段，松手弹回去。
- 滚动时右侧出现一条细的指示条，停下后消失。
- 左右拖不动。

这段代码没有作为一个整体在模拟器运行过。同样的结构在验收用例里运行过，并断言了内容区的高度等于各行高度加间距之和、内容区的宽度等于可视区的宽度。拖动、惯性、回弹、指示条是系统的默认行为，验收时用手滑过。

> **注意**：`column.translatesAutoresizingMaskIntoConstraints = false` 这一行不能少。少了它内容区是 0，什么都不显示，控制台也没有报错，见[内容不显示](../guides/scrolling.md#内容不显示)。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[UIScrollView alloc] init]` | `new UIScrollView()` |
| `sv.contentOffset = CGPointMake(0, 30)` | `sv.contentOffset = new CGPoint(0, 30)` |
| `[sv setContentOffset:p animated:YES]` | `sv.setContentOffset(p, { animated: true })` |
| `[sv scrollRectToVisible:r animated:YES]` | `sv.scrollRectToVisible(r, { animated: true })` |
| `[sv flashScrollIndicators]` | `sv.flashScrollIndicators()` |
| `sv.contentInsetAdjustmentBehavior = UIScrollViewContentInsetAdjustmentNever` | `sv.contentInsetAdjustmentBehavior = 'never'` |
| `sv.indicatorStyle = UIScrollViewIndicatorStyleBlack` | `sv.indicatorStyle = 'black'` |
| `sv.decelerationRate = UIScrollViewDecelerationRateFast` | `sv.decelerationRate = 'fast'` |
| `sv.keyboardDismissMode = UIScrollViewKeyboardDismissModeOnDrag` | `sv.keyboardDismissMode = 'onDrag'` |
| `sv.pagingEnabled = YES` | `sv.isPagingEnabled = true` |
| `sv.contentLayoutGuide` | `sv.contentLayoutGuide` |
| `[sv setZoomScale:2 animated:YES]` | `sv.setZoomScale(2, { animated: true })` |
| `- scrollViewDidScroll:` | `scroll` 事件 |
| `- scrollViewWillBeginDragging:` | `dragbegin` 事件 |
| `- scrollViewDidEndDragging:willDecelerate:` | `dragend` 事件。`willDecelerate` 改读 `isDecelerating` |
| `- scrollViewWillBeginDecelerating:` | `deceleratebegin` 事件 |
| `- scrollViewDidEndDecelerating:` | `decelerateend` 事件 |
| `- scrollViewDidEndScrollingAnimation:` | `scrollanimationend` 事件 |
| `- scrollViewDidScrollToTop:` | `scrolltotop` 事件 |
| `- scrollViewDidChangeAdjustedContentInset:` | `adjustedcontentinsetchange` 事件 |
| `sv.delegate` | 不用设，监听上面的事件 |

### 与浏览器的对照

这张表只供熟悉 Web 的人查对应关系，正文不依赖它。

| Web | `UIScrollView` | 差别 |
| --- | --- | --- |
| `overflow: scroll` 的元素 | `new UIScrollView()` | 内容区的大小要用约束或 `contentSize` 说明，不会自动量子视图 |
| `clientWidth` / `clientHeight` | `bounds.width` / `bounds.height` | |
| `scrollWidth` / `scrollHeight` | `contentSize.width` / `contentSize.height` | |
| `scrollLeft` / `scrollTop` | `contentOffset.x` / `contentOffset.y` | 有安全区留白时，最顶部是负数 |
| `scrollTo({ top, behavior: 'smooth' })` | `setContentOffset(point, { animated: true })` | |
| `scrollIntoView()` | `scrollRectToVisible(rect)` | 传的是矩形，不是元素 |
| `scroll` 事件 | `scroll` 事件 | 都不带位置，都不能取消 |
| `scrollend` 事件 | `decelerateend`、`scrollanimationend`，以及 `dragend` 时 `isDecelerating` 为 `false` | 没有统一的一个事件 |
| `scroll-snap-type` | `isPagingEnabled` | 只能按可视区的整数倍停 |
| `overscroll-behavior: none` | `bounces = false` | |

## 参见

- [做一个能滚动的页面](../guides/scrolling.md)：页面骨架、滚不动时查什么、横向滚动、轮播、加载更多、键盘
- [`UIStackView`](ui-stack-view.md)：例子里放内容的容器
- [`UIView`](ui-view.md)：继承来的成员，`bounds`、`convertRect()`、底色、圆角都在那里
- [`UICollectionView`](ui-collection-view.md)：数据量很大的列表，只创建屏幕上看得见的行
- [`UITextView`](ui-text-view.md)：多行输入，也是滚动视图
- [结构体](structs.md)：`CGPoint`、`CGSize`、`CGRect`、`UIEdgeInsets`
