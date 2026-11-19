---
type: reference
native: UITapGestureRecognizer.numberOfTapsRequired
---

# `UITapGestureRecognizer`：`numberOfTapsRequired` 属性

**`numberOfTapsRequired`** 属性是要连点几下才算一次点按。

## 值

数，单位是次。

- 可读，可写。
- 默认值是 `1`。设成 `2` 是双击。

### 怎么得知它变了

它变了不派发事件。只有 App 的代码会改它，不需要通知。

### 写错时

- 负数：抛 `TypeError: numberOfTapsRequired must be a non-negative integer`。
- 转不成数的值（`undefined`、`'abc'`、`NaN`）：抛 `TypeError: numberOfTapsRequired must be a finite number, got "abc"`。
- 小数去掉小数部分：写 `2.9` 读回 `2`。数字字符串按数用。
- 出错时属性保持原来的值。

## 示例

```js
const card = new UIView();
const doubleTap = new UITapGestureRecognizer();
doubleTap.numberOfTapsRequired = 2;
doubleTap.addEventListener('ended', () => {
  console.log('双击');
});
card.addGestureRecognizer(doubleTap);
```

**效果**：快速连点两下 `card`，输出 `双击`。**未在模拟器验证。**

## 对应的 iOS API

`UITapGestureRecognizer.numberOfTapsRequired`。

## 参见

- [`requireGestureRecognizerToFail()`](../ui-gesture-recognizer/requiregesturerecognizertofail.md)：让单击等双击失败
