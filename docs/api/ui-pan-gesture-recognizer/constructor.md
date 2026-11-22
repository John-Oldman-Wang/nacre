---
type: reference
native: "-[UIPanGestureRecognizer init]"
---

# `UIPanGestureRecognizer()` 构造函数

**`UIPanGestureRecognizer()`** 构造函数创建一个拖动识别器：手指按下并移动一小段距离就认出。

## 语法

```
new UIPanGestureRecognizer()
```

### 参数

无。

### 返回值

新建的 `UIPanGestureRecognizer`。[`minimumNumberOfTouches`](minimumnumberoftouches.md) 是 1，[`maximumNumberOfTouches`](maximumnumberoftouches.md) 是 4294967295，没有加到任何视图上。

### 异常

**`TypeError`**

用 `class X extends UIPanGestureRecognizer {}` 继承之后 `new X()`，抛 `TypeError`。原生类都不能继承，见[原生类](../native-classes.md)。

## 示例

```js
const card = new UIView();
const drag = new UIPanGestureRecognizer();
drag.addEventListener('changed', (e) => {
  const { translation } = e;
  console.log(translation.x, translation.y);
});
card.addGestureRecognizer(drag);
```

**效果**：按住 `card` 移动手指，控制台持续输出从手势开始累计的位移。**未在模拟器验证。**

## 对应的 iOS API

`[[UIPanGestureRecognizer alloc] init]`。原生用 `initWithTarget:action:` 同时登记回调，这里先创建，再用 [`addEventListener()`](../ui-gesture-recognizer/addeventlistener.md) 监听。

## 参见

- [`changed`](../ui-gesture-recognizer/changed-event.md)
- [响应手势](../../guides/gestures.md#拖动一个视图)
