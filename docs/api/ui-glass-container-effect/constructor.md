---
type: reference
native: "-[UIGlassContainerEffect init]"
---

# `UIGlassContainerEffect()` 构造函数

**`UIGlassContainerEffect()`** 构造函数创建一个玻璃容器效果。把它交给一个效果视图，再把几块玻璃放进那个效果视图的 `contentView`，这几块玻璃就作为一组来画。

## 语法

```
new UIGlassContainerEffect()
```

### 参数

无。

### 返回值

新建的 `UIGlassContainerEffect`。[`spacing`](spacing.md) 是 0。

### 异常

无。

## 示例

```js
const group = new UIGlassContainerEffect();
const groupView = new UIVisualEffectView(group);
groupView.frame = new CGRect(40, 420, 300, 60);
```

**效果**：得到一个 300 × 60 pt 的效果视图。往它的 `contentView` 里放玻璃效果视图，它们作为一组来画。**未在模拟器验证。**

## 对应的 iOS API

`[[UIGlassContainerEffect alloc] init]`。

## 参见

- [`spacing`](spacing.md)
- [做模糊和玻璃效果](../../guides/blur-and-glass.md#把几块玻璃合成一组)
