---
type: reference
native: UIPageControl.pageIndicatorTintColor
---

# `UIPageControl`：`pageIndicatorTintColor` 属性

**`pageIndicatorTintColor`** 属性是不是当前页的那些点的颜色。

## 值

颜色字符串，或者 `null`。

- 可读，可写。
- 默认值是 `null`：系统默认的颜色。
- 写入颜色字符串（`'#ff3b30'`、`'secondaryLabel'`）或 `UIColor` 对象；写入的字符串原样读回。
- 写 `null` 回到系统默认的颜色。
- 颜色在屏幕上的效果**未在模拟器验证**。

### 写错时

写入认不出的颜色：不抛异常，控制台输出一条警告，属性保持原来的值。颜色的写法见[颜色](../ui-color.md)。

## 示例

```js
const pages = new UIPageControl();
pages.numberOfPages = 3;
pages.pageIndicatorTintColor = '#C7C7CC';
console.log(pages.pageIndicatorTintColor);
```

**效果**：输出 `#C7C7CC`。不是当前页的点是浅灰色。**颜色的样子未在模拟器验证。**

## 对应的 iOS API

`UIPageControl.pageIndicatorTintColor`，原生的类型是 `UIColor`。

## 参见

- [颜色](../ui-color.md)
- [`pageIndicatorTintColor`](pageindicatortintcolor.md)、[`currentPageIndicatorTintColor`](currentpageindicatortintcolor.md)
