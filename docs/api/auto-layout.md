---
type: reference
native: NSLayoutConstraint
status: partial
---

# `NSLayoutConstraint`

**`NSLayoutConstraint`** 表示一条约束：两个视图上的两个位置或尺寸之间的关系，例如「卡片的左边在安全区左边的右侧 16 pt」「两个色块等宽」。

iOS 的布局系统 Auto Layout 不要求写出每个视图的位置和大小，而是接受一组约束。系统根据全部已激活的约束算出每个视图的 `frame`（视图在父视图里的位置和大小），并在屏幕尺寸变化时重新计算。所有长度的单位都是 [pt](units.md)。

约束由锚点创建。锚点是视图上可以被约束引用的边、中心线、宽、高，例如 `view.leadingAnchor`（起始边）、`view.widthAnchor`（宽度）。这一组类是：

| 类 | 是什么 |
| --- | --- |
| `NSLayoutConstraint`（本页） | 一条约束 |
| [`NSLayoutAnchor`](ns-layout-anchor.md) | 锚点的基类，有创建约束的三个方法 |
| [`NSLayoutXAxisAnchor`](ns-layout-x-axis-anchor.md) | 水平位置：起始边、结束边、左、右、水平中心线 |
| [`NSLayoutYAxisAnchor`](ns-layout-y-axis-anchor.md) | 垂直位置：上、下、垂直中心线、文字基线 |
| [`NSLayoutDimension`](ns-layout-dimension.md) | 尺寸：宽、高 |
| [`UILayoutGuide`](ui-layout-guide.md) | 不显示的矩形，只用来对齐 |
| [`UIKeyboardLayoutGuide`](ui-keyboard-layout-guide.md) | 代表键盘所占区域的 layout guide |

视图上和约束有关的属性和方法（锚点、`translatesAutoresizingMaskIntoConstraints`、内容优先级、调试用的成员）在 [`UIView`](ui-view.md) 上。

**继承关系**：`EventTarget` → `NSObject` → `NSLayoutConstraint`

怎么用约束摆出常见的布局，见指南[用约束排版](../guides/auto-layout.md)。

## 构造函数

不能用 `new` 创建。约束由锚点的方法创建，比如 [`constraintEqualToAnchor()`](ns-layout-anchor/constraintequaltoanchor.md)、[`constraintEqualToConstant()`](ns-layout-dimension/constraintequaltoconstant.md)。`new NSLayoutConstraint()` 抛 `TypeError: Illegal constructor: NSLayoutConstraint is created by the runtime, not by new`。`NSLayoutConstraint` 也不能被继承。

## 静态方法

| 方法 | 说明 |
| --- | --- |
| [`NSLayoutConstraint.activateConstraints()`](auto-layout/activateconstraints.md) | 一次激活一组约束 |
| [`NSLayoutConstraint.deactivateConstraints()`](auto-layout/deactivateconstraints.md) | 一次停用一组约束 |

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`isActive`](auto-layout/isactive.md) | 约束是否参与布局 |
| [`constant`](auto-layout/constant.md) | 等式里的常数项，pt。建好之后唯一能改的数值 |
| [`priority`](auto-layout/priority.md) | 优先级，1 到 1000 |
| [`identifier`](auto-layout/identifier.md) | 调试时辨认用的名字 |
| [`multiplier`](auto-layout/multiplier.md) <small>只读</small> | 等式里的倍数 |
| [`relation`](auto-layout/relation.md) <small>只读</small> | 等于、大于或等于、小于或等于 |
| [`firstAttribute`](auto-layout/firstattribute.md) <small>只读</small> | 等式左边的锚点是哪一种 |
| [`secondAttribute`](auto-layout/secondattribute.md) <small>只读</small> | 等式右边的锚点是哪一种 |
| [`firstAnchor`](auto-layout/firstanchor.md) <small>只读</small> | 等式左边的锚点 |
| [`secondAnchor`](auto-layout/secondanchor.md) <small>只读</small> | 等式右边的锚点。约束到常数时是 `null` |

这些属性变化时不派发事件，它们只会被 App 自己的代码修改。

## 事件

`NSLayoutConstraint` 不派发事件。

## 概念

### 约束和 `frame` 的关系

视图有两种定位方式：直接写 `frame`，或者写约束。每个视图用哪一种，由它的 `translatesAutoresizingMaskIntoConstraints` 属性决定。这个属性默认是 `true`，表示按 `frame` 定位。用约束定位的视图要先把它设成 `false`。

