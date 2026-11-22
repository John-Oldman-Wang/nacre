---
type: reference
native: "-[AVCaptureMetadataOutput init]"
---

# `AVCaptureMetadataOutput()` 构造函数

**`AVCaptureMetadataOutput()`** 构造函数创建一个识别画面里码和人脸这类东西的输出。

## 语法

```
new AVCaptureMetadataOutput()
```

### 参数

无。

### 返回值

新建的 `AVCaptureMetadataOutput`。刚建好时：

- [`metadataObjectTypes`](metadataobjecttypes.md) 是空数组，什么都不识别。
- [`availableMetadataObjectTypes`](availablemetadataobjecttypes.md) 是空数组（实测）。它要等输出加进一个接好摄像头的会话之后才有内容。
- [`rectOfInterest`](rectofinterest.md) 是整个画面 `(0, 0, 1, 1)`（实测）。

### 异常

**`TypeError`**

- 继承它：`class Mine extends AVCaptureMetadataOutput {}` 在 `new Mine()` 时抛，信息以 `Illegal constructor` 开头。

## 说明

用起来的顺序是固定的：先给会话加摄像头输入，再用 [`addOutput()`](../av-capture-session/addoutput.md) 加这个输出，然后才写 `metadataObjectTypes`。顺序反了，写 `metadataObjectTypes` 时抛 `TypeError`。

## 示例

```js
const output = new AVCaptureMetadataOutput();
console.log(output.metadataObjectTypes.length, output.availableMetadataObjectTypes.length);
```

**效果**：控制台输出 `0 0`。

## 对应的 iOS API

`[[AVCaptureMetadataOutput alloc] init]`。

## 参见

- [`metadataObjectTypes`](metadataobjecttypes.md)：要识别什么
- [`detect`](detect-event.md)：认到了
- [`addOutput()`](../av-capture-session/addoutput.md)：把输出加进会话
- [安装 `@nacrejs/av-capture`](../av-capture-session.md#先装上)
