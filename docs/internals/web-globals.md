# Web 标准的五个全局

← [实现原理](README.md)

`TextEncoder`、`TextDecoder`、`atob`、`btoa`、`structuredClone`。上层 API，名字和行为照 Web——浏览器、Node、Deno 都有这五个全局，很多 npm 包一引入就调它们。它们不是 ECMAScript 的一部分（前两个是 WHATWG Encoding 的，后三个是 HTML 的），V8 不带，要运行时自己补。

用法见 [API 文档](../api/web-globals.md)。

> **这一步写完时没有在模拟器里跑过**（并行开发，模拟器被别的任务占着）。下面凡是说「验过」的，都写明了是在哪里验的；没写的就是只过了编译。

## 分工：算在引擎的 C++ 里，形状在内置脚本里

| 层 | 文件 | 管什么 |
| --- | --- | --- |
| 内置脚本 | `core/builtin/parts/28-web-globals.js` | 把参数按 Web IDL 转好、两个类的形状、带名字的 `Error`、哪些对象不能克隆 |
| 引擎，绑 V8 的那一半 | `core/engine/WebGlobals.cpp` | 从 JS 值里取出字节和字符串、调 V8 的 UTF-8 写出和序列化、把结果建成 JS 值 |
| 引擎，纯算法的那一半 | `core/engine/TextCodec.cpp` | UTF-8 解码的状态机、Base64 的编码和解码。**连 V8 都不依赖** |
| 宿主（ObjC） | 没有 | 一行都没加 |

和 `crypto`、定时器是同一个分法：桥上只放最小的几个函数（这次是六个），API 的形状全在 JS 里定。不一样的是这五个不需要宿主提供任何东西，所以 `EngineHost` 没有新成员，`NacreRuntime.mm` 没动，将来 Android 直接用同一份。

