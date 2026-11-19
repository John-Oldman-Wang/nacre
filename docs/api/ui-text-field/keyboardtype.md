---
type: reference
native: UITextField.keyboardType
---

# `UITextField`：`keyboardType` 属性

**`keyboardType`** 属性决定用户点输入框时弹出哪种键盘。

## 值

字符串，下面 13 个之一：

| 取值 | 弹出的键盘 |
| --- | --- |
| `'default'` | 当前输入法的标准键盘 |
| `'asciiCapable'` | 只能输入英文字母、数字和符号的键盘 |
| `'numbersAndPunctuation'` | 标准键盘，打开时显示数字和标点那一页 |
| `'url'` | 输入网址用：有 `.`、`/`、`.com` 键，没有空格键 |
| `'numberPad'` | 只有 0 到 9 |
| `'phonePad'` | 电话拨号键盘：0 到 9、`*`、`#` |
| `'namePhonePad'` | 输入人名或电话号码用：字母键盘，可以切到拨号键盘 |
| `'emailAddress'` | 输入邮箱用：有 `@` 和 `.` 键 |
| `'decimalPad'` | 0 到 9 加一个小数点 |
| `'twitter'` | 标准键盘加上 `@` 和 `#` 键 |
| `'webSearch'` | 输入搜索词或网址用：有空格键和 `.` 键 |
| `'asciiCapableNumberPad'` | 只有 0 到 9，并且只输出 ASCII 数字 |
| `'alphabet'` | `'asciiCapable'` 的旧名字，效果相同 |

- 可读，可写。
- 默认值是 `'default'`。
- 各取值弹出的键盘**未在模拟器验证**。验收用例验证的是：每个取值能写入并读回，写错时属性保持原值并输出一条警告。
- 它只决定弹出哪种键盘，不校验内容。用户仍然可以粘贴别的字符进来，连着硬件键盘时也能打任何字符。需要校验时监听 [`beforeinput`](beforeinput-event.md)，或者在 `input` 里检查 `text`。
- `'numberPad'`、`'decimalPad'`、`'phonePad'` 这几种键盘上没有回车键，用户没法按回车收起键盘。**未在模拟器验证。** 要另外提供收起键盘的方式，见[收起键盘](../../guides/text-fields.md#收起键盘)。
- 没有变化事件：改它的只有 App 自己的代码。

### 写错时

写入不在取值表里的值：不抛异常，控制台输出一条警告，列出全部可用的值，属性保持原来的值。

```
[Nacre] keyboardType has no value "x"; expected one of: …, ignored
```

## 示例

```js
const field = new UITextField();
field.keyboardType = 'numberPad';
// @ts-expect-error 故意写错
field.keyboardType = 'numeric';
console.log(field.keyboardType);
```

**效果**

- 点输入框时弹出只有 0 到 9 的数字键盘。**未在模拟器验证。**
- 控制台先输出警告 `[Nacre] keyboardType has no value "numeric"; expected one of: …, ignored`，省略号处是 13 个可用的值。
- 接着输出 `numberPad`：写错的赋值没有生效。

## 对应的 iOS API

`UITextField.keyboardType`。`UIKeyboardTypeNumberPad` 写成 `'numberPad'`，其余同理。

## 参见

- [`returnKeyType`](returnkeytype.md)
- [枚举](../enums.md)
