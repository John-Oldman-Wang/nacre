---
type: reference
native: "-[UIGestureRecognizer removeTarget:action:]"
---

# `UIGestureRecognizer`：`removeEventListener()` 方法

**`removeEventListener()`** 方法移除用 [`addEventListener()`](addeventlistener.md) 注册的一个回调。

## 语法

```
removeEventListener(type, callback)
```

### 参数

**`type`**

注册时的事件名。

**`callback`**

注册时的那个函数。必须是同一个函数对象。

### 返回值

无（`undefined`）。

### 异常

无。没有注册过的事件名和函数，什么都不做。

## 说明

它只取消一个监听器，识别器还在视图上，照常识别手势。要把识别器从视图上拿掉，用视图的 `removeGestureRecognizer()`，见 [`UIView`](../ui-view.md)。

## 示例

```js
const card = new UIView();
const tap = new UITapGestureRecognizer();
/** @param {Event} e */
function onTap(e) {
  console.log('点了');
}
tap.addEventListener('ended', onTap);
card.addGestureRecognizer(tap);

tap.removeEventListener('ended', onTap);
card.removeGestureRecognizer(tap);
console.log(tap.view);
```

**结果**：控制台输出 `null`。识别器已经不在任何视图上，点 `card` 不再触发它。识别器对象还能用，可以再加到别的视图上。

## 对应的 iOS API

`-[UIGestureRecognizer removeTarget:action:]`。

## 参见

- [`addEventListener()`](addeventlistener.md)
