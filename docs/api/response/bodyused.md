---
type: reference
web: Response.bodyUsed
---

# `Response`：`bodyUsed` 属性

**`bodyUsed`** 属性表示响应内容是否已经读过。

## 值

布尔。

- `true`：响应内容已经读过或者取消过。之后四个读取方法都被拒绝：`TypeError: Body has already been read`。
- `false`：还没读过。只在 [`body`](body.md) 上拿了读取器、还没有读，不算读过。
- 只读。给它赋值抛 `TypeError`。
- 读取内容时变成 `true`，之后不再变回 `false`。它没有变化事件：读取是代码自己发起的。
- 没有内容的响应（[`body`](body.md) 是 `null`）读取之后仍然是 `false`，可以重复读。

## 示例

```js
async function main() {
  const res = await fetch('https://httpbin.org/get');
  await res.json();
  console.log(res.bodyUsed);
  try {
    await res.json();
  } catch (err) {
    console.log(err instanceof Error ? err.message : err);
  }
}
main();
```

**结果**：输出 `true` 和 `Body has already been read`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [响应内容只能读一次](../response.md#响应内容只能读一次)
