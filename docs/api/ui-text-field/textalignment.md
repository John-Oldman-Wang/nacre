---
type: reference
native: UITextField.textAlignment
---

# `UITextField`：`textAlignment` 属性

**`textAlignment`** 属性决定文字在框里的水平对齐。

## 值

字符串，下面几个之一：

| 取值 | 效果 |
| --- | --- |
| `'left'` | 靠左 |
| `'center'` | 居中 |
| `'right'` | 靠右 |
| `'justified'` | 两端对齐 |
| `'natural'` | 跟随语言的书写方向：中文和英文靠左，阿拉伯文靠右 |

- 可读，可写。
- 默认值**未在模拟器验证**。
- 各取值的效果**未在模拟器验证**。
- 没有变化事件：改它的只有 App 自己的代码。

### 写错时

写入不在取值表里的值：不抛异常，控制台输出一条警告，列出全部可用的值，属性保持原来的值。

```
[Nacre] textAlignment has no value "x"; expected one of: …, ignored
```

## 示例

```js
const field = new UITextField();
field.textAlignment = 'center';
```

**效果**：框里的文字水平居中。**未在模拟器验证。**

## 对应的 iOS API

`UITextField.textAlignment`。`NSTextAlignmentCenter` 写成 `'center'`，其余同理。

## 参见

- [`font`](font.md)
