---
type: reference
native: UIView.gestureRecognizers
---

# `UIView`：`gestureRecognizers` 属性

**`gestureRecognizers`** 属性是视图上的全部手势识别器。

## 值

[`UIGestureRecognizer`](../ui-gesture-recognizer.md) 的只读数组。

- 只读。给它赋值抛 `TypeError`。
- 没有时是空数组。
- 每次读得到一个新数组，里面的对象是同一批。
- 系统自己加在视图上的识别器也在里面。

## 示例

```js
const card = new UIView();
const tap = new UITapGestureRecognizer();
card.addGestureRecognizer(tap);
console.log(card.gestureRecognizers.includes(tap));
```

**结果**：输出 `true`。

## 对应的 iOS API

`UIView.gestureRecognizers`。

## 参见

- [`addGestureRecognizer()`](addgesturerecognizer.md)
