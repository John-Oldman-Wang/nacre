---
type: reference
native: CALayer.masksToBounds
---

# `CALayer`：`masksToBounds` 属性

**`masksToBounds`** 属性决定是否裁掉子图层超出本图层范围的部分。

## 值

布尔。

- 可读，可写。
- 默认值是 `false`。
- `true`：子图层超出本图层范围（含圆角）的部分不显示。阴影画在范围之外，也会被裁掉。
- `false`：照常显示。
- 视图自己的图层用 `view.clipsToBounds`。

## 示例

```js
const layer = new CALayer();
layer.cornerRadius = 16;
layer.masksToBounds = true;
```

**效果**：子图层超出圆角的部分不显示。**未在模拟器验证。**

## 对应的 iOS API

`CALayer.masksToBounds`。

## 参见

- [`cornerRadius`](cornerradius.md)
