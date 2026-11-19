---
type: reference
native: UIPageControl.preferredCurrentPageIndicatorImage
---

# `UIPageControl`：`preferredCurrentPageIndicatorImage` 属性

**`preferredCurrentPageIndicatorImage`** 属性是当前页那个点用的图。

## 值

[`UIImage`](../ui-image.md)，或者 `null`。

- 可读，可写。
- 默认值是 `null`。`null` 表示当前页和别的页用同一张图，见 [`preferredIndicatorImage`](preferredindicatorimage.md)。
- 读出的就是写进去的那个对象，`===` 比较为 `true`。
- 图在屏幕上的样子**未在模拟器验证**。

### 写错时

写入的不是 `UIImage` 也不是 `null` 时抛 `TypeError`：`preferredCurrentPageIndicatorImage needs a native object or null, got "circle.fill"`。

## 示例

```js
const pages = new UIPageControl();
pages.numberOfPages = 3;
pages.preferredCurrentPageIndicatorImage = UIImage.systemImageNamed('circle.fill');
```

**效果**：当前页显示一个实心圆，其余的页还是圆点。**未在模拟器验证。**

## 对应的 iOS API

`UIPageControl.preferredCurrentPageIndicatorImage`。

## 参见

- [`setIndicatorImage()`](setindicatorimage.md)：单独给某一页换图
- [`UIImage`](../ui-image.md)：取 SF Symbols 和自己的图
