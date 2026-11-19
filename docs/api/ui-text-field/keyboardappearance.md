---
type: reference
native: UITextField.keyboardAppearance
---

# `UITextField`：`keyboardAppearance` 属性

**`keyboardAppearance`** 属性决定键盘是浅色还是深色。

## 值

字符串，下面几个之一：

| 取值 | 效果 |
| --- | --- |
| `'default'` | 跟随系统当前的浅色或深色外观 |
| `'light'` | 一直是浅色键盘 |
| `'dark'` | 一直是深色键盘 |
| `'alert'` | `'dark'` 的旧名字，效果相同。写得进去，读出来是 `'dark'` |

- 可读，可写。
- 默认值是 `'default'`。**未在模拟器验证。**
- 各取值的效果**未在模拟器验证**。
- 没有变化事件：改它的只有 App 自己的代码。

### 写错时

写入不在取值表里的值：不抛异常，控制台输出一条警告，列出全部可用的值，属性保持原来的值。

```
[Nacre] keyboardAppearance has no value "x"; expected one of: …, ignored
```

## 示例

```js
const field = new UITextField();
field.keyboardAppearance = 'alert';
console.log(field.keyboardAppearance);
```

**效果**：控制台输出 `dark`。键盘一直是深色的，**未在模拟器验证**。

## 对应的 iOS API

`UITextField.keyboardAppearance`。`UIKeyboardAppearanceDark` 写成 `'dark'`。

## 参见

- [`keyboardType`](keyboardtype.md)
