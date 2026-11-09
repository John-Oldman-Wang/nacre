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

## 属性分发按能力域拆开

`NacreProperties.mm` 涨到 983 行时拆的（上一次是 `NacreRuntime.mm` 2512 → 877）。

### 量出来的结构

七个通道函数，每个都是「按类逐个 `isKindOfClass:` 分支」的链：

| 函数 | 行数 |
| --- | --- |
| `WriteNativeProperty` | 399 |
| `ReadNativeProperty` | 317 |
| `ReadNativeObjectProperty` | 107 |
| `NamedColors` | 61 |
| `WriteNativeObjectProperty` | 51 |
| `ReadNativeObjectArrayProperty` | 31 |
| `ReadClassObjectProperty` | 9 |

### 为什么不按通道拆

按通道拆（读一个文件、写一个文件）最省事，纯搬家零风险。但**它拆错了方向**：真实的改动单元是「给某个类加几个属性」，一次要同时动读和写——按通道拆之后这件事要跨两三个文件，而且「子类在父类之前」那条规矩会从一眼可见变成分散在几处各自维护。

所以按**能力域**拆，和 `types/ios/` 用同一套域：

| 文件 | 装什么 | 行数 |
| --- | --- | --- |
| `NacrePropsView.mm` | `UIView`、`UILabel`、`UIImageView` | 284 |
| `NacrePropsScroll.mm` | `UIScrollView`、`UIStackView` | 262 |
| `NacrePropsResource.mm` | 颜色常量表、`UIFont`、`UIImage`、`Blob` | 133 |
| `NacrePropsLayer.mm` | `CALayer` | 113 |
| `NacrePropsControl.mm` | `UIControl`、`UIButton` | 112 |
| `NacrePropsLayout.mm` | `NSLayoutConstraint`、`UILayoutGuide` | 109 |
| `NacrePropsScene.mm` | 场景、窗口、`UIViewController` | 108 |
| `NacreProperties.mm` | 只有分发器 | 100 |

总行数从 983 涨到 1221，涨的全是函数签名和每个域的样板。

### 让这件事安全的那个事实

拆之前先查了一遍**跨域的子类/父类对**——`UIButton`、`UIControl`、`UIScrollView`、`UIStackView`、`UIWindow` 对 `UIView`——看它们有没有共同处理的属性名。**一个都没有。**

所以分发器的调用顺序是自由的，拆开不会把「子类在父类之前」拆坏。有顺序要求的那几对（`UIButton` 在 `UIControl` 之前、`UILabel` 和 `UIImageView` 都有 `isHighlighted`）**全在同一个域内部**，跟着一起搬走了。

> 这一条是方案成不成立的前提。不先确认它就拆，等于赌运气。

### 各通道的约定

| 通道 | 「我没处理」怎么表示 |
| --- | --- |
| 读 `id Read<域>Property(id, NSString* key)` | 返回 `nil` |
| 写 `BOOL Write<域>Property(id, key, value, error)` | 返回 `NO`。返回 `YES` 表示处理了——**写成了或者填了 `error` 都算** |
| 对象读 `nacre::NativeObjectRef Read<域>ObjectProperty(…)` | 返回 `class_name` 为空的 ref。能成立是因为每个认领的分支都给了非空类名，而「属性是 nil」返回的是 `{nullptr, "UIView"}`，类名非空 |
| 数组读 `void Read<域>ObjectArray(…, refs&)` | 不需要表示——各域只管往 `refs` 追加，没有「谁先认领」 |
| 对象写 `void Write<域>ObjectProperty(…)` | 同上，它本来就没有错误出口（已知 TODO） |

读那一条是**逐字搬家**：原来的 `if (value == nil && …)` 链条在域函数里原样保留，只是 `value` 的声明和 `return value` 挪到了函数两头。

写那一条不是——分支里的 `return;` 要机械改成 `return YES;`，一共 88 处。**其中 12 处是写在一行里的** `{ …; return; }`，第一遍的正则只认换行后的 `return;`，漏掉了这 12 处，编译器用 `-Wreturn-mismatch` 逐个指了出来。这是整个拆分过程中唯一出错的地方，而且编译期就拦住了。

### `check-api.sh` 跟着改了

它原来按单个签名定位分发表的函数体：

```python
def mm_block(start_sig):
    i = mm.index(start_sig)
    return mm[i:mm.index('\n}\n', i)]
```

拆完改成**按签名正则收集一组函数体**，并且匹配不到时主动报「脚本要更新」——否则下次再拆，它会安静地扫出一个空集合，然后报一堆「nacre.js 有但原生层没有」的假阳性。第一次跑就是这个下场。

### 验证

四个数字和拆分前**一字不差**：

```
类 25 个，颜色常量 39 个，标量读写 108/66，对象读写 41/11
```

加上模拟器全部断言逐条 diff，差异只有网络字节数和耗时这些噪声。

---

← 返回[实现原理](README.md) ・ [项目说明](../project.md)
