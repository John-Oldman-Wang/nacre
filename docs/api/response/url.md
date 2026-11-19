---
type: reference
web: Response.url
---

# `Response`：`url` 属性

**`url`** 属性是响应来自的地址。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`。
- `fetch()` 得到的响应上，是请求的地址。发生过重定向时是最终的地址（**未在模拟器验证**）。
- 自己用 [`new Response()`](constructor.md) 创建的响应上是空串。

## 示例

```js
async function main() {
  const res = await fetch('https://httpbin.org/get');
  console.log(res.url);
  console.log(new Response('x').url === '');
}
main();
```

**结果**：输出 `https://httpbin.org/get` 和 `true`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`redirected`](redirected.md)
