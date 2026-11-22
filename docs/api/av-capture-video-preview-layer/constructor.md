---
type: reference
native: "-[AVCaptureVideoPreviewLayer initWithSession:]"
---

# `AVCaptureVideoPreviewLayer()` 构造函数

**`AVCaptureVideoPreviewLayer()`** 构造函数创建一个显示会话取景画面的图层。

## 语法

```
new AVCaptureVideoPreviewLayer(session)
```

### 参数

**`session`**

要显示哪个会话的画面，一个 [`AVCaptureSession`](../av-capture-session.md)。必填。之后可以用 [`session`](session.md) 属性换掉或清掉。

### 返回值

新建的 `AVCaptureVideoPreviewLayer`。它是一个 [`CALayer`](../ca-layer.md)，刚建好时大小是 0 × 0 pt：

- 设好 `frame`，放进一个视图的图层里（`view.layer.addSublayer(preview)`），才看得见。
- [`videoGravity`](videogravity.md) 默认 `'resizeAspect'`（实测）。
- 会话开始取景（[`startRunning()`](../av-capture-session/startrunning.md)）之后，图层里才有画面。画面在图层里的样子**未在真机验证**。

### 异常

**`TypeError`**

- `session` 不是 `AVCaptureSession`（不传、传字符串）：`AVCaptureVideoPreviewLayer needs an AVCaptureSession, got …`（实测）。
- 继承它：`class Mine extends AVCaptureVideoPreviewLayer {}` 在 `new Mine()` 时抛，信息以 `Illegal constructor` 开头。

## 示例

```js
const view = new UIView();
view.frame = new CGRect(20, 120, 300, 400);
const session = new AVCaptureSession();
const preview = new AVCaptureVideoPreviewLayer(session);
preview.videoGravity = 'resizeAspectFill';
preview.frame = view.bounds;
view.layer.addSublayer(preview);
```

**效果**：图层铺满 300 × 400 pt 的视图。会话接上摄像头、开始取景之后，视图里显示摄像头的画面，按比例铺满，多出来的裁掉（**未在真机验证**）。

## 对应的 iOS API

`-[AVCaptureVideoPreviewLayer initWithSession:]`。

## 参见

- [`session`](session.md)：换会话或清掉
- [`videoGravity`](videogravity.md)：画面怎么填进图层
- [`CALayer`](../ca-layer.md)：`frame`、`addSublayer()` 等继承来的成员
- [安装 `@nacrejs/av-capture`](../av-capture-session.md#先装上)
