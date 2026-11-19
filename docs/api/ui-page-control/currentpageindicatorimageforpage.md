---
type: reference
native: "-[UIPageControl currentPageIndicatorImageForPage:]"
---

# `UIPageControl`：`currentPageIndicatorImageForPage()` 方法

**`currentPageIndicatorImageForPage()`** 方法返回用 [`setCurrentPageIndicatorImage()`](setcurrentpageindicatorimage.md) 给某一页设的当前页图。

## 语法

```
currentPageIndicatorImageForPage(page)
```

### 参数

**`page`**

第几页，从 0 数。小数向零取整。必须小于 [`numberOfPages`](numberofpages.md)。

### 返回值

[`UIImage`](../ui-image.md)，或者 `null`。返回的就是设进去的那个对象。没设过是 `null`；它不返回 [`preferredCurrentPageIndicatorImage`](preferredcurrentpageindicatorimage.md)。

### 异常

**`TypeError`**

- 页码越界或是负数：`currentPageIndicatorImageForPage: page 3 is out of range; expected 0 to 2`（页数是 3 时）。一页都没有时是 `currentPageIndicatorImageForPage: page 0 is out of range; there are none`。
- 页码转不出有限数：`currentPageIndicatorImageForPage must be a finite number, got "first"`。

## 示例

```js
const pages = new UIPageControl();
pages.numberOfPages = 3;
const dot = UIImage.systemImageNamed('circle.fill');
pages.setCurrentPageIndicatorImage(dot, { forPage: 1 });
console.log(pages.currentPageIndicatorImageForPage(1) === dot);
```

**结果**：输出 `true`。

## 对应的 iOS API

`-[UIPageControl currentPageIndicatorImageForPage:]`。

## 参见

- [`setCurrentPageIndicatorImage()`](setcurrentpageindicatorimage.md)
