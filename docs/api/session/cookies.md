---
type: reference
native: WKWebsiteDataStore.httpCookieStore
---

# `Session`：`cookies` 属性

**`cookies`** 属性是这个分区的 cookie，一个 [`Cookies`](../cookies.md) 对象。用它读、写、删 cookie，监听 cookie 的变化。

## 值

[`Cookies`](../cookies.md)。

- 只读。
- 每次读是同一个对象。

## 示例

```js
const cookies = session.defaultSession.cookies;
console.log(cookies === session.defaultSession.cookies);
const all = await cookies.get();
console.log(all.length);
```

**结果**：先输出 `true`，再输出默认分区里 cookie 的条数。

## 和 Electron 的差别

相同。差别在 `Cookies` 的成员上，见 [`Cookies`](../cookies.md#和-electron-的差别)。

对应的 iOS API 是 `WKWebsiteDataStore.httpCookieStore`。

## 参见

- [`Cookies`](../cookies.md)
