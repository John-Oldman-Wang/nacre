# 用约束排版

这一篇讲怎么用约束（Auto Layout）摆放视图：固定宽高、居中、贴边、避开刘海、上下排列、等宽、比例、最小最大尺寸、展开收起、占位、跟随键盘，以及约束写错时怎么查。约束、锚点、layout guide 各自的细节在 [`NSLayoutConstraint`](../api/auto-layout.md)、[`NSLayoutAnchor`](../api/ns-layout-anchor.md)、[`UILayoutGuide`](../api/ui-layout-guide.md) 的参考页。

## 推荐的做法

- **排成一行或一列，用 [`UIStackView`](../api/ui-stack-view.md)，不手写约束。** 它替子视图建立约束，隐藏一项时其余项自动重新排列。手写约束用在它表达不了的地方：把最外层的容器放到页面上、居中、宽高比、两个不相邻的视图对齐。
- **一组约束用 `NSLayoutConstraint.activateConstraints([…])` 一次激活。** 逐条激活时，前几条已经生效、后几条还没生效，中间会经过约束不完整的状态。
- **要改布局，改约束的 `constant`，不要停用旧约束再建新约束。** 把约束对象保存在变量里，之后直接赋值：`cardHeight.constant = 84`。约束创建之后只有 `constant` 这一个数值能改；要改倍数、关系或者连接的锚点时，才需要[换一条约束](#停用和替换约束)。
- **和安全区对齐，不和页面的根视图对齐。** 安全区是视图里不会被刘海、状态栏、屏幕圆角和底部横条遮挡的区域，用 `view.safeAreaLayoutGuide` 取得。
- **给之后要检查的约束起名字**（`identifier`）。约束出错时没有任何输出，只能自己列出约束来核对，有名字才认得出哪条是哪条。

## 第一个例子

下面的代码从空白 App 开始，在屏幕底部放一张卡片，卡片里横排三个色块。左右两块宽度固定，中间一块占满剩下的宽度。

```
safe 的左边                                          safe 的右边
│                                                    │
│<16>┌───────────────── card ─────────────────┐<16>│
│    │<8>┌──────┐<8>┌────────────┐<8>┌──────┐<8>│    │
│    │   │ left │   │   middle   │   │ right│   │    │  card 高 60
│    │   │  60  │   │    auto    │   │  60  │   │    │  三块上下各留 8
│    │   └──────┘   └────────────┘   └──────┘   │    │
│    └──────────────────────────────────────────┘    │
│                        24                          │
└──────────────────── safe 的底边 ────────────────────┘
```

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 取安全区的 layout guide。卡片对齐到它，就不会被刘海和底部横条遮挡
  const safe = page.view.safeAreaLayoutGuide;

  // 2. 创建卡片。用约束定位的视图都要先关掉这个属性
  const card = new UIView();
  card.translatesAutoresizingMaskIntoConstraints = false;
  card.backgroundColor = 'secondarySystemBackground';
  page.view.addSubview(card);

  // 3. 创建三个色块，放进卡片
  const left = new UIView();
  const middle = new UIView();
  const right = new UIView();
  const colors = ['systemRed', 'systemOrange', 'systemBlue'];
  [left, middle, right].forEach((v, i) => {
    v.translatesAutoresizingMaskIntoConstraints = false;
    v.backgroundColor = colors[i];
    card.addSubview(v);
  });

  // 4. 写约束。这一步只是创建，还没有生效
  const cardHeight = card.heightAnchor.constraintEqualToConstant(60);
  const constraints = [
    // 卡片：左右各离安全区 16，底边离安全区底边 24，高 60
    card.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
    card.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
    card.bottomAnchor.constraintEqualToAnchor(safe.bottomAnchor, { constant: -24 }),
    cardHeight,
    // 左块：离卡片左边 8，宽 60
    left.leadingAnchor.constraintEqualToAnchor(card.leadingAnchor, { constant: 8 }),
    left.widthAnchor.constraintEqualToConstant(60),
    // 中间块：左边离左块 8。没有写宽度
    middle.leadingAnchor.constraintEqualToAnchor(left.trailingAnchor, { constant: 8 }),
    // 右块：左边离中间块 8，右边离卡片右边 8，宽 60
    right.leadingAnchor.constraintEqualToAnchor(middle.trailingAnchor, { constant: 8 }),
    right.trailingAnchor.constraintEqualToAnchor(card.trailingAnchor, { constant: -8 }),
    right.widthAnchor.constraintEqualToConstant(60),
  ];
  // 三块的上下边都离卡片 8
  for (const v of [left, middle, right]) {
    constraints.push(v.topAnchor.constraintEqualToAnchor(card.topAnchor, { constant: 8 }));
    constraints.push(v.bottomAnchor.constraintEqualToAnchor(card.bottomAnchor, { constant: -8 }));
  }

  // 5. 一次激活全部约束
  NSLayoutConstraint.activateConstraints(constraints);

  // 6. 立刻完成布局，这样下面读到的 frame 就是约束算出的结果
  page.view.layoutIfNeeded();
  console.log(card.frame.width, card.frame.height);
  console.log(left.frame.width, middle.frame.width, right.frame.width);
});
```

**效果**

- 屏幕底部出现一张浅灰色的卡片，卡片里从左到右是红、橙、蓝三个色块。
- 卡片的宽度是安全区的宽度减 32 pt，高 60 pt。
- 左块和右块宽 60 pt。中间块的宽度是卡片宽度减 152 pt（两个 60 加四个 8）。
- 三个色块高 44 pt（60 减上下两个 8）。
- 控制台输出两行数字，就是上面这些值。

这个例子的布局和验收用例相同，上面的尺寸都在模拟器里断言过。验收用例里颜色用的是 `UIColor` 对象，这里换成了字符串。

这个例子里有约束的几个要点：

- 约束从**锚点**上创建：`card.leadingAnchor.constraintEqualToAnchor(…)`。
- 往右、往下的偏移是正数。卡片的右边在安全区右边的**左侧** 16 pt，所以是 `-16`。
- 中间块没有写宽度。它的左边和右边分别被左块和右块确定，宽度由此算出。
- 约束创建之后要**激活**才生效。

## 视图不显示或位置不对

约束写错时**系统不输出任何信息**（实测：标准输出、标准错误、系统日志都没有内容），App 也不会崩溃。视图只是不出现，或者出现在意外的位置。最常见的原因有三个：

| 原因 | 表现 | 怎么确认 |
| --- | --- | --- |
| 没有把 `translatesAutoresizingMaskIntoConstraints` 设成 `false` | 约束都写了，视图的位置和大小不变。新建的视图大小是 0，所以看不到 | 读这个属性，是 `true` 就是漏了 |
| 约束没有激活 | 和没写这些约束一样 | 读约束的 `isActive`，是 `false` 就是没激活 |
| 约束不够，某个量没有被确定 | 视图的宽或高是 0，或者位置不对 | 先调 `layoutIfNeeded()`，再读 `view.hasAmbiguousLayout`，是 `true` 就是不够 |

另外两种写错的情况有明确的报错：

- 约束两端的视图不在同一棵视图树里（比如其中一个还没有 `addSubview()`），激活时抛 `TypeError`。所以要先把视图加进视图树，再激活约束。
- 把垂直方向的锚点和水平方向的锚点连在一起，创建时抛 `TypeError`。

几条必须满足的约束互相矛盾时（同一个视图既写「宽 = 100」又写「宽 = 200」），系统放弃其中一条，同样没有任何输出。检查的方法见[查约束够不够](#查约束够不够)。

## 准备：一个建视图的函数

以下各节沿用第一个例子里的 `page`、`safe`、`card`、`left`、`middle`、`right`、`cardHeight`。需要新视图的例子用 `addBox()` 创建：它建一个带底色的视图，关掉 `translatesAutoresizingMaskIntoConstraints`，加到页面的根视图上。单独试某一节时，先写这几行：

```js
const page = new UIViewController();
const safe = page.view.safeAreaLayoutGuide;
const card = new UIView();
card.translatesAutoresizingMaskIntoConstraints = false;
page.view.addSubview(card);
const left = new UIView();
const middle = new UIView();
const right = new UIView();
for (const v of [left, middle, right]) {
  v.translatesAutoresizingMaskIntoConstraints = false;
  card.addSubview(v);
}
const cardHeight = card.heightAnchor.constraintEqualToConstant(60);
cardHeight.isActive = true;

