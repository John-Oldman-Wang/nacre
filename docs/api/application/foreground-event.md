---
type: reference
native: UIApplicationWillEnterForegroundNotification
---

# `Application`：`foreground` 事件

**`foreground`** 事件在 App 即将回到前台时派发。

## 语法

```
application.addEventListener('foreground', (event) => { })
```

## 事件对象

`Event`。`target` 是 `application`，不能取消。

## 什么时候派发

- 用户从后台切回 App 时派发，随后派发 [`active`](active-event.md)。
- App 启动时也会依次派发 `foreground` 和 `active`。
- 事件到达时 [`state`](state.md) 还是旧值 `'background'`（实测）。
- 回调稍后执行，见[运行时怎么工作](../how-it-works.md#事件)。

## 示例

```js
application.addEventListener('foreground', (e) => {
  console.log(e.type, '此刻 state =', application.state);
});
```

**结果**：用户切回 App 时输出 `foreground 此刻 state = background`。

## 对应的 iOS API

`UIApplicationWillEnterForegroundNotification`。

## 参见

- [`background`](background-event.md)
