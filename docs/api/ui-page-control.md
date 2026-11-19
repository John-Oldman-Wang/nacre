---
type: reference
native: UIPageControl
status: partial
---

# `UIPageControl`

**`UIPageControl`** 表示一个页码指示：一排小圆点，每个点代表一页，当前页的那个点更亮。它用在引导页、横向翻页的图片这类「内容分成几页、一次看一页」的地方，告诉用户一共几页、现在在第几页。

一共几页读写 [`numberOfPages`](ui-page-control/numberofpages.md)，现在第几页读写 [`currentPage`](ui-page-control/currentpage.md)，从 0 数。刚创建出来是 0 页，什么都不显示。

页码只显示页码，不负责翻页。它和显示内容的视图（一般是一个 [`UIScrollView`](ui-scroll-view.md)）之间没有自动的联系，两个方向都由代码接上：

- 用户滑动内容翻了页：在滚动视图的事件里算出页码，写 `currentPage`。
- 用户点了圆点，或者按住这排点左右拖：控件自己改了 `currentPage` 并派发 [`change`](ui-control/change-event.md)，在回调里把内容滚到那一页。

代码写 `currentPage` 不派发 `change`，所以这两个方向不会互相触发。

控件的大小按页数自动算，用 [`sizeForNumberOfPages()`](ui-page-control/sizefornumberofpages.md) 读。圆点默认是浅色的，在白色的背景上不容易看见，可以改颜色或加一块底。

页码是[控件](ui-control.md)：禁用、状态和事件来自 `UIControl`。控件又是[视图](ui-view.md)：位置、大小、底色来自 `UIView`。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → [`UIControl`](ui-control.md) → `UIPageControl`

怎么和横向翻页的内容接起来、怎么换颜色和图标，见指南[做分段选择和页码](../guides/segmented-and-page-controls.md)。

## 构造函数

[`UIPageControl()`](ui-page-control/constructor.md)

创建一个 0 页的页码。

## 实例属性

还继承 [`UIControl`](ui-control.md) 和 [`UIView`](ui-view.md) 的属性。页码常用的继承属性是 `frame`、`isEnabled`。

| 属性 | 说明 |
| --- | --- |
| [`numberOfPages`](ui-page-control/numberofpages.md) | 一共几页 |
| [`currentPage`](ui-page-control/currentpage.md) | 现在第几页 |
| [`hidesForSinglePage`](ui-page-control/hidesforsinglepage.md) | 只有一页时是否不显示 |
| [`allowsContinuousInteraction`](ui-page-control/allowscontinuousinteraction.md) | 能不能按住这排点左右拖着翻页 |
| [`backgroundStyle`](ui-page-control/backgroundstyle.md) | 圆点背后那块底什么时候显示 |
| [`direction`](ui-page-control/direction.md) | 圆点往哪个方向排 |
| [`interactionState`](ui-page-control/interactionstate.md) <small>只读</small> | 最近一次换页是点的还是拖的 |
| [`pageIndicatorTintColor`](ui-page-control/pageindicatortintcolor.md) | 不是当前页的那些点的颜色 |
| [`currentPageIndicatorTintColor`](ui-page-control/currentpageindicatortintcolor.md) | 当前页那个点的颜色 |
| [`preferredIndicatorImage`](ui-page-control/preferredindicatorimage.md) | 所有的点用的图 |
| [`preferredCurrentPageIndicatorImage`](ui-page-control/preferredcurrentpageindicatorimage.md) | 当前页那个点用的图 |

## 实例方法

还继承 [`UIControl`](ui-control.md) 和 [`UIView`](ui-view.md) 的方法。

单独给某一页换图：

| 方法 | 说明 |
| --- | --- |
| [`setIndicatorImage()`](ui-page-control/setindicatorimage.md) | 设某一页的点用的图 |
| [`indicatorImageForPage()`](ui-page-control/indicatorimageforpage.md) | 读某一页单独设的图 |
| [`setCurrentPageIndicatorImage()`](ui-page-control/setcurrentpageindicatorimage.md) | 设某一页是当前页时用的图 |
| [`currentPageIndicatorImageForPage()`](ui-page-control/currentpageindicatorimageforpage.md) | 读某一页是当前页时用的图 |

大小：

| 方法 | 说明 |
| --- | --- |
| [`sizeForNumberOfPages()`](ui-page-control/sizefornumberofpages.md) | 显示若干页至少要多大 |

## 事件

事件都继承自 [`UIControl`](ui-control.md)，用 `addEventListener()` 监听。页码用到的是：

| 事件 | 什么时候派发 |
| --- | --- |
| [`change`](ui-control/change-event.md) | 用户点或者拖这排点，换了页 |

## 示例

### 三页的横向翻页

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

  // 横向滚动的内容，三页，每页一块颜色
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

  // 页码：三页，深色的点
  const pages = new UIPageControl();
  pages.numberOfPages = colors.length;
  pages.pageIndicatorTintColor = 'tertiaryLabel';
  pages.currentPageIndicatorTintColor = 'label';
  const size = pages.sizeForNumberOfPages(colors.length);
  pages.frame = new CGRect(40 + (width - size.width) / 2, 310, size.width, size.height);
  page.view.addSubview(pages);

  // 内容滑到了哪一页，页码跟过去
  scroller.addEventListener('scroll', () => {
    pages.currentPage = Math.round(scroller.contentOffset.x / width);
  });

  // 点了页码，内容滚过去
  pages.addEventListener('change', () => {
    scroller.setContentOffset(new CGPoint(width * pages.currentPage, 0), { animated: true });
  });
});
```

**效果**（未在模拟器验证）

- 屏幕上是一块红色，下面有三个小圆点，第一个最深。
- 向左滑动红色那一块，露出绿色，第二个点变成最深的。
- 点右边的圆点，内容滚到下一页。
- 按住这排点左右拖，内容跟着一页一页地换。

更多写法见指南[做分段选择和页码](../guides/segmented-and-page-controls.md)。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[UIPageControl alloc] init]` | `new UIPageControl()` |
| `pages.numberOfPages = 3` | `pages.numberOfPages = 3` |
| `pages.currentPage = 1` | `pages.currentPage = 1` |
| `pages.backgroundStyle = UIPageControlBackgroundStyleProminent` | `pages.backgroundStyle = 'prominent'` |
| `pages.direction = UIPageControlDirectionTopToBottom` | `pages.direction = 'topToBottom'` |
| `[pages setIndicatorImage:image forPage:0]` | `pages.setIndicatorImage(image, { forPage: 0 })` |
| `[pages indicatorImageForPage:0]` | `pages.indicatorImageForPage(0)` |
| `[pages sizeForNumberOfPages:3]` | `pages.sizeForNumberOfPages(3)` |
| `[pages addTarget:self action:@selector(changed:) forControlEvents:UIControlEventValueChanged]` | `pages.addEventListener('change', changed)` |

和原生不一样的一处：原生把负的 `numberOfPages` 当成 0；这里抛 `TypeError`。

## 参见

- [做分段选择和页码](../guides/segmented-and-page-controls.md)：和翻页内容接起来、换颜色、换图标、竖着排
- [`UIScrollView`](ui-scroll-view.md)：横向翻页的内容，`isPagingEnabled`、`scroll` 事件
- [`UIControl`](ui-control.md)：全部控件事件
- [`UIImage`](ui-image.md)：取 SF Symbols 和自己的图
- [颜色](ui-color.md)：颜色字符串的写法