/** @param {string} color */
function addBox(color) {
  const v = new UIView();
  v.translatesAutoresizingMaskIntoConstraints = false;
  v.backgroundColor = color;
  page.view.addSubview(v);
  return v;
}
```

**效果**：`addBox()` 调用一次，页面的根视图多一个子视图。它还没有约束，所以没有位置和大小，屏幕上看不到（**未在模拟器验证**）。

## 固定宽高

```js
const box = addBox('systemGreen');
NSLayoutConstraint.activateConstraints([
  box.widthAnchor.constraintEqualToConstant(120),
  box.heightAnchor.constraintEqualToConstant(80),
]);
```

**效果**：`box` 宽 120 pt、高 80 pt。

这两条只确定了大小。位置还要另外两条约束确定，见下面几节。

## 居中

```js
const centerBox = addBox('systemGreen');
NSLayoutConstraint.activateConstraints([
  centerBox.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
  centerBox.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
  centerBox.widthAnchor.constraintEqualToConstant(120),
  centerBox.heightAnchor.constraintEqualToConstant(80),
]);
```

**效果**：一个 120 × 80 pt 的绿色矩形，在页面正中。**未在模拟器验证。**

```
┌─────────────────────┐
│          ┆          │
│       ┌──┆──┐       │
│┄┄┄┄┄┄┄│┄┄┼┄┄│┄┄┄┄┄┄┄│   centerBox.centerX = 页面.centerX
│       └──┆──┘       │   centerBox.centerY = 页面.centerY
│          ┆          │
└─────────────────────┘
```

只在水平方向居中时，只写 `centerXAnchor` 那一条，垂直方向用别的约束确定。

## 贴边并留边距

```js
const topBar = addBox('systemGreen');
NSLayoutConstraint.activateConstraints([
  topBar.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 12 }),
  topBar.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
  topBar.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
  topBar.heightAnchor.constraintEqualToConstant(44),
]);
```

**效果**：`topBar` 在安全区顶部，离顶边 12 pt，左右各离安全区 16 pt，高 44 pt。宽度由左右两条约束算出，屏幕变宽时它跟着变宽。左右边距和固定高度的写法在验收用例里断言过，对齐顶边的那一条**未在模拟器验证**。

`constant` 的正负按坐标方向定：向右、向下是正。`topBar` 的右边在安全区右边的左侧，所以是负数。

## 铺满父视图

四条边都和父视图对齐。

```js
const overlay = addBox('systemGreen');
NSLayoutConstraint.activateConstraints([
  overlay.topAnchor.constraintEqualToAnchor(page.view.topAnchor),
  overlay.bottomAnchor.constraintEqualToAnchor(page.view.bottomAnchor),
  overlay.leadingAnchor.constraintEqualToAnchor(page.view.leadingAnchor),
  overlay.trailingAnchor.constraintEqualToAnchor(page.view.trailingAnchor),
]);
```

**效果**：`overlay` 和页面的根视图一样大，包括刘海和底部横条所在的区域。**未在模拟器验证。**

不需要再写宽高。左右两条边确定了 x 和宽度，上下两条边确定了 y 和高度。

## 避开刘海和底部横条

安全区是视图里不会被刘海、状态栏、屏幕圆角和底部横条遮挡的区域。和 `safe` 的锚点对齐，不和 `page.view` 的锚点对齐。

```js
const content = addBox('systemGreen');
NSLayoutConstraint.activateConstraints([
  content.topAnchor.constraintEqualToAnchor(safe.topAnchor),
  content.bottomAnchor.constraintEqualToAnchor(safe.bottomAnchor),
  content.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor),
  content.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor),
]);
```

**效果**：`content` 正好占满安全区。它的上边在状态栏和刘海下方，下边在底部横条上方。**未在模拟器验证。**

通常的做法是：底色铺满整个页面，文字和按钮放在安全区内。

## 一个视图在另一个下面，隔 N pt

把下面那个视图的 `topAnchor` 约束到上面那个视图的 `bottomAnchor`。

```js
const first = addBox('systemRed');
const second = addBox('systemBlue');
NSLayoutConstraint.activateConstraints([
  first.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 12 }),
  first.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
  first.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
  first.heightAnchor.constraintEqualToConstant(44),

  // second 的上边 = first 的下边 + 8
  second.topAnchor.constraintEqualToAnchor(first.bottomAnchor, { constant: 8 }),
  second.leadingAnchor.constraintEqualToAnchor(first.leadingAnchor),
  second.trailingAnchor.constraintEqualToAnchor(first.trailingAnchor),
  second.heightAnchor.constraintEqualToConstant(44),
]);
```

**效果**：红色块在上，蓝色块在它下方 8 pt 处，两块左右对齐、一样宽。**未在模拟器验证。**

```
┌──────────────────┐
│      first       │
└──────────────────┘
         ↕ 8          second.top = first.bottom + 8
