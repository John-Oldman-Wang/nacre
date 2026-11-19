---
type: reference
native: "-[UIPageControl init]"
---

# `UIPageControl()` 构造函数

**`UIPageControl()`** 构造函数创建一个页码。新建的页码是 0 页，什么都不显示。

## 语法

```
new UIPageControl()
```

### 参数

无。

### 返回值

新建的 `UIPageControl`。[`numberOfPages`](numberofpages.md) 是 0，[`currentPage`](currentpage.md) 是 0。要先写 `numberOfPages` 才能看到圆点。

## 示例

```js
const pages = new UIPageControl();
pages.numberOfPages = 5;
const size = pages.sizeForNumberOfPages(5);
pages.frame = new CGRect(0, 0, size.width, size.height);
```

**效果**：得到一排五个圆点的页码，大小刚好放下五页。加到页面上之后才能看到。**屏幕上的样子未在模拟器验证。**

## 对应的 iOS API

`[[UIPageControl alloc] init]`。

## 参见

- [`numberOfPages`](numberofpages.md)
- [`sizeForNumberOfPages()`](sizefornumberofpages.md)
