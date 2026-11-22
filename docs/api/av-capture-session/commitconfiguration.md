---
type: reference
native: "-[AVCaptureSession commitConfiguration]"
---

# `AVCaptureSession`：`commitConfiguration()` 方法

**`commitConfiguration()`** 方法让 [`beginConfiguration()`](beginconfiguration.md) 之后的改动一次生效。

## 语法

```
commitConfiguration()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 系统拒绝这组改动，而且系统给的原因不属于下面两种。什么样的改动会被拒绝、没调 `beginConfiguration()` 就调它会怎样，**未在真机验证**。

**`RangeError`、[`DOMException`](../dom-exception.md)**

系统拒绝时，抛哪一种照系统的原因分：系统说超出范围的是 `RangeError`，说现在的状态做不了的是 `DOMException`，`name` 是 `'InvalidStateError'`，别的是 `TypeError`。信息是 `commitConfiguration: the system refused (…)`，括号里是系统给的原因。这一条来自代码，**未在真机验证**。

先调 `beginConfiguration()`、再调 `commitConfiguration()` 不抛（实测）。

## 示例

```js
const session = new AVCaptureSession();
session.beginConfiguration();
session.sessionPreset = 'medium';
session.commitConfiguration();
console.log(session.sessionPreset);
```

**结果**：输出 `medium`。

## 对应的 iOS API

`-[AVCaptureSession commitConfiguration]`。

## 参见

- [`beginConfiguration()`](beginconfiguration.md)：开始一组改动
