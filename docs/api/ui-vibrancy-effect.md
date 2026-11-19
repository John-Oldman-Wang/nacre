---
type: reference
native: UIVibrancyEffect
status: partial
---

# `UIVibrancyEffect`

**`UIVibrancyEffect`** 表示一种鲜明效果：让放在模糊上面的文字和图标带上底下画面的颜色，而不是平平的一层灰。

鲜明效果照着一个[模糊效果](ui-blur-effect.md)来建，用在**另一个**[效果视图](ui-visual-effect-view.md)上：那个效果视图放在模糊面板的 `contentView` 里，文字和图标再放进它的 `contentView`。

鲜明效果不可变，没有属性。造出来之后读不出它是哪种样式。

**继承关系**：`EventTarget` → `NSObject` → [`UIVisualEffect`](ui-visual-effect.md) → `UIVibrancyEffect`

## 构造函数

不能用 `new` 创建，用下面的静态方法。

## 静态方法

[`UIVibrancyEffect.effectForBlurEffect()`](ui-vibrancy-effect/effectforblureffect.md)

按一个模糊效果造一个鲜明效果。`style` 按内容是文字、色块还是分隔线来选。

## 示例

```js
const blur = UIBlurEffect.effectWithStyle('systemMaterial');
const panel = new UIVisualEffectView(blur);
const vivid = new UIVisualEffectView(
  UIVibrancyEffect.effectForBlurEffect(blur, { style: 'label' }));
panel.contentView.addSubview(vivid);
```

**效果**：放进 `vivid.contentView` 的文字带上面板后面画面的颜色。**未在模拟器验证。**

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[UIVibrancyEffect effectForBlurEffect:blur]` | `UIVibrancyEffect.effectForBlurEffect(blur)` |
| `[UIVibrancyEffect effectForBlurEffect:blur style:UIVibrancyEffectStyleLabel]` | `UIVibrancyEffect.effectForBlurEffect(blur, { style: 'label' })` |

## 参见

- [做模糊和玻璃效果](../guides/blur-and-glass.md#让面板上的文字更鲜明)
- [`UIBlurEffect`](ui-blur-effect.md)
