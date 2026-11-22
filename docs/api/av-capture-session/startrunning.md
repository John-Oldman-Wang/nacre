---
type: reference
native: "-[AVCaptureSession startRunning]"
---

# `AVCaptureSession`：`startRunning()` 方法

**`startRunning()`** 方法让会话开始取景：摄像头开始送画面，取景图层显示画面，元数据输出开始识别。

## 语法

```
startRunning()
```

### 参数

无。

### 返回值

`Promise`，会话开好之后兑现，值是 `undefined`。

- 开会话要一段时间，这段时间里界面照常响应，不会卡住。
- 兑现之后 [`isRunning`](isrunning.md) 是 `true`（实测）。
- 会话还会派发一次 [`start`](start-event.md) 事件（实测）。
- 会话已经在取景时再调一次，也兑现（实测）。
- 开不起来时 Promise 不拒绝，照样兑现：系统从 [`runtimeerror`](runtimeerror-event.md) 事件报原因，`isRunning` 还是 `false`。这一条**未在真机验证**。所以兑现之后要确认开起来了，读 `isRunning`。

### 异常

无。

## 说明

- 调之前先拿到摄像头的授权，见[授权](../av-capture-device.md#授权)。
- 摄像头一直开着耗电。扫到码、离开扫码的页面之后，调 [`stopRunning()`](stoprunning.md)。

## 示例

```js
const session = new AVCaptureSession();
const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera !== null) {
  session.addInput(new AVCaptureDeviceInput(camera));
  session.startRunning().then(() => {
    console.log(session.isRunning ? '开始取景' : '没有开起来');
  });
}
```

**效果**：用户已经同意 App 使用摄像头时，过一会儿输出 `开始取景`。

## 对应的 iOS API

`-[AVCaptureSession startRunning]`。ObjC 里它会一直等到开好才返回，要放到后台队列上调；这里直接调，返回 Promise，开好之后兑现。

## 参见

- [`stopRunning()`](stoprunning.md)：停止取景
- [`start`](start-event.md)：开始取景了
- [`runtimeerror`](runtimeerror-event.md)：取景中出错
- [扫到就停](../../guides/scanning.md#扫到就停)
