---
type: reference
native: UIControl.contentHorizontalAlignment
---

# `UIControl`：`contentHorizontalAlignment` 属性

**`contentHorizontalAlignment`** 属性决定控件的内容在控件范围内的水平位置。内容指子类自己显示的东西，例如按钮的文字和图标、输入框的文字。

## 值

字符串，下面几个之一：

| 取值 | 效果 |
| --- | --- |
| `'center'` | 内容水平居中 |
| `'left'` | 内容贴左边缘 |
| `'right'` | 内容贴右边缘 |
| `'fill'` | 内容在水平方向拉伸到和控件一样宽 |
| `'leading'` | 内容贴起始边缘。从左到右的语言里是左边，从右到左的语言（如阿拉伯语）里是右边 |
| `'trailing'` | 内容贴结束边缘。和 `'leading'` 相反 |

- 可读，可写。
- 默认值是 `'center'`。
- 各取值的显示效果**未在模拟器验证**。
- 直接创建的 `UIControl` 自己不显示内容，这个属性对它没有可见效果。用 `addSubview()` 加进去的子视图不受它影响，位置由约束决定。

### 怎么得知它变了

它变了不派发事件。只有 App 的代码会改它，不需要通知。

### 写错时

写入表里没有的值：不抛异常，属性保持原来的值，控制台输出一条警告：

```
[Nacre] contentHorizontalAlignment has no value "middle"; expected one of: center / left / right / fill / leading / trailing, ignored
```

## 示例

```js
const wide = UIButton.buttonWithType('system');
wide.setTitle('靠左的文字', { forState: ['normal'] });
wide.contentHorizontalAlignment = 'leading';
wide.frame = { x: 20, y: 100, width: 300, height: 44 };
```

**效果**：按钮宽 300 pt，文字贴着按钮的左边缘。不设这个属性时文字在按钮正中。**文字的位置未在模拟器验证。**

## 对应的 iOS API

`UIControl.contentHorizontalAlignment`。`UIControlContentHorizontalAlignmentLeading` 写成 `'leading'`，其余同理。

## 参见

- [`contentVerticalAlignment`](contentverticalalignment.md)：垂直方向
- [枚举](../enums.md)：属性写错时为什么是警告而不是抛异常
