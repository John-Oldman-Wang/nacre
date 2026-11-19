---
type: reference
native: "-[UISegmentedControl removeAllSegments]"
---

# `UISegmentedControl`：`removeAllSegments()` 方法

**`removeAllSegments()`** 方法删掉全部的段。

## 语法

```
removeAllSegments()
```

### 参数

无。

### 返回值

无（`undefined`）。

方法返回后 [`numberOfSegments`](numberofsegments.md) 是 0，[`selectedSegmentIndex`](selectedsegmentindex.md) 是 -1。

### 异常

无。

## 示例

```js
const seg = new UISegmentedControl(['日', '周', '月']);
seg.selectedSegmentIndex = 0;
seg.removeAllSegments();
console.log(seg.numberOfSegments, seg.selectedSegmentIndex);
```

**结果**：输出 `0 -1`。

## 对应的 iOS API

`-[UISegmentedControl removeAllSegments]`。

## 参见

- [`removeSegmentAtIndex()`](removesegmentatindex.md)：删掉一段
