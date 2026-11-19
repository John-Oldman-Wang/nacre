---
type: reference
native: "+[UIBlurEffect effectWithStyle:]"
---

# `UIBlurEffect.effectWithStyle()` 静态方法

**`UIBlurEffect.effectWithStyle()`** 静态方法造一个指定样式的模糊效果。

## 语法

```
UIBlurEffect.effectWithStyle(style)
```

### 参数

**`style`**

模糊的样式，字符串。分三组。**各样式的实际观感未在模拟器验证**，下表的说明来自 Apple 的头文件和样式的名字。

| `style` | 效果 |
| --- | --- |
| `'systemUltraThinMaterial'` | 材质，最薄：后面的画面透出来最多。跟随[深浅色模式](../ui-trait-collection.md) |
| `'systemThinMaterial'` | 材质，较薄。跟随深浅色模式 |
| `'systemMaterial'` | 材质，标准厚度。跟随深浅色模式 |
| `'systemThickMaterial'` | 材质，较厚：后面的画面透出来最少。跟随深浅色模式 |
| `'systemChromeMaterial'` | 材质，名字里的 chrome 指工具栏这类界面外框。跟随深浅色模式 |
| 上面五个加 `Light` 后缀，如 `'systemMaterialLight'` | 同一种材质，固定为浅色模式下的样子，不跟随深浅色模式 |
| 上面五个加 `Dark` 后缀，如 `'systemMaterialDark'` | 同一种材质，固定为深色模式下的样子 |
| `'regular'` | 浅色模式下等于 `'light'`，深色模式下等于 `'dark'` |
| `'prominent'` | 浅色模式下等于 `'extraLight'`，深色模式下等于 `'dark'` |
| `'extraLight'` | 模糊并盖一层很亮的颜色。不跟随深浅色模式 |
| `'light'` | 模糊并盖一层亮的颜色。不跟随深浅色模式 |
| `'dark'` | 模糊并盖一层暗的颜色。不跟随深浅色模式 |

### 返回值

新建的 `UIBlurEffect`。每次调用都是新的对象：同一种样式调两次，得到两个不相等的对象。

### 异常

**`TypeError`**

`style` 不在上表里。报错信息里列出所有可用的值，形如 `style has no value "frosted"; expected one of: extraLight / light / dark / …`。

## 示例

```js
const blur = UIBlurEffect.effectWithStyle('systemMaterial');
const panel = new UIVisualEffectView(blur);
console.log(panel.effect === blur);
```

**结果**：输出 `true`。模糊效果交给效果视图后，读回来是同一个对象。

## 对应的 iOS API

`+[UIBlurEffect effectWithStyle:]`。`UIBlurEffectStyleSystemMaterial` 写成 `'systemMaterial'`，其余同理。tvOS 的 `UIBlurEffectStyleExtraDark` 在 iOS 上不可用，没有提供。

## 参见

- [`UIVisualEffectView()`](../ui-visual-effect-view/constructor.md)
- [`UIVibrancyEffect.effectForBlurEffect()`](../ui-vibrancy-effect/effectforblureffect.md)：按这个模糊配一个鲜明效果
