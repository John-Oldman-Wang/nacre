---
type: reference
web: structuredClone()
---

# `structuredClone()` 全局函数

**`structuredClone()`** 全局函数深拷贝一个值：对象、数组、`Map`、`Set`、`Date`、二进制数据，一层一层全部复制。

## 语法

```
structuredClone(value[, options])
```

### 参数

**`value`**

要拷贝的值。

**`options`**

可选，一个对象。`null` 和 `undefined` 当成没给。

**`options.transfer`**

可选。只能不给，或者给空数组。把 `ArrayBuffer` 转移给拷贝还不支持，见下面的异常。

### 返回值

拷贝出来的值。基本类型原样返回。

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

### 异常

**`Error`**，`name` 是 `DataCloneError`

- `value` 里有不能拷贝的东西，见[哪些值不能深拷贝](../web-globals.md#哪些值不能深拷贝)。`message` 说明是哪一个，例如 `#<UIView> could not be cloned.`、`Symbol(id) could not be cloned.`。只要有一处不能拷贝，整个调用就抛异常，不会返回拷贝了一半的结果。
- `options.transfer` 给了非空的数组：`structuredClone: options.transfer is not supported yet; leave it out and the ArrayBuffer is copied instead`

**`TypeError`**

- `options` 不是对象：`structuredClone: the options must be an object`
- `options.transfer` 不是数组：`structuredClone: options.transfer must be an array`
- 不给参数：`structuredClone: 1 argument required, but only 0 present`

**取值器抛出的异常**

读 `value` 的某个属性时取值器抛了异常：那个异常原样抛出来，不改成 `DataCloneError`。

## 说明

`JSON.parse(JSON.stringify(value))` 遇到循环引用会抛异常，`Date` 会变成字符串；`structuredClone()` 不会。

## 示例

```js
const settings = { theme: 'dark', recent: [1, 2, 3], savedAt: new Date() };
const copy = structuredClone(settings);
copy.recent.push(4);
console.log(settings.recent.length, copy.recent.length, copy.savedAt instanceof Date);
```

**结果**：输出 `3 4 true`。拷贝里的数组是另一个数组，`Date` 还是 `Date`。**未在模拟器验证。**

## 和 Web 的差别

| 情况 | 浏览器 | 这里 |
| --- | --- | --- |
| 出错时抛出的对象 | `DOMException` | `Error`，`name` 相同（`DataCloneError`）。按 `err.name` 判断的代码照常工作，按 `instanceof DOMException` 判断的不行 |
| `structuredClone(value, { transfer: [buffer] })` | 把 `buffer` 转移给拷贝，原来的不能再用 | 抛 `DataCloneError`。不写 `transfer`，`buffer` 会被复制一份 |
| `structuredClone(new SharedArrayBuffer(8))` | 拷贝和原来的共用同一块内存 | 抛 `DataCloneError` |
| `structuredClone(new Blob(['x']))` | 可以 | 抛 `DataCloneError` |

## 参见

- [哪些值不能深拷贝](../web-globals.md#哪些值不能深拷贝)
- [深拷贝一个对象](../../guides/text-and-bytes.md#深拷贝之后原对象不受影响)：更多例子
