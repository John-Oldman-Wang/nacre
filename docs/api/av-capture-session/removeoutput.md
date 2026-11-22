---
type: reference
native: "-[AVCaptureSession removeOutput:]"
---

# `AVCaptureSession`：`removeOutput()` 方法

**`removeOutput()`** 方法把一个输出从会话里去掉。

## 语法

```
removeOutput(output)
```

### 参数

**`output`**

一个 [`AVCaptureOutput`](../av-capture-output.md)，通常是之前用 [`addOutput()`](addoutput.md) 加进去的那个。传一个不在这个会话里的输出会怎样，**未在真机验证**。

### 返回值

无（`undefined`）。去掉之后 [`outputs`](outputs.md) 里不再有它（实测）。

### 异常

**`TypeError`**

- `output` 不是 `AVCaptureOutput`：`removeOutput needs an AVCaptureOutput, got …`。

## 示例

```js
const session = new AVCaptureSession();
const output = new AVCaptureMetadataOutput();
session.addOutput(output);
session.removeOutput(output);
console.log(session.outputs.length);
```

**结果**：输出 `0`。

## 对应的 iOS API

`-[AVCaptureSession removeOutput:]`。

## 参见

- [`addOutput()`](addoutput.md)：加进去
