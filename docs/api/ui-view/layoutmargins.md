---
type: reference
native: UIView.layoutMargins
---

# `UIView`：`layoutMargins` 属性

**`layoutMargins`** 属性是视图的[内边距](../ui-view.md#内边距)，左右写死为屏幕的左和右。它和 [`directionalLayoutMargins`](directionallayoutmargins.md) 是同一份数据。

## 值

[`UIEdgeInsets`](../ui-edge-insets.md)，单位 [pt](../units.md)。字段是 `top`、`left`、`bottom`、`right`。

- 可读，可写。
- 默认值是 `(8, 8, 8, 8)`。
- 写其中一个，[`directionalLayoutMargins`](directionallayoutmargins.md) 跟着变。界面要支持从右往左的语言时，用 `directionalLayoutMargins`。
- 读出来的值会加上安全区，规则和 `directionalLayoutMargins` 相同，见 [`insetsLayoutMarginsFromSafeArea`](insetslayoutmarginsfromsafearea.md)。
- 写入时可以给 `UIEdgeInsets`，也可以给四个字段齐全的普通对象。读出来的结构体字段只读，每次读得到一个新对象，见[结构体](../structs.md)。
- 没有变化通知，原因同 `directionalLayoutMargins`。

### 写错时

- 给的不是对象：抛 `TypeError: layoutMargins needs an object with all of: top, left, bottom, right`。
- 缺字段，或字段转不出有限的数：抛 `TypeError: layoutMargins is missing …, or it is not a finite number`，中间是缺的字段名。
- 出错时属性保持原值。字段的值按 `Number()` 转换，所以 `'10'` 可以。

## 示例

```js
const box = new UIView();
box.layoutMargins = { top: 5, left: 6, bottom: 7, right: 8 };
console.log(String(box.directionalLayoutMargins));
```

**结果**：语言是从左往右时，输出 `NSDirectionalEdgeInsets(5, 6, 7, 8)`。

## 对应的 iOS API

`UIView.layoutMargins`。`UIEdgeInsetsMake(8, 16, 8, 16)` 写成 `new UIEdgeInsets(8, 16, 8, 16)`。

## 参见

- [`directionalLayoutMargins`](directionallayoutmargins.md)
- [内边距](../ui-view.md#内边距)
