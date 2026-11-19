---
type: reference
native: NSUserDefaults.standardUserDefaults
---

# `Application`：`storage` 属性

**`storage`** 属性是 App 的键值存储，用来存设置和小状态。

## 值

`NSUserDefaults`。用法见[本地存储](../storage.md)。

- 只读。给它赋值抛 `TypeError`。
- 每次读到的都是同一个对象。
- 写入是同步的，`set()` 返回时新值已经生效，由系统负责写入磁盘。关掉 App 再打开，值还在。

## 示例

```js
application.storage.set('theme', 'dark');
console.log(application.storage.get('theme'));
```

**结果**：控制台输出 `dark`。

## 对应的 iOS API

`NSUserDefaults.standardUserDefaults`。

## 参见

- [本地存储](../storage.md)
- [`fileSystem`](filesystem.md)、[`keychain`](keychain.md)：另外两个存数据的入口
