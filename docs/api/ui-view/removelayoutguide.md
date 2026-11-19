---
type: reference
native: "-[UIView removeLayoutGuide:]"
---

# `UIView`：`removeLayoutGuide()` 方法

**`removeLayoutGuide()`** 方法把一个 layout guide 从这个视图上移除。

## 语法

```
removeLayoutGuide(guide)
```

### 参数

**`guide`**

一个 [`UILayoutGuide`](../ui-layout-guide.md)。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

参数不是 `UILayoutGuide`（包括 `null`）：`removeLayoutGuide needs a UILayoutGuide`。

## 示例

```js
const card = new UIView();
const spacer = new UILayoutGuide();
card.addLayoutGuide(spacer);
card.removeLayoutGuide(spacer);
```

**结果**：`card.layoutGuides` 里不再有它。**未在模拟器验证。**

## 对应的 iOS API

`-[UIView removeLayoutGuide:]`。

## 参见

- [`UILayoutGuide`](../ui-layout-guide.md)
- [`layoutGuides`](layoutguides.md)
