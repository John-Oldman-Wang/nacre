---
type: reference
native: UIVisualEffectView.effect
---

# `UIVisualEffectView`：`effect` 属性

**`effect`** 属性是效果视图显示的效果。

## 值

一个效果对象，或者 `null`。效果对象是 [`UIBlurEffect`](../ui-blur-effect.md)、[`UIVibrancyEffect`](../ui-vibrancy-effect.md)、[`UIGlassEffect`](../ui-glass-effect.md)、[`UIGlassContainerEffect`](../ui-glass-container-effect.md) 之一。

- 可读，可写。
- 默认值是构造时给的效果，没给是 `null`。
- `null` 表示没有效果：效果视图只是一个装着 `contentView` 的容器。设成 `null` 时 `contentView` 和里面的内容不变。面板不再处理后面的画面**未在模拟器验证**。
- 换效果时 `contentView` 和里面的内容不变。

读回来的是不是写进去的那个对象，取决于效果的种类：

| | 模糊、鲜明 | 玻璃、玻璃容器 |
| --- | --- | --- |
| 赋值之后读回来 | 是写进去的那个对象 | 是一份副本，不是写进去的那个对象 |
| 连续读两次 | 同一个对象 | 两个不同的对象 |
| 赋值之后改原来的对象 | 不适用，它们没有可写的属性 | 效果视图不跟着变 |
| 改读回来的对象 | 不适用 | 效果视图不跟着变 |

所以判断一个效果视图用的是不是某个玻璃效果，不能用 `===`。要改玻璃的属性，改自己手里的那个对象，然后重新赋给 `effect`。

### 怎么得知它变了

它变了不派发事件。只有 App 的代码会改它，不需要通知。

### 写错时

- 写入不是效果的原生对象：抛 `TypeError: effect needs a UIVisualEffect or null`。
- 写入字符串、数字：抛 `TypeError: effect needs a native object or null, got "systemMaterial"`。
- 被拒之后 `effect` 保持原值。

## 示例

### 换一种模糊

```js
const panel = new UIVisualEffectView(UIBlurEffect.effectWithStyle('systemMaterial'));
panel.effect = UIBlurEffect.effectWithStyle('systemThinMaterialDark');
```

**效果**：面板换成较薄的、固定为深色的模糊。`contentView` 里的内容还在。**未在模拟器验证。**

### 玻璃读回来是副本

```js
const glass = UIGlassEffect.effectWithStyle('regular');
const chip = new UIVisualEffectView(glass);
console.log(chip.effect === glass);

glass.tintColor = '#34C759';
chip.effect = glass;
const current = chip.effect;
if (current instanceof UIGlassEffect) {
  console.log(current.tintColor);
}
```

**结果**：先输出 `false`，再输出 `#34C759`。改了 `glass` 之后重新赋一次，效果视图才用上新的颜色。屏幕上玻璃变成绿色**未在模拟器验证**。

## 对应的 iOS API

`UIVisualEffectView.effect`。`view.effect = nil` 写成 `view.effect = null`。

## 参见

- [`UIGlassEffect`](../ui-glass-effect.md)
- [做模糊和玻璃效果](../../guides/blur-and-glass.md)