┌──────────────────┐
│      second      │
└──────────────────┘
```

之后改 `first` 的高度，`second` 自动跟着移动。相邻视图之间这样一条接一条地写。很多个视图排成一列时，用 [`UIStackView`](../api/ui-stack-view.md) 更省事。

## 两个视图等宽

把一个视图的 `widthAnchor` 约束到另一个的 `widthAnchor`。两个视图不需要相邻，也不需要有同一个父视图，只要在同一个窗口的视图树里。

```js
const a = addBox('systemRed');
const b = addBox('systemBlue');
NSLayoutConstraint.activateConstraints([
  a.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
  b.leadingAnchor.constraintEqualToAnchor(a.trailingAnchor, { constant: 8 }),
  b.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
  // b 的宽 = a 的宽
  b.widthAnchor.constraintEqualToAnchor(a.widthAnchor),

  a.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 12 }),
  b.topAnchor.constraintEqualToAnchor(a.topAnchor),
  a.heightAnchor.constraintEqualToConstant(44),
  b.heightAnchor.constraintEqualToAnchor(a.heightAnchor),
]);
```

**效果**：两个色块并排，中间隔 8 pt，平分剩下的宽度。**未在模拟器验证。**

没有人写过具体的宽度。系统从「两块等宽」「左右边距 16」「间隔 8」这几条关系里算出来。

## 宽度是父视图的一半

尺寸锚点之间的约束可以带 `multiplier`（倍数）。

```js
const half = addBox('systemGreen');
NSLayoutConstraint.activateConstraints([
  // half 的宽 = 页面的宽 × 0.5
  half.widthAnchor.constraintEqualToAnchor(page.view.widthAnchor, { multiplier: 0.5 }),
  half.heightAnchor.constraintEqualToConstant(44),
  half.leadingAnchor.constraintEqualToAnchor(page.view.leadingAnchor),
  half.topAnchor.constraintEqualToAnchor(safe.topAnchor),
]);
```

**效果**：`half` 的宽度始终是页面宽度的一半。**未在模拟器验证。**

`multiplier` 和 `constant` 可以同时用：`{ multiplier: 0.5, constant: -8 }` 表示「一半再减 8 pt」。

`multiplier` 只有尺寸锚点（`widthAnchor`、`heightAnchor`）能用。类型定义里，边和中心线的锚点不接受这个选项。

## 保持宽高比

把同一个视图的 `heightAnchor` 约束到它自己的 `widthAnchor`。

```js
const cover = addBox('systemGreen');
NSLayoutConstraint.activateConstraints([
  cover.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
  cover.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
  cover.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 12 }),
  // 高 = 宽 × 9/16
  cover.heightAnchor.constraintEqualToAnchor(cover.widthAnchor, { multiplier: 9 / 16 }),
]);
```

**效果**：`cover` 的宽度跟着屏幕变，高度始终是宽度的 9/16。**未在模拟器验证。**

## 限制最小和最大尺寸

约束可以是不等式。把方法名里的 `Equal` 换成 `GreaterThanOrEqual`（≥）或 `LessThanOrEqual`（≤）。

```js
const bubble = addBox('systemGreen');
const preferred = bubble.widthAnchor.constraintEqualToAnchor(
  page.view.widthAnchor, { multiplier: 0.5 });
