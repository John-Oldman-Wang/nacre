---
type: reference
native: UIView.safeAreaLayoutGuide
---

# `UIView`：`safeAreaLayoutGuide` 属性

**`safeAreaLayoutGuide`** 属性是代表[安全区](../ui-view.md#安全区)的 layout guide。安全区是视图里不会被刘海、状态栏、屏幕圆角和底部横条遮挡的区域。

## 值

[`UILayoutGuide`](../ui-layout-guide.md)。

- 只读。给它赋值抛 `TypeError`。
- 由系统提供，不需要用 `addLayoutGuide()` 加，也不在 [`layoutGuides`](layoutguides.md) 里。
- 和它对齐，不和页面的根视图对齐，内容就不会被遮挡。对齐它的约束在安全区变化时自动重算，也不受读取时机影响；[`safeAreaInsets`](safeareainsets.md) 在视图显示之前读到的是 0。
- 通常的做法是：底色铺满整个页面，文字和按钮放在安全区内。

## 示例

```js
const page = new UIViewController();
const banner = new UIView();
banner.translatesAutoresizingMaskIntoConstraints = false;
page.view.addSubview(banner);

const guide = page.view.safeAreaLayoutGuide;
NSLayoutConstraint.activateConstraints([
  banner.leadingAnchor.constraintEqualToAnchor(guide.leadingAnchor, { constant: 16 }),
  banner.trailingAnchor.constraintEqualToAnchor(guide.trailingAnchor, { constant: -16 }),
  banner.bottomAnchor.constraintEqualToAnchor(guide.bottomAnchor, { constant: -24 }),
  banner.heightAnchor.constraintEqualToConstant(60),
]);
```

**效果**：页面显示后，底部出现一条高 60 pt 的横条。它的左右边缘距安全区各 16 pt，下边缘在安全区底边上方 24 pt。

## 对应的 iOS API

`UIView.safeAreaLayoutGuide`。

## 参见

- [`UILayoutGuide`](../ui-layout-guide.md)
- [用约束排版](../../guides/auto-layout.md)
