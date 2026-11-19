---
type: reference
native: "-[UISegmentedControl insertSegmentWithImage:atIndex:animated:]"
---

# `UISegmentedControl`：`insertSegmentWithImage()` 方法

**`insertSegmentWithImage()`** 方法在指定的位置插入一个图片段。

## 语法

```
insertSegmentWithImage(image, { atIndex[, animated] })
```

### 参数

**`image`**

这一段的图，[`UIImage`](../ui-image.md) 或 `null`。

**`options.atIndex`**

插在第几段前面，整数，必填。等于现有的段数时插在最后；比段数还大时也插在最后。小数向零取整。

**`options.animated`** <small>可选</small>

布尔值。`true`：带动画地插入。不传时没有动画。

### 返回值

无（`undefined`）。

[`numberOfSegments`](numberofsegments.md) 在方法返回时就已经加一，带动画时也不用等动画结束。插入位置后面各段的下标加一，[`selectedSegmentIndex`](selectedsegmentindex.md) 跟着变，仍然指着原来选中的那一段。

### 异常

**`TypeError`**

- 没有传 `atIndex`：`insertSegmentWithImage needs { atIndex }`。
- `atIndex` 是负数：`atIndex must be a non-negative integer, got -1`。
- `atIndex` 转不出有限数（比如 `NaN`）：报错信息以 `atIndex must be a finite number` 开头。
- `image` 不是 `UIImage` 也不是 `null`：`insertSegmentWithImage needs a UIImage or null`。

抛了之后段数不变。

## 示例

```js
const seg = new UISegmentedControl(['列表']);
const grid = UIImage.systemImageNamed('square.grid.2x2');
if (grid !== null) {
  seg.insertSegmentWithImage(grid, { atIndex: 1 });
  console.log(seg.imageForSegmentAtIndex(1) === grid);
}
```

**结果**：输出 `true`。第 1 段显示宫格图标。**图标的样子未在模拟器验证。**

## 对应的 iOS API

`-[UISegmentedControl insertSegmentWithImage:atIndex:animated:]`。`animated` 在原生里是必传的参数，这里可以不传。

## 参见

- [`insertSegmentWithTitle()`](insertsegmentwithtitle.md)：插入标题段
- [`removeSegmentAtIndex()`](removesegmentatindex.md)：删掉一段
