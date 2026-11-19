---
type: reference
native: "-[UISegmentedControl insertSegmentWithTitle:atIndex:animated:]"
---

# `UISegmentedControl`：`insertSegmentWithTitle()` 方法

**`insertSegmentWithTitle()`** 方法在指定的位置插入一个标题段。

## 语法

```
insertSegmentWithTitle(title, { atIndex[, animated] })
```

### 参数

**`title`**

这一段的标题。按字符串转换：数字 `7` 得到 `'7'`。`null` 和 `undefined` 得到没有标题的段。

**`options.atIndex`**

插在第几段前面，整数，必填。等于现有的段数时插在最后；比段数还大时也插在最后。小数向零取整。

**`options.animated`** <small>可选</small>

布尔值。`true`：带动画地插入。不传时没有动画。

### 返回值

无（`undefined`）。

[`numberOfSegments`](numberofsegments.md) 在方法返回时就已经加一，带动画时也不用等动画结束。插入位置后面各段的下标加一，[`selectedSegmentIndex`](selectedsegmentindex.md) 跟着变，仍然指着原来选中的那一段。

### 异常

**`TypeError`**

- 没有传 `atIndex`：`insertSegmentWithTitle needs { atIndex }`。
- `atIndex` 是负数：`atIndex must be a non-negative integer, got -1`。
- `atIndex` 转不出有限数（比如 `NaN`）：报错信息以 `atIndex must be a finite number` 开头。

抛了之后段数不变。

## 示例

```js
const seg = new UISegmentedControl(['日', '周', '月']);
seg.insertSegmentWithTitle('年', { atIndex: 3, animated: true });
console.log(seg.numberOfSegments, seg.titleForSegmentAtIndex(3));
```

**效果**：输出 `4 年`。最右边多出「年」，带动画。**动画未在模拟器验证。**

## 对应的 iOS API

`-[UISegmentedControl insertSegmentWithTitle:atIndex:animated:]`。`animated` 在原生里是必传的参数，这里可以不传。

## 参见

- [`insertSegmentWithImage()`](insertsegmentwithimage.md)：插入图片段
- [`removeSegmentAtIndex()`](removesegmentatindex.md)：删掉一段
