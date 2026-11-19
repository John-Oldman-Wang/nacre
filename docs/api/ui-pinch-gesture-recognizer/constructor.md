---
type: reference
native: "-[UIPinchGestureRecognizer init]"
---

# `UIPinchGestureRecognizer()` 构造函数

**`UIPinchGestureRecognizer()`** 构造函数创建一个捏合识别器：两根手指张开或捏拢时认出。

## 语法

```
new UIPinchGestureRecognizer()
```

### 参数

无。

### 返回值

新建的 `UIPinchGestureRecognizer`。[`scale`](scale.md) 是 1，[`velocity`](velocity.md) 是 0，没有加到任何视图上。

### 异常

**`TypeError`**

用 `class X extends UIPinchGestureRecognizer {}` 继承之后 `new X()`，抛 `TypeError`。原生类都不能继承，见[原生类](../native-classes.md)。

## 示例

```js
const card = new UIView();
const pinch = new UIPinchGestureRecognizer();
pinch.addEventListener('changed', (e) => {
  const { scale } = /** @type {UIPinchGestureRecognizerEvent} */ (e);
  console.log(scale);
});
card.addGestureRecognizer(pinch);
```

**效果**：两根手指在 `card` 上张开，控制台输出大于 1 的数；捏拢输出小于 1 的数。**未在模拟器验证。**

## 对应的 iOS API

`[[UIPinchGestureRecognizer alloc] init]`。原生用 `initWithTarget:action:` 同时登记回调，这里先创建，再用 [`addEventListener()`](../ui-gesture-recognizer/addeventlistener.md) 监听。

## 参见

- [响应手势](../../guides/gestures.md#两指缩放)
