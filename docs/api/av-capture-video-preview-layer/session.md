---
type: reference
native: AVCaptureVideoPreviewLayer.session
---

# `AVCaptureVideoPreviewLayer`：`session` 属性

**`session`** 属性表示图层显示哪个会话的画面。

## 值

一个 [`AVCaptureSession`](../av-capture-session.md)，或者 `null`。

- 可读，可写。
- 默认值是构造时传进去的那个会话，读出来是同一个对象（实测）。
- 写 `null` 清掉，读回来是 `null`；再写一个会话，读回来是那个会话（实测）。
- 写 `null` 之后图层里显示什么**未在真机验证**。
- 只有自己的代码会改它，所以没有变化通知。

### 写错时

**`TypeError`**

- 写的不是原生对象（比如字符串）：`session needs a native object or null, got …`（实测）。
- 写的是别的原生对象：`session needs an AVCaptureSession or null`。

## 示例

```js
const first = new AVCaptureSession();
const second = new AVCaptureSession();
const preview = new AVCaptureVideoPreviewLayer(first);
preview.session = second;
console.log(preview.session === second);
```

**效果**：控制台输出 `true`。图层改为显示 `second` 的画面。

## 对应的 iOS API

`AVCaptureVideoPreviewLayer.session`。

## 参见

- [`AVCaptureVideoPreviewLayer()`](constructor.md)
