---
type: reference
native: UILabel.adjustsFontSizeToFitWidth
---

# `UILabel`：`adjustsFontSizeToFitWidth` 属性

**`adjustsFontSizeToFitWidth`** 属性决定文字放不下时是否缩小字号。

## 值

布尔。

- 可读，可写。
- 默认值是 `false`。
- `true`：文字放不下时缩小字号，直到放得下，或者达到 [`minimumScaleFactor`](minimumscalefactor.md) 的下限。缩到下限仍然放不下，再按 [`lineBreakMode`](linebreakmode.md) 截断。
- `false`：字号不变，放不下就按 `lineBreakMode` 处理。
- 缩小之后，[`font`](font.md) 读出来的仍然是原来的字体。

默认值和效果都**未在模拟器验证**。

## 示例

```js
const label = new UILabel();
label.text = '¥ 1,234,567.89';
label.numberOfLines = 1;
label.adjustsFontSizeToFitWidth = true;
label.minimumScaleFactor = 0.5;
```

**效果**：文字放得下时按原字号显示。放不下时字号自动缩小，直到整行放得下，最小缩到原字号的一半。**未在模拟器验证。**

## 对应的 iOS API

`UILabel.adjustsFontSizeToFitWidth`。

## 参见

- [`minimumScaleFactor`](minimumscalefactor.md)、[`baselineAdjustment`](baselineadjustment.md)
