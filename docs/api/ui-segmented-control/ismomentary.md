---
type: reference
native: UISegmentedControl.momentary
---

# `UISegmentedControl`：`isMomentary` 属性

**`isMomentary`** 属性决定点完一段之后它是否保持选中的样子。设成 `true` 时，分段选择当一排按钮用。

## 值

布尔值。

| 取值 | 效果 |
| --- | --- |
| `true` | 点一段，它闪一下，不保持选中的样子。连续点同一段，每次都派发 [`change`](../ui-control/change-event.md) |
| `false` | 点了哪段，哪段保持选中。再点已经选中的那一段不派发 `change` |

- 可读，可写。
- 默认值是 `false`。
- 写入时按 JS 的真假值转换。
- 两种取值在屏幕上的效果和 `change` 的派发**未在模拟器验证**。

## 示例

```js
const actions = new UISegmentedControl(['复制', '粘贴', '删除']);
actions.isMomentary = true;
actions.addEventListener('change', () => {
  console.log('点了第', actions.selectedSegmentIndex, '段');
});
```

**效果**：点一段，它闪一下；控制台输出点的是第几段。**未在模拟器验证。**

## 对应的 iOS API

`UISegmentedControl.momentary`（getter 是 `isMomentary`）。

## 参见

- [`selectedSegmentIndex`](selectedsegmentindex.md)
