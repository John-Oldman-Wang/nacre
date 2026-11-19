---
type: reference
web: Response()
---

# `Response()` 构造函数

**`Response()`** 构造函数用给定的内容、状态码和响应头创建一个响应。它不发请求，常用来在测试里代替一次真实的请求。

## 语法

```
new Response()
new Response(body)
new Response(body, init)
```

### 参数

**`body`**

响应的内容，可选。能给的值和 [`fetch()` 的 `init.body`](../fetch/fetch.md#参数) 相同：字符串、[`Blob`](../blob.md)、`ArrayBuffer`、类型数组、[`URLSearchParams`](../url-search-params.md)，其它值按 `String()` 转成字符串。不给或者给 `null` 时，响应没有内容，[`body`](body.md) 是 `null`。

**`init`**

对象，可选。不给或者给 `null` 都视为空对象。

**`init.status`**

状态码，数字。默认 `200`。

**`init.statusText`**

状态码对应的文字，字符串。默认 `''`。

**`init.headers`**

响应头，普通对象或 [`Headers`](../headers.md)。默认没有响应头。没有写 `Content-Type` 时按 `body` 的种类补默认值，规则和 `fetch()` 的 `init.body` 相同：字符串补 `text/plain;charset=UTF-8`，`URLSearchParams` 补 `application/x-www-form-urlencoded;charset=UTF-8`，有 `type` 的 `Blob` 补它的 `type`。

### 返回值

新建的 `Response`。它的 [`url`](url.md) 是空串。

### 异常

**`TypeError`**

`init.headers` 不合法时，报错信息来自 [`Headers`](../headers.md)：名字不合法以 `Invalid header name:` 开头；值里有换行是 `Header value cannot contain NUL, CR or LF`。

## 示例

```js
async function main() {
  const res = new Response('{"ok":true}', {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
  console.log(res.status);
  const data = await res.json();
  console.log(data.ok);
}
main();
```

**结果**：输出 `201` 和 `true`。

## 和 Web 的差别

- `init.status` 不检查范围。Web 在状态码不在 200 到 599 之间时抛 `RangeError`。**来自代码，未在模拟器验证。**
- 其余和 Web 相同。

## 参见

- [`fetch()`](../fetch.md)：真正发请求得到 `Response`
