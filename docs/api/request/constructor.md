---
type: reference
web: Request()
---

# `Request()` 构造函数

**`Request()`** 构造函数用地址和选项创建一个请求。它不发请求；把它交给 [`fetch()`](../fetch/fetch.md) 才发出。

## 语法

```
new Request(input)
new Request(input, init)
```

### 参数

**`input`**

请求的地址：字符串、[`URL`](../url.md) 或另一个 `Request`。地址必须是完整的 URL。

是另一个 `Request` 时，新的对象沿用它的地址、方法、请求头、请求体和 `signal`。`init` 里给了的字段以 `init` 为准。

**`init`**

请求的选项，对象，可选。不给或者给 `null` 都视为空对象。字段和 [`fetch()` 的 `init`](../fetch/fetch.md#参数) 相同：

**`init.method`**

请求方法，字符串。默认 `'GET'`（`input` 是 `Request` 时沿用它的）。转成大写。

**`init.headers`**

请求头，普通对象或 [`Headers`](../headers.md)。

**`init.body`**

请求体。能给的值和默认补的 `Content-Type` 见 [`fetch()` 的 `init.body`](../fetch/fetch.md#参数)。默认 `null`。

**`init.signal`**

[`AbortSignal`](../abort-signal.md) 或 `null`。`input` 是 `Request` 时：不写就沿用它的；写 `null` 表示新的对象不带原来的 `signal`。

### 返回值

新建的 `Request`。

### 异常

**`TypeError`**

- 地址不是完整的 URL：信息以 `Invalid URL:` 开头。
- `init.signal` 不是 `AbortSignal` 也不是 `null`：`Request: signal must be an AbortSignal or null`。
- `input` 是请求体已经读过的 `Request`，并且 `init` 里没有给新的 `body`：`Cannot construct a Request from a Request whose body has already been read`。
- 请求头不合法：名字不合法以 `Invalid header name:` 开头；值里有换行是 `Header value cannot contain NUL, CR or LF`。

## 说明

- 把 `Request` 交给 `fetch()` 不会把它的 [`bodyUsed`](bodyused.md) 变成 `true`。
- 同一个带请求体的 `Request` 交给 `fetch()` 多次，**未在模拟器验证**。

## 示例

```js
const base = new Request('https://httpbin.org/post', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: '{"a":1}',
});
const put = new Request(base, { method: 'PUT' });
console.log(put.method, put.url);
```

**结果**：输出 `PUT https://httpbin.org/post`。`put` 沿用了 `base` 的请求头和请求体。

## 和 Web 的差别

- `init` 没有 `mode`、`credentials`、`cache`、`redirect`，写了不起作用。
- 所有方法名都转成大写。Web 只转标准方法名。**来自代码，未在模拟器验证。**

## 参见

- [`clone()`](clone.md)：复制一个请求
- [`fetch()`](../fetch/fetch.md)
