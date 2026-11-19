---
type: reference
native: "-[UIButton init]"
---

# `UIButton()` 构造函数

**`UIButton()`** 构造函数创建一个 `custom` 类型的按钮。系统不给 `custom` 按钮任何默认外观，文字颜色、按住时的样子都要自己设。

要系统外观的按钮，用 [`UIButton.buttonWithType('system')`](buttonwithtype.md)。

## 语法

```
new UIButton()
```

### 参数

无。

### 返回值

新建的 `UIButton`。它的 [`buttonType`](buttontype.md) 是 `'custom'`。**未在模拟器验证。**

新按钮没有文字、没有图标、宽高是 0 pt，加到页面上之前要先设内容和大小，见[新建的按钮为什么看不见](../../guides/buttons.md#新建的按钮为什么看不见)。

### 异常

无。

## 示例

```js
const button = new UIButton();
button.setTitle('自定义', { forState: ['normal'] });
button.setTitleColor('#007AFF', { forState: ['normal'] });
```

**效果**：得到一个文字是蓝色「自定义」的按钮。手指按住时外观不变。**未在模拟器验证。**

## 对应的 iOS API

`[[UIButton alloc] init]`，等同于 `[UIButton buttonWithType:UIButtonTypeCustom]`。

## 参见

- [`UIButton.buttonWithType()`](buttonwithtype.md)：创建系统外观的按钮
