---
type: reference
web: Blob.arrayBuffer()
---

# `Blob`：`arrayBuffer()` 方法

**`arrayBuffer()`** 方法把 `Blob` 的内容读成一个 `ArrayBuffer`。

## 语法

```
arrayBuffer()
```

### 参数

无。

### 返回值

`Promise`，完成时得到 `ArrayBuffer`。

- 每次调用得到一份独立的拷贝。改写它不影响这个 `Blob`，也不影响再次读出来的内容（实测）。
- 可以调用任意多次。

### 异常

无。

## 示例

```js
async function main() {
  const blob = new Blob([new Uint8Array([1, 2, 3])]);
  const a = new Uint8Array(await blob.arrayBuffer());
  a[0] = 99;
  const b = new Uint8Array(await blob.arrayBuffer());
  console.log(b[0]);
}
main();
```

**结果**：输出 `1`。改写第一次读出的缓冲区，不影响 `Blob`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`text()`](text.md)
