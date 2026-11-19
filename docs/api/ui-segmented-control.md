---
type: reference
native: UISegmentedControl
status: partial
---

# `UISegmentedControl`

**`UISegmentedControl`** 表示一个分段选择：横着排开的几段，每段是一个标题或者一张图，同一时刻最多只有一段是选中的。它用在「日 / 周 / 月」「全部 / 未读」这类在两到五个并列的选项之间切换的地方。

段用下标指代，从 0 数。选中的是哪一段读写 [`selectedSegmentIndex`](ui-segmented-control/selectedsegmentindex.md)。用户点了另一段之后，控件派发 [`change`](ui-control/change-event.md) 事件。代码改选中的段不派发 `change`。

刚创建出来时没有选中的段，`selectedSegmentIndex` 是 -1。读写某一段的内容时下标越界会抛 `TypeError`，不会被忽略。

控件的宽度按内容自动算，也可以用约束或 `frame` 给一个更大的宽度，各段平分。高度由系统决定，实测 iOS 27.2 上是 32 [pt](units.md)。

分段选择是[控件](ui-control.md)：禁用、状态和事件来自 `UIControl`。控件又是[视图](ui-view.md)：位置、大小、底色来自 `UIView`。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → [`UIControl`](ui-control.md) → `UISegmentedControl`

怎么用它做出常见的效果，见指南[做分段选择和页码](../guides/segmented-and-page-controls.md)。

## 构造函数

[`UISegmentedControl()`](ui-segmented-control/constructor.md)

用一组标题和图创建分段选择，每一项是一段。

## 实例属性

还继承 [`UIControl`](ui-control.md) 和 [`UIView`](ui-view.md) 的属性。分段选择常用的继承属性是 `isEnabled`、`translatesAutoresizingMaskIntoConstraints`。

| 属性 | 说明 |
| --- | --- |
| [`numberOfSegments`](ui-segmented-control/numberofsegments.md) <small>只读</small> | 一共几段 |
| [`selectedSegmentIndex`](ui-segmented-control/selectedsegmentindex.md) | 选中的是第几段。-1 表示没有选中的 |
| [`isMomentary`](ui-segmented-control/ismomentary.md) | 点完是否不保持选中的样子，用来当一排按钮 |
| [`apportionsSegmentWidthsByContent`](ui-segmented-control/apportionssegmentwidthsbycontent.md) | 各段的宽度是按内容分还是等宽 |
| [`selectedSegmentTintColor`](ui-segmented-control/selectedsegmenttintcolor.md) | 选中的那一段底下那块的颜色 |

## 实例方法

还继承 [`UIControl`](ui-control.md) 和 [`UIView`](ui-view.md) 的方法。

加段和删段：

| 方法 | 说明 |
| --- | --- |
| [`insertSegmentWithTitle()`](ui-segmented-control/insertsegmentwithtitle.md) | 插入一个标题段 |
| [`insertSegmentWithImage()`](ui-segmented-control/insertsegmentwithimage.md) | 插入一个图片段 |
| [`removeSegmentAtIndex()`](ui-segmented-control/removesegmentatindex.md) | 删掉一段 |
| [`removeAllSegments()`](ui-segmented-control/removeallsegments.md) | 删掉全部的段 |

设一段的内容，下标放在 `{ forSegmentAtIndex }` 里：

| 方法 | 说明 |
| --- | --- |
| [`setTitle()`](ui-segmented-control/settitle.md) | 设这一段的标题 |
| [`setImage()`](ui-segmented-control/setimage.md) | 设这一段的图 |
| [`setWidth()`](ui-segmented-control/setwidth.md) | 设这一段的宽度 |
| [`setContentOffset()`](ui-segmented-control/setcontentoffset.md) | 把这一段里的标题或图挪一点 |
| [`setEnabled()`](ui-segmented-control/setenabled.md) | 单独禁用或启用这一段 |

读一段的内容：

| 方法 | 说明 |
| --- | --- |
| [`titleForSegmentAtIndex()`](ui-segmented-control/titleforsegmentatindex.md) | 这一段的标题 |
| [`imageForSegmentAtIndex()`](ui-segmented-control/imageforsegmentatindex.md) | 这一段的图 |
| [`widthForSegmentAtIndex()`](ui-segmented-control/widthforsegmentatindex.md) | 这一段的宽度 |
| [`contentOffsetForSegmentAtIndex()`](ui-segmented-control/contentoffsetforsegmentatindex.md) | 这一段里内容的偏移 |
| [`isEnabledForSegmentAtIndex()`](ui-segmented-control/isenabledforsegmentatindex.md) | 这一段是否可点 |

## 事件

事件都继承自 [`UIControl`](ui-control.md)，用 `addEventListener()` 监听。分段选择用到的是：

| 事件 | 什么时候派发 |
| --- | --- |
| [`change`](ui-control/change-event.md) | 用户点了一段，选中的段变了。`isMomentary` 为 `true` 时每点一次都派发 |

## 示例

### 日 / 周 / 月

从空白 App 开始，在屏幕上放一个「日 / 周 / 月」的分段选择，下面的文字显示选中了哪一段。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const titles = ['日', '周', '月'];
  const seg = new UISegmentedControl(titles);
  seg.selectedSegmentIndex = 0;

  const label = new UILabel();
  label.text = '按日看';

  seg.addEventListener('change', () => {
    label.text = '按' + titles[seg.selectedSegmentIndex] + '看';
  });

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

**效果**（未在模拟器验证）

- 屏幕上方出现一条横贯屏幕的分段选择，三段等宽，「日」那一段是选中的样子。下面是「按日看」。
- 点「周」，选中的那一块滑到「周」，文字变成「按周看」。
- 再点一次已经选中的「周」，什么都不发生。

`safeAreaLayoutGuide` 是页面上不被刘海和圆角遮住的那块区域，见 [Auto Layout](auto-layout.md)。

更多写法见指南[做分段选择和页码](../guides/segmented-and-page-controls.md)。

## 对应的 iOS API

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
| `[seg addTarget:self action:@selector(changed:) forControlEvents:UIControlEventValueChanged]` | `seg.addEventListener('change', changed)` |

和原生不一样的两处：

- 原生对越界的下标有的抛异常、有的不做任何事；这里一律抛 `TypeError`。
- 原生在删掉选中的那一段之后，`selectedSegmentIndex` 读出来是 -2；这里是 -1。

## 参见

- [做分段选择和页码](../guides/segmented-and-page-controls.md)：图标段、取消选中、增删段、当按钮用
- [`UIControl`](ui-control.md)：`isEnabled`、全部控件事件
- [`UIImage`](ui-image.md)：取 SF Symbols 和自己的图
- [颜色](ui-color.md)：颜色字符串的写法
- [`UITabBarController`](ui-tab-bar-controller.md)：在几个整页之间切换时用标签栏，不用分段选择
