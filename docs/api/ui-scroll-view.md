---
type: reference
native: UIScrollView
status: partial
---

# `UIScrollView`

**`UIScrollView`** 表示一个可以滚动的视图，称为滚动视图。放在它里面的内容比它自己大时，用户用手指拖动来查看其余部分。拖动、松手后的惯性滑动、滚到头之后的回弹、滚动指示条，都由系统完成，不需要写代码。

滚动视图有三个量：

- **可视区**：滚动视图自己在屏幕上占的矩形，大小是 `bounds` 的宽高。
- **内容区**：全部内容占的矩形，大小是 `contentSize`。
- **偏移**：内容区的左上角已经移出可视区左上角多少，是 `contentOffset`。

某个方向上内容区比可视区大，这个方向才能滚动。所有长度的单位都是 [pt](units.md)。

## 内容区的大小由谁决定

滚动视图不会自己量里面的子视图。内容区有多大，要由 App 告诉它，有两种方式：

| 方式 | 写法 | 适用 |
| --- | --- | --- |
| 用约束 | 把放内容的容器的四条边和 `scroller.contentLayoutGuide` 对齐。容器多大，内容区就多大 | 推荐。内容增减时内容区自动跟着变 |
| 直接写 | `scroller.contentSize = new CGSize(宽, 高)` | 子视图用 `frame` 定位时。内容变了要自己重新写 |

两种方式不要同时用。约束（[Auto Layout](auto-layout.md) 里视图之间的位置关系）的写法见下面的完整例子。

用约束时，内容区的大小在系统完成布局之后才算出来。激活约束后紧接着读 `contentSize`，读到的还是旧值；先在页面的根视图上调 `layoutIfNeeded()` 再读。

## 推荐的页面骨架

