---
type: reference
web: Response.redirected
---

# `Response`：`redirected` 属性

**`redirected`** 属性在 Nacre 里永远是 `false`。

## 值

布尔，永远是 `false`。

- 只读。给它赋值抛 `TypeError`。
- 服务器返回 301、302 时，系统自动请求新的地址，[`fetch()`](../fetch/fetch.md) 得到的是最终的响应。中间发生过几次重定向无法得知，所以这个属性不能用来判断。
- 不能禁止跟随重定向，见[还不能做的](../fetch.md#还不能做的)。

## 示例

```js
async function main() {
  const res = await fetch('https://httpbin.org/redirect/1');
  console.log(res.redirected);
}
main();
```

**结果**：输出 `false`。

## 和 Web 的差别

Web 里发生过重定向时是 `true`。Nacre 里永远是 `false`。

## 参见

- [`url`](url.md)：最终的地址
