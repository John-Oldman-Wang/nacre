---
type: reference
native: WKWebsiteDataStore.isPersistent
---

# `Session`：`isPersistent()` 方法

**`isPersistent()`** 方法返回这个分区的数据在 App 重启之后还在不在。

## 语法

```
isPersistent()
```

### 参数

无。

### 返回值

布尔。

- `true`：默认分区，和 `persist:` 开头的分区。数据存在磁盘上，App 重启之后还在。
- `false`：不带 `persist:` 的分区。数据只在内存里，App 重启之后就没了。

### 异常

无。

## 示例

```js
console.log(session.defaultSession.isPersistent());
console.log(session.fromPartition('persist:shop').isPersistent());
console.log(session.fromPartition('guest').isPersistent());
```

**结果**：依次输出 `true`、`true`、`false`。

## 和 Electron 的差别

相同。

对应的 iOS API 是 `WKWebsiteDataStore.isPersistent`。

## 参见

- [分区](../session.md#分区)
