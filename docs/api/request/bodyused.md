---
type: reference
web: Request.bodyUsed
---

# `Request`：`bodyUsed` 属性

**`bodyUsed`** 属性表示请求体是否已经用四个读取方法之一读过。

## 值

布尔。

- `true`：请求体已经读过。之后四个读取方法都被拒绝：`TypeError: Body has already been read`，[`clone()`](clone.md) 也抛 `TypeError`。
- `false`：还没读过。
- 只读。给它赋值抛 `TypeError`。
- 读取时变成 `true`，之后不再变回 `false`。它没有变化事件：读取是代码自己发起的。
- 没有请求体的 `Request`（比如 `GET` 请求）读取之后仍然是 `false`。
- 把 `Request` 交给 `fetch()` 不会把它变成 `true`。

## 示例

```js
async function main() {
  const req = new Request('https://httpbin.org/post', { method: 'POST', body: 'hello' });
  console.log(await req.text());
  console.log(req.bodyUsed);
}
main();
```

**结果**：输出 `hello` 和 `true`。

## 和 Web 的差别

把 `Request` 交给 `fetch()` 后，Web 里它的 `bodyUsed` 变成 `true`，Nacre 里不变。

## 参见

- [`Response` 的 `bodyUsed`](../response/bodyused.md)
