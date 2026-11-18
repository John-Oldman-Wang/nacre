---
type: reference
native: UISegmentedControl
status: partial
---

# UISegmentedControl

`UISegmentedControl` 表示一个分段选择：横着排开的几段，每段是一个标题或者一张图，同一时刻只有一段是选中的。它用在「日 / 周 / 月」「全部 / 未读」这类在两到五个并列的选项之间切换的地方。

它是 [`UIControl`](ui-control.md) 的子类，所以也是一个视图：用 `new UISegmentedControl([...])` 创建，用 `addSubview` 放到页面上。

段用下标指代，从 0 数。选中的是哪一段读写 `selectedSegmentIndex`。用户点了另一段之后，控件派发 `change` 事件。

**刚创建出来时没有选中的段**，`selectedSegmentIndex` 是 -1。一般在创建之后马上写一个初始值。

**代码写 `selectedSegmentIndex` 不派发 `change`。** 只有用户的操作才派发。这一条**未在模拟器验证**，来自 iOS 的定义。

**下标越界会抛 `TypeError`。** 读写某一段的标题、图、宽度，以及写 `selectedSegmentIndex`，给了不存在的下标都会抛，不会被忽略。

控件的宽度按内容自动算，也可以用约束或 `frame` 给一个更大的宽度，各段平分。高度由系统决定，实测 iOS 27.2 上是 32 pt（[pt 是什么](units.md)）。

> **注意**：这一页里的默认值、读写的结果和报错，在模拟器上用一个不带界面的程序跑过。屏幕上的样子和事件的派发还没有在模拟器上验证，下面在对应的地方标出。

## 完整例子

