---
type: reference
web: TextDecoder.fatal
---

# `TextDecoder`：`fatal` 属性

**`fatal`** 属性表示遇到不合法的字节时是否抛异常。

## 值

布尔，创建时给的 `fatal`，默认 `false`。

- `true`：[`decode()`](decode.md) 遇到不合法的字节抛 `TypeError`。
- `false`：不合法的字节换成 `�`。

- 只读。给它赋值抛 `TypeError`。
- 创建之后不会变，所以没有变化通知。

## 示例

```js
console.log(new TextDecoder().fatal, new TextDecoder('utf-8', { fatal: true }).fatal);
```

**结果**：输出 `false true`。**未在模拟器验证。**

## 和 Web 的差别

和 Web 相同。

## 参见

- [`TextDecoder()`](constructor.md)
