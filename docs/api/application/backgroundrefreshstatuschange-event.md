---
type: reference
native: UIApplicationBackgroundRefreshStatusDidChangeNotification
---

# `Application`：`backgroundrefreshstatuschange` 事件

**`backgroundrefreshstatuschange`** 事件在用户改了后台刷新的设置时派发。

## 语法

```
application.addEventListener('backgroundrefreshstatuschange', (event) => { })
```

## 事件对象

`Event`，只有基本字段。新的值从 [`application.backgroundRefreshStatus`](backgroundrefreshstatus.md) 读。不能取消。

## 什么时候派发

- 用户在系统设置里改了这个 App 的后台刷新时派发。
- 这个事件的派发**未在模拟器验证**。

## 示例

```js
application.addEventListener('backgroundrefreshstatuschange', () => {
  console.log('后台刷新', application.backgroundRefreshStatus);
});
```

**效果**：用户改了设置后输出新的状态。**未在模拟器验证。**

## 对应的 iOS API

`UIApplicationBackgroundRefreshStatusDidChangeNotification`。

## 参见

- [`backgroundRefreshStatus`](backgroundrefreshstatus.md)
