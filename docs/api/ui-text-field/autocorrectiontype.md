---
type: reference
native: UITextField.autocorrectionType
---

# `UITextField`：`autocorrectionType` 属性

**`autocorrectionType`** 属性决定系统是否自动纠错。

## 值

字符串，下面几个之一：

| 取值 | 效果 |
| --- | --- |
| `'default'` | 由系统按输入的内容决定 |
| `'no'` | 不自动替换系统认为拼错的词 |
| `'yes'` | 自动替换 |

- 可读，可写。
- 默认值是 `'default'`。
- 各取值的效果**未在模拟器验证**。
- 没有变化事件：改它的只有 App 自己的代码。

### 写错时

写入不在取值表里的值：不抛异常，控制台输出一条警告，列出全部可用的值，属性保持原来的值。

```
[Nacre] autocorrectionType has no value "x"; expected one of: …, ignored
```

## 示例

```js
const field = new UITextField();
field.autocorrectionType = 'no';
```

**效果**：用户打什么就是什么，拼错的词不会被替换。**未在模拟器验证。**

## 对应的 iOS API

`UITextField.autocorrectionType`。`UITextAutocorrectionTypeNo` 写成 `'no'`，其余同理。

## 参见

- [`spellCheckingType`](spellcheckingtype.md)
