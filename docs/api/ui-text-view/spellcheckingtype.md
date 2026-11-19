---
type: reference
native: UITextView.spellCheckingType
---

# `UITextView`：`spellCheckingType` 属性

**`spellCheckingType`** 属性决定系统是否检查拼写。

## 值

字符串，下面几个之一：

| 取值 | 效果 |
| --- | --- |
| `'default'` | 由系统决定 |
| `'no'` | 不在拼错的词下面画红线 |
| `'yes'` | 画红线 |

- 可读，可写。
- 默认值是 `'default'`。

### 写错时

写入不在取值表里的值：不抛异常，控制台输出一条警告，列出全部可用的值，属性保持原来的值。

```
[Nacre] spellCheckingType has no value "x"; expected one of: …, ignored
```
- 取值的效果**未在模拟器验证**。验收用例验证的是：能写入并读回，写错时属性保持原值并输出一条警告。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const input = new UITextView();
input.spellCheckingType = 'no';
```

**效果**：拼错的词下面不画红线。**未在模拟器验证。**

## 对应的 iOS API

`UITextView.spellCheckingType`。`UITextSpellCheckingTypeNo` 写成 `'no'`，其余同理。

## 参见

- [`UITextField` 的 `spellCheckingType`](../ui-text-field/spellcheckingtype.md)：单行输入框上的同名属性
