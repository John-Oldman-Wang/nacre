# 参数转换

← [实现原理](README.md)

JS 的值怎么变成原生要的类型。规则定在 [项目说明](../project.md) 的 API 设计原则第 13 条：**API 层宽松接收，照 Web IDL 转换；交给原生的值必须类型精确，原生只校验不转换。**

这一页记它是怎么来的、分几步落地、每一步量到了什么。

## 起因：`{ atIndex: undefined }` 让 App 闪退

一份试用反馈，模拟器上三处复现：

```js
view.insertSubview(child, { atIndex: undefined });
stack.insertArrangedSubview(view, { atIndex: undefined });
UIImage.imageWithData(blob, { scale: undefined });
```

都是 `-[NSNull integerValue]`（或 `doubleValue`）`: unrecognized selector`，进程直接没了，JS 的 `try / catch` 接不到。

链条有四环，每一环单看都不算错：

| | 发生了什么 |
| --- | --- |
| 1 | `nacre.js` 用 `'atIndex' in o` 判断「带没带」。`in` 只看键在不在，`{ atIndex: undefined }` 算带了 |
| 2 | 参数打包成数组过桥，`JSON.stringify([view, undefined])` 把 `undefined` 变成 `null` |
| 3 | `NSJSONSerialization` 把数组里的 `null` 解成 `NSNull` |
| 4 | 原生直接 `[arg integerValue]`。`NSNull` 不认识这个方法，抛 ObjC 异常；外面没有 `@try`，进程终止 |

第 2 环还说明了另一件事：**`NaN` 和 `Infinity` 走同一条路**——`JSON.stringify` 同样把它们变成 `null`。所以不只是 `undefined`。

排查时顺带发现属性写入那条通道的后果不一样，而且更难查：顶层的 `null` 被 `DecodeJSON` 解成 `nil`，而对 `nil` 调 `doubleValue` 得到 0。于是 `view.alpha = undefined` 不闪退，**静默把透明度写成 0**，视图直接消失。

## 方向是用户定的：接收宽松，提交严格

我最初的建议是「类型不对一律抛」，和枚举一致。用户否了：API 层要保持灵活，像 Web 那样；但交到原生手里的东西必须是严格的。

这正是 Web IDL 的做法——每个参数声明了类型，JS 的值进来时按类型转换（`button.disabled = 'false'` 得到 `true`，`el.textContent = 5` 得到 `'5'`），转不出合法值才抛。我们照搬，两处例外记在第 13 条里。

转换必须放在 JS 一侧，有一个硬原因：就是上面第 2 环。值过了 JSON，`NaN`、`Infinity`、`undefined` 全成了 `null`，原生已经分不清原来是什么。

## 第 1 步：options 里值是 `undefined` 的成员视为没带

Web IDL 对字典（也就是 options 对象）的规定：成员的值是 `undefined`，等于这个成员不存在。

落到代码上是一个助手：

```js
function has(o, key) { return o[key] !== undefined; }
```

`'key' in o` 一共 39 处（34 行），全部换成 `has(o, 'key')`。另有 4 行 `'width' in value` 没动——那是在认结构体的形状，不是在判断可选参数。

换完之后，反馈里的三处各归各位，一行原生代码都没改：

| | 结果 |
| --- | --- |
| `insertSubview(child, { atIndex: undefined })` | 三个键都算没带，走到已有的 `TypeError: insertSubview needs one of …` |
| `insertArrangedSubview(view, { atIndex: undefined })` | 必填的没带，走到已有的 `TypeError: insertArrangedSubview needs { atIndex }` |
| `imageWithData(blob, { scale: undefined })` | 等于没带 `scale`，走 `imageWithData:` 那条路 |

**运行时自己用 JS 实现的类是同一个毛病。** `Request`、`Response`、`Blob` 也是 `'method' in o ? String(o.method) : …`，于是 `new Request(url, { method: undefined })` 的方法名是 `"UNDEFINED"`。同一次替换一起改掉了。

这一步只堵了 `undefined` 从 options 进来的那一个口子。`{ atIndex: NaN }`、`{ atIndex: null }` 仍然会走到原生，要等后面两步。


