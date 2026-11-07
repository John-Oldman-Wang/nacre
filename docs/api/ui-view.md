# `UIView`

视图。屏幕上一块矩形区域，负责画自己和接收触摸。

现在还只是个空壳加一个属性——`frame`、`addSubview` 这些要等结构体（`CGRect` / `CGPoint` / `CGSize`）的支持。

## 继承关系

```
EventTarget
└─ NSObject
   └─ UIResponder
      └─ UIView
         └─ UIWindow
```

不能直接 `new UIView()`（还没暴露 `initWithFrame:`），但可以从别处拿到：`viewController.view` 就是一个。

## 属性

### `backgroundColor`

读写。背景色，`UIColor` 或 `null`（ObjC 的 `nil`，表示透明）。

```js
const vc = new UIViewController();
vc.view.backgroundColor = UIColor.systemBackgroundColor;
```

`UIViewController` 的默认 `view` 背景色是 `nil`，所以**不设这个属性屏幕就是全黑的**。

> `UIWindow` 继承了这个属性，但设在 window 上没用——根视图控制器的 view 盖在上面。要改底色就设 `vc.view.backgroundColor`。

## 还没做

`frame` / `bounds` / `center`、`addSubview` / `removeFromSuperview` / `subviews`、`hidden` / `alpha`、Auto Layout 约束、`layer`。

---

← 返回 [API 文档](README.md)
