---
type: reference
native: "-[UIRotationGestureRecognizer init]"
---

# `UIRotationGestureRecognizer()` 构造函数

**`UIRotationGestureRecognizer()`** 构造函数创建一个旋转识别器：两根手指绕着彼此转动时认出。

## 语法

```
new UIRotationGestureRecognizer()
```

### 参数

无。

### 返回值

新建的 `UIRotationGestureRecognizer`。[`rotation`](rotation.md) 是 0，[`velocity`](velocity.md) 是 0，没有加到任何视图上。

### 异常

**`TypeError`**

用 `class X extends UIRotationGestureRecognizer {}` 继承之后 `new X()`，抛 `TypeError`。原生类都不能继承，见[原生类](../native-classes.md)。

## 示例

```js
const card = new UIView();
const twist = new UIRotationGestureRecognizer();
twist.addEventListener('changed', (e) => {
  const { rotation } = /** @type {UIRotationGestureRecognizerEvent} */ (e);
  console.log(rotation);
});
card.addGestureRecognizer(twist);
```

**效果**：两根手指在 `card` 上转动，控制台输出转过的角度，单位是弧度。**未在模拟器验证。**

## 对应的 iOS API

`[[UIRotationGestureRecognizer alloc] init]`。原生用 `initWithTarget:action:` 同时登记回调，这里先创建，再用 [`addEventListener()`](../ui-gesture-recognizer/addeventlistener.md) 监听。

## 参见

- [响应手势](../../guides/gestures.md#两指旋转)
