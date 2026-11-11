---
type: reference
native: UIStackView
status: partial
---

# `UIStackView`

`UIStackView` 是排列容器：把放进去的子视图排成一行或一列，并替它们算好位置和大小。它自己不显示任何东西。

它相当于 CSS 里 `display: flex` 的容器：

| CSS | `UIStackView` |
| --- | --- |
| `flex-direction: row` / `column` | `axis = 'horizontal'` / `'vertical'` |
| `gap` | `spacing` |
| `justify-content` 加上各项的 `flex-grow` | `distribution` |
| `align-items` | `alignment` |
| `padding` | `directionalLayoutMargins`，并把 `isLayoutMarginsRelativeArrangement` 设成 `true` |
| `flex-wrap` | 没有 |

和 flexbox 有七点不同：

- **不换行。** 一行放不下时，各项被压窄，不会折到下一行。
- **子视图要用 `addArrangedSubview()` 加。** 用 `addSubview()` 加进去的视图不参与排列。见[排列项和子视图](#排列项和子视图)。
- **隐藏一项，它就让出位置。** `isHidden = true` 的效果相当于 CSS 的 `display: none`，其余项自动重新排列。
- **间距只能写点数或 `'system'`。** 单位是点（pt），没有 `em` 和百分比，也不跟着字号变。见[单位](units.md)。
- **内边距要多开一个开关。** 只写内边距不生效，还要把 `isLayoutMarginsRelativeArrangement` 设成 `true`。见[给容器加内边距](#给容器加内边距)。
- **没有 `align-self` 和 `order`。** 交叉轴的对齐方式整个容器只有一个。顺序就是加入的顺序。
- **容器自己的底色和圆角不显示。** 见[它自己不显示](#它自己不显示)。

这一页分三部分：先给一个[能直接运行的完整例子](#完整例子)，再按[你想做的事](#常见用法)给出写法和效果，最后是[每个成员的说明](#成员说明)。

## 完整例子

下面的代码从空白 App 开始，在屏幕上方放一列：第一项是一行文字，第二项是一行三个等宽的色块。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 创建一个纵向的排列容器，每两项之间空 16 pt
  const column = new UIStackView();
  column.axis = 'vertical';
  column.spacing = 16;

  // 2. 第一项：一行文字
  const title = new UILabel();
  title.text = '三个等宽的色块';
  column.addArrangedSubview(title);

  // 3. 第二项：一个横向的排列容器，里面是三个色块
  const [red, orange, teal] = ['systemRed', 'systemOrange', 'systemTeal'].map((color) => {
    const block = new UIView();
    block.backgroundColor = color;
    return block;
  });
  const row = new UIStackView([red, orange, teal]);
  row.axis = 'horizontal';
  row.distribution = 'fillEqually';   // 三项等宽
  row.spacing = 12;                   // 每两项之间空 12 pt
  column.addArrangedSubview(row);

  // 4. 把最外层的容器放到页面上，用约束说明它的位置
  column.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(column);
  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    column.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 16 }),
    column.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
    column.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
    // 色块没有自己的高度，所以给这一行指定高度
    row.heightAnchor.constraintEqualToConstant(44),
  ]);
});
```

**效果**

- 屏幕上方、安全区顶边往下 16 pt 处是一行文字「三个等宽的色块」。
- 文字下面空 16 pt，是一行三个色块：红、橙、青。每个高 44 pt。
- 三个色块一样宽，每两个之间空 12 pt。整行左右各离屏幕边缘 16 pt。
- 每个色块的宽度是（整行宽度 − 2 × 12）÷ 3。

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里运行过，「三项等宽」和宽度的算法在验收用例里核对过。

四步分别是：创建容器、放入排列项、嵌套另一个容器、用约束定位最外层。第 4 步用到的约束和 `safeAreaLayoutGuide`（安全区，屏幕上不被刘海和底部横条遮挡的区域）见 [Auto Layout](auto-layout.md) 和 [`UIView`](ui-view.md#安全区)。

> **注意**：第 4 步里 `column.translatesAutoresizingMaskIntoConstraints = false` 这一行不能少。这个属性默认是 `true`，意思是「按 `frame` 摆放这个视图」，而新建视图的 `frame` 是 0 × 0，结果是整列都看不到。放进容器的排列项（`title`、`row`、三个色块）由容器自动设好，不用写。

## 常见用法

以下例子都沿用上面的 `page`、`column`、`title`、`row`、`red`、`orange` 和 `teal`。

### 竖着排一列

```js
const list = new UIStackView();
list.axis = 'vertical';

for (const text of ['第一行', '第二行', '第三行']) {
  const label = new UILabel();
  label.text = text;
  list.addArrangedSubview(label);
}

