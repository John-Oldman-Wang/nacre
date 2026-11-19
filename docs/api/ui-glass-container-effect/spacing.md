---
type: reference
native: UIGlassContainerEffect.spacing
---

# `UIGlassContainerEffect`：`spacing` 属性

**`spacing`** 属性是两块玻璃相距多近时开始融合在一起。

## 值

数，单位 [pt](../units.md)。

- 可读，可写。
- 默认值是 `0`。
- 两块玻璃相距小于这个值时开始融合。融合的样子**未在模拟器验证**。
- 改它不影响已经用了这个效果的视图。效果视图保存的是赋值那一刻的副本，改完要重新赋给 [`effect`](../ui-visual-effect-view/effect.md)。

### 怎么得知它变了

它变了不派发事件。只有 App 的代码会改它，不需要通知。

### 写错时

- 负数：抛 `TypeError: spacing must be a non-negative number`。
- 转不成数的值：抛 `TypeError: spacing must be a finite number, got "wide"`。
- 出错时属性保持原来的值。

## 示例

```js
const group = new UIGlassContainerEffect();
group.spacing = 16;
console.log(group.spacing);
```

**结果**：输出 `16`。

## 对应的 iOS API

`UIGlassContainerEffect.spacing`。

## 参见

- [`UIGlassContainerEffect()`](constructor.md)
