---
type: reference
native: "-[UIPageControl sizeForNumberOfPages:]"
---

# `UIPageControl`：`sizeForNumberOfPages()` 方法

**`sizeForNumberOfPages()`** 方法返回显示若干页至少要多大。用它给页码设 `frame`。

## 语法

```
sizeForNumberOfPages(pageCount)
```

### 参数

**`pageCount`**

页数，个数。小数向零取整。不能是负数。

### 返回值

[`CGSize`](../structs.md)，单位 [pt](../units.md)。

- 实测 iOS 27.2 上横着排时，3 页是 73 × 25.67 pt，10 页是 196.67 × 25.67 pt。
- 结果跟着 [`direction`](direction.md) 变：竖着排时是窄而高的。**未在模拟器验证。**
- `pageCount` 给 0 时返回的宽度是一个没有意义的大数（实测约 1.48 × 10²⁰），不要用。

### 异常

**`TypeError`**

- `pageCount` 是负数：`sizeForNumberOfPages must be a non-negative integer, got -1`。
- `pageCount` 转不出有限数：`sizeForNumberOfPages must be a finite number, got "many"`。

## 示例

```js
const pages = new UIPageControl();
pages.numberOfPages = 3;
const size = pages.sizeForNumberOfPages(3);
pages.frame = new CGRect(40, 300, size.width, size.height);
console.log(size.width, size.height);
```

**结果**：输出宽和高，iOS 27.2 上约是 73 和 25.67。页码的大小刚好放下三个点。

## 对应的 iOS API

`-[UIPageControl sizeForNumberOfPages:]`。原生对负数抛一个 JS 接不住的原生异常，这里抛 `TypeError`。

## 参见

- [`numberOfPages`](numberofpages.md)
- [结构体](../structs.md)：`CGSize`
