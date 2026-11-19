---
type: reference
web: Blob.size
---

# `Blob`：`size` 属性

**`size`** 属性是 `Blob` 内容的字节数。

## 值

数字，单位是字节。

- 只读。给它赋值抛 `TypeError`。
- `Blob` 的内容不可变，`size` 不会变化。
- 字符串按 UTF-8 编码之后计数，一个汉字占 3 个字节。

## 示例

```js
const blob = new Blob(['前缀-', '后缀']);
console.log(blob.size);
```

**结果**：输出 `13`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`type`](type.md)