column.addArrangedSubview(list);
```

**效果**：三行文字从上到下排列，每行和容器一样宽，行与行之间没有空隙。

`axis` 不设时是 `'horizontal'`，所以竖排必须写这一行。

### 横着排一行

```js
const line = new UIStackView();   // axis 默认就是 'horizontal'

for (const text of ['左', '中', '右']) {
  const label = new UILabel();
  label.text = text;
  line.addArrangedSubview(label);
}

column.addArrangedSubview(line);
```

**效果**：三段文字从左到右排在同一行。**未在模拟器验证。**

这一行比三段文字加起来宽。多出来的宽度分给哪一项，见[让其中一项占满剩余空间](#让其中一项占满剩余空间)。

### 设间距

```js
row.spacing = 24;
```

**效果**：每两个色块之间的空隙变成 24 pt，三个色块仍然等宽，各自变窄。

间距只加在相邻两项之间，第一项前面和最后一项后面没有。

### 几项等宽平分

```js
row.distribution = 'fillEqually';
```

**效果**：所有排列项一样宽。每项的宽度是（容器宽度 − 间距 × (项数 − 1)）÷ 项数。

纵向的容器用同一个值，效果是所有项一样高。

### 让其中一项占满剩余空间

横向排两段文字，让左边那段占满剩下的宽度，右边那段只占文字本身的宽度：

```js
const caption = new UILabel();
caption.text = '账户余额';
const amount = new UILabel();
amount.text = '128.00';

const line = new UIStackView([caption, amount]);
line.spacing = 8;

// 让 amount 更坚持自己的宽度，多出来的宽度就都给 caption
amount.setContentHuggingPriority('defaultHigh', { forAxis: 'horizontal' });

column.addArrangedSubview(line);
```

**效果**：「128.00」贴着这一行的右端，宽度正好是文字的宽度。「账户余额」占满左边其余的宽度。**未在模拟器验证。**

`distribution` 是 `'fill'`（默认值）时，容器按各项的「内容抱紧优先级」决定把多出来的空间给谁：优先级最低的那一项被拉长。它相当于 `flex-grow`，但方向相反：数越小越容易被拉长。`UILabel` 和普通 `UIView` 的默认值都是 250，所以要把其中一项调高或调低，才能分出先后。说明见 [`UIView` 的内容优先级](ui-view.md#内容优先级)和 [Auto Layout](auto-layout.md)。

### 交叉轴上的对齐

三个色块高度不同，让它们在这一行里上下居中：

```js
row.alignment = 'center';

NSLayoutConstraint.activateConstraints([
  red.heightAnchor.constraintEqualToConstant(20),
  orange.heightAnchor.constraintEqualToConstant(44),
  teal.heightAnchor.constraintEqualToConstant(32),
]);
```

**效果**：三个色块的高度分别是 20、44、32 pt，中线在同一条水平线上。**未在模拟器验证。**

`alignment` 的默认值是 `'fill'`，所有项都被拉到和容器一样高。改成其他值之后，各项按自己的高度显示，所以要像上面这样给色块指定高度。文字、按钮有自己的高度，不用指定。

全部取值见 [`alignment` 的取值](#alignment-的取值)。

### 隐藏一项让其余自动补位

```js
orange.isHidden = true;
page.view.layoutIfNeeded();   // 让布局立刻算完，下面才能读到新的宽度

console.log(orange.frame.width);              // 0
console.log(row.arrangedSubviews.length);     // 3
```

**效果**

- 橙色块不显示，宽度变成 0。
- 红色块和青色块平分整行，中间只有一个 12 pt 的间距。
- 橙色块仍然在 `arrangedSubviews` 里，个数不变。

```js
orange.isHidden = false;
```

**效果**：橙色块回到原来的位置，又是三项等宽。

不在排列容器里的视图，隐藏之后仍然占着原来的位置。只有排列项隐藏后会让出位置。

### 插入到指定位置

```js
const purple = new UIView();
purple.backgroundColor = 'systemPurple';

row.insertArrangedSubview(purple, { atIndex: 1 });
```

**效果**：紫色块排在第二个，顺序变成红、紫、橙、青，四项等宽。

`atIndex` 从 0 开始。它可以等于当前的项数，效果和 `addArrangedSubview()` 一样，加在末尾。超出范围会抛错，见[方法](#方法)。

### 移除一项

```js
orange.removeFromSuperview();

console.log(row.arrangedSubviews.length);   // 2
console.log(orange.superview);              // null
```

**效果**：橙色块从屏幕上消失，红色块和青色块平分整行。

> **注意**：不要用 `removeArrangedSubview()` 来移除。它只让这一项不再参与排列，视图仍然是容器的子视图，仍然显示在屏幕上。

```js
row.removeArrangedSubview(orange);

