---
type: reference
native: "-[UISegmentedControl setTitle:forSegmentAtIndex:]"
---

# `UISegmentedControl`：`setTitle()` 方法

**`setTitle()`** 方法设某一段的标题。一段要么是标题要么是图：给图片段设了标题，它原来的图就没有了。

## 语法

```
setTitle(title, { forSegmentAtIndex })
```

### 参数

**`title`**

这一段的标题。按字符串转换：数字 `7` 得到 `'7'`。`null` 和 `undefined` 去掉标题。

**`options.forSegmentAtIndex`**

第几段，从 0 数，必填。小数向零取整。必须小于 [`numberOfSegments`](numberofsegments.md)。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 没有传 `forSegmentAtIndex`：`setTitle needs { forSegmentAtIndex }`。
- 下标越界或是负数：`setTitle: segment 4 is out of range; expected 0 to 3`（段数是 4 时）。一段都没有时是 `setTitle: segment 0 is out of range; there are none`。

## 示例

```js
const seg = new UISegmentedControl(['日', '周', '月']);
seg.setTitle('本周', { forSegmentAtIndex: 1 });
console.log(seg.titleForSegmentAtIndex(1));
```

**结果**：输出 `本周`。

## 对应的 iOS API

`-[UISegmentedControl setTitle:forSegmentAtIndex:]`。原生对越界的下标有的抛异常、有的不做任何事，这里一律抛 `TypeError`。

## 参见

- [`titleForSegmentAtIndex()`](titleforsegmentatindex.md)：读这一段的标题
- [`setImage()`](setimage.md)：把这一段换成图
