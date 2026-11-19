---
type: reference
native: "-[UIPanGestureRecognizer velocityInView:]"
---

# `UIPanGestureRecognizer`：`velocityInView()` 方法

**`velocityInView()`** 方法返回手指此刻移动的速度，换算到指定视图的坐标系里。

## 语法

```
velocityInView(view)
```

### 参数

**`view`**

[`UIView`](../ui-view.md) 或 `null`。`null` 表示窗口的坐标系。

### 返回值

[`CGPoint`](../structs.md)，横向和纵向各一个分量，单位是 pt 每秒。没有手势在进行时是 `(0, 0)`。

### 异常

**`TypeError`**

`view` 不是视图也不是 `null`。

## 说明

在 `ended` 的回调里调它读不到松手那一刻的速度：回调执行时手势已经结束。松手时的速度从 [`ended`](../ui-gesture-recognizer/ended-event.md) 事件对象的 `velocity` 读。

## 示例

```js
const card = new UIView();
const drag = new UIPanGestureRecognizer();
drag.addEventListener('changed', () => {
  const speed = drag.velocityInView(null);
  console.log(speed.x, speed.y);
});
card.addGestureRecognizer(drag);
```

**效果**：拖动 `card` 时，控制台输出手指在窗口坐标系里的速度。**未在模拟器验证。**

## 对应的 iOS API

`-[UIPanGestureRecognizer velocityInView:]`。

## 参见

- [`translationInView()`](translationinview.md)
- [`ended`](../ui-gesture-recognizer/ended-event.md)：事件对象上的 `velocity`