## 第 2 步：API 层按类型转换

七个助手，都在 `nacre.js`：

| 助手 | 规则 | 对应 Web IDL 的 |
| --- | --- | --- |
| `toNumber(v, what)` | `Number(v)`，不是有限数就抛 | `double` |
| `toInteger(v, what)` | `toNumber` 后向零取整 | 带 `[EnforceRange]` 的整数 |
| `toBoolean(v)` | `Boolean(v)` | `boolean` |
| `toText(v)` | `null` / `undefined` 给空串，其余 `String(v)` | 带 `[LegacyNullToEmptyString]` 的 `DOMString` |
| `toTextOrNull(v)` | `null` / `undefined` 给 `null`，其余 `String(v)` | `DOMString?` |
| `toNumberOrName(v, what)` | 看着像数的字符串按数，其余字符串原样，别的走 `toNumber` | 没有对应物 |
| `toNumbersOrNull(v, what)` | 可迭代对象逐个 `toNumber`，报错点名是第几个 | `sequence<double>?` |

### 怎么知道每个属性该用哪个

取值器是手写的，一共 146 个把 `value` 原样交给原生的。逐个看太容易漏，所以用脚本对：**类型定义里这个属性声明成什么类型，就接哪个助手**——`number` 接 `toNumber`、`boolean` 接 `toBoolean`、`string | null` 接 `toTextOrNull`。整数是从原生那一侧认的（用 `integerValue` 取的那几个：`tag`、`numberOfLines`、`numberOfTapsRequired`、`numberOfTouchesRequired`、`maximumMessageSize`）。

脚本接上了 110 个；剩下 36 个全是枚举（和一个 `userInfo`），不转，继续由原生认名字。方法的参数没有可以对照的表，是逐个看的，三十来处。

### `toNumberOrName` 是我们自己加的

`spacing` 能写 `'system'`、`priority` 能写 `'required'`、`decelerationRate` 能写 `'fast'`——这些属性的类型是「数，或者一个名字」。照 `toNumber` 走会把 `'system'` 拒掉，原样放行又会让 `'12'` 被当成名字去查表（查不到，报「没有这个值」）。所以单独一条：字符串先看它是不是数。

### 不可空的字符串，`null` 给空串

Web IDL 的普通 `DOMString` 遇到 `null` 得到 `"null"`、遇到 `undefined` 得到 `"undefined"`，所以 `el.setAttribute('x', null)` 的结果是字面量 `null`。这是 Web 里公认的坑，没有人是有意这么写的。Web 自己在 `input.value`、`innerHTML` 这些地方加了 `[LegacyNullToEmptyString]` 把它改成空串。我们的不可空字符串一律走后一种。

### 结构体的构造函数

以前 `num()` 把转不出来的值**静默变成 0**——`new CGPoint('a', NaN)` 是 `(0, 0)`。现在不给的参数（`undefined`）是 0，和 `new DOMPoint()` 一致；给了就走 `toNumber`，转不出来就抛。

### 类型定义没有跟着放宽

`@nacre/types` 里 `alpha` 仍然是 `number`。`lib.dom.d.ts` 也是这么做的：`el.hidden = 'x'` 运行时合法，类型检查报错。宽松是给运行时兜底的，不是推荐的写法。

### 上层那几个对象没动

`application.storage`、`fileSystem`、`keychain` 的键和路径有各自的校验（`storageKey`、`filePath`、`keychainKey`），它们不经过上面这条路，也从来不会把没校验过的值交给原生。这一步没有碰它们；它们要不要也放宽是另一件事。

### 连带改掉的断言

前几步按「类型不对就抛」写的四条断言反过来了：点按次数给小数（现在截成整数）、长按时长给数字字符串（现在按数用）、剪贴板写数字（现在转成字符串）、虚线段给 `['4']`（现在是 `[4]`）。最后一条是跑模拟器时才发现的——它是全部一千多条旧断言里唯一受影响的。负的次数、超出 0 到 1 的强度仍然抛——那是取值范围，不归这条规则管。
