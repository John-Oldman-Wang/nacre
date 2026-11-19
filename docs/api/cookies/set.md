---
type: reference
native: "-[WKHTTPCookieStore setCookie:completionHandler:]"
---

# `Cookies`：`set()` 方法

**`set()`** 方法往这个分区写一条 cookie。名字、域名、路径都相同的已有 cookie 会被盖掉，不会多出一条。

## 语法

```
set(details)
```

### 参数

**`details`**

对象，描述这条 cookie。

**`details.url`**

字符串，必填。这条 cookie 属于哪个地址，必须是 `http` 或 `https` 的。不给 `domain` 时，这条 cookie 只属于这个地址的主机。

**`details.name`**

字符串，名字。默认 `''`。

**`details.value`**

字符串，值。默认 `''`。

**`details.domain`**

字符串。给了就对这个域名和它的子域名都有效，读回来的 `domain` 以点开头。不给就只属于 `url` 的主机。见[一条 cookie 属于谁](../cookie.md#一条-cookie-属于谁)。

**`details.path`**

字符串。只有这个路径和它下面的请求才带。默认 `'/'`。

**`details.secure`**

布尔。`true`：只在 `https` 的请求里带。默认 `false`。

**`details.httpOnly`**

布尔。`true`：网页的脚本读不到。默认 `false`。

**`details.expirationDate`**

数，过期时间，从 1970 年起的秒数。不给就是会话 cookie，App 重启之后就没了，见[会话 cookie](../cookie.md#会话-cookie-和有过期时间的)。

**`details.sameSite`**

字符串：`'lax'`、`'strict'`、`'no_restriction'` 或 `'unspecified'`，含义见 [`Cookie`](../cookie.md)。后两种效果相同：都是不写这个属性，读回来是 `'no_restriction'`。不给也是一样。

### 返回值

`Promise`，写完之后兑现，值是 `undefined`。

### 异常

返回的 Promise 被拒绝，不是当场抛。

**`TypeError`**

- `details` 不是对象：`cookies.set needs a details object, got …`。
- 没给 `url`，或者它不合法：`cookies.set: the url is invalid`。
- `url` 不是 `http` / `https`：`cookies.set: the url must be http or https`。
- `sameSite` 写错：`sameSite has no value "none"; expected one of: unspecified / no_restriction / lax / strict`。
- `expirationDate` 不是数：`expirationDate must be a finite number, got "abc"`。

## 示例

```js
await session.defaultSession.cookies.set({
  url: 'https://my.app/',
  name: 'token',
  value: 'abc123',
  httpOnly: true,
  expirationDate: Date.now() / 1000 + 7 * 24 * 3600,
});
```

**效果**

- 默认分区里的网页之后发给 `my.app` 的请求带上 `token=abc123`。已经打开的网页不用刷新。
- 网页里的脚本读 `document.cookie` 读不到它。
- 7 天之内 App 重启之后它还在。

## 和 Electron 的差别

相同。

对应的 iOS API 是 `-[WKHTTPCookieStore setCookie:completionHandler:]`，cookie 用 `NSHTTPCookie` 表示。

## 参见

- [`Cookie`](../cookie.md)：一条 cookie 属于谁、会话 cookie
- [管理网页的登录状态](../../guides/web-login.md)：打开网页之前写好登录 cookie
