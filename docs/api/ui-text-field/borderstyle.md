---
type: reference
native: UITextField.borderStyle
---

# `UITextField`：`borderStyle` 属性

**`borderStyle`** 属性决定输入框边框的样子。

## 值

字符串，下面四个之一：

| 取值 | 效果 |
| --- | --- |
| `'none'` | 没有边框，没有底色。文字紧贴输入框的左边 |
| `'line'` | 一圈细的直角线框 |
| `'bezel'` | 一圈带内凹效果的直角边框 |
| `'roundedRect'` | 圆角矩形边框，带底色，文字左右有内边距。系统标准的输入框样子 |

- 可读，可写。
- 默认值是 `'none'`。
- 各取值画出来的样子**未在模拟器验证**。
- 四种以外的外观，把输入框放进一个容器，边框、底色、圆角设在容器上，见[自己画边框和底色](../../guides/text-fields.md#自己画边框和底色)。
- 没有变化事件：改它的只有 App 自己的代码。

### 写错时

写入不在取值表里的值：不抛异常，控制台输出一条警告，列出全部可用的值，属性保持原来的值。

```
[Nacre] borderStyle has no value "x"; expected one of: …, ignored
```

## 示例

```js
const field = new UITextField();
field.borderStyle = 'roundedRect';
```

**效果**：输入框有一圈圆角边框，文字左右有间距。

## 对应的 iOS API

`UITextField.borderStyle`。`UITextBorderStyleRoundedRect` 写成 `'roundedRect'`，其余同理。

## 参见

- [`background`](background.md)
