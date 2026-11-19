---
type: reference
native: "-[UISegmentedControl contentOffsetForSegmentAtIndex:]"
---

# `UISegmentedControl`：`contentOffsetForSegmentAtIndex()` 方法

**`contentOffsetForSegmentAtIndex()`** 方法返回用 [`setContentOffset()`](setcontentoffset.md) 给某一段设的内容偏移。

## 语法

```
contentOffsetForSegmentAtIndex(index)
```

### 参数

**`index`**

第几段，从 0 数。小数向零取整。必须小于 [`numberOfSegments`](numberofsegments.md)。

### 返回值

[`CGSize`](../structs.md)，单位 [pt](../units.md)。`width` 是向右的偏移，`height` 是向下的偏移。没设过是 0, 0。每次读得到一个新的对象，字段只读。

### 异常

**`TypeError`**

- 下标越界或是负数：`contentOffsetForSegmentAtIndex: segment 4 is out of range; expected 0 to 3`（段数是 4 时）。一段都没有时是 `contentOffsetForSegmentAtIndex: segment 0 is out of range; there are none`。
- 下标转不出有限数：`contentOffsetForSegmentAtIndex must be a finite number, got "first"`。

## 示例

```js
const seg = new UISegmentedControl(['日', '周']);
seg.setContentOffset({ width: 2, height: 3 }, { forSegmentAtIndex: 0 });
const offset = seg.contentOffsetForSegmentAtIndex(0);
console.log(offset.width, offset.height);
```

**结果**：输出 `2 3`。

## 对应的 iOS API

`-[UISegmentedControl contentOffsetForSegmentAtIndex:]`。原生对越界的下标不一定报错，这里一律抛 `TypeError`。

## 参见

- [`setContentOffset()`](setcontentoffset.md)
- [结构体](../structs.md)
