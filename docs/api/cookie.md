---
type: reference
native: NSHTTPCookie
status: partial
---

# `Cookie`

**`Cookie`** 表示一条 cookie 在某一刻的记录。[`Cookies.get()`](cookies/get.md) 返回的数组里，每一项是一个 `Cookie`。

它是一个普通对象，不是原生对象，全局上没有这个名字。它的字段只用来读：修改这个对象不会改动分区里的 cookie，要改用 [`Cookies.set()`](cookies/set.md)。之后 cookie 变了，已经拿到的记录也不会跟着变。

## 字段

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `name` | `string` | 名字 |
| `value` | `string` | 值 |
| `domain` | `string` | 属于哪个域名。以点开头的对子域名也有效，见[一条 cookie 属于谁](#一条-cookie-属于谁) |
| `hostOnly` | `boolean` | `true`：只发给 `domain` 这一个主机。`false`：子域名也发 |
| `path` | `string` | 路径。只有这个路径和它下面的请求才带 |
| `secure` | `boolean` | `true`：只在 `https` 的请求里带。`false`：`http` 和 `https` 都带 |
| `httpOnly` | `boolean` | `true`：网页的脚本读不到。`false`：网页的脚本用 `document.cookie` 读得到 |
| `session` | `boolean` | `true`：没有过期时间，App 重启就没了。`false`：有过期时间 |
| `expirationDate` | `number` | 过期时间，从 1970 年起的秒数，整数。`session` 为 `true` 时没有这个字段 |
| `sameSite` | `string` | 跨站请求带不带这条 cookie，见下 |

`sameSite` 读出来是这三种之一：

| 取值 | 效果 |
| --- | --- |
| `'strict'` | 只有同一站点发起的请求才带 |
| `'lax'` | 跨站的子请求不带，用户点链接跳转过来时带 |
| `'no_restriction'` | 都带 |

没写 SameSite 的 cookie 读出来也是 `'no_restriction'`，和明确写了的区分不出来。写的时候可以用的 `'unspecified'` 读不出来。

## 一条 cookie 属于谁

[`set()`](cookies/set.md) 时用 `url` 和 `domain` 决定这条 cookie 会被哪些请求带上：

| 怎么写 | 读回来的 `domain` | `hostOnly` | 哪些请求会带上 |
| --- | --- | --- | --- |
| 只给 `url: 'https://a.my.app/'` | `'a.my.app'` | `true` | 只有 `a.my.app` 的 |
| 再给 `domain: 'my.app'` | `'.my.app'` | `false` | `my.app` 和它所有的子域名 |

名字、域名、路径三样都相同的才是同一条 cookie。再 `set` 一次会盖掉原来的值，不会多出一条。

## 会话 cookie 和有过期时间的

| | `session` | `expirationDate` | App 重启之后 |
| --- | --- | --- | --- |
| `set` 时没给 `expirationDate` | `true` | 没有这个字段 | 没了 |
| `set` 时给了 | `false` | 那个时间，整数秒 | 还在，到时间自动失效 |

这一条对数据存在磁盘上的分区也成立：会话 cookie 在 App 重启之后就没了。

## 示例

```js
await session.defaultSession.cookies.set({
  url: 'https://a.my.app/',
  domain: 'my.app',
  name: 'theme',
  value: 'dark',
});
const [cookie] = await session.defaultSession.cookies.get({ url: 'https://a.my.app/', name: 'theme' });
if (cookie) console.log(cookie.domain, cookie.hostOnly, cookie.session, 'expirationDate' in cookie);
```

**结果**：输出 `.my.app false true false`。

## 和 Electron 的差别

字段和 Electron 的 `Cookie` 相同。差一处：`sameSite` 读不出 `'unspecified'`。

## 对应的 iOS API

`NSHTTPCookie`。`expiresDate` 写成从 1970 年起的秒数 `expirationDate`；`sessionOnly` 写成 `session`；`HTTPOnly` 写成 `httpOnly`。

## 参见

- [`Cookies`](cookies.md)：读、写、删
