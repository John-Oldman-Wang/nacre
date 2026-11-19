---
type: reference
native: UIGlassEffect.tintColor
---

# `UIGlassEffect`：`tintColor` 属性

**`tintColor`** 属性是给玻璃染的颜色。

## 值

[颜色](../ui-color.md)字符串，或者 `null`。

- 可读，可写。写入接受颜色字符串或 `UIColor` 对象；读出来是字符串。
- 默认值是 `null`：不染色。
- 改它不影响已经用了这个效果的视图。效果视图保存的是赋值那一刻的副本，改完要重新赋给 [`effect`](../ui-visual-effect-view/effect.md)。
- 染色在屏幕上的样子**未在模拟器验证**。

### 怎么得知它变了

它变了不派发事件。只有 App 的代码会改它，不需要通知。

### 写错时

写入不合法的颜色：不抛异常，控制台输出一条警告，`tintColor` 保留原值。这是所有颜色属性共同的行为，见[颜色](../ui-color.md)。

## 示例

```js
const glass = UIGlassEffect.effectWithStyle('clear');
glass.tintColor = 'rgba(255, 45, 85, 0.35)';
const chip = new UIVisualEffectView(glass);
```

**效果**：玻璃带一层粉色。**未在模拟器验证。**

## 对应的 iOS API

`UIGlassEffect.tintColor`。原生是 `UIColor`，这里写颜色字符串。

## 参见

- [`isInteractive`](isinteractive.md)
- [颜色](../ui-color.md)：颜色字符串的写法
