---
type: reference
native: "-[WKHTTPCookieStore deleteCookie:completionHandler:]"
---

# `Cookies`：`remove()` 方法

**`remove()`** 方法删掉这个分区里、一个地址下某个名字的 cookie。

## 语法

```
remove(url, name)
```

### 参数

**`url`**

字符串，`http` 或 `https` 的地址。删的是这个地址的请求会带上的那些：域名对得上、路径对得上。和 [`get()`](get.md) 的 `url` 条件差一处：不看 `secure`，用 `http` 的地址也删得掉 `secure` 的 cookie。

**`name`**

字符串，cookie 的名字。

### 返回值

`Promise`，删完之后兑现，值是 `undefined`。本来就没有这条时什么都不发生，照样兑现。

### 异常

返回的 Promise 被拒绝，不是当场抛。

**`TypeError`**

- `url` 不合法：`cookies.remove: the url is invalid`。
- `url` 不是 `http` / `https`：`cookies.remove: the url must be http or https`。

## 示例

```js
await session.defaultSession.cookies.remove('https://my.app/', 'token');
```

**效果**

- 这个地址下名字是 `token` 的 cookie 没了。别的域名下同名的不受影响。
- 本来就没有这条时什么都不发生，不报错。

## 和 Electron 的差别

相同。

对应的 iOS API 是 `-[WKHTTPCookieStore deleteCookie:completionHandler:]`。

## 参见

- [`Session.clearStorageData()`](../session/clearstoragedata.md)：一次清掉全部 cookie 或一个站点的数据
