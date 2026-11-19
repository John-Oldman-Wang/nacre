---
type: reference
native: UITextField.allowsNumberPadPopover
---

# `UITextField`：`allowsNumberPadPopover` 属性

**`allowsNumberPadPopover`** 属性表示数字键盘是否可以用浮在输入框旁边的小面板显示。

## 值

布尔。

- 可读，可写。
- Apple 的文档里这个属性用于 iPad。Nacre 只支持 iPhone，在 iPhone 上有没有效果**未在模拟器验证**。
- 这个属性是按 iOS 的头文件补上的。验收用例验证过它读得出来、类型对、写回原值读到的不变；默认值和各取值的效果**未在模拟器验证**，用法照 Apple 的文档。
- 写别的类型的值时按真假转成布尔：`0` 是 `false`，`'false'` 是 `true`。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const field = new UITextField();
field.allowsNumberPadPopover = false;
console.log(field.allowsNumberPadPopover);
```

**结果**：输出 `false`。

## 对应的 iOS API

`UITextField.allowsNumberPadPopover`。

## 参见

- [`keyboardType`](keyboardtype.md)
