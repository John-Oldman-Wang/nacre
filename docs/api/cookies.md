---
type: reference
native: WKHTTPCookieStore
status: partial
---

# `Cookies`

**`Cookies`** 表示一个存储分区里的全部 cookie。App 通过它读、写、删这个分区的 cookie，并在 cookie 变化时收到通知。

App 对分区里的 cookie 有完全的读写权限，不受网页那一侧的限制：

- 任何站点的 cookie 都读得到，包括标了 `httpOnly`、网页的脚本读不到的那些。
- App 写的 cookie，网页的下一个请求就会带上。已经打开的网页不用刷新，读 `document.cookie` 就看得到（`httpOnly` 的除外）。
- 网页的脚本写的、服务器用 `Set-Cookie` 写的 cookie，App 都读得到。

读到的每一条是一个 [`Cookie`](cookie.md) 对象。

**继承关系**：`EventTarget` → `Cookies`

它属于哪个分区、分区之间有什么区别，见 [`Session`](session.md)。

## 构造函数

不能用 `new` 创建：`Cookies` 不在全局上。从 [`Session` 的 `cookies`](session/cookies.md) 属性拿到，同一个分区每次是同一个对象。

## 实例方法

三个方法都返回 Promise。参数不对时是 Promise 被拒绝，不是当场抛。

| 方法 | 说明 |
| --- | --- |
| [`get()`](cookies/get.md) | 读 cookie，可以按条件筛选 |
| [`set()`](cookies/set.md) | 写一条 cookie |
| [`remove()`](cookies/remove.md) | 删掉一个地址下某个名字的 cookie |

还继承 `EventTarget` 的 `addEventListener()`、`removeEventListener()`、`dispatchEvent()`。

## 事件

| 事件 | 什么时候派发 |
| --- | --- |
| [`changed`](cookies/changed-event.md) | 这个分区的 cookie 有变化 |

监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

## 示例

```js
const cookies = session.defaultSession.cookies;
await cookies.set({ url: 'https://my.app/', name: 'token', value: 'abc' });
const list = await cookies.get({ url: 'https://my.app/' });
console.log(list.map((c) => c.name + '=' + c.value).join('; '));
await cookies.remove('https://my.app/', 'token');
```

**效果**

- 控制台输出 `token=abc`（这个分区里 `my.app` 原来没有别的 cookie 时）。
- 最后一行之后，这条 cookie 没了。

## 和 Electron 的差别

| Electron | 这里 | 差别 |
| --- | --- | --- |
| `cookies.get(filter)`、`set(details)`、`remove(url, name)` | 相同 | |
| `cookies.on('changed', (event, cookie, cause, removed) => …)` | `cookies.addEventListener('changed', () => …)` | 没有 `cookie`、`cause`、`removed` |
| `cookies.flushStore()` | 没有 | 系统不提供 |

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[dataStore.httpCookieStore getAllCookies:]` | `cookies.get(filter)` |
| `[dataStore.httpCookieStore setCookie:completionHandler:]` | `cookies.set(details)` |
| `[dataStore.httpCookieStore deleteCookie:completionHandler:]` | `cookies.remove(url, name)` |
| `WKHTTPCookieStoreObserver` 的 `cookiesDidChangeInCookieStore:` | `changed` 事件 |

## 参见

- [管理网页的登录状态](../guides/web-login.md)：在打开网页之前写登录 cookie、读网页登录后的 cookie
- [`Cookie`](cookie.md)：读到的每一条带哪些字段
- [`Session`](session.md)：分区，和清数据
