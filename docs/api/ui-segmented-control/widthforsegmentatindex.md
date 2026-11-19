---
type: reference
native: "-[UISegmentedControl widthForSegmentAtIndex:]"
---

# `UISegmentedControl`：`widthForSegmentAtIndex()` 方法

**`widthForSegmentAtIndex()`** 方法返回用 [`setWidth()`](setwidth.md) 给某一段指定的宽度。

## 语法

```
widthForSegmentAtIndex(index)
```

### 参数

**`index`**

第几段，从 0 数。小数向零取整。必须小于 [`numberOfSegments`](numberofsegments.md)。

### 返回值

数，单位 [pt](../units.md)。没指定过是 0，表示自动。它返回的是指定的宽度，不是屏幕上实际的宽度。

### 异常

**`TypeError`**

- 下标越界或是负数：`widthForSegmentAtIndex: segment 4 is out of range; expected 0 to 3`（段数是 4 时）。一段都没有时是 `widthForSegmentAtIndex: segment 0 is out of range; there are none`。
- 下标转不出有限数：`widthForSegmentAtIndex must be a finite number, got "first"`。

## 示例

```js
const seg = new UISegmentedControl(['日', '周']);
console.log(seg.widthForSegmentAtIndex(0));
seg.setWidth(80, { forSegmentAtIndex: 0 });
console.log(seg.widthForSegmentAtIndex(0));
```

**结果**：依次输出 `0`、`80`。

## 对应的 iOS API

`-[UISegmentedControl widthForSegmentAtIndex:]`。原生对越界的下标不一定报错，这里一律抛 `TypeError`。

## 参见

- [`setWidth()`](setwidth.md)