下面的代码从空白 App 开始，在屏幕上放一个「日 / 周 / 月」的分段选择，下面的文字显示选中了哪一段。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 三段，一开始选中第 0 段
  const titles = ['日', '周', '月'];
  const seg = new UISegmentedControl(titles);
  seg.selectedSegmentIndex = 0;

  // 2. 显示选中了哪一段
  const label = new UILabel();
  label.text = '按日看';

  // 3. 用户点了另一段时更新文字
  seg.addEventListener('change', () => {
    label.text = '按' + titles[seg.selectedSegmentIndex] + '看';
  });

  // 4. 竖着排好放到页面上，左右各留 16 pt
  const column = new UIStackView([seg, label]);
  column.axis = 'vertical';
  column.spacing = 12;
  column.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(column);
  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    column.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 24 }),
    column.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
    column.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
  ]);
});
```

**效果**（未在模拟器验证）：

- 屏幕上方出现一条横贯屏幕的分段选择，三段等宽，「日」那一段是选中的样子。下面是「按日看」。
- 点「周」，选中的那一块滑到「周」，文字变成「按周看」。
- 再点一次已经选中的「周」，什么都不发生。

`safeAreaLayoutGuide` 是页面上不被刘海和圆角遮住的那块区域，见 [Auto Layout](auto-layout.md)。

## 常见用法

以下例子都沿用上面的 `seg`。

### 用图标当一段

构造时的数组里，标题和图可以混着给：

```js
const list = UIImage.systemImageNamed('list.bullet');
const grid = UIImage.systemImageNamed('square.grid.2x2');
if (list !== null && grid !== null) {
  const view = new UISegmentedControl([list, grid]);
  view.selectedSegmentIndex = 0;
}
```

**效果**（未在模拟器验证）：两段，一段是列表图标，一段是宫格图标。

`systemImageNamed` 取的是 SF Symbols，系统自带的一套图标，见 [`UIImage`](ui-image.md)。它在名字不存在时返回 `null`，而数组里放 `null` 会抛，所以先判空。

一段要么是标题要么是图。给一个图片段设标题，它的图就没有了；反过来也一样。

### 取消选中

```js
seg.selectedSegmentIndex = -1;
```

**效果**（未在模拟器验证）：没有任何一段是选中的样子。

### 运行中加一段、删一段

```js
seg.insertSegmentWithTitle('年', { atIndex: 3, animated: true });
console.log(seg.numberOfSegments);
seg.removeSegmentAtIndex(0, { animated: true });
console.log(seg.titleForSegmentAtIndex(0));
```

**效果**：输出 `4`，然后输出 `周`。屏幕上最右边多出「年」，接着最左边的「日」消失，带动画（未在模拟器验证）。

段数在调用返回时就已经变了，不用等动画结束。

插入和删除会移动后面各段的下标，`selectedSegmentIndex` 跟着变，仍然指着原来选中的那一段。删掉的正好是选中的那一段时，`selectedSegmentIndex` 变成 -1。

### 改某一段的标题

```js
seg.setTitle('本周', { forSegmentAtIndex: 1 });
console.log(seg.titleForSegmentAtIndex(1));
```

**效果**：输出 `本周`。

### 禁用某一段

```js
seg.setEnabled(false, { forSegmentAtIndex: 2 });
```

**效果**（未在模拟器验证）：第 2 段变淡，点它没有反应。其余的段照常。

要整个控件都不能点，写 `seg.isEnabled = false`。

### 当一排按钮用

```js
seg.isMomentary = true;
seg.addEventListener('change', () => {
  console.log('点了第', seg.selectedSegmentIndex, '段');
});
```

**效果**（未在模拟器验证）：点一段，它闪一下，不保持选中的样子；控制台输出点的是第几段。连续点同一段，每次都输出。

### 让各段的宽度跟着内容走

```js
seg.apportionsSegmentWidthsByContent = true;
```

**效果**（未在模拟器验证）：标题长的段宽一些，标题短的段窄一些，不再等宽。

单独指定某一段的宽度用 `setWidth`：

```js
seg.setWidth(120, { forSegmentAtIndex: 0 });
```

**效果**（未在模拟器验证）：第 0 段宽 120 pt，其余的段平分剩下的宽度。

## 成员说明

`UISegmentedControl` 继承 [`UIControl`](ui-control.md) 和 [`UIView`](ui-view.md) 的全部成员。下面只列它自己的。

### 构造

```js
const seg = new UISegmentedControl(['日', '周', '月']);
```

- **参数**：一个数组，每一项是字符串（标题）或 `UIImage`（图）。可以不给，也可以给 `null` 或空数组，得到一段都没有的控件。数字和布尔值会转成字符串。
- **出错**：
  - 给的不是数组：`TypeError: new UISegmentedControl needs an array of strings and UIImages, got "日周月"`
  - 某一项不是字符串也不是图：`TypeError: new UISegmentedControl: items[1] must be a string or a UIImage, got null`

### 属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `numberOfSegments` | `number` | 是 | 否 | 构造时给了几项 | 一共几段，个数 |
| `selectedSegmentIndex` | `number` | 是 | 是 | -1 | 选中的是第几段，从 0 数。-1 表示没有选中的 |
| `isMomentary` | `boolean` | 是 | 是 | `false` | `true`：点完不保持选中的样子。`false`：点了哪段，哪段保持选中 |
| `apportionsSegmentWidthsByContent` | `boolean` | 是 | 是 | `false` | `true`：各段的宽度按内容分。`false`：各段等宽 |
| `selectedSegmentTintColor` | 颜色字符串或 `null` | 是 | 是 | `null` | 选中的那一段底下那块的颜色。`null` 是系统默认。写入时也接受 `UIColor` 对象 |

`selectedSegmentIndex` 写入时，小数向零取整。

`selectedSegmentIndex` 变了的通知：用户点了另一段时派发 `change`。代码写入不派发；插入、删除段引起的下标变化也不派发（这两条未在模拟器验证）。

- **出错**：`selectedSegmentIndex` 越界：`TypeError: selectedSegmentIndex 4 is out of range; expected 0 to 3, or -1 for none selected`。属性保持原来的值

### 插入和删除

| 方法 | 作用 |
| --- | --- |
| `insertSegmentWithTitle(title, { atIndex, animated })` | 在第 `atIndex` 段前面插一个标题段 |
| `insertSegmentWithImage(image, { atIndex, animated })` | 在第 `atIndex` 段前面插一个图片段 |
| `removeSegmentAtIndex(index, { animated })` | 删掉第 `index` 段 |
| `removeAllSegments()` | 删掉全部的段 |

都没有返回值。`animated` 可以不带，不带就是没有动画。

`atIndex` 必须带。它等于现有的段数时插在最后；比段数还大时也插在最后。

- **出错**：
  - 缺 `atIndex`：`TypeError: insertSegmentWithTitle needs { atIndex }`
  - `atIndex` 是负数：`TypeError: atIndex must be a non-negative integer, got -1`
  - 给的不是图：`TypeError: insertSegmentWithImage needs a UIImage or null`
  - 删除时下标越界：`TypeError: removeSegmentAtIndex: segment 5 is out of range; expected 0 to 4`

### 每一段的内容

下面的方法成对出现：一个设，一个取。设的方法把下标放在 `forSegmentAtIndex` 里，必须带；都没有返回值。

| 设 | 取 | 值 | 默认 |
| --- | --- | --- | --- |
| `setTitle(title, { forSegmentAtIndex })` | `titleForSegmentAtIndex(index)` | 字符串或 `null` | 构造时给的标题；图片段是 `null` |
| `setImage(image, { forSegmentAtIndex })` | `imageForSegmentAtIndex(index)` | `UIImage` 或 `null` | 构造时给的图；标题段是 `null` |
| `setWidth(width, { forSegmentAtIndex })` | `widthForSegmentAtIndex(index)` | 宽度，pt。0 表示自动 | 0 |
| `setContentOffset(offset, { forSegmentAtIndex })` | `contentOffsetForSegmentAtIndex(index)` | 把这一段里的标题或图挪多少，pt。写入给 `{ width, height }`，`width` 向右、`height` 向下；读出是 [`CGSize`](structs.md) | 0, 0 |
| `setEnabled(enabled, { forSegmentAtIndex })` | `isEnabledForSegmentAtIndex(index)` | `true`：这一段可点。`false`：这一段变淡、不可点 | `true` |

`imageForSegmentAtIndex` 返回的就是设进去的那个对象。

- **出错**：
  - 下标越界：`TypeError: setTitle: segment 4 is out of range; expected 0 to 3`（其余九个方法的报错相同，开头换成各自的名字）
  - 缺 `forSegmentAtIndex`：`TypeError: setTitle needs { forSegmentAtIndex }`
  - 给的不是图：`TypeError: setImage needs a UIImage or null`
  - 宽度转不成数：`TypeError: setWidth must be a finite number, got "wide"`
  - 偏移不是 `{ width, height }`：`TypeError: setContentOffset needs an object with all of: width, height`

### 事件

事件是 [`UIControl`](ui-control.md#事件) 的那 16 个。分段选择用到的是：

| 事件 | 什么时候派发 |
| --- | --- |
| `change` | 用户点了一段，选中的段变了。`isMomentary` 为 `true` 时每点一次都派发 |

## 与 iOS 原生写法的对照

| ObjC | JS |
| --- | --- |
| `[[UISegmentedControl alloc] initWithItems:@[@"日", @"周"]]` | `new UISegmentedControl(['日', '周'])` |
| `seg.selectedSegmentIndex = UISegmentedControlNoSegment` | `seg.selectedSegmentIndex = -1` |
| `seg.momentary = YES` | `seg.isMomentary = true` |
| `[seg insertSegmentWithTitle:@"年" atIndex:3 animated:YES]` | `seg.insertSegmentWithTitle('年', { atIndex: 3, animated: true })` |
| `[seg removeSegmentAtIndex:0 animated:NO]` | `seg.removeSegmentAtIndex(0)` |
| `[seg setTitle:@"本周" forSegmentAtIndex:1]` | `seg.setTitle('本周', { forSegmentAtIndex: 1 })` |
| `[seg titleForSegmentAtIndex:1]` | `seg.titleForSegmentAtIndex(1)` |
| `[seg setEnabled:NO forSegmentAtIndex:2]` | `seg.setEnabled(false, { forSegmentAtIndex: 2 })` |
| `[seg setContentOffset:CGSizeMake(0, 2) forSegmentAtIndex:0]` | `seg.setContentOffset({ width: 0, height: 2 }, { forSegmentAtIndex: 0 })` |

和原生不一样的两处：

- 原生对越界的下标有的抛异常、有的不做任何事；这里一律抛 `TypeError`。
- 原生在删掉选中的那一段之后，`selectedSegmentIndex` 读出来是 -2；这里是 -1。

## 与浏览器的对照

| 浏览器 | Nacre |
| --- | --- |
| 一组 `<input type="radio">` | `new UISegmentedControl([...])` |
| `select.selectedIndex`，-1 表示没有选中的 | `seg.selectedSegmentIndex`，-1 表示没有选中的 |
| `change` 事件 | `change` |

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 改标题的字体和颜色 | `setTitleTextAttributes:forState:` | 未实现 |
| 换底图和段之间的分隔线 | `setBackgroundImage:forState:barMetrics:`、`setDividerImage:forLeftSegmentState:rightSegmentState:barMetrics:` | 未实现 |
| 按「最左、中间、最右」分别微调内容的位置 | `setContentPositionAdjustment:forSegmentType:barMetrics:` | 未实现 |
| 给每一段绑一个带回调的动作 | `initWithFrame:actions:`、`insertSegmentWithAction:atIndex:animated:`、`setAction:forSegmentAtIndex:` | 不做。用 `change` 加 `selectedSegmentIndex` |

## 参见

- [`UIControl`](ui-control.md)：`isEnabled`、16 个控件事件
- [`UIImage`](ui-image.md)：取 SF Symbols 和自己的图
- [颜色](ui-color.md)：颜色字符串的写法
- [`UITabBarController`](ui-tab-bar-controller.md)：在几个整页之间切换时用标签栏，不用分段选择
- [实现原理](../internals/value-controls.md)：默认值和边界行为是怎么量的
