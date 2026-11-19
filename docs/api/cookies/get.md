---
type: reference
native: "-[WKHTTPCookieStore getAllCookies:]"
---

# `Cookies`：`get()` 方法

**`get()`** 方法读这个分区里的 cookie，可以按条件筛选。任何站点的都读得到，包括 `httpOnly` 的。

## 语法

```
get([filter])
```

### 参数

**`filter`** <small>可选</small>

筛选条件，对象。不给，或者给 `null` / `undefined`，返回这个分区的全部 cookie。条件之间是「并且」的关系。

**`filter.url`**

字符串。留下这个地址的请求会带上的：域名对得上、路径对得上；地址是 `http` 的话不含 `secure` 的。给空串等于没给。

**`filter.name`**

字符串。留下名字一样的。

**`filter.domain`**

字符串。留下这个域名的，和它的子域名的。开头有没有点都一样。

**`filter.path`**

字符串。留下路径一模一样的。

**`filter.secure`**

布尔。留下 `secure` 等于这个值的。

**`filter.session`**

布尔。`true` 留下会话 cookie，`false` 留下有过期时间的。

**`filter.httpOnly`**

布尔。留下 `httpOnly` 等于这个值的。

### 返回值

`Promise`，兑现成 [`Cookie`](../cookie.md) 的数组。没有符合条件的时是空数组，不报错。

每一项是读取那一刻的一份记录，见 [`Cookie`](../cookie.md)。

### 异常

返回的 Promise 被拒绝，不是当场抛。

**`TypeError`**

`url` 不是合法的 `http` / `https` 地址：`cookies.get: the url is invalid`；地址合法但不是 `http` / `https` 的：`cookies.get: the url must be http or https`。

## 示例

```js
const found = await session.defaultSession.cookies.get({
  url: 'https://my.app/',
  name: 'sid',
});
if (found.length > 0) console.log('网页已经登录', found[0].value);
```

**效果**

- 网页登录过的话，控制台输出那条 cookie 的值。
- 没有这条 cookie 时 `found` 是空数组，不输出。

## 和 Electron 的差别

相同。

对应的 iOS API 是 `-[WKHTTPCookieStore getAllCookies:]`。系统只有「读全部」这一种读法，筛选条件由运行时套上。

## 参见

- [`Cookie`](../cookie.md)：每一项带哪些字段
- [`set()`](set.md)
