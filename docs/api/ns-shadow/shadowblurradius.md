---
type: reference
native: NSShadow.shadowBlurRadius
---

# `NSShadow`：`shadowBlurRadius` 属性

**`shadowBlurRadius`** 属性是阴影的模糊半径。

## 值

数，单位 [pt](../units.md)。

- 可读，可写。
- 默认值是 `0`：边缘清晰的阴影。
- 越大越模糊。

### 写错时

**`TypeError`**

- 写入的值按 `Number()` 转成数，转不成有限数的抛。
- 负数：`shadowBlurRadius must be a non-negative number`。

## 示例

```js
const shadow = new NSShadow();
shadow.shadowBlurRadius = 2;
console.log(shadow.shadowBlurRadius);
```

**结果**：控制台输出 `2`。

## 对应的 iOS API

`NSShadow.shadowBlurRadius`。

## 参见

- [`shadowOffset`](shadowoffset.md)
