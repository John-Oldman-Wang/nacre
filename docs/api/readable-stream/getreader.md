---
type: reference
web: ReadableStream.getReader()
---

# `ReadableStream`：`getReader()` 方法

**`getReader()`** 方法返回一个[读取器](../readable-stream-default-reader.md)，并把流锁住。

## 语法

```
getReader()
```

### 参数

无。

### 返回值

[`ReadableStreamDefaultReader`](../readable-stream-default-reader.md)。用它的 `read()` 一块一块地读。`new ReadableStreamDefaultReader(stream)` 效果相同。

### 异常

**`TypeError`**

- 流已经锁住：`This ReadableStream is locked: it already has a reader, or its body has been read`。
- 传了 `{ mode }`：`getReader() does not take a mode: BYOB readers are not supported`。

## 示例

```js
async function main() {
  const res = await fetch('https://httpbin.org/drip?duration=3&numbytes=30&delay=0');
  if (res.body === null) throw new Error('这个响应没有内容');

  const reader = res.body.getReader();
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
  }
  console.log(received);
}
main();
```

**结果**：3 秒后输出 `30`。**未在模拟器验证。**

## 和 Web 的差别

不支持 `{ mode: 'byob' }`，传了就抛 `TypeError`。

## 参见

- [`ReadableStreamDefaultReader`](../readable-stream-default-reader.md)
- [`values()`](values.md)：用 `for await` 读
