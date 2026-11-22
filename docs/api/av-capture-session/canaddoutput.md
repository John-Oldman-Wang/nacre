---
type: reference
native: "-[AVCaptureSession canAddOutput:]"
---

# `AVCaptureSession`：`canAddOutput()` 方法

**`canAddOutput()`** 方法问一个输出现在能不能加进这个会话。它只问，不加。

## 语法

```
canAddOutput(output)
```

### 参数

**`output`**

一个 [`AVCaptureOutput`](../av-capture-output.md)，实际用的是 [`AVCaptureMetadataOutput`](../av-capture-metadata-output.md)。

### 返回值

布尔值。`true` 表示调 [`addOutput()`](addoutput.md) 能加进去；`false` 表示加不进去，比如这个输出已经在会话里了（实测：同一个输出加过一次之后再问是 `false`）。

会话里还没有输入时，元数据输出也能加（实测是 `true`）。

### 异常

**`TypeError`**

- `output` 不是 `AVCaptureOutput`：`canAddOutput needs an AVCaptureOutput, got …`。

## 示例

```js
const session = new AVCaptureSession();
const output = new AVCaptureMetadataOutput();
console.log(session.canAddOutput(output));
session.addOutput(output);
console.log(session.canAddOutput(output));
```

**结果**：依次输出 `true`、`false`。不需要摄像头的授权。

## 对应的 iOS API

`-[AVCaptureSession canAddOutput:]`。

## 参见

- [`addOutput()`](addoutput.md)：加进去
- [`outputs`](outputs.md)：现在有哪些输出
