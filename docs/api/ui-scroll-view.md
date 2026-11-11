---
type: reference
native: UIScrollView
status: partial
---

# `UIScrollView`

`UIScrollView` 是可以滚动的视图：放进去的内容比它自己大时，用户可以用手指拖着看。

它相当于 CSS 里设了 `overflow: scroll` 的元素，有三点不同：

- **内容有多大要你告诉它。** 它不会自动量子视图。做法有两种：用约束让系统算，或者直接写 `contentSize`。
- **滚动事件不带数据。** 滚到了哪里要从滚动视图上读 `contentOffset`，相当于 `scrollTop` 和 `scrollLeft`。
- **滚动不能被 JS 拦下来。** 没有 `preventDefault()` 的对应物。

## 完整例子

下面的代码从空白 App 开始，做一个可以上下滚动的页面，里面有 40 行文字。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 创建滚动视图，铺满整个页面
  const scroller = new UIScrollView();
  scroller.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(scroller);

  // 2. 创建一个纵向排列的容器，放进滚动视图
  const column = new UIStackView();
  column.translatesAutoresizingMaskIntoConstraints = false;
  column.axis = 'vertical';
  column.spacing = 12;          // 每两行之间空 12 pt
  scroller.addSubview(column);

  // 3. 往容器里放 40 行文字
  for (let i = 1; i <= 40; i++) {
    const label = new UILabel();
    label.text = `第 ${i} 行`;
    column.addArrangedSubview(label);
  }

  // 4. 用约束说明：滚动视图多大、内容多大
  const content = scroller.contentLayoutGuide;
  const frame = scroller.frameLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    // 滚动视图的四条边和页面对齐
    scroller.topAnchor.constraintEqualToAnchor(page.view.topAnchor),
    scroller.bottomAnchor.constraintEqualToAnchor(page.view.bottomAnchor),
    scroller.leadingAnchor.constraintEqualToAnchor(page.view.leadingAnchor),
    scroller.trailingAnchor.constraintEqualToAnchor(page.view.trailingAnchor),
    // 容器的四条边和「内容区」对齐：容器多高，内容就多高
    column.topAnchor.constraintEqualToAnchor(content.topAnchor),
    column.bottomAnchor.constraintEqualToAnchor(content.bottomAnchor),
    column.leadingAnchor.constraintEqualToAnchor(content.leadingAnchor),
    column.trailingAnchor.constraintEqualToAnchor(content.trailingAnchor),
    // 容器的宽度等于「可视区」的宽度：横向不能滚
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

