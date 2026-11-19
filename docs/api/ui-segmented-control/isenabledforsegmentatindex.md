---
type: reference
native: "-[UISegmentedControl isEnabledForSegmentAtIndex:]"
---

# `UISegmentedControl`：`isEnabledForSegmentAtIndex()` 方法

**`isEnabledForSegmentAtIndex()`** 方法返回某一段是否可以点。

## 语法

```
isEnabledForSegmentAtIndex(index)
```

### 参数

**`index`**

第几段，从 0 数。小数向零取整。必须小于 [`numberOfSegments`](numberofsegments.md)。

### 返回值

布尔值。`true`：可以点。`false`：用 [`setEnabled()`](setenabled.md) 禁用过。默认每一段都是 `true`。它不反映整个控件的 [`isEnabled`](../ui-control/isenabled.md)。**整个控件禁用时它返回什么未在模拟器验证。**

### 异常

**`TypeError`**

- 下标越界或是负数：`isEnabledForSegmentAtIndex: segment 4 is out of range; expected 0 to 3`（段数是 4 时）。一段都没有时是 `isEnabledForSegmentAtIndex: segment 0 is out of range; there are none`。
- 下标转不出有限数：`isEnabledForSegmentAtIndex must be a finite number, got "first"`。

## 示例

```js
const seg = new UISegmentedControl(['日', '周']);
seg.setEnabled(false, { forSegmentAtIndex: 0 });
console.log(seg.isEnabledForSegmentAtIndex(0), seg.isEnabledForSegmentAtIndex(1));
```

**结果**：输出 `false true`。

## 对应的 iOS API

`-[UISegmentedControl isEnabledForSegmentAtIndex:]`。原生对越界的下标不一定报错，这里一律抛 `TypeError`。

## 参见

- [`setEnabled()`](setenabled.md)
