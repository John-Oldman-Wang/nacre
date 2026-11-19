---
type: reference
web: ReadableStream[Symbol.asyncIterator]()
---

# `ReadableStream`：`[Symbol.asyncIterator]()` 方法

**`[Symbol.asyncIterator]()`** 方法和 [`values()`](values.md) 是同一个函数。有了它，流可以直接放进 `for await (const chunk of stream)`。

## 语法

```
stream[Symbol.asyncIterator]()
stream[Symbol.asyncIterator]({ preventCancel })
```

### 参数

**`options.preventCancel`**

和 [`values()`](values.md) 的相同。直接写 `for await (const chunk of stream)` 时不传，提前退出循环会取消流。

### 返回值

异步迭代器，和 `values()` 的相同。

### 异常

**`TypeError`**

流已经锁住：`This ReadableStream is locked: it already has a reader, or its body has been read`。

## 示例

```js
const res = new Response('abc');
if (res.body !== null) {
  console.log(res.body[Symbol.asyncIterator] === res.body.values);
}
```

**结果**：输出 `true`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`values()`](values.md)
