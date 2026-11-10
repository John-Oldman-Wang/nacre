# 结构体

`CGPoint`、`CGSize`、`CGRect`、`UIEdgeInsets`。

ObjC 里它们是 C 结构体，**按值传递**。JS 没有值类型，所以用类实例代替，并且**只读**。

## 写入宽、读出窄

和[颜色](ui-color.md)同一套规则。读出来的永远是结构体类的实例；写进去的可以是实例，也可以是带同样字段的普通对象：

```js
box.frame = new CGRect(60, 270, 160, 80);                      // 实例
box.frame = { x: 60, y: 270, width: 160, height: 80 };         // 普通对象，一样
box.frame = { x: 60, y: 270, width: 160 };                     // TypeError：缺 height
```

**缺字段会抛，不会默认补 0**——那又是静默出错。

## `CGRect`

```js
const r = new CGRect(10, 20, 100, 50);

r.x;  r.y;  r.width;  r.height;   // 扁平访问
r.origin;                          // CGPoint(10, 20)
r.size;                            // CGSize(100, 50)
String(r);                         // "CGRect(10, 20, 100, 50)"
```

`origin` / `size` 和 ObjC 的 `struct CGRect { CGPoint origin; CGSize size; }` 对应，扁平的四个字段是写起来方便。两套都给，因为这一层的职责是**不丢能力**，同时别让人难受。

`origin` / `size` 是原型上的取值器，不是自有属性，所以不参与 `JSON.stringify`：

```js
JSON.stringify(new CGRect(10, 20, 100, 50));
// {"x":10,"y":20,"width":100,"height":50}
```

## `CGPoint` / `CGSize` / `UIEdgeInsets`

```js
new CGPoint(x, y);
new CGSize(width, height);
new UIEdgeInsets(top, left, bottom, right);
```

字段名和 ObjC 一致。

## `CGAffineTransform`

2×3 的仿射矩阵，`UIView.transform` 用它。

```
| a  b  0 |
| c  d  0 |
| tx ty 1 |
```

```js
view.transform = CGAffineTransform.rotation(Math.PI / 6);      // 转 30°
view.transform = CGAffineTransform.scale(1.2);                 // 放大 1.2 倍
view.transform = CGAffineTransform.scale(1.2)
  .concat(CGAffineTransform.rotation(Math.PI / 6));            // 先缩放再旋转
view.transform = CGAffineTransform.identity;                   // 复原
```

| 成员 | 效果 |
| --- | --- |
| `CGAffineTransform.identity` | 单位矩阵，什么都不变 |
| `CGAffineTransform.scale(sx, sy?)` | 缩放。只给一个参数时两轴相同 |
| `CGAffineTransform.translation(tx, ty)` | 平移 |
| `CGAffineTransform.rotation(radians)` | 旋转，**弧度**不是角度（和 Core Graphics 一致） |
| `t.concat(other)` | 先应用 `t` 再应用 `other` |
| `t.invert()` | 逆矩阵。**不可逆时返回 `null`**，不抛也不悄悄给单位矩阵 |
| `t.isIdentity` | 是不是单位矩阵 |
| `new CGAffineTransform(a, b, c, d, tx, ty)` | 六个数全给，兜底用 |

**`concat` 的顺序有讲究**：

```js
CGAffineTransform.scale(2).concat(CGAffineTransform.translation(10, 20)).tx;   // 10
CGAffineTransform.translation(10, 20).concat(CGAffineTransform.scale(2)).tx;   // 20
```

先缩放再平移，平移量不被缩放；反过来就被缩放了。

> 和别的结构体一样**字段只读**，要改就整个换一个新的。静态工厂是 JS 自己算的（那几个 `CGAffineTransformMake*` 是纯算术），没有跨桥。

## 还没做

`CATransform3D`、`CGVector`、`NSRange`、`UIOffset`、`NSDirectionalEdgeInsets`。做法和上面一样，用到了再加。

C 里的 `CGRectMake` / `CGPointZero` 这类函数和常量还没有——它们属于「C 函数、枚举和常量怎么暴露」那个更大的问题，等 bindgen 一起定。眼下 `new CGRect(...)` 覆盖了 `CGRectMake`。

## 和原生的对照

| ObjC | JS |
| --- | --- |
| `CGPointMake(10, 20)` | `new CGPoint(10, 20)` |
| `CGSizeMake(100, 50)` | `new CGSize(100, 50)` |
| `CGRectMake(0, 0, 100, 50)` | `new CGRect(0, 0, 100, 50)` |
| `UIEdgeInsetsMake(8, 16, 8, 16)` | `new UIEdgeInsets(8, 16, 8, 16)` |
| `rect.origin.x` | `rect.origin.x` 或 `rect.x` |
| `rect.size.width` | `rect.size.width` 或 `rect.width` |
| `view.frame = CGRectMake(…)` | `view.frame = new CGRect(…)` 或 `= { x, y, width, height }` |

ObjC 的构造函数是 `CGxxxMake`，JS 侧统一用 `new`。

---

实现原理见[实现说明](../internals/structs.md)。

← 返回 [API 文档](README.md)