需要滚动的页面，推荐的结构是**滚动视图里放一个纵向的排列容器（[`UIStackView`](ui-stack-view.md)），页面上的每一块内容是容器的一个排列项**。[完整例子](#完整例子)就是这个结构。

这样写的理由：

- 排列容器的高度由里面的内容决定，内容区的高度跟着它。加一块、删一块、隐藏一块，都不用改约束，也不用重算 `contentSize`。
- 容器的宽度等于可视区的宽度，所以只能上下滚动，换一台宽度不同的设备不用改代码。

滚动视图自己放在哪里有两种做法：

| 做法 | 结果 | 适用 |
| --- | --- | --- |
| 四条边和页面的根视图对齐 | 内容滚动时从刘海和底部横条的下面经过。系统自动在内容的上方和下方留白，见[安全区](#安全区) | 一般的页面 |
| 四条边和安全区（`page.view.safeAreaLayoutGuide`）对齐 | 内容不会进入刘海和底部横条的区域。系统不加留白，最顶部的 `contentOffset.y` 是 `0` | 需要按 `contentOffset` 做计算、不想处理留白时 |

## 滚不动的三个常见原因

滚动视图不能滚动时，控制台没有任何输出。先在页面的根视图上调 `layoutIfNeeded()`，再读 `scroller.contentSize` 和 `scroller.bounds`，对照下面三种情况：

| `contentSize` 读出来 | 原因 | 改法 |
| --- | --- | --- |
| `(0, 0)`，并且里面什么都不显示 | 放内容的容器没有把 `translatesAutoresizingMaskIntoConstraints` 设成 `false` | 给容器补上这一行。见[内容不显示的常见原因](#内容不显示的常见原因) |
| 某个方向是 `0`，或者不随内容变化 | 约束没有把内容区的大小确定下来。常见的是容器只和 `contentLayoutGuide` 对齐了上边和左右，漏了底边。**未在模拟器验证** | 容器的四条边都要和 `contentLayoutGuide` 对齐，容器里的内容要有确定的高度 |
| 不比 `bounds` 的宽高大 | 内容本来就没有超出可视区 | 这是正常的。想让它也能拉动一小段，见[内容很少时也能拉动](#内容很少时也能拉动) |

另外，`isScrollEnabled` 是 `false` 时用户也拖不动。

## 滚动和 JS 的关系

滚动由系统驱动，不等 JS 的回答。手指拖动时内容先移动，之后系统才通知 JS。JS 不能拦住或取消一次滚动，所有滚动事件都不能取消。

JS 通过 `scroll` 事件得知位置变了。事件对象不带位置，位置从滚动视图上读 `contentOffset`。

**在 `scroll` 回调里读位置、改视图是正常用法**，比如按滚动的距离改标题栏的透明度、滚到底部时加载下一页。依据是三条实测的事实：

- `scroll` 事件不会堆积。上一个 `scroll` 还没派发时又发生的滚动，不会再排一个事件，回调执行时读到的是最新的位置。
- 读一次属性、写一次属性各需要几微秒（实测一次读写 1.3–7 µs）。
- 一次真实的滑动历时 1819 ms，派发了 100 次 `scroll`（模拟器，Debug 构建）。

`scroll` 回调和界面的更新在同一个线程上依次执行，背景见[运行时怎么工作](how-it-works.md)。

## 内容很多时

滚动视图里放了多少视图，就创建多少视图，不会只创建屏幕上看得见的那些。实测创建一个视图约 4 µs，写一个属性 2–7 µs，建一条约束约 10 µs，`addSubview()` 一次约 12 µs。

行数很多（几百行以上）时一次建出全部行的总耗时和内存占用，**没有测量数据**。只创建看得见的行需要 iOS 的列表视图，目前[还不能做](#还不能做的)。

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

这段代码没有作为一个整体在模拟器运行过。同样的结构（滚动视图里放纵向排列容器，容器和两个参照物之间同样的五条约束）在验收用例里运行过，并断言了内容区的高度等于各行高度加间距之和、内容区的宽度等于可视区的宽度。上面列的拖动、惯性、回弹、指示条是系统的默认行为，验收时用手滑过。

四步分别是：创建滚动视图、创建放内容的容器、放内容、用约束说明大小。第 4 步里的「内容区」和「可视区」见[三个基本概念](#三个基本概念)。

每一行文字没有写约束，位置和大小由排列容器安排。`column` 没有写高度，它的高度是 40 行文字的高度加 39 个间距，内容区的高度跟着它。

> **注意**：第 2 步里 `column.translatesAutoresizingMaskIntoConstraints = false` 这一行不能少。原因见[内容不显示的常见原因](#内容不显示的常见原因)。

## 常见用法

以下例子都沿用上面的 `scroller`、`column`、`page`、`content` 和 `frame`。

### 知道现在滚到了哪里

```js
scroller.addEventListener('scroll', () => {
  console.log(scroller.contentOffset.y);
});
```

**效果**：滚动期间不断输出一个数字。在最顶部时是 `0` 附近（有安全区时是负数，见[安全区](#安全区)），越往下滚数字越大，单位是 [pt](units.md)。

用户拖动、松手后的惯性滑动、代码写 `contentOffset`，都会派发 `scroll`。没有监听 `scroll` 时，滚动照常进行。

### 知道滚到了底部

```js
scroller.addEventListener('scroll', () => {
  // 可视区的底边现在在内容区的什么位置
  const visibleBottom = scroller.contentOffset.y + scroller.bounds.height
    - scroller.adjustedContentInset.bottom;
  // 离内容区的底边不到 100 pt 就算到底
  if (visibleBottom >= scroller.contentSize.height - 100) {
    console.log('到底了');
  }
});
```

**效果**：内容滚到离底部不到 100 pt 时，控制台输出 `到底了`。继续滚动时每个 `scroll` 都会再输出一次，所以用它触发「加载下一页」时，要自己记一个「正在加载」的标志，避免重复触发。**未在模拟器验证。**

减去 `adjustedContentInset.bottom` 是因为系统可能在内容的下方留了白（见[安全区](#安全区)），留白不算内容。留一段提前量（这里是 100 pt）是为了在用户真正看到底部之前就开始加载。

没有「滚到底部」的事件，只能在 `scroll` 里自己判断。

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

**效果**：平滑滚回最顶部。**未在模拟器验证。**

顶部的位置不一定是 `0`。有安全区时系统会在上方留白，顶部对应的是一个负数，所以要减去 `adjustedContentInset.top`。

### 让某个子视图滚进屏幕

```js
const target = column.arrangedSubviews[29];   // 第 30 行
// 把 target 的范围换算成相对于内容区左上角的位置
const rect = target.convertRect(target.bounds, { toView: scroller });
scroller.scrollRectToVisible(rect, { animated: true });
```

**效果**：滚动最短的距离，使第 30 行完整地出现在屏幕上。如果它已经完整可见，什么都不发生。**未在模拟器验证。**

`scrollRectToVisible()` 要的矩形是相对于内容区左上角的位置。`target` 是滚动视图的直接子视图时可以直接传 `target.frame`。这里 `target` 在排列容器里，所以用 `convertRect()` 换算。

### 改成横向滚动

把[完整例子](#完整例子)第 2 步的方向改成横向，第 4 步里容器的那五条约束换成下面这组：

```js
column.axis = 'horizontal';

NSLayoutConstraint.activateConstraints([
  // 这四条和原来一样
  column.topAnchor.constraintEqualToAnchor(content.topAnchor),
  column.bottomAnchor.constraintEqualToAnchor(content.bottomAnchor),
  column.leadingAnchor.constraintEqualToAnchor(content.leadingAnchor),
  column.trailingAnchor.constraintEqualToAnchor(content.trailingAnchor),
  // 原来是宽度等于可视区的宽度，现在改成高度
  column.heightAnchor.constraintEqualToAnchor(frame.heightAnchor),
]);
```

**效果**：内容从左到右排开，可以左右拖动，上下拖不动。**未在模拟器验证。**

规则是：哪个方向的尺寸和可视区相等，哪个方向就不能滚。

### 一页一页地翻（轮播）

```js
scroller.isPagingEnabled = true;
```

配合横向滚动，并让每个子视图的宽度等于可视区的宽度：

```js
const cards = ['systemRed', 'systemOrange', 'systemBlue'].map((color) => {
  const card = new UIView();
  card.backgroundColor = color;
  return card;
});
for (const card of cards) {
  column.addArrangedSubview(card);
  card.widthAnchor.constraintEqualToAnchor(frame.widthAnchor).isActive = true;
}
```

**效果**：每次滑动松手后，停在某一张卡片正好占满屏幕的位置，不会停在两张中间。

当前是第几页，在滚动停下时算。松手时如果内容已经停住，不会有 `decelerateend`（**未在模拟器验证**），所以两个事件都要听：

```js
function reportPage() {
  const index = Math.round(scroller.contentOffset.x / scroller.bounds.width);
  console.log('第', index, '页');   // 从 0 开始
}
scroller.addEventListener('decelerateend', reportPage);
scroller.addEventListener('dragend', () => {
  if (!scroller.isDecelerating) reportPage();
});
```

**这个轮播的例子未在模拟器验证。**

### 知道滚动什么时候开始和结束

```js
scroller.addEventListener('dragbegin', () => console.log('开始拖'));
scroller.addEventListener('dragend', () => console.log('松手'));
scroller.addEventListener('decelerateend', () => console.log('完全停下'));
```

**效果**：用户拖一下再松手，依次输出 `开始拖`、`松手`、`完全停下`（实测的顺序）。

如果松手时手指没有速度，内容不会继续滑，也就不会有 `完全停下`（**未在模拟器验证**）。判断方法：

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

内容没有超出可视区时，默认拖不动。要让它也能拉动：

```js
scroller.alwaysBounceVertical = true;
```

**效果**：内容不足一屏时，上下也能拉一小段，松手弹回。**未在模拟器验证。**

系统自带的下拉刷新控件目前[还不能用](#还不能做的)。

### 隐藏滚动指示条

```js
scroller.showsVerticalScrollIndicator = false;
```

**效果**：滚动时右侧不再出现指示条。横向的对应属性是 `showsHorizontalScrollIndicator`。

### 在内容四周留白

```js
scroller.contentInset = new UIEdgeInsets(20, 0, 80, 0);   // 上、左、下、右
```

**效果**：内容顶部多出 20 pt 空白，底部多出 80 pt 空白，这些空白跟着内容一起滚动。底部有悬浮按钮时，用它保证最后一行不被挡住。**未在模拟器验证。**

四个字段都要写，也可以写成普通对象 `{ top: 20, left: 0, bottom: 80, right: 0 }`。少一个字段抛 `TypeError`。

内容放在排列容器里时，另一种做法是给排列容器设[内边距](ui-stack-view.md#给容器加内边距)。两者的区别：`contentInset` 的留白不算进 `contentSize`，内边距算进去。

### 键盘弹出时不挡住输入框

把滚动视图的底边约束到页面的 `keyboardLayoutGuide` 的顶边。`keyboardLayoutGuide` 是系统提供的一个不显示的矩形：键盘收起时它的顶边在安全区的底边，键盘弹出时它的顶边在键盘的顶边。

把[完整例子](#完整例子)第 4 步里滚动视图底边的那一条换成：

```js
const keyboardTop = scroller.bottomAnchor.constraintEqualToAnchor(
  page.view.keyboardLayoutGuide.topAnchor);
keyboardTop.isActive = true;

// 输入框获得焦点时，把它滚进可视区
const field = new UITextField();
field.placeholder = '备注';
column.addArrangedSubview(field);
field.addEventListener('editingDidBegin', () => {
  const rect = field.convertRect(field.bounds, { toView: scroller });
  scroller.scrollRectToVisible(rect, { animated: true });
});
```

**效果**：键盘弹出时，滚动视图的可视区缩小到键盘上方，键盘下面没有内容。输入框获得焦点时滚动到可视区内。键盘收起时可视区恢复。不需要监听键盘事件，也不需要计算键盘的高度。

「视图的底边约束到 `keyboardLayoutGuide` 的顶边」这种写法在验收用例里断言过键盘收起时的位置。键盘弹出时的效果和滚进可视区的效果**未在模拟器验证**。

`keyboardLayoutGuide` 的说明见 [Auto Layout](auto-layout.md#跟随键盘)，输入框见[输入框和键盘](ui-text-field.md)。

### 不用约束，直接指定内容大小

子视图用 `frame` 定位时，用 `contentSize` 告诉滚动视图内容有多大。内容变了要重新写一次 `contentSize`，它不会自己更新。

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

**效果**：一个 400 × 800 pt 的滚动区域，可以向下滚 2200 pt（3000 减 800）。滚到接近底部时看到一个红色方块。**未在模拟器验证。**

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

| 概念 | 是什么 | 对应的属性 |
| --- | --- | --- |
| 可视区 | 滚动视图自己在屏幕上占的矩形 | `bounds` 的宽高 |
| 内容区 | 全部内容占的矩形，通常比可视区大 | `contentSize` |
| 偏移 | 内容区的左上角相对可视区的左上角移出去了多少 | `contentOffset` |

某个方向上能滚的最大距离，等于内容区的尺寸减去可视区的尺寸（系统加了留白时再加上留白，见[安全区](#安全区)）。内容区不比可视区大，这个方向就不能滚。

### 用约束说明内容区的大小

滚动视图提供两个只用于写约束的参照物：

| 参照物 | 代表 | 把子视图和它对齐，意思是 |
| --- | --- | --- |
| `contentLayoutGuide` | 内容区 | 「内容区和这个子视图一样大」 |
| `frameLayoutGuide` | 可视区 | 「这个子视图的尺寸和可视区一样」 |

[完整例子](#完整例子)里的写法是：容器的四条边和 `contentLayoutGuide` 对齐，于是内容区的大小等于容器的大小；容器的宽度等于 `frameLayoutGuide` 的宽度，于是内容区和可视区一样宽，横向不能滚。

用了这种写法就不要再写 `contentSize`。实测：12 行、每行高 36 pt、间距 6 pt 的内容，`contentSize.height` 读出来是 498 pt（12 × 36 + 11 × 6），`contentSize.width` 等于滚动视图的宽度。

### 内容不显示的常见原因

**现象**：滚动视图里什么都没有，`contentSize` 读出来是 `(0, 0)`，控制台没有任何报错。

**原因**：放内容的容器没有设 `translatesAutoresizingMaskIntoConstraints = false`。

这个属性默认是 `true`，意思是「按 `frame` 定位这个视图」。容器的 `frame` 默认是 0 × 0，于是系统把它固定成 0 大小，内容区跟着变成 0。用约束定位的视图都要把它设成 `false`。

`addArrangedSubview()` 会自动替放进去的子视图设好，但不会替容器自己设。滚动视图自己用约束定位时，也要设这一行。

这个现象在模拟器里实测过：系统不输出任何信息。

### 安全区

安全区是屏幕上不会被刘海、圆角和底部横条遮挡的区域。

滚动视图铺满屏幕时，系统默认在内容的上方和下方自动留白，让第一行和最后一行停在安全区内。滚动过程中内容仍然会从刘海和横条下面经过。

这带来两个结果：

- 内容在最顶部时，`contentOffset.y` 不是 `0`，是一个负数，大小等于顶部留白的高度。
- 实际的留白要读 `adjustedContentInset`，它等于 App 设的 `contentInset` 加上系统自动加的部分。留白变化时派发 `adjustedcontentinsetchange` 事件。

铺满屏幕时的留白和负的偏移是 iOS 的定义，**未在模拟器验证**。验收用例里断言的是相反的情况：滚动视图整个在安全区里面时，系统不加留白，`adjustedContentInset.top` 等于 `contentInset.top`。

不想要系统自动留白：

```js
scroller.contentInsetAdjustmentBehavior = 'never';
```

**效果**：内容的第一行从屏幕最顶端开始，会被刘海挡住。**未在模拟器验证。**

## 滚动事件

**事件不带数据。** 事件对象只有 `type` 和 `target`。位置读 `contentOffset`，状态读 `isDragging`、`isDecelerating`。回调执行时读到的是那一刻最新的值。

**`scroll` 事件会合并。** 上一个 `scroll` 还没派发时又发生的滚动，不再另外派发。所以 `scroll` 的次数不等于位置变化的次数，不要用它计数。

```js
let count = 0;
scroller.addEventListener('scroll', () => { count += 1; });

scroller.contentOffset = new CGPoint(0, 10);
scroller.contentOffset = new CGPoint(0, 20);
scroller.contentOffset = new CGPoint(0, 30);
console.log(scroller.contentOffset.y);

setTimeout(() => console.log(count), 100);
```

**效果**：第一行立刻输出 `30`，写入是同步生效的。100 毫秒后输出 `1`：连写三次位置，只收到一个 `scroll`（实测）。

**事件在这段代码执行完之后才派发。** 上面的例子里，三次赋值执行时回调一次都没有被调用。回调在当前这段 JS 结束之后执行。

**窗口显示出来之前写 `contentOffset` 不派发 `scroll`。** 位置写得进去，读出来是对的，但收不到事件（实测）。

**没有监听器时没有开销。** 没有监听任何滚动事件的滚动视图，滚动时不调用 JS。

## 成员说明

所有长度和位置的单位都是 [pt](units.md)。

### 创建

#### `new UIScrollView()`

创建一个滚动视图。没有参数。刚创建时大小是 0，内容区也是 0，位置和大小要用约束或 `frame` 确定。

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
| 其余 | 没有通知，只有 App 自己的代码能改它们 |

`CGPoint`、`CGSize`、`UIEdgeInsets` 每次读出来都是新对象，字段不能改。要改就整个重新赋值，见[结构体](structs.md)。

写入时的出错情况：

| 情况 | 报错 |
| --- | --- |
| 写入的不是对象 | `TypeError: contentOffset needs an object with all of: x, y`，开头是属性名，末尾是这个结构体的全部字段 |
| 缺字段，或者字段不是有限的数 | `TypeError: contentOffset is missing y, or it is not a finite number` |
| `contentInsetAdjustmentBehavior`、`indicatorStyle` 写了表里没有的值 | `TypeError: indicatorStyle has no value "gray"; expected one of: …`，省略号处是全部可选值 |

抛错之后属性保持原值。

### 行为开关

都是布尔值，都可读可写。只有 App 自己的代码能改它们，所以没有变化通知。写入其他类型的值时按 JS 的真假转换。

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
| `decelerationRate` | `'normal'`、`'fast'` 或数字 | 是 | 是 | `'normal'` | 松手后滑多远才停 |

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
console.log(scroller.decelerationRate);   // 'fast'
```

**效果**：输出 `fast`。实测：`0.5`、`0.95` 读出来是 `'fast'`，`0.994`、`0.999`、`1.5` 读出来是 `'normal'`，都不报错。

写了 `'normal'`、`'fast'` 以外的字符串（比如 `'slow'`）抛 `TypeError`。

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
- **出错**：
  - 第一个参数不是对象：`TypeError: setContentOffset needs an object with all of: x, y`
  - 缺少 `x` 或 `y`，或者它不是有限的数：`TypeError: setContentOffset is missing x, or it is not a finite number`

第一个参数也可以是普通对象 `{ x: 0, y: 500 }`。类型定义目前只接受 `CGPoint`，用普通对象时类型检查会报错。

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
- **出错**：
  - 第一个参数不是对象：`TypeError: scrollRectToVisible needs an object with all of: x, y, width, height`
  - 缺少字段，或者字段不是有限的数：`TypeError: scrollRectToVisible is missing width, or it is not a finite number`

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

期间不断派发 `scroll`。这个顺序是实测的。松手时内容已经停住的话，没有后两个事件（**未在模拟器验证**）。

事件都在事情发生之后派发，回调执行时滚动视图的状态已经是新的。比如 `dragend` 的回调里读 `isDecelerating`，得到的是「松手后是否还在滑」的实际结果。

监听表里没有的事件名会抛 `TypeError: addEventListener has no value "scrol"; expected one of: …`。

底色、圆角、隐藏等其他成员继承自 [`UIView`](ui-view.md)。

## 与 iOS 原生写法的对照

这张表供照着 Apple 的文档或 iOS 的示例代码写 JS 时查对应的写法。

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

## 与浏览器的对照

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
- [`UIView`](ui-view.md)：继承来的成员，`bounds`、`convertRect()`、底色、圆角都在那里
- [输入框和键盘](ui-text-field.md)：输入框和 `keyboardLayoutGuide`
- [运行时怎么工作](how-it-works.md)：JS 和界面的执行顺序
- [Auto Layout](auto-layout.md)：约束的写法
- [单位](units.md)：pt 和像素的关系
- [结构体](structs.md)：`CGPoint`、`CGSize`、`CGRect`、`UIEdgeInsets`
- [实现原理：滚动](../internals/scrolling.md)