preferred.priority = 'defaultHigh';   // 这一条可以被下面两条覆盖

NSLayoutConstraint.activateConstraints([
  preferred,
  bubble.widthAnchor.constraintGreaterThanOrEqualToConstant(100),   // 最窄 100
  bubble.widthAnchor.constraintLessThanOrEqualToConstant(300),      // 最宽 300
  bubble.heightAnchor.constraintEqualToConstant(44),
  bubble.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
  bubble.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 12 }),
]);
```

**效果**：`bubble` 的宽度是页面宽度的一半，但不小于 100 pt，不大于 300 pt。**未在模拟器验证。**

「一半」那一条的优先级调低了。页面宽度的一半超过 300 时，它和「最宽 300」矛盾，系统保留优先级高的那条。优先级的规则见 [`priority`](../api/auto-layout/priority.md)。

不等式约束也能用在边上。`a.leadingAnchor.constraintGreaterThanOrEqualToAnchor(b.trailingAnchor, { constant: 8 })` 表示「`a` 至少在 `b` 右边 8 pt」。

## 之后修改约束的常数（展开和收起）

要改一个已经在屏幕上的布局（展开、收起、移动），推荐改约束的 `constant`。创建约束时把它保存在变量里，之后直接赋值。

```js
cardHeight.constant = 84;
page.view.layoutIfNeeded();
console.log(card.frame.height);   // 84
```

**效果**：卡片的高度从 60 pt 变成 84 pt。因为卡片的底边是固定的，所以它向上变高。卡片里三个色块的高度跟着变成 68 pt。

改 `constant` 之后，系统在下一次布局时重算。调 `layoutIfNeeded()` 是为了立刻重算，这样下一行读到的 `frame` 就是新值。不需要立刻读 `frame` 时可以不调。

变化是立刻完成的，没有过渡动画。

改 `constant` 时约束对象不变，其余约束也不受影响。另一种做法是停用旧约束、再建一条新约束并激活，它要多创建一个约束对象，旧约束还要另外停用。只有 `constant` 表达不了的修改才用那种做法：约束创建之后只有 `constant` 这一个数值能改，要改倍数、改关系、改连接的锚点，只能[换一条约束](#停用和替换约束)。

`constant` 接受能转成数的值，`'84'` 和 `84` 效果相同。转不成有限数的值（`undefined`、`'abc'`、`NaN`）抛 `TypeError: constant must be a finite number, got undefined`，末尾是收到的值。

## 停用和替换约束

停用一条约束，再激活另一条。

```js
// 高度从固定的 60 换成页面高度的四分之一
const tall = card.heightAnchor.constraintEqualToAnchor(
  page.view.heightAnchor, { multiplier: 0.25 });

