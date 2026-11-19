---
type: reference
native: UITextField.clearButtonMode
---

# `UITextField`：`clearButtonMode` 属性

**`clearButtonMode`** 属性决定框里右侧的清除按钮什么时候显示。清除按钮是一个圆形的 × 按钮，点它清空全部内容。

## 值

字符串，下面四个之一：

| 取值 | 清除按钮什么时候显示 |
| --- | --- |
| `'never'` | 不显示 |
| `'whileEditing'` | 正在输入并且有内容时 |
| `'unlessEditing'` | 没有在输入并且有内容时 |
| `'always'` | 有内容时一直显示 |

- 可读，可写。
- 默认值是 `'never'`。
- 各取值的效果**未在模拟器验证**。
- 用户点清除按钮之前派发 [`beforeclear`](beforeclear-event.md)，可以取消。
- 没有变化事件：改它的只有 App 自己的代码。

### 写错时

写入不在取值表里的值：不抛异常，控制台输出一条警告，列出全部可用的值，属性保持原来的值。

```
[Nacre] clearButtonMode has no value "x"; expected one of: …, ignored
```

## 示例

```js
const field = new UITextField();
field.clearButtonMode = 'whileEditing';
```

**效果**：输入框正在输入并且有内容时，右侧出现一个圆形的 × 按钮。点它清空全部内容。**未在模拟器验证。**

## 对应的 iOS API

`UITextField.clearButtonMode`。`UITextFieldViewModeWhileEditing` 写成 `'whileEditing'`，其余同理。

## 参见

- [`beforeclear`](beforeclear-event.md) 事件
- [`rightViewMode`](rightviewmode.md)：取值相同
