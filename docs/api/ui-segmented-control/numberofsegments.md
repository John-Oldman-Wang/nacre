---
type: reference
native: UISegmentedControl.numberOfSegments
---

# `UISegmentedControl`：`numberOfSegments` 属性

**`numberOfSegments`** 属性是分段选择一共有几段。

## 值

数，个数。

- 只读。给它赋值抛 `TypeError`。
- 初始值是构造时给的项数；构造时没给是 0。
- 插入、删除段之后立刻变化，带动画时也不用等动画结束。
- 它的变化不派发事件。段数只会被你的代码改。

## 示例

```js
const seg = new UISegmentedControl(['日', '周']);
seg.insertSegmentWithTitle('月', { atIndex: 2, animated: true });
console.log(seg.numberOfSegments);
```

**结果**：输出 `3`。

## 对应的 iOS API

`UISegmentedControl.numberOfSegments`。

## 参见

- [`insertSegmentWithTitle()`](insertsegmentwithtitle.md)、[`removeSegmentAtIndex()`](removesegmentatindex.md)
