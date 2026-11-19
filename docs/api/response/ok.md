---
type: reference
web: Response.ok
---

# `Response`：`ok` 属性

**`ok`** 属性表示服务器是否返回了成功的状态码。

## 值

布尔。

- `true`：[`status`](status.md) 在 200 到 299 之间。
- `false`：其它状态码，比如 404、500。
- 只读。给它赋值抛 `TypeError`。
- `Response` 创建之后不再变化。

服务器返回 404 或 500 时，[`fetch()`](../fetch/fetch.md) 不抛异常，`Promise` 照常完成，只是 `ok` 是 `false`。所以读内容之前要先检查它：服务器返回错误时，内容通常是一段错误说明，不是预期的数据。

## 示例

```js
async function main() {
  const res = await fetch('https://httpbin.org/status/404');
  console.log(res.ok);
  console.log(res.status);
}
main();
```

**结果**：输出 `false` 和 `404`。这段代码不会抛异常。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`status`](status.md)：具体的状态码
- [请求什么时候算失败](../fetch/fetch.md#请求什么时候算失败)