console.log(row.arrangedSubviews.length);   // 2
console.log(orange.superview === row);      // true
console.log(row.subviews.length);           // 3
```

**效果**：红色块和青色块平分整行。橙色块仍然在视图树里，容器不再安排它的位置。**橙色块此时显示在哪里未在模拟器验证。**

两者的区别见[排列项和子视图](#排列项和子视图)。

### 某一项后面单独加大间距

```js
row.setCustomSpacing(40, { afterView: red });

console.log(row.customSpacingAfterView(red));   // 40
```

**效果**：红色块和橙色块之间的空隙是 40 pt。橙色块和青色块之间仍然是 `spacing` 的值。

撤回这个单独的设置：

```js
row.setCustomSpacing('default', { afterView: red });
```

**效果**：红色块后面的间距重新使用 `spacing` 的值。

### 用系统推荐的间距

```js
row.spacing = 'system';

console.log(row.spacing);   // 'system'
```

**效果**：间距由系统决定，读出来是字符串 `'system'`，读不到具体的点数。**屏幕上的间距有多大未在模拟器验证。**

单独一项后面也可以用系统间距：

```js
row.setCustomSpacing('system', { afterView: red });
```

### 嵌套：行里套列

排列容器本身也是视图，可以作为另一个容器的排列项。下面在 `row` 的末尾加一列，里面上下各一个色块：

```js
const top = new UIView();
top.backgroundColor = 'systemIndigo';
const bottom = new UIView();
bottom.backgroundColor = 'systemPink';

const stacked = new UIStackView([top, bottom]);
stacked.axis = 'vertical';
stacked.distribution = 'fillEqually';
stacked.spacing = 4;

row.addArrangedSubview(stacked);
```

**效果**

- `row` 里有四项，四项等宽。
- 第四项和这一行一样高（44 pt），里面上下两个色块，各高 20 pt，中间空 4 pt。

> **注意**：嵌套排不出列对齐的表格。每一行各自计算宽度，第二行的第二项和第一行的第二项没有关系。要让列对齐，用约束让同一列的各个视图宽度相等，见 [Auto Layout](auto-layout.md)。

### 给容器加内边距

内边距是容器四条边和排列项之间留出的空白，相当于 CSS 的 `padding`。要写两个属性：`directionalLayoutMargins` 给出四条边各留多少，`isLayoutMarginsRelativeArrangement` 让排列项按它缩进。

```js
const padded = new UIStackView();
padded.axis = 'vertical';
padded.spacing = 8;
padded.isLayoutMarginsRelativeArrangement = true;
padded.directionalLayoutMargins = { top: 16, leading: 16, bottom: 16, trailing: 16 };

for (const text of ['标题', '说明文字']) {
  const label = new UILabel();
  label.text = text;
  padded.addArrangedSubview(label);
}

column.addArrangedSubview(padded);
```

**效果**：两行文字，离容器的四条边各 16 pt。

这段代码没有在模拟器运行过。「排列项按内边距缩进」在验收用例里核对过：200 × 100 pt 的容器，内边距是上 10、左 20、下 30、右 40 pt，排列项的位置是 (20, 10)，大小是 140 × 60 pt。

- 两个属性缺一不可。只写 `directionalLayoutMargins`、不开 `isLayoutMarginsRelativeArrangement`，排列项仍然贴着容器的边缘。
- `leading` 是文字开始的一侧，`trailing` 是文字结束的一侧。中文和英文里 `leading` 在左。
- 内边距的默认值是四边各 8 pt，不是 0。只开开关、不写内边距时用的是这个默认值。
- `directionalLayoutMargins` 是从 `UIView` 继承来的，完整说明见 [`UIView` 的内边距](ui-view.md#内边距)。

> **注意**：容器的某条边伸到安全区外面时（比如容器铺满整个屏幕），系统会把安全区加到那条边的内边距上。要写多少就是多少，把容器的 `insetsLayoutMarginsFromSafeArea` 设成 `false`。

### 加底色和圆角

排列容器自己的底色和圆角不显示。做法是在外面套一个普通视图：底色和圆角设在外层视图上，容器的四条边对齐外层视图，内边距设在容器上。

```js
const card = new UIView();
card.backgroundColor = 'secondarySystemBackground';
card.layer.cornerRadius = 12;

const content = new UIStackView();
content.axis = 'vertical';
content.spacing = 8;
content.isLayoutMarginsRelativeArrangement = true;
content.directionalLayoutMargins = { top: 16, leading: 16, bottom: 16, trailing: 16 };
content.translatesAutoresizingMaskIntoConstraints = false;
card.addSubview(content);

for (const text of ['标题', '说明文字']) {
  const label = new UILabel();
  label.text = text;
  content.addArrangedSubview(label);
}

