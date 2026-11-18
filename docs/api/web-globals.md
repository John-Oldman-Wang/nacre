---
type: reference
status: partial
---

# 文字、字节和深拷贝

这一页讲五个全局：`TextEncoder`、`TextDecoder`、`btoa`、`atob`、`structuredClone`。它们在浏览器和 Node 里都有，名字和用法在这里相同。App 启动时它们就存在，不需要引入。

| 全局 | 做什么 |
| --- | --- |
| **`TextEncoder`** | 把字符串编码成 UTF-8 的字节 |
| **`TextDecoder`** | 把 UTF-8 的字节解码成字符串 |
| **`btoa()`** | 把字节编码成 Base64 文本 |
| **`atob()`** | 把 Base64 文本解码成字节 |
| **`structuredClone()`** | 深拷贝一个值：对象、数组、`Map`、`Set`、`Date`、二进制数据，一层一层全部复制 |

> **注意**：这一页里的结果都还没有在模拟器里跑过，每一处都标了「未在模拟器验证」。结果来自标准（WHATWG Encoding、HTML）和验收用例里写的期望值。

## 字符串和字节是两种东西

网络请求的内容、文件、加密函数的输入都是字节（`Uint8Array`）。JS 的字符串不是字节，它是一串 16 位的码元。两者之间要转换：

- 字符串变字节用 `new TextEncoder().encode(text)`。
- 字节变字符串用 `new TextDecoder().decode(bytes)`。

转换用的编码是 UTF-8。一个字符占的字节数不固定：英文字母 1 个字节，带重音的字母 2 个，汉字 3 个，表情 4 个。所以字节数和 `text.length` 一般不相等。

**只支持 UTF-8。** `new TextDecoder('gbk')` 这类别的编码在创建时抛 `RangeError`。

## 字节不是合法的 UTF-8 时

解码不会失败，也不会丢掉后面的内容。不合法的那几个字节换成 `�`（U+FFFD，替换字符），其余照常解码。

要在遇到不合法的字节时得到一个异常，创建时写 `new TextDecoder('utf-8', { fatal: true })`。这时 `decode()` 抛 `TypeError`。校验一段数据是不是合法的 UTF-8 用这个写法。

## Base64 的两个函数处理的是字节，不是文字

`btoa()` 的参数是字符串，但它把每个字符当成一个字节（0–255）。字符串里有汉字或表情时，`btoa()` 抛异常，`name` 是 `InvalidCharacterError`。

