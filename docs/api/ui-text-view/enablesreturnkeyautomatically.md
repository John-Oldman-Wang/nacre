---
type: reference
native: UITextView.enablesReturnKeyAutomatically
---

# `UITextView`：`enablesReturnKeyAutomatically` 属性

**`enablesReturnKeyAutomatically`** 属性表示没有内容时回车键是否变灰、不能按。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 没有内容时回车键变灰、不能按 |
| `false` | 回车键一直能按 |

- 可读，可写。
- 默认值是 `false`。
- 写别的类型的值时按真假转成布尔：`0` 是 `false`，`'false'` 是 `true`。
- 取值的效果**未在模拟器验证**。验收用例验证的是：能写入并读回，写错时属性保持原值并输出一条警告。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const input = new UITextView();
input.enablesReturnKeyAutomatically = true;
```

**效果**：没有内容时回车键是灰的。**未在模拟器验证。**

## 对应的 iOS API

`UITextView.enablesReturnKeyAutomatically`。

## 参见

- [`UITextField` 的 `enablesReturnKeyAutomatically`](../ui-text-field/enablesreturnkeyautomatically.md)：单行输入框上的同名属性
