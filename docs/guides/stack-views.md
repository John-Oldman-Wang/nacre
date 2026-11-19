# 把视图排成一行或一列

这一篇讲怎么用 [`UIStackView`](../api/ui-stack-view.md) 把一组视图排成一行或一列：等宽平分、让一项占满剩余空间、对齐、隐藏、插入和移除、内边距、底色和圆角、嵌套成多行。每个属性和方法的细节在 [`UIStackView`](../api/ui-stack-view.md) 的参考页。

## 推荐的做法

- **页面的主体用「滚动视图里放一个纵向排列容器」。** 页面上的每一块内容是一个排列项，内容超出屏幕时可以滚动，增删内容时不用改任何约束。完整写法见 [`UIScrollView` 的完整例子](scrolling.md#第一个滚动页面)。
- **加入用 `addArrangedSubview()`，移除用 `removeFromSuperview()`。** `addSubview()` 加进来的视图不参与排列；`removeArrangedSubview()` 移出排列之后视图仍然留在容器里。见[排列项和子视图](../api/ui-stack-view.md#排列项和子视图)。
- **临时不显示的项用 `isHidden`，不要移除再加回。** 隐藏的项保留在原来的顺序里，显示回来时位置不变。
- **四周的留白用内边距，不要多套一层视图。** 见[给容器加内边距](#给容器加内边距)。
- **底色和圆角设在外层的普通视图上。** 排列容器自己的底色和圆角不显示，见[加底色和圆角](#加底色和圆角)。

## 第一个例子

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

四步分别是：创建容器、放入排列项、嵌套另一个容器、用约束定位最外层。第 4 步用到的约束和 `safeAreaLayoutGuide`（安全区，屏幕上不被刘海和底部横条遮挡的区域）见指南[用约束排版](auto-layout.md)和 [`UIView`](../api/ui-view.md)。

> **注意**：第 4 步里 `column.translatesAutoresizingMaskIntoConstraints = false` 这一行不能少。这个属性默认是 `true`，意思是「按 `frame` 定位这个视图」，而新建视图的 `frame` 是 0 × 0，结果是整列都看不到。放进容器的排列项（`title`、`row`、三个色块）由容器自动设好，不用写。

这个例子没有给 `column` 写高度，也没有给 `title` 写任何约束。`column` 的高度由两个排列项的高度加间距决定，`title` 的高度由文字决定。

下面各节沿用这里的 `page`、`column`、`row` 和三个色块 `red`、`orange`、`teal`。单独试某一节时，先写这几行：

```js
const page = new UIViewController();
const column = new UIStackView();
column.axis = 'vertical';
page.view.addSubview(column);
const red = new UIView();
const orange = new UIView();
const teal = new UIView();
const row = new UIStackView([red, orange, teal]);
row.distribution = 'fillEqually';
column.addArrangedSubview(row);
```

## 给容器定位

排列容器只管里面的排列项，不管自己。推荐的写法是：只确定容器的位置和垂直于排列方向的大小（纵向容器给左右两边，横向容器给上下两边或高度），沿排列方向的大小留给内容决定。用约束定位时别忘了容器自己的 `translatesAutoresizingMaskIntoConstraints = false`。

容器作为另一个容器的排列项时，由外层容器定位，什么都不用写。

## 竖着排一列

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

## 横着排一行

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

## 设间距

```js
row.spacing = 24;
```

**效果**：每两个色块之间的空隙变成 24 pt，三个色块仍然等宽，各自变窄。

间距只加在相邻两项之间，第一项前面和最后一项后面没有。

## 几项等宽平分

```js
row.distribution = 'fillEqually';
```

**效果**：所有排列项一样宽。每项的宽度是（容器宽度 − 间距 × (项数 − 1)）÷ 项数。

纵向的容器用同一个值，效果是所有项一样高。

## 让其中一项占满剩余空间

横向排两段文字，让左边那段占满剩下的宽度，右边那段只占文字本身的宽度：

```js
const caption = new UILabel();
caption.text = '账户余额';
const amount = new UILabel();
amount.text = '128.00';

const balance = new UIStackView([caption, amount]);
balance.spacing = 8;

// 让 amount 更坚持自己的宽度，多出来的宽度就都给 caption
amount.setContentHuggingPriority('defaultHigh', { forAxis: 'horizontal' });

column.addArrangedSubview(balance);
```

**效果**：「128.00」贴着这一行的右端，宽度正好是文字的宽度。「账户余额」占满左边其余的宽度。**未在模拟器验证。**

`distribution` 是 `'fill'`（默认值）时，容器按各项的「内容抱紧优先级」决定把多出来的空间给谁。内容抱紧优先级是一个 1 到 1000 的数，表示视图不愿意被拉得比自己的内容大的程度。优先级最低的那一项被拉长，多出来的空间全部给它，不按比例分。`UILabel` 和普通 `UIView` 的默认值都是 250（实测），所以要把其中一项调高或调低，才能分出先后。完整说明见 [`setContentHuggingPriority()`](../api/ui-view/setcontenthuggingpriority.md)。

## 交叉轴上的对齐

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

全部取值见 [`alignment`](../api/ui-stack-view/alignment.md)。

## 隐藏一项让其余自动补位

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

需要临时去掉一项时推荐用隐藏。隐藏的项保留在排列里，顺序不变，之后显示回来不用重新计算插入的位置。

## 插入到指定位置

```js
const purple = new UIView();
purple.backgroundColor = 'systemPurple';

row.insertArrangedSubview(purple, { atIndex: 1 });
```

**效果**：紫色块排在第二个，顺序变成红、紫、橙、青，四项等宽。

`atIndex` 从 0 开始。它可以等于当前的项数，效果和 `addArrangedSubview()` 一样，加在末尾。超出范围、没传或者传了 `undefined` 都会抛 `TypeError`，不会插入，见 [`insertArrangedSubview()`](../api/ui-stack-view/insertarrangedsubview.md)。

## 移除一项

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

两者的区别见[排列项和子视图](../api/ui-stack-view.md#排列项和子视图)。

## 某一项后面单独加大间距

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

## 用系统推荐的间距

```js
row.spacing = 'system';

console.log(row.spacing);   // 'system'
```

**效果**：间距由系统决定，读出来是字符串 `'system'`，读不到具体的点数。**屏幕上的间距有多大未在模拟器验证。**

单独一项后面也可以用系统间距：

```js
row.setCustomSpacing('system', { afterView: red });
```

## 排成多行

排列容器只排一行或一列，不会换行：一行放不下时各项被压窄（压窄的效果**未在模拟器验证**）。需要多行时由 JS 决定每行放几项：每一行建一个横向容器，再把这些横向容器放进一个纵向容器。排列容器本身也是视图，可以作为另一个容器的排列项。

下面在 `row` 的末尾加一列，里面上下各一个色块：

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

> **注意**：嵌套的各行各自计算宽度，第二行的第二项和第一行的第二项没有关系。各行的项数和间距相同并且都用 `'fillEqually'` 时，各行算出的宽度相同。其他情况要让列对齐，用约束让同一列的各个视图宽度相等，见[用约束排版](auto-layout.md)。

## 给容器加内边距

内边距是容器四条边和排列项之间留出的空白，单位 [pt](../api/units.md)。要写两个属性：`directionalLayoutMargins` 给出四条边各留多少，`isLayoutMarginsRelativeArrangement` 让排列项按它缩进。

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
- `directionalLayoutMargins` 是从 `UIView` 继承来的，完整说明见 [`directionalLayoutMargins`](../api/ui-view/directionallayoutmargins.md)。四个字段都要写，少一个抛 `TypeError`。
- 只留上下或只留左右时，其余两边写 `0`。

> **注意**：容器的某条边伸到安全区外面时（比如容器铺满整个屏幕），系统会把安全区加到那条边的内边距上。要写多少就是多少，把容器的 `insetsLayoutMarginsFromSafeArea` 设成 `false`。

## 加底色和圆角

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

## 内容太多要滚动

排列容器不会滚动。内容超出屏幕时，把它放进 [`UIScrollView`](../api/ui-scroll-view.md)。完整的写法见 [`UIScrollView` 的完整例子](scrolling.md#第一个滚动页面)，那个例子就是一个纵向排列容器放进滚动视图。

## 参见

- [`UIStackView`](../api/ui-stack-view.md)：全部成员
- [`UIView`](../api/ui-view.md)：`isHidden`、`removeFromSuperview()`、内边距、内容优先级
- [用约束排版](auto-layout.md)：给容器自己定位
- [`UIScrollView`](../api/ui-scroll-view.md)：内容超出屏幕时
