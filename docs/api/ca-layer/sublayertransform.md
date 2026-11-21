---
type: reference
native: CALayer.sublayerTransform
---

# `CALayer`：`sublayerTransform` 属性

**`sublayerTransform`** 属性是作用在这个图层全部子图层上的三维变换。它不改变图层自己，只改变子图层画出来的样子。

## 值

[`CATransform3D`](../ca-transform-3d.md)。

- 可读，可写。
- 默认值**未在模拟器验证**，按 Apple 的文档是单位矩阵，表示子图层不做额外的变换。
- 写入时可以给 `CATransform3D`，也可以给带齐 `m11` 到 `m44` 全部 16 个字段的普通对象。
- 读出来的是一个新的 `CATransform3D`，字段只读，见[结构体](../structs.md)。
- 每个子图层先做自己的 [`transform`](transform.md)，再做父图层的 `sublayerTransform`。**屏幕上的效果未在模拟器验证。**

最常见的用法是给一组子图层一个共同的透视：`m34` 写在父图层的 `sublayerTransform` 上，每个子图层的 `transform` 只写旋转。这样几个子图层看起来在同一个空间里，远近关系一致。

### 写错时

**`TypeError`**

- 给的不是对象：`sublayerTransform needs an object with all of: m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44`。
- 缺字段，或字段转不出有限的数：`sublayerTransform is missing m12, or it is not a finite number`，中间是缺的字段名。

出错时属性保持原值。

## 示例

```js
const stage = new CALayer();
stage.frame = new CGRect(20, 120, 320, 200);
stage.sublayerTransform = { ...CATransform3D.identity, m34: -1 / 500 };

const left = new CALayer();
left.frame = new CGRect(20, 40, 120, 120);
left.backgroundColor = 'systemBlue';
left.transform = CATransform3D.rotation(Math.PI / 4, 0, 1, 0);
stage.addSublayer(left);

const right = new CALayer();
right.frame = new CGRect(180, 40, 120, 120);
right.backgroundColor = 'systemOrange';
right.transform = CATransform3D.rotation(-Math.PI / 4, 0, 1, 0);
stage.addSublayer(right);

console.log(stage.sublayerTransform.m34);
```

**效果**

- 控制台输出 `-0.002`。
- 两个方块各自绕竖直的中线转 45°，方向相反，共用同一个透视。**屏幕上的样子未在模拟器验证。**

## 对应的 iOS API

`CALayer.sublayerTransform`。

## 参见

- [`transform`](transform.md)：图层自己的变换
- [透视](../ca-transform-3d.md#透视)
- [`CATransform3D`](../ca-transform-3d.md)