// 容器的四条边和外层视图对齐
NSLayoutConstraint.activateConstraints([
  content.topAnchor.constraintEqualToAnchor(card.topAnchor),
  content.bottomAnchor.constraintEqualToAnchor(card.bottomAnchor),
  content.leadingAnchor.constraintEqualToAnchor(card.leadingAnchor),
  content.trailingAnchor.constraintEqualToAnchor(card.trailingAnchor),
]);

column.addArrangedSubview(card);
```

**效果**：一个浅灰色的圆角矩形，圆角半径 12 pt。里面是两行文字，文字离矩形的四条边各 16 pt。**未在模拟器验证。**

### 内容太多要滚动

排列容器不会滚动。内容超出屏幕时，把它放进 [`UIScrollView`](ui-scroll-view.md)。完整的写法见 [`UIScrollView` 的完整例子](ui-scroll-view.md#完整例子)，那个例子就是一个纵向排列容器放进滚动视图。

## 概念

### 主轴和交叉轴

`axis` 决定排列的方向，这个方向叫主轴。和它垂直的方向叫交叉轴。含义和 flexbox 里相同。

| `axis` | 主轴 | 交叉轴 |
| --- | --- | --- |
| `'horizontal'` | 水平，从左到右排 | 垂直 |
| `'vertical'` | 垂直，从上到下排 | 水平 |

`distribution` 和 `spacing` 管主轴，`alignment` 管交叉轴。

### 排列项和子视图

排列容器有两个列表：

| 列表 | 内容 | 顺序的含义 |
| --- | --- | --- |
| `subviews` | 全部子视图。继承自 [`UIView`](ui-view.md) | 叠放顺序，后面的盖住前面的 |
| `arrangedSubviews` | 参与排列的子视图，叫排列项。是 `subviews` 的一部分 | 排列顺序，从左到右或从上到下 |

各个操作对两个列表的影响：

| 操作 | `arrangedSubviews` | `subviews` |
| --- | --- | --- |
| `stack.addArrangedSubview(view)` | 加入 | 加入 |
| `stack.insertArrangedSubview(view, { atIndex })` | 加入 | 加入 |
| `new UIStackView([view])` | 加入 | 加入 |
| `stack.removeArrangedSubview(view)` | 移出 | 不变 |
| `view.removeFromSuperview()` | 移出 | 移出 |
| `stack.addSubview(view)` | 不变 | 加入 |

所以：

- 加排列项只调 `addArrangedSubview()`，不用再调 `addSubview()`。
- 移除排列项只调 `removeFromSuperview()`，不用再调 `removeArrangedSubview()`。
- 用 `addSubview()` 加进来的视图不是排列项，容器不安排它的位置。

### 排列项的大小从哪里来

容器按排列项的「固有大小」来分配空间。固有大小是视图根据自己的内容算出的大小：文字有多长、按钮上的字有多宽。它相当于 CSS 里元素的内容尺寸。

- [`UILabel`](ui-label.md)、[`UIButton`](ui-button.md)、[`UIImageView`](ui-image.md) 这类视图有固有大小。
- 普通的 `UIView` 没有固有大小。作为排列项时，要让容器把它拉开（`alignment = 'fill'`、`distribution = 'fillEqually'`），或者用约束给它指定宽高。两样都没有时，它的大小是 0，看不到。

容器对排列项做两件事：

- 把排列项的 `translatesAutoresizingMaskIntoConstraints` 设成 `false`。
- 替排列项建立约束。所以不要再给排列项写决定位置的约束，只在需要时写宽度或高度。

容器自己的位置和大小不归它自己管。它和其他视图一样，要用约束或 `frame` 来定位。作为另一个容器的排列项时，由外层容器来定位。

### 它自己不显示

排列容器只负责排列，自己不画任何东西。给它设 `backgroundColor` 或 `layer.cornerRadius`，屏幕上看不到。

要底色和圆角，在外面套一个普通的 `UIView`，写法见[加底色和圆角](#加底色和圆角)。

### `distribution` 的取值

`distribution` 决定主轴方向上的空间怎么分。下面的示意图都是横向排列，三项的固有宽度分别是 `A` 窄、`B` 中、`C` 宽，容器比三项加起来宽。

`'fill'`（默认值）：各项按固有大小排，多出来的空间给内容抱紧优先级最低的那一项。图里是 `C` 被拉长。

```
┌──────────────────────────────────┐
│[A] [ B  ] [          C          ]│
└──────────────────────────────────┘
```

`'fillEqually'`：所有项一样大，不看固有大小。

```
┌──────────────────────────────────┐
│[    A    ] [    B    ] [    C   ]│
└──────────────────────────────────┘
```

`'fillProportionally'`：多出来的空间按固有大小的比例分，原来宽的那一项分得多。

```
┌──────────────────────────────────┐
│[  A  ] [    B    ] [      C     ]│
└──────────────────────────────────┘
```

`'equalSpacing'`：各项保持固有大小，多出来的空间平均分到项与项之间的空隙里。相当于 `justify-content: space-between`。

```
┌──────────────────────────────────┐
│[A]          [ B  ]        [  C  ]│
└──────────────────────────────────┘
```

`'equalCentering'`：各项保持固有大小，相邻两项的中心之间距离相等。

```
┌──────────────────────────────────┐
│[A]           [ B  ]       [  C  ]│
└──────────────────────────────────┘
  ↑              ↑             ↑
  三个中心之间的距离相等
