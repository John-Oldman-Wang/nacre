---
type: reference
native: "-[AVCaptureSession beginConfiguration]"
---

# `AVCaptureSession`：`beginConfiguration()` 方法

**`beginConfiguration()`** 方法开始一组改动。从它到 [`commitConfiguration()`](commitconfiguration.md) 之间对会话的改动（加减输入输出、改画质档位）在 `commitConfiguration()` 时一次生效。

会话正在取景时，一组改动一次生效，画面不会停在改到一半的样子。会话没在取景时，不需要它。

## 语法

```
beginConfiguration()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。

## 示例

取景时从后置摄像头换到前置摄像头：

```js
/**
 * @param {AVCaptureSession} session 正在取景的会话
 * @param {AVCaptureDeviceInput} current 现在接着的输入
 */
function switchToFront(session, current) {
  const front = AVCaptureDevice.defaultDeviceWithDeviceType('builtInWideAngleCamera',
                                                            { position: 'front' });
  if (front === null) return current;
  const next = new AVCaptureDeviceInput(front);
  session.beginConfiguration();
  session.removeInput(current);
  if (session.canAddInput(next)) {
    session.addInput(next);
  } else {
    session.addInput(current);
  }
  session.commitConfiguration();
  return session.inputs[0] === next ? next : current;
}
```

**效果**：取景图层里的画面换成前置摄像头的。加不进去时接回原来的摄像头。**未在真机验证。**

## 对应的 iOS API

`-[AVCaptureSession beginConfiguration]`。

## 参见

- [`commitConfiguration()`](commitconfiguration.md)：让改动生效
