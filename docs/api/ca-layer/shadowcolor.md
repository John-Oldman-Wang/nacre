---
type: reference
native: CALayer.shadowColor
---

# `CALayer`：`shadowColor` 属性

**`shadowColor`** 属性是阴影的颜色。

## 值

[颜色](../ui-color.md)字符串，或者 `null`。

- 可读，可写。
- 默认值是不透明的黑色。
- 只设颜色看不到阴影：[`shadowOpacity`](shadowopacity.md) 默认是 0。
- 写入时接受[颜色字符串](../ui-color.md)，也接受 `UIColor` 对象。
- 写入随深浅色模式变化的颜色（`'label'`、`'light-dark(…)'` 这类）时，当场按图层所属视图当时的模式换算成一个固定的颜色，之后切换模式不会变，见[图层上的颜色](../ca-layer.md#图层上的颜色)。
- 读出来是表示同一个颜色的字符串，不保证大小写和写法与写入时完全相同；随模式变化的颜色读回来是换算后的 `'#rrggbb'`。

### 写错时

写入不合法的颜色时不抛异常。控制台输出一条警告，属性保持原来的值：

```
[Nacre] shadowColor: "sytemBlue" is not a valid color, ignored; expected a color name, one of: …
```

## 示例

```js
const card = new UIView();
card.backgroundColor = 'systemBackground';
card.layer.shadowColor = 'black';
card.layer.shadowOpacity = 0.25;
```

**效果**：卡片四周出现一片黑色阴影。**阴影的样子未在模拟器验证。**

## 对应的 iOS API

`CALayer.shadowColor`。

## 参见

- [`shadowOpacity`](shadowopacity.md)、[`shadowRadius`](shadowradius.md)、[`shadowOffset`](shadowoffset.md)
