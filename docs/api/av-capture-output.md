---
type: reference
native: AVCaptureOutput
status: partial
---

# `AVCaptureOutput`

**`AVCaptureOutput`** 表示 [`AVCaptureSession`](av-capture-session.md) 的一个输出：会话把画面交给它处理。它是输出的共同基类，App 用的是它的子类 [`AVCaptureMetadataOutput`](av-capture-metadata-output.md)，从画面里认码和人脸。

会话的 [`addOutput()`](av-capture-session/addoutput.md)、[`canAddOutput()`](av-capture-session/canaddoutput.md)、[`removeOutput()`](av-capture-session/removeoutput.md) 收的参数类型是它，[`outputs`](av-capture-session/outputs.md) 里的元素类型也是它。

它属于 `@nacrejs/av-capture` 这个包，安装见 [`AVCaptureSession`](av-capture-session.md#先装上)。

**继承关系**：`EventTarget` → `NSObject` → `AVCaptureOutput`

## 构造函数

不能用 `new` 创建：`new AVCaptureOutput()` 抛 `TypeError`，信息是 `Illegal constructor: AVCaptureOutput cannot be constructed`（实测）。要认码，用 [`new AVCaptureMetadataOutput()`](av-capture-metadata-output/constructor.md)。

## 实例属性

没有自己的属性。还继承 `NSObject` 的属性。

## 实例方法

没有自己的方法。

## 示例

```js
const session = new AVCaptureSession();
session.addOutput(new AVCaptureMetadataOutput());
for (const output of session.outputs) {
  if (output instanceof AVCaptureMetadataOutput) {
    console.log('要认的种类：' + output.metadataObjectTypes.length);
  }
}
```

**结果**：控制台输出 `要认的种类：0`。新建的元数据输出一种都不认。

`outputs` 的元素类型是 `AVCaptureOutput`。要读元数据输出的属性，先用 `instanceof AVCaptureMetadataOutput` 判断。

## 对应的 iOS API

`AVCaptureOutput`。`[session.outputs firstObject]` 写成 `session.outputs[0]`。

## 参见

- [`AVCaptureMetadataOutput`](av-capture-metadata-output.md)：认码和人脸
- [`AVCaptureSession`](av-capture-session.md)：加减输出