`Engine.cpp` 只多了一行调用（`InstallWebGlobals`）。新代码单独成文件，是因为 `Engine.cpp` 已经一千七百多行，超过[文件拆分规则](../project.md#文件拆分规则)那条线很久了。

### 为什么不全写在 JS 里

jitless。这个运行时只有解释器，逐字节的循环在 JS 里比 C++ 慢一到两个数量级，而这几样恰好都是逐字节的活。量级没在这个运行时里量过，这个判断来自 `crypto` 那一步的经验（摘要「JS 自己算得出来，但 jitless 下慢」）。

### 为什么 `atob` / `btoa` 也在 C++ 里

它们小到可以写在 JS 里，但同样是逐字节的循环，而且 Base64 的输入常常很大（图片、文件）。放 C++ 的代价只是 `TextCodec.cpp` 里多七十行。

JS 这一侧留了一件事：**抛带名字的 `Error`**。原生那边不合法时返回 `undefined`，JS 据此抛 `InvalidCharacterError`。在 C++ 里建一个改了 `name` 的 `Error` 也做得到（`structuredClone` 就是这么做的，因为抛的时机在 V8 的序列化内部，回不到 JS），但能在 JS 里建的就在 JS 里建，和 `crypto` 一致。

## TextEncoder：V8 自己的 UTF-8 写出

`encode()` 是两次调用：`String::Utf8LengthV2` 问要多少字节，`String::WriteUtf8V2` 写进去。标志给 `kReplaceInvalidUtf8`——它把落单的代理项写成 U+FFFD 的三个字节；不给的话写出来的是代理项自己的三字节形式，那不是合法的 UTF-8。两种情况都是三个字节，所以 `Utf8LengthV2` 给的长度不用修正。Node 的 `TextEncoder` 也是这两个调用。

`encodeInto()` 是一次调用：`WriteUtf8V2` 给了容量就只写放得下的完整字符（头文件的说明：*Will not write partial UTF-8 sequences*），它的出参 `processed_characters_return` 正好是 `encodeInto` 要的 `read`。

和随机数那一步一样的坑：**写的是视图覆盖的那一段**，`Buffer()->Data()` 给的是整个缓冲区的起点，要加 `ByteOffset()`。验收里有两条专门盯它（往子视图里写，核对视图外面的字节没动）。

容量是 0 或者字符串是空的时候不调 V8，直接返回 `0, 0`。

这几个接口的名字带 `V2`，是 V8 正在换签名的过渡期（头文件里的 TODO 说以后改回 `WriteUtf8`）。**换 V8 版本时这里要跟着改。**

## TextDecoder：为什么没有用 V8 的解码

V8 有 `String::NewFromUtf8`，它也把非法的序列换成 U+FFFD。没用它，因为它只给结果：

- 不说「有没有换过」，`fatal` 做不了。
- 不说「结尾是不是停在一个序列中间」，`stream` 做不了。
- 换几个 U+FFFD 的规则没有写在头文件里，而我们的判据是和网页逐条相同。

所以解码是照 WHATWG Encoding 标准「UTF-8 decoder」那一节的状态机自己写的（`DecodeUtf8`），变量名也照它：`code_point`、`bytes_needed`、`bytes_seen`、`lower_boundary`、`upper_boundary`。大约一百行。

换几个 U+FFFD 就是这个状态机的直接结果：一个字节接不上时，前面凑到一半的算**一个**错误，**这个字节不消耗**，回到初始状态重新处理。所以 `e4 bd 41` 是一个 U+FFFD 加 `A`；而 `e0 80 af` 是三个——`e0` 后面只许 `a0`–`bf`，`80` 接不上，`e0` 算一个，然后 `80` 和 `af` 各自是落单的后续字节。

### 流的状态：存没凑齐的那几个字节

标准里解码器在两次调用之间要记五个变量。我们只存**上一段结尾没凑齐的那几个字节**（最多 3 个），下一段到了之后先把它们重新喂一遍。这几个字节一定是某个合法序列的前缀，重新喂一遍不会出错也不会有输出，喂完状态机就回到了原来的位置。

好处是状态小到可以放在 JS 一侧：每个 `TextDecoder` 带一个 5 字节的 `Uint8Array`（私有字段），原生那边读写它——没凑齐的字节数、那三个字节、BOM 看过没有。引擎里不用为解码器建对象、不用管它的生命周期。

不带 `stream` 的调用结束时把状态清零，所以「do not flush」那个标志不用存：状态是空的就等于新的一个流。

### BOM 是「流的第一个字符」，不是「输入的前三个字节」

标准把去 BOM 放在解码器外面：解码器吐出来的第一个字符如果是 U+FEFF 就丢掉。由此得出几条不那么显然的行为，验收里各有一条：

- BOM 被切在两段里（`ef bb` / `bf 41`）照样去掉。
- 同一个流后面几段开头的 BOM 留着。
- 先出了一个 U+FFFD（比如开头是 `ff`），后面的 BOM 留着——「第一个字符」已经用掉了。
- 不带 `stream` 调用过一次之后是新的流，BOM 又去掉。

### `fatal` 抛了之后

状态清零，同一个解码器可以接着用。标准没有说得这么细；`fatal` 加 `stream` 中途抛了之后接着喂会怎样，各家实现不一定相同，验收的比对表里没有放这种用例。

### 输出

先解到一个 `std::u16string`，再 `String::NewFromTwoByte`。输出的码元数不会超过输入的字节数（一个字节最多出一个码元，四字节的序列出两个，每个 U+FFFD 至少对应一个字节），所以先按上限分配、最后截断，中间不扩容。

### 在开发机上和 Node 对过

`TextCodec.cpp` 不依赖 V8，可以直接用开发机的编译器编出来跑。做法是 Node 生成用例和它自己的结果，一个小的对照程序读同一批用例、打出 `TextCodec` 的结果，两边逐行比：

| | 条数 |
| --- | --- |
| 解码：一个字节全部、两个字节全部（四种模式），三个和四个字节的边界值组合，15 万条随机切成几段的随机字节串 | 1,365,304 |
| `btoa`：随机字节 | 60,000 |
| `atob`：从字母、等号、各种空白、非法字符里随机拼的串 | 300,000 |

**全部相同**（Node 22.12）。对照程序开着 AddressSanitizer 和 UndefinedBehaviorSanitizer 编的，第一遍就抓到一处越界：四字节序列的最后一个字节也被记进了只有三个位置的「没凑齐的字节」里。这种错在模拟器上多半不崩，只是悄悄写坏栈上相邻的变量。

这只验了算法。和 V8 的绑定（`WebGlobals.cpp`）在开发机上跑不了——预编译的 V8 只有 iOS 的两个切片。

## Base64

编码是标准的 RFC 4648。解码照 HTML 标准的 forgiving-base64 decode，步骤的**次序**是要紧的：

1. 去掉所有 ASCII 空白（制表、换行、换页、回车、空格——纵向制表符不算）。
2. 长度是 4 的倍数时，去掉结尾的一个或两个 `=`。
3. 长度除以 4 余 1：不合法。
4. 还有字母表之外的字符：不合法。

第 2 步只在长度是 4 的倍数时才做，所以 `'YQ='` 不合法（三个字符，`=` 留到第 4 步成了非法字符），而 `'YQ'` 和 `'YQ=='` 都合法。结尾丢掉的那几位不要求是 0，`'YR=='` 和 `'YQ=='` 解出来一样。

字符串和字节之间：`btoa` 的参数先问 `String::ContainsOnlyOneByte()`，有超过 0xFF 的字符就不合法；然后 `WriteOneByteV2` 取出每个码元的低 8 位。`atob` 的输入有超过 0xFF 的字符时直接判不合法——那样的字符既不在字母表里，也不是 ASCII 空白。

## structuredClone：V8 的序列化，补三件事

`v8::ValueSerializer` 就是照 HTML 的结构化克隆算法写的，Chrome 的 `postMessage` 和 `structuredClone` 用的是它。序列化成一段字节，再用 `v8::ValueDeserializer` 读出来，就是一份克隆。环、同一个对象出现多次、`Map` / `Set` / 类型数组 / `Error`、稀疏数组，都是它处理的。

V8 留给宿主的事通过一个委托（`ValueSerializer::Delegate`）来问，我们补了三件：

**1. 「不能克隆」时抛什么。** 标准说 `DataCloneError`（一个 `DOMException`）。我们没有那个类，抛 `name` 是 `DataCloneError` 的 `Error`。信息用 V8 给的原文（`#<WeakMap> could not be cloned.`）。

**2. 哪些普通对象其实不能克隆。** 这是最要紧的一件。原生对象的包装、结构体、`Event`、`URL`，在 V8 眼里全是普通的 JS 对象——包装对象没有内部字段（见[包装机制](wrapper.md)），V8 默认的判断（有没有内部字段）认不出它们。不拦的话 `structuredClone(view)` 会返回一个丢了原型和句柄的空对象，**而且不报错**。

所以委托的 `HasCustomHostObject` 返回 `true`，让 V8 每碰到一个普通对象就来问一次 `IsHostObject`：

- 原型是 `Object.prototype` 或者没有原型的，直接答「不是」，不回 JS。字面量对象占绝大多数，这条快路让一般的克隆不用为这件事多花时间。
- 其余的回 JS 问内置脚本里的 `isPlatformObject()`。它有两种认法：有句柄的是原生对象的包装，有监听器表的是 `EventTarget`——所有原生类和事件源都盖住了，包括以后接进来的和能力包里的；剩下纯 JS 的类按名字列在一张表里（`URL`、`Headers`、结构体那几个……）。

答「是」的对象 V8 交给 `WriteHostObject`，我们在那里抛 `DataCloneError`，信息里写类名。

和网页的做法一致：这些类在网页上的对应物（DOM 节点、`URL`、`Headers`、`Event`）也都不能克隆。用户自己写的类不在此列，它的实例照标准克隆成普通对象。

> **那张按名字列的表要跟着维护。** 新加一个纯 JS 的类（结构体那一种），要往 `28-web-globals.js` 的 `PLATFORM_CLASSES` 里添一行，不然它会被克隆成普通对象。原生类不用管。这一条现在没有机械检查。

**3. `SharedArrayBuffer`。** 还不支持，抛 `DataCloneError`。网页上是克隆和原来的共用同一块内存，做起来不难（委托里按下标记住它，反序列化时还回去），但网页里的 `SharedArrayBuffer` 要特殊的响应首部才有，比对表验不到，就没做。

### `transfer` 还不支持

`options.transfer` 给了非空的数组就抛 `DataCloneError`，信息里写明是它还不支持。这是在 JS 一侧拦的，没有进 V8。

没有悄悄改成复制：转移的语义是「原来的不能再用了」，有的代码靠它来确认所有权交出去了，复制一份会让这类代码在错误的假设上继续跑。

要做的话是 `ValueSerializer::TransferArrayBuffer` 加 `ArrayBuffer::Detach`，V8 都有。

### 序列化出来的那段内存

`ValueSerializer::Release()` 把缓冲区的所有权交出来。委托没有换分配函数，所以它是 `realloc` 要的，用 `free` 还（头文件写明了默认实现用标准库的这两个函数）。

`ArrayBuffer` 的内容直接写在这段字节里，反序列化时再建一个新的，所以一次克隆里二进制数据被复制了两遍。没优化，先能用。

## 参数转换照 Web IDL，不套「null 给空串」

[原则 13](../project.md#原则) 里有一条有意不照搬 Web 的：不可空的字符串，`null` 和 `undefined` 给空串，不给 `'null'`。**这五个没有套它**，`btoa(null)` 是 `'bnVsbA=='`，`new TextEncoder().encode(null)` 是 `null` 四个字母的字节。

理由是这五个的价值就是和 Web 原样一致，npm 上的包是按 Web 的行为写的；`URL` 和 `fetch` 已经是这么做的（`new URL(null)` 解析的是 `'null'`）。那条原则管的是我们自己定形状的 API。

几处细节也照 Web IDL：

- 字符串用模板字符串转（`` `${v}` ``），不用 `String(v)`：前者对 `Symbol` 抛 `TypeError`，后者把它转成 `'Symbol(…)'`。
- 字典参数（`options`）：`undefined` 和 `null` 当成空的，别的不是对象的值抛 `TypeError`。
- 先把参数全部转换完再执行：`new TextDecoder('nope', 5)` 抛的是 `options` 的 `TypeError`，不是标签的 `RangeError`。
- 在别的对象上调方法（`TextEncoder.prototype.encode.call({})`）抛 `TypeError`。靠的是类里一个私有字段，`#brand in obj` 认不认得出来。

## 和 Web 的差别

| | Web | 这里 | 为什么 |
| --- | --- | --- | --- |
| `TextDecoder` 的编码 | 几十种 | 只有 UTF-8，别的抛 `RangeError` | 别的编码各要一张表。网络和文件现在基本都是 UTF-8 |
| 出错时抛的对象 | `DOMException` | 改了 `name` 的 `Error` | 没有 `DOMException` 这个类，和 `crypto`、`fetch` 一致 |
| `transfer` | 转移 | 抛 `DataCloneError` | 见上 |
| `SharedArrayBuffer` | 共用内存 | 抛 `DataCloneError` | 见上 |
| `Blob` | 可以克隆 | 抛 `DataCloneError` | 它是原生对象的包装。要做的话得在 `WriteHostObject` 里认出它、另建一个指向同一份数据的 `Blob` |
| `TextDecoder.decode(null)` | 各家不一样 | 抛 `TypeError` | 标准的签名里这个参数不可空 |
| 全局上这五个名字的属性 | `atob` / `btoa` / `structuredClone` 可枚举 | 都不可枚举 | 和运行时别的全局（`setTimeout`、`fetch`）一致 |
| 两个类的取值器 | 可枚举 | 不可枚举 | 是用 `class` 写的 |

验收的比对表里，前五行里网页有而我们明确不做的那几条（别的编码、`transfer`）不和网页比，断言它们按约定的方式抛。

## 验收怎么验的

`acceptance/src/steps/web-globals.js`，两段：

- **固定期望值**，二百六十多条：每个成员的正常用法、每一种出错情况、每一条明确不支持的，以及运行时自己的对象（`UIView`、`Blob`、`CGRect`、`application`……）不能克隆。
- **和网页逐条比对**，一千二百多条（`web-globals-cases.js`）：同一张表在一个看不见的 `WebView` 里跑一遍、在运行时里跑一遍。重点在边界——非法 UTF-8 的各种形状、一到两个字节的全部组合、同一串字节在每个位置切开分段解、Base64 的空白和补位的各种组合、克隆之后各种类型的形状。

写用例的时候在 Node 里跑过：Node 也有这五个全局，固定期望值里除了有意和它不同的（别的编码、平台对象、`transfer`），全部对得上。内置脚本那一层（参数转换、报错）也在 Node 里用一个假的原生桥跑过整张比对表，和 Node 自己的结果只有 7 条不同，都是 Node 不照 Web IDL 的地方（比如它的 `decode()` 不查 `options` 的类型）。

**这些都不能代替在运行时里跑。** 没验的见下一节。

## 没验证的

- **全部运行期的行为。** 编译通过了（Debug 和 Release），没有在模拟器和真机上跑过。
- V8 那几个接口在这个版本上的实际行为：`WriteUtf8V2` 在容量不够时停在哪、`processed_characters_return` 对代理对怎么数、`ContainsOnlyOneByte` 对内部是双字节但内容全是 Latin-1 的字符串答什么。都是照头文件的说明写的。
- `IsHostObject` 是不是对包装对象也来问（依据是 V8 的源码逻辑和头文件的说明，没跑过）。
- 和 WebKit 的比对。用例是照标准写的，WebKit 在个别地方可能和标准不同（比如 `Error` 的克隆、`decode()` 的参数检查），那样的条目要逐条看是谁对。
- 大输入的耗时和内存。
