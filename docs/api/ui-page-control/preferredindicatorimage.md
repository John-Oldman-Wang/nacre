---
type: reference
native: UIPageControl.preferredIndicatorImage
---

# `UIPageControl`：`preferredIndicatorImage` 属性

**`preferredIndicatorImage`** 属性是所有的点用的图。设了之后，每一页显示这张图，不显示圆点。

## 值

[`UIImage`](../ui-image.md)，或者 `null`。

- 可读，可写。
- 默认值是 `null`。`null` 表示用圆点。
- 用 [`setIndicatorImage()`](setindicatorimage.md) 单独设过图的页，用单独设的那张。
- 读出的就是写进去的那个对象，`===` 比较为 `true`。
- 图在屏幕上的样子**未在模拟器验证**。

### 写错时

写入的不是 `UIImage` 也不是 `null` 时抛 `TypeError`：`preferredIndicatorImage needs a native object or null, got "circle.fill"`。

## 示例

```js
const pages = new UIPageControl();
pages.numberOfPages = 3;
pages.preferredIndicatorImage = UIImage.systemImageNamed('star');
pages.preferredCurrentPageIndicatorImage = UIImage.systemImageNamed('star.fill');
```

**效果**：每一页是一个空心的星，当前页是实心的星。**未在模拟器验证。**

`systemImageNamed` 取的是 SF Symbols，系统自带的一套图标。名字不存在时返回 `null`，写 `null` 就是用圆点。

## 对应的 iOS API

`UIPageControl.preferredIndicatorImage`。

## 参见

- [`setIndicatorImage()`](setindicatorimage.md)：单独给某一页换图
- [`UIImage`](../ui-image.md)：取 SF Symbols 和自己的图
