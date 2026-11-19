---
type: reference
native: UIGlassEffect.interactive
---

# `UIGlassEffect`：`isInteractive` 属性

**`isInteractive`** 属性决定手指按在玻璃上时，玻璃有没有反应。

## 值

布尔值。

| 取值 | 效果 |
| --- | --- |
| `true` | 手指按在玻璃上时，玻璃有反应 |
| `false` | 手指按上去没有反应 |

- 可读，可写。
- 默认值是 `false`。
- 两种取值在屏幕上的样子**未在模拟器验证**。
- 改它不影响已经用了这个效果的视图。效果视图保存的是赋值那一刻的副本，改完要重新赋给 [`effect`](../ui-visual-effect-view/effect.md)。

### 怎么得知它变了

它变了不派发事件。只有 App 的代码会改它，不需要通知。

## 示例

```js
const glass = UIGlassEffect.effectWithStyle('clear');
glass.isInteractive = true;
const chip = new UIVisualEffectView(glass);
```

**效果**：手指按在 `chip` 上时玻璃有反应。**未在模拟器验证。**

## 对应的 iOS API

`UIGlassEffect.interactive`，读取方法是 `isInteractive`。

## 参见

- [`tintColor`](tintcolor.md)
