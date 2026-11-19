---
type: reference
native: "-[UISegmentedControl setEnabled:forSegmentAtIndex:]"
---

# `UISegmentedControl`：`setEnabled()` 方法

**`setEnabled()`** 方法单独禁用或启用某一段。要整个控件都不能点，写继承来的 [`isEnabled`](../ui-control/isenabled.md)。

## 语法

```
setEnabled(enabled, { forSegmentAtIndex })
```

### 参数

**`enabled`**

布尔值，按 JS 的真假值转换。`true`：这一段可以点。`false`：这一段变淡，点它没有反应，其余的段照常。

**`options.forSegmentAtIndex`**

第几段，从 0 数，必填。小数向零取整。必须小于 [`numberOfSegments`](numberofsegments.md)。

### 返回值

无（`undefined`）。

默认每一段都可以点。

### 异常

**`TypeError`**

- 没有传 `forSegmentAtIndex`：`setEnabled needs { forSegmentAtIndex }`。
- 下标越界或是负数：`setEnabled: segment 4 is out of range; expected 0 to 3`（段数是 4 时）。一段都没有时是 `setEnabled: segment 0 is out of range; there are none`。

## 示例

```js
const seg = new UISegmentedControl(['日', '周', '月']);
seg.setEnabled(false, { forSegmentAtIndex: 2 });
console.log(seg.isEnabledForSegmentAtIndex(2), seg.isEnabledForSegmentAtIndex(1));
```

**效果**：输出 `false true`。第 2 段变淡，点它没有反应。**变淡和点击没有反应未在模拟器验证。**

## 对应的 iOS API

`-[UISegmentedControl setEnabled:forSegmentAtIndex:]`。原生对越界的下标有的抛异常、有的不做任何事，这里一律抛 `TypeError`。

## 参见

- [`isEnabledForSegmentAtIndex()`](isenabledforsegmentatindex.md)：读这一段是否可点
- [`isEnabled`](../ui-control/isenabled.md)：禁用整个控件
