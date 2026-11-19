---
type: reference
native: "-[WKHTTPCookieStoreObserver cookiesDidChangeInCookieStore:]"
---

# `Cookies`：`changed` 事件

**`changed`** 事件在这个分区的 cookie 有变化时派发。

## 语法

```
cookies.addEventListener('changed', (event) => { })
```

## 事件对象

`Event`，除 `type`、`target` 以外不带别的字段。事件只说明「有变化」，不带是哪一条、是新增还是删除。收到之后要自己用 [`get()`](get.md) 重新读一遍。

不能取消。

## 什么时候派发

- App 写的、网页的脚本写的、服务器写的、清数据清掉的，都会派发。
- 一次改动可能派发不止一次。实测五次写入、一次覆盖、两次删除，一共收到 7 次。回调里的代码要能承受重复执行。
- 第一个监听器加上之后才开始收；最后一个监听器去掉之后不再收到。

## 示例

```js
const cookies = session.defaultSession.cookies;
const onChanged = async () => {
  const sid = await cookies.get({ url: 'https://my.app/', name: 'sid' });
  console.log(sid.length > 0 ? '已登录' : '未登录');
};
cookies.addEventListener('changed', onChanged);
```

**效果**：网页登录或退出时，控制台输出 `已登录` 或 `未登录`，可能连着输出几次。

不再需要时：

```js
const cookies = session.defaultSession.cookies;
/** @type {EventListener} */
const onChanged = () => console.log('cookie 变了');
cookies.addEventListener('changed', onChanged);
cookies.removeEventListener('changed', onChanged);
```

**效果**：去掉之后不再收到。

## 和 Electron 的差别

Electron 的监听器收到 `(event, cookie, cause, removed)`，这里没有 `cookie`、`cause`、`removed`：系统的通知不带这些。

对应的 iOS API 是 `WKHTTPCookieStoreObserver` 的 `cookiesDidChangeInCookieStore:`。

## 参见

- [`get()`](get.md)：收到之后重新读
