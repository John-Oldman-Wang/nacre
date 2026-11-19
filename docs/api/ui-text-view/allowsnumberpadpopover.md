---
type: reference
native: UITextView.allowsNumberPadPopover
---

# `UITextView`：`allowsNumberPadPopover` 属性

**`allowsNumberPadPopover`** 属性表示数字键盘是否可以用浮在旁边的小面板显示。Apple 的文档里这个属性用于 iPad。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 允许用浮层显示数字键盘 |
| `false` | 不允许 |

- 可读，可写。
- 这个属性是按 iOS 的头文件补上的。验收用例验证过它读得出来、类型对、写回原值读到的不变；默认值和各取值的效果**未在模拟器验证**，用法照 Apple 的文档。
- 写别的类型的值时按真假转成布尔：`0` 是 `false`，`'false'` 是 `true`。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const input = new UITextView();
input.allowsNumberPadPopover = true;
console.log(input.allowsNumberPadPopover);
```

**效果**：控制台输出 `true`。允许用浮层显示数字键盘，**未在模拟器验证**。

## 对应的 iOS API

`UITextView.allowsNumberPadPopover`。
