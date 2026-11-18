---
type: reference
native: UIPageControl
status: partial
---

# UIPageControl

`UIPageControl` 表示一个页码指示：一排小圆点，每个点代表一页，当前页的那个点更亮。它用在引导页、横向翻页的图片这类「内容分成几页、一次看一页」的地方，告诉用户一共几页、现在在第几页。

它是 [`UIControl`](ui-control.md) 的子类，所以也是一个视图：用 `new UIPageControl()` 创建，用 `addSubview` 放到页面上。

一共几页读写 `numberOfPages`，现在第几页读写 `currentPage`，从 0 数。

**它只显示页码，不负责翻页。** 它和显示内容的视图（一般是一个 [`UIScrollView`](ui-scroll-view.md)）之间没有任何自动的联系，两个方向都要由代码接上：

- 用户滑动内容翻了页：在滚动视图的事件里算出页码，写 `currentPage`。
- 用户点了圆点、或者按住这排点左右拖：控件自己改了 `currentPage` 并派发 `change`，在回调里把内容滚到那一页。

**代码写 `currentPage` 不派发 `change`。** 只有用户的操作才派发。所以上面两个方向不会互相触发。这一条**未在模拟器验证**，来自 iOS 的定义。

**刚创建出来是 0 页，什么都不显示。** 要先写 `numberOfPages`。

