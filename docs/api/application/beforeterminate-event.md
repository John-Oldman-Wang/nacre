---
type: reference
native: UIApplicationWillTerminateNotification
---

# `Application`：`beforeterminate` 事件

**`beforeterminate`** 事件在系统即将结束 App 时派发。

## 语法

```
application.addEventListener('beforeterminate', (event) => { })
```

## 事件对象

`Event`。`target` 是 `application`，不能取消。

## 什么时候派发

- 系统即将结束 App 时派发。
- App 在后台被系统结束时，这个事件不一定派发。所以不要靠它保存数据，保存数据用 [`background`](background-event.md)。
- 这个事件的派发**未在模拟器验证**。

## 示例

```js
application.addEventListener('beforeterminate', () => {
  console.log('App 即将结束');
});
```

**效果**：系统结束 App 之前输出一行。**未在模拟器验证。**

## 对应的 iOS API

`UIApplicationWillTerminateNotification`。

## 参见

- [`background`](background-event.md)
