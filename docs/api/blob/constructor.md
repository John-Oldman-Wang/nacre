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

数组，元素是字符串、`ArrayBuffer` 或类型数组，可选。按顺序拼接成内容。字符串按 UTF-8 编码，每个字符原样写进内容，开头的 `'\uFEFF'`（字节顺序标记，BOM）也保留；不成对的代理项写成 U+FFFD。别的值先按 `String()` 转成字符串：`new Blob([1, true, null])` 的内容是 `1truenull`。不给或者给 `null` 时内容为空。

**`options.type`**

内容的类型，字符串，比如 `'image/png'`。默认是空串。

### 返回值

新建的 `Blob`。

### 异常

**`TypeError`**

- `parts` 的元素是 `Blob`：`Blob parts cannot be Blobs yet`。
- `parts` 的元素是 `Symbol`，转不成字符串：`Cannot convert a Symbol value to a string`。

## 示例

```js
const bytes = new Uint8Array([0, 255, 16, 128]);
const blob = new Blob([bytes], { type: 'application/octet-stream' });
console.log(blob.size, blob.type);
```

**结果**：输出 `4 application/octet-stream`。

导出给 Excel 打开的 CSV，开头加一个 `'\uFEFF'`。Excel 靠它认出内容是 UTF-8，没有它中文会显示成乱码：

```js
const csv = '日期,金额\n2026-11-28,100\n';
const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv' });
console.log(blob.size);
```

**结果**：输出 `32`。开头的 `'\uFEFF'` 占 3 个字节，CSV 本身 29 个字节。

## 和 Web 的差别

`parts` 的元素不能是 `Blob`。Web 可以。

## 参见

- [`Blob`](../blob.md)
