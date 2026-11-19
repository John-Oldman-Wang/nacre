---
type: reference
native: "-[UIView endEditing:]"
---

# `UIView`：`endEditing()` 方法

**`endEditing()`** 方法让这个视图和它的后代里正在输入的那个输入框失去焦点，键盘随之收起。

## 语法

```
endEditing([force])
```

### 参数

**`force`**

布尔，可省略，省略时是 `false`。`false`：输入框可以拒绝失去焦点。`true`：强制失去焦点。

### 返回值

布尔。`true` 表示输入框已经失去焦点。

### 异常

无。

## 示例

```js
const page = new UIView();
const field = new UITextField();
page.addSubview(field);
field.becomeFirstResponder();
page.endEditing(true);
```

**效果**：输入框失去焦点，键盘收起。

## 对应的 iOS API

`-[UIView endEditing:]`。

## 参见

- [输入框和键盘](../ui-text-field.md)
- `becomeFirstResponder()`、`resignFirstResponder()`、`isFirstResponder`、`canBecomeFirstResponder` 继承自 `UIResponder`，说明见[输入框和键盘](../ui-text-field.md)
