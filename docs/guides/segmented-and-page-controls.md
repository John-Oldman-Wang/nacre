# 做分段选择和页码

这一篇讲两种控件的常见用法：[`UISegmentedControl`](../api/ui-segmented-control.md)（分段选择，在几个并列的选项之间切换）和 [`UIPageControl`](../api/ui-page-control.md)（页码，一排表示「一共几页、现在第几页」的小圆点）。每个属性和方法的细节在它们的参考页。

## 推荐的做法

- **分段选择创建之后马上写 [`selectedSegmentIndex`](../api/ui-segmented-control/selectedsegmentindex.md)。** 刚创建出来时没有选中的段，用户看不出现在是哪一项。
- **监听 [`change`](../api/ui-control/change-event.md)，在回调里读当前的值。** 分段选择读 `selectedSegmentIndex`，页码读 `currentPage`。代码改这两个值不派发 `change`，所以在别的地方同步它们不会触发回调。
- **页码不会替你翻页。** 内容翻了页，在滚动视图的事件里写 `currentPage`；用户点了页码，在 `change` 里把内容滚过去。两个方向都要写。
- **在几个整页之间切换，用标签栏，不用分段选择。** 见 [`UITabBarController`](../api/ui-tab-bar-controller.md)。

## 第一个分段选择

从空白 App 开始，放一个「日 / 周 / 月」的分段选择，下面的文字显示选中了哪一段。

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

- 屏幕上方出现一条横贯屏幕的分段选择，三段等宽，「日」是选中的样子。下面是「按日看」。
- 点「周」，文字变成「按周看」。
- 再点一次已经选中的「周」，什么都不发生。

下面讲分段选择的几节用一个新建的 `seg`：

```js
const seg = new UISegmentedControl(['日', '周', '月']);
seg.selectedSegmentIndex = 0;
```

**效果**：一个三段的分段选择，选中第 0 段，还没有加到页面上。

## 用图标当一段

构造时的数组里，标题和图可以混着给。

```js
const list = UIImage.systemImageNamed('list.bullet');
const grid = UIImage.systemImageNamed('square.grid.2x2');
if (list !== null && grid !== null) {
  const viewMode = new UISegmentedControl([list, grid]);
  viewMode.selectedSegmentIndex = 0;
}
```

**效果**（未在模拟器验证）：两段，一段是列表图标，一段是宫格图标。

`systemImageNamed` 取的是 SF Symbols，系统自带的一套图标，见 [`UIImage`](../api/ui-image.md)。它在名字不存在时返回 `null`，而数组里放 `null` 会抛，所以先判空。

一段要么是标题要么是图。给一个图片段设标题，它的图就没有了；反过来也一样。

## 取消选中

```js
seg.selectedSegmentIndex = -1;
```

**效果**（未在模拟器验证）：没有任何一段是选中的样子。

## 运行中加一段、删一段

```js
seg.insertSegmentWithTitle('年', { atIndex: 3, animated: true });
console.log(seg.numberOfSegments);
seg.removeSegmentAtIndex(0, { animated: true });
console.log(seg.titleForSegmentAtIndex(0));
```

**效果**：输出 `4`，然后输出 `周`。屏幕上最右边多出「年」，接着最左边的「日」消失，带动画（动画未在模拟器验证）。

段数在调用返回时就已经变了，不用等动画结束。插入和删除会移动后面各段的下标，`selectedSegmentIndex` 跟着变，仍然指着原来选中的那一段。删掉的正好是选中的那一段时，`selectedSegmentIndex` 变成 -1。

## 改某一段的标题

```js
seg.setTitle('本周', { forSegmentAtIndex: 1 });
console.log(seg.titleForSegmentAtIndex(1));
```

**效果**：输出 `本周`。

## 禁用某一段

```js
seg.setEnabled(false, { forSegmentAtIndex: 2 });
```

**效果**（未在模拟器验证）：第 2 段变淡，点它没有反应。其余的段照常。

要整个控件都不能点，写 `seg.isEnabled = false`。

## 当一排按钮用

```js
seg.isMomentary = true;
seg.addEventListener('change', () => {
  console.log('点了第', seg.selectedSegmentIndex, '段');
});
```

**效果**（未在模拟器验证）：点一段，它闪一下，不保持选中的样子；控制台输出点的是第几段。连续点同一段，每次都输出。

## 让各段的宽度跟着内容走

```js
seg.apportionsSegmentWidthsByContent = true;
```

**效果**（未在模拟器验证）：标题长的段宽一些，标题短的段窄一些，不再等宽。

单独指定某一段的宽度用 `setWidth()`：

```js
seg.setWidth(120, { forSegmentAtIndex: 0 });
```

**效果**（未在模拟器验证）：第 0 段宽 120 pt，其余的段平分剩下的宽度。

## 第一个页码

