---
type: reference
native: UIStackView
status: partial
---

# `UIStackView`

**`UIStackView`** 表示一个排列容器。它把放进去的子视图沿一个方向排成一行或一列，并自动安排每个子视图的位置和大小。它自己不显示任何东西。

排列的方向由 [`axis`](ui-stack-view/axis.md) 决定：`'horizontal'` 排成一行，`'vertical'` 排成一列。子视图之间的间距由 [`spacing`](ui-stack-view/spacing.md) 决定，单位是 [pt](units.md)，不随字号变化。沿排列方向怎么分配空间由 [`distribution`](ui-stack-view/distribution.md) 决定，垂直于排列方向怎么对齐由 [`alignment`](ui-stack-view/alignment.md) 决定。

参与排列的子视图叫排列项，用 [`addArrangedSubview()`](ui-stack-view/addarrangedsubview.md) 加入。排列的顺序就是加入的顺序。容器替排列项建立约束（[Auto Layout](auto-layout.md) 里视图之间的位置关系），排列项的位置不用写，也不要写。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → `UIStackView`

怎么用它排出常见的界面，见指南[把视图排成一行或一列](../guides/stack-views.md)。

## 构造函数

[`UIStackView()`](ui-stack-view/constructor.md)

创建一个排列容器，可以一开始就放进一组排列项。

## 实例属性

还继承 [`UIView`](ui-view.md) 的属性。排列容器常用的继承属性是 `isHidden`（用在排列项上）、`directionalLayoutMargins`（内边距）、`translatesAutoresizingMaskIntoConstraints`。

| 属性 | 说明 |
| --- | --- |
| [`axis`](ui-stack-view/axis.md) | 排成一行还是一列 |
| [`distribution`](ui-stack-view/distribution.md) | 排列方向上的空间怎么分 |
| [`alignment`](ui-stack-view/alignment.md) | 垂直于排列方向怎么对齐 |
| [`spacing`](ui-stack-view/spacing.md) | 相邻两项之间的间距 |
| [`isBaselineRelativeArrangement`](ui-stack-view/isbaselinerelativearrangement.md) | 纵向排列时间距按文字基线量 |
| [`isLayoutMarginsRelativeArrangement`](ui-stack-view/islayoutmarginsrelativearrangement.md) | 排列项排在内边距以内 |
| [`arrangedSubviews`](ui-stack-view/arrangedsubviews.md) <small>只读</small> | 全部排列项，按排列顺序 |

## 实例方法

还继承 [`UIView`](ui-view.md) 的方法。移除排列项用继承来的 [`removeFromSuperview()`](ui-view/removefromsuperview.md)。

| 方法 | 说明 |
| --- | --- |
| [`addArrangedSubview()`](ui-stack-view/addarrangedsubview.md) | 加到排列的末尾 |
| [`insertArrangedSubview()`](ui-stack-view/insertarrangedsubview.md) | 插到排列的指定位置 |
| [`removeArrangedSubview()`](ui-stack-view/removearrangedsubview.md) | 移出排列，视图仍然是容器的子视图 |
| [`setCustomSpacing()`](ui-stack-view/setcustomspacing.md) | 单独指定某一项后面的间距 |
| [`customSpacingAfterView()`](ui-stack-view/customspacingafterview.md) | 读某一项后面单独设的间距 |

## 事件

`UIStackView` 自己不派发事件。继承自 [`UIView`](ui-view.md) 的 [`traitchange`](ui-view/traitchange-event.md) 照常派发。

## 概念

### 主轴和交叉轴

`axis` 决定排列的方向，这个方向叫主轴。和它垂直的方向叫交叉轴。

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
| [`stack.addArrangedSubview(view)`](ui-stack-view/addarrangedsubview.md) | 加入 | 加入 |
| [`stack.insertArrangedSubview(view, { atIndex })`](ui-stack-view/insertarrangedsubview.md) | 加入 | 加入 |
| [`new UIStackView([view])`](ui-stack-view/constructor.md) | 加入 | 加入 |
| [`stack.removeArrangedSubview(view)`](ui-stack-view/removearrangedsubview.md) | 移出 | 不变 |
| [`view.removeFromSuperview()`](ui-view/removefromsuperview.md) | 移出 | 移出 |
| `stack.addSubview(view)` | 不变 | 加入 |

所以：

- 加排列项只调 `addArrangedSubview()`，不用再调 `addSubview()`。
- 移除排列项只调 `removeFromSuperview()`，不用再调 `removeArrangedSubview()`。
- 用 `addSubview()` 加进来的视图不是排列项，容器不安排它的位置。

### 排列项的大小从哪里来

容器按排列项的「固有大小」来分配空间。固有大小是视图根据自己的内容算出的大小：文字有多长、按钮上的字有多宽。内容变了，固有大小跟着变，容器在下一次布局时重新排列。

- [`UILabel`](ui-label.md)、[`UIButton`](ui-button.md)、[`UIImageView`](ui-image.md) 这类视图有固有大小。
- 普通的 `UIView` 没有固有大小。作为排列项时，要让容器把它拉开（`alignment = 'fill'`、`distribution = 'fillEqually'`），或者用约束给它指定宽高。两样都没有时，它的大小是 0，看不到。

容器对排列项做两件事：

- 把排列项的 `translatesAutoresizingMaskIntoConstraints` 设成 `false`。
- 替排列项建立约束。所以不要再给排列项写决定位置的约束，只在需要时写宽度或高度。

