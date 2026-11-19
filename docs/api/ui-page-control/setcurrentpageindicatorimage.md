---
type: reference
native: "-[UIPageControl setCurrentPageIndicatorImage:forPage:]"
---

# `UIPageControl`：`setCurrentPageIndicatorImage()` 方法

**`setCurrentPageIndicatorImage()`** 方法单独设某一页成为当前页时用的图。

## 语法

```
setCurrentPageIndicatorImage(image, { forPage })
```

### 参数

**`image`**

[`UIImage`](../ui-image.md)，或者 `null`。`null` 去掉这一页单独设的图，回到默认。

**`options.forPage`**

第几页，从 0 数，必填。小数向零取整。必须小于 [`numberOfPages`](numberofpages.md)。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 没有传 `forPage`：`setCurrentPageIndicatorImage needs { forPage }`。
- 页码越界或是负数：`setCurrentPageIndicatorImage: page 3 is out of range; expected 0 to 2`（页数是 3 时）。一页都没有时是 `setCurrentPageIndicatorImage: page 0 is out of range; there are none`。
- `image` 不是 `UIImage` 也不是 `null`：`setCurrentPageIndicatorImage needs a UIImage or null`。

## 示例

```js
const pages = new UIPageControl();
pages.numberOfPages = 3;
pages.setIndicatorImage(UIImage.systemImageNamed('location'), { forPage: 0 });
pages.setCurrentPageIndicatorImage(UIImage.systemImageNamed('location.fill'), { forPage: 0 });
```

**效果**：第 0 页不是当前页时是空心的箭头，是当前页时是实心的箭头。**未在模拟器验证。**

## 对应的 iOS API

`-[UIPageControl setCurrentPageIndicatorImage:forPage:]`。原生在页码越界时抛一个 JS 接不住的原生异常，这里抛 `TypeError`。

## 参见

- [`currentPageIndicatorImageForPage()`](currentpageindicatorimageforpage.md)
- [`preferredCurrentPageIndicatorImage`](preferredcurrentpageindicatorimage.md)：给所有的页设当前页的图
