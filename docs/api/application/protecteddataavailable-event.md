---
type: reference
native: UIApplicationProtectedDataDidBecomeAvailable
---

# `Application`：`protecteddataavailable` 事件

**`protecteddataavailable`** 事件在设备解锁、加密保护的文件可以读了时派发。

## 语法

```
application.addEventListener('protecteddataavailable', (event) => { })
```

## 事件对象

`Event`，只有基本字段。新的值从 [`application.protectedDataAvailable`](protecteddataavailable.md) 读。不能取消。

## 什么时候派发

- 设备解锁之后派发。
- 这个事件的派发**未在模拟器验证**。

## 示例

```js
application.addEventListener('protecteddataavailable', () => {
  console.log('可以读加密的文件了', application.protectedDataAvailable);
});
```

**效果**：设备解锁后输出 `可以读加密的文件了 true`。**未在模拟器验证。**

## 对应的 iOS API

`UIApplicationProtectedDataDidBecomeAvailable`。

## 参见

- [`protecteddataunavailable`](protecteddataunavailable-event.md)
