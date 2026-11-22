---
type: reference
native: "-[AVCaptureSession stopRunning]"
---

# `AVCaptureSession`：`stopRunning()` 方法

**`stopRunning()`** 方法让会话停止取景：摄像头关掉，元数据输出不再识别。

## 语法

```
stopRunning()
```

### 参数

无。

### 返回值

`Promise`，会话停好之后兑现，值是 `undefined`。

- 停会话要一段时间，这段时间里界面照常响应，不会卡住。
- 兑现之后 [`isRunning`](isrunning.md) 是 `false`（实测）。
- 会话还会派发一次 [`stop`](stop-event.md) 事件（实测）。
- 会话没在取景时调它会怎样，**未在真机验证**。
- 停了之后输入、输出、取景图层都还在，再调 [`startRunning()`](startrunning.md) 就能接着取景。

停下之后取景图层里显示什么（最后一帧还是空白），**未在真机验证**。

### 异常

无。

## 示例

```js
/** @param {AVCaptureSession} session 正在取景的会话 */
function stopScanning(session) {
  session.stopRunning().then(() => {
    console.log('停了', session.isRunning);
  });
}
```

**效果**：调 `stopScanning()` 之后过一会儿，输出 `停了 false`。

## 对应的 iOS API

`-[AVCaptureSession stopRunning]`。ObjC 里它会一直等到停好才返回，要放到后台队列上调；这里直接调，返回 Promise，停好之后兑现。

## 参见

- [`startRunning()`](startrunning.md)：开始取景
- [`stop`](stop-event.md)：停了
- [扫到就停](../../guides/scanning.md#扫到就停)
