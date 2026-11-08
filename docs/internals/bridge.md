# 桥的通道

原生能力怎么交给 JS：一条条通道是怎么长出来的，以及定下来的约定。

## 第 2 步新增的机制：类级成员

原来的桥全是基于 handle 的，只能访问实例成员；而 `UIColor` 的颜色常量是 ObjC 的类级只读属性（`@property(class, readonly)`），没有实例可用。于是加了一条 `(类名, 属性名) → 原生对象` 的通道（`native.classObjProp`）。

iOS 层是一张**写死的名字表**，不是用名字拼 selector 再 `performSelector:`——后者等于把任意 ObjC 调用的入口开给 JS，在通用的能力暴露方案做好之前不开这个口子。

**带参数的类方法**（`colorWithRed:green:blue:alpha:`）还没做：上层颜色已经定成字符串写法，这类方法 JS 开发者基本不碰，等 bindgen 一起补。

## 第 2.5 步新增的机制

做 `UIView` 的几何和层级时补了三条通道，都在 `EngineHost` 上：

| 通道 | 用途 |
| --- | --- |
| `call_method` | 带参数、返回值用 JSON 编码的方法。对象参数在 JSON 数组里留 `null`，指针按同样的下标单独传 |
| `call_object_method` | 同上，但返回值是原生对象 |
| `read_object_array_property` | 属性值是原生对象数组，比如 `subviews` |

两个约定值得记住：

- **过桥的方法名是完整的 ObjC selector**（`insertSubview:atIndex:`）。把「第一段 + options」还原成 selector 是 **JS 层**的事，所以 iOS 层的分发表和 Apple 文档一一对上。目前是手写绑定，每个 JS 方法显式知道自己的 selector，不靠 options 的键序去拼——键序靠不住。
- **结构体的线上格式是扁平的**（`CGRect` 是 `x`/`y`/`width`/`height`，不是嵌套的 `origin`/`size`）。嵌套视图由 JS 侧的 `CGRect` 类用原型取值器提供，所以不参与 `JSON.stringify`。线上格式是内部约定，以后换编码不影响 JS。

实测到一条 UIKit 自己的行为：**`UIView.alpha` 写 `0.6` 读回 `0.6000000238418579`**。`alpha` 背后是 `CALayer.opacity`，那是 32 位 float，不是我们这层的编码问题。

## 第 3a 步新增的机制

| 通道 | 用途 |
| --- | --- |
| `call_class_object_method` | 带参数的类方法，比如 `UIFont.systemFontOfSize(17)`。参数规则和 `call_method` 一样 |
| `write_property` 改为返回 `bool` | 写不进去时 JS 抛异常。目前只有枚举名不认识会触发 |
| 三条调用通道加 `std::string* error` 出参 | 参数不被接受时抛 `TypeError`。不能靠「返回空值」表示失败——空值本身是合法答案（`fontWithName` 找不到字体、`hitTest` 没命中都该返回 `null`），「没有这个东西」和「你问错了」必须分得开 |
| `write_property` 也收进同一个出口 | 原来返回 `bool` 让 JS 凑错误信息，需要 JS 侧抄一份可选值列表。改成带外错误后，错误信息由原生层凑——那张表就在它手里，而且它知道是哪个类的哪个属性。按属性名索引的表迟早会撞：`UIControl.state` 和 `UIGestureRecognizer.state` 是两个毫无关系的枚举，三个不相干的枚举都叫 `style` |

枚举的决定见上面的设计点 3。

---

← 返回[实现原理](README.md) ・ [项目说明](../project.md)
