---
type: reference
native: UISegmentedControl.selectedSegmentIndex
---

# `UISegmentedControl`：`selectedSegmentIndex` 属性

**`selectedSegmentIndex`** 属性是选中的那一段的下标，从 0 数。-1 表示没有选中的段。

## 值

数，下标。

- 可读，可写。
- 默认值是 -1：刚创建出来时没有选中的段。
- 写 -1 取消选中，没有任何一段显示成选中的样子。**屏幕上的样子未在模拟器验证。**
- 写入时先按数转换，小数向零取整：写 `2.9` 得到 2。
- 在选中的那一段前面插入一段，它跟着加一，仍然指着原来选中的那一段；删掉前面的段时跟着减一。
- 删掉的正好是选中的那一段时，变成 -1。[`removeAllSegments()`](removeallsegments.md) 之后也是 -1。
- [`isMomentary`](ismomentary.md) 为 `true` 时，在 `change` 的回调里读它得到用户点的那一段。

### 怎么得知它变了

用户点了另一段时，控件派发 [`change`](../ui-control/change-event.md)。代码写入不派发：验收用例里写入之后 300 毫秒内没有收到 `change`。插入、删除段引起的下标变化也不派发。**插入、删除时不派发未在模拟器验证。**

### 写错时

不是有效下标时抛 `TypeError`，属性保持原来的值。

- 越界（大于等于段数，或小于 -1）：`selectedSegmentIndex 4 is out of range; expected 0 to 3, or -1 for none selected`（段数是 4 时）。一段都没有时是 `selectedSegmentIndex 0 is out of range; there are no segments, so only -1 (none selected) is allowed`。
- 转不出有限数（`'first'`、`undefined`）：`selectedSegmentIndex must be a finite number, got "first"`。

## 示例

```js
const titles = ['日', '周', '月'];
const seg = new UISegmentedControl(titles);
seg.selectedSegmentIndex = 0;
seg.addEventListener('change', () => {
  console.log('选了', titles[seg.selectedSegmentIndex]);
});
```

**效果**：一开始选中「日」。用户点「月」，控制台输出 `选了 月`。**点击的效果未在模拟器验证。**

## 对应的 iOS API

`UISegmentedControl.selectedSegmentIndex`。`UISegmentedControlNoSegment` 写成 -1。原生在删掉选中的那一段之后读出来是 -2，这里是 -1；原生对越界的写入不报错，这里抛 `TypeError`。

## 参见

- [`change`](../ui-control/change-event.md) 事件
- [`isMomentary`](ismomentary.md)：点完不保持选中
