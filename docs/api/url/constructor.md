---
type: reference
web: URL()
---

# `URL()` 构造函数

**`URL()`** 构造函数解析一串地址文本，创建一个 `URL`。

## 语法

```
new URL(url[, base])
```

### 参数

**`url`**

地址文本，或者另一个 `URL`。不是字符串的值先转成字符串。没有 `base` 时必须是完整的地址，带协议，比如 `https://a.com/x`。

**`base`**

可选。解析相对地址的起点，文本或 `URL`，本身必须是完整的地址。传了它，`url` 可以是 `/x`、`items`、`../y` 这类相对地址。

### 返回值

新建的 `URL`。各部分已经[整理成统一的写法](../url.md#地址会被整理成统一的写法)。

### 异常

**`TypeError`**

解析不了时抛出。

- 没传 `base`，`url` 又不是完整的地址：`Invalid URL: "/x". Without a base it must be absolute: this runtime does not load over HTTP, so there is no location`
- 传了 `base`：`Invalid URL: "/x"（base "nope"）`

## 说明

类型检查查不出相对地址的错误：`new URL('/x')` 在类型上合法，运行时才抛。地址来自用户输入或服务器返回、不确定是否合法时，用 [`URL.canParse()`](canparse.md) 或 [`URL.parse()`](parse.md)。

## 示例

```js
const api = 'https://api.example.com/v1/';
console.log(new URL('items', api).href);
console.log(new URL('/x', 'https://a.com').href);
console.log(new URL('../y', 'https://a.com/a/b/c').pathname);
```

**结果**：依次输出 `https://api.example.com/v1/items`、`https://a.com/x`、`/a/y`。

## 和 Web 的差别

- 没有 `location`，相对地址的起点要自己提供。浏览器里常用 `location.href` 或 `document.baseURI`。
- 地址里有反斜杠（`https://a.com\evil.com`）时解析失败，抛 `TypeError`；浏览器把反斜杠当作 `/`，解析成功。这条来自和 Chrome 的对比测试，验收用例里没有断言。
- 非 ASCII 的域名不会转成 `xn--` 开头的形式，见 [`hostname`](hostname.md)。

## 参见

- [地址必须是完整的](../url.md#地址必须是完整的)
- [`URL.parse()`](parse.md)：解析不了时返回 `null` 的写法
