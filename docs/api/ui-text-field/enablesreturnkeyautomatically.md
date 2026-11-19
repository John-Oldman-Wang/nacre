---
type: reference
native: UITextField.enablesReturnKeyAutomatically
---

# `UITextField`：`enablesReturnKeyAutomatically` 属性

**`enablesReturnKeyAutomatically`** 属性表示没有内容时回车键是否变灰、不能按。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 没有内容时回车键变灰、不能按。打了字之后自动变成可按 |
| `false` | 回车键一直能按 |

- 可读，可写。
- 默认值是 `false`。
- 两种取值的效果**未在模拟器验证**。
- 写别的类型的值时按真假转成布尔：`0` 是 `false`，`'false'` 是 `true`。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const field = new UITextField();
field.enablesReturnKeyAutomatically = true;
```

**效果**：框里没有内容时回车键是灰色，按不动。**未在模拟器验证。**

## 对应的 iOS API

`UITextField.enablesReturnKeyAutomatically`。

## 参见

- [`returnKeyType`](returnkeytype.md)
