---
type: reference
native: NSLayoutConstraint
status: partial
---

# Auto Layout

Auto Layout 是 iOS 的布局系统。你不直接写每个视图的位置和大小，而是写一组**约束**：视图的边和边之间、尺寸和尺寸之间的关系。系统按这些关系算出每个视图的 `frame`，并在屏幕尺寸变化时重算。

它在 Web 里最接近的是 CSS 布局，有四点不同：

- **没有文档流。** CSS 里元素不写任何规则也会按顺序排下去。这里一个视图不写约束就没有位置。每个视图的 x、y、宽、高四个量都要能从约束里算出来。
- **规则写在关系上，不写在元素上。** CSS 是每个元素声明自己的 `margin`、`width`。约束是一个独立的对象，连接两个视图：「A 的左边 = B 的右边 + 8」。
- **没有 `display: flex`、`grid` 这类布局模式。** 排成一行、等宽、占满剩余空间，都用约束表达。只想排成一行或一列时，用 [`UIStackView`](ui-stack-view.md)，它替你生成约束。
- **约束出错时系统不报任何信息。** 约束不够或互相矛盾时，控制台没有输出，要自己[检查](#排版调试)。

这一页涉及四种对象：

| 对象 | 是什么 |
| --- | --- |
| `NSLayoutConstraint` | 一条约束 |
| 锚点（`NSLayoutXAxisAnchor`、`NSLayoutYAxisAnchor`、`NSLayoutDimension`） | 视图上可以被约束引用的边、中心线、宽、高 |
| `UILayoutGuide` | 不显示的矩形，只用来对齐 |
| [`UIView`](ui-view.md) | 上面和约束有关的属性和方法 |

所有长度的单位都是 [pt](units.md)。

这一页分四部分：先给一个[能直接运行的完整例子](#完整例子)，再按[你想做的事](#常见用法)给出写法和效果，然后解释[必须理解的概念](#概念)，最后是[每个成员的说明](#成员说明)。第一次接触 Auto Layout 的话，看完完整例子后先读[概念](#概念)。

## 完整例子

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

例子里出现了这一页的全部要点：

- 约束从**锚点**上创建：`card.leadingAnchor.constraintEqualToAnchor(…)`。
- 往右、往下的偏移是正数。卡片的右边在安全区右边的**左侧** 16 pt，所以是 `-16`。
- 中间块没有写宽度。它的左边和右边分别被左块和右块确定，宽度由此算出。
- 约束创建之后要**激活**才生效。

## 常见用法

以下例子沿用完整例子里的 `page`、`safe`、`card`、`left`、`middle`、`right`、`cardHeight`。

需要新视图的例子用下面这个函数创建。它建一个带底色的视图，关掉 `translatesAutoresizingMaskIntoConstraints`，加到页面的根视图上：

```js
/** @param {string} color */
function addBox(color) {
  const v = new UIView();
  v.translatesAutoresizingMaskIntoConstraints = false;
  v.backgroundColor = color;
  page.view.addSubview(v);
  return v;
}
```

**效果**：调用一次，页面上多一个视图。它还没有约束，所以没有位置和大小，屏幕上看不到。

### 固定宽高

```js
const box = addBox('systemGreen');
NSLayoutConstraint.activateConstraints([
  box.widthAnchor.constraintEqualToConstant(120),
  box.heightAnchor.constraintEqualToConstant(80),
]);
```

**效果**：`box` 宽 120 pt、高 80 pt。

这两条只确定了大小。位置还要另外两条约束确定，见下面几节。

### 居中

```js
const box = addBox('systemGreen');
NSLayoutConstraint.activateConstraints([
  box.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
  box.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
  box.widthAnchor.constraintEqualToConstant(120),
  box.heightAnchor.constraintEqualToConstant(80),
]);
```

**效果**：一个 120 × 80 pt 的绿色矩形，在页面正中。**未在模拟器验证。**

```
┌─────────────────────┐
│          ┆          │
│       ┌──┆──┐       │
│┄┄┄┄┄┄┄│┄┄┼┄┄│┄┄┄┄┄┄┄│   box.centerX = 页面.centerX
│       └──┆──┘       │   box.centerY = 页面.centerY
│          ┆          │
└─────────────────────┘
```

只在水平方向居中时，只写 `centerXAnchor` 那一条，垂直方向用别的约束确定。

### 贴边并留边距

```js
const box = addBox('systemGreen');
NSLayoutConstraint.activateConstraints([
  box.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 12 }),
  box.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
  box.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
  box.heightAnchor.constraintEqualToConstant(44),
]);
```

**效果**：`box` 在安全区顶部，离顶边 12 pt，左右各离安全区 16 pt，高 44 pt。宽度由左右两条约束算出，屏幕变宽时它跟着变宽。左右边距和固定高度的写法在验收用例里断言过，对齐顶边的那一条**未在模拟器验证**。

`constant` 的正负按坐标方向定：向右、向下是正。`box` 的右边在安全区右边的左侧，所以是负数。

### 铺满父视图

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

### 避开刘海和底部横条

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

### 一个视图在另一个下面，隔 N pt

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

之后改 `first` 的高度，`second` 自动跟着移动。相邻视图之间这样一条接一条地写。很多个视图排成一列时，用 [`UIStackView`](ui-stack-view.md) 更省事。

### 两个视图等宽

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

### 宽度是父视图的一半

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

### 保持宽高比

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

**效果**：`cover` 的宽度跟着屏幕变，高度始终是宽度的 9/16。相当于 CSS 的 `aspect-ratio: 16 / 9`。**未在模拟器验证。**

### 限制最小和最大尺寸

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

**效果**：`bubble` 的宽度是页面宽度的一半，但不小于 100 pt，不大于 300 pt。相当于 CSS 的 `width: 50%; min-width: 100px; max-width: 300px`。**未在模拟器验证。**

「一半」那一条的优先级调低了。页面宽度的一半超过 300 时，它和「最宽 300」矛盾，系统保留优先级高的那条。优先级的规则见[优先级](#优先级)。

不等式约束也能用在边上。`a.leadingAnchor.constraintGreaterThanOrEqualToAnchor(b.trailingAnchor, { constant: 8 })` 表示「`a` 至少在 `b` 右边 8 pt」。

### 之后修改约束的常数（展开和收起）

把约束对象留在变量里，之后改它的 `constant`。

```js
cardHeight.constant = 84;
page.view.layoutIfNeeded();
console.log(card.frame.height);   // 84
```

**效果**：卡片的高度从 60 pt 变成 84 pt。因为卡片的底边是固定的，所以它向上变高。卡片里三个色块的高度跟着变成 68 pt。

改 `constant` 之后，系统在下一次布局时重算。调 `layoutIfNeeded()` 是为了立刻重算，这样下一行读到的 `frame` 就是新值。不需要立刻读 `frame` 时可以不调。

变化是立刻完成的，没有过渡动画。

约束创建之后只有 `constant` 这一个数值能改。要改倍数、改关系、改连接的锚点，只能[换一条约束](#停用和替换约束)。

### 停用和替换约束

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

### 一个视图按内容大小，另一个占满剩余空间

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

两个标签都没有写宽度约束。它们的宽度来自文字本身，见[固有尺寸](#固有尺寸)。两个优先级的含义见[内容抱紧和抗压缩](#内容抱紧和抗压缩)。

视图没有固有尺寸时不需要这两个优先级。完整例子里的 `middle` 是普通 `UIView`，不写宽度约束就自动占满剩余空间。

### 用不显示的矩形占位

需要一个只参与布局、不显示的东西时，建一个 `UILayoutGuide`，不要建透明的 `UIView`。

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

别的视图可以和 `spacer` 的锚点对齐，写法和对齐到视图一样。详见 [layout guide](#layout-guide不显示的矩形)。

### 跟随键盘

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

**效果**：没有键盘时，`bar` 在安全区底边上方 16 pt。页面上的输入框获得焦点、键盘弹出时，`bar` 跟着键盘一起上移，停在键盘上方 16 pt。键盘收起时它回到原位。**未在模拟器验证。**

不需要监听键盘事件，也不需要计算键盘的高度。输入框的用法见[输入框和键盘](ui-text-field.md)。

### 读出约束算出来的位置

```js
page.view.layoutIfNeeded();
console.log(card.frame.x, card.frame.y, card.frame.width, card.frame.height);
```

**效果**：控制台输出卡片在页面根视图里的位置和大小，单位 pt。

激活约束之后不调 `layoutIfNeeded()` 就读 `frame`，读到的是布局之前的值。原因见[约束什么时候算出结果](#约束什么时候算出结果)。

### 查约束够不够

位置不对时，先查约束是不是没写够。

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

`hasAmbiguousLayout` 为 `true` 时，这个视图的约束不够。给约束起 `identifier`，输出时就能认出哪条是哪条。三个检查手段的说明见[排版调试](#排版调试)。

## 概念

### 约束是一个等式

一条约束是一个线性等式或不等式：

```
视图A.某个锚点  =  视图B.某个锚点 × multiplier + constant
                 （= 也可以是 ≥ 或 ≤）
```

比如完整例子里的这一条：

```js
const gap = middle.leadingAnchor.constraintEqualToAnchor(
  left.trailingAnchor, { constant: 8 });
```

意思是 `middle.leading = left.trailing × 1 + 8`。

等式里的五个部分：

| 部分 | 写在哪里 | 说明 |
| --- | --- | --- |
| 左边的锚点 | 调用方法的那个锚点 | `middle.leadingAnchor` |
| 关系 | 方法名 | `constraintEqualTo…` 是 =，`constraintGreaterThanOrEqualTo…` 是 ≥，`constraintLessThanOrEqualTo…` 是 ≤ |
| 右边的锚点 | 第一个参数 | `left.trailingAnchor`。约束到常数时没有右边的锚点 |
| `multiplier` | 选项 | 比例，没有单位。不写是 1。只有宽高之间的约束能写 |
| `constant` | 选项 | 单位 [pt](units.md)。不写是 0 |

系统把页面上所有已激活的约束放在一起当成一组方程求解，得到每个视图的 `frame`。

每个视图有四个未知量：x、y、宽、高。水平方向要两条独立的信息确定 x 和宽，垂直方向要两条确定 y 和高。常见的组合：

| 方向 | 能确定两个量的组合 |
| --- | --- |
| 水平 | 左边 + 右边；左边 + 宽；右边 + 宽；水平中心 + 宽 |
| 垂直 | 上边 + 下边；上边 + 高；下边 + 高；垂直中心 + 高 |

有[固有尺寸](#固有尺寸)的视图（文字、按钮、图片）自带宽和高，只需要再确定位置。

用了约束的视图不要再写 `frame`。下一次布局时，系统用约束的结果覆盖它。

### 锚点：边的对象化

锚点是视图上可以被约束引用的位置或尺寸。每个锚点是视图的一个只读属性：

```
                 centerXAnchor
                       ┆
           ┌───────────┆───────────┐ ← topAnchor
           │           ┆           │
           │   第一行文字 ┄┄┄┄┄┄┄┄┄┄│ ← firstBaselineAnchor
centerY ┄┄┄│┄┄┄┄┄┄┄┄┄┄┄┼┄┄┄┄┄┄┄┄┄┄┄│
Anchor     │   最后一行 ┄┄┄┄┄┄┄┄┄┄┄│ ← lastBaselineAnchor
           │           ┆           │
           └───────────┆───────────┘ ← bottomAnchor
           ↑                       ↑
     leadingAnchor           trailingAnchor
     (leftAnchor)            (rightAnchor)

           ├────── widthAnchor ────┤     heightAnchor 是上边到下边的距离
```

锚点分三种类型，对应三个类：

| 类 | 包含的锚点 | 能和什么建约束 |
| --- | --- | --- |
| `NSLayoutXAxisAnchor`（水平位置） | `leadingAnchor`、`trailingAnchor`、`leftAnchor`、`rightAnchor`、`centerXAnchor` | 另一个水平位置 |
| `NSLayoutYAxisAnchor`（垂直位置） | `topAnchor`、`bottomAnchor`、`centerYAnchor`、`firstBaselineAnchor`、`lastBaselineAnchor` | 另一个垂直位置 |
| `NSLayoutDimension`（尺寸） | `widthAnchor`、`heightAnchor` | 另一个尺寸，或者一个常数 |

**三种类型之间不能建约束。** 上边不能和左边对齐，宽度不能和上边相等。但宽和高是同一种类型，可以互相约束，[保持宽高比](#保持宽高比)就是这样写的。

类型不对时，TypeScript 在编辑器里报错。运行时抛 `TypeError`：

```js
try {
  // @ts-expect-error 垂直位置不能和水平位置建约束
  card.topAnchor.constraintEqualToAnchor(card.leadingAnchor);
} catch (err) {
  console.log(String(err));
}
```

**效果**：控制台输出 `TypeError: NSLayoutYAxisAnchor cannot be constrained to NSLayoutXAxisAnchor: their units are not compatible`。

**`leading` / `trailing` 和 `left` / `right`。** `leading` 是文字开始的那一边，`trailing` 是文字结束的那一边。在中文、英文这类从左往右书写的语言里，`leading` 是左，`trailing` 是右。系统语言是阿拉伯语、希伯来语这类从右往左书写的语言时，两者对调，整个界面左右镜像。`left` 和 `right` 永远是屏幕的左和右。

这相当于 CSS 里 `inline-start` / `inline-end` 和 `left` / `right` 的区别。平常用 `leading` / `trailing`。只有内容确实和书写方向无关时才用 `left` / `right`。从右往左的语言里对调的行为**未在模拟器验证**。

`leading` / `trailing` 和 `left` / `right` 不要在同一条约束里混用。

**基线**（baseline）是一行文字里字母底部所在的那条线。`firstBaselineAnchor` 是第一行文字的基线，`lastBaselineAnchor` 是最后一行的。两个字号不同的标签并排时，对齐基线比对齐上下边看起来整齐。相当于 CSS 的 `align-items: baseline`。

**锚点不能自己构造**，只能从视图或 `UILayoutGuide` 上读。同一个视图的同一个锚点，每次读到的是同一个对象：`card.topAnchor === card.topAnchor` 是 `true`。

**锚点持有它的视图。** 只保留锚点、不保留视图的变量，锚点照样能用。约束持有两端的锚点。所以不需要为了让约束有效而另外保存视图。

### 关掉 `translatesAutoresizingMaskIntoConstraints`

每个用约束定位的视图，都要先写这一行：

```js
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
```

**效果**：`box` 不再按 `frame` 定位，它的位置和大小完全由你写的约束决定。

原因：iOS 有两种定位方式，直接写 `frame` 和写约束。这个属性默认是 `true`，意思是「这个视图按 `frame` 定位」。此时系统自动生成一组约束，把视图固定在 `frame` 指定的位置上。这组约束的优先级是最高的。你再写约束，就和它们矛盾。

漏写的表现是：约束都写对了，但视图的位置不变。

三种情况不用写：

- 页面的根视图 `page.view` 和窗口。它们由系统定位，不要改这个属性。
- 加进 [`UIStackView`](ui-stack-view.md) 排列的视图。系统自动把它设成 `false`（实测）。
- `UILayoutGuide`。它没有 `frame`，也没有这个属性。

### 创建和激活是两步

`constraintEqualToAnchor()` 这类方法只创建约束对象。约束要激活之后才参与布局。

```js
const c = left.heightAnchor.constraintEqualToConstant(44);
console.log(c.isActive);   // false
c.isActive = true;
console.log(c.isActive);   // true
```

**效果**：第一行输出 `false`，第二行输出 `true`。新建的约束默认不生效这一点来自 UIKit 的定义，**未在模拟器验证**。

激活有两种写法：

| 写法 | 用在哪里 |
| --- | --- |
| `c.isActive = true` | 单独一条 |
| `NSLayoutConstraint.activateConstraints([c1, c2, …])` | 一次激活多条 |

一次要激活多条时用批量的写法。逐条激活时，前几条已经生效、后几条还没生效，中间会经过约束不完整的状态。批量激活没有这个中间状态，也只过一次桥。

停用是 `c.isActive = false` 或 `NSLayoutConstraint.deactivateConstraints([…])`。

**约束存放在哪里。** 激活时，系统把约束存放到两端视图最近的共同祖先上。可以从那个视图的 `constraints` 属性读回来：

- 两个子视图之间的约束，存放在它们的父视图上。
- 视图自己的宽高约束（约束到常数），存放在它自己身上。完整例子里 `card.constraints` 包含 `cardHeight`。

所以 `view.constraints` 不是「影响这个视图的全部约束」。要查后者用 `constraintsAffectingLayoutForAxis()`。

**两端要在同一棵视图树里。** 约束连接的两个视图没有共同祖先时（比如其中一个还没有 `addSubview`），激活会抛 `TypeError`，信息以 `failed to activate constraint:` 开头。所以要**先把视图加进视图树，再激活约束**。

### 约束不够和约束冲突

约束写错有两种情况，表现不同。

| | 约束不够（有歧义） | 约束冲突 |
| --- | --- | --- |
| 是什么 | 某个量没有被确定，有多组解都满足约束 | 几条必须满足的约束互相矛盾，没有解 |
| 例子 | 只写了左边和上边，没写宽高 | 同一个视图同时写了「宽 = 100」和「宽 = 200」 |
| 表现 | 系统任选一组解。视图可能大小为 0，可能在意外的位置 | 系统放弃其中一条约束，按剩下的布局 |
| 怎么查 | `view.hasAmbiguousLayout` 是 `true` | 没有直接的查询方法。用 `constraintsAffectingLayoutForAxis()` 列出相关约束，自己核对 |

**两种情况系统都不报任何信息**（实测：标准输出、标准错误、系统日志都没有内容）。原生开发时 Xcode 的控制台会输出冲突的约束列表，这里没有。

约束不够的一个实测例子：停用完整例子里的 `cardHeight` 后，卡片的高度没有约束确定。系统选的结果是卡片高 16 pt、三个色块高 0。

约束冲突时系统放弃哪一条，**未在模拟器验证**。不要依赖这个结果。

最常见的冲突来源是漏写 `translatesAutoresizingMaskIntoConstraints = false`。

想让几条约束在矛盾时有明确的取舍，给它们设不同的[优先级](#优先级)。

### 优先级

每条约束有一个优先级，是 1 到 1000 的数，没有单位。

- **1000**（`'required'`）是「必须满足」。新建约束的默认值。
- **小于 1000** 是「尽量满足」。系统先满足全部 1000 的约束，再按优先级从高到低尽量满足其余的。满足不了的不算冲突。

所以优先级有两个用途：

- 给一个量设「首选值」，同时允许别的约束覆盖它。见[限制最小和最大尺寸](#限制最小和最大尺寸)。
- 决定几个视图争空间时谁让步。见[内容抱紧和抗压缩](#内容抱紧和抗压缩)。

写优先级时可以用数，也可以用下面七个名字。**读出来永远是数。**

| 名字 | 值 | 含义 |
| --- | --- | --- |
| `'required'` | 1000 | 必须满足 |
| `'defaultHigh'` | 750 | 视图「不愿被压小」的默认优先级 |
| `'dragThatCanResizeScene'` | 510 | 系统使用，日常不需要 |
| `'sceneSizeStayPut'` | 500 | 系统使用，日常不需要 |
| `'dragThatCannotResizeScene'` | 490 | 系统使用，日常不需要 |
| `'defaultLow'` | 250 | 视图「不愿被拉大」的默认优先级 |
| `'fittingSizeLevel'` | 50 | `systemLayoutSizeFittingSize()` 求最小尺寸时使用的优先级 |

```js
cardHeight.priority = 'defaultHigh';
console.log(cardHeight.priority);   // 750
cardHeight.priority = 749;
console.log(cardHeight.priority);   // 749
cardHeight.priority = 'required';
```

**效果**：输出 `750` 和 `749`。749 这样的值没有名字，所以读出来统一是数。

名字写错时抛 `TypeError: priority has no value "veryImportant"; expected one of: …`，省略号处是七个名字。

### 固有尺寸

有些视图自己知道应该多大，这个大小叫固有尺寸（intrinsic content size）：

| 视图 | 固有尺寸 |
| --- | --- |
| [`UILabel`](ui-label.md) | 文字排出来的大小 |
| [`UIButton`](ui-button.md) | 标题和图标的大小 |
| [`UIImageView`](ui-image.md) | 图片的大小 |
| 普通 `UIView` | 没有。读出来是 `(-1, -1)`（实测） |

有固有尺寸的视图不需要写宽高约束，只写位置。相当于 CSS 里行内元素的大小由内容决定。

固有尺寸不是硬性规定。系统把它当成四条带优先级的约束：宽和高各有「不要比这个大」和「不要比这个小」两条。别的约束可以覆盖它们。这四条的优先级就是下一节的内容。

用 `view.intrinsicContentSize` 可以读到固有尺寸。

### 内容抱紧和抗压缩

这两个优先级说的是：有固有尺寸的视图，多大程度上坚持这个尺寸。

| 优先级 | 含义 | 默认值 |
| --- | --- | --- |
| 内容抱紧（content hugging） | 不愿被**拉得比固有尺寸大**的程度 | 250 |
| 抗压缩（compression resistance） | 不愿被**压得比固有尺寸小**的程度 | 750 |

水平和垂直两个方向分别设置。

```js
const label = new UILabel();
label.setContentHuggingPriority('defaultHigh', { forAxis: 'horizontal' });
console.log(label.contentHuggingPriorityForAxis('horizontal'));   // 750
```

**效果**：`label` 在水平方向上「不愿被拉大」的优先级从 250 变成 750。

一排视图的总宽度和可用宽度不相等时：

- **空间有多余**：抱紧优先级**最低**的那个视图被拉大，占掉多余的空间。
- **空间不够**：抗压缩优先级**最低**的那个视图被压小。文字标签被压小时，文字被截断。

这两种情况下谁被拉大、谁被压小的效果**未在模拟器验证**。

**和 flex 的对照**

| CSS | 这里 | 差别 |
| --- | --- | --- |
| `flex-grow` | 抱紧优先级，方向相反：值越**低**越容易被拉大 | `flex-grow` 是比例，多余的空间按比例分给各项。这里是优先级，多余的空间全部给最低的那一个，不分摊 |
| `flex-shrink` | 抗压缩优先级，方向相反：值越**低**越容易被压小 | 同上，不按比例分摊 |
| `flex: 1` | 把这一项的抱紧优先级设得比其他项低 | |
| 几项按比例分空间 | 用 `widthAnchor` 之间带 `multiplier` 的约束 | 见[两个视图等宽](#两个视图等宽) |

两个视图的优先级相等时，系统不知道该拉大或压小哪一个，这是[约束不够](#约束不够和约束冲突)。所以并排放两个标签时，要把其中一个的优先级改掉。

`UILabel` 和普通 `UIView` 的默认值相同，都是抱紧 250、抗压缩 750（实测，水平和垂直都是）。差别只在于 `UILabel` 有固有尺寸，普通 `UIView` 没有。没有固有尺寸的视图，这两个优先级不起作用。

### layout guide：不显示的矩形

layout guide 是一个只参与布局、不显示的矩形。它有和视图一样的锚点，可以和它建约束。它不是视图：没有底色，不接收触摸，不出现在 `subviews` 里。

它相当于 Web 里只用来占位或分组的不可见 `<div>`。差别是它不进入视图树，不占渲染资源。

**系统提供的 layout guide**，从视图的属性上读：

| 属性 | 代表的区域 |
| --- | --- |
| `view.safeAreaLayoutGuide` | 安全区：视图里不会被刘海、状态栏、屏幕圆角和底部横条遮挡的部分。相当于 CSS 的 `env(safe-area-inset-*)`，但直接给出一个可以对齐的矩形 |
| `view.layoutMarginsGuide` | 视图四边各向内缩进一段系统边距之后的区域 |
| `view.readableContentGuide` | 适合阅读长文字的宽度范围。视图很宽时它比视图窄 |
| `view.keyboardLayoutGuide` | 键盘占的区域。见[跟随键盘](#跟随键盘) |
| `scrollView.contentLayoutGuide`、`frameLayoutGuide` | 滚动视图的内容区和可视区。见 [`UIScrollView`](ui-scroll-view.md) |

`layoutMarginsGuide` 和 `readableContentGuide` 的具体范围**未在模拟器验证**。

**自己建的 layout guide**，用 `new UILayoutGuide()` 创建，再用 `view.addLayoutGuide()` 加到一个视图上。加上去之后才能和它建约束。例子见[用不显示的矩形占位](#用不显示的矩形占位)。常见用途：

- 占位：表示一段间隔，让多个间隔相等。
- 分组：把几个视图框在一个矩形里，再让这个矩形整体居中。

layout guide 的大小和位置同样要由约束确定。布局完成后，从 `layoutFrame` 读出它的矩形。

### 约束什么时候算出结果

激活约束、改 `constant`、改优先级，都不会立刻改变视图的 `frame`。系统只是记下「需要重新布局」，在当前这段 JS 执行完之后、下一次屏幕刷新之前统一计算一次。

相当于浏览器里改了样式之后，布局在下一帧才计算。差别是浏览器在你读 `offsetWidth` 时会自动提前计算，这里不会。读 `frame` 得到的是上一次布局的结果。

想立刻得到结果，调 `layoutIfNeeded()`：

```js
cardHeight.constant = 84;
console.log(card.frame.height);   // 还是改之前的值
page.view.layoutIfNeeded();
console.log(card.frame.height);   // 84
```

**效果**：第二次输出 `84`。第一次输出的是改之前的高度，这一点**未在模拟器验证**。

`layoutIfNeeded()` 要在**共同的祖先**上调。它完成这个视图和它的后代的布局。调在页面的根视图上最保险。

只是设置界面、之后不读 `frame` 的代码，不需要调它。

## 成员说明

所有长度的单位是 [pt](units.md)。

下面四个类都继承自 `NSObject`。除了 `UILayoutGuide`，其余都不能用 `new` 创建，也都不能被继承。用 `new` 创建时抛 `TypeError: Illegal constructor: NSLayoutConstraint is created by the runtime, not by new`，其中的类名是实际的类名。

### `NSLayoutConstraint`

一条约束。由锚点的方法创建，见[锚点的三个类](#锚点的三个类)。

#### 属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `isActive` | 布尔 | 是 | 是 | `false` | `true`：约束参与布局。`false`：约束不起作用 |
| `constant` | 数，单位 pt | 是 | 是 | 创建时传入的值，没传是 `0` | 等式里的常数项。创建之后唯一能改的数值 |
| `priority` | 写：数或优先级的名字。读：数 | 是 | 是 | `1000` | 优先级，1 到 1000 的数，没有单位。取值见[优先级](#优先级) |
| `identifier` | 字符串或 `null` | 是 | 是 | `null` | 自己起的名字，只用于调试时辨认。写入不是字符串的值等于写入 `null` |
| `multiplier` | 数，比例 | 是 | 否 | 创建时传入的值，没传是 `1` | 等式里的倍数 |
| `relation` | 字符串 | 是 | 否 | 由创建它的方法决定 | 等式的关系，取值见下 |
| `firstAttribute` | 字符串 | 是 | 否 | — | 等式左边的锚点是哪一种，取值见下 |
| `secondAttribute` | 字符串 | 是 | 否 | — | 等式右边的锚点是哪一种。约束到常数时是 `'notAnAttribute'` |
| `firstAnchor` | 锚点 | 是 | 否 | — | 等式左边的锚点。和创建约束时用的是同一个对象 |
| `secondAnchor` | 锚点或 `null` | 是 | 否 | — | 等式右边的锚点。约束到常数时是 `null` |

`isActive`、`priority`、`identifier` 的默认值来自 UIKit 的定义，**未在模拟器验证**。

这些属性变化时不派发事件。它们只会被你的代码修改。

`relation` 的取值：

| 值 | 含义 |
| --- | --- |
| `'equal'` | 左边 = 右边 |
| `'greaterThanOrEqual'` | 左边 ≥ 右边 |
| `'lessThanOrEqual'` | 左边 ≤ 右边 |

`firstAttribute` 和 `secondAttribute` 的取值：

| 值 | 含义 |
| --- | --- |
| `'leading'`、`'trailing'` | 起始边、结束边 |
| `'left'`、`'right'` | 左边、右边 |
| `'top'`、`'bottom'` | 上边、下边 |
| `'centerX'`、`'centerY'` | 水平中心线、垂直中心线 |
| `'width'`、`'height'` | 宽、高 |
| `'firstBaseline'`、`'lastBaseline'` | 第一行文字的基线、最后一行文字的基线 |
| `'leftMargin'`、`'rightMargin'`、`'topMargin'`、`'bottomMargin'`、`'leadingMargin'`、`'trailingMargin'` | 对应的边向内缩进系统边距之后的位置 |
| `'centerXWithinMargins'`、`'centerYWithinMargins'` | 缩进系统边距之后的区域的中心线 |
| `'notAnAttribute'` | 没有锚点。约束到常数时，右边是这个值 |

带 `Margin` 的八个值只会出现在系统创建的约束上。用锚点创建的约束不会产生这些值。

没有 `firstItem` 和 `secondItem`。要找约束两端的视图，自己在创建约束时记下来。

写属性时的出错情况：

| 情况 | 报错 |
| --- | --- |
| `priority` 写了不认识的名字 | `TypeError: priority has no value "veryImportant"; expected one of: … , or a number between 0 and 1000` |
| `isActive = true`，但两端的视图没有共同祖先 | `TypeError`，信息以 `failed to activate constraint:` 开头，后面是 UIKit 给出的原因 |

`priority` 写入 1 到 1000 之外的数时的行为**未在模拟器验证**，不要这样写。

#### `NSLayoutConstraint.activateConstraints(constraints)`

激活一组约束。效果等于把每一条的 `isActive` 设成 `true`。

```js
NSLayoutConstraint.activateConstraints([
  left.widthAnchor.constraintEqualToConstant(60),
  right.widthAnchor.constraintEqualToConstant(60),
]);
```

- **`constraints`**：约束的数组，或者任何可迭代的对象。
- **返回**：无。
- **出错**：某一条约束的两端没有共同祖先时抛 `TypeError`，信息以 `failed to activate constraint:` 开头，后面是 UIKit 给出的原因。

> **注意**：数组里不是约束的元素（数、字符串、别的原生对象）会被跳过，不报错。TypeScript 的类型检查能发现这种错误。

#### `NSLayoutConstraint.deactivateConstraints(constraints)`

停用一组约束。效果等于把每一条的 `isActive` 设成 `false`。

```js
NSLayoutConstraint.deactivateConstraints([cardHeight]);
console.log(cardHeight.isActive);   // false
```

- **`constraints`**：约束的数组，或者任何可迭代的对象。
- **返回**：无。

停用的约束对象仍然可用，可以再次激活。数组里不是约束的元素同样被跳过。

### 锚点的三个类

锚点从视图或 `UILayoutGuide` 的属性上读，不能自己构造。有哪些锚点见[下面的表](#锚点属性)。

| 类 | 代表 |
| --- | --- |
| `NSLayoutXAxisAnchor` | 水平方向的位置 |
| `NSLayoutYAxisAnchor` | 垂直方向的位置 |
| `NSLayoutDimension` | 尺寸（宽或高） |

三个类都继承自 `NSLayoutAnchor`。锚点没有属性，只有创建约束的方法。

所有创建约束的方法**返回一条新的 `NSLayoutConstraint`，它还没有激活**。

每个方法都有三个版本，对应三种关系。下面的表只列 `Equal` 的版本：

| 方法名里的词 | 关系 |
| --- | --- |
| `constraintEqualTo…` | = |
| `constraintGreaterThanOrEqualTo…` | ≥ |
| `constraintLessThanOrEqualTo…` | ≤ |

#### 三个类都有的方法

| 方法 | 得到的约束 |
| --- | --- |
| `constraintEqualToAnchor(other)` | 这个锚点 = `other` |
| `constraintEqualToAnchor(other, { constant })` | 这个锚点 = `other` + `constant` |

```js
const below = middle.topAnchor.constraintEqualToAnchor(card.topAnchor, { constant: 8 });
```

- **`other`**：同一种类型的另一个锚点。
- **`constant`**：数，单位 pt，可省略，省略时是 `0`。水平方向向右为正，垂直方向向下为正。
- **返回**：`NSLayoutConstraint`。
- **出错**：
  - `other` 是另一种类型的锚点：`TypeError: NSLayoutYAxisAnchor cannot be constrained to NSLayoutXAxisAnchor: their units are not compatible`，两个类名是实际的类名。
  - `other` 不是锚点（包括 `null`）：`TypeError: constraintEqualToAnchor: needs an anchor as its argument`。开头是完整的原生方法名，带了 `constant` 时是 `constraintEqualToAnchor:constant:`。

#### `NSLayoutDimension` 独有的方法

| 方法 | 得到的约束 |
| --- | --- |
| `constraintEqualToConstant(value)` | 这个尺寸 = `value` |
| `constraintEqualToAnchor(other, { multiplier })` | 这个尺寸 = `other` × `multiplier` |
| `constraintEqualToAnchor(other, { multiplier, constant })` | 这个尺寸 = `other` × `multiplier` + `constant` |

```js
const fixed = left.widthAnchor.constraintEqualToConstant(60);
const ratio = left.heightAnchor.constraintEqualToAnchor(left.widthAnchor, { multiplier: 0.5 });
```

- **`value`**：数，单位 pt。
- **`multiplier`**：数，比例，没有单位。可省略，省略时是 `1`。
- **返回**：`NSLayoutConstraint`。

`multiplier` 的效果**未在模拟器验证**。

#### `NSLayoutXAxisAnchor` 和 `NSLayoutYAxisAnchor` 独有的方法

**系统标准间距。** 两个锚点之间的距离不写具体的数，用系统规定的标准间距。

| 类 | 方法 | 得到的约束 |
| --- | --- | --- |
| `NSLayoutXAxisAnchor` | `constraintEqualToSystemSpacingAfterAnchor(other, { multiplier })` | 这个锚点在 `other` 之后，距离 = 标准间距 × `multiplier` |
| `NSLayoutYAxisAnchor` | `constraintEqualToSystemSpacingBelowAnchor(other, { multiplier })` | 这个锚点在 `other` 下方，距离 = 标准间距 × `multiplier` |

```js
const next = middle.leadingAnchor.constraintEqualToSystemSpacingAfterAnchor(left.trailingAnchor);
```

- **`other`**：同一种类型的另一个锚点。
- **`multiplier`**：数，比例，没有单位。可省略，省略时是 `1`。
- **返回**：`NSLayoutConstraint`。
- **出错**：和 `constraintEqualToAnchor()` 相同。

标准间距的数值由系统决定，和两端是什么有关。Web 里没有对应物。具体数值**未在模拟器验证**。

**两个锚点之间的距离。**

| 方法 | 返回 |
| --- | --- |
| `anchorWithOffsetToAnchor(other)` | `NSLayoutDimension`，代表从这个锚点到 `other` 的距离 |

返回的是一个尺寸锚点，可以像 `widthAnchor` 一样建约束。用途是让两段间隔相等：

```js
const gapA = left.trailingAnchor.anchorWithOffsetToAnchor(middle.leadingAnchor);
const gapB = middle.trailingAnchor.anchorWithOffsetToAnchor(right.leadingAnchor);
const equalGaps = gapA.constraintEqualToAnchor(gapB);
```

**效果**：`equalGaps` 激活后，`left` 到 `middle` 的间隔等于 `middle` 到 `right` 的间隔。**未在模拟器验证。**

### `UILayoutGuide`

不显示的矩形，只用来对齐。概念见 [layout guide](#layout-guide不显示的矩形)。

#### `new UILayoutGuide()`

创建一个 layout guide。没有参数。创建之后要用 `view.addLayoutGuide()` 加到一个视图上才能用。

```js
const guide = new UILayoutGuide();
card.addLayoutGuide(guide);
console.log(guide.owningView === card);   // true
```

**效果**：输出 `true`。

#### 属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `owningView` | `UIView` 或 `null` | 是 | 否 | `null` | 它被加到了哪个视图上。还没加时是 `null` |
| `layoutFrame` | `CGRect`，单位 pt | 是 | 否 | — | 布局算出的矩形，在 `owningView` 的坐标系里。布局完成之后才有意义 |
| `identifier` | 字符串 | 是 | 是 | — | 自己起的名字，只用于调试时辨认。写入不是字符串的值等于写入 `''` |

`owningView` 还没加到视图上时是 `null`，以及 `identifier` 的默认值，**未在模拟器验证**。

`layoutFrame` 变化时不派发事件。需要时在 `layoutIfNeeded()` 之后读。

它有 10 个锚点，都是只读属性，含义和视图上的同名锚点相同：

| 类型 | 锚点 |
| --- | --- |
| `NSLayoutXAxisAnchor` | `leadingAnchor`、`trailingAnchor`、`leftAnchor`、`rightAnchor`、`centerXAnchor` |
| `NSLayoutYAxisAnchor` | `topAnchor`、`bottomAnchor`、`centerYAnchor` |
| `NSLayoutDimension` | `widthAnchor`、`heightAnchor` |

比视图少两个基线锚点，因为它没有文字。

#### `UIKeyboardLayoutGuide`

`view.keyboardLayoutGuide` 的类型。它是 `UILayoutGuide` 的子类（中间隔着 `UITrackingLayoutGuide`），不能自己构造。除了上面的成员，多两个属性：

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `followsUndockedKeyboard` | 布尔 | 是 | 是 | `false` | 只和 iPad 上可以浮动、拆分的键盘有关。`true`：键盘离开屏幕底部时也跟随它。`false`：键盘离开底部时当作没有键盘 |
| `keyboardDismissPadding` | 数，单位 pt | 是 | 是 | `0` | 用户向下拖动滚动视图来收起键盘时，手指离键盘顶边还有多远就开始收起 |

两个属性的读写和默认值在验收用例里断言过。它们对界面的实际影响**未在模拟器验证**。

### `UIView` 上的相关成员

这里列出 [`UIView`](ui-view.md) 上和约束有关的成员。所有视图（标签、按钮、滚动视图等）都有这些成员。

#### 开关

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `translatesAutoresizingMaskIntoConstraints` | 布尔 | 是 | 是 | `true` | `true`：系统按 `frame` 定位这个视图。`false`：这个视图由你写的约束定位。详见[上文](#关掉-translatesautoresizingmaskintoconstraints) |

#### 锚点属性

12 个锚点都是只读属性。同一个视图上多次读取得到同一个对象。

| 属性 | 类型 | 代表 |
| --- | --- | --- |
| `leadingAnchor` | `NSLayoutXAxisAnchor` | 起始边。从左往右书写的语言里是左边，从右往左的语言里是右边 |
| `trailingAnchor` | `NSLayoutXAxisAnchor` | 结束边，和 `leadingAnchor` 相对 |
| `leftAnchor` | `NSLayoutXAxisAnchor` | 左边，不随书写方向变 |
| `rightAnchor` | `NSLayoutXAxisAnchor` | 右边，不随书写方向变 |
| `centerXAnchor` | `NSLayoutXAxisAnchor` | 水平方向的中心线 |
| `topAnchor` | `NSLayoutYAxisAnchor` | 上边 |
| `bottomAnchor` | `NSLayoutYAxisAnchor` | 下边 |
| `centerYAnchor` | `NSLayoutYAxisAnchor` | 垂直方向的中心线 |
| `firstBaselineAnchor` | `NSLayoutYAxisAnchor` | 第一行文字的基线 |
| `lastBaselineAnchor` | `NSLayoutYAxisAnchor` | 最后一行文字的基线 |
| `widthAnchor` | `NSLayoutDimension` | 宽度 |
| `heightAnchor` | `NSLayoutDimension` | 高度 |

#### layout guide

| 成员 | 类型 / 返回 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `safeAreaLayoutGuide` | `UILayoutGuide` | 是 | 否 | 安全区 |
| `layoutMarginsGuide` | `UILayoutGuide` | 是 | 否 | 四边各向内缩进系统边距之后的区域 |
| `readableContentGuide` | `UILayoutGuide` | 是 | 否 | 适合阅读长文字的宽度范围 |
| `keyboardLayoutGuide` | `UIKeyboardLayoutGuide` | 是 | 否 | 键盘占的区域 |
| `layoutGuides` | `UILayoutGuide` 的只读数组 | 是 | 否 | 用 `addLayoutGuide()` 加在这个视图上的 layout guide |
| `addLayoutGuide(guide)` | 无 | — | — | 把 `guide` 加到这个视图上 |
| `removeLayoutGuide(guide)` | 无 | — | — | 把 `guide` 从这个视图上移除 |

`addLayoutGuide()` 和 `removeLayoutGuide()` 的参数不是 `UILayoutGuide` 时，调用被忽略，不报错。

#### 约束和布局

| 成员 | 类型 / 返回 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `constraints` | `NSLayoutConstraint` 的只读数组 | 是 | 否 | 存放在这个视图上的约束。不等于影响这个视图的约束，见[创建和激活是两步](#创建和激活是两步) |
| `intrinsicContentSize` | `CGSize`，单位 pt | 是 | 否 | [固有尺寸](#固有尺寸)。没有固有尺寸的方向是 `-1` |
| `setNeedsLayout()` | 无 | — | — | 标记这个视图需要重新布局。布局在稍后进行 |
| `layoutIfNeeded()` | 无 | — | — | 如果有待处理的布局，立刻完成这个视图和它的后代的布局 |
| `invalidateIntrinsicContentSize()` | 无 | — | — | 通知系统这个视图的固有尺寸变了，下次布局时重新读取 |

#### 内容优先级

概念见[内容抱紧和抗压缩](#内容抱紧和抗压缩)。

| 方法 | 作用 | 返回 |
| --- | --- | --- |
| `contentHuggingPriorityForAxis(axis)` | 读「不愿被拉大」的优先级 | 数。默认 `250` |
| `setContentHuggingPriority(priority, { forAxis })` | 设「不愿被拉大」的优先级 | 无 |
| `contentCompressionResistancePriorityForAxis(axis)` | 读「不愿被压小」的优先级 | 数。默认 `750` |
| `setContentCompressionResistancePriority(priority, { forAxis })` | 设「不愿被压小」的优先级 | 无 |

```js
const text = new UILabel();
text.setContentCompressionResistancePriority(999, { forAxis: 'vertical' });
console.log(text.contentCompressionResistancePriorityForAxis('vertical'));   // 999
```

- **`axis`** / **`forAxis`**：`'horizontal'`（水平方向，影响宽度）或 `'vertical'`（垂直方向，影响高度）。
- **`priority`**：数（1 到 1000，没有单位），或者[优先级的名字](#优先级)。读出来永远是数。
- **出错**：
  - 没传 `forAxis`：`TypeError: setContentHuggingPriority needs { forAxis }`（另一个方法是 `setContentCompressionResistancePriority needs { forAxis }`）
  - 方向写错：`TypeError: forAxis has no value "diagonal"; expected one of: horizontal / vertical`（读取的两个方法报 `axis has no value …`）
  - 优先级的名字写错：`TypeError: priority has no value "veryImportant"; expected one of: …`

#### 算尺寸

按约束算出一个视图应该多大，不实际改变布局。

| 方法 | 作用 | 返回 |
| --- | --- | --- |
| `systemLayoutSizeFittingSize(size)` | 按这个视图和它的后代上的约束，算出最接近 `size` 的尺寸 | `CGSize`，单位 pt |
| `systemLayoutSizeFittingSize(size, { withHorizontalFittingPriority, verticalFittingPriority })` | 同上，并指定水平和垂直方向上接近 `size` 的优先级 | `CGSize`，单位 pt |

```js
const fitted = card.systemLayoutSizeFittingSize(new CGSize(0, 0));
console.log(fitted.height);   // 60
```

**效果**：输出 `60`，就是 `cardHeight` 约束的值。

- **`size`**：`CGSize` 或 `{ width, height }`，单位 pt。传 `new CGSize(0, 0)` 表示求满足约束的最小尺寸。
- **`withHorizontalFittingPriority`**、**`verticalFittingPriority`**：数或[优先级的名字](#优先级)。两个要一起传。`'required'` 表示这个方向必须正好等于 `size` 里的值，`'fittingSizeLevel'` 表示这个方向尽量小。常见用法是固定宽度、求高度：`{ withHorizontalFittingPriority: 'required', verticalFittingPriority: 'fittingSizeLevel' }`。带优先级的版本**未在模拟器验证**。
- **出错**：
  - `size` 不是对象：`TypeError: systemLayoutSizeFittingSize needs an object with all of: width, height`
  - `size` 缺字段或字段不是有限的数：`TypeError: systemLayoutSizeFittingSize is missing width, or it is not a finite number`
  - 优先级的名字写错：`TypeError: withHorizontalFittingPriority has no value "x"; expected one of: …`

和 [`sizeThatFits()`](ui-view.md) 的区别：`sizeThatFits()` 问的是视图自己的内容需要多大，这个方法按子视图之间的约束来算。

#### 排版调试

约束不够或冲突时，系统不输出任何信息。用下面三个成员检查。

| 成员 | 类型 / 返回 | 含义 |
| --- | --- | --- |
| `hasAmbiguousLayout` | 布尔，只读 | `true`：约束不够，这个视图的位置或大小有多种可能的结果。`false`：结果唯一 |
| `exerciseAmbiguityInLayout()` | 无 | 让视图在几种可能的结果之间切换一次，方便用眼睛看出哪里约束不够。**未在模拟器验证** |
| `constraintsAffectingLayoutForAxis(axis)` | `NSLayoutConstraint` 的只读数组 | 在 `'horizontal'` 或 `'vertical'` 方向上，实际影响这个视图的所有约束，包括存放在祖先上的 |

```js
console.log(left.hasAmbiguousLayout);
console.log(left.constraintsAffectingLayoutForAxis('horizontal').length);
```

**效果**：完整例子的布局下，第一行输出 `false`，第二行输出一个大于 1 的数。验收用例断言的是 `card.hasAmbiguousLayout` 为 `false`；`hasAmbiguousLayout` 为 `true` 的情况**未在模拟器验证**。

- **`axis`**：`'horizontal'` 或 `'vertical'`。
- **出错**：方向写错：`TypeError: axis has no value "diagonal"; expected one of: horizontal / vertical`

配合约束的 `identifier` 使用，例子见[查约束够不够](#查约束够不够)。

## 与 iOS 原生写法的对照

如果你在看 Apple 的文档或 iOS 的示例代码，按这张表换成 JS 的写法。

| ObjC | JS |
| --- | --- |
| `view.translatesAutoresizingMaskIntoConstraints = NO` | `view.translatesAutoresizingMaskIntoConstraints = false` |
| `[a.leadingAnchor constraintEqualToAnchor:b.trailingAnchor]` | `a.leadingAnchor.constraintEqualToAnchor(b.trailingAnchor)` |
| `[a.topAnchor constraintEqualToAnchor:b.bottomAnchor constant:8]` | `a.topAnchor.constraintEqualToAnchor(b.bottomAnchor, { constant: 8 })` |
| `[a.topAnchor constraintGreaterThanOrEqualToAnchor:b.bottomAnchor constant:8]` | `a.topAnchor.constraintGreaterThanOrEqualToAnchor(b.bottomAnchor, { constant: 8 })` |
| `[a.widthAnchor constraintEqualToAnchor:b.widthAnchor multiplier:0.5]` | `a.widthAnchor.constraintEqualToAnchor(b.widthAnchor, { multiplier: 0.5 })` |
| `[a.widthAnchor constraintEqualToAnchor:b.widthAnchor multiplier:0.5 constant:-8]` | `a.widthAnchor.constraintEqualToAnchor(b.widthAnchor, { multiplier: 0.5, constant: -8 })` |
| `[v.widthAnchor constraintEqualToConstant:60]` | `v.widthAnchor.constraintEqualToConstant(60)` |
| `[b.leadingAnchor constraintEqualToSystemSpacingAfterAnchor:a.trailingAnchor multiplier:1]` | `b.leadingAnchor.constraintEqualToSystemSpacingAfterAnchor(a.trailingAnchor)` |
| `[a.trailingAnchor anchorWithOffsetToAnchor:b.leadingAnchor]` | `a.trailingAnchor.anchorWithOffsetToAnchor(b.leadingAnchor)` |
| `c.active = YES` | `c.isActive = true` |
| `c.constant = 84` | `c.constant = 84` |
| `[NSLayoutConstraint activateConstraints:@[c1, c2]]` | `NSLayoutConstraint.activateConstraints([c1, c2])` |
| `[NSLayoutConstraint deactivateConstraints:@[c1]]` | `NSLayoutConstraint.deactivateConstraints([c1])` |
| `c.priority = UILayoutPriorityDefaultLow` | `c.priority = 'defaultLow'` |
| `c.relation == NSLayoutRelationEqual` | `c.relation === 'equal'` |
| `[v setContentHuggingPriority:250 forAxis:UILayoutConstraintAxisHorizontal]` | `v.setContentHuggingPriority('defaultLow', { forAxis: 'horizontal' })` |
| `[v contentHuggingPriorityForAxis:UILayoutConstraintAxisHorizontal]` | `v.contentHuggingPriorityForAxis('horizontal')` |
| `[v systemLayoutSizeFittingSize:s]` | `v.systemLayoutSizeFittingSize(s)` |
| `[v systemLayoutSizeFittingSize:s withHorizontalFittingPriority:h verticalFittingPriority:p]` | `v.systemLayoutSizeFittingSize(s, { withHorizontalFittingPriority: h, verticalFittingPriority: p })` |
| `[v constraintsAffectingLayoutForAxis:UILayoutConstraintAxisHorizontal]` | `v.constraintsAffectingLayoutForAxis('horizontal')` |
| `[[UILayoutGuide alloc] init]` | `new UILayoutGuide()` |
| `[view addLayoutGuide:guide]` | `view.addLayoutGuide(guide)` |
| `view.safeAreaLayoutGuide` | `view.safeAreaLayoutGuide` |
| `view.keyboardLayoutGuide.topAnchor` | `view.keyboardLayoutGuide.topAnchor` |

换写法的三条规则：

- ObjC 方法名的第一段是 JS 的方法名，其余各段变成选项对象的键：`constraintEqualToAnchor:constant:` 写成 `constraintEqualToAnchor(other, { constant })`。
- ObjC 里写成 `getter=isActive` 的布尔属性，JS 里叫 `isActive`。
- 枚举和具名常量都用字符串：`UILayoutConstraintAxisHorizontal` 写成 `'horizontal'`，`UILayoutPriorityRequired` 写成 `'required'`。

原生的 `[view addConstraint:c]` 和 `[view removeConstraint:c]` 没有对应的 JS 方法。用 `c.isActive = true` 和 `c.isActive = false`，Apple 的文档也建议这样写。

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 改约束时带过渡动画 | `UIView.animateWithDuration:animations:` 里调 `layoutIfNeeded` | 未实现 |
| 视图的大小被系统改变时（旋转、字体大小变化、键盘弹出）得到通知 | 覆写 `layoutSubviews` | 未实现 |
| 在系统布局的过程中更新约束 | 覆写 `updateConstraints`、`setNeedsUpdateConstraints` | 未实现 |
| 自己定义一个视图的固有尺寸 | 覆写 `intrinsicContentSize` | 未实现 |
| 从约束对象读出两端的视图 | `firstItem`、`secondItem` | 不提供。创建约束时自己记下来 |
| 用一个字符串描述一组约束 | `constraintsWithVisualFormat:options:metrics:views:` | 未实现 |
| 不通过锚点、用「视图 + 属性名」创建约束 | `constraintWithItem:attribute:relatedBy:toItem:attribute:multiplier:constant:` | 未实现。锚点能表达同样的约束 |
| 设置视图的系统边距的大小 | `layoutMargins`、`directionalLayoutMargins` | 未实现。`layoutMarginsGuide` 只能读系统给出的范围 |
| 键盘靠近或离开某条边时自动切换约束 | `UITrackingLayoutGuide` 的 `setConstraints:activeWhenNearEdge:` | 未实现 |
| 让对齐用的矩形和 `frame` 不同（比如不算阴影） | `alignmentRectForFrame:`、`alignmentRectInsets` | 未实现 |
| 指定用哪个子视图的基线作为自己的基线 | `viewForFirstBaselineLayout`、`viewForLastBaselineLayout` | 未实现 |

## 参见

- [`UIView`](ui-view.md)：`frame`、安全区、两种定位方式，以及视图的其他成员
- [`UIStackView`](ui-stack-view.md)：把视图排成一行或一列，不用自己写约束
- [`UIScrollView`](ui-scroll-view.md)：用 `contentLayoutGuide` 和 `frameLayoutGuide` 说明内容区的大小
- [输入框和键盘](ui-text-field.md)：`keyboardLayoutGuide` 配合输入框使用
- [`UILabel`](ui-label.md)：有固有尺寸的视图，抱紧和抗压缩优先级主要用在它上面
- [枚举](enums.md)：字符串枚举的通用规则
- [结构体](structs.md)：`CGRect`、`CGSize`
- [单位](units.md)：pt 是什么
- [实现原理：Auto Layout](../internals/auto-layout.md)
