# 结构体

为什么做成只读、为什么不用 `Object.freeze`。

## 为什么只读

```objc
view.frame.x = 10;   // ObjC：编译错误
```

ObjC 里 `view.frame` 返回的是一个副本，改它毫无意义，所以编译器直接拦住。如果 JS 侧用普通对象表示：

```js
view.frame.x = 10;   // 如果是普通对象 → 静默无效，view 纹丝不动
```

这是最难查的那种错。所以结构体的每个字段都定义成带 setter 的访问器，赋值直接抛：

```js
view.frame.x = 10;   // TypeError: x 是只读的：结构体按值传递，要改请整体赋一个新的
```

> 没用 `Object.freeze`：冻结后的赋值**只在严格模式下**抛异常，而用户的 JS 是普通脚本，在那里它同样是静默失败。

要改就整体赋一个新的：

```js
const f = view.frame;
view.frame = new CGRect(10, f.y, f.width, f.height);
```

## `CGAffineTransform`：那个「C 函数怎么暴露」的问题没出现

记 TODO 的时候担心的是：造仿射矩阵的能力在 ObjC 侧是一组 **C 函数**（`CGAffineTransformMakeScale`、`CGAffineTransformMakeRotation`、`CGAffineTransformConcat`、`CGAffineTransformInvert`），不是方法——而「C 函数怎么暴露」是留给 bindgen 的一个未决问题。

动手时发现**这个问题在这里不存在**：那几个函数全是**纯算术**。

| C 函数 | 它其实就是 |
| --- | --- |
| `MakeScale(sx, sy)` | `{a: sx, d: sy}`，其余为 0 / 1 |
| `MakeRotation(r)` | `{a: cos, b: sin, c: -sin, d: cos}` |
| `MakeTranslation(tx, ty)` | `{tx, ty}`，对角线为 1 |
| `Concat(t1, t2)` | 2×3 矩阵乘法 |
| `Invert(t)` | 除以行列式 |

所以静态工厂全在 JS 里算，**过桥的只有六个数**，一条新通道都不用开，也不用提前给「C 函数」定调。

> 判据可以记下来：**C 函数如果只是在值类型上做算术，就在 JS 侧实现；真正需要跨桥的是那些会碰到系统状态的函数**（分配内存、问系统、改全局）。前者不欠 bindgen 什么。

`invert()` 这一处做了一个和 C 不一样的选择：`CGAffineTransformInvert` 在不可逆时**返回原矩阵**（文档如此），我们返回 `null`。理由是老一套——「失败了却给你一个看着能用的东西」正是这个项目一路在拒绝的那种错。

## 实测：`transform` 非单位矩阵时 `frame` 是包围盒

UIKit 文档说「`transform` 不是 identity 时 `frame` 的值未定义」，实测下来它报的是**变换后的轴对齐包围盒**，而且关系是确定的：

```
frame.width = bounds.width × (|a| + |c|)
```

一个 40×40 的块，`scale(1.2) × rotation(30°)` 之后 `frame.width` 是 **65.5692**，正好等于 `40 × (1.0392 + 0.6)`。`bounds` 和 `center` 完全不受影响。

这条写进 [API 文档](../api/ui-view.md)了，因为不知道就会踩。


---

← 返回[实现原理](README.md) ・ [API 文档](../api/structs.md)
