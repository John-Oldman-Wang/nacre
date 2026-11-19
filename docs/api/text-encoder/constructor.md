---
type: reference
web: TextEncoder()
---

# `TextEncoder()` 构造函数

**`TextEncoder()`** 构造函数创建一个把字符串编码成 UTF-8 字节的编码器。

## 语法

```
new TextEncoder()
```

### 参数

无。

### 返回值

新建的 `TextEncoder`。它没有状态，一个可以反复用。

### 异常

**`TypeError`**

不带 `new` 调用。

## 示例

```js
const encoder = new TextEncoder();
console.log(encoder.encoding);
```

**结果**：输出 `utf-8`。**未在模拟器验证。**

## 和 Web 的差别

和 Web 相同。

## 参见

- [`encode()`](encode.md)
