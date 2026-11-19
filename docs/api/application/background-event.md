---
type: reference
native: UIApplicationDidEnterBackgroundNotification
---

# `Application`：`background` 事件

**`background`** 事件在 App 已经进入后台时派发。

## 语法

```
application.addEventListener('background', (event) => { })
```

## 事件对象

`Event`。`target` 是 `application`，不能取消。

## 什么时候派发

- 用户回到主屏幕或切到别的 App 时，在 [`inactive`](inactive-event.md) 之后派发。它只在 App 确实进了后台时派发，来电这类临时打断不派发。
- 事件到达时 [`state`](state.md) 是 `'background'`（实测）。
- 回调稍后执行，见[运行时怎么工作](../how-it-works.md#事件)。

进入后台后，系统会在一小段时间之后暂停 App：JS 不再执行，定时器不再触发。用户回到 App 时从暂停的地方继续，JS 里的变量都还在。系统也可能在后台直接结束 App，这时不会有任何通知，下次打开时 `main.js` 从头执行。**这几条来自 iOS 的定义，未在模拟器验证。** 进入后台时还没完成的网络请求会怎样，**未在模拟器验证**。

需要保留的数据在这个事件里保存完，写进 [`application.storage`](storage.md)。不要等 [`beforeterminate`](beforeterminate-event.md)。

## 示例

```js
application.addEventListener('background', () => {
  application.storage.set('lastSeen', Date.now());
});
```

**效果**：每次进入后台时把当前时间存进本地存储。下次打开 App 能读到它。

## 对应的 iOS API

`UIApplicationDidEnterBackgroundNotification`。

## 参见

- [处理 App 的生命周期](../../guides/app-lifecycle.md#进入后台时保存数据)
