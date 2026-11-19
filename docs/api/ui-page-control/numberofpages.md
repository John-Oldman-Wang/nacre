---
type: reference
native: UIPageControl.numberOfPages
---

# `UIPageControl`：`numberOfPages` 属性

**`numberOfPages`** 属性是一共几页，也就是显示几个点。

## 值

数，个数。

- 可读，可写。
- 默认值是 0：什么都不显示。
- 写入时先按数转换，小数向零取整：写 `3.7` 得到 3。
- 改小之后，[`currentPage`](currentpage.md) 超出了新的范围就变成最后一页。
- 改小之后，被去掉的那些页上用 [`setIndicatorImage()`](setindicatorimage.md) 单独设的图不保留；再改大，那些页回到默认的点。**未在模拟器验证。**
- 它的变化不派发事件。页数只会被你的代码改。

### 写错时

抛 `TypeError`，属性保持原来的值。

- 负数：`numberOfPages must be a non-negative integer, got -3`。
- 转不出有限数（`'many'`、`undefined`）：`numberOfPages must be a finite number, got "many"`。

## 示例

```js
const pages = new UIPageControl();
pages.numberOfPages = 5;
pages.currentPage = 4;
pages.numberOfPages = 2;
console.log(pages.currentPage);
```

**结果**：输出 `1`。页数改成 2 之后，原来的第 4 页超出了范围，变成最后一页。

## 对应的 iOS API

`UIPageControl.numberOfPages`。原生把负数当成 0，这里抛 `TypeError`。

## 参见

- [`currentPage`](currentpage.md)
- [`hidesForSinglePage`](hidesforsinglepage.md)：只有一页时不显示
