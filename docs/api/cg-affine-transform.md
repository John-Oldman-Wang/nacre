---
type: reference
native: CGAffineTransform
---

# `CGAffineTransform`

**`CGAffineTransform`** 表示一个二维仿射变换：缩放、旋转、平移，以及它们的组合。[`UIView`](ui-view.md) 的 [`transform`](ui-view/transform.md) 属性的值是它。

六个字段是下面这个矩阵里的六个数。`tx`、`ty` 是平移量，单位 [pt](units.md)；其余四个是比例，没有单位。

```
| a  b  0 |
| c  d  0 |
| tx ty 1 |
```

日常使用不需要直接填这六个数：用三个静态方法造出基本变换，再用 [`concat()`](cg-affine-transform/concat.md) 组合。

字段只读，要改就整体换一个新的；写入视图的 `transform` 时也可以给字段齐全的普通对象；每次读属性得到一个新对象。这几条对所有结构体都成立，见[结构体](structs.md)。变换的方法都在 JS 里计算，返回新的对象，不改调用者。

**继承关系**：没有。`CGAffineTransform` 是普通的 JS 类，不继承 `NSObject`，也不是 `EventTarget`。

## 构造函数

[`CGAffineTransform()`](cg-affine-transform/constructor.md)

直接给出矩阵的六个数。不给的参数是 0，所以 `new CGAffineTransform()` 不是单位矩阵。

## 静态属性

[`CGAffineTransform.identity`](cg-affine-transform/identity.md)

单位矩阵，表示不做任何变换。每次读得到一个新的实例。

## 静态方法

| 方法 | 说明 |
| --- | --- |
| [`CGAffineTransform.scale()`](cg-affine-transform/scale.md) | 缩放。只给一个参数时两个方向相同 |
| [`CGAffineTransform.translation()`](cg-affine-transform/translation.md) | 平移，单位 pt |
| [`CGAffineTransform.rotation()`](cg-affine-transform/rotation.md) | 旋转，参数是弧度，正值顺时针 |

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`a`](cg-affine-transform/a.md) <small>只读</small> | 矩阵第一行第一列 |
| [`b`](cg-affine-transform/b.md) <small>只读</small> | 矩阵第一行第二列 |
| [`c`](cg-affine-transform/c.md) <small>只读</small> | 矩阵第二行第一列 |
| [`d`](cg-affine-transform/d.md) <small>只读</small> | 矩阵第二行第二列 |
| [`tx`](cg-affine-transform/tx.md) <small>只读</small> | 横向平移量，pt |
| [`ty`](cg-affine-transform/ty.md) <small>只读</small> | 纵向平移量，pt |
| [`isIdentity`](cg-affine-transform/isidentity.md) <small>只读</small> | 是不是单位矩阵 |

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`concat()`](cg-affine-transform/concat.md) | 和另一个变换组合：先做自己，再做另一个 |
| [`invert()`](cg-affine-transform/invert.md) | 逆变换。不可逆时返回 `null` |
| [`toString()`](cg-affine-transform/tostring.md) | 写成 `CGAffineTransform(a, b, c, d, tx, ty)` |

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const box = new UIView();
  box.frame = new CGRect(40, 120, 100, 100);
  box.backgroundColor = 'systemIndigo';
  page.view.addSubview(box);

  box.transform = CGAffineTransform.rotation(Math.PI / 6);
  box.transform = CGAffineTransform.scale(1.2);
  box.transform = CGAffineTransform.scale(1.2)
    .concat(CGAffineTransform.rotation(Math.PI / 6));
});
```

**效果**

- 第一次赋值：`box` 绕自己的中心顺时针转 30°。
- 第二次赋值：`box` 以中心为基准放大到 1.2 倍。每次赋值替换之前的变换，不累加，所以这时不再旋转。
- 第三次赋值：`box` 放大到 1.2 倍并旋转 30°。屏幕上最后看到的是这一个。

变换不改变视图的 `bounds` 和 `center`。变换不是单位矩阵时，`frame` 读出来的是变换之后的外接矩形，见 [`UIView.transform`](ui-view/transform.md)。

带小数的字段经过系统计算后，读回来可能在末尾几位上不同。验收用例对变换矩阵的往返只比较到小数点后 4 位；逐位相等**未在模拟器验证**。比较时留出容差：

```js
const box = new UIView();
box.transform = CGAffineTransform.rotation(Math.PI / 6);
const t = box.transform;
console.log(Math.abs(t.a - Math.cos(Math.PI / 6)) < 0.0001);
```

**结果**：输出 `true`。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `CGAffineTransformMake(a, b, c, d, tx, ty)` | `new CGAffineTransform(a, b, c, d, tx, ty)` |
| `CGAffineTransformIdentity` | `CGAffineTransform.identity` |
| `CGAffineTransformMakeScale(sx, sy)` | `CGAffineTransform.scale(sx, sy)` |
| `CGAffineTransformMakeTranslation(tx, ty)` | `CGAffineTransform.translation(tx, ty)` |
| `CGAffineTransformMakeRotation(r)` | `CGAffineTransform.rotation(r)` |
| `CGAffineTransformConcat(t1, t2)` | `t1.concat(t2)` |
| `CGAffineTransformInvert(t)`（不可逆时返回 `t` 本身） | `t.invert()`（不可逆时返回 `null`） |
| `CGAffineTransformIsIdentity(t)` | `t.isIdentity` |

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 三维变换（透视、绕 x 或 y 轴翻转） | `CATransform3D`、`CALayer.transform` |

## 参见

- [结构体](structs.md)：所有结构体共同的规则
- [`UIView.transform`](ui-view/transform.md)：变换对 `frame` 的影响
- [单位](units.md)：pt、弧度和角度
- [实现说明](../internals/structs.md)：变换为什么在 JS 里计算
