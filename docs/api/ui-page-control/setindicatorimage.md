---
type: reference
native: "-[UIPageControl setIndicatorImage:forPage:]"
---

# `UIPageControl`：`setIndicatorImage()` 方法

**`setIndicatorImage()`** 方法单独给某一页的点换一张图。其余的页不变。

## 语法

```
setIndicatorImage(image, { forPage })
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

- 没有传 `forPage`：`setIndicatorImage needs { forPage }`。
- 页码越界或是负数：`setIndicatorImage: page 3 is out of range; expected 0 to 2`（页数是 3 时）。一页都没有时是 `setIndicatorImage: page 0 is out of range; there are none`。
- `image` 不是 `UIImage` 也不是 `null`：`setIndicatorImage needs a UIImage or null`。

## 示例

```js
const pages = new UIPageControl();
pages.numberOfPages = 3;
const arrow = UIImage.systemImageNamed('location.fill');
pages.setIndicatorImage(arrow, { forPage: 0 });
console.log(pages.indicatorImageForPage(0) === arrow);
```

**效果**：输出 `true`。第 0 页的点是一个定位的箭头，其余的点不变。**屏幕上的样子未在模拟器验证。**

## 对应的 iOS API

`-[UIPageControl setIndicatorImage:forPage:]`。原生在页码越界时抛一个 JS 接不住的原生异常，这里抛 `TypeError`。

## 参见

- [`indicatorImageForPage()`](indicatorimageforpage.md)
- [`preferredIndicatorImage`](preferredindicatorimage.md)：给所有的页换图