```

`spacing` 在两类取值里含义不同：

| `distribution` | `spacing` 的含义 |
| --- | --- |
| `'fill'`、`'fillEqually'`、`'fillProportionally'` | 相邻两项之间的间距就是这个值 |
| `'equalSpacing'`、`'equalCentering'` | 相邻两项之间的间距至少是这个值 |

容器比各项加起来窄时，各项被压窄。先压谁由另一个优先级决定，见 [`UIView` 的内容优先级](ui-view.md#内容优先级)。

五个取值里，`'fillEqually'` 的效果在验收用例里核对过。其余四个的效果**未在模拟器验证**。

> **注意**：没有 flexbox 的 `center`、`flex-end`、`space-around`。写 `row.distribution = 'spaceBetween'` 会抛错。要让一组视图整体居中，不要让容器铺满，用约束把容器自己放到中间。

### `alignment` 的取值

`alignment` 决定交叉轴方向上各项怎么对齐。下面的示意图都是横向排列，三项的高度不同。

`'fill'`（默认值）：所有项被拉到和容器一样高。相当于 `align-items: stretch`。

```
┌───────────────┐
│┌───┐┌───┐┌───┐│
││ A ││ B ││ C ││
││   ││   ││   ││
│└───┘└───┘└───┘│
└───────────────┘
```

`'leading'`，别名 `'top'`：顶边对齐。相当于 `align-items: flex-start`。

```
┌───────────────┐
│┌───┐┌───┐┌───┐│
││ A ││ B ││ C ││
│└───┘│   │└───┘│
│     └───┘     │
└───────────────┘
```

`'center'`：中线对齐。相当于 `align-items: center`。

```
┌───────────────┐
│     ┌───┐     │
│┌───┐│   │┌───┐│
││ A ││ B ││ C ││
│└───┘│   │└───┘│
│     └───┘     │
└───────────────┘
```

`'trailing'`，别名 `'bottom'`：底边对齐。相当于 `align-items: flex-end`。

```
┌───────────────┐
│     ┌───┐     │
│┌───┐│   │┌───┐│
││ A ││ B ││ C ││
│└───┘└───┘└───┘│
└───────────────┘
```

`'firstBaseline'`：各项第一行文字的基线对齐。基线是一行文字里字母底部所在的那条线。相当于 `align-items: baseline`。只在横向排列时有效。

`'lastBaseline'`：各项最后一行文字的基线对齐。只在横向排列时有效。各项都只有一行文字时，它和 `'firstBaseline'` 的结果相同：

```
┌──────────────────┐
│      ┌────┐      │
│┌────┐│ Bg │┌────┐│
││ Ag ││    ││ Cg ││   ← 三段文字的基线在同一条水平线上
│└────┘└────┘└────┘│
└──────────────────┘
```

纵向排列时，交叉轴是水平方向：

| 值 | 纵向排列时的效果 |
| --- | --- |
| `'fill'` | 所有项和容器一样宽 |
| `'leading'`（`'top'`） | 各项靠起始边对齐。在从左到右的语言里是左边 |
| `'center'` | 各项水平居中 |
| `'trailing'`（`'bottom'`） | 各项靠结束边对齐。在从左到右的语言里是右边 |
| `'firstBaseline'`、`'lastBaseline'` | 无效。纵向排列要按基线计算间距，用 `isBaselineRelativeArrangement` |

`'fill'` 的效果在验收用例里核对过。其余取值的效果**未在模拟器验证**。

### `alignment` 有两个别名

`'top'` 和 `'leading'` 是同一个值，`'bottom'` 和 `'trailing'` 也是。两个名字都可以写入，读出来固定是 `'leading'` 和 `'trailing'`。

```js
row.alignment = 'top';
console.log(row.alignment);   // 'leading'

