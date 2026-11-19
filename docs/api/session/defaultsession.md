---
type: reference
native: WKWebsiteDataStore.defaultDataStore
---

# `session.defaultSession` 静态属性

**`session.defaultSession`** 属性是默认分区的 [`Session`](../session.md)。所有建的时候没写 `partition` 的网页共用这个分区。

## 值

[`Session`](../session.md)。

- 只读。`session` 对象是冻结的，给它赋值不生效：严格模式下抛 `TypeError`。
- 每次读是同一个对象，`session.defaultSession === session.defaultSession` 成立。
- 和 `session.fromPartition('')`、`session.fromPartition('persist:')` 是同一个对象。
- 默认分区的数据在 App 重启之后还在，[`isPersistent()`](ispersistent.md) 返回 `true`。

不需要先建网页就可以用。

## 示例

```js
const ses = session.defaultSession;
console.log(ses === session.fromPartition(''));
console.log(ses.isPersistent());
```

**结果**：依次输出 `true`、`true`。

## 和 Electron 的差别

`session` 是全局对象，不用 `require('electron')`。其余相同。

对应的 iOS API 是 `WKWebsiteDataStore.defaultDataStore`。

## 参见

- [`session.fromPartition()`](frompartition.md)：别的分区
- [分区](../session.md#分区)：几种分区的区别
