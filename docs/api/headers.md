---
type: reference
---

# `Headers`

**`Headers`** 表示一组 HTTP 请求头或响应头。每个头有一个名字和一个值；名字不区分大小写，同一个名字可以有多个值。

`Headers` 是全局的，用 `new` 创建，不涉及网络。[`fetch()`](fetch.md) 接受它作请求头，响应的头读出来也是 `Headers`。只是一次性传给 `fetch()` 时，也可以直接写普通对象。

**继承关系**：`Headers` 不继承任何类。

怎么准备请求头、读响应头，见指南[拼接和解析网址](../guides/urls.md)。

## 构造函数

[`Headers()`](headers/constructor.md)

从普通对象、数组或另一个 `Headers` 创建一组头。

## 实例方法

所有方法里的名字都不区分大小写。

读：

| 方法 | 说明 |
| --- | --- |
| [`get()`](headers/get.md) | 某个名字的值，多个值用 `, ` 连起来 |
| [`has()`](headers/has.md) | 有没有这个名字 |
| [`getSetCookie()`](headers/getsetcookie.md) | 全部 `Set-Cookie` 的值，一条一项 |

改：

| 方法 | 说明 |
| --- | --- |
| [`set()`](headers/set.md) | 设置，覆盖原来的同名值 |
| [`append()`](headers/append.md) | 追加，保留原来的同名值 |
| [`delete()`](headers/delete.md) | 删掉这个名字的全部值 |

遍历：

| 方法 | 说明 |
| --- | --- |
| [`entries()`](headers/entries.md) | 依次给出 `[名字, 值]`。`for...of` 直接遍历等于它 |
| [`keys()`](headers/keys.md) | 依次给出名字 |
| [`values()`](headers/values.md) | 依次给出值 |
| [`forEach()`](headers/foreach.md) | 对每个头调用一次回调 |

## 名字和值的规则

- 名字只能由字母、数字和 ``!#$%&'*+-.^_`|~`` 这些符号组成，不能为空。不合法时抛 `TypeError`。
- 名字存成小写。遍历时读到的名字都是小写。
- 值的首尾空白（空格、制表符、回车、换行）被去掉。
- 值的中间不能有 NUL、回车或换行，有就抛 `TypeError`。
- 除此之外不限制名字：`Host`、`Cookie`、`Origin` 这些名字都可以设置。

报错原文见 [`append()`](headers/append.md)。

## 示例

下面的代码准备一组请求头，再读出来。它不需要界面，直接写在 `main.js` 顶层就能运行。

```js
const headers = new Headers({ 'Content-Type': 'application/json' });
headers.set('Authorization', 'Bearer abc');
headers.append('Accept', 'a');
headers.append('accept', 'b');

console.log(headers.get('content-type'));
console.log(headers.get('ACCEPT'));
for (const [name, value] of headers) {
  console.log(name, value);
}
```

**结果**：控制台依次输出

- `application/json`
- `a, b`
- `accept a, b`、`authorization Bearer abc`、`content-type application/json`：名字是小写，按字母顺序。

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里运行过。

## 和 Web 的差别

| 情况 | 浏览器 | 这里 |
| --- | --- | --- |
| `Host`、`Cookie`、`Origin` 等名字 | 用于请求时被禁止或忽略 | 不限制 |

其余和 Web 相同。

## 参见

- [拼接和解析网址](../guides/urls.md)：追加同名的头、读 `Set-Cookie`、遍历全部头
- [`fetch()`](fetch.md)：发请求时带上请求头，读响应头
- [`WebSocket`](websocket.md)：握手时带请求头
