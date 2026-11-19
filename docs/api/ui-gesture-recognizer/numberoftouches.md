---
type: reference
native: UIGestureRecognizer.numberOfTouches
---

# `UIGestureRecognizer`：`numberOfTouches` 属性

**`numberOfTouches`** 属性是这一刻参与手势的手指个数。

## 值

数，单位是根。

- 只读。给它赋值抛 `TypeError`。
- 默认值是 `0`：没有手指按着。
- 回调里读到的是回调执行那一刻的值。事件发生那一刻的手指个数在事件对象的 `numberOfTouches` 上，见[事件](../ui-gesture-recognizer.md#事件)。

### 怎么得知它变了

它变了不派发事件。手势进行中手指的变化随 [`changed`](changed-event.md) 事件送到。

## 示例

```js
const tap = new UITapGestureRecognizer();
console.log(tap.numberOfTouches);
```

**结果**：输出 `0`。

## 对应的 iOS API

`UIGestureRecognizer.numberOfTouches`。

## 参见

- [`ended`](ended-event.md)：事件对象上的 `numberOfTouches`
