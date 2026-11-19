---
type: reference
native: CALayer.backgroundColor
---

# `CALayer`：`backgroundColor` 属性

**`backgroundColor`** 属性是图层的底色。

## 值

[颜色](../ui-color.md)字符串，或者 `null`。

- 可读，可写。
- 默认值是 `null`，没有底色。
- 写入时接受[颜色字符串](../ui-color.md)，也接受 `UIColor` 对象。
- 写入随深浅色模式变化的颜色（`'label'`、`'light-dark(…)'` 这类）时，当场按图层所属视图当时的模式换算成一个固定的颜色，之后切换模式不会变，见[图层上的颜色](../ca-layer.md#图层上的颜色)。
- 读出来是表示同一个颜色的字符串，不保证大小写和写法与写入时完全相同；随模式变化的颜色读回来是换算后的 `'#rrggbb'`。
- 视图自己的图层用 `view.backgroundColor`：它保存随模式变化的颜色，系统切换模式后自动跟着变。

### 写错时

写入不合法的颜色时不抛异常。控制台输出一条警告，属性保持原来的值：

```
[Nacre] backgroundColor: "sytemBlue" is not a valid color, ignored; expected a color name, one of: …
```

## 示例

```js
const layer = new CALayer();
layer.backgroundColor = '#FF2D55';
console.log(layer.backgroundColor);
```

**结果**：控制台输出 `#FF2D55`。

## 对应的 iOS API

`CALayer.backgroundColor`。ObjC 里写 `color.CGColor`，这里写颜色字符串。

## 参见

- [图层上的颜色](../ca-layer.md#图层上的颜色)
