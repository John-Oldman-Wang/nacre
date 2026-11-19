---
type: reference
native: "-[UISegmentedControl titleForSegmentAtIndex:]"
---

# `UISegmentedControl`：`titleForSegmentAtIndex()` 方法

**`titleForSegmentAtIndex()`** 方法返回某一段的标题。

## 语法

```
titleForSegmentAtIndex(index)
```

### 参数

**`index`**

第几段，从 0 数。小数向零取整。必须小于 [`numberOfSegments`](numberofsegments.md)。

### 返回值

字符串，或者 `null`。图片段和没有标题的段返回 `null`。

### 异常

**`TypeError`**

- 下标越界或是负数：`titleForSegmentAtIndex: segment 4 is out of range; expected 0 to 3`（段数是 4 时）。一段都没有时是 `titleForSegmentAtIndex: segment 0 is out of range; there are none`。
- 下标转不出有限数：`titleForSegmentAtIndex must be a finite number, got "first"`。

## 示例

```js
const seg = new UISegmentedControl(['日', '周', '月']);
console.log(seg.titleForSegmentAtIndex(0));
```

**结果**：输出 `日`。

## 对应的 iOS API

`-[UISegmentedControl titleForSegmentAtIndex:]`。原生对越界的下标不一定报错，这里一律抛 `TypeError`。

## 参见

- [`setTitle()`](settitle.md)
