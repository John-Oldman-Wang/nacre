---
type: reference
native: UILabel.minimumScaleFactor
---

# `UILabel`：`minimumScaleFactor` 属性

**`minimumScaleFactor`** 属性是自动缩小字号时，字号最小缩到原字号的多少。

## 值

数，0 到 1 的比例，没有单位。`0.5` 表示最小缩到一半。

- 可读，可写。
- 默认值是 `0`。
- 只在 [`adjustsFontSizeToFitWidth`](adjustsfontsizetofitwidth.md) 是 `true` 时起作用。
- 使用自动缩小时，把它明确设成一个大于 0 的值，给缩小设一个下限。

默认值和效果都**未在模拟器验证**。

### 写错时

写入的值按 `Number()` 转成数。转不成有限数的值（`'abc'`、`undefined`）抛 `TypeError`。

## 示例

```js
const label = new UILabel();
label.text = '一行放不下的标题文字';
label.adjustsFontSizeToFitWidth = true;
label.minimumScaleFactor = 0.5;
```

**效果**：放不下时字号最小缩到原来的一半，再放不下就截断。**未在模拟器验证。**

## 对应的 iOS API

`UILabel.minimumScaleFactor`。

## 参见

- [`adjustsFontSizeToFitWidth`](adjustsfontsizetofitwidth.md)