容器自己的位置不归它自己管。它和其他视图一样，要用约束或 `frame` 来定位。作为另一个容器的排列项时，由外层容器来定位。没有约束限定的方向上，容器的大小由排列项决定。

### 它自己不显示

排列容器只负责排列，自己不画任何东西。给它设 `backgroundColor` 或 `layer.cornerRadius`，屏幕上看不到。

要底色和圆角，在外面套一个普通的 `UIView`，写法见指南里的[加底色和圆角](../guides/stack-views.md#加底色和圆角)。

### 容器自己的位置和大小

排列容器只管里面的排列项，不管自己。它自己的位置要像其他视图一样，用约束或 `frame` 确定。用约束时，容器自己的 `translatesAutoresizingMaskIntoConstraints` 要设成 `false`，容器不会替自己设。漏了这一行，整个容器的大小是 0，里面的内容都看不到，控制台没有任何输出。

容器的大小可以不写。没有约束限定宽度或高度的方向上，容器的大小由排列项决定：各项的大小加上间距。实测：一列 12 行、每行高 36 pt、间距 6 pt 的纵向容器，没有写高度，算出来的高度是 498 pt（12 × 36 + 11 × 6）。

容器作为另一个容器的排列项时，由外层容器定位，什么都不用写。

### 隐藏的排列项让出位置

把排列项的 `isHidden` 设成 `true`，它让出位置，其余项自动重新排列。设回 `false`，它回到原来的位置。实测：三项等宽的一行隐藏中间一项后，隐藏项的宽度是 0，其余两项平分整行，中间只有一个间距。隐藏的排列项仍然在 `arrangedSubviews` 里。

不在排列容器里的视图没有这个行为，隐藏之后仍然占着原来的位置。

### 只排一行或一列

排列容器不换行。一行放不下时，各项被压窄，不会折到下一行（压窄的效果**未在模拟器验证**）。需要多行时由 JS 决定每行放几项，写法见指南里的[排成多行](../guides/stack-views.md#排成多行)。

内容超出屏幕时排列容器不会滚动，要把它放进 [`UIScrollView`](ui-scroll-view.md)。

## 示例

### 一列里放一行文字和一行色块

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

四步分别是：创建容器、放入排列项、嵌套另一个容器、用约束定位最外层。第 4 步用到的约束和 `safeAreaLayoutGuide`（安全区，屏幕上不被刘海和底部横条遮挡的区域）见 [`NSLayoutConstraint`](auto-layout.md) 和 [`UIView`](ui-view.md)。

> **注意**：第 4 步里 `column.translatesAutoresizingMaskIntoConstraints = false` 这一行不能少。这个属性默认是 `true`，意思是「按 `frame` 定位这个视图」，而新建视图的 `frame` 是 0 × 0，结果是整列都看不到。放进容器的排列项（`title`、`row`、三个色块）由容器自动设好，不用写。

这个例子没有给 `column` 写高度，也没有给 `title` 写任何约束。`column` 的高度由两个排列项的高度加间距决定，`title` 的高度由文字决定。

更多写法见指南[把视图排成一行或一列](../guides/stack-views.md)。

## 对应的 iOS API

这张表供照着 Apple 的文档或 iOS 的示例代码写 JS 时查对应的写法。

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

## 与 CSS 的对照

这张表只供熟悉 flexbox 的人查对应关系，正文不依赖它。

| CSS | `UIStackView` | 差别 |
| --- | --- | --- |
| `display: flex` | `new UIStackView()` | 子视图要用 `addArrangedSubview()` 加入 |
| `flex-direction: row` / `column` | `axis = 'horizontal'` / `'vertical'` | |
| `gap` | `spacing` | 只能写 pt 或 `'system'`，没有 `em` 和百分比 |
| `justify-content` 加上各项的 `flex-grow` | `distribution` | 没有 `center`、`flex-end`、`space-around` 的对应取值 |
| `justify-content: space-between` | `distribution = 'equalSpacing'` | |
| `flex-grow` | 排列项的内容抱紧优先级 | 方向相反：值越低越容易被拉长。不按比例分 |
| `align-items: stretch` | `alignment = 'fill'` | |
| `align-items: flex-start` / `center` / `flex-end` | `alignment = 'leading'` / `'center'` / `'trailing'` | |
| `align-items: baseline` | `alignment = 'firstBaseline'` | 只在横向排列时有效 |
| `padding` | `directionalLayoutMargins`，并把 `isLayoutMarginsRelativeArrangement` 设成 `true` | 默认值是四边各 8 pt，不是 0 |
| `display: none` | 排列项的 `isHidden = true` | |
| `flex-wrap` | 没有 | |
| `align-self`、`order` | 没有 | 对齐方式整个容器只有一个，顺序就是加入的顺序 |
| 容器自己的 `background`、`border-radius` | 不显示 | 在外面套一个普通视图 |

## 参见

- [把视图排成一行或一列](../guides/stack-views.md)：等宽平分、占满剩余空间、对齐、隐藏、内边距、底色、嵌套
- [`UIView`](ui-view.md)：继承来的成员，`isHidden`、`removeFromSuperview()`、内容优先级都在那里
- [`NSLayoutConstraint`](auto-layout.md)：给容器自己定位要用约束
- [`UIScrollView`](ui-scroll-view.md)：内容超出屏幕时，把排列容器放进去
- [`UILabel`](ui-label.md)：最常见的排列项，有固有大小
- [枚举](enums.md)：字符串取值的通用规则，写错时的警告和报错格式
- [单位](units.md)：pt 是什么
