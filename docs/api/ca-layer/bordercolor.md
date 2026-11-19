---
type: reference
native: CALayer.borderColor
---

# `CALayer`：`borderColor` 属性

**`borderColor`** 属性是边框的颜色。

## 值

[颜色](../ui-color.md)字符串，或者 `null`。

- 可读，可写。
- 默认值是 `'#000000'`，不透明的黑色。
- 写入时接受[颜色字符串](../ui-color.md)，也接受 `UIColor` 对象。
- 写入随深浅色模式变化的颜色（`'label'`、`'light-dark(…)'` 这类）时，当场按图层所属视图当时的模式换算成一个固定的颜色，之后切换模式不会变，见[图层上的颜色](../ca-layer.md#图层上的颜色)。
- 读出来是表示同一个颜色的字符串，不保证大小写和写法与写入时完全相同；随模式变化的颜色读回来是换算后的 `'#rrggbb'`。
- 读出来是新建的字符串，跟着深浅色变需要在 `traitchange` 里重新写，见指南[用图层画圆角、阴影、渐变和形状](../../guides/layers.md#切换深浅色后更新图层的颜色)。

### 写错时

写入不合法的颜色时不抛异常。控制台输出一条警告，属性保持原来的值：

```
[Nacre] borderColor: "sytemBlue" is not a valid color, ignored; expected a color name, one of: …
```

## 示例

```js
const view = new UIView();
view.overrideUserInterfaceStyle = 'dark';
view.layer.borderWidth = 1;
view.layer.borderColor = 'label';
console.log(view.layer.borderColor);
```

**结果**：视图被固定成深色、并且深色已经生效时，输出 `#ffffff`（验收用例验证过）。写入时深色还没生效，读到的是浅色下的值，见 [`UITraitCollection`](../ui-trait-collection.md#强制之后不是立刻生效)。

## 对应的 iOS API

`CALayer.borderColor`。ObjC 里写 `UIColor.systemBlueColor.CGColor`，这里写 `'systemBlue'`。

## 参见

- [`borderWidth`](borderwidth.md)
- [图层上的颜色](../ca-layer.md#图层上的颜色)
