---
type: reference
native: AVCaptureSession.isRunning
---

# `AVCaptureSession`：`isRunning` 属性

**`isRunning`** 属性表示会话现在在不在取景。

## 值

布尔值。

| 取值 | 含义 |
| --- | --- |
| `true` | 在取景：摄像头开着，元数据输出在识别 |
| `false` | 没在取景 |

- 只读。给它赋值抛 `TypeError`（实测）。
- 新建的会话是 `false`。
- [`startRunning()`](startrunning.md) 兑现之后是 `true`，[`stopRunning()`](stoprunning.md) 兑现之后是 `false`（实测）。
- 变成 `true` 时派发 [`start`](start-event.md)，变成 `false` 时派发 [`stop`](stop-event.md)。
- 会话被打断（来电、App 到后台）时它变不变，**未在真机验证**。被打断看 [`isInterrupted`](isinterrupted.md)。

## 示例

```js
const session = new AVCaptureSession();
console.log(session.isRunning);
session.addEventListener('start', () => console.log('现在', session.isRunning));
```

**效果**：先输出 `false`。之后会话开始取景时输出 `现在 true`。

## 对应的 iOS API

`AVCaptureSession.running`（getter 是 `isRunning`）。ObjC 里用键值观察得知它变了；这里监听 `start` 和 `stop` 事件。

## 参见

- [`start`](start-event.md)、[`stop`](stop-event.md)
- [`isInterrupted`](isinterrupted.md)：是不是被打断着
