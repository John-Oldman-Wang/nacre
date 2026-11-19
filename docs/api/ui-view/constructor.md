---
type: reference
native: "-[UIView init]"
---

# `UIView()` 构造函数

**`UIView()`** 构造函数创建一个视图。

## 语法

```
new UIView()
```

### 参数

无。

### 返回值

新建的 `UIView`。它的 [`frame`](frame.md) 是 `(0, 0, 0, 0)`，没有底色，没有父视图。这三项不改，屏幕上看不到它，见[新建的视图为什么看不见](../../guides/views.md#新建的视图为什么看不见)。

创建视图不需要场景或窗口。可以在任何时候创建，之后再加到视图树上。

### 异常

**`TypeError`**

`UIView` 不能被继承。`class Card extends UIView {}` 之后 `new Card()` 抛 `TypeError: Illegal constructor: Card extends UIView, but subclassing native classes is not supported yet`。要给视图附加自己的逻辑，用组合，见[原生类](../native-classes.md)。

## 示例

```js
const view = new UIView();
console.log(String(view.frame), view.backgroundColor, view.superview);
```

**结果**：输出 `CGRect(0, 0, 0, 0) null null`。

## 对应的 iOS API

`[[UIView alloc] init]`。`[[UIView alloc] initWithFrame:rect]` 写成 `new UIView()` 之后赋 `frame`。

## 参见

- [在屏幕上摆放视图](../../guides/views.md)
