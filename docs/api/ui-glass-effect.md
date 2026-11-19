---
type: reference
native: UIGlassEffect
status: partial
---

# `UIGlassEffect`

**`UIGlassEffect`** 表示一种玻璃效果，是 iOS 26 的新材质。交给[效果视图](ui-visual-effect-view.md)后，那块区域显示成玻璃，可以染色，也可以对触摸有反应。

**效果视图保存的是赋值那一刻的副本。** 把玻璃效果交给效果视图之后再改这个对象，效果视图不跟着变，要重新赋一次；从效果视图读回来的也是一份副本，不是写进去的那个对象。所以先把属性设好，再交给效果视图。

几块玻璃要作为一组来画、靠得够近时融在一起，用 [`UIGlassContainerEffect`](ui-glass-container-effect.md)。

**继承关系**：`EventTarget` → `NSObject` → [`UIVisualEffect`](ui-visual-effect.md) → `UIGlassEffect`

怎么用玻璃，见指南[做模糊和玻璃效果](../guides/blur-and-glass.md#用玻璃)。

## 构造函数

不能用 `new` 创建，用下面的静态方法。

## 静态方法

[`UIGlassEffect.effectWithStyle()`](ui-glass-effect/effectwithstyle.md)

造一个玻璃效果，样式是 `'regular'` 或 `'clear'`。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`isInteractive`](ui-glass-effect/isinteractive.md) | 手指按上去时玻璃有没有反应 |
| [`tintColor`](ui-glass-effect/tintcolor.md) | 给玻璃染的颜色 |

## 示例

```js
const glass = UIGlassEffect.effectWithStyle('clear');
glass.tintColor = 'rgba(255, 45, 85, 0.35)';
glass.isInteractive = true;
const chip = new UIVisualEffectView(glass);
chip.frame = new CGRect(60, 360, 120, 44);
```

**效果**：一块 120 × 44 pt、带一层粉色的透明玻璃，手指按在上面时有反应。**未在模拟器验证。**

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[UIGlassEffect effectWithStyle:UIGlassEffectStyleRegular]` | `UIGlassEffect.effectWithStyle('regular')` |
| `glass.interactive = YES` | `glass.isInteractive = true` |
| `glass.tintColor = color` | `glass.tintColor = '#FF2D55'` |

## 参见

- [`UIVisualEffectView`](ui-visual-effect-view.md)：[`effect`](ui-visual-effect-view/effect.md) 读回来是副本
- [`UIGlassContainerEffect`](ui-glass-container-effect.md)：把几块玻璃合成一组
- [颜色](ui-color.md)：`tintColor` 的写法
