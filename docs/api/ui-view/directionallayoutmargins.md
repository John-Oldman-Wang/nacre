---
type: reference
native: UIView.directionalLayoutMargins
---

# `UIView`：`directionalLayoutMargins` 属性

**`directionalLayoutMargins`** 属性是视图的[内边距](../ui-view.md#内边距)：内容应该离视图的四条边多远。左右按文字方向区分。

## 值

[`NSDirectionalEdgeInsets`](../ns-directional-edge-insets.md)，单位 [pt](../units.md)。字段是 `top`、`leading`、`bottom`、`trailing`。

- 可读，可写。
- 默认值是 `(8, 8, 8, 8)`。
- `leading` 是文字开始的一侧，`trailing` 是文字结束的一侧。中文和英文里 `leading` 在左。
- 它和 [`layoutMargins`](layoutmargins.md) 是同一份数据，写其中一个，另一个跟着变。优先用这一个，界面在从右往左的语言里会自动左右对调。
- 它不会自动缩进子视图。用到它的只有两处：对齐 [`layoutMarginsGuide`](layoutmarginsguide.md) 的约束，以及开了 `isLayoutMarginsRelativeArrangement` 的 [`UIStackView`](../ui-stack-view.md)。
- 读出来的值不一定等于写进去的：[`insetsLayoutMarginsFromSafeArea`](insetslayoutmarginsfromsafearea.md) 是 `true`（默认）时，视图伸到安全区外面的那几条边，系统把安全区加上去。写 16 pt、上方的安全区是 68 pt，读出来的上边距是 84 pt。
- 页面的根视图有系统规定的最小边距，写入的值小于最小值时读出来是最小值。**未在模拟器验证。** 这个限制现在关不掉。
- 写入时可以给 `NSDirectionalEdgeInsets`，也可以给四个字段齐全的普通对象。读出来的结构体字段只读，每次读得到一个新对象，见[结构体](../structs.md)。
- 没有变化通知。系统改动它的情况有两种：安全区变了，或者开了 [`preservesSuperviewLayoutMargins`](preservessuperviewlayoutmargins.md) 而父视图的内边距变了。现在没有办法得知这两种变化。

### 写错时

- 给的不是对象：抛 `TypeError: directionalLayoutMargins needs an object with all of: top, leading, bottom, trailing`。
- 缺字段，或字段转不出有限的数：抛 `TypeError: directionalLayoutMargins is missing …, or it is not a finite number`，中间是缺的字段名。
- 出错时属性保持原值。字段的值按 `Number()` 转换，所以 `'10'` 可以。

## 示例

```js
const box = new UIView();
box.directionalLayoutMargins = new NSDirectionalEdgeInsets(1, 2, 3, 4);
console.log(String(box.layoutMargins));

box.directionalLayoutMargins = { top: 12, leading: 20, bottom: 12, trailing: 20 };
console.log(String(box.directionalLayoutMargins));
```

**结果**：语言是从左往右时，依次输出 `UIEdgeInsets(1, 2, 3, 4)` 和 `NSDirectionalEdgeInsets(12, 20, 12, 20)`。

## 对应的 iOS API

`UIView.directionalLayoutMargins`。`NSDirectionalEdgeInsetsMake(8, 16, 8, 16)` 写成 `new NSDirectionalEdgeInsets(8, 16, 8, 16)`。

## 参见

- [`layoutMargins`](layoutmargins.md)、[`layoutMarginsGuide`](layoutmarginsguide.md)
- [给视图设内边距](../../guides/views.md#给视图设内边距)
- [内边距](../ui-view.md#内边距)
