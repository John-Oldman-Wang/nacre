---
type: reference
native: UIApplicationUserDidTakeScreenshotNotification
---

# `Application`：`screenshot` 事件

**`screenshot`** 事件在用户截了屏之后派发。

## 语法

```
application.addEventListener('screenshot', (event) => { })
```

## 事件对象

`Event`。`target` 是 `application`，不能取消。事件对象里没有截图本身。

## 什么时候派发

- 用户截屏之后派发。截屏已经完成，不能阻止。
- 这个事件的派发**未在模拟器验证**。

## 示例

```js
application.addEventListener('screenshot', () => {
  console.log('用户截了屏');
});
```

**效果**：用户截屏后输出一行。**未在模拟器验证。**

## 对应的 iOS API

`UIApplicationUserDidTakeScreenshotNotification`。

## 参见

- [`Application`](../application.md#事件)
