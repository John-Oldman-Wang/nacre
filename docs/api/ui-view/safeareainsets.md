---
type: reference
native: UIView.safeAreaInsets
---

# `UIView`：`safeAreaInsets` 属性

**`safeAreaInsets`** 属性给出[安全区](../ui-view.md#安全区)的四条边到视图四条边的距离。安全区是视图里不会被刘海、状态栏、屏幕圆角和底部横条遮挡的区域。

## 值

[`UIEdgeInsets`](../ui-edge-insets.md)，单位 [pt](../units.md)。字段是 `top`、`left`、`bottom`、`right`。

- 只读。给它赋值抛 `TypeError`。
- 由系统决定。每个视图的数值按这个视图的范围计算：贴着屏幕顶端的视图上边有一段安全区，完全位于屏幕中间的视图四边都是 0 pt。
- 视图还没有显示到屏幕上时，四边都是 0 pt（实测：还没进窗口的页面根视图）。读早了数值不对。
- 安全区变化时没有事件通知。读数值的写法要自己重新读；对齐 [`safeAreaLayoutGuide`](safearealayoutguide.md) 的约束会自动跟着重算。

用约束定位时，推荐对齐 `safeAreaLayoutGuide`，不读这个数值。

## 示例

```js
const page = new UIViewController();
const insets = page.view.safeAreaInsets;

const bar = new UIView();
bar.frame = new CGRect(0, insets.top, page.view.bounds.width, 44);
bar.backgroundColor = 'systemTeal';
page.view.addSubview(bar);
```

**效果**：页面已经显示时，得到一条高 44 pt 的青色横条，左右铺满屏幕，上边缘紧贴刘海和状态栏的下方。页面还没显示时 `insets.top` 是 0。**未在模拟器验证。**

## 对应的 iOS API

`UIView.safeAreaInsets`。

## 参见

- [`safeAreaLayoutGuide`](safearealayoutguide.md)
- [安全区](../ui-view.md#安全区)
- [避开刘海和底部横条](../../guides/views.md#避开刘海和底部横条)
