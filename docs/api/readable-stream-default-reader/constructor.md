---
type: reference
web: ReadableStreamDefaultReader()
---

# `ReadableStreamDefaultReader()` 构造函数

**`ReadableStreamDefaultReader()`** 构造函数给一个流创建读取器，并把流锁住。和 [`stream.getReader()`](../readable-stream/getreader.md) 效果相同。

## 语法

```
new ReadableStreamDefaultReader(stream)
```

### 参数

**`stream`**

要读的 [`ReadableStream`](../readable-stream.md)，必填。

### 返回值

新建的读取器。

### 异常

**`TypeError`**

- `stream` 不是 `ReadableStream`：`ReadableStreamDefaultReader needs a ReadableStream`。
- 流已经锁住：`This ReadableStream is locked: it already has a reader, or its body has been read`。

## 示例

```js
async function main() {
  const res = new Response('abc');
  if (res.body === null) return;
  const reader = new ReadableStreamDefaultReader(res.body);
  const { value } = await reader.read();
  console.log(value);
}
main();
```

**结果**：输出一个内容是 `97, 98, 99` 的 `Uint8Array`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`getReader()`](../readable-stream/getreader.md)
