---
type: reference
web: ReadableStream.values()
---

# `ReadableStream`：`values()` 方法

**`values()`** 方法返回一个异步迭代器，用 `for await` 一块一块地读流，并把流锁住。

## 语法

```
values()
values({ preventCancel })
```

### 参数

**`options.preventCancel`**

布尔，可选，默认 `false`。

- `false`：提前退出循环（`break`、`return`、抛异常）时取消流，请求停止。
- `true`：提前退出循环时只放开锁，不取消流。之后可以接着读。

### 返回值

异步迭代器。每次得到一块 `Uint8Array`；流读完时迭代结束。

### 异常

**`TypeError`**

流已经锁住：`This ReadableStream is locked: it already has a reader, or its body has been read`。

## 示例

```js
async function main() {
  const res = new Response('abc');
  if (res.body === null) return;
  for await (const chunk of res.body.values({ preventCancel: true })) {
    console.log(chunk.byteLength);
    break;
  }
  console.log(res.body.locked);
}
main();
```

**结果**：输出 `3` 和 `false`。`break` 之后流没有被取消，锁已经放开。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`[Symbol.asyncIterator]()`](symbol.asynciterator.md)
- [`for await` 的行为](../readable-stream.md#for-await-的行为)
