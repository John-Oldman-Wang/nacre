---
type: reference
native: "+[UIVibrancyEffect effectForBlurEffect:style:]"
---

# `UIVibrancyEffect.effectForBlurEffect()` 静态方法

**`UIVibrancyEffect.effectForBlurEffect()`** 静态方法按一个模糊效果造一个鲜明效果。

## 语法

```
UIVibrancyEffect.effectForBlurEffect(blurEffect)
UIVibrancyEffect.effectForBlurEffect(blurEffect, { style })
```

### 参数

**`blurEffect`**

必填。底下那块模糊用的 [`UIBlurEffect`](../ui-blur-effect.md)。鲜明效果按它来配。

**`options.style`**

可选，按内容是什么来选。配 `system…Material` 的模糊时给一个 `style`；不给时是较早的那种鲜明效果，不区分内容的类型。**各样式的实际观感未在模拟器验证**，说明来自 Apple 的头文件。

| `style` | 给什么内容用 |
| --- | --- |
| `'label'` | 文字，最醒目的一级。它保留内容自己的颜色 |
| `'secondaryLabel'` | 文字，次一级 |
| `'tertiaryLabel'` | 文字，再次一级 |
| `'quaternaryLabel'` | 文字，最淡的一级 |
| `'fill'` | 填充的色块，最醒目的一级 |
| `'secondaryFill'` | 填充的色块，次一级 |
| `'tertiaryFill'` | 填充的色块，最淡的一级 |
| `'separator'` | 分隔线 |

除 `'label'` 之外的样式只使用内容的透明度，内容自己的颜色被忽略。

### 返回值

新建的 `UIVibrancyEffect`。每次调用都是新的对象。

### 异常

**`TypeError`**

- `blurEffect` 不是 `UIBlurEffect`（没给、`null`、别的效果、样式名字符串）：`effectForBlurEffect needs a UIBlurEffect`
- `style` 不在上表里：报错信息里列出所有可用的值。

## 示例

```js
const blur = UIBlurEffect.effectWithStyle('systemMaterial');
const panel = new UIVisualEffectView(blur);
const vivid = new UIVisualEffectView(
  UIVibrancyEffect.effectForBlurEffect(blur, { style: 'label' }));
panel.contentView.addSubview(vivid);

const label = new UILabel();
label.text = '鲜明的字';
vivid.contentView.addSubview(label);
```

**效果**：文字带上面板后面画面的颜色。**未在模拟器验证。**

鲜明效果用在**另一个**效果视图上，这个效果视图放在模糊面板的 `contentView` 里，文字再放进它的 `contentView`。

## 对应的 iOS API

`+[UIVibrancyEffect effectForBlurEffect:]` 和 `+[UIVibrancyEffect effectForBlurEffect:style:]`，合成一个方法，`style` 放在 options 里。

## 参见

- [`UIBlurEffect.effectWithStyle()`](../ui-blur-effect/effectwithstyle.md)
- [做模糊和玻璃效果](../../guides/blur-and-glass.md#让面板上的文字更鲜明)
