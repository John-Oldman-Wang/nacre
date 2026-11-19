---
type: reference
native: "-[UIStackView customSpacingAfterView:]"
---

# `UIStackView`：`customSpacingAfterView()` 方法

**`customSpacingAfterView()`** 方法返回某一个排列项后面单独设的间距。

## 语法

```
customSpacingAfterView(view)
```

### 参数

**`view`**

要查的排列项，`UIView`。

### 返回值

数（单位 [pt](../units.md)）、`'system'` 或 `'default'`。没有单独设过时是 `'default'`，表示这一项后面使用 [`spacing`](spacing.md) 属性的值。

### 异常

**`TypeError`**

`view` 不是视图，或者没传：`customSpacingAfterView needs a UIView`。

## 示例

```js
const red = new UIView();
const row = new UIStackView([red]);

const spacing = row.customSpacingAfterView(red);
if (spacing === 'default') {
  console.log('没有单独设过');
}
```

**结果**：输出 `没有单独设过`。

## 对应的 iOS API

`-[UIStackView customSpacingAfterView:]`。ObjC 返回 `UIStackViewSpacingUseDefault` 和 `UIStackViewSpacingUseSystem` 这两个常量的地方，这里返回 `'default'` 和 `'system'`。

## 参见

- [`setCustomSpacing()`](setcustomspacing.md)
