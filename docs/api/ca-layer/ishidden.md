---
type: reference
native: CALayer.hidden
---

# `CALayer`：`isHidden` 属性

**`isHidden`** 属性决定图层是否隐藏。

## 值

布尔。

- 可读，可写。
- 默认值是 `false`。
- `true`：图层和它的子图层都不显示。
- `false`：显示。
- 视图自己的图层用 `view.isHidden`。

## 示例

```js
const layer = new CALayer();
layer.isHidden = true;
console.log(layer.isHidden);
```

**结果**：控制台输出 `true`。

## 对应的 iOS API

`CALayer.hidden`（getter 是 `isHidden`）。

## 参见

- [`opacity`](opacity.md)
