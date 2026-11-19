---
type: reference
web: ReadableStream.locked
---

# `ReadableStream`：`locked` 属性

**`locked`** 属性表示流是否被锁住。锁住的流不能再拿读取器。

## 值

布尔。

- `true`：有一个读取器拿着它，或者正在被 `for await` 遍历，或者它所在的 `Response` 已经被四个读取方法之一整个读走。
- `false`：没有被锁住，可以调 [`getReader()`](getreader.md) 或放进 `for await`。
- 只读。给它赋值抛 `TypeError`。
- 它没有变化事件：锁是代码自己加的。读取器调 `releaseLock()`、`for await` 循环结束时变回 `false`。

## 示例

```js
async function main() {
  const res = new Response('abc');
  if (res.body === null) return;
  console.log(res.body.locked);
  const reader = res.body.getReader();
  console.log(res.body.locked);
  reader.releaseLock();
  console.log(res.body.locked);
}
main();
```

**结果**：依次输出 `false`、`true`、`false`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`getReader()`](getreader.md)
