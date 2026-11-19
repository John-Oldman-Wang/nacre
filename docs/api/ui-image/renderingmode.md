---
type: reference
native: UIImage.renderingMode
---

# `UIImage`：`renderingMode` 属性

**`renderingMode`** 属性决定图片显示时用不用它自身的颜色。

## 值

字符串，下面三个之一：

| 取值 | 效果 |
| --- | --- |
| `'automatic'` | 由使用图片的地方决定。新取到的图片都是这个值 |
| `'alwaysOriginal'` | 始终显示图片自身的颜色，`tintColor` 不起作用 |
| `'alwaysTemplate'` | 始终当作模板图：忽略图片自身的颜色，只用它的形状，整张按 `tintColor` 上色 |

SF Symbols 图标也是 `'automatic'`。要改，用 [`imageWithRenderingMode()`](imagewithrenderingmode.md) 生成一张新图。

- 只读。给它赋值抛 `TypeError`。
- 图片不可变，这个值不会变，所以没有变化通知。

## 示例

```js
const star = UIImage.systemImageNamed('star.fill');
if (star) {
  const original = star.imageWithRenderingMode('alwaysOriginal');
  console.log(original.renderingMode, star.renderingMode);
}
```

**结果**：控制台输出 `alwaysOriginal automatic`。原图不变。

## 对应的 iOS API

`UIImage.renderingMode`。

## 参见

- [渲染模式和 `tintColor`](../ui-image.md#渲染模式和-tintcolor)
- [`imageWithRenderingMode()`](imagewithrenderingmode.md)
