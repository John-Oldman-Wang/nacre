---
type: reference
web: Blob()
---

# `Blob()` 构造函数

**`Blob()`** 构造函数把一组字符串和字节按顺序拼接成一个新的 `Blob`。

## 语法

```
new Blob()
new Blob(parts)
new Blob(parts, { type })
```

### 参数

**`parts`**

数组，元素是字符串、`ArrayBuffer` 或类型数组，可选。按顺序拼接成内容。字符串按 UTF-8 编码。不给或者给 `null` 时内容为空。

**`options.type`**

内容的类型，字符串，比如 `'image/png'`。默认是空串。

### 返回值

新建的 `Blob`。

### 异常

**`TypeError`**

- `parts` 的元素是 `Blob`：`Blob parts cannot be Blobs yet`。
- 内容建不出来：`cannot construct Blob from these parts`。**哪些元素会触发这一条未在模拟器验证。**

## 示例

```js
const bytes = new Uint8Array([0, 255, 16, 128]);
const blob = new Blob([bytes], { type: 'application/octet-stream' });
console.log(blob.size, blob.type);
```

**结果**：输出 `4 application/octet-stream`。

## 和 Web 的差别

`parts` 的元素不能是 `Blob`。Web 可以。

## 参见

- [`Blob`](../blob.md)