- **同一个视图只用一种。** 用了约束的视图，系统每次布局都用约束的结果覆盖它的 `frame`，所以写 `frame` 没有意义。
- **不同的视图可以各用各的。** 同一个父视图里，可以有的子视图用 `frame`、有的用约束。用 `frame` 定位的容器里面，子视图也可以用约束。
- **约束的结果从 `frame` 读。** 约束不是另一套坐标，系统算完之后把结果写进每个视图的 `frame`。

### 没有约束的视图

视图没有默认的位置。关掉了 `translatesAutoresizingMaskIntoConstraints`、又一条约束都没写的视图，没有位置和大小，屏幕上看不到（**未在模拟器验证**）。

每个视图在水平方向要能确定 x 和宽，在垂直方向要能确定 y 和高。少确定一个量时不报错，系统自己选一个结果，常见的结果是这个量为 0。实测：一张卡片去掉高度约束之后，高度从 60 pt 变成 16 pt，里面三个色块的高度变成 0。

文字、按钮、图片自带宽和高（见[固有尺寸](#固有尺寸)），只需要再确定位置。

### 约束什么时候生效

创建约束和让它生效是两步。`constraintEqualToAnchor()` 这类方法只创建约束对象，激活（`isActive = true` 或 `NSLayoutConstraint.activateConstraints()`）之后它才参与布局。

激活之后视图的 `frame` 也不会立刻改变。系统在当前这段 JS 执行完之后、下一次屏幕刷新之前统一计算一次。所以激活约束后紧接着读 `frame`，读到的不是新的结果。要立刻得到结果，先在页面的根视图上调 `layoutIfNeeded()`，再读 `frame`。只设置界面、不读 `frame` 的代码不需要调它。


### 约束是一个等式

一条约束是一个线性等式或不等式：

```
视图A.某个锚点  =  视图B.某个锚点 × multiplier + constant
                 （= 也可以是 ≥ 或 ≤）
```

比如完整例子里的这一条：

```js
const left = new UIView();
const middle = new UIView();
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

用了约束的视图不要再写 `frame`。下一次布局时，系统用约束的结果覆盖它。要移动或缩放这个视图，改约束的 `constant`。


### 关掉 `translatesAutoresizingMaskIntoConstraints`

每个用约束定位的视图，都要先写这一行：

```js
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
```

**效果**：`box` 不再按 `frame` 定位，它的位置和大小完全由约束决定。

原因：iOS 有两种定位方式，直接写 `frame` 和写约束。这个属性默认是 `true`，意思是「这个视图按 `frame` 定位」。此时系统自动生成一组约束，把视图固定在 `frame` 指定的位置上。这组约束的优先级是最高的，另外写的约束和它们矛盾。

漏写的表现是：约束都写对了，但视图的位置和大小不变，控制台没有任何输出。新建视图的 `frame` 是 0 × 0，所以通常的结果是看不到这个视图。

三种情况不用写：

- 页面的根视图 `page.view` 和窗口。它们由系统定位，不要改这个属性。
- 加进 [`UIStackView`](ui-stack-view.md) 排列的视图。系统自动把它设成 `false`（实测）。
- `UILayoutGuide`。它没有 `frame`，也没有这个属性。


### 创建和激活是两步

`constraintEqualToAnchor()` 这类方法只创建约束对象。约束要激活之后才参与布局。

```js
const left = new UIView();
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

一次要激活多条时用批量的写法。逐条激活时，前几条已经生效、后几条还没生效，中间会经过约束不完整的状态。批量激活没有这个中间状态。

停用是 `c.isActive = false` 或 `NSLayoutConstraint.deactivateConstraints([…])`。

**约束存放在哪里。** 激活时，系统把约束存放到两端视图最近的共同祖先上。可以从那个视图的 `constraints` 属性读回来：

- 两个子视图之间的约束，存放在它们的父视图上。
- 视图自己的宽高约束（约束到常数），存放在它自己身上。完整例子里 `card.constraints` 包含 `cardHeight`。

所以 `view.constraints` 不是「影响这个视图的全部约束」。要查后者用 [`constraintsAffectingLayoutForAxis()`](ui-view/constraintsaffectinglayoutforaxis.md)。

**两端要在同一棵视图树里。** 约束连接的两个视图没有共同祖先时（比如其中一个还没有 `addSubview`），激活会抛 `TypeError`，信息以 `failed to activate constraint:` 开头。所以要**先把视图加进视图树，再激活约束**。


### 约束不够和约束冲突

约束写错有两种情况，表现不同。

| | 约束不够（有歧义） | 约束冲突 |
| --- | --- | --- |
| 是什么 | 某个量没有被确定，有多组解都满足约束 | 几条必须满足的约束互相矛盾，没有解 |
| 例子 | 只写了左边和上边，没写宽高 | 同一个视图同时写了「宽 = 100」和「宽 = 200」 |
| 表现 | 系统任选一组解。视图可能大小为 0，可能在意外的位置 | 系统放弃其中一条约束，按剩下的布局 |
| 怎么查 | `view.hasAmbiguousLayout` 是 `true` | 没有直接的查询方法。用 `constraintsAffectingLayoutForAxis()` 列出相关约束，自己核对 |

**两种情况系统都不报任何信息**（实测：标准输出、标准错误、系统日志都没有内容）。

约束不够的一个实测例子：停用完整例子里的 `cardHeight` 后，卡片的高度没有约束确定。系统选的结果是卡片高 16 pt、三个色块高 0。

约束冲突时系统放弃哪一条，**未在模拟器验证**。不要依赖这个结果。

最常见的冲突来源是漏写 `translatesAutoresizingMaskIntoConstraints = false`。

想让几条约束在矛盾时有明确的取舍，给它们设不同的[优先级](#优先级)。


### 优先级

每条约束有一个优先级，是 1 到 1000 的数，没有单位。

- **1000**（`'required'`）是「必须满足」。新建约束的默认值。
- **小于 1000** 是「尽量满足」。系统先满足全部 1000 的约束，再按优先级从高到低尽量满足其余的。满足不了的不算冲突。

所以优先级有两个用途：

- 给一个量设「首选值」，同时允许别的约束覆盖它。见[限制最小和最大尺寸](../guides/auto-layout.md#限制最小和最大尺寸)。
- 决定几个视图争空间时谁让步。见[内容抱紧和抗压缩](#内容抱紧和抗压缩)。

写优先级时可以用数，也可以用名字，**读出来永远是数**。七个名字和写错时的警告见 [`priority`](auto-layout/priority.md)。

```js
const cardHeight = new UIView().heightAnchor.constraintEqualToConstant(60);
cardHeight.priority = 'defaultHigh';
console.log(cardHeight.priority);   // 750
cardHeight.priority = 749;
console.log(cardHeight.priority);   // 749
cardHeight.priority = 'required';
```

**效果**：输出 `750` 和 `749`。749 这样的值没有名字，所以读出来统一是数。



### 固有尺寸

有些视图自己知道应该多大，这个大小叫固有尺寸（intrinsic content size）：

| 视图 | 固有尺寸 |
| --- | --- |
| [`UILabel`](ui-label.md) | 文字排出来的大小 |
| [`UIButton`](ui-button.md) | 标题和图标的大小 |
| [`UIImageView`](ui-image.md) | 图片的大小 |
| 普通 `UIView` | 没有。读出来是 `(-1, -1)`（实测） |

有固有尺寸的视图不需要写宽高约束，只写位置。文字变了，固有尺寸跟着变，视图的大小在下一次布局时更新。

固有尺寸不是硬性规定。系统把它当成四条带优先级的约束：宽和高各有「不要比这个大」和「不要比这个小」两条。别的约束可以覆盖它们。这四条的优先级就是下一节的内容。

用 [`view.intrinsicContentSize`](ui-view/intrinsiccontentsize.md) 可以读到固有尺寸，固有尺寸变了用 [`invalidateIntrinsicContentSize()`](ui-view/invalidateintrinsiccontentsize.md) 通知系统。

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

多余或不足的空间**不按比例分摊**，全部由优先级最低的那一个视图承担。要让几个视图按比例分空间，不用这两个优先级，用 `widthAnchor` 之间带 `multiplier` 的约束，见指南里的[两个视图等宽](../guides/auto-layout.md#两个视图等宽)和[宽度是父视图的一半](../guides/auto-layout.md#宽度是父视图的一半)。

两个视图的优先级相等时，系统不知道该拉大或压小哪一个，这是[约束不够](#约束不够和约束冲突)。所以并排放两个标签时，要把其中一个的优先级改掉。

`UILabel` 和普通 `UIView` 的默认值相同，都是抱紧 250、抗压缩 750（实测，水平和垂直都是）。差别只在于 `UILabel` 有固有尺寸，普通 `UIView` 没有。没有固有尺寸的视图，这两个优先级不起作用。


### 约束什么时候算出结果

激活约束、改 `constant`、改优先级，都不会立刻改变视图的 `frame`。系统只是记下「需要重新布局」，在当前这段 JS 执行完之后、下一次屏幕刷新之前统一计算一次。

读 `frame` 不会触发计算。在系统完成这次布局之前读 `frame`，得到的是上一次布局的结果。

想立刻得到结果，调 `layoutIfNeeded()`：

```js
const page = new UIViewController();
const card = new UIView();
card.translatesAutoresizingMaskIntoConstraints = false;
page.view.addSubview(card);
const cardHeight = card.heightAnchor.constraintEqualToConstant(64);
NSLayoutConstraint.activateConstraints([
  card.topAnchor.constraintEqualToAnchor(page.view.topAnchor),
  card.leadingAnchor.constraintEqualToAnchor(page.view.leadingAnchor),
  card.trailingAnchor.constraintEqualToAnchor(page.view.trailingAnchor),
  cardHeight,
]);
page.view.layoutIfNeeded();

cardHeight.constant = 84;
console.log(card.frame.height);   // 还是改之前的值
page.view.layoutIfNeeded();
console.log(card.frame.height);   // 84
```

**效果**：第二次输出 `84`。第一次输出的是改之前的高度，这一点**未在模拟器验证**。

`layoutIfNeeded()` 要在**共同的祖先**上调。它完成这个视图和它的后代的布局。推荐调在页面的根视图上，这样页面里所有视图的 `frame` 都是新的。

只是设置界面、之后不读 `frame` 的代码，不需要调它。

## 示例

### 屏幕底部的一张卡片

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

约束从锚点上创建；往右、往下的偏移是正数，所以卡片右边的偏移是 `-16`；中间块没有写宽度，它的左边和右边分别被左块和右块确定；约束要激活才生效。更多写法见指南[用约束排版](../guides/auto-layout.md)。

## 对应的 iOS API

这张表供照着 Apple 的文档或 iOS 的示例代码写 JS 时查对应的写法。

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

## 与 CSS 的对照

这张表只供熟悉 CSS 的人查对应关系，正文不依赖它。

| CSS | 这里 | 差别 |
| --- | --- | --- |
| `width: 120px` | `widthAnchor.constraintEqualToConstant(120)` | |
| `width: 50%` | `widthAnchor.constraintEqualToAnchor(parent.widthAnchor, { multiplier: 0.5 })` | 可以相对任意视图，不限于父视图 |
| `min-width`、`max-width` | `constraintGreaterThanOrEqualToConstant()`、`constraintLessThanOrEqualToConstant()` | |
| `aspect-ratio: 16 / 9` | `heightAnchor.constraintEqualToAnchor(widthAnchor, { multiplier: 9 / 16 })` | |
| `inline-start`、`inline-end` | `leading`、`trailing` | |
| `env(safe-area-inset-*)` | `safeAreaLayoutGuide` | 给出的是一个可以对齐的矩形，不是四个数 |
| `flex-grow` | 内容抱紧优先级 | 方向相反：值越低越容易被拉大。不按比例分摊，多余的空间全部给最低的那一个 |
| `flex-shrink` | 抗压缩优先级 | 方向相反：值越低越容易被压小。不按比例分摊 |
| `flex: 1` | 把这一项的抱紧优先级设得比其他项低 | |
| `align-items: baseline` | 对齐 `firstBaselineAnchor` | |
| 读 `offsetWidth` 时自动完成布局 | 没有。先调 `layoutIfNeeded()` 再读 `frame` | |
| 文档流（不写规则也按顺序排列） | 没有。用 [`UIStackView`](ui-stack-view.md) | |

## 参见

- [用约束排版](../guides/auto-layout.md)：常见布局的写法和约束写错时怎么查
- [`NSLayoutAnchor`](ns-layout-anchor.md)、[`NSLayoutXAxisAnchor`](ns-layout-x-axis-anchor.md)、[`NSLayoutYAxisAnchor`](ns-layout-y-axis-anchor.md)、[`NSLayoutDimension`](ns-layout-dimension.md)：创建约束的方法
- [`UILayoutGuide`](ui-layout-guide.md)：不显示的矩形
- [`UIView`](ui-view.md)：视图上和约束有关的成员
- [`UIStackView`](ui-stack-view.md)：把视图排成一行或一列，不用自己写约束
- [`UIScrollView`](ui-scroll-view.md)：用 `contentLayoutGuide` 和 `frameLayoutGuide` 说明内容区的大小
- [`UILabel`](ui-label.md)：有固有尺寸的视图，抱紧和抗压缩优先级主要用在它上面
- [枚举](enums.md)：字符串枚举的通用规则
- [`CGRect`](cg-rect.md)、[`CGSize`](cg-size.md)
- [单位](units.md)：pt 是什么