NSLayoutConstraint.deactivateConstraints([cardHeight]);
NSLayoutConstraint.activateConstraints([tall]);
page.view.layoutIfNeeded();
```

**效果**：卡片的高度变成页面高度的四分之一。`cardHeight.isActive` 变成 `false`。停用后 `isActive` 变成 `false` 在验收用例里断言过，换上倍数约束之后的高度**未在模拟器验证**。

停用的约束对象还在，之后可以再激活：`cardHeight.isActive = true`。

> **注意**：只停用、不补上新约束，这个量就没有约束确定了。实测：只停用 `cardHeight` 之后，卡片的高度变成 16 pt（上下两个 8 pt 的边距），三个色块的高度变成 0。系统不报错。

## 一个视图按内容大小，另一个占满剩余空间

两个文字标签并排，左边的标题占满剩余宽度，右边的数值只占文字需要的宽度。

```js
const row = addBox('secondarySystemBackground');
const title = new UILabel();
const value = new UILabel();
title.text = '余额';
value.text = '1,024.00';
for (const label of [title, value]) {
  label.translatesAutoresizingMaskIntoConstraints = false;
  row.addSubview(label);
}

// value 更不愿意被拉宽，所以多出来的宽度都给 title
value.setContentHuggingPriority('defaultHigh', { forAxis: 'horizontal' });
// value 更不愿意被压窄，所以空间不够时先压 title
value.setContentCompressionResistancePriority('required', { forAxis: 'horizontal' });

