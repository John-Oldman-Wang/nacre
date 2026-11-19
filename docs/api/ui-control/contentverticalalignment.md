---
type: reference
native: UIControl.contentVerticalAlignment
---

# `UIControl`：`contentVerticalAlignment` 属性

**`contentVerticalAlignment`** 属性决定控件的内容在控件范围内的垂直位置。内容指子类自己显示的东西，例如按钮的文字和图标、输入框的文字。

## 值

字符串，下面几个之一：

| 取值 | 效果 |
| --- | --- |
| `'center'` | 内容垂直居中 |
| `'top'` | 内容贴上边缘 |
| `'bottom'` | 内容贴下边缘 |
| `'fill'` | 内容在垂直方向拉伸到和控件一样高 |

- 可读，可写。
- 默认值是 `'center'`。**默认值未在模拟器验证。**
- 各取值的显示效果**未在模拟器验证**。
- 直接创建的 `UIControl` 自己不显示内容，这个属性对它没有可见效果。

### 怎么得知它变了

它变了不派发事件。只有 App 的代码会改它，不需要通知。

### 写错时

写入表里没有的值：不抛异常，属性保持原来的值，控制台输出一条警告：

```
[Nacre] contentVerticalAlignment has no value "middle"; expected one of: center / top / bottom / fill, ignored
```

## 示例

```js
const tall = UIButton.buttonWithType('system');
tall.setTitle('靠上的文字', { forState: ['normal'] });
tall.contentVerticalAlignment = 'top';
tall.frame = { x: 20, y: 100, width: 200, height: 120 };
```

**效果**：按钮高 120 pt，文字贴着按钮的上边缘。**未在模拟器验证。**

## 对应的 iOS API

`UIControl.contentVerticalAlignment`。`UIControlContentVerticalAlignmentTop` 写成 `'top'`，其余同理。

## 参见

- [`contentHorizontalAlignment`](contenthorizontalalignment.md)：水平方向
