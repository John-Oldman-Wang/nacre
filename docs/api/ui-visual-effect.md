---
type: reference
native: UIVisualEffect
status: partial
---

# `UIVisualEffect`

**`UIVisualEffect`** 表示一种视觉效果，是四种效果的共同父类：[`UIBlurEffect`](ui-blur-effect.md)（模糊）、[`UIVibrancyEffect`](ui-vibrancy-effect.md)（鲜明）、[`UIGlassEffect`](ui-glass-effect.md)（玻璃）、[`UIGlassContainerEffect`](ui-glass-container-effect.md)（玻璃容器）。

效果对象自己不显示任何东西，交给 [`UIVisualEffectView`](ui-visual-effect-view.md) 才看得见。`UIVisualEffect` 没有成员，它的用处是做类型：效果视图的 [`effect`](ui-visual-effect-view/effect.md) 属性接受任何一种效果。

**继承关系**：`EventTarget` → `NSObject` → `UIVisualEffect`

## 构造函数

不能用 `new` 创建。用四个子类的工厂方法或构造函数创建效果：

| 类 | 怎么得到 |
| --- | --- |
| `UIBlurEffect` | [`UIBlurEffect.effectWithStyle()`](ui-blur-effect/effectwithstyle.md) |
| `UIVibrancyEffect` | [`UIVibrancyEffect.effectForBlurEffect()`](ui-vibrancy-effect/effectforblureffect.md) |
| `UIGlassEffect` | [`UIGlassEffect.effectWithStyle()`](ui-glass-effect/effectwithstyle.md) |
| `UIGlassContainerEffect` | [`new UIGlassContainerEffect()`](ui-glass-container-effect/constructor.md) |

## 示例

```js
/** @param {UIVisualEffectView} view */
function describe(view) {
  const effect = view.effect;
  if (effect === null) return '没有效果';
  if (effect instanceof UIBlurEffect) return '模糊';
  if (effect instanceof UIGlassEffect) return '玻璃';
  return '别的效果';
}
console.log(describe(new UIVisualEffectView(UIBlurEffect.effectWithStyle('dark'))));
```

**结果**：输出 `模糊`。**用 `instanceof` 判断效果的种类未在模拟器验证。**

## 对应的 iOS API

`UIVisualEffect`。

## 参见

- [`UIVisualEffectView`](ui-visual-effect-view.md)：把效果显示出来的视图
