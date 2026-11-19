---
type: reference
native: UIButton.buttonType
---

# `UIButton`：`buttonType` 属性

**`buttonType`** 属性是按钮的类型。它在创建按钮时确定，之后不变。

## 值

字符串，取值见 [`buttonWithType()`](buttonwithtype.md#参数)。

- 只读。给它赋值抛 `TypeError`。
- `buttonWithType('system')` 创建的按钮读出 `'system'`；`new UIButton()` 创建的读出 `'custom'`（**未在模拟器验证**）。

## 示例

```js
const button = UIButton.buttonWithType('system');
console.log(button.buttonType);
```

**结果**：输出 `system`。

## 对应的 iOS API

`UIButton.buttonType`。

## 参见

- [`UIButton.buttonWithType()`](buttonwithtype.md)