四步分别是：创建滚动视图、创建放内容的容器、放内容、用约束说明大小。第 4 步里的「内容区」和「可视区」见[三个基本概念](#三个基本概念)。

> **注意**：第 2 步里 `column.translatesAutoresizingMaskIntoConstraints = false` 这一行不能少。原因见[内容不显示的常见原因](#内容不显示的常见原因)。

## 常见用法

以下例子都沿用上面的 `scroller`、`column` 和 `page`。

### 知道现在滚到了哪里

```js
scroller.addEventListener('scroll', () => {
  console.log(scroller.contentOffset.y);
});
```

**效果**：滚动期间不断输出一个数字。在最顶部时是 `0` 附近（有安全区时是负数，见[安全区](#安全区)），越往下滚数字越大，单位是 [pt](units.md)。

### 用代码滚到某个位置

```js
scroller.setContentOffset(new CGPoint(0, 500), { animated: true });
```

**效果**：内容平滑地滚到向下 500 pt 的位置。动画结束时派发 `scrollanimationend` 事件。

不要动画，直接赋值：

```js
scroller.contentOffset = new CGPoint(0, 500);
```

**效果**：立刻跳到那个位置，没有过渡。

### 回到顶部

```js
const top = -scroller.adjustedContentInset.top;
scroller.setContentOffset(new CGPoint(0, top), { animated: true });
```

**效果**：平滑滚回最顶部。

顶部的位置不一定是 `0`。有安全区时系统会在上方留白，顶部对应的是一个负数，所以要减去 `adjustedContentInset.top`。

### 让某个子视图滚进屏幕

```js
scroller.scrollRectToVisible(target.frame, { animated: true });
```

**效果**：滚动最短的距离，使 `target` 完整地出现在屏幕上。如果它已经完整可见，什么都不发生。

`target.frame` 必须是相对于滚动视图内容的位置。`target` 不是滚动视图的直接子视图时，先用 `convertRect()` 换算。

### 改成横向滚动

把[完整例子](#完整例子)第 2 步的方向和第 4 步的最后一条约束换掉：

```js
column.axis = 'horizontal';

// 原来是宽度等于可视区的宽度，现在改成高度
column.heightAnchor.constraintEqualToAnchor(frame.heightAnchor),
```

**效果**：内容从左到右排开，可以左右拖动，上下拖不动。

规则是：哪个方向的尺寸和可视区相等，哪个方向就不能滚。

### 一页一页地翻（轮播）

```js
scroller.isPagingEnabled = true;
```

配合横向滚动，并让每个子视图的宽度等于可视区的宽度：

```js
for (const card of cards) {
  column.addArrangedSubview(card);
  card.widthAnchor.constraintEqualToAnchor(frame.widthAnchor).isActive = true;
}
```

**效果**：每次滑动松手后，停在某一张卡片正好占满屏幕的位置，不会停在两张中间。

当前是第几页，在滚动停下时算：

```js
scroller.addEventListener('decelerateend', () => {
  const index = Math.round(scroller.contentOffset.x / scroller.bounds.width);
  console.log('第', index, '页');   // 从 0 开始
});
```

**这个轮播的例子未在模拟器验证。**

### 知道滚动什么时候开始和结束

```js
scroller.addEventListener('dragbegin', () => console.log('开始拖'));
scroller.addEventListener('dragend', () => console.log('松手'));
scroller.addEventListener('decelerateend', () => console.log('完全停下'));
```

**效果**：用户拖一下再松手，依次输出 `开始拖`、`松手`、`完全停下`。

如果松手时手指没有速度，内容不会继续滑，也就不会有 `完全停下`。判断方法：

```js
scroller.addEventListener('dragend', () => {
  if (!scroller.isDecelerating) console.log('松手时已经停住了');
});
```

### 禁止滚动

```js
scroller.isScrollEnabled = false;
```

**效果**：用户拖不动。用代码写 `contentOffset` 仍然有效。设回 `true` 恢复。

### 去掉到头之后的回弹

```js
scroller.bounces = false;
```

**效果**：滚到最顶或最底就停住，不能再往外拉。

### 内容很少时也能拉动

内容没有超出屏幕时，默认拖不动。下拉刷新这类交互需要它能动：

```js
scroller.alwaysBounceVertical = true;
```

**效果**：内容不足一屏时，上下也能拉一小段，松手弹回。

### 隐藏滚动指示条

```js
scroller.showsVerticalScrollIndicator = false;
```

**效果**：滚动时右侧不再出现指示条。横向的对应属性是 `showsHorizontalScrollIndicator`。

### 在内容四周留白

```js
scroller.contentInset = new UIEdgeInsets(20, 0, 80, 0);   // 上、左、下、右
```

**效果**：内容顶部多出 20 pt 空白，底部多出 80 pt 空白，这些空白跟着内容一起滚动。底部有悬浮按钮时，用它保证最后一行不被挡住。

### 不用约束，直接指定内容大小

子视图用 `frame` 摆放时，用 `contentSize` 告诉滚动视图内容有多大：

```js
const scroller = new UIScrollView();
scroller.frame = new CGRect(0, 0, 400, 800);
scroller.contentSize = new CGSize(400, 3000);
page.view.addSubview(scroller);

const box = new UIView();
box.frame = new CGRect(20, 2500, 100, 100);
box.backgroundColor = 'systemRed';
scroller.addSubview(box);
```

**效果**：一个 400 × 800 pt 的滚动区域，可以向下滚 2200 pt（3000 减 800）。滚到接近底部时看到一个红色方块。

## 三个基本概念

滚动视图的所有属性都围绕三个量。

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

| 概念 | 是什么 | 对应的属性 | Web 里的对应物 |
| --- | --- | --- | --- |
| 可视区 | 滚动视图自己在屏幕上占的矩形 | `bounds` 的宽高 | `clientWidth` / `clientHeight` |
| 内容区 | 全部内容占的矩形，通常比可视区大 | `contentSize` | `scrollWidth` / `scrollHeight` |
| 偏移 | 内容区的左上角相对可视区的左上角移出去了多少 | `contentOffset` | `scrollLeft` / `scrollTop` |

某个方向上能滚的最大距离，等于内容区的尺寸减去可视区的尺寸。内容区不比可视区大，这个方向就不能滚。

### 用约束说明内容区的大小

滚动视图提供两个只用于写约束的参照物：

| 参照物 | 代表 | 把子视图和它对齐，意思是 |
| --- | --- | --- |
| `contentLayoutGuide` | 内容区 | 「内容区和这个子视图一样大」 |
| `frameLayoutGuide` | 可视区 | 「这个子视图的尺寸和可视区一样」 |

[完整例子](#完整例子)里的写法是：容器的四条边和 `contentLayoutGuide` 对齐，于是内容区的大小等于容器的大小；容器的宽度等于 `frameLayoutGuide` 的宽度，于是内容区和可视区一样宽，横向不能滚。

用了这种写法就不要再写 `contentSize`。

### 内容不显示的常见原因

**现象**：滚动视图里什么都没有，`contentSize` 读出来是 `(0, 0)`，控制台没有任何报错。

**原因**：放内容的容器没有设 `translatesAutoresizingMaskIntoConstraints = false`。

这个属性默认是 `true`，意思是「按 `frame` 摆放这个视图」。容器的 `frame` 默认是 0 × 0，于是系统把它固定成 0 大小，内容区跟着变成 0。用约束摆放的视图都要把它设成 `false`。

`addArrangedSubview()` 会自动替放进去的子视图设好，但不会替容器自己设。

### 安全区

安全区是屏幕上不会被刘海、圆角和底部横条遮挡的区域。

滚动视图铺满屏幕时，系统默认在内容的上方和下方自动留白，让第一行和最后一行停在安全区内。滚动过程中内容仍然会从刘海和横条下面经过。

这带来两个结果：

- 内容在最顶部时，`contentOffset.y` 不是 `0`，是一个负数，大小等于顶部留白的高度。
- 实际的留白要读 `adjustedContentInset`，它等于你设的 `contentInset` 加上系统自动加的部分。

不想要系统自动留白：

```js
scroller.contentInsetAdjustmentBehavior = 'never';
```

**效果**：内容的第一行从屏幕最顶端开始，会被刘海挡住。

## 滚动事件的三个特点

**事件不带数据。** 事件对象只有 `type` 和 `target`。位置读 `contentOffset`，状态读 `isDragging`、`isDecelerating`。

**`scroll` 事件会合并。** 两次 JS 执行之间不管滚动了多少次，只派发一个 `scroll`。不要用事件的次数计数。

```js
scroller.contentOffset = new CGPoint(0, 10);
scroller.contentOffset = new CGPoint(0, 20);
scroller.contentOffset = new CGPoint(0, 30);
// 只收到一个 scroll，此时 contentOffset.y 是 30
```

**回调里的工作要少。** 滚动和 JS 都在主线程上执行。浏览器有单独的合成器线程，JS 卡住时页面照样能滚；这里没有，`scroll` 回调执行多久，画面就停多久。

## 成员说明

所有长度和位置的单位都是 [pt](units.md)。

### 创建

#### `new UIScrollView()`

创建一个滚动视图。没有参数。刚创建时大小是 0，内容区也是 0。

### 位置和内容大小

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `contentOffset` | `CGPoint` | 是 | 是 | `(0, 0)` | 当前滚到的位置。写入会立刻跳过去，没有动画 |
| `contentSize` | `CGSize` | 是 | 是 | `(0, 0)` | 内容区的大小。用约束时由系统算出，不要写 |
| `contentInset` | `UIEdgeInsets` | 是 | 是 | 四边都是 `0` | 在内容四周额外留的空白 |
| `adjustedContentInset` | `UIEdgeInsets` | 是 | 否 | 由系统决定 | 实际生效的空白：`contentInset` 加上系统为安全区加的部分 |
| `contentInsetAdjustmentBehavior` | 字符串 | 是 | 是 | `'automatic'` | 系统是否自动为安全区留白，取值见下表 |
| `contentLayoutGuide` | [`UILayoutGuide`](auto-layout.md#uilayoutguide) | 是 | 否 | — | 写约束用的参照物，代表内容区 |
| `frameLayoutGuide` | [`UILayoutGuide`](auto-layout.md#uilayoutguide) | 是 | 否 | — | 写约束用的参照物，代表可视区 |

`contentInsetAdjustmentBehavior` 的取值：

| 值 | 效果 |
| --- | --- |
| `'automatic'` | 由系统决定，通常和 `'scrollableAxes'` 相同 |
| `'scrollableAxes'` | 只在能滚动的方向上留白 |
| `'never'` | 不留白。内容从屏幕边缘开始，会被刘海和底部横条挡住 |
| `'always'` | 四边都留白 |

值变化时怎么知道：

| 属性 | 通知 |
| --- | --- |
| `contentOffset` | `scroll` 事件。用户滚动和代码写入都会派发 |
| `adjustedContentInset` | `adjustedcontentinsetchange` 事件 |
| `contentSize` | 没有通知，iOS 不提供 |
| 其余 | 没有通知，只有你自己的代码能改它们 |

`CGPoint`、`CGSize`、`UIEdgeInsets` 每次读出来都是新对象，字段不能改。要改就整个重新赋值，见[结构体](structs.md)。

### 行为开关

都是布尔值，都可读可写。只有你自己的代码能改它们，所以没有变化通知。

| 属性 | 默认值 | `true` 时 | `false` 时 |
| --- | --- | --- | --- |
| `isScrollEnabled` | `true` | 用户可以拖动 | 用户拖不动。代码写 `contentOffset` 仍有效 |
| `bounces` | `true` | 滚到头后可以再拉一段，松手弹回 | 滚到头就停 |
| `alwaysBounceVertical` | `false` | 内容不足一屏时，纵向也能拉动并弹回。需要 `bounces` 为 `true` | 内容不足一屏时纵向拖不动 |
| `alwaysBounceHorizontal` | `false` | 同上，横向 | 同上，横向 |
| `isPagingEnabled` | `false` | 松手后停在可视区宽度（或高度）的整数倍上 | 停在任意位置 |
| `isDirectionalLockEnabled` | `false` | 一次拖动只沿起步时的方向滚 | 可以斜着滚 |
| `scrollsToTop` | `true` | 用户点屏幕顶部的状态栏时滚回顶部 | 点状态栏没有反应 |
| `delaysContentTouches` | `true` | 手指按下后先等片刻判断是不是要滚动，再把触摸交给里面的按钮。按钮的按下反馈略有延迟 | 立刻把触摸交给里面的按钮 |
| `canCancelContentTouches` | `true` | 手指按在按钮上再移动，会改成滚动 | 手指按在按钮上就不能滚动了 |

> **注意**：一个屏幕上只能有一个滚动视图的 `scrollsToTop` 是 `true`。有多个时，点状态栏都没有反应。

`isDirectionalLockEnabled`、`delaysContentTouches`、`canCancelContentTouches` 三项的效果**未在模拟器验证**。

### 滚动指示条

指示条是滚动时出现在边缘的细条，表示当前位置。以下属性都可读可写，没有变化通知。

| 属性 | 类型 | 默认值 | 含义 |
| --- | --- | --- | --- |
| `showsVerticalScrollIndicator` | 布尔 | `true` | 纵向滚动时是否显示指示条 |
| `showsHorizontalScrollIndicator` | 布尔 | `true` | 横向滚动时是否显示指示条 |
| `indicatorStyle` | 字符串 | `'default'` | 指示条的颜色，取值见下表 |
| `verticalScrollIndicatorInsets` | `UIEdgeInsets` | 四边都是 `0` | 纵向指示条离滚动视图边缘的距离 |
| `horizontalScrollIndicatorInsets` | `UIEdgeInsets` | 四边都是 `0` | 横向指示条离滚动视图边缘的距离 |
| `automaticallyAdjustsScrollIndicatorInsets` | 布尔 | `true` | `true` 时系统按安全区自动调整上面两个距离 |

`indicatorStyle` 的取值：

| 值 | 效果 |
| --- | --- |
| `'default'` | 跟随浅色或深色模式自动选 |
| `'black'` | 深色的条，用在浅色内容上 |
| `'white'` | 浅色的条，用在深色内容上 |

### 减速

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `decelerationRate` | `'normal'` 或 `'fast'` | 是 | 是 | `'normal'` | 松手后滑多远才停 |

| 值 | 效果 |
| --- | --- |
| `'normal'` | 滑得远 |
| `'fast'` | 很快停下。做轮播、选择器时用 |

```js
scroller.decelerationRate = 'fast';
```

这个属性也接受数字（`'normal'` 对应 0.998，`'fast'` 对应 0.99），但系统只有这两档。写其他数字会被归到最近的一档，读出来仍是 `'normal'` 或 `'fast'`：

```js
scroller.decelerationRate = 0.95;
scroller.decelerationRate;          // 'fast'
```

### 当前状态

都是布尔值，都只读。

| 属性 | 什么时候是 `true` | 变化时的事件 |
| --- | --- | --- |
| `isTracking` | 手指按在滚动视图上，包括还没开始移动的时候 | 没有 |
| `isDragging` | 用户正在拖动 | `dragbegin`、`dragend` |
| `isDecelerating` | 用户已经松手，内容还在滑 | `deceleratebegin`、`decelerateend` |
| `isScrollAnimating` | 正在执行 `setContentOffset()` 发起的动画 | 结束时 `scrollanimationend` |

### 方法

#### `setContentOffset()`

滚到指定位置，可以带动画。

```js
scroller.setContentOffset(new CGPoint(0, 500), { animated: true });
```

| 参数 | 类型 | 必填 | 含义 |
| --- | --- | --- | --- |
| 第一个 | `CGPoint` | 是 | 目标位置 |
| `animated` | 布尔 | 否 | 是否带动画。默认 `false` |

- **返回**：无。
- **出错**：第一个参数不是对象，或缺少 `x`、`y`，抛 `TypeError: setContentOffset needs an object with all of: x, y`。

带动画时，动画结束派发 `scrollanimationend`。

#### `scrollRectToVisible()`

滚动最短的距离，让指定的矩形完整地出现在可视区里。

```js
scroller.scrollRectToVisible(new CGRect(0, 1200, 100, 44), { animated: true });
```

| 参数 | 类型 | 必填 | 含义 |
| --- | --- | --- | --- |
| 第一个 | `CGRect` | 是 | 要显示出来的矩形，位置相对于内容区的左上角 |
| `animated` | 布尔 | 否 | 是否带动画。默认 `false` |

- **返回**：无。
- **出错**：第一个参数不是对象，或缺少 `x`、`y`、`width`、`height`，抛 `TypeError`。

#### `flashScrollIndicators()`

让滚动指示条显示片刻再消失，提示用户这里可以滚动。没有参数，没有返回值。

```js
scroller.flashScrollIndicators();
```

### 事件

用 `addEventListener()` 监听。事件对象只有 `type` 和 `target`。所有事件都不能取消。

| 事件 | 什么时候派发 |
| --- | --- |
| `scroll` | 位置变了。用户滚动、惯性滑动、代码写入都会派发 |
| `dragbegin` | 用户开始拖动 |
| `dragend` | 用户松手 |
| `deceleratebegin` | 松手后内容开始继续滑 |
| `decelerateend` | 内容完全停下 |
| `scrollanimationend` | `setContentOffset()` 的动画结束 |
| `scrolltotop` | 用户点状态栏，滚回顶部之后 |
| `adjustedcontentinsetchange` | `adjustedContentInset` 变了 |

用户拖一下再松手，派发顺序是：

```
dragbegin → dragend → deceleratebegin → decelerateend
```

期间不断派发 `scroll`。

监听表里没有的事件名会抛 `TypeError: addEventListener has no value "scrol"; expected one of: …`。

底色、圆角、隐藏等其他成员继承自 [`UIView`](ui-view.md)。

## 与 iOS 原生写法的对照

如果你在看 Apple 的文档或 iOS 的示例代码，按这张表换成 JS 的写法。

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
| `- scrollViewDidScroll:` | `scroll` 事件 |
| `- scrollViewWillBeginDragging:` | `dragbegin` 事件 |
| `- scrollViewDidEndDragging:willDecelerate:` | `dragend` 事件。`willDecelerate` 改读 `isDecelerating` |
| `- scrollViewWillBeginDecelerating:` | `deceleratebegin` 事件 |
| `- scrollViewDidEndDecelerating:` | `decelerateend` 事件 |
| `- scrollViewDidEndScrollingAnimation:` | `scrollanimationend` 事件 |
| `- scrollViewDidScrollToTop:` | `scrolltotop` 事件 |
| `- scrollViewDidChangeAdjustedContentInset:` | `adjustedcontentinsetchange` 事件 |
| `sv.delegate` | 不提供。运行时自己用它来派发上面的事件 |

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 双指缩放内容 | `zoomScale`、`viewForZoomingInScrollView:` | 未实现 |
| 松手时改变最终停下的位置（自定义吸附） | `scrollViewWillEndDragging:withVelocity:targetContentOffset:` | 未实现 |
| 下拉刷新 | `refreshControl` | 未实现 |
| 滚动时自动收起键盘 | `keyboardDismissMode` | 未实现 |
| 读取拖动的速度和手势 | `panGestureRecognizer` | 未实现 |
| 数据量很大的列表（只创建屏幕上看得见的行） | `UITableView`、`UICollectionView` | 未实现 |
| 滚动边缘的模糊效果（iOS 26） | `UIScrollEdgeEffect` | 未实现 |

## 参见

- [`UIStackView`](ui-stack-view.md)：例子里放内容的容器
- [Auto Layout](auto-layout.md)：约束的写法
- [单位](units.md)：pt 和像素的关系
- [结构体](structs.md)：`CGPoint`、`CGSize`、`CGRect`、`UIEdgeInsets`
- [实现原理：滚动](../internals/scrolling.md)
