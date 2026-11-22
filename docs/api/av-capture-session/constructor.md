---
type: reference
native: "-[AVCaptureSession init]"
---

# `AVCaptureSession()` 构造函数

**`AVCaptureSession()`** 构造函数创建一个取景会话。会话把输入（摄像头）接到输出（识别码的元数据输出、显示画面的取景图层）上。

## 语法

```
new AVCaptureSession()
```

### 参数

无。

### 返回值

新建的 `AVCaptureSession`。每次 `new` 得到一个新的对象。新建的会话：

- [`inputs`](inputs.md) 和 [`outputs`](outputs.md) 是空数组。
- [`sessionPreset`](sessionpreset.md) 是 `'high'`。
- [`isRunning`](isrunning.md) 和 [`isInterrupted`](isinterrupted.md) 是 `false`。

新建会话不需要摄像头的授权，也不弹提示框。

### 异常

**`TypeError`**

- 继承它：`class Mine extends AVCaptureSession {}` 在 `new Mine()` 时抛，信息是 `Illegal constructor: Mine extends AVCaptureSession, but subclassing native classes is not supported yet`。

## 示例

```js
const session = new AVCaptureSession();
console.log(session.sessionPreset, session.inputs.length, session.isRunning);
```

**结果**：输出 `high 0 false`。

## 对应的 iOS API

`[[AVCaptureSession alloc] init]`。

## 参见

- [`addInput()`](addinput.md)：接上摄像头
- [`addOutput()`](addoutput.md)：加上识别码的输出
- [`startRunning()`](startrunning.md)：开始取景
- [安装 `@nacrejs/av-capture`](../av-capture-session.md#先装上)
