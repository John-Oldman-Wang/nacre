---
type: reference
native: UIView.readableContentGuide
---

# `UIView`：`readableContentGuide` 属性

**`readableContentGuide`** 属性是适合阅读长文字的宽度范围。视图很宽时它比视图窄。

## 值

[`UILayoutGuide`](../ui-layout-guide.md)。

- 只读。给它赋值抛 `TypeError`。
- 由系统提供，不需要用 `addLayoutGuide()` 加，也不在 [`layoutGuides`](layoutguides.md) 里。
- 长文本对齐它比对齐安全区好读。
- 具体范围**未在模拟器验证**。

## 示例

```js
const page = new UIViewController();
const body = new UILabel();
body.numberOfLines = 0;
body.translatesAutoresizingMaskIntoConstraints = false;
page.view.addSubview(body);

const readable = page.view.readableContentGuide;
NSLayoutConstraint.activateConstraints([
  body.leadingAnchor.constraintEqualToAnchor(readable.leadingAnchor),
  body.trailingAnchor.constraintEqualToAnchor(readable.trailingAnchor),
  body.topAnchor.constraintEqualToAnchor(readable.topAnchor),
]);
```

**效果**：多行文字的宽度限制在适合阅读的范围内。**未在模拟器验证。**

## 对应的 iOS API

`UIView.readableContentGuide`。

## 参见

- [`UILayoutGuide`](../ui-layout-guide.md)
- [用约束排版](../../guides/auto-layout.md)
