---
type: reference
native: "-[UIView setContentCompressionResistancePriority:forAxis:]"
---

# `UIView`：`setContentCompressionResistancePriority()` 方法

**`setContentCompressionResistancePriority()`** 方法设视图在一个方向上「不愿被压得比固有大小小」的优先级（抗压缩优先级）。

## 语法

```
setContentCompressionResistancePriority(priority, { forAxis })
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

- 没传 `forAxis`：`setContentCompressionResistancePriority needs { forAxis }`。
- 方向写错：`forAxis has no value "diagonal"; expected one of: horizontal / vertical`。
- 优先级的名字写错：`priority has no value "veryImportant"; expected one of: …`。

## 说明

空间不够时，抗压缩优先级**最低**的那个视图被压小。文字标签被压小时，文字被截断。多余或不足的空间不按比例分摊，全部由优先级最低的那一个视图承担。两个视图的优先级相等时，系统不知道该动哪一个，这是约束不够，所以并排放两个标签时要把其中一个的优先级改掉。没有固有大小的视图，这个优先级不起作用。谁被拉大、谁被压小的效果**未在模拟器验证**。

## 示例

```js
const title = new UILabel();
const value = new UILabel();
value.setContentCompressionResistancePriority('required', { forAxis: 'horizontal' });
console.log(value.contentCompressionResistancePriorityForAxis('horizontal'));
```

**效果**：空间不够时先压 `title`，`value` 完整显示（**未在模拟器验证**）。控制台输出 `1000`。

## 对应的 iOS API

`-[UIView setContentCompressionResistancePriority:forAxis:]`。`[v setContentCompressionResistancePriority:UILayoutPriorityDefaultLow forAxis:UILayoutConstraintAxisHorizontal]` 写成 `v.setContentCompressionResistancePriority('defaultLow', { forAxis: 'horizontal' })`。

## 参见

- [`contentCompressionResistancePriorityForAxis()`](contentcompressionresistancepriorityforaxis.md)
- [内容抱紧和抗压缩](../auto-layout.md#内容抱紧和抗压缩)
- [一个视图按内容大小，另一个占满剩余空间](../../guides/auto-layout.md#一个视图按内容大小另一个占满剩余空间)
