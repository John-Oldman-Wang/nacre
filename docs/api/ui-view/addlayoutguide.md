---
type: reference
native: "-[UIView addLayoutGuide:]"
---

# `UIView`：`addLayoutGuide()` 方法

**`addLayoutGuide()`** 方法把一个 layout guide 加到这个视图上。自己建的 layout guide 要先加到视图上，才能和它建约束。

## 语法

```
addLayoutGuide(guide)
```

### 参数

**`guide`**

一个 [`UILayoutGuide`](../ui-layout-guide.md)。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

参数不是 `UILayoutGuide`（包括 `null`）：`addLayoutGuide needs a UILayoutGuide`。

## 示例

```js
const card = new UIView();
const spacer = new UILayoutGuide();
card.addLayoutGuide(spacer);
```

**结果**：`spacer.owningView === card`，`card.layoutGuides` 里有它。

## 对应的 iOS API

`-[UIView addLayoutGuide:]`。

## 参见

- [`UILayoutGuide`](../ui-layout-guide.md)
- [`layoutGuides`](layoutguides.md)
