---
type: reference
native: UIApplicationProtectedDataWillBecomeUnavailable
---

# `Application`：`protecteddataunavailable` 事件

**`protecteddataunavailable`** 事件在设备即将锁屏、加密保护的文件将读不了时派发。

## 语法

```
application.addEventListener('protecteddataunavailable', (event) => { })
```

## 事件对象

`Event`，只有基本字段。新的值从 [`application.protectedDataAvailable`](protecteddataavailable.md) 读。不能取消。

## 什么时候派发

- 设备即将锁屏时派发。
- 这个事件的派发**未在模拟器验证**。

## 示例

```js
application.addEventListener('protecteddataunavailable', () => {
  console.log('加密的文件马上读不了了');
});
```

**效果**：设备锁屏前输出一行。**未在模拟器验证。**

## 对应的 iOS API

`UIApplicationProtectedDataWillBecomeUnavailable`。

## 参见

- [`protecteddataavailable`](protecteddataavailable-event.md)
