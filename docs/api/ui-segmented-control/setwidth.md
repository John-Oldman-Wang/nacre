---
type: reference
native: "-[UISegmentedControl setWidth:forSegmentAtIndex:]"
---

# `UISegmentedControl`：`setWidth()` 方法

**`setWidth()`** 方法给某一段指定宽度。

## 语法

```
setWidth(width, { forSegmentAtIndex })
```

### 参数

**`width`**

这一段的宽度，单位 [pt](../units.md)。按数转换。0 表示自动：和别的段一起平分，或按 [`apportionsSegmentWidthsByContent`](apportionssegmentwidthsbycontent.md) 按内容分。

**`options.forSegmentAtIndex`**

第几段，从 0 数，必填。小数向零取整。必须小于 [`numberOfSegments`](numberofsegments.md)。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 没有传 `forSegmentAtIndex`：`setWidth needs { forSegmentAtIndex }`。
- 下标越界或是负数：`setWidth: segment 4 is out of range; expected 0 to 3`（段数是 4 时）。一段都没有时是 `setWidth: segment 0 is out of range; there are none`。
- `width` 转不出有限数：`setWidth must be a finite number, got "wide"`。

## 示例

```js
const seg = new UISegmentedControl(['日', '周', '月']);
seg.setWidth(120, { forSegmentAtIndex: 0 });
console.log(seg.widthForSegmentAtIndex(0));
```

**效果**：输出 `120`。第 0 段宽 120 pt，其余的段平分剩下的宽度。**屏幕上的宽度未在模拟器验证。**

## 对应的 iOS API

`-[UISegmentedControl setWidth:forSegmentAtIndex:]`。原生对越界的下标有的抛异常、有的不做任何事，这里一律抛 `TypeError`。

## 参见

- [`widthForSegmentAtIndex()`](widthforsegmentatindex.md)：读这一段的宽度
- [`apportionsSegmentWidthsByContent`](apportionssegmentwidthsbycontent.md)：各段按内容分宽度
