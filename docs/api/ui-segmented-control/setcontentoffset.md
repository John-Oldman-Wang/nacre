---
type: reference
native: "-[UISegmentedControl setContentOffset:forSegmentAtIndex:]"
---

# `UISegmentedControl`：`setContentOffset()` 方法

**`setContentOffset()`** 方法把某一段里的标题或图挪一点。段本身的位置和大小不变。

## 语法

```
setContentOffset(offset, { forSegmentAtIndex })
```

### 参数

**`offset`**

偏移量，`{ width, height }` 形状的对象或 [`CGSize`](../structs.md)，单位 [pt](../units.md)。`width` 是正数时向右挪，`height` 是正数时向下挪。两个字段都要有。

**`options.forSegmentAtIndex`**

第几段，从 0 数，必填。小数向零取整。必须小于 [`numberOfSegments`](numberofsegments.md)。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 没有传 `forSegmentAtIndex`：`setContentOffset needs { forSegmentAtIndex }`。
- 下标越界或是负数：`setContentOffset: segment 4 is out of range; expected 0 to 3`（段数是 4 时）。一段都没有时是 `setContentOffset: segment 0 is out of range; there are none`。
- `offset` 不是 `{ width, height }`：`setContentOffset needs an object with all of: width, height`。

## 示例

```js
const seg = new UISegmentedControl(['日', '周', '月']);
seg.setContentOffset({ width: 0, height: 2 }, { forSegmentAtIndex: 0 });
const offset = seg.contentOffsetForSegmentAtIndex(0);
console.log(offset.width, offset.height);
```

**效果**：输出 `0 2`。第 0 段的「日」往下挪 2 pt。**屏幕上的位置未在模拟器验证。**

## 对应的 iOS API

`-[UISegmentedControl setContentOffset:forSegmentAtIndex:]`。原生对越界的下标有的抛异常、有的不做任何事，这里一律抛 `TypeError`。

## 参见

- [`contentOffsetForSegmentAtIndex()`](contentoffsetforsegmentatindex.md)：读这一段的偏移
- [结构体](../structs.md)：`CGSize`
