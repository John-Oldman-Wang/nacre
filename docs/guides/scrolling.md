# 做一个能滚动的页面

这一篇讲怎么用 [`UIScrollView`](../api/ui-scroll-view.md) 做一个能滚动的页面：搭骨架、查滚不动的原因、读滚动位置、用代码滚动、横向滚动、轮播、键盘。每个属性、方法和事件的细节在 [`UIScrollView`](../api/ui-scroll-view.md) 的参考页，内容区、可视区、偏移这三个概念见[三个基本概念](../api/ui-scroll-view.md#三个基本概念)。

## 推荐的做法

需要滚动的页面，推荐的结构是**滚动视图里放一个纵向的排列容器（[`UIStackView`](../api/ui-stack-view.md)），页面上的每一块内容是容器的一个排列项**。[完整例子](#第一个滚动页面)就是这个结构。

这样写的理由：

- 排列容器的高度由里面的内容决定，内容区的高度跟着它。加一块、删一块、隐藏一块，都不用改约束，也不用重算 `contentSize`。
- 容器的宽度等于可视区的宽度，所以只能上下滚动，换一台宽度不同的设备不用改代码。

滚动视图自己放在哪里有两种做法：

| 做法 | 结果 | 适用 |
| --- | --- | --- |
| 四条边和页面的根视图对齐 | 内容滚动时从刘海和底部横条的下面经过。系统自动在内容的上方和下方留白，见[安全区](../api/ui-scroll-view.md#安全区) | 一般的页面 |
| 四条边和安全区（`page.view.safeAreaLayoutGuide`）对齐 | 内容不会进入刘海和底部横条的区域。系统不加留白，最顶部的 `contentOffset.y` 是 `0` | 需要按 `contentOffset` 做计算、不想处理留白时 |

## 滚不动的三个常见原因

滚动视图不能滚动时，控制台没有任何输出。先在页面的根视图上调 `layoutIfNeeded()`，再读 `scroller.contentSize` 和 `scroller.bounds`，对照下面三种情况：

| `contentSize` 读出来 | 原因 | 改法 |
| --- | --- | --- |
| `(0, 0)`，并且里面什么都不显示 | 放内容的容器没有把 `translatesAutoresizingMaskIntoConstraints` 设成 `false` | 给容器补上这一行。见[内容不显示的常见原因](#内容不显示) |
| 某个方向是 `0`，或者不随内容变化 | 约束没有把内容区的大小确定下来。常见的是容器只和 `contentLayoutGuide` 对齐了上边和左右，漏了底边。**未在模拟器验证** | 容器的四条边都要和 `contentLayoutGuide` 对齐，容器里的内容要有确定的高度 |
| 不比 `bounds` 的宽高大 | 内容本来就没有超出可视区 | 这是正常的。想让它也能拉动一小段，见[内容很少时也能拉动](#内容很少时也能拉动) |

另外，`isScrollEnabled` 是 `false` 时用户也拖不动。

## 第一个滚动页面

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

四步分别是：创建滚动视图、创建放内容的容器、放内容、用约束说明大小。第 4 步里的「内容区」和「可视区」见[三个基本概念](../api/ui-scroll-view.md#三个基本概念)。

每一行文字没有写约束，位置和大小由排列容器安排。`column` 没有写高度，它的高度是 40 行文字的高度加 39 个间距，内容区的高度跟着它。

> **注意**：第 2 步里 `column.translatesAutoresizingMaskIntoConstraints = false` 这一行不能少。原因见[内容不显示的常见原因](#内容不显示)。

下面各节沿用 `scroller`、`column`、`page`、`content` 和 `frame` 这几个变量。单独试某一节时，先写这几行：

```js
const page = new UIViewController();
const scroller = new UIScrollView();
const column = new UIStackView();
column.axis = 'vertical';
scroller.addSubview(column);
page.view.addSubview(scroller);
const content = scroller.contentLayoutGuide;
const frame = scroller.frameLayoutGuide;
```

## 知道现在滚到了哪里

```js
scroller.addEventListener('scroll', () => {
  console.log(scroller.contentOffset.y);
});
```

**效果**：滚动期间不断输出一个数字。在最顶部时是 `0` 附近（有安全区时是负数，见[安全区](../api/ui-scroll-view.md#安全区)），越往下滚数字越大，单位是 [pt](../api/units.md)。

用户拖动、松手后的惯性滑动、代码写 `contentOffset`，都会派发 `scroll`。没有监听 `scroll` 时，滚动照常进行。

## 知道滚到了底部

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

减去 `adjustedContentInset.bottom` 是因为系统可能在内容的下方留了白（见[安全区](../api/ui-scroll-view.md#安全区)），留白不算内容。留一段提前量（这里是 100 pt）是为了在用户真正看到底部之前就开始加载。

没有「滚到底部」的事件，只能在 `scroll` 里自己判断。

## 用代码滚到某个位置

```js
scroller.setContentOffset(new CGPoint(0, 500), { animated: true });
```

**效果**：内容平滑地滚到向下 500 pt 的位置。动画结束时派发 `scrollanimationend` 事件。

不要动画，直接赋值：

```js
scroller.contentOffset = new CGPoint(0, 500);
```

**效果**：立刻跳到那个位置，没有过渡。

## 回到顶部

```js
const top = -scroller.adjustedContentInset.top;
scroller.setContentOffset(new CGPoint(0, top), { animated: true });
```

**效果**：平滑滚回最顶部。**未在模拟器验证。**

顶部的位置不一定是 `0`。有安全区时系统会在上方留白，顶部对应的是一个负数，所以要减去 `adjustedContentInset.top`。

## 让某个子视图滚进屏幕

```js
const target = column.arrangedSubviews[29];   // 第 30 行
// 把 target 的范围换算成相对于内容区左上角的位置
const rect = target.convertRect(target.bounds, { toView: scroller });
scroller.scrollRectToVisible(rect, { animated: true });
```

**效果**：滚动最短的距离，使第 30 行完整地出现在屏幕上。如果它已经完整可见，什么都不发生。**未在模拟器验证。**

`scrollRectToVisible()` 要的矩形是相对于内容区左上角的位置。`target` 是滚动视图的直接子视图时可以直接传 `target.frame`。这里 `target` 在排列容器里，所以用 `convertRect()` 换算。

## 改成横向滚动

把[完整例子](#第一个滚动页面)第 2 步的方向改成横向，第 4 步里容器的那五条约束换成下面这组：

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

## 一页一页地翻（轮播）

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

## 知道滚动什么时候开始和结束

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

## 禁止滚动

```js
scroller.isScrollEnabled = false;
```

**效果**：用户拖不动。用代码写 `contentOffset` 仍然有效。设回 `true` 恢复。

## 去掉到头之后的回弹

```js
scroller.bounces = false;
```

**效果**：滚到最顶或最底就停住，不能再往外拉。

## 内容很少时也能拉动

内容没有超出可视区时，默认拖不动。要让它也能拉动：

```js
scroller.alwaysBounceVertical = true;
```

**效果**：内容不足一屏时，上下也能拉一小段，松手弹回。**未在模拟器验证。**

## 隐藏滚动指示条

```js
scroller.showsVerticalScrollIndicator = false;
```

**效果**：滚动时右侧不再出现指示条。横向的对应属性是 `showsHorizontalScrollIndicator`。

## 在内容四周留白

```js
scroller.contentInset = new UIEdgeInsets(20, 0, 80, 0);   // 上、左、下、右
```

**效果**：内容顶部多出 20 pt 空白，底部多出 80 pt 空白，这些空白跟着内容一起滚动。底部有悬浮按钮时，用它保证最后一行不被挡住。**未在模拟器验证。**

四个字段都要写，也可以写成普通对象 `{ top: 20, left: 0, bottom: 80, right: 0 }`。少一个字段抛 `TypeError`。

内容放在排列容器里时，另一种做法是给排列容器设[内边距](../api/ui-stack-view.md)。两者的区别：`contentInset` 的留白不算进 `contentSize`，内边距算进去。

## 键盘弹出时不挡住输入框

把滚动视图的底边约束到页面的 `keyboardLayoutGuide` 的顶边。`keyboardLayoutGuide` 是系统提供的一个不显示的矩形：键盘收起时它的顶边在安全区的底边，键盘弹出时它的顶边在键盘的顶边。

把[完整例子](#第一个滚动页面)第 4 步里滚动视图底边的那一条换成：

```js
const keyboardTop = scroller.bottomAnchor.constraintEqualToAnchor(
  page.view.keyboardLayoutGuide.topAnchor);
keyboardTop.isActive = true;

// 输入框获得焦点时，把它滚进可视区
const field = new UITextField();
field.placeholder = '备注';
column.addArrangedSubview(field);
field.addEventListener('focus', () => {
  const rect = field.convertRect(field.bounds, { toView: scroller });
  scroller.scrollRectToVisible(rect, { animated: true });
});
```

**效果**：键盘弹出时，滚动视图的可视区缩小到键盘上方，键盘下面没有内容。输入框获得焦点时滚动到可视区内。键盘收起时可视区恢复。不需要监听键盘事件，也不需要计算键盘的高度。

「视图的底边约束到 `keyboardLayoutGuide` 的顶边」这种写法在验收用例里断言过键盘收起时的位置。键盘弹出时的效果和滚进可视区的效果**未在模拟器验证**。

`keyboardLayoutGuide` 的说明见 [Auto Layout](../api/ui-keyboard-layout-guide.md)，输入框见[做一个输入框](text-fields.md)。

## 拖动列表时收起键盘

页面上有输入框时，键盘弹出后会一直留在屏幕上，直到有代码把它收起。把滚动视图的 `keyboardDismissMode` 设成 `'onDrag'`，用户一拖动内容，键盘就收起，不用写任何事件监听。

沿用[完整例子](#第一个滚动页面)里的 `scroller` 和 `column`：

```js
const field = new UITextField();
field.placeholder = '搜索';
field.borderStyle = 'roundedRect';
column.insertArrangedSubview(field, { atIndex: 0 });

scroller.keyboardDismissMode = 'onDrag';
```

**效果**：点输入框，键盘弹出。手指在滚动视图上一开始拖动，键盘收起，输入框结束输入并派发 `blur`。**未在模拟器验证**；验收用例验证的是这个属性在滚动视图上能写入并读回。

这个属性收的是当前弹出的键盘，不管正在输入的输入框是不是滚动视图的子视图。

想让键盘跟着手指一点点滑下去（聊天页面常见的效果），用 `'interactive'`。全部取值见[键盘](../api/ui-scroll-view/keyboarddismissmode.md)。收起键盘的其他办法见[输入框和键盘](text-fields.md#收起键盘)。

## 不用约束，直接指定内容大小

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

## 内容不显示

**现象**：滚动视图里什么都没有，`contentSize` 读出来是 `(0, 0)`，控制台没有任何报错。

**原因**：放内容的容器没有设 `translatesAutoresizingMaskIntoConstraints = false`。

这个属性默认是 `true`，意思是「按 `frame` 定位这个视图」。容器的 `frame` 默认是 0 × 0，于是系统把它固定成 0 大小，内容区跟着变成 0。用约束定位的视图都要把它设成 `false`。

`addArrangedSubview()` 会自动替放进去的子视图设好，但不会替容器自己设。滚动视图自己用约束定位时，也要设这一行。

这个现象在模拟器里实测过：系统不输出任何信息。


## 参见

- [`UIScrollView`](../api/ui-scroll-view.md)：全部属性、方法和事件
- [`UIStackView`](../api/ui-stack-view.md)：放内容的容器
- [`UIKeyboardLayoutGuide`](../api/ui-keyboard-layout-guide.md)：键盘所占的区域
- [做一个输入框](text-fields.md)：输入框和键盘
- [`UICollectionView`](../api/ui-collection-view.md)：数据量很大的列表
