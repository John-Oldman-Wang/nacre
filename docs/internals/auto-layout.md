# Auto Layout

约束子系统的实现细节和实测。

## 第 3c 步新增的机制

只加了**一条**通道，其余全是复用：

| 通道 | 用途 |
| --- | --- |
| `call_object_array_method` | 方法返回原生对象数组。此前只有「属性是对象数组」（`subviews`），没有「方法返回对象数组」。`constraintsAffectingLayoutForAxis:` 要它 |

`NSLayoutConstraint.activateConstraints([...])` **没有**开新通道：约束按「每个参数一个对象」摊在 `argPtrs` 里传，原生侧把整个 `argPtrs` 收成数组。现成的类方法通道够用，不必为「数组参数」再发明一种编码。

三条值得记住的事实：

1. **`UILabel` 和普通 `UIView` 的抱紧 / 抗压缩默认值一样**，都是 250 / 750（横纵都是）。「标签抱得更紧」是以讹传讹——差别在固有尺寸：`UILabel` 有，普通 `UIView` 是 `(-1, -1)`，没有东西可抱。
2. **没有公共祖先时激活约束，原生抛 `NSGenericException`**。不接住整个 App 就没了，而这是 JS 写错了，所以桥上 `@try/@catch` 转成 `TypeError`。这是**少数几处接 `NSException` 的地方**，判据是「不接的代价是崩溃，而错误来自调用方」。跨轴连接（`NSInvalidArgumentException`）则是在桥上**先查类型**，不等它抛。
3. **优先级是第一个「写接受两种形态、读只有一种」的属性**。`UILayoutPriority` 是 `float`，具名值只有七个，749 合法但没名字——读出来硬编成字符串只能编一个。这和「枚举一律用字符串」不矛盾：那条管的是取值有限的枚举。

---

← 返回[实现原理](README.md) ・ [项目说明](../project.md)
