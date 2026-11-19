---
type: reference
native: "-[UISegmentedControl removeSegmentAtIndex:animated:]"
---

# `UISegmentedControl`：`removeSegmentAtIndex()` 方法

**`removeSegmentAtIndex()`** 方法删掉指定的一段。

## 语法

```
removeSegmentAtIndex(index[, { animated }])
```

### 参数

**`index`**

要删的是第几段，从 0 数。小数向零取整。必须小于 [`numberOfSegments`](numberofsegments.md)。

**`options.animated`** <small>可选</small>

布尔值。`true`：带动画地删除。不传时没有动画。

### 返回值

无（`undefined`）。

段数在方法返回时就已经减一，带动画时也不用等动画结束。后面各段的下标减一，[`selectedSegmentIndex`](selectedsegmentindex.md) 跟着变，仍然指着原来选中的那一段。删掉的正好是选中的那一段时，`selectedSegmentIndex` 变成 -1。

### 异常

**`TypeError`**

- 下标越界或是负数：`removeSegmentAtIndex: segment 5 is out of range; expected 0 to 4`（段数是 5 时）。一段都没有时是 `removeSegmentAtIndex: segment 0 is out of range; there are none`。
- 下标转不出有限数：`removeSegmentAtIndex must be a finite number, got "first"`。

抛了之后段数不变。

## 示例

```js
const seg = new UISegmentedControl(['日', '周', '月']);
seg.selectedSegmentIndex = 1;
seg.removeSegmentAtIndex(0, { animated: true });
console.log(seg.numberOfSegments, seg.selectedSegmentIndex);
```

**结果**：输出 `2 0`。「日」被删掉，选中的仍然是「周」，它现在是第 0 段。

## 对应的 iOS API

`-[UISegmentedControl removeSegmentAtIndex:animated:]`。原生对越界的下标不报错，这里抛 `TypeError`。

## 参见

- [`removeAllSegments()`](removeallsegments.md)：删掉全部的段
- [`insertSegmentWithTitle()`](insertsegmentwithtitle.md)
