---
type: reference
native: "-[UIView resizableSnapshotViewFromRect:afterScreenUpdates:withCapInsets:]"
---

# `UIView`：`resizableSnapshotViewFromRect()` 方法

**`resizableSnapshotViewFromRect()`** 方法给视图里的一块矩形拍快照，返回一个可以拉伸的快照视图：四周 `withCapInsets` 给出的那一圈拉伸时保持不变，只拉伸中间。

## 语法

```
resizableSnapshotViewFromRect(rect, { afterScreenUpdates, withCapInsets })
```

### 参数

**`rect`**

要拍的矩形，[`CGRect`](../cg-rect.md) 或 `{ x, y, width, height }`，在视图自己的坐标系里，单位 [pt](../units.md)。

**`options.afterScreenUpdates`**

布尔，必填。含义同 [`snapshotViewAfterScreenUpdates()`](snapshotviewafterscreenupdates.md)。

**`options.withCapInsets`**

[`UIEdgeInsets`](../ui-edge-insets.md) 或四个字段齐全的普通对象，必填。拉伸时四周保持不变的宽度，单位 pt。

### 返回值

新的 `UIView`，或者 `null`（拍不出来时）。

### 异常

**`TypeError`**

- 没传 `afterScreenUpdates`：`resizableSnapshotViewFromRect needs { afterScreenUpdates }`。
- 没传 `withCapInsets`：`resizableSnapshotViewFromRect needs { withCapInsets }`。
- `rect` 或 `withCapInsets` 不是对象或缺字段，规则和[结构体](../structs.md#写入时可以给普通对象)相同。

## 说明

这个方法是后补的，没有在模拟器上调过，效果**未在模拟器验证**。

## 示例

```js
const card = new UIView();
card.frame = new CGRect(0, 0, 200, 120);

const copy = card.resizableSnapshotViewFromRect(card.bounds, {
  afterScreenUpdates: false,
  withCapInsets: new UIEdgeInsets(12, 12, 12, 12),
});
```

**效果**：`copy` 拉伸时四周 12 pt 保持不变。**未在模拟器验证。**

## 对应的 iOS API

`-[UIView resizableSnapshotViewFromRect:afterScreenUpdates:withCapInsets:]`。后两段写成 options 的键。

## 参见

- [`snapshotViewAfterScreenUpdates()`](snapshotviewafterscreenupdates.md)