从空白 App 开始，做一个三页的横向翻页，底下是页码。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const colors = ['systemRed', 'systemGreen', 'systemBlue'];
  const width = 300;
  const height = 200;

  // 1. 横向滚动的内容，三页，每页一块颜色
  const scroller = new UIScrollView();
  scroller.frame = new CGRect(40, 100, width, height);
  scroller.isPagingEnabled = true;
  scroller.contentSize = new CGSize(width * colors.length, height);
  colors.forEach((color, i) => {
    const block = new UIView();
    block.frame = new CGRect(width * i, 0, width, height);
    block.backgroundColor = color;
    scroller.addSubview(block);
  });
  page.view.addSubview(scroller);

  // 2. 页码：三页，深色的点
  const dots = new UIPageControl();
  dots.numberOfPages = colors.length;
  dots.pageIndicatorTintColor = 'tertiaryLabel';
  dots.currentPageIndicatorTintColor = 'label';
  const size = dots.sizeForNumberOfPages(colors.length);
  dots.frame = new CGRect(40 + (width - size.width) / 2, 310, size.width, size.height);
  page.view.addSubview(dots);

  // 3. 内容滑到了哪一页，页码跟过去
  scroller.addEventListener('scroll', () => {
    dots.currentPage = Math.round(scroller.contentOffset.x / width);
  });

  // 4. 点了页码，内容滚过去
  dots.addEventListener('change', () => {
    scroller.setContentOffset(new CGPoint(width * dots.currentPage, 0), { animated: true });
  });
});
```

**效果**（未在模拟器验证）

- 屏幕上是一块红色，下面有三个小圆点，第一个最深。
- 向左滑动红色那一块，露出绿色，第二个点变成最深的。
- 点右边的圆点，内容滚到下一页。
- 按住这排点左右拖，内容跟着一页一页地换。

第 3 步写 `currentPage` 不派发 `change`，所以第 4 步的回调不会被内容的滚动触发。

下面讲页码的几节用一个新建的 `pages`：

```js
const pages = new UIPageControl();
pages.numberOfPages = 5;
```

**效果**：一个五页的页码，还没有加到页面上。

## 换颜色

圆点默认是浅色的，在白色的背景上不容易看见。

```js
pages.pageIndicatorTintColor = '#C7C7CC';
pages.currentPageIndicatorTintColor = '#007AFF';
```

**效果**（未在模拟器验证）：不是当前页的点是浅灰色，当前页的点是蓝色。

两个属性写 `null` 都是回到系统默认的颜色。颜色的写法见[颜色](../api/ui-color.md)。

## 给这排点加一块底

```js
pages.backgroundStyle = 'prominent';
```

**效果**（未在模拟器验证）：圆点背后一直有一块半透明的圆角底，点在任何颜色的内容上都看得清。

默认的 `'automatic'` 平时没有底，手指按到这排点上时才出现。

## 把圆点换成图标

```js
pages.preferredIndicatorImage = UIImage.systemImageNamed('star');
pages.preferredCurrentPageIndicatorImage = UIImage.systemImageNamed('star.fill');
```

**效果**（未在模拟器验证）：每一页是一个空心的星，当前页是实心的星。

只想换某一页的，比如让第 0 页显示成定位的箭头：

```js
pages.setIndicatorImage(UIImage.systemImageNamed('location.fill'), { forPage: 0 });
```

**效果**（未在模拟器验证）：第 0 页的点是一个箭头，其余的点不变。

把 `numberOfPages` 改小之后，被去掉的那些页上单独设的图不保留；再改大，那些页回到默认的点。

## 只有一页时不显示

```js
pages.hidesForSinglePage = true;
pages.numberOfPages = 1;
```

**效果**（未在模拟器验证）：页码不显示。把 `numberOfPages` 改成 2，它又出现。

## 竖着排

```js
pages.direction = 'topToBottom';
const tall = pages.sizeForNumberOfPages(pages.numberOfPages);
pages.frame = new CGRect(0, 0, tall.width, tall.height);
```

**效果**（未在模拟器验证）：圆点从上到下排成一列，第 0 页在最上面。

竖着排时 `sizeForNumberOfPages()` 给出的大小也变成窄而高的，所以要重新用它设一次 `frame`。

## 不让用户拖着翻页

```js
pages.allowsContinuousInteraction = false;
```

**效果**（未在模拟器验证）：按住这排点左右拖没有反应。点一下仍然可以翻到相邻的一页。

## 参见

- [`UISegmentedControl`](../api/ui-segmented-control.md)：分段选择的全部属性和方法
- [`UIPageControl`](../api/ui-page-control.md)：页码的全部属性和方法
- [`UIScrollView`](../api/ui-scroll-view.md)：横向翻页的内容
- [`UIControl`](../api/ui-control.md)：控件事件和禁用
