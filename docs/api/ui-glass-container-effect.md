---
type: reference
native: UIGlassContainerEffect
status: partial
---

# `UIGlassContainerEffect`

**`UIGlassContainerEffect`** 表示一个玻璃容器效果（iOS 26）：把几块玻璃合成一组来画，靠得够近的会融在一起。

用法是把它交给一个[效果视图](ui-visual-effect-view.md)，再把几个用 [`UIGlassEffect`](ui-glass-effect.md) 的效果视图放进这个效果视图的 `contentView`。

和玻璃效果一样，效果视图保存的是赋值那一刻的副本：交出去之后再改 `spacing`，效果视图不跟着变，要重新赋一次。

**继承关系**：`EventTarget` → `NSObject` → [`UIVisualEffect`](ui-visual-effect.md) → `UIGlassContainerEffect`

## 构造函数

[`UIGlassContainerEffect()`](ui-glass-container-effect/constructor.md)

创建一个玻璃容器效果，`spacing` 是 0。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`spacing`](ui-glass-container-effect/spacing.md) | 两块玻璃相距多近开始融合，单位 pt |

## 示例

```js
const group = new UIGlassContainerEffect();
group.spacing = 16;
const groupView = new UIVisualEffectView(group);
groupView.frame = new CGRect(40, 420, 300, 60);

for (let i = 0; i < 2; i++) {
  const piece = new UIVisualEffectView(UIGlassEffect.effectWithStyle('regular'));
  piece.frame = new CGRect(i * 70, 8, 60, 44);
  groupView.contentView.addSubview(piece);
}
```

**效果**：两块 60 × 44 pt 的玻璃相距 10 pt，小于 `spacing` 的 16 pt，它们融合在一起。**未在模拟器验证。**

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[UIGlassContainerEffect alloc] init]` | `new UIGlassContainerEffect()` |
| `container.spacing = 16` | `container.spacing = 16` |

## 参见

- [`UIGlassEffect`](ui-glass-effect.md)
- [做模糊和玻璃效果](../guides/blur-and-glass.md#把几块玻璃合成一组)