NSLayoutConstraint.activateConstraints([
  row.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 12 }),
  row.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
  row.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
  row.heightAnchor.constraintEqualToConstant(44),

  title.leadingAnchor.constraintEqualToAnchor(row.leadingAnchor, { constant: 12 }),
  value.leadingAnchor.constraintEqualToAnchor(title.trailingAnchor, { constant: 8 }),
  value.trailingAnchor.constraintEqualToAnchor(row.trailingAnchor, { constant: -12 }),
  title.centerYAnchor.constraintEqualToAnchor(row.centerYAnchor),
  value.centerYAnchor.constraintEqualToAnchor(row.centerYAnchor),
]);
```

**效果**：「1,024.00」靠右，宽度正好是文字的宽度。「余额」的标签从左边一直延伸到数值左侧 8 pt 处。标题文字很长时，被截断的是标题，数值完整显示。**未在模拟器验证。**

两个标签都没有写宽度约束。它们的宽度来自文字本身，见[固有尺寸](../api/auto-layout.md#固有尺寸)。两个优先级的含义见[内容抱紧和抗压缩](../api/auto-layout.md#内容抱紧和抗压缩)。

视图没有固有尺寸时不需要这两个优先级。完整例子里的 `middle` 是普通 `UIView`，不写宽度约束就自动占满剩余空间。

## 用不显示的矩形占位

需要一个只参与布局、不显示的矩形时，建一个 `UILayoutGuide`，不要建透明的 `UIView`。`UILayoutGuide` 不进入视图树，不接收触摸。

```js
const spacer = new UILayoutGuide();
spacer.identifier = 'spacer';
card.addLayoutGuide(spacer);

