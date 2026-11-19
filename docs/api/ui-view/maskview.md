---
type: reference
native: UIView.maskView
---

# `UIView`：`maskView` 属性

**`maskView`** 属性是视图的遮罩：一个视图，只有它不透明的部分下面，这个视图才显示出来。

## 值

[`UIView`](../ui-view.md)，或者 `null`。

- 可读，可写。
- 默认值是 `null`（实测）。
- 写进去读回来是同一个对象；写 `null` 去掉遮罩（实测）。
- 遮罩视图由这个视图保管，不需要另外保存。遮罩视图不要再加到视图树上。**未在模拟器验证。**
- 遮罩在屏幕上的效果**未在模拟器验证**。

## 示例

```js
const photo = new UIImageView();
photo.frame = new CGRect(0, 0, 120, 120);

const circle = new UIView();
circle.frame = new CGRect(0, 0, 120, 120);
circle.backgroundColor = 'black';
circle.layer.cornerRadius = 60;

photo.maskView = circle;
console.log(photo.maskView === circle);
```

**效果**：图片只在圆形里显示出来。控制台输出 `true`。屏幕上的效果**未在模拟器验证**。

## 对应的 iOS API

`UIView.maskView`。

## 参见

- [`CALayer`](../ca-layer.md)：图层的 `mask`
- [`clipsToBounds`](clipstobounds.md)
