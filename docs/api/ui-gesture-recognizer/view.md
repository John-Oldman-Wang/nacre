---
type: reference
native: UIGestureRecognizer.view
---

# `UIGestureRecognizer`：`view` 属性

**`view`** 属性是识别器所在的视图。

## 值

[`UIView`](../ui-view.md) 或 `null`。

- 只读。给它赋值抛 `TypeError`。要把识别器加到视图上，用视图的 `addGestureRecognizer()`。
- 默认值是 `null`：识别器没有加到任何视图上。
- 一个识别器同一时刻只在一个视图上。加到另一个视图时，它自动从原来的视图上移除，`view` 变成新的视图。

### 怎么得知它变了

它变了不派发事件。只有 App 的代码调 `addGestureRecognizer()`、`removeGestureRecognizer()` 时它才变。

## 示例

```js
const card = new UIView();
const tap = new UITapGestureRecognizer();
console.log(tap.view);
card.addGestureRecognizer(tap);
console.log(tap.view === card);
```

**结果**：依次输出 `null` 和 `true`。

## 对应的 iOS API

`UIGestureRecognizer.view`。

## 参见

- [`UIView`](../ui-view.md)：`addGestureRecognizer()`、`removeGestureRecognizer()`、`gestureRecognizers`