NSLayoutConstraint.activateConstraints([
  spacer.leadingAnchor.constraintEqualToAnchor(left.trailingAnchor),
  spacer.trailingAnchor.constraintEqualToAnchor(middle.leadingAnchor),
  spacer.topAnchor.constraintEqualToAnchor(card.topAnchor),
  spacer.heightAnchor.constraintEqualToConstant(4),
]);
page.view.layoutIfNeeded();
console.log(spacer.layoutFrame.width, spacer.layoutFrame.height);   // 8 4
```

**效果**：屏幕上没有变化。`spacer` 占据 `left` 和 `middle` 之间那 8 pt 的间隔，`layoutFrame` 读出来宽 8 pt、高 4 pt。

别的视图可以和 `spacer` 的锚点对齐，写法和对齐到视图一样。详见 [`UILayoutGuide`](../api/ui-layout-guide.md)。

## 跟随键盘

每个视图有一个 `keyboardLayoutGuide`。键盘收起时，它的上边在安全区的底边。键盘弹出时，它的上边在键盘的顶边。把内容的底边约束到它的 `topAnchor`。

```js
const bar = addBox('systemGreen');
NSLayoutConstraint.activateConstraints([
  bar.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
  bar.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
  bar.heightAnchor.constraintEqualToConstant(44),
  bar.bottomAnchor.constraintEqualToAnchor(
    page.view.keyboardLayoutGuide.topAnchor, { constant: -16 }),
]);
```

**效果**：没有键盘时，`bar` 在安全区底边上方 16 pt。页面上的输入框获得焦点、键盘弹出时，`bar` 跟着键盘一起上移，停在键盘上方 16 pt。键盘收起时它回到原位。键盘弹出时的位置**未在模拟器验证**。

不需要监听键盘事件，也不需要计算键盘的高度。键盘收起时这条约束的结果在验收用例里断言过：`bar` 的底边在安全区底边上方 16 pt。输入框的用法见[输入框和键盘](../api/ui-text-field.md)。

## 读出约束算出来的位置

```js
page.view.layoutIfNeeded();
console.log(card.frame.x, card.frame.y, card.frame.width, card.frame.height);
```

**效果**：控制台输出卡片在页面根视图里的位置和大小，单位 pt。

激活约束之后不调 `layoutIfNeeded()` 就读 `frame`，读到的是上一次布局的结果。原因见[约束什么时候算出结果](../api/auto-layout.md#约束什么时候算出结果)。

## 查约束够不够

视图不显示或位置不对时，先查约束是不是没写够。

```js
page.view.layoutIfNeeded();
console.log(card.hasAmbiguousLayout);   // false

cardHeight.identifier = 'card-height';
for (const c of card.constraintsAffectingLayoutForAxis('vertical')) {
  console.log(c.identifier, c.firstAttribute, c.relation, c.constant, c.priority);
}
```

**效果**

- 第一行输出 `false`，表示卡片的位置和大小都被约束唯一确定了。
- 之后每行输出一条在垂直方向上影响卡片的约束。其中一行以 `card-height height equal 60 1000` 开头的就是高度约束。循环输出的具体内容**未在模拟器验证**。

`hasAmbiguousLayout` 为 `true` 时，这个视图的约束不够。给约束起 `identifier`，输出时就能认出哪条是哪条。三个检查手段见 [`hasAmbiguousLayout`](../api/ui-view/hasambiguouslayout.md)、[`exerciseAmbiguityInLayout()`](../api/ui-view/exerciseambiguityinlayout.md)、[`constraintsAffectingLayoutForAxis()`](../api/ui-view/constraintsaffectinglayoutforaxis.md)。

## 带动画地改约束

改约束本身不带动画。要动画，改完约束之后在 [`UIView.animateWithDuration()`](../api/ui-view/animatewithduration.md) 的 `animations` 里调 `layoutIfNeeded()`，见[让视图动起来](view-animations.md#带动画地改约束)。

## 参见

- [`NSLayoutConstraint`](../api/auto-layout.md)：约束，以及约束是一个等式、优先级、固有尺寸这些概念
- [`NSLayoutAnchor`](../api/ns-layout-anchor.md)、[`NSLayoutXAxisAnchor`](../api/ns-layout-x-axis-anchor.md)、[`NSLayoutYAxisAnchor`](../api/ns-layout-y-axis-anchor.md)、[`NSLayoutDimension`](../api/ns-layout-dimension.md)：创建约束的方法
- [`UILayoutGuide`](../api/ui-layout-guide.md)、[`UIKeyboardLayoutGuide`](../api/ui-keyboard-layout-guide.md)：不显示的矩形和键盘
- [`UIView`](../api/ui-view.md)：视图上和约束有关的成员
- [把视图排成一行或一列](stack-views.md)：不用手写约束

