---
type: reference
native: UILongPressGestureRecognizer.numberOfTapsRequired
---

# `UILongPressGestureRecognizer`：`numberOfTapsRequired` 属性

**`numberOfTapsRequired`** 属性是按住之前要先完整地点几下。

## 值

数，单位是次。

- 可读，可写。
- 默认值是 `0`：直接按住就行。设成 `1` 是「点一下，再按住」。

### 怎么得知它变了

它变了不派发事件。只有 App 的代码会改它，不需要通知。

### 写错时

- 负数：抛 `TypeError: numberOfTapsRequired must be a non-negative integer`。
- 转不成数的值（`undefined`、`'abc'`、`NaN`）：抛 `TypeError: numberOfTapsRequired must be a finite number, got "abc"`。
- 小数去掉小数部分：写 `2.9` 读回 `2`。数字字符串按数用。
- 出错时属性保持原来的值。

## 示例

```js
const press = new UILongPressGestureRecognizer();
press.numberOfTapsRequired = 1;
```

**效果**：先点一下，紧接着再按住 0.5 秒，才派发 `began`。**未在模拟器验证。**

## 对应的 iOS API

`UILongPressGestureRecognizer.numberOfTapsRequired`。

## 参见

- [`numberOfTouchesRequired`](numberoftouchesrequired.md)
