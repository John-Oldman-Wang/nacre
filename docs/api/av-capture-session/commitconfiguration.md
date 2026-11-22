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

- 系统拒绝这组改动：信息里带系统给的原因。什么样的改动会被拒绝、没调 `beginConfiguration()` 就调它会怎样，**未在真机验证**。

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
