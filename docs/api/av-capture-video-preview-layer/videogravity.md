---
type: reference
native: AVCaptureVideoPreviewLayer.videoGravity
---

# `AVCaptureVideoPreviewLayer`：`videoGravity` 属性

**`videoGravity`** 属性表示画面和图层的长宽比不一样时，画面怎么填进图层。

## 值

字符串，下面三个之一：

| 取值 | 效果 |
| --- | --- |
| `'resizeAspect'` | 保持画面的比例，整个画面都放得下。比例不一样时，图层的两边或上下留空 |
| `'resizeAspectFill'` | 保持画面的比例，铺满整个图层。多出来的部分裁掉 |
| `'resize'` | 把画面拉伸到和图层一样大，比例会变 |

- 可读，可写。
- 默认值是 `'resizeAspect'`（实测）。
- 写 `'resizeAspectFill'`，读回来是 `'resizeAspectFill'`（实测）。
- 三种取值在屏幕上的效果**未在真机验证**。
- 只有自己的代码会改它，所以没有变化通知。

扫码的取景框一般用 `'resizeAspectFill'`：画面铺满，没有空白。被裁掉的部分不在屏幕上，用户看不见那里的码。

### 写错时

写入表里没有的值：不抛异常，控制台输出一条警告，列出全部可用的值，`videoGravity` 保持原来的值（实测）。

## 示例

```js
const preview = new AVCaptureVideoPreviewLayer(new AVCaptureSession());
preview.videoGravity = 'resizeAspectFill';
console.log(preview.videoGravity);
```

**效果**：控制台输出 `resizeAspectFill`。会话取景时，画面按比例铺满图层（**未在真机验证**）。

## 对应的 iOS API

`AVCaptureVideoPreviewLayer.videoGravity`。`AVLayerVideoGravityResizeAspectFill` 写成 `'resizeAspectFill'`，其余同理。

## 参见

- [`AVCaptureVideoPreviewLayer()`](constructor.md)
- [枚举](../enums.md)：属性写错时为什么是警告而不是抛异常
