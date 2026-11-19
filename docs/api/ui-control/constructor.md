---
type: reference
native: "-[UIControl init]"
---

# `UIControl()` 构造函数

**`UIControl()`** 构造函数创建一个控件。新建的控件不显示任何内容，用来做自定义的可点击区域：给它大小和底色，往里面加文字和图标，再监听它的[事件](../ui-control.md#事件)。

## 语法

```
new UIControl()
```

### 参数

无。

### 返回值

新建的 `UIControl`。位置是 `(0, 0)`，宽和高是 0 pt，没有底色。要给它大小和底色才能看到。

### 异常

**`TypeError`**

用 `class MyControl extends UIControl {}` 继承之后 `new MyControl()`，抛 `TypeError`。原生类都不能继承，见[原生类](../native-classes.md)。

## 说明

直接创建的 `UIControl` 被点击时派发 [`touchupinside`](touchupinside-event.md)，不派发 [`click`](click-event.md)（实测）。响应点击监听 `touchupinside`。

往控件里加的文字和图标，把它们的 `isUserInteractionEnabled` 设成 `false`，让触摸由控件接收。**触摸落在子视图上时由控件接收，未在模拟器验证。**

## 示例

```js
const card = new UIControl();
card.backgroundColor = 'systemGreen';
card.frame = { x: 20, y: 100, width: 200, height: 52 };
card.addEventListener('touchupinside', () => {
  console.log('点了 card');
});
```

**效果**：得到一块 200 × 52 pt 的绿色区域。加到页面上之后，手指在它上面松开，控制台输出 `点了 card`。

## 对应的 iOS API

`[[UIControl alloc] init]`。

## 参见

- [处理控件的触摸](../../guides/control-touches.md)：用 `UIControl` 做可点击的区域
- [`UIButton`](../ui-button.md)：自带文字和按下效果的控件