row.alignment = 'bottom';
console.log(row.alignment);   // 'trailing'
```

**效果**：控制台依次输出 `leading` 和 `trailing`。

原因是 iOS 的定义里 `UIStackViewAlignmentTop` 就等于 `UIStackViewAlignmentLeading`。一个值只能对应一个读出来的名字，运行时选的是 `'leading'` 和 `'trailing'`。读出来的名字不随 `axis` 改变。

判断当前的对齐方式时，和 `'leading'`、`'trailing'` 比较，不要和 `'top'`、`'bottom'` 比较。

## 成员说明

### 继承关系

```
EventTarget → NSObject → UIResponder → UIView → UIStackView
```

`frame`、`isHidden`、`addSubview()`、锚点等成员继承自 [`UIView`](ui-view.md)，这里不重复。

`UIStackView` 不能被继承，`class X extends UIStackView` 在 `new X()` 时抛错，见[原生类](native-classes.md#不能继承)。

### 创建

#### `new UIStackView(arrangedSubviews)`

```js
const empty = new UIStackView();
const filled = new UIStackView([red, orange, teal]);
```

| 参数 | 类型 | 必填 | 含义 |
| --- | --- | --- | --- |
| `arrangedSubviews` | `UIView` 的数组 | 否 | 一开始就放进去的排列项，按数组顺序排列。不传时容器是空的 |

- 数组里的视图同时成为容器的子视图，不用再调 `addSubview()`。
- 数组里的视图原来有父视图时，会从原来的父视图里移出。
- 数组里的视图的 `translatesAutoresizingMaskIntoConstraints` 被设成 `false`。
- 刚创建的容器位置是 `(0, 0)`，宽高是 0。

### 属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `axis` | `'horizontal'` 或 `'vertical'` | 是 | 是 | `'horizontal'` | 排列方向。`'horizontal'`：从左到右排成一行。`'vertical'`：从上到下排成一列 |
| `distribution` | 字符串 | 是 | 是 | `'fill'` | 主轴方向上的空间怎么分。取值见下表 |
| `alignment` | 字符串 | 是 | 是 | `'fill'` | 交叉轴方向上各项怎么对齐。取值见下表 |
| `spacing` | 数，或 `'system'` | 是 | 是 | `0` | 相邻两项之间的间距，单位 [pt](units.md)。`'system'` 表示用系统推荐的间距 |
| `isBaselineRelativeArrangement` | 布尔 | 是 | 是 | `false` | `true`：纵向排列时，间距从上一项最后一行文字的基线量到下一项第一行文字的基线。`false`：间距从上一项的底边量到下一项的顶边。横向排列时这个属性无效 |
| `isLayoutMarginsRelativeArrangement` | 布尔 | 是 | 是 | `false` | `true`：排列项排在容器的[内边距](ui-view.md#内边距)以内。`false`：排列项贴着容器的边缘，内边距不起作用 |
| `arrangedSubviews` | `UIView` 的数组 | 是 | 否 | 空数组 | 全部排列项，按排列顺序。隐藏的排列项也在里面 |

`distribution` 的取值，示意图见 [`distribution` 的取值](#distribution-的取值)：

| 值 | 效果 |
| --- | --- |
| `'fill'` | 各项按固有大小排。多出来的空间给内容抱紧优先级最低的一项，不够时先压抗压缩优先级最低的一项 |
| `'fillEqually'` | 所有项在主轴方向上一样大 |
| `'fillProportionally'` | 多出来或不够的空间按各项固有大小的比例分 |
| `'equalSpacing'` | 各项保持固有大小，多出来的空间平均分到项与项之间 |
| `'equalCentering'` | 各项保持固有大小，相邻两项的中心之间距离相等 |

`alignment` 的取值，示意图见 [`alignment` 的取值](#alignment-的取值)：

| 值 | 横向排列时 | 纵向排列时 | 读出来的名字 |
| --- | --- | --- | --- |
| `'fill'` | 所有项和容器一样高 | 所有项和容器一样宽 | `'fill'` |
| `'leading'` | 顶边对齐 | 起始边对齐 | `'leading'` |
| `'top'` | 同 `'leading'` | 同 `'leading'` | `'leading'` |
| `'center'` | 上下居中 | 左右居中 | `'center'` |
| `'trailing'` | 底边对齐 | 结束边对齐 | `'trailing'` |
| `'bottom'` | 同 `'trailing'` | 同 `'trailing'` | `'trailing'` |
| `'firstBaseline'` | 第一行文字的基线对齐 | 无效 | `'firstBaseline'` |
| `'lastBaseline'` | 最后一行文字的基线对齐 | 无效 | `'lastBaseline'` |

补充说明：

- `spacing` 写负数时相邻两项会重叠。**未在模拟器验证。**
- `isBaselineRelativeArrangement` 的默认值和读写在验收用例里核对过，设成 `true` 之后的效果**未在模拟器验证**。
- `isLayoutMarginsRelativeArrangement` 用到的内边距是从 `UIView` 继承来的 `directionalLayoutMargins`，见[给容器加内边距](#给容器加内边距)。
- 容器还没加到窗口里、又已经布局过一次时，改内边距或 `isLayoutMarginsRelativeArrangement` 之后要先调 `setNeedsLayout()`，再调 `layoutIfNeeded()`，排列项的位置才会更新。容器在窗口里时不需要。
- `arrangedSubviews` 每次读出来是一个新数组。数组里的视图对象是同一个，可以用 `===` 比较。
- 这些属性都没有变化通知。只有你自己的代码能改它们。

**出错**

| 情况 | 报错 |
| --- | --- |
| `axis` 写了不认识的值 | `TypeError: axis has no value "diagonal"; expected one of: …` |
| `distribution` 写了不认识的值 | `TypeError: distribution has no value "spaceBetween"; expected one of: …` |
| `alignment` 写了不认识的值 | `TypeError: alignment has no value "baseline"; expected one of: fill / leading / firstBaseline / center / trailing / lastBaseline / top / bottom` |
| `spacing` 写了数和 `'system'` 以外的值 | `TypeError: spacing has no value "default"; expected one of: a number / "system"` |

报错里的 `…` 处是全部可选值。枚举的通用规则见[枚举](enums.md)。

> **注意**：`spacing` 不接受 `'default'`。`'default'` 只能用在 `setCustomSpacing()` 里，表示撤回单独的设置。

### 方法

#### `addArrangedSubview(view)`

把一个视图加到排列的末尾。

```js
const gray = new UIView();
gray.backgroundColor = 'systemGray';
row.addArrangedSubview(gray);
```

| 参数 | 类型 | 必填 | 含义 |
| --- | --- | --- | --- |
| `view` | `UIView` | 是 | 要加入的视图 |

- **返回**：无。
- 视图同时成为容器的子视图。它原来有别的父视图时，会从原来的父视图里移出。
- 视图的 `translatesAutoresizingMaskIntoConstraints` 被设成 `false`。
- **出错**：见[通用的出错情况](#通用的出错情况)。

#### `insertArrangedSubview(view, { atIndex })`

把一个视图插到排列的指定位置。

```js
const brown = new UIView();
brown.backgroundColor = 'systemBrown';
row.insertArrangedSubview(brown, { atIndex: 0 });
```

| 参数 | 类型 | 必填 | 含义 |
| --- | --- | --- | --- |
| `view` | `UIView` | 是 | 要插入的视图 |
| `atIndex` | 数（个数，从 0 开始） | 是 | 插入后这个视图在排列里的位置。范围是 0 到当前的项数，等于项数时加在末尾 |

- **返回**：无。
- 视图同时成为容器的子视图，和 `addArrangedSubview()` 相同。
- 视图已经是排列项时，它被移到新的位置。**未在模拟器验证。**
- **出错**：
  - 没传 `atIndex`：`TypeError: insertArrangedSubview needs { atIndex }`
  - `atIndex` 超出范围：`TypeError: insertArrangedSubview: atIndex 99 is out of range (0...3)`。括号里是允许的范围，后一个数是当前的项数

#### `removeArrangedSubview(view)`

让一个视图不再参与排列。视图仍然是容器的子视图。

```js
row.removeArrangedSubview(orange);
```

| 参数 | 类型 | 必填 | 含义 |
| --- | --- | --- | --- |
| `view` | `UIView` | 是 | 要移出排列的视图 |

- **返回**：无。
- 要把视图从屏幕上移走，用 `view.removeFromSuperview()`。它会同时把视图移出排列。
- **出错**：见[通用的出错情况](#通用的出错情况)。

#### `setCustomSpacing(spacing, { afterView })`

单独指定某一个排列项后面的间距。这个值优先于 `spacing` 属性。

```js
row.setCustomSpacing(40, { afterView: red });
```

| 参数 | 类型 | 必填 | 含义 |
| --- | --- | --- | --- |
| `spacing` | 数、`'system'` 或 `'default'` | 是 | 间距。取值见下表 |
| `afterView` | `UIView` | 是 | 间距加在这个排列项的后面 |

| `spacing` 的值 | 效果 |
| --- | --- |
| 数 | 这一项后面的间距是这么多 [pt](units.md) |
| `'system'` | 这一项后面用系统推荐的间距 |
| `'default'` | 撤回单独的设置，这一项后面重新使用 `spacing` 属性的值 |

- **返回**：无。
- 视图被移出排列之后，给它设的间距失效。排列项在排列里换位置时，间距跟着它移动。**这两条未在模拟器验证。**
- **出错**：
  - 没传 `afterView`：`TypeError: setCustomSpacing needs { afterView }`
  - `spacing` 不是数、`'system'` 或 `'default'`：`TypeError: setCustomSpacing has no value "wide"; expected one of: a number / "system" / "default"`

#### `customSpacingAfterView(view)`

读某一个排列项后面单独设的间距。

```js
const spacing = row.customSpacingAfterView(red);
if (spacing === 'default') {
  console.log('没有单独设过');
}
```

| 参数 | 类型 | 必填 | 含义 |
| --- | --- | --- | --- |
| `view` | `UIView` | 是 | 要查的排列项 |

- **返回**：数（单位 [pt](units.md)）、`'system'` 或 `'default'`。没有单独设过时是 `'default'`。
- **出错**：见[通用的出错情况](#通用的出错情况)。

### 通用的出错情况

| 情况 | 报错 |
| --- | --- |
| 把还没有原生对象的窗口当作参数传入（`new UIWindow()` 不传场景，并且还没给 `windowScene` 赋值） | `TypeError: addArrangedSubview:: UIWindow has no native object yet, so it cannot be passed as an argument`，开头是方法对应的原生名字 |
| 在不是由构造函数创建的对象上调用（比如 `Object.create(UIStackView.prototype)`） | `TypeError: axis: Illegal invocation`，开头是属性名或方法对应的原生名字 |

详见[原生类](native-classes.md#三种没有原生对象话术不同)。

> **注意**：参数不是视图时不报错，调用被忽略。`row.addArrangedSubview(null)` 什么都不发生，构造函数的数组里不是视图的元素会被跳过。类型检查能发现这种错误。

## 与 iOS 原生写法的对照

如果你在看 Apple 的文档或 iOS 的示例代码，按这张表换成 JS 的写法。

| ObjC | JS |
| --- | --- |
| `[[UIStackView alloc] init]` | `new UIStackView()` |
| `[[UIStackView alloc] initWithArrangedSubviews:@[a, b]]` | `new UIStackView([a, b])` |
| `stack.axis = UILayoutConstraintAxisVertical` | `stack.axis = 'vertical'` |
| `stack.distribution = UIStackViewDistributionFillEqually` | `stack.distribution = 'fillEqually'` |
| `stack.alignment = UIStackViewAlignmentCenter` | `stack.alignment = 'center'` |
| `stack.alignment = UIStackViewAlignmentTop` | `stack.alignment = 'top'`，读出来是 `'leading'` |
| `stack.spacing = 12` | `stack.spacing = 12` |
| `stack.spacing = UIStackViewSpacingUseSystem` | `stack.spacing = 'system'` |
| `stack.baselineRelativeArrangement = YES` | `stack.isBaselineRelativeArrangement = true` |
| `stack.layoutMarginsRelativeArrangement = YES` | `stack.isLayoutMarginsRelativeArrangement = true` |
| `stack.directionalLayoutMargins = NSDirectionalEdgeInsetsMake(16, 16, 16, 16)` | `stack.directionalLayoutMargins = new NSDirectionalEdgeInsets(16, 16, 16, 16)` |
| `stack.arrangedSubviews` | `stack.arrangedSubviews` |
| `[stack addArrangedSubview:v]` | `stack.addArrangedSubview(v)` |
| `[stack insertArrangedSubview:v atIndex:1]` | `stack.insertArrangedSubview(v, { atIndex: 1 })` |
| `[stack removeArrangedSubview:v]` | `stack.removeArrangedSubview(v)` |
| `[stack setCustomSpacing:40 afterView:v]` | `stack.setCustomSpacing(40, { afterView: v })` |
| `[stack setCustomSpacing:UIStackViewSpacingUseDefault afterView:v]` | `stack.setCustomSpacing('default', { afterView: v })` |
| `[stack customSpacingAfterView:v]` | `stack.customSpacingAfterView(v)` |

枚举值的换算规则：去掉类型前缀，首字母改小写。`UIStackViewDistributionEqualSpacing` 写成 `'equalSpacing'`。

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 指定用哪个子视图的文字做基线对齐 | `viewForFirstBaselineLayout`、`viewForLastBaselineLayout` | 未实现 |
| 放不下时自动换行，或排成网格 | iOS 没有对应的容器，要用 `UICollectionView` | 未实现 |
| 排列项位置变化时带动画 | `UIView` 动画 | 未实现 |
| 排列项很多时只创建看得见的那些 | `UITableView`、`UICollectionView` | 未实现 |

## 参见

- [`UIView`](ui-view.md)：继承来的成员，`isHidden`、`removeFromSuperview()`、内容优先级都在那里
- [Auto Layout](auto-layout.md)：给容器自己定位要用约束；内容抱紧和抗压缩优先级的完整说明
- [`UIScrollView`](ui-scroll-view.md)：内容超出屏幕时，把排列容器放进去
- [`UILabel`](ui-label.md)：最常见的排列项，有固有大小
- [枚举](enums.md)：字符串取值的通用规则和报错格式
- [单位](units.md)：pt 是什么，间距会不会跟着缩放
- [实现原理：Auto Layout](../internals/auto-layout.md)：别名和间距令牌的实现

← 返回 [API 文档](README.md)
