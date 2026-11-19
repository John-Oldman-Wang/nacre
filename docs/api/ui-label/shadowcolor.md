---
type: reference
native: UILabel.shadowColor
---

# `UILabel`：`shadowColor` 属性

**`shadowColor`** 属性是文字阴影的颜色。文字阴影是在每个字旁边多画一份同样形状的文字，边缘清晰，没有模糊。

## 值

[颜色](../ui-color.md)字符串，或者 `null`。

- 可读，可写。
- 默认值是 `null`，表示没有阴影。
- 写入时接受颜色字符串，也接受 `UIColor` 对象。读出来的字符串和写入的相同。
- 阴影的位置由 [`shadowOffset`](shadowoffset.md) 决定。
- 文字阴影没有模糊半径。要边缘模糊的阴影，用图层的阴影属性，见 [`CALayer`](../ca-layer.md)。

### 写错时

写入不合法的颜色时不抛异常。控制台输出一条警告，颜色保持原值：

```
[Nacre] shadowColor: "#GGG" is not a valid color, ignored
```

## 示例

```js
const label = new UILabel();
label.text = '标题';
label.shadowColor = 'rgba(0,0,0,.25)';
label.shadowOffset = new CGSize(0, 2);
```

**效果**：每个字的正下方 2 pt 处多出一份同样形状的、半透明黑色的文字。**未在模拟器验证。**

## 对应的 iOS API

`UILabel.shadowColor`。ObjC 里是 `UIColor` 对象，这里写成字符串。

## 参见

- [`shadowOffset`](shadowoffset.md)
- [`UIColor`](../ui-color.md)
