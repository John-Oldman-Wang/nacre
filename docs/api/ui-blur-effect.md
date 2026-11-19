---
type: reference
native: UIBlurEffect
status: partial
---

# `UIBlurEffect`

**`UIBlurEffect`** 表示一种模糊效果：把[效果视图](ui-visual-effect-view.md)后面的画面变模糊，并盖上一层半透明的颜色。模糊的样式在创建时确定。

模糊效果不可变，没有属性，同一个对象可以交给多个效果视图。造出来之后读不出它是哪种样式。

**继承关系**：`EventTarget` → `NSObject` → [`UIVisualEffect`](ui-visual-effect.md) → `UIBlurEffect`

怎么用它做一块模糊面板，见指南[做模糊和玻璃效果](../guides/blur-and-glass.md)。

## 构造函数

不能用 `new` 创建：`new UIBlurEffect()` 抛 `TypeError: Illegal constructor: UIBlurEffect is not created with new; use UIBlurEffect.effectWithStyle(style)`。用下面的静态方法。

## 静态方法

[`UIBlurEffect.effectWithStyle()`](ui-blur-effect/effectwithstyle.md)

造一个指定样式的模糊效果。多数界面用 `'systemMaterial'` 一组，它们跟随深浅色模式。

## 示例

```js
const blur = UIBlurEffect.effectWithStyle('systemMaterial');
const panel = new UIVisualEffectView(blur);
const toolbar = new UIVisualEffectView(blur);
```

**效果**：`panel` 和 `toolbar` 用同一个模糊效果，都显示标准厚度的模糊。**未在模拟器验证。**

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[UIBlurEffect effectWithStyle:UIBlurEffectStyleSystemMaterial]` | `UIBlurEffect.effectWithStyle('systemMaterial')` |

## 参见

- [`UIVisualEffectView`](ui-visual-effect-view.md)：把效果显示出来
- [`UIVibrancyEffect`](ui-vibrancy-effect.md)：按模糊效果配的鲜明效果
- [外观特征](ui-trait-collection.md)：深浅色模式，多数模糊样式跟随它
