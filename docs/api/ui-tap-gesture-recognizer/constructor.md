---
type: reference
native: "-[UITapGestureRecognizer init]"
---

# `UITapGestureRecognizer()` 构造函数

**`UITapGestureRecognizer()`** 构造函数创建一个点按识别器：单指点一下就认出。

## 语法

```
new UITapGestureRecognizer()
```

### 参数

无。

### 返回值

新建的 `UITapGestureRecognizer`。[`numberOfTapsRequired`](numberoftapsrequired.md) 是 1，[`numberOfTouchesRequired`](numberoftouchesrequired.md) 是 1，没有加到任何视图上。

### 异常

**`TypeError`**

用 `class X extends UITapGestureRecognizer {}` 继承之后 `new X()`，抛 `TypeError`。原生类都不能继承，见[原生类](../native-classes.md)。

## 示例

```js
const card = new UIView();
const tap = new UITapGestureRecognizer();
tap.addEventListener('ended', () => {
  console.log('点了');
});
card.addGestureRecognizer(tap);
```

**效果**：点一下 `card`，控制台输出 `点了`。

## 对应的 iOS API

`[[UITapGestureRecognizer alloc] init]`。原生用 `initWithTarget:action:` 同时登记回调，这里先创建，再用 [`addEventListener()`](../ui-gesture-recognizer/addeventlistener.md) 监听。

## 参见

- [`ended`](../ui-gesture-recognizer/ended-event.md)：点按被认出时派发
