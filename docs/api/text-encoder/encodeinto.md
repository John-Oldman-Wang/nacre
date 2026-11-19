---
type: reference
web: TextEncoder.encodeInto()
---

# `TextEncoder`：`encodeInto()` 方法

**`encodeInto()`** 方法把字符串编码成 UTF-8，写进一个已有的数组，从数组的开头写起。它不分配新的数组。

## 语法

```
encodeInto(source, destination)
```

### 参数

**`source`**

字符串。别的类型先转成字符串。

**`destination`**

`Uint8Array`。它是子视图时，只写视图覆盖的那一段。

### 返回值

对象 `{ read, written }`：

- `read`：处理了多少个码元（按 `text.length` 的算法，表情算两个）。剩下没写的部分是 `source.slice(read)`。
- `written`：写了多少个字节。

数组放不下全部内容时，写到最后一个放得下的完整字符为止，不会写半个字符。没写到的位置保持原值。

### 异常

**`TypeError`**

- `destination` 不是 `Uint8Array`（包括 `Uint8ClampedArray`、`ArrayBuffer`、`DataView`、普通数组）：`TextEncoder.encodeInto: the destination must be a Uint8Array`
- 少了参数：`TextEncoder.encodeInto: 2 arguments required, but only 1 present`

## 示例

```js
const buffer = new Uint8Array(8);
const result = new TextEncoder().encodeInto('你好吗', buffer);
console.log(result.read, result.written);
```

**结果**：输出 `2 6`。缓冲区有 8 个字节，每个汉字 3 个字节，所以写进了前两个字。第三个字放不下，一个字节都没有写，`buffer` 的最后 2 个字节还是 0。**未在模拟器验证。**

## 和 Web 的差别

和 Web 相同。

## 参见

- [`encode()`](encode.md)：每次返回新数组
- [码元、字符和字节](../text-encoder.md#码元字符和字节)
