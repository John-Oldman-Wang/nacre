---
type: reference
native: "-[UIView setContentHuggingPriority:forAxis:]"
---

# `UIView`：`setContentHuggingPriority()` 方法

**`setContentHuggingPriority()`** 方法设视图在一个方向上「不愿被拉得比固有大小大」的优先级（内容抱紧优先级）。

## 语法

```
setContentHuggingPriority(priority, { forAxis })
```

### 参数

**`priority`**

数（1 到 1000，没有单位），或者优先级的名字：`'required'`（1000）、`'defaultHigh'`（750）、`'dragThatCanResizeScene'`（510）、`'sceneSizeStayPut'`（500）、`'dragThatCannotResizeScene'`（490）、`'defaultLow'`（250）、`'fittingSizeLevel'`（50）。读出来永远是数。

**`options.forAxis`**

`'horizontal'`（水平方向，影响宽度）或 `'vertical'`（垂直方向，影响高度）。必填。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 没传 `forAxis`：`setContentHuggingPriority needs { forAxis }`。
- 方向写错：`forAxis has no value "diagonal"; expected one of: horizontal / vertical`。
- 优先级的名字写错：`priority has no value "veryImportant"; expected one of: …`。

## 说明

空间有多余时，抱紧优先级**最低**的那个视图被拉大，占掉多余的空间。多余或不足的空间不按比例分摊，全部由优先级最低的那一个视图承担。两个视图的优先级相等时，系统不知道该动哪一个，这是约束不够，所以并排放两个标签时要把其中一个的优先级改掉。没有固有大小的视图，这个优先级不起作用。谁被拉大、谁被压小的效果**未在模拟器验证**。

## 示例

```js
const caption = new UILabel();
caption.text = '账户余额';
const amount = new UILabel();
amount.text = '128.00';
const line = new UIStackView([caption, amount]);

amount.setContentHuggingPriority('defaultHigh', { forAxis: 'horizontal' });
console.log(amount.contentHuggingPriorityForAxis('horizontal'));
```

**效果**：`amount` 更坚持自己的宽度，多出来的宽度都给 `caption`：「128.00」贴着这一行的右端，「账户余额」占满左边其余的宽度（**未在模拟器验证**）。控制台输出 `750`。

## 对应的 iOS API

`-[UIView setContentHuggingPriority:forAxis:]`。`[v setContentHuggingPriority:UILayoutPriorityDefaultLow forAxis:UILayoutConstraintAxisHorizontal]` 写成 `v.setContentHuggingPriority('defaultLow', { forAxis: 'horizontal' })`。

## 参见

- [`contentHuggingPriorityForAxis()`](contenthuggingpriorityforaxis.md)
- [内容抱紧和抗压缩](../auto-layout.md#内容抱紧和抗压缩)
- [一个视图按内容大小，另一个占满剩余空间](../../guides/auto-layout.md#一个视图按内容大小另一个占满剩余空间)
