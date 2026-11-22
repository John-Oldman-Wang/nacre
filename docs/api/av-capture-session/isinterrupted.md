---
type: reference
native: AVCaptureSession.isInterrupted
---

# `AVCaptureSession`：`isInterrupted` 属性

**`isInterrupted`** 属性表示会话现在是不是被系统打断着。来电、App 到后台、别的 App 占用摄像头时，系统打断会话，会话暂时不取景。

## 值

布尔值。

| 取值 | 含义 |
| --- | --- |
| `true` | 被打断着，暂时不取景 |
| `false` | 没被打断 |

- 只读。给它赋值抛 `TypeError`。
- 新建的会话是 `false`（实测）。
- 变成 `true` 时派发 [`interrupt`](interrupt-event.md)，变回 `false` 时派发 [`interruptend`](interruptend-event.md)。
- 它真的变成 `true` 的情形**未在真机验证**。

## 示例

```js
const session = new AVCaptureSession();
session.addEventListener('interruptend', () => {
  console.log('打断结束了', session.isInterrupted);
});
```

**效果**（**未在真机验证**）：会话被打断之后、打断结束时，输出 `打断结束了 false`。

## 对应的 iOS API

`AVCaptureSession.interrupted`（getter 是 `isInterrupted`）。ObjC 里用键值观察或通知得知它变了；这里监听 `interrupt` 和 `interruptend` 事件。

## 参见

- [`interrupt`](interrupt-event.md)：被打断了，带原因
- [`interruptend`](interruptend-event.md)：打断结束了
- [被打断时](../../guides/scanning.md#被打断时)
