---
type: reference
native: CALayer.shadowOpacity
---

# `CALayer`：`shadowOpacity` 属性

**`shadowOpacity`** 属性是阴影的不透明度。

## 值

数，0 到 1 的比例。

- 可读，可写。
- **默认值是 `0`，阴影默认不显示。** 只设颜色、半径、偏移，屏幕上没有任何变化。
- 阴影按图层里画出来的内容的轮廓生成。视图没有底色也没有内容时，没有阴影。
- 阴影画在图层的范围之外。`masksToBounds`（视图上是 `clipsToBounds`）为 `true` 时阴影也被裁掉。

### 写错时

写入的值按 `Number()` 转成数。转不成有限数的抛 `TypeError`。

## 示例

```js
const card = new UIView();
card.backgroundColor = 'systemBackground';
card.layer.shadowOpacity = 0.25;
card.layer.shadowRadius = 8;
card.layer.shadowOffset = new CGSize(0, 4);
```

**效果**：卡片下方出现一片柔和的黑色阴影，向下偏 4 pt，边缘模糊的范围是 8 pt，最深处的不透明度是 25%。**阴影的样子未在模拟器验证。**

## 对应的 iOS API

`CALayer.shadowOpacity`。

## 参见

- [`shadowColor`](shadowcolor.md)
