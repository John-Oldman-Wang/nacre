---
type: reference
native: NSUserDefaultsDidChangeNotification
---

# `NSUserDefaults`：`change` 事件

**`change`** 事件在存储里任何一个键被写入或删除之后派发。

## 语法

```
application.storage.addEventListener('change', (event) => { })
```

## 事件对象

`Event`。只有 `type` 和 `target`，不带键名和值。不能取消。

## 什么时候派发

- **事件不说明是哪个键变了。** 回调里要自己重新读关心的键。
- **App 自己的写入也会触发。** 代码调用 [`set()`](set.md) 或 [`remove()`](remove.md) 之后，自己注册的回调会收到事件。
- **系统的写入也会触发。** iOS 自己也会往这份存储里写东西，这些写入同样派发 `change`。所以回调被调用不代表 App 关心的键变了。
- **每次写入派发一次，不合并。** 连续写三个键，收到三次事件。
- 事件不是在 `set()` 返回前派发的，而是在当前这段代码执行完之后。`set()` 的下一行还收不到。
- App 进程之外对这份存储的改动不派发 `change`（来自 iOS 的定义，**未在模拟器验证**）。

## 示例

```js
const storage = application.storage;
const onChange = () => {
  console.log('存储变了，当前主题:', storage.get('theme'));
};
storage.addEventListener('change', onChange);

storage.set('theme', 'light');
console.log('set 已返回');
```

**结果**：先输出 `set 已返回`，然后输出 `存储变了，当前主题: light`。回调在当前这段代码执行完之后才执行。

不再需要时用 `storage.removeEventListener('change', onChange)` 移除，之后的写入不再调用这个回调。

## 对应的 iOS API

`NSUserDefaultsDidChangeNotification`。

## 参见

- [存储变化时更新界面](../../guides/save-settings.md#存储变化时更新界面)：在回调里比较新旧值
