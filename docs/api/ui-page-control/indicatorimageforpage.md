---
type: reference
native: "-[UIPageControl indicatorImageForPage:]"
---

# `UIPageControl`：`indicatorImageForPage()` 方法

**`indicatorImageForPage()`** 方法返回用 [`setIndicatorImage()`](setindicatorimage.md) 给某一页单独设的图。

## 语法

```
indicatorImageForPage(page)
```

### 参数

**`page`**

第几页，从 0 数。小数向零取整。必须小于 [`numberOfPages`](numberofpages.md)。

### 返回值

[`UIImage`](../ui-image.md)，或者 `null`。返回的就是设进去的那个对象。没单独设过是 `null`；它不返回 [`preferredIndicatorImage`](preferredindicatorimage.md)。

### 异常

**`TypeError`**

- 页码越界或是负数：`indicatorImageForPage: page 3 is out of range; expected 0 to 2`（页数是 3 时）。一页都没有时是 `indicatorImageForPage: page 0 is out of range; there are none`。
- 页码转不出有限数：`indicatorImageForPage must be a finite number, got "first"`。

## 示例

```js
const pages = new UIPageControl();
pages.numberOfPages = 3;
console.log(pages.indicatorImageForPage(0));
```

**结果**：输出 `null`。

## 对应的 iOS API

`-[UIPageControl indicatorImageForPage:]`。

## 参见

- [`setIndicatorImage()`](setindicatorimage.md)
