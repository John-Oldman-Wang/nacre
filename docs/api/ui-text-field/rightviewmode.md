---
type: reference
native: UITextField.rightViewMode
---

# `UITextField`：`rightViewMode` 属性

**`rightViewMode`** 属性决定[`rightView`](rightview.md)什么时候显示。

## 值

字符串，下面四个之一：

| 取值 | 什么时候显示 |
| --- | --- |
| `'never'` | 不显示 |
| `'whileEditing'` | 正在输入时 |
| `'unlessEditing'` | 没有在输入时 |
| `'always'` | 一直显示 |

- 可读，可写。
- 写进去读得回来。**未在模拟器验证。**
- 这个属性是按 iOS 的头文件补上的。验收用例验证过它读得出来、类型对、写回原值读到的不变；默认值和各取值的效果**未在模拟器验证**，用法照 Apple 的文档。
- 取值和 [`clearButtonMode`](clearbuttonmode.md) 相同。
- 没有变化事件：改它的只有 App 自己的代码。

### 写错时

写入不在取值表里的值：不抛异常，控制台输出一条警告，列出全部可用的值，属性保持原来的值。

```
[Nacre] rightViewMode has no value "x"; expected one of: …, ignored
```

## 示例

```js
const field = new UITextField();
field.rightView = new UIView();
field.rightViewMode = 'whileEditing';
console.log(field.rightViewMode);
```

**结果**：控制台输出 `whileEditing`。正在输入时框里右端显示这个视图，**未在模拟器验证**。

## 对应的 iOS API

`UITextField.rightViewMode`。`UITextFieldViewModeAlways` 写成 `'always'`，其余同理。

## 参见

- [`rightView`](rightview.md)
