---
type: reference
native: "+[WKWebsiteDataStore dataStoreForIdentifier:]"
---

# `session.fromPartition()` 静态方法

**`session.fromPartition()`** 方法按分区名返回一个分区的 [`Session`](../session.md)。分区名和建 [`WebView`](../web-view.md) 时 `webPreferences.partition` 的写法相同，名字相同就是同一份数据。

## 语法

```
session.fromPartition(partition)
```

### 参数

**`partition`**

分区名，字符串。不是字符串时先转成字符串。

| 写法 | 是哪一份 | App 重启之后 |
| --- | --- | --- |
| `'persist:名字'` | 名字对应的那一份，存在磁盘上 | 数据还在 |
| `'名字'`（不带 `persist:`） | 名字对应的那一份，只在内存里 | 数据没了 |
| `''` 或 `'persist:'` | 默认分区，和 [`session.defaultSession`](defaultsession.md) 相同 | 数据还在 |

### 返回值

[`Session`](../session.md)。同一个分区名每次返回同一个对象。

### 异常

无。

## 示例

```js
const work = session.fromPartition('persist:work');
await work.cookies.set({ url: 'https://my.app/', name: 'token', value: 'work-token' });

const web = new WebView({ webPreferences: { partition: 'persist:work' } });
console.log(web.webContents.session === work);
console.log(work === session.fromPartition('persist:work'));
```

**效果**

- 依次输出 `true`、`true`：同一个分区永远是同一个 `Session` 对象。
- 这张网页的请求带着 `work-token`。默认分区和别的分区里的网页看不到这条 cookie。

## 和 Electron 的差别

`session` 是全局对象，不用 `require('electron')`。其余相同。

对应的 iOS API：带 `persist:` 的分区是 `+[WKWebsiteDataStore dataStoreForIdentifier:]`，不带的是 `+[WKWebsiteDataStore nonPersistentDataStore]`。

## 参见

- [分区](../session.md#分区)
- [`isPersistent()`](ispersistent.md)：读一个分区重启后还在不在
