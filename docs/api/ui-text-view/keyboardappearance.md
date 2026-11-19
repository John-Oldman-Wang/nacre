---
type: reference
native: UITextView.keyboardAppearance
---

# `UITextView`：`keyboardAppearance` 属性

**`keyboardAppearance`** 属性决定键盘是浅色还是深色。

## 值

字符串，下面几个之一：

| 取值 | 效果 |
| --- | --- |
| `'default'` | 跟随系统 |
| `'light'` | 浅色 |
| `'dark'` | 深色 |
| `'alert'` | `'dark'` 的旧名字。写得进去，读出来是 `'dark'` |

- 可读，可写。
- 默认值是 `'default'`。

### 写错时

写入不在取值表里的值：不抛异常，控制台输出一条警告，列出全部可用的值，属性保持原来的值。

```
[Nacre] keyboardAppearance has no value "x"; expected one of: …, ignored
```
- 取值的效果**未在模拟器验证**。验收用例验证的是：能写入并读回，写错时属性保持原值并输出一条警告。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const input = new UITextView();
input.keyboardAppearance = 'dark';
```

**效果**：键盘一直是深色的。**未在模拟器验证。**

## 对应的 iOS API

`UITextView.keyboardAppearance`。`UIKeyboardAppearanceDark` 写成 `'dark'`。

## 参见

- [`UITextField` 的 `keyboardAppearance`](../ui-text-field/keyboardappearance.md)：单行输入框上的同名属性
