---
type: reference
native: "+[UIGlassEffect effectWithStyle:]"
---

# `UIGlassEffect.effectWithStyle()` 静态方法

**`UIGlassEffect.effectWithStyle()`** 静态方法造一个指定样式的玻璃效果。

## 语法

```
UIGlassEffect.effectWithStyle(style)
```

### 参数

**`style`**

玻璃的样式，字符串：

| `style` | 效果 |
| --- | --- |
| `'regular'` | 标准的玻璃 |
| `'clear'` | 透明的玻璃 |

两种样式的实际观感**未在模拟器验证**。

### 返回值

新建的 `UIGlassEffect`。[`isInteractive`](isinteractive.md) 是 `false`，[`tintColor`](tintcolor.md) 是 `null`。每次调用都是新的对象。

### 异常

**`TypeError`**

`style` 不是上面两个值：`style has no value "frosted"; expected one of: regular / clear`

## 示例

```js
const glass = UIGlassEffect.effectWithStyle('regular');
const chip = new UIVisualEffectView(glass);
chip.frame = new CGRect(60, 360, 120, 44);
```

**效果**：得到一块 120 × 44 pt 的玻璃。**未在模拟器验证。**

## 对应的 iOS API

`+[UIGlassEffect effectWithStyle:]`。`UIGlassEffectStyleRegular` 写成 `'regular'`。

## 参见

- [`isInteractive`](isinteractive.md)、[`tintColor`](tintcolor.md)：先设好再交给效果视图