要把任意文字编码成 Base64，先用 `TextEncoder` 转成字节，写法见[把文字编码成 Base64](#把文字编码成-base64)。

`atob()` 反过来：它返回的字符串里每个字符是一个字节。原文是文字时，还要用 `TextDecoder` 解码一次。

## 哪些值不能深拷贝

`structuredClone()` 复制的是数据。下面这些不是数据，传进去时抛异常，`name` 是 `DataCloneError`：

- 函数、`Symbol`。
- 原生对象：`UIView`、`UIColor`、`UIImage`、`Blob`，以及所有其他原生类的实例。
- 结构体：`CGRect`、`CGPoint` 等。
- 事件和事件源：`Event`、`EventTarget`、`application`。
- `URL`、`Headers`、`Request`、`Response` 等运行时自己的类的实例。
- `WeakMap`、`WeakSet`、`WeakRef`、`Promise`。

要拷贝的对象里只要有一处是上面这些，整个调用就抛异常，不会返回拷贝了一半的结果。

自己写的类的实例可以拷贝，但得到的是普通对象：字段都在，方法和原型没有了。

## 完整例子

下面的代码把一段文字转成字节，再编码成 Base64，然后原路解回来，最后深拷贝一个对象。它不需要界面，直接写在 `main.js` 顶层就能运行。

```js
// 1. 文字 → UTF-8 的字节
const encoder = new TextEncoder();
const bytes = encoder.encode('你好');
console.log(bytes.length, Array.from(bytes));

// 2. 字节 → Base64 文本。btoa 要的是「每个字符一个字节」的字符串
const base64 = btoa(String.fromCharCode(...bytes));
console.log(base64);

// 3. Base64 文本 → 字节 → 文字
const back = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
console.log(new TextDecoder().decode(back));

// 4. 深拷贝：改拷贝出来的，原来的不变
const settings = { theme: 'dark', recent: [1, 2, 3], savedAt: new Date() };
const copy = structuredClone(settings);
copy.recent.push(4);
console.log(settings.recent.length, copy.recent.length, copy.savedAt instanceof Date);
```

**结果**（未在模拟器验证）：控制台依次输出

- `6 [228,189,160,229,165,189]`：两个汉字各占 3 个字节。
- `5L2g5aW9`
- `你好`
- `3 4 true`：拷贝里的数组是另一个数组，`Date` 还是 `Date`。

## 常见用法

### 算一段文字占多少字节

```js
const size = new TextEncoder().encode('a你😀').length;
console.log(size);
```

**结果**（未在模拟器验证）：输出 `8`。字母 1 个字节，汉字 3 个，表情 4 个。`'a你😀'.length` 是 4，因为表情在字符串里占两个码元。

### 读一段字节里的文字

`decode()` 接受 `ArrayBuffer` 和任何视图。读的是视图覆盖的那一段，所以可以直接传一个子视图，不用先复制出来。

```js
const packet = new Uint8Array([0x00, 0x05, 0x68, 0x65, 0x6c, 0x6c, 0x6f, 0xff]);
// 第 2 到第 6 个字节是文字
const text = new TextDecoder().decode(packet.subarray(2, 7));
console.log(text);
```

**结果**（未在模拟器验证）：输出 `hello`。前两个字节和最后一个字节没有被读。

### 数据分几段到达时解码

一个字符的几个字节可能被分在两段里。每一段都带 `{ stream: true }`，解码器会把结尾没凑齐的字节留到下一段。全部到齐后不带参数再调一次 `decode()`。

```js
const decoder = new TextDecoder();
// 「你」的三个字节 e4 bd a0 被分成了两段
const first = decoder.decode(new Uint8Array([0x41, 0xe4, 0xbd]), { stream: true });
const second = decoder.decode(new Uint8Array([0xa0, 0x42]), { stream: true });
const rest = decoder.decode();
console.log(JSON.stringify([first, second, rest]));
```

**结果**（未在模拟器验证）：输出 `["A","你B",""]`。第一段只解出 `A`，「你」等第二段的字节到了才出现。

不带 `stream` 分别解这两段，会得到 `A�` 和 `�B`：每一段里不完整的字节各换成一个 `�`。

### 校验字节是不是合法的 UTF-8

```js
function isValidUTF8(bytes) {
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return true;
  } catch {
    return false;
  }
}

console.log(isValidUTF8(new Uint8Array([0xe4, 0xbd, 0xa0])));
console.log(isValidUTF8(new Uint8Array([0xe4, 0xbd])));
```

**结果**（未在模拟器验证）：输出 `true`，然后 `false`。第二个数组里的序列少了最后一个字节。

### 把文字编码成 Base64

```js
function textToBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function base64ToText(base64) {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

const encoded = textToBase64('你好，世界');
console.log(encoded);
console.log(base64ToText(encoded));
```

**结果**（未在模拟器验证）：输出 `5L2g5aW977yM5LiW55WM`，然后 `你好，世界`。

直接写 `btoa('你好，世界')` 会抛 `InvalidCharacterError`。

### 往同一块缓冲区里反复写

`encode()` 每次返回一个新数组。要避免反复分配，用 `encodeInto()`，它把字节写进已有的数组，并返回写了多少。

```js
const buffer = new Uint8Array(8);
const result = new TextEncoder().encodeInto('你好吗', buffer);
console.log(result.read, result.written);
```

**结果**（未在模拟器验证）：输出 `2 6`。缓冲区有 8 个字节，每个汉字 3 个字节，所以写进了前两个字。第三个字放不下，一个字节都没有写，`buffer` 的最后 2 个字节还是 0。

`read` 是已经处理的字符串长度（按 `text.length` 的算法），所以剩下没写的部分是 `text.slice(result.read)`。

### 深拷贝之后原对象不受影响

```js
const original = {
  name: 'draft',
  tags: new Set(['a', 'b']),
  history: new Map([['v1', { at: new Date(0) }]]),
  bytes: new Uint8Array([1, 2, 3]),
};
const copy = structuredClone(original);

copy.tags.add('c');
copy.bytes[0] = 9;
console.log(original.tags.size, copy.tags.size);
console.log(original.bytes[0], copy.bytes[0]);
```

**结果**（未在模拟器验证）：输出 `2 3`，然后 `1 9`。`Set`、`Map`、`Date`、类型数组在拷贝里还是原来的类型，内容是独立的一份。

### 拷贝带循环引用的对象

`JSON.parse(JSON.stringify(value))` 遇到循环引用会抛异常，`structuredClone()` 不会。

```js
const parent = { name: 'parent', children: [] };
const child = { name: 'child', parent };
parent.children.push(child);

const copy = structuredClone(parent);
console.log(copy.children[0].parent === copy, copy !== parent);
```

**结果**（未在模拟器验证）：输出 `true true`。拷贝里的子对象指向拷贝出来的父对象，不指向原来的。

### 判断一个值能不能拷贝

```js
function tryClone(value) {
  try {
    return structuredClone(value);
  } catch (err) {
    if (err.name === 'DataCloneError') return null;
    throw err;
  }
}

console.log(tryClone({ a: 1 }));
console.log(tryClone({ onTap() {} }));
```

**结果**（未在模拟器验证）：输出 `{"a":1}`，然后 `null`。第二个对象里有函数。

## 概念

### 码元、字符和字节

JS 字符串的 `length` 数的是码元，一个码元 16 位。常用的字符（字母、汉字）占一个码元。表情和一部分生僻字占两个码元，这两个码元合起来叫一对代理项。

UTF-8 的字节数是另一个数：

| 字符 | 码元数（`length`） | UTF-8 字节数 |
| --- | --- | --- |
| `a` | 1 | 1 |
| `é` | 1 | 2 |
| `你` | 1 | 3 |
| `😀` | 2 | 4 |

`encodeInto()` 返回的 `read` 按码元数算，`written` 按字节数算。

一对代理项只剩一半时（比如把一个表情从中间切开），这半个不是合法的字符。`encode()` 把它编码成 `�` 的三个字节 `ef bf bd`，不抛异常。

### BOM

BOM 是文件开头的一个不可见字符（U+FEFF），UTF-8 里是三个字节 `ef bb bf`。有些软件（Windows 上的记事本、Excel 导出的 CSV）会在文件开头加它。

`decode()` 默认去掉开头的这一个 BOM，所以解出来的字符串可以直接用。要保留它，创建时写 `{ ignoreBOM: true }`。不在开头的 BOM 不会被去掉。

### 「每个字符是一个字节」的字符串

`btoa()` 的参数和 `atob()` 的返回值都是这种字符串：每个字符的编码在 0 到 255 之间，代表一个字节。它不是给人看的文字，只是字节的另一种装法。

在它和 `Uint8Array` 之间转换：

```js
const bytes = new Uint8Array([72, 105, 255]);
const binary = String.fromCharCode(...bytes);
const again = Uint8Array.from(binary, (c) => c.charCodeAt(0));
console.log(binary.length, again[2]);
```

**结果**（未在模拟器验证）：输出 `3 255`。

> **注意**：`String.fromCharCode(...bytes)` 把每个字节当成一个参数传进去。字节很多（几万个以上）时改用循环拼接，见[把文字编码成 Base64](#把文字编码成-base64)里的写法。

## 成员说明

### `TextEncoder`

`new TextEncoder()` 没有参数。

| 属性 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `encoding` | `string` | 是 | 否 | 总是 `'utf-8'` |

#### `encode(input)`

把字符串编码成 UTF-8。

- **参数**：`input` 是字符串，可以不给。不给或者给 `undefined` 时当成空串。别的类型先转成字符串：`encode(null)` 编码的是 `'null'` 这四个字母，`encode(12.5)` 编码的是 `'12.5'`。
- **返回值**：一个新的 `Uint8Array`，长度是字节数。
- 落单的代理项编码成 `ef bf bd`（`�`）。
- **出错**：参数是 `Symbol` 时抛 `TypeError`。

#### `encodeInto(source, destination)`

把字符串编码进一个已有的数组，从数组的开头写起。

- **参数**：`source` 是字符串，别的类型先转成字符串。`destination` 必须是 `Uint8Array`。它是子视图时，只写视图覆盖的那一段。
- **返回值**：`{ read, written }`。`read` 是处理了多少个码元，`written` 是写了多少个字节。
- 数组放不下全部内容时，写到最后一个放得下的完整字符为止。不会写半个字符。
- 没写到的位置保持原值。
- **出错**：
  - `destination` 不是 `Uint8Array`（包括 `Uint8ClampedArray`、`ArrayBuffer`、`DataView`、普通数组）：`TypeError: TextEncoder.encodeInto: the destination must be a Uint8Array`
  - 少了参数：`TypeError: TextEncoder.encodeInto: 2 arguments required, but only 1 present`

### `TextDecoder`

`new TextDecoder(label, options)`，两个参数都可以不给。

- `label` 是编码的名字，默认 `'utf-8'`。只认 UTF-8 的几种写法：`utf-8`、`utf8`、`unicode-1-1-utf-8`、`unicode11utf8`、`unicode20utf8`、`x-unicode20utf8`。不分大小写，首尾的空白会被去掉。
- `options` 是一个对象：

| 键 | 类型 | 默认值 | 含义 |
| --- | --- | --- | --- |
| `fatal` | `boolean` | `false` | `true`：遇到不合法的字节时 `decode()` 抛 `TypeError`。`false`：换成 `�` |
| `ignoreBOM` | `boolean` | `false` | `true`：保留开头的 BOM。`false`：去掉 |

两个键的值按布尔转换：`{ fatal: 1 }` 是 `true`，`{ fatal: 'false' }` 也是 `true`（非空字符串）。

**出错**：

- 别的编码，或者不认识的名字：`RangeError: TextDecoder: the encoding "gbk" is not supported. This runtime only decodes UTF-8; expected one of: utf-8, utf8, unicode-1-1-utf-8, unicode11utf8, unicode20utf8, x-unicode20utf8`
- `options` 不是对象（比如数字）：`TypeError: TextDecoder: the options must be an object`。`null` 和 `undefined` 当成没给。

| 属性 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `encoding` | `string` | 是 | 否 | 总是 `'utf-8'` |
| `fatal` | `boolean` | 是 | 否 | 创建时给的 `fatal` |
| `ignoreBOM` | `boolean` | 是 | 否 | 创建时给的 `ignoreBOM` |

这三个值创建之后不会变，所以没有变化通知。

#### `decode(input, options)`

把字节解码成字符串。

- **参数**：
  - `input` 是 `ArrayBuffer`、`SharedArrayBuffer`，或者任何视图（`Uint8Array`、`DataView`、别的类型数组、子视图）。可以不给，不给时当成 0 个字节。视图只读它覆盖的那一段，按字节读，不管视图的元素是几个字节。
  - `options.stream` 是布尔值，默认 `false`。`true` 表示后面还有数据：结尾没凑齐的字节留到下一次调用。`false` 表示这是最后一段：结尾没凑齐的字节换成一个 `�`（`fatal` 时抛异常），然后解码器回到初始状态。
- **返回值**：字符串。
- 不合法的字节换成 `�`。一段连续的不合法字节换成几个 `�`，规则和浏览器相同：例如 `e4 bd`（少一个字节的汉字）是 1 个，`c0 af` 是 2 个，`ed a0 80` 是 3 个。
- `input` 不会被修改。
- 一个 `TextDecoder` 可以反复用。不带 `stream` 的调用之间互不影响。
- **出错**：
  - `input` 是别的类型（字符串、数字、普通数组、`null`）：`TypeError: TextDecoder.decode: the input must be an ArrayBuffer, a SharedArrayBuffer or a view on one (Uint8Array, DataView, ...)`
  - `fatal` 为 `true` 且字节不合法：`TypeError: TextDecoder.decode: the input is not valid UTF-8`。抛出之后这个解码器回到初始状态，可以继续用。
  - `options` 不是对象：`TypeError: TextDecoder.decode: the options must be an object`

### `btoa(data)`

把字节编码成 Base64。

- **参数**：`data` 是「每个字符是一个字节」的字符串。别的类型先转成字符串：`btoa(null)` 编码的是 `'null'`。
- **返回值**：Base64 字符串。只含 `A–Z`、`a–z`、`0–9`、`+`、`/`，结尾用 `=` 补到长度是 4 的倍数。
- **出错**：
  - 字符串里有编码大于 255 的字符：`InvalidCharacterError: btoa: the string contains characters outside of the Latin1 range (code points above 0xFF). To encode arbitrary text, convert it to UTF-8 bytes with TextEncoder first`
  - 不给参数：`TypeError: btoa: 1 argument required, but only 0 present`

### `atob(data)`

把 Base64 解码成字节。

- **参数**：`data` 是 Base64 字符串。别的类型先转成字符串。
- **返回值**：「每个字符是一个字节」的字符串。
- 输入里的空格、制表符、换行、换页、回车先被去掉，可以出现在任何位置。
- 结尾的 `=` 可以不写：`atob('YQ')` 和 `atob('YQ==')` 结果相同。
- **出错**：下面几种情况抛 `InvalidCharacterError: atob: the string is not correctly encoded Base64`
  - 有 Base64 字母表之外的字符。`-` 和 `_`（URL 里用的那种 Base64）也不认。
  - 去掉空白之后长度除以 4 余 1，比如 `'Y'`。
  - `=` 的位置或个数不对，比如 `'YQ='`、`'YQ==='`、`'Y=Q='`。
- 不给参数：`TypeError: atob: 1 argument required, but only 0 present`

`btoa()` 和 `atob()` 抛出的 `InvalidCharacterError` 是 `Error` 对象，用 `err.name` 判断。

### `structuredClone(value, options)`

深拷贝一个值。

- **参数**：`value` 是要拷贝的值。`options` 可以不给。
- **返回值**：拷贝出来的值。基本类型原样返回。

可以拷贝的类型，以及拷贝之后的样子：

| 类型 | 拷贝之后 |
| --- | --- |
| 数字、字符串、布尔、`null`、`undefined`、`BigInt` | 值相同 |
| 普通对象 | 新的对象。只带自己的、可枚举的、键是字符串的属性。取值器被读一次，拷贝里是读到的值 |
| 数组 | 新的数组。长度相同，空位还是空位 |
| `Date` | 新的 `Date`，时间相同 |
| `RegExp` | 新的 `RegExp`，模式和标志相同，`lastIndex` 是 0 |
| `Map`、`Set` | 新的 `Map`、`Set`，键和值也被拷贝，顺序相同 |
| `ArrayBuffer` | 新的 `ArrayBuffer`，字节复制了一份 |
| 类型数组、`DataView` | 类型相同。它底下的整个 `ArrayBuffer` 被复制，偏移和长度不变 |
| `Error`、`RangeError`、`TypeError` 等 | 类型相同，`message`、`cause`、`stack` 带着。`name` 被改成别的名字的，拷贝之后是 `Error`。自己加的字段不带 |
| 自己写的类的实例 | 普通对象，字段在，方法和原型没有 |

同一个对象在 `value` 里出现多次时，拷贝里也是同一个对象。循环引用照常拷贝。

**出错**：

- `value` 里有不能拷贝的东西（见[哪些值不能深拷贝](#哪些值不能深拷贝)），抛 `DataCloneError`。`message` 说明是哪一个，例如 `#<UIView> could not be cloned.`、`Symbol(id) could not be cloned.`。它是 `Error` 对象，用 `err.name` 判断。
- `options.transfer` 给了非空的数组：`DataCloneError: structuredClone: options.transfer is not supported yet; leave it out and the ArrayBuffer is copied instead`。给空数组或者不给都可以。
- `options` 不是对象：`TypeError: structuredClone: the options must be an object`
- `options.transfer` 不是数组：`TypeError: structuredClone: options.transfer must be an array`
- 不给参数：`TypeError: structuredClone: 1 argument required, but only 0 present`
- 读 `value` 的某个属性时取值器抛了异常：那个异常原样抛出来，不改成 `DataCloneError`。

## 和浏览器的对照

这五个全局的名字、参数、返回值和浏览器里的相同。下面列出不同的地方。

| 情况 | 浏览器 | 这里 |
| --- | --- | --- |
| `TextDecoder` 支持的编码 | UTF-8、UTF-16、GBK、Shift_JIS 等几十种 | 只有 UTF-8。别的在创建时抛 `RangeError` |
| `btoa`、`atob`、`structuredClone` 出错时抛出的对象 | `DOMException` | `Error`，`name` 相同（`InvalidCharacterError`、`DataCloneError`）。按 `err.name` 判断的代码照常工作，按 `instanceof DOMException` 判断的不行，这里没有 `DOMException` 这个类 |
| `structuredClone(value, { transfer: [buffer] })` | 把 `buffer` 转移给拷贝，原来的不能再用 | 抛 `DataCloneError`。不写 `transfer`，`buffer` 会被复制一份 |
| `structuredClone(new SharedArrayBuffer(8))` | 拷贝和原来的共用同一块内存 | 抛 `DataCloneError` |
| `structuredClone(new Blob(['x']))` | 可以 | 抛 `DataCloneError` |
| `TextEncoderStream`、`TextDecoderStream` | 有 | 没有 |

## 还不能做的

| 想做的事 | 对应的 Web 能力 | 状态 |
| --- | --- | --- |
| 解码 GBK、UTF-16 等别的编码的文字 | `new TextDecoder('gbk')` | 未实现 |
| 拷贝时把 `ArrayBuffer` 转移过去而不是复制 | `structuredClone()` 的 `transfer` | 未实现 |
| 深拷贝 `Blob` | `structuredClone(blob)` | 未实现 |
| 边读数据流边解码 | `TextDecoderStream` | 未实现。用 `decode()` 的 `stream` 选项逐段解码 |
| 判断异常是不是 `DOMException` | `DOMException` 类 | 未实现。用 `err.name` 判断 |

## 参见

- [`fetch`](fetch.md)：`response.text()` 和 `response.arrayBuffer()` 已经做了字节和文字的转换，读网络内容一般不需要自己解码
- [文件读写](filesystem.md)：读写文件的文字和字节
- [`crypto`](crypto.md)：生成随机字节，配合 `btoa()` 可以得到随机的文本令牌
- [运行时怎么工作](how-it-works.md)：有哪些全局对象
