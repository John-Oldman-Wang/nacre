---
type: reference
native: UIBarButtonItem.width
---

# `UIBarButtonItem`：`width` 属性

**`width`** 属性是导航条按钮的宽度。只对固定宽度的空白有意义。

## 值

数，单位 [pt](../units.md)。

- 可读，可写。
- 默认值是 `0`。[`fixedSpace()`](fixedspace.md) 创建的空白是创建时给的宽度。
- 写入时按 `Number(v)` 转换，转不成有限的数抛 `TypeError`。
- 对普通按钮写它有什么效果**未在模拟器验证**。
- 变化时不派发事件：它只会被代码改变。

## 示例

```js
const gap = UIBarButtonItem.fixedSpace(20);
gap.width = 32;
console.log(gap.width);
```

**结果**：控制台输出 `32`。

## 对应的 iOS API

`UIBarButtonItem.width`。

## 参见

- [`UIBarButtonItem.fixedSpace()`](fixedspace.md)
