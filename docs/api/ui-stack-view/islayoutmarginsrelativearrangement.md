---
type: reference
native: UIStackView.layoutMarginsRelativeArrangement
---

# `UIStackView`：`isLayoutMarginsRelativeArrangement` 属性

**`isLayoutMarginsRelativeArrangement`** 属性决定排列项是否排在容器的内边距以内。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 排列项排在容器的内边距以内，四周留出 [`directionalLayoutMargins`](../ui-view/directionallayoutmargins.md) 给出的空白 |
| `false` | 排列项贴着容器的边缘，内边距不起作用 |

- 可读，可写。
- 默认值是 `false`。
- 内边距是从 `UIView` 继承来的 `directionalLayoutMargins`，默认值是四边各 8 pt，不是 0。只开这个开关、不写内边距时用的是这个默认值。
- 容器的某条边伸到安全区外面时（比如容器铺满整个屏幕），系统会把安全区加到那条边的内边距上。要写多少就是多少，把容器的 `insetsLayoutMarginsFromSafeArea` 设成 `false`。
- 容器还没加到窗口里、又已经布局过一次时，改内边距或这个属性之后要先调 `setNeedsLayout()`，再调 `layoutIfNeeded()`，排列项的位置才会更新。容器在窗口里时不需要。
- 写入时按 `Boolean()` 转换。
- 没有变化通知。只有 App 自己的代码能改它。

## 示例

```js
const box = new UIStackView();
box.frame = new CGRect(0, 0, 200, 100);
box.isLayoutMarginsRelativeArrangement = true;
box.insetsLayoutMarginsFromSafeArea = false;
box.directionalLayoutMargins = { top: 10, leading: 20, bottom: 30, trailing: 40 };

const item = new UIView();
box.addArrangedSubview(item);
box.setNeedsLayout();
box.layoutIfNeeded();
console.log(String(item.frame));
```

**结果**：语言是从左往右时，输出 `CGRect(20, 10, 140, 60)`；从右往左时是 `CGRect(40, 10, 140, 60)`。排列项在内边距以内：左边让出 20 pt，上边让出 10 pt，宽 200 − 20 − 40，高 100 − 10 − 30。验收用例核对过这组数。

## 对应的 iOS API

`UIStackView.layoutMarginsRelativeArrangement`，ObjC 的读取名是 `isLayoutMarginsRelativeArrangement`，JS 用这个名字读和写。

## 参见

- [给容器加内边距](../../guides/stack-views.md#给容器加内边距)
- [`directionalLayoutMargins`](../ui-view/directionallayoutmargins.md)
