---
type: reference
native: CALayer.shadowPath
---

# `CALayer`：`shadowPath` 属性

**`shadowPath`** 属性是阴影的形状：给了一条路径，阴影照这条路径的形状画，不再按图层里画出来的内容生成。

## 值

[`UIBezierPath`](../ui-bezier-path.md)，或者 `null`。

- 可读，可写。
- 默认值是 `null`：阴影按图层里画出来的内容的轮廓生成，见 [`shadowOpacity`](shadowopacity.md)。
- 路径里的坐标按图层自己的坐标系算，原点在图层左上角，单位 [pt](../units.md)。
- 读出来的是写进去的那个对象。写 `null` 去掉路径，阴影回到按内容生成。
- **写入之后再修改这条路径，阴影不会变。** 图层保存的是写入那一刻的形状。改完路径后要再赋值一次。**未在真机验证。**
- 图层的大小变了，路径不会跟着变。卡片的大小会变时，在大小变了之后按新的 `bounds` 重新写一次。
- 阴影的颜色、不透明度、模糊范围和偏移仍然由 [`shadowColor`](shadowcolor.md)、[`shadowOpacity`](shadowopacity.md)、[`shadowRadius`](shadowradius.md)、[`shadowOffset`](shadowoffset.md) 决定。`shadowOpacity` 是 0 时，有路径也看不到阴影。
- 按 Apple 的文档，给出路径之后系统不用再从内容算阴影的形状，绘制通常更快；图层没有底色、没有内容时也照路径画出阴影。屏幕上的效果**未在真机验证**。

### 写错时

**`TypeError`**

写入的是别的原生对象，比如一个视图：

```
TypeError: shadowPath needs a UIBezierPath or null
```

写入的不是原生对象：

```
TypeError: shadowPath needs a native object or null, got "M0 0"
```

出错时属性保持原值（实测）。

## 示例

给一张圆角卡片配上同样形状的阴影：

```js
const card = new UIView();
card.frame = new CGRect(20, 120, 280, 120);
card.backgroundColor = 'systemBackground';
card.layer.cornerRadius = 16;
card.layer.shadowOpacity = 0.2;
card.layer.shadowRadius = 10;
card.layer.shadowOffset = new CGSize(0, 4);
card.layer.shadowPath = UIBezierPath.bezierPathWithRoundedRect(card.bounds, { cornerRadius: 16 });

const path = card.layer.shadowPath;
console.log(path !== null && path.bounds.width);
```

**效果**：控制台输出 `280`。卡片下方是一片圆角矩形的阴影，向下偏 4 pt。**阴影的样子未在真机验证。**

## 对应的 iOS API

`CALayer.shadowPath`。ObjC 里写 `path.CGPath`，这里直接写 `UIBezierPath`。

## 参见

- [`shadowOpacity`](shadowopacity.md)：不设它阴影不显示
- [`UIBezierPath`](../ui-bezier-path.md)：怎么描出一条路径
- [用图层画圆角、阴影、渐变和形状](../../guides/layers.md)