控件的大小按页数自动算。圆点是浅色的，在白色的背景上不容易看见，可以改颜色，见[换颜色](#换颜色)。

> **注意**：这一页里的默认值、读写的结果和报错，在模拟器上用一个不带界面的程序跑过。屏幕上的样子和事件的派发还没有在模拟器上验证，下面在对应的地方标出。

## 完整例子

下面的代码从空白 App 开始，做一个三页的横向翻页，底下是页码。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
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
  const pages = new UIPageControl();
  pages.numberOfPages = colors.length;
  pages.pageIndicatorTintColor = 'tertiaryLabel';
  pages.currentPageIndicatorTintColor = 'label';
  const size = pages.sizeForNumberOfPages(colors.length);
  pages.frame = new CGRect(40 + (width - size.width) / 2, 310, size.width, size.height);
  page.view.addSubview(pages);

  // 3. 内容滑到了哪一页，页码跟过去
  scroller.addEventListener('scroll', () => {
    pages.currentPage = Math.round(scroller.contentOffset.x / width);
  });

  // 4. 点了页码，内容滚过去
  pages.addEventListener('change', () => {
    scroller.setContentOffset(new CGPoint(width * pages.currentPage, 0), { animated: true });
  });
});
```

**效果**（未在模拟器验证）：

- 屏幕上是一块红色，下面有三个小圆点，第一个最深。
- 向左滑动红色那一块，露出绿色，第二个点变成最深的。
- 点右边的圆点，内容滚到下一页。
- 按住这排点左右拖，内容跟着一页一页地换。

## 常见用法

以下例子都沿用上面的 `pages`。

### 换颜色

```js
pages.pageIndicatorTintColor = '#C7C7CC';
pages.currentPageIndicatorTintColor = '#007AFF';
```

**效果**（未在模拟器验证）：不是当前页的点是浅灰色，当前页的点是蓝色。

两个属性写 `null` 都是回到系统默认的颜色。颜色的写法见[颜色](ui-color.md)。

### 给这排点加一块底

```js
pages.backgroundStyle = 'prominent';
```

**效果**（未在模拟器验证）：圆点背后一直有一块半透明的圆角底，点在任何颜色的内容上都看得清。

默认的 `'automatic'` 平时没有底，手指按到这排点上时才出现。

### 把圆点换成图标

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

`systemImageNamed` 取的是 SF Symbols，系统自带的一套图标，见 [`UIImage`](ui-image.md)。

把 `numberOfPages` 改小之后，被去掉的那些页上单独设的图不保留；再改大，那些页回到默认的点。

### 只有一页时不显示

```js
pages.hidesForSinglePage = true;
pages.numberOfPages = 1;
```

**效果**（未在模拟器验证）：页码不显示。把 `numberOfPages` 改成 2，它又出现。

### 竖着排

```js
pages.direction = 'topToBottom';
```

**效果**（未在模拟器验证）：圆点从上到下排成一列，第 0 页在最上面。

这时 `sizeForNumberOfPages` 给出的大小也跟着变成窄而高的，重新用它设一次 `frame`。

### 不让用户拖着翻页

```js
pages.allowsContinuousInteraction = false;
```

**效果**（未在模拟器验证）：按住这排点左右拖没有反应。点一下仍然可以翻到相邻的一页。

## 成员说明

`UIPageControl` 继承 [`UIControl`](ui-control.md) 和 [`UIView`](ui-view.md) 的全部成员。下面只列它自己的。

### 构造

```js
const pages = new UIPageControl();
```

没有参数。

### 属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `numberOfPages` | `number` | 是 | 是 | 0 | 一共几页，个数。小数向零取整 |
| `currentPage` | `number` | 是 | 是 | 0 | 现在第几页，从 0 数。超出范围的值被改到 0 和最后一页之间 |
| `hidesForSinglePage` | `boolean` | 是 | 是 | `false` | `true`：只有一页时不显示。`false`：一页也显示一个点 |
| `allowsContinuousInteraction` | `boolean` | 是 | 是 | `true` | `true`：可以按住这排点左右拖着翻页。`false`：只能点 |
| `backgroundStyle` | `UIPageControlBackgroundStyle` | 是 | 是 | `'automatic'` | 圆点背后那块底，见下表 |
| `direction` | `UIPageControlDirection` | 是 | 是 | `'natural'` | 圆点往哪个方向排，见下表 |
| `interactionState` | `UIPageControlInteractionState` | 是 | 否 | `'none'` | 最近一次换页是怎么换的，见下表 |
| `pageIndicatorTintColor` | 颜色字符串或 `null` | 是 | 是 | `null` | 不是当前页的那些点的颜色。`null` 是系统默认 |
| `currentPageIndicatorTintColor` | 颜色字符串或 `null` | 是 | 是 | `null` | 当前页那个点的颜色 |
| `preferredIndicatorImage` | `UIImage` 或 `null` | 是 | 是 | `null` | 所有的点用的图。`null` 是圆点 |
| `preferredCurrentPageIndicatorImage` | `UIImage` 或 `null` | 是 | 是 | `null` | 当前页那个点用的图。`null` 时和别的点用同一张 |

把 `numberOfPages` 改小时，`currentPage` 超出了新的范围就变成最后一页。

`currentPage` 变了的通知：用户点或者拖这排点时派发 `change`。代码写入不派发。

`backgroundStyle` 的取值：

| 取值 | 效果 |
| --- | --- |
| `'automatic'` | 平时没有底，手指按上去时出现 |
| `'prominent'` | 一直有底 |
| `'minimal'` | 一直没有底 |

`direction` 的取值：

| 取值 | 效果 |
| --- | --- |
| `'natural'` | 跟系统语言的书写方向：中文、英文是从左到右，阿拉伯文是从右到左 |
| `'leftToRight'` | 第 0 页在最左 |
| `'rightToLeft'` | 第 0 页在最右 |
| `'topToBottom'` | 竖着排，第 0 页在最上 |
| `'bottomToTop'` | 竖着排，第 0 页在最下 |

`interactionState` 的取值：

| 取值 | 含义 |
| --- | --- |
| `'none'` | 还没有被用户操作过 |
| `'discrete'` | 用户点了一下，换了一页 |
| `'continuous'` | 用户按住拖着换的页 |

它在 `change` 的回调里读。拖着换页时一次会经过好几页，可以据此决定内容要不要带动画地滚过去。

- `backgroundStyle`、`direction` 写了表里没有的值时不抛异常：属性保持原来的值，控制台输出一条警告，比如 `[Nacre] backgroundStyle has no value "glass"; expected one of: automatic / prominent / minimal, ignored`。
- **出错**：
  - `numberOfPages` 是负数：`TypeError: numberOfPages must be a non-negative integer, got -3`。属性保持原来的值
  - 图给的不是 `UIImage`：`TypeError: preferredIndicatorImage needs a native object or null, got "circle.fill"`

### 单独给某一页换图

| 方法 | 作用 |
| --- | --- |
| `setIndicatorImage(image, { forPage })` | 设第 `forPage` 页的点用的图。`image` 给 `null` 回到默认 |
| `indicatorImageForPage(page)` | 取第 `page` 页单独设的图。没单独设过是 `null` |
| `setCurrentPageIndicatorImage(image, { forPage })` | 设第 `forPage` 页是当前页时用的图 |
| `currentPageIndicatorImageForPage(page)` | 取上一个方法设的图。没设过是 `null` |

页码从 0 数，必须小于 `numberOfPages`。取的两个方法只返回单独设过的图，不返回 `preferredIndicatorImage`。

- **出错**：
  - 页码越界：`TypeError: setIndicatorImage: page 3 is out of range; expected 0 to 2`
  - 缺 `forPage`：`TypeError: setIndicatorImage needs { forPage }`
  - 给的不是图：`TypeError: setIndicatorImage needs a UIImage or null`

### 方法

| 方法 | 作用 |
| --- | --- |
| `sizeForNumberOfPages(pageCount)` | 显示 `pageCount` 页至少要多大。返回 [`CGSize`](structs.md)，单位 pt |

实测 iOS 27.2 上横着排时，3 页是 73 × 25.67 pt，10 页是 196.67 × 25.67 pt。

`pageCount` 给 0 时返回的宽度是一个没有意义的大数（实测约 1.48 × 10²⁰），不要用。

- **出错**：`pageCount` 是负数：`TypeError: sizeForNumberOfPages must be a non-negative integer, got -1`

### 事件

事件是 [`UIControl`](ui-control.md#事件) 的那 16 个。页码用到的是：

| 事件 | 什么时候派发 |
| --- | --- |
| `change` | 用户点或者拖这排点，换了页 |

## 与 iOS 原生写法的对照

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

和原生不一样的一处：原生把负的 `numberOfPages` 当成 0；这里抛 `TypeError`。

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 当前页的点上显示一条进度，走完自动翻到下一页 | `progress`（`UIPageControlProgress`、`UIPageControlTimerProgress`） | 未实现 |

## 参见

- [`UIScrollView`](ui-scroll-view.md)：横向翻页的内容，`isPagingEnabled`、`scroll` 事件
- [`UIControl`](ui-control.md)：16 个控件事件
- [`UIImage`](ui-image.md)：取 SF Symbols 和自己的图
- [颜色](ui-color.md)：颜色字符串的写法
- [实现原理](../internals/value-controls.md)：默认值和边界行为是怎么量的
