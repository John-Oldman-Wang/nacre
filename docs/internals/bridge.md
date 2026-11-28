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
| `write_property` 改为返回 `bool` | 写不进去时 JS 抛异常。当时只有枚举名不认识会触发；2026-11-17 起枚举名不认识改走另一条出口（警告，不抛），见[枚举](enums.md#属性位不抛2026-11-17) |
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

## 运行时入口文件拆开（2026-11-17）

`NacreRuntime.mm` 到了 2180 行，里面是好几样不相干的东西。外部审查指出过，它也早就超过了我们自己定的 800 行。拆了两刀，现在是 1453 行：

| | 搬到哪 | 是不是纯搬家 |
| --- | --- | --- |
| 七个事件的中转类（控件、本地存储、滚动、动画、导航、标签栏、模态）和 `CADisplayLink` 的那个，连同把它们挂到原生对象上用的 key | `NacreEventTrampolines.mm`，约 270 行 | 是。内容没有改 |
| 网络：请求记录、系统的回调、交付内容、取消和释放 | `NacreFetchService`，约 450 行 | 不是。状态换了主人 |

第一刀要一个内部头（`NacreRuntimeInternal.h`）：中转对象要调运行时派发事件的那几个方法，运行时的订阅代码要建中转对象、认那几个 key，两边的声明原来靠「在同一个文件里」，现在放进这个头。它不是公开面，也不是给能力包的。

第二刀是把状态从 `NacreRuntime` 的成员变量搬到一个新对象上。约定只有四条：

- **谁建**：运行时在 `init` 里建一个，把引擎的那个共享指针和一条并发队列交给它。
- **谁调**：引擎来的四个调用（发请求、读内容、取消、释放）由运行时原样转过去，都在主线程。
- **它持有什么**：会话、请求记录、守着记录的串行队列、系统回调用的串行队列。并发队列不归它，读 `Blob` 的内容也用那一条，所以留在运行时手里。
- **什么时候清理**：运行时销毁时调它的 `invalidate`。会话强引用着自己的委托（现在是这个对象），不 `invalidate` 两边都放不掉。原来委托是运行时自己，同样是在销毁时 `invalidateAndCancel`。

方法体一行没改，只有并发队列的成员变量换了名字。线程分工、背压、零拷贝那些结论都没有动，见[网络](network.md)。

还留在 `NacreRuntime.mm` 里的最大一块是订阅（按对象的类挑分支，约 300 行），它和「订阅按事件名分流」那条待办是同一件事，到时一起动。

## 参数怎么过桥：引擎直接读值（2026-11-18）

JS 给原生的参数原来是这样走的：内置脚本里 `JSON.stringify`，引擎转成 UTF-8，原生用系统的 `NSJSONSerialization` 解回去。现在 JS 把值原样交给引擎，引擎自己读，写成一段字节交给原生。

### 为什么改

那条路有两个不报错的问题，都出在系统的解析器上：

| | 量到的 |
| --- | --- |
| 每个字符串开头的一个 U+FEFF 被去掉 | 数组里的每一项、对象的键和值都一样；原样写的和写成 `\ufeff` 转义的都一样；中间和结尾的不动 |
| 字符串里有落单的代理项，整段解析失败 | 不是只丢那一个字符：这次调用的全部参数原生都收不到 |

改之前在运行时里实测到的表现：

- 往文件里写以 BOM 开头的 CSV，文件里没有 BOM。
- `label.text = 'a\ud83db'` 之后 `label.text` 是 `null`，文字被悄悄清空。
- `button.setTitle('半\ud83d', { forState: ['normal'] })` 抛了一句不相干的错，说 `forState` 不对，因为整个参数表都没解出来。

落单的代理项不是刻意构造才有的：`text.slice(0, n)` 正好切在一个表情的中间就是。

### 试过和否掉的

- **字符串前面多放一个 U+FEFF**，让系统去掉一个之后正好剩下原来的。量过是成立的（系统每个字符串固定去掉一个）。否掉是因为它依赖一个没写进文档的行为，系统哪天改了，补的那一个就会多出来；还得自己扫一遍 JSON 找字符串的开头；落单的代理项它管不了。
- **共享一块 ArrayBuffer**。问题出在解码，不在拷贝。JS 的字符串也没法直接当成缓冲区交出去，要在 JS 里逐个字符写，解释执行下更慢。
- **自己写一个 JSON 解析器**换掉系统的。能解决两个问题，改动只有一个函数，但还是「先写成文本再解回来」。

### 现在的做法

引擎（`Engine.cpp` 的 `PackInto`）按深度优先走一遍值，写成：

```
开头一个字节 0x01
z                         null
t / f                     true / false
d + 8 字节                数（double）
s + 4 字节长度 + 码元      字符串，UTF-16 码元原样抄
a + 4 字节个数 + 各项      数组
o + 4 字节个数 + (键 + 值)  对象
```

宿主那边解码还是原来那个函数（`DecodeJSON`），它看开头的字节：`0x01` 就按上面的格式建对象，字符串用「按码元建」的接口；别的还按 JSON 文本解。所以解码的三十几处调用点、各个域、能力包都没有改，参数从引擎到它们手里仍然是一个 `std::string`，只是里面装的东西换了。

用字节而不是让宿主在引擎走值的时候当场建对象，是因为异步方法要把参数带到别的线程上再解，一段字节可以带走，引擎里的值不行。

改的地方一共三处：引擎里八个接参数的入口，内置脚本里八处 `JSON.stringify`（都在 `01-bridge.js`），`DecodeJSON` 里认新格式。

### 和 `JSON.stringify` 保持一样的地方

别处的行为不该因为这次改动变，所以这些值照原来的结果处理：

| 值 | 结果 |
| --- | --- |
| `undefined`、函数、`Symbol` | 在数组里是 `null`，在对象里这个成员不带 |
| `NaN`、无穷大 | `null` |
| `-0` | `0` |
| 有 `toJSON` 方法的对象（`URL`、`Date`）和 `BigInt` | 用它的返回值。调的时候传键名：顶层是空串，数组里是下标的字符串，对象里是成员名。每个值只调一次，返回值不再看它自己的 `toJSON`；返回 `undefined` 的成员不带 |
| `new Number(1)` 这类包装对象 | 里面的值 |
| 没有 `toJSON` 的 `BigInt` | 抛 `TypeError` |
| 套了 64 层以上（多半是成环了） | 抛 `TypeError` |
| 整数 | 给整数类型的 `NSNumber`，报错里拼出来是 `17` 不是 `17.0` |

`toJSON` 这一行是 2026-11-28 改的。第一版写的是「先看有没有 `toJSON`，有就对它的返回值整个再走一遍」：返回值又会被调一次 `toJSON`（返回 `this` 的一直调到 64 层，按套得太深处理），调的时候不传键名，成员跳不跳过看的是调之前的值（返回 `undefined` 的成员成了 `null`），原型上加了 `toJSON` 的 `BigInt` 也照样抛。现在照 `JSON.stringify` 的 SerializeJSONProperty 走：数组和对象的每个成员先取值、调 `toJSON`，再决定跳不跳过、怎么写。验收的 `arg-values` 有一组 `toJSON`，期望值是 node 里 `JSON.stringify` 的结果。

同一天修的还有一处：上面两行「抛 `TypeError`」原来抛不出来。`PackArg` 在 `TryCatch` 还在作用域里时调 `ThrowException`，异常被同一个 `TryCatch` 接住，出作用域时跟着清掉，JS 那边什么都没收到，原生也没被调用：写属性静默不生效。现在等 `TryCatch` 出了作用域再抛；读属性、调 `toJSON` 时 JS 自己抛的异常照旧原样传出去。

### 回传的方向补了一处

原生传回 JS 仍然是 JSON 文本，由系统的编码器写。它遇到带落单代理项的字符串写不出来，原来这时直接给 `null`，于是写进去的字符串读出来是 `null`。现在系统写不出来时自己写一遍，落单的代理项写成 `\ud83d` 这样的转义，JS 的 `JSON.parse` 认。正常情况不走这条路。

钥匙串读值时系统按 UTF-8 解码，同样会去掉开头的 U+FEFF。那里改成自己数出开头有几个、解完再补回去。读文件的 `readText()` 没有动：读文本时去掉开头的 BOM 是通常想要的结果。

### 量到的速度

模拟器，Release，每种参数两万次，五轮取最快的一轮，单位纳秒。这一组是动手之前用探针量的，探针里宿主是在引擎走值的时候当场建对象，没有中间那段字节；改完之后没有重新量。

| 参数 | 原来走 JSON | 直接读值 | 比例 |
| --- | --- | --- | --- |
| 一个数 | 898 | 371 | 41% |
| 短字符串 | 801 | 327 | 41% |
| 中文短句 | 1115 | 401 | 36% |
| 2000 个字符的字符串 | 6955 | 1875 | 27% |
| 四个数 | 1111 | 748 | 67% |
| 一个数加一个小对象 | 1387 | 1484 | 107% |
| 十个键的对象 | 2725 | 4172 | 153% |
| 一百个数的数组 | 12326 | 13866 | 112% |

单个的数和字符串快两到三倍多，这是属性赋值走的路。带对象的持平或略慢：引擎从外面逐个读对象的属性比较慢，`JSON.stringify` 是引擎内部实现的，读属性走的是快路。最慢的一项多 1.4 微秒。

### 还是 JSON 的

- 原生传回 JS 的方向：返回值、事件带的数据。
- 内置脚本里自己 `JSON.stringify` 之后当字符串传的：`fetch` 的选项。里面的字符串是方法名、请求头这些，开头不会有 U+FEFF。
- `Blob` 的分段原来也在这一条里，理由是同一句，但对它不成立：导出给 Excel 的 CSV 常写 `new Blob(['\uFEFF' + csv])`，开头的 BOM 被 iOS 的系统解析器去掉，文件少 3 个字节、中文乱码，不报任何错。字符串请求体（`fetch(url, { body: '\uFEFF' + csv })`）走的也是这条路。2026-11-28 改成在 `23-fetch.js` 里用引擎的 `utf8Encode`（`TextEncoder` 用的那一个）把字符串段编成字节，原生只收字节。随后把原生那边处理字符串段的分支也删了：宿主接口 `create_blob` 从「JSON 数组加按下标放的字节」改成只收一段段字节和类型，引擎遇到不是字节的段就不建（JS 那边抛 `TypeError`，只有内置脚本写错才会走到），iOS 的 `CreateBlob` 和 Android 的 `fromParts` 只剩拼字节，Android 自己的那个 UTF-8 编码函数也删了。Blob 标准对字符串段的定义本来就是 UTF-8 编码；不是字节的值照 Web IDL 先转成字符串，所以 `null` 是 `'null'`、`true` 是 `'true'`、`Symbol` 抛 `TypeError`，不再交给原生各自猜。原来两端都跳过 `null` 和 `undefined`、`Symbol` 也不报错；`new Blob([1, true, null, undefined, {}])` 的内容实测 Android 上是 `1true{}`，iOS 上是 `11{\n}`（`true` 成了 `1`，`{}` 成了系统对字典的描述）。不成对的代理项写成 U+FFFD，和 `TextEncoder` 一样；Android 原来的编码本来就是这样，iOS 上原来整份解析失败，实测 Blob 是空的。
- 名字、类型这些单个的字符串参数（属性名、事件名、地址）是引擎直接转成 UTF-8 的，不经过 JSON，但系统从 UTF-8 建字符串时同样会去掉开头的 U+FEFF。它们是标识符和地址，没有处理。

函数名 `DecodeJSON` 和一路上叫 `argsJSON` 的参数名没有改，它们现在装的多半不是 JSON 了。

真机（iPhone 14，Release）上跑过完整的验收，这一组断言都过。

**没验证的**：改完之后的速度；对象那一半有没有办法再快。

## JSON 那条快路为什么不做

标量属性的读写走 `JSON.stringify` → 过桥 → `DecodeJSON` → 按字符串走分发链。有人（我）提过给数字和布尔开一条直读 `v8::Value` 的快路，绕开 JSON。

量了一轮，**否掉了**。模拟器上每项 2 万次取平均（`Date.now()` 毫秒精度，分辨率约 ±50 ns）：

| | ns/次 |
| --- | --- |
| `JSON.stringify(数字)` 纯 JS | 85 |
| `JSON.parse(数字)` 纯 JS | 75 |
| 写 `alpha`（标量通道，带 JSON） | 2400 |
| 读 `alpha`（标量通道，带 JSON） | 3250 |
| 写 `frame`（结构体，JSON 载荷更大） | 3750 |
| 写短字符串 `text` | 2050 |
| 写 400 字的 `text` | 3800 |
| 写 `backgroundColor`（对象通道，**无 JSON**） | 1800 |
| 读 `superview`（对象通道，**无 JSON**） | 1300 |

三条理由，一条比一条硬：

1. **JS 侧那半几乎免费**：85 / 2400 = 3.5%
2. **整个 JSON 往返最多占四分之一**：写标量 2400 vs 写对象 1800，差 600 ns，而且这 600 还不全是 JSON——两条通道的分发链长度不同，对象通道那边 JS 侧还多做了一次所有权记账
3. **同为标量，写 `text` 比写 `alpha` 便宜 350 ns**——和 JSON 本身的开销同量级。单次耗时主要由「属性在分发链的第几位」和「ObjC 那边的副作用」决定，优化 JSON 等于在噪声里挑东西

真正的地板是**过桥这件事本身**（1300–1800 ns，不管带不带 JSON）。所以要省就省**次数**，不是省单次——上层动画对象懒到 `play()` 时才建原生对象，六次过桥变一次，比抠 JSON 划算一个数量级。

两条顺带的事实：**读比写贵**（3250 vs 2400，原生侧 `EncodeJSON` 比 `DecodeJSON` 费），所以别在每帧的循环里读 `view.frame`；**载荷有线性成本**，约 4.4 ns/字，小标量碰不到。

---

（下面这一段是 2026-11-17 从 `project.md` 搬过来的：那份文件不再放实现原理。）

## 分发表怎么拆

`NacreProperties.mm` 到 983 行时拆的，过程记在[实现原理](bridge.md#属性分发按能力域拆开)。定下来的做法：

| | |
| --- | --- |
| **怎么切** | 每个能力域一个 `NacreProps<域>.mm`，装该域在**所有通道**上的函数（读、写、对象读、对象数组读、对象写）。`NacreProperties.mm` 只剩分发器 |
| **为什么不按通道再切一刀** | 真实的改动单元是「给某个类加几个属性」，一次要同时动读和写。按域切，这件事在一个文件里完成；按通道切要跨两三个文件 |
| **顺序怎么办** | 查过所有**跨域**的子类/父类对（`UIButton`、`UIControl`、`UIScrollView`、`UIStackView`、`UIWindow` 对 `UIView`），**没有一个键是两边都处理的**，所以分发器的顺序自由。但仍把子类所在的域排在 `View` 前面，让「子类在父类之前」这条规矩在顺序表上看得见 |
| **各通道的约定** | 读返回 `nil` 表示不认识；写返回 `YES` 表示处理了（写成了，或者填了 `error`）；对象读返回 `class_name` 为空的 ref 表示没处理；数组读只管往 `refs` 追加，没有「谁先认领」 |
| **怎么验** | `check-api.sh` 的四个数字一字不差（标量读写 108/66、对象读写 41/11），加上模拟器全部断言逐条对比 |

`check-api.sh` 也要跟着改：它原来按单个签名找分发表的函数体，拆完改成**按签名正则收集一组函数**，匹配不到就报「脚本要更新」。

**已经拆过的两次，结论记下来：**

| | 怎么切的 | 验证 |
| --- | --- | --- |
| `NacreEnums.mm` 956 行 → 7 个文件 | 按能力域，域名和 `NacreProps*` 对齐。唯一的实质改动是把两个宏搬进头文件——它们原来是 `.mm` 里的 `#define`，所以枚举只能挤在一个文件里 | 脚本按括号深度切出 85 块，**断言分配表是 0..84 的完整划分**；`check-api.sh` 四个数字一字不差 |
| `NacreMethods.mm` 854 行 → 532 + 246 + 118 | 两刀：造对象整体搬走（纯搬家）；导航域按通道全收（改了返回约定，加了 `NacreArgs`） | 三层——编译器抓到删多了、**selector 全集对比**、全部断言 |

**第二刀教会的一条**：`check-api.sh` 盯的是属性和类，**方法分支删了它看不出来**。所以拆方法时要另外做一次 selector 全集对比：拆前的文件 vs 拆后几个文件的并集，一个不丢一个不多。

**剩下的域还没拆**（UIView / UIButton / UIScrollView / UIStackView 还挤在 `NacreMethods.mm` 的 549 行里）。没有急迫性——它在线下了，而且下次谁碰到哪个域就顺手把那个域抽出去，比一次全拆安全。

**两处原来暂时不拆，现在都拆了：**

- ~~**`nacre.js`**（2600+ 行，**过线了**）：方案已定、暂时不拆~~ → **已拆**成 `Builtin/parts/` 下的 26 个 part，见下面「[`nacre.js` 怎么拆](runtime.md#nacrejs-怎么拆已拆2026-11-14)」
- ~~**`main.js`**：验收用例，按步骤顺序读下来才有意义，拆开反而难读~~ → **已拆**，见下面「[`acceptance/`：验收套件](../project.md#36-验收套件)」。顺序没丢，反而从「隐含在文件位置里」变成了 `src/main.js` 里显式的十几行调用

## 分发链一开始就该写成「认不认领」

拆 `NacreProperties.mm` 时学到的：**纯搬家不会引入问题，但把「一个函数里的贯穿链」拆成多个函数必然要新增一个返回约定**，而新增约定就是改设计。那次写通道 88 处 `return;` 要改成 `return YES;`（漏了 12 处写在一行里的，编译器拦住了），对象读通道的 `{}` 则多出了第三个含义。

所以**新写分发链时，每个类分支就返回「我认不认领」**，别依赖「在同一个函数里往下掉」。`NacreMethods.mm`（680 行）下次轮到它拆，先把签名改成这样，拆的时候才是纯搬家。

## 方法名映射：第一段加 options 对象

selector 的第一段做方法名，其余段作为 options 对象的键，键名就是 ObjC 的段名原文：

```js
view.addSubview(box)                              // addSubview:
view.insertSubview(box, { atIndex: 0 })           // insertSubview:atIndex:
view.insertSubview(box, { belowSubview: other })  // insertSubview:belowSubview:
view.convertPoint(p, { toView: other })           // convertPoint:toView:
view.convertPoint(p, { fromView: other })         // convertPoint:fromView:
```

这样看 Apple 文档能直接写出调用，重载也自然消歧——只取第一段的方案在 `convertPoint:toView:` / `convertPoint:fromView:` 上就会撞，而且就撞在 `UIView` 里。和[原则 6](../project.md#原则)（options 对象，不是长参数列表）一致。

不漂亮的地方是参数同质的构造类方法：`UIColor.colorWithRed(1, { green: 0, blue: 0, alpha: 1 })`。但这类方法上层已经用字符串绕开了（见 [`UIColor` 文档](ui-color.md#上层怎么写颜色已实现而且结论改过一次)），JS 开发者基本不碰。（原文这里还写着「要原样调用还有 `send(selector, ...args)` 兜底」，这个接口实际上没有做过。）
