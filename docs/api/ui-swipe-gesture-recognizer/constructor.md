---
type: reference
native: "-[UISwipeGestureRecognizer init]"
---

# `UISwipeGestureRecognizer()` 构造函数

**`UISwipeGestureRecognizer()`** 构造函数创建一个轻扫识别器：单指向右快速划过时认出。

## 语法

```
new UISwipeGestureRecognizer()
```

### 参数

无。

### 返回值

新建的 `UISwipeGestureRecognizer`。[`direction`](direction.md) 是 `['right']`，[`numberOfTouchesRequired`](numberoftouchesrequired.md) 是 1，没有加到任何视图上。

### 异常

**`TypeError`**

用 `class X extends UISwipeGestureRecognizer {}` 继承之后 `new X()`，抛 `TypeError`。原生类都不能继承，见[原生类](../native-classes.md)。

## 示例

```js
const card = new UIView();
const swipe = new UISwipeGestureRecognizer();
swipe.addEventListener('ended', () => {
  console.log('向右扫');
});
card.addGestureRecognizer(swipe);
```

**效果**：手指在 `card` 上向右快速划过，输出 `向右扫`。慢慢移动不算轻扫，没有输出。**未在模拟器验证。**

## 对应的 iOS API

`[[UISwipeGestureRecognizer alloc] init]`。原生用 `initWithTarget:action:` 同时登记回调，这里先创建，再用 [`addEventListener()`](../ui-gesture-recognizer/addeventlistener.md) 监听。

## 参见

- [`ended`](../ui-gesture-recognizer/ended-event.md)：轻扫被认出时派发
