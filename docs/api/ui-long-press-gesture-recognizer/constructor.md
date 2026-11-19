---
type: reference
native: "-[UILongPressGestureRecognizer init]"
---

# `UILongPressGestureRecognizer()` 构造函数

**`UILongPressGestureRecognizer()`** 构造函数创建一个长按识别器：单指按住 0.5 秒就认出。

## 语法

```
new UILongPressGestureRecognizer()
```

### 参数

无。

### 返回值

新建的 `UILongPressGestureRecognizer`。[`minimumPressDuration`](minimumpressduration.md) 是 0.5 秒，[`allowableMovement`](allowablemovement.md) 是 10 pt，没有加到任何视图上。

### 异常

**`TypeError`**

用 `class X extends UILongPressGestureRecognizer {}` 继承之后 `new X()`，抛 `TypeError`。原生类都不能继承，见[原生类](../native-classes.md)。

## 示例

```js
const card = new UIView();
const press = new UILongPressGestureRecognizer();
press.addEventListener('began', () => {
  console.log('按住了');
});
card.addGestureRecognizer(press);
```

**效果**：按住 `card` 0.5 秒，控制台输出 `按住了`。

## 对应的 iOS API

`[[UILongPressGestureRecognizer alloc] init]`。原生用 `initWithTarget:action:` 同时登记回调，这里先创建，再用 [`addEventListener()`](../ui-gesture-recognizer/addeventlistener.md) 监听。

## 参见

- [`began`](../ui-gesture-recognizer/began-event.md)：长按被认出时派发
