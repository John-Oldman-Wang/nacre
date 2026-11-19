---
type: reference
native: UISegmentedControl.apportionsSegmentWidthsByContent
---

# `UISegmentedControl`：`apportionsSegmentWidthsByContent` 属性

**`apportionsSegmentWidthsByContent`** 属性决定各段的宽度是按内容分，还是一样宽。

## 值

布尔值。

| 取值 | 效果 |
| --- | --- |
| `true` | 标题长的段宽一些，标题短的段窄一些 |
| `false` | 各段等宽 |

- 可读，可写。
- 默认值是 `false`。
- 写入时按 JS 的真假值转换。
- 用 [`setWidth()`](setwidth.md) 给过宽度的段，按给的宽度显示。
- 两种取值在屏幕上的效果**未在模拟器验证**。

## 示例

```js
const seg = new UISegmentedControl(['全部', '未读', '已标记为重要']);
seg.apportionsSegmentWidthsByContent = true;
```

**效果**：「已标记为重要」那一段比另外两段宽。**未在模拟器验证。**

## 对应的 iOS API

`UISegmentedControl.apportionsSegmentWidthsByContent`。

## 参见

- [`setWidth()`](setwidth.md)：单独指定某一段的宽度
