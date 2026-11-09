# `UIScrollView`

可以滚动的视图。内容放进去，超出可视区的部分就能滑着看。

```js
const scroller = new UIScrollView();
scroller.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(scroller);

scroller.addEventListener('scroll', () => {
  console.log(scroller.contentOffset.y);
});
```

## 继承关系

```
EventTarget → NSObject → UIResponder → UIView → UIScrollView
```

[`UIView`](ui-view.md) 的成员全都能用。

> `UITableView`、`UICollectionView`、`UITextView` 在 iOS 里都是 `UIScrollView` 的子类，所以这里的属性和事件将来对它们一样有效。那几个类还[没做](#还没做)。

## 标准写法：套一个 `UIStackView`

长表单、设置页、纯文字列表，iOS 的标准做法是 scroll view 里放一个 [`UIStackView`](ui-stack-view.md)，**不手设 `contentSize`**，让约束算：

```js
const scroller = new UIScrollView();
scroller.translatesAutoresizingMaskIntoConstraints = false;

const column = new UIStackView();
column.translatesAutoresizingMaskIntoConstraints = false;   // ← 别忘了这行
column.axis = 'vertical';
column.spacing = 6;
scroller.addSubview(column);

const content = scroller.contentLayoutGuide;
const frame = scroller.frameLayoutGuide;
NSLayoutConstraint.activateConstraints([
  // 四边钉 contentLayoutGuide：内容多高，就能滚多远
  column.topAnchor.constraintEqualToAnchor(content.topAnchor),
  column.bottomAnchor.constraintEqualToAnchor(content.bottomAnchor),
  column.leadingAnchor.constraintEqualToAnchor(content.leadingAnchor),
  column.trailingAnchor.constraintEqualToAnchor(content.trailingAnchor),
  // 宽度钉 frameLayoutGuide：横向不滚
  column.widthAnchor.constraintEqualToAnchor(frame.widthAnchor),
]);
```

> **最容易踩的坑**：`addArrangedSubview` 会替排列项关掉 `translatesAutoresizingMaskIntoConstraints`，但**不会替 stack 自己关**。忘了这行的症状是 `contentSize` 一直是 `0`，而且**不会报任何约束冲突**——所有东西自洽地塌到 0，看着像什么都没发生。

### 两个 guide 的分工

| | 它代表什么 | 钉它等于说 |
| --- | --- | --- |
| `contentLayoutGuide` | 可滚动的内容区 | 「内容有这么大」 |
| `frameLayoutGuide` | 可视的那个窗口 | 「这一维不滚」 |

两个都是只读的 [`UILayoutGuide`](auto-layout.md#uilayoutguide)，锚点随便用。

## 内容和偏移

| 成员 | 类型 | 默认值 | 效果 |
| --- | --- | --- | --- |
| `contentOffset` | `CGPoint` | `(0, 0)` | 内容左上角相对可视区左上角的偏移。**向下滚为正** |
| `contentSize` | `CGSize` | `(0, 0)` | 内容多大。钉了 `contentLayoutGuide` 就不用设 |
| `contentInset` | `UIEdgeInsets` | 全 0 | 内容四周额外的可滚动余量 |
| `adjustedContentInset` | `UIEdgeInsets` 只读 | | `contentInset` 加上系统补的那部分（安全区） |
| `contentInsetAdjustmentBehavior` | [枚举字符串](enums.md) | `'automatic'` | 系统要不要补。`automatic` / `scrollableAxes` / `never` / `always` |

```js
scroller.setContentOffset(new CGPoint(0, 0), { animated: true });  // 带动画
scroller.scrollRectToVisible(target.frame, { animated: true });    // 滚到可见
```

`setContentOffset(…, { animated: true })` 结束时发 [`scrollanimationend`](#事件)；直接写 `contentOffset` 不发。

## 开关

| 成员 | 默认值 | 效果 |
| --- | --- | --- |
| `isScrollEnabled` | `true` | 临时关掉拖动 |
| `bounces` | `true` | 到边回弹 |
| `alwaysBounceVertical` | `false` | 内容比可视区小也允许纵向拖。要 `bounces` 也开着 |
| `alwaysBounceHorizontal` | `false` | 横向版本 |
| `isPagingEnabled` | `false` | **翻页**：停在 `bounds` 宽/高的整数倍上 |
| `isDirectionalLockEnabled` | `false` | 拖动时锁住一个方向 |
| `scrollsToTop` | `true` | 点状态栏回顶部。**同一时刻只能有一个开着**，多个都开等于都不生效 |
| `delaysContentTouches` | `true` | 先看是不是在拖，再把触摸交给内容 |
| `canCancelContentTouches` | `true` | 已经按住内容了还能不能改为拖动 |

`isPagingEnabled` 是做轮播（Swiper）的地基：把每一页的宽度钉成 `frameLayoutGuide.widthAnchor`，翻页就对齐了。

## 指示条

| 成员 | 默认值 |
| --- | --- |
| `showsVerticalScrollIndicator` | `true` |
| `showsHorizontalScrollIndicator` | `true` |
| `indicatorStyle` | `'default'`（跟随浅色/深色）。另有 `'black'` / `'white'` |
| `verticalScrollIndicatorInsets` | 全 0 |
| `horizontalScrollIndicatorInsets` | 全 0 |
| `automaticallyAdjustsScrollIndicatorInsets` | `true` |

```js
scroller.flashScrollIndicators();   // 闪一下，提示「这里能滚」
```

## 减速：实际只有两档

```js
scroller.decelerationRate = 'normal';   // 0.998，默认
scroller.decelerationRate = 'fast';     // 0.99
```

**实测：给任意数字都会被 UIKit 吸附到这两个值之一**，最近的那个赢（中点 0.994 归 `normal`）：

```js
scroller.decelerationRate = 0.95;    scroller.decelerationRate;  // 'fast'
scroller.decelerationRate = 0.994;   scroller.decelerationRate;  // 'normal'
scroller.decelerationRate = 1.5;     scroller.decelerationRate;  // 'normal'，不抛
```

所以数字这条路留着只是因为 ObjC 接受数字，实际没有中间档。头文件没写这条。

## 当前状态

全是只读的：

| | 什么时候是 `true` |
| --- | --- |
| `isTracking` | 手指按在上面（还不一定在拖） |
| `isDragging` | 正在拖 |
| `isDecelerating` | 松手后正在惯性滑动 |
| `isScrollAnimating` | 正在跑 `setContentOffset` 的动画 |

## 事件

```js
scroller.addEventListener('scroll', () => { /* 读 contentOffset */ });
```

| 事件 | 什么时候 |
| --- | --- |
| `scroll` | 偏移变了 |
| `dragbegin` | 开始拖 |
| `dragend` | 松手 |
| `deceleratebegin` | 开始惯性滑动 |
| `decelerateend` | 停下来 |
| `scrollanimationend` | `setContentOffset(…, { animated: true })` 的动画跑完 |
| `scrolltotop` | 点状态栏回到顶部之后 |
| `adjustedcontentinsetchange` | `adjustedContentInset` 变了 |

实测一次真实滑动的顺序：

```
dragbegin → dragend → deceleratebegin → decelerateend
```

中间一路在发 `scroll`。

### 三条必须知道的

**1. 事件不带数据。** 只有 `type` 和 `target`，位置、速度、状态都去对象上读：

```js
scroller.addEventListener('dragend', () => {
  scroller.isDecelerating;    // ← 不是事件的字段
  scroller.contentOffset.y;
});
```

**2. `scroll` 会被合并。** 同一轮里滚了多少次，到 JS 都只有**一个** `scroll` 事件——因为事件不带数据，合并是无损的。所以**别用事件个数做计数**，要位置就读 `contentOffset`。

```js
scroller.contentOffset = new CGPoint(0, 10);
scroller.contentOffset = new CGPoint(0, 20);
scroller.contentOffset = new CGPoint(0, 30);
// 只收到一个 scroll，这时 contentOffset.y 已经是 30
```

**3. 事件不可取消。** 你的回调跑的时候，画面早就滚完了。`preventDefault()` 在这里什么都不做。

> **滚动由 UIKit 在主线程驱动，和 JS 同一个线程。** 浏览器有合成器线程兜底，JS 卡住滚动照样流畅；这里没有。`scroll` 回调里干重活会直接掉帧——这一点和原生 iOS App 一样，不是 Nacre 特有的。要做吸顶、视差这类效果，就把回调里的工作压到最小。

## 属性一览

| 属性 | 类型 | 读写 |
| --- | --- | --- |
| `contentOffset` | `CGPoint` | 读写 |
| `contentSize` | `CGSize` | 读写 |
| `contentInset` | `UIEdgeInsets` | 读写 |
| `adjustedContentInset` | `UIEdgeInsets` | 只读 |
| `contentInsetAdjustmentBehavior` | 枚举字符串 | 读写 |
| `contentLayoutGuide` / `frameLayoutGuide` | `UILayoutGuide` | 只读 |
| `isScrollEnabled`、`bounces`、`alwaysBounceVertical`、`alwaysBounceHorizontal`、`isPagingEnabled`、`isDirectionalLockEnabled`、`scrollsToTop`、`delaysContentTouches`、`canCancelContentTouches` | `boolean` | 读写 |
| `showsVerticalScrollIndicator`、`showsHorizontalScrollIndicator`、`automaticallyAdjustsScrollIndicatorInsets` | `boolean` | 读写 |
| `indicatorStyle` | 枚举字符串 | 读写 |
| `verticalScrollIndicatorInsets`、`horizontalScrollIndicatorInsets` | `UIEdgeInsets` | 读写 |
| `decelerationRate` | `number \| 'normal' \| 'fast'` | 读写 |
| `isTracking`、`isDragging`、`isDecelerating`、`isScrollAnimating` | `boolean` | 只读 |

## 和原生的对照

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
| `sv.pagingEnabled = YES` | `sv.isPagingEnabled = true` |
| `sv.contentLayoutGuide` | `sv.contentLayoutGuide` |
| `- scrollViewDidScroll:` | `addEventListener('scroll', …)` |
| `- scrollViewWillBeginDragging:` | `addEventListener('dragbegin', …)` |
| `- scrollViewDidEndDragging:willDecelerate:` | `addEventListener('dragend', …)`，`willDecelerate` 改读 `isDecelerating` |
| `- scrollViewWillBeginDecelerating:` | `addEventListener('deceleratebegin', …)` |
| `- scrollViewDidEndDecelerating:` | `addEventListener('decelerateend', …)` |
| `- scrollViewDidEndScrollingAnimation:` | `addEventListener('scrollanimationend', …)` |
| `- scrollViewDidScrollToTop:` | `addEventListener('scrolltotop', …)` |
| `- scrollViewDidChangeAdjustedContentInset:` | `addEventListener('adjustedcontentinsetchange', …)` |
| `sv.delegate` | **不暴露**——它是运行时自己设的，JS 改它会把事件源掐断 |

## 还没做

| | |
| --- | --- |
| 缩放整套 | `zoomScale`、`zoomToRect:`、三个 zoom 事件。卡在 `viewForZoomingInScrollView:`（要同步返回一个 view）和捏合手势上，和手势一起做 |
| `scrollViewWillEndDragging:withVelocity:targetContentOffset:` | 第三个参数是**出参**，要同步改。等同步回调（M1b） |
| `refreshControl` | 下拉刷新，要先有 `UIRefreshControl` |
| `keyboardDismissMode` | 等输入框和键盘那一步 |
| `panGestureRecognizer` / `pinchGestureRecognizer` | 等手势那一步 |
| `touchesShouldBegin:` / `touchesShouldCancelInContentView:` | 是覆写点，要能用 JS 子类化原生类 |
| iOS 26 的四个 `UIScrollEdgeEffect` | 要先有 `UIScrollEdgeEffect` 类 |
| `UITableView` / `UICollectionView` | 列表那一步，要同步回调 |

---

← 返回 [API 文档](README.md) ・ [`UIStackView`](ui-stack-view.md) ・ [实现原理](../internals/scrolling.md)
