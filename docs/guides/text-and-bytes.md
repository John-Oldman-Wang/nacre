# 在文字和字节之间转换

这一篇讲怎么用 [`TextEncoder`](../api/text-encoder.md) 和 [`TextDecoder`](../api/text-decoder.md) 在字符串和 UTF-8 字节之间转换，怎么用 [`btoa()`](../api/web-globals/btoa.md) 和 [`atob()`](../api/web-globals/atob.md) 编码 Base64，怎么用 [`structuredClone()`](../api/web-globals/structuredclone.md) 深拷贝一个值。这一组 API 的总览见[文字、字节和深拷贝](../api/web-globals.md)。

这一篇里的结果都还没有在模拟器里跑过，每一处都标了「未在模拟器验证」。结果来自标准（WHATWG Encoding、HTML）和验收用例里写的期望值。

## 推荐的做法

- **读网络内容时先用 `fetch()` 自带的读法。** `response.text()` 和 `response.arrayBuffer()` 已经做了字节和文字的转换，一般不需要自己解码，见 [`fetch()`](../api/fetch.md)。
- **把文字编码成 Base64，先用 `TextEncoder` 转成字节。** `btoa()` 只认「每个字符是一个字节」的字符串，直接传汉字会抛异常，见[把文字编码成 Base64](#把文字编码成-base64)。
- **数据分几段到达时，每段都带 `{ stream: true }`。** 不带的话，被切开的字符会变成 `�`，见[数据分几段到达时解码](#数据分几段到达时解码)。
- **深拷贝用 `structuredClone()`，不用 `JSON.parse(JSON.stringify(value))`。** 后者遇到循环引用会抛异常，`Date`、`Map`、`Set` 会丢掉类型。

## 第一个例子

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

下面每一节的代码各自新建变量，不沿用这里的。

## 算一段文字占多少字节

```js
const size = new TextEncoder().encode('a你😀').length;
console.log(size);
```

**结果**（未在模拟器验证）：输出 `8`。字母 1 个字节，汉字 3 个，表情 4 个。`'a你😀'.length` 是 4，因为表情在字符串里占两个码元，见[码元、字符和字节](../api/text-encoder.md#码元字符和字节)。

## 读一段字节里的文字

`decode()` 接受 `ArrayBuffer` 和任何视图。读的是视图覆盖的那一段，所以可以直接传一个子视图，不用先复制出来。

```js
const packet = new Uint8Array([0x00, 0x05, 0x68, 0x65, 0x6c, 0x6c, 0x6f, 0xff]);
// 第 2 到第 6 个字节是文字
const text = new TextDecoder().decode(packet.subarray(2, 7));
console.log(text);
```

**结果**（未在模拟器验证）：输出 `hello`。前两个字节和最后一个字节没有被读。

## 数据分几段到达时解码

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

## 校验字节是不是合法的 UTF-8

```js
/** @param {Uint8Array} input */
function isValidUTF8(input) {
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(input);
    return true;
  } catch {
    return false;
  }
}

console.log(isValidUTF8(new Uint8Array([0xe4, 0xbd, 0xa0])));
console.log(isValidUTF8(new Uint8Array([0xe4, 0xbd])));
```

**结果**（未在模拟器验证）：输出 `true`，然后 `false`。第二个数组里的序列少了最后一个字节。

## 把文字编码成 Base64

```js
/** @param {string} input */
function textToBase64(input) {
  const encoded = new TextEncoder().encode(input);
  let binary = '';
  for (const b of encoded) binary += String.fromCharCode(b);
  return btoa(binary);
}

/** @param {string} input */
function base64ToText(input) {
  const binary = atob(input);
  const decoded = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(decoded);
}

const greeting = textToBase64('你好，世界');
console.log(greeting);
console.log(base64ToText(greeting));
```

**结果**（未在模拟器验证）：输出 `5L2g5aW977yM5LiW55WM`，然后 `你好，世界`。

直接写 `btoa('你好，世界')` 会抛 `InvalidCharacterError`。这里用循环把字节拼成字符串，不用 `String.fromCharCode(...bytes)`：后者把每个字节当成一个参数，字节很多（几万个以上）时不适用。

## 往同一块缓冲区里反复写

`encode()` 每次返回一个新数组。要避免反复分配，用 [`encodeInto()`](../api/text-encoder/encodeinto.md)，它把字节写进已有的数组，并返回写了多少。

```js
const buffer = new Uint8Array(8);
const result = new TextEncoder().encodeInto('你好吗', buffer);
console.log(result.read, result.written);
```

**结果**（未在模拟器验证）：输出 `2 6`。缓冲区有 8 个字节，每个汉字 3 个字节，所以写进了前两个字。第三个字放不下，一个字节都没有写，`buffer` 的最后 2 个字节还是 0。

`read` 是已经处理的字符串长度（按 `text.length` 的算法），所以剩下没写的部分是 `text.slice(result.read)`。

## 深拷贝之后原对象不受影响

```js
const original = {
  name: 'draft',
  tags: new Set(['a', 'b']),
  history: new Map([['v1', { at: new Date(0) }]]),
  data: new Uint8Array([1, 2, 3]),
};
const cloned = structuredClone(original);

cloned.tags.add('c');
cloned.data[0] = 9;
console.log(original.tags.size, cloned.tags.size);
console.log(original.data[0], cloned.data[0]);
```

**结果**（未在模拟器验证）：输出 `2 3`，然后 `1 9`。`Set`、`Map`、`Date`、类型数组在拷贝里还是原来的类型，内容是独立的一份。

## 拷贝带循环引用的对象

`JSON.parse(JSON.stringify(value))` 遇到循环引用会抛异常，`structuredClone()` 不会。

```js
/** @type {{ name: string, children: { name: string, parent: unknown }[] }} */
const parent = { name: 'parent', children: [] };
const child = { name: 'child', parent };
parent.children.push(child);

const tree = structuredClone(parent);
console.log(tree.children[0].parent === tree, tree !== parent);
```

**结果**（未在模拟器验证）：输出 `true true`。拷贝里的子对象指向拷贝出来的父对象，不指向原来的。

## 判断一个值能不能拷贝

```js
/** @param {unknown} value */
function tryClone(value) {
  try {
    return structuredClone(value);
  } catch (err) {
    if (err instanceof Error && err.name === 'DataCloneError') return null;
    throw err;
  }
}

console.log(tryClone({ a: 1 }));
console.log(tryClone({ onTap() {} }));
```

**结果**（未在模拟器验证）：输出 `{"a":1}`，然后 `null`。第二个对象里有函数。不能拷贝的值有哪些，见[哪些值不能深拷贝](../api/web-globals.md#哪些值不能深拷贝)。

## 参见

- [`TextEncoder`](../api/text-encoder.md)、[`TextDecoder`](../api/text-decoder.md)：文字和字节互转
- [`btoa()`](../api/web-globals/btoa.md)、[`atob()`](../api/web-globals/atob.md)：Base64
- [`structuredClone()`](../api/web-globals/structuredclone.md)：深拷贝
- [文字、字节和深拷贝](../api/web-globals.md)：这一组 API 的总览
