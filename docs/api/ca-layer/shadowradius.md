---
type: reference
native: CALayer.shadowRadius
---

# `CALayer`：`shadowRadius` 属性

**`shadowRadius`** 属性是阴影边缘模糊的范围。越大越柔和。

## 值

数，单位 [pt](../units.md)。

- 可读，可写。
- 默认值是 `3`。

### 写错时

写入的值按 `Number()` 转成数。转不成有限数的抛 `TypeError`。

## 示例

```js
const layer = new CALayer();
console.log(layer.shadowRadius);
layer.shadowRadius = 8;
```

**结果**：控制台输出 `3`。

## 对应的 iOS API

`CALayer.shadowRadius`。

## 参见

- [`shadowOpacity`](shadowopacity.md)
