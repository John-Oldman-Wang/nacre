---
type: reference
web: Request
---

# `Request`

**`Request`** 表示一次 HTTP 请求：地址、方法、请求头、请求体和用来取消它的信号，保存在一个对象里。把它交给 [`fetch()`](fetch.md) 就发出这次请求。

直接给 `fetch()` 传地址和选项就能发请求。需要把一次请求先准备好、之后再发或者交给别的函数时，用 `Request`。

`Request` 也有 [`bodyUsed`](request/bodyused.md) 和四个读取方法，读出来的是构造时给的请求体。它没有 `body` 属性。

**继承关系**：`Request` 不继承其他类。

怎么发请求，见指南[从网络取数据](../guides/fetch.md)。

## 构造函数

[`Request()`](request/constructor.md)

用地址和选项创建一个请求。参数和 `fetch()` 相同。

## 实例属性

这些属性都可读、不可写。

| 属性 | 说明 |
| --- | --- |
| [`url`](request/url.md) <small>只读</small> | 请求的地址，规范化之后的完整 URL |
| [`method`](request/method.md) <small>只读</small> | 请求方法，大写 |
| [`headers`](request/headers.md) <small>只读</small> | 请求头 |
| [`signal`](request/signal.md) <small>只读</small> | 用来取消这次请求的 `AbortSignal` |
| [`bodyUsed`](request/bodyused.md) <small>只读</small> | 请求体是否已经读过 |

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`clone()`](request/clone.md) | 返回一份独立的副本 |

读请求体的四个方法，规则和 [`Response`](response.md) 的相同：都返回 `Promise`，读过任何一个之后其余的都不能再读。

| 方法 | 说明 |
| --- | --- |
| [`json()`](request/json.md) | 按 JSON 解析请求体 |
| [`text()`](request/text.md) | 按 UTF-8 解码请求体 |
| [`arrayBuffer()`](request/arraybuffer.md) | 得到请求体的 `ArrayBuffer` |
| [`blob()`](request/blob.md) | 得到请求体的 [`Blob`](blob.md) |

## 示例

```js
async function main() {
  const req = new Request('https://httpbin.org/post', { method: 'POST', body: 'hello' });
  const res = await fetch(req);
  const echo = await res.json();
  console.log(echo.data);
}
main();
```

**结果**：输出 `hello`。请求带着 `Request` 里的方法和请求体发出。

## 和 Web 的差别

- 没有 `body` 属性。请求体只能用四个读取方法读。
- 没有 `mode`、`credentials`、`cache`、`redirect` 等属性。
- `signal` 是构造时给的那一个对象本身。Web 里是另建的一个跟着它的信号。
- 所有方法名都转成大写。Web 只把 `GET`、`POST` 这几个标准方法名转成大写，`'patch'` 保持原样。**来自代码，未在模拟器验证。**

## 参见

- [`fetch()`](fetch.md)：发出请求
- [`Response`](response.md)：请求得到的响应
- [`AbortController`](abort-controller.md)：取消请求
