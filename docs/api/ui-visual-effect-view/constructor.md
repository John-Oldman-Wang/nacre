---
type: reference
native: "-[UIVisualEffectView initWithEffect:]"
---

# `UIVisualEffectView()` 构造函数

**`UIVisualEffectView()`** 构造函数创建一个效果视图，并让它显示指定的效果。

## 语法

```
new UIVisualEffectView()
new UIVisualEffectView(effect)
```

### 参数

**`effect`**

可选。一个效果对象：[`UIBlurEffect`](../ui-blur-effect.md)、[`UIVibrancyEffect`](../ui-vibrancy-effect.md)、[`UIGlassEffect`](../ui-glass-effect.md)、[`UIGlassContainerEffect`](../ui-glass-container-effect.md) 之一，或者 `null`。不给或给 `null` 时 [`effect`](effect.md) 是 `null`，之后可以再设。

### 返回值

新建的 `UIVisualEffectView`。大小是 0 × 0 pt，要自己给 `frame` 或者用 [Auto Layout](../auto-layout.md) 定位。

新建的效果视图上，几个继承自 [`UIView`](../ui-view.md) 的属性默认值是：

| 属性 | 默认值 | 说明 |
| --- | --- | --- |
| `backgroundColor` | `null` | 不需要设。效果自己决定底色 |
| `clipsToBounds` | `false` | 做圆角时要改成 `true` |
| `isUserInteractionEnabled` | `true` | 效果视图和 `contentView` 默认都接收触摸 |

### 异常

**`TypeError`**

- 参数不是效果对象也不是 `null`：`UIVisualEffectView needs a UIVisualEffect or null`。传样式名字符串（`new UIVisualEffectView('systemMaterial')`）也是这个错，要先用工厂方法造出效果对象。
- 用 `class X extends UIVisualEffectView {}` 继承之后 `new X()`，见[原生类](../native-classes.md)。

## 示例

```js
const blur = UIBlurEffect.effectWithStyle('systemMaterial');
const panel = new UIVisualEffectView(blur);
panel.frame = new CGRect(60, 260, 240, 80);

const empty = new UIVisualEffectView();
console.log(empty.effect);
```

**效果**：`panel` 是一块 240 × 80 pt 的模糊面板。控制台输出 `null`。

## 对应的 iOS API

`-[UIVisualEffectView initWithEffect:]`。

## 参见

- [`effect`](effect.md)
- [`contentView`](contentview.md)：内容加在这里
