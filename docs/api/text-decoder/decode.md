---
type: reference
web: TextDecoder.decode()
---

# `TextDecoder`：`decode()` 方法

**`decode()`** 方法把 UTF-8 的字节解码成字符串。

## 语法

```
decode([input[, options]])
```

### 参数

**`input`**

`ArrayBuffer`、`SharedArrayBuffer`，或者任何视图（`Uint8Array`、`DataView`、别的类型数组、子视图）。可以不给，不给时当成 0 个字节。视图只读它覆盖的那一段，按字节读，不管视图的元素是几个字节。`input` 不会被修改。

**`options.stream`**

布尔，默认 `false`。

- `true`：后面还有数据。结尾没凑齐的字节留到下一次调用。
- `false`：这是最后一段。结尾没凑齐的字节换成一个 `�`（[`fatal`](fatal.md) 时抛异常），然后解码器回到初始状态。

### 返回值

字符串。

- 不合法的字节换成 `�`。一段连续的不合法字节换成几个 `�`，规则和浏览器相同：例如 `e4 bd`（少一个字节的汉字）是 1 个，`c0 af` 是 2 个，`ed a0 80` 是 3 个。
- 开头的一个 BOM 默认被去掉，见 [`ignoreBOM`](ignorebom.md)。

### 异常

**`TypeError`**

- `input` 是别的类型（字符串、数字、普通数组、`null`）：`TextDecoder.decode: the input must be an ArrayBuffer, a SharedArrayBuffer or a view on one (Uint8Array, DataView, ...)`
- [`fatal`](fatal.md) 为 `true` 且字节不合法：`TextDecoder.decode: the input is not valid UTF-8`。抛出之后这个解码器回到初始状态，可以继续用。
- `options` 不是对象：`TextDecoder.decode: the options must be an object`

## 说明

一个 `TextDecoder` 可以反复用。不带 `stream` 的调用之间互不影响。

## 示例

```js
const packet = new Uint8Array([0x00, 0x05, 0x68, 0x65, 0x6c, 0x6c, 0x6f, 0xff]);
console.log(new TextDecoder().decode(packet.subarray(2, 7)));

const decoder = new TextDecoder();
const first = decoder.decode(new Uint8Array([0x41, 0xe4, 0xbd]), { stream: true });
const second = decoder.decode(new Uint8Array([0xa0, 0x42]), { stream: true });
const rest = decoder.decode();
console.log(JSON.stringify([first, second, rest]));
```

**结果****未在模拟器验证。**

- 输出 `hello`：只读了子视图覆盖的第 2 到第 6 个字节。
- 输出 `["A","你B",""]`：「你」的三个字节被分在两段里，第二段到了才解出来。不带 `stream` 分别解这两段，会得到 `A�` 和 `�B`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [数据分几段到达时解码](../../guides/text-and-bytes.md#数据分几段到达时解码)
- [`TextEncoder.encode()`](../text-encoder/encode.md)：反过来编码
