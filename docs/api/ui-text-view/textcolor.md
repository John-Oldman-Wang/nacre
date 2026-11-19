---
type: reference
native: UITextView.textColor
---

# `UITextView`：`textColor` 属性

**`textColor`** 属性是文字的颜色。

## 值

[颜色](../ui-color.md)字符串，或者 `null`。

- 可读，可写。
- 默认值是 `'label'`。
- 写 `null` 之后读出来是 `null`。
- 取值在画面上的效果**未在模拟器验证**。
- 没有变化事件：改它的只有 App 自己的代码。

### 写错时

写入不认识的颜色字符串：不抛异常，控制台输出一条警告，保留原来的颜色，见[颜色](../ui-color.md#写错不抛打警告)。

## 示例

```js
const input = new UITextView();
input.textColor = 'systemBlue';
console.log(input.textColor);
```

**效果**：控制台输出 `systemBlue`。文字是蓝色。

## 对应的 iOS API

`UITextView.textColor`。`UIColor.labelColor` 写成 `'label'`。

## 参见

- [颜色](../ui-color.md)
