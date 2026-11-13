---
type: reference
status: partial
---

# `crypto`

**`crypto`** 表示系统的随机数来源。它生成别人无法预测的随机数，用来做令牌、密钥、不能被猜到的编号。

它是全局对象，App 启动时就存在，不需要创建，也不能创建第二个。它有两个方法：`getRandomValues()` 用随机值填满一个数组，`randomUUID()` 返回一个随机的唯一编号。

## 随机数是否安全

`crypto` 的随机数来自 iOS 提供给密码学用途的随机源，可以用来生成密钥和登录令牌。

- **不需要初始化，也没有种子。** 不能让它重现同一串随机数。
- **系统的随机源失败时抛异常，不会改用别的来源。** 抛出的错误 `name` 是 `OperationError`，`message` 是 `the system random source failed`。所以拿到了结果，就一定是系统随机源给的。验收过程中没有出现过这个错误。
- **生成很快。** 填 32 个字节约 0.67 微秒（实测，1000 次的平均）。

## 和 `Math.random()` 怎么选

| 要做的事 | 用哪个 | 原因 |
| --- | --- | --- |
| 令牌、密钥、验证码、订单号这类不能被猜到的值 | `crypto` | `Math.random()` 的输出可以根据之前的输出推算出来 |
| 给数据、请求、设备生成唯一的标识 | `crypto.randomUUID()` | 一次调用得到一个 36 个字符的标识，不需要自己拼 |
| 动画里的随机偏移、随机挑一种颜色这类和安全无关的随机 | `Math.random()` | 直接得到 0 到 1 之间的小数，写起来更短 |

## 一次能要多少

`getRandomValues()` 一次最多填 65536 字节，超过时抛异常。上限按字节算，不按数组的元素个数算：`Uint32Array` 每个元素 4 字节，所以最多 16384 个元素。

要更多就分几次调用，写法见[一次要很多随机字节](#一次要很多随机字节)。

## 完整例子

下面的代码生成一个 16 字节的随机令牌，写成 32 个十六进制字符。它不需要界面，直接写在 `main.js` 顶层就能运行。

```js
// 1. 准备一个 16 字节的数组，让 crypto 把它填满
const bytes = new Uint8Array(16);
crypto.getRandomValues(bytes);

// 2. 每个字节转成两位十六进制，拼起来
let token = '';
for (const b of bytes) {
  token += b.toString(16).padStart(2, '0');
}
console.log(token);
```

**结果**：控制台输出 32 个十六进制字符，形如 `9f3a61c05e7d2b48a1c6f0937be4d215`。每次运行都不一样。

`getRandomValues()` 不返回新数组，它往你给的数组里写。数组多长，就得到多少随机数。

## 常见用法

### 生成一个唯一编号

```js
const id = crypto.randomUUID();
console.log(id);
```

**结果**：输出一个 UUID，形如 `3f2b8c1e-9d47-4a6b-8e15-0c7f2a9d6b31`，共 36 个字符，字母是小写。每次调用都不一样。

### 生成一个范围内的随机整数

```js
/**
 * @param {number} max 不包含
 * @returns {number} 0 到 max - 1 之间的整数
 */
function randomInt(max) {
  const limit = Math.floor(0x100000000 / max) * max;
  const box = new Uint32Array(1);
  do {
    crypto.getRandomValues(box);
  } while (box[0] >= limit);
  return box[0] % max;
}

console.log(randomInt(6) + 1);
```

**结果**：输出 1 到 6 之间的一个整数。**这个例子未在模拟器验证。**

直接写 `box[0] % max` 会让小的数字出现得稍多一些。上面的循环把会造成偏差的那部分读数丢掉重取。

### 一次要很多随机字节

一次调用最多填 65536 字节。要更多就分几次：

```js
const big = new Uint8Array(200000);
for (let offset = 0; offset < big.length; offset += 65536) {
  crypto.getRandomValues(big.subarray(offset, offset + 65536));
}
```

**结果**：`big` 的 200000 个字节全部是随机值。**这个例子未在模拟器验证。**

`subarray()` 得到的是原数组上的一段视图，不复制数据。`getRandomValues()` 只填视图覆盖的那一段，不碰其余部分（实测）。

## 成员说明

### `crypto.getRandomValues(array)`

用随机值填满 `array`。

- **参数**：`array` 是整数类型数组，九种之一：`Int8Array`、`Uint8Array`、`Uint8ClampedArray`、`Int16Array`、`Uint16Array`、`Int32Array`、`Uint32Array`、`BigInt64Array`、`BigUint64Array`。
- **返回值**：传进来的那个 `array` 本身，不是副本。
- 长度是 0 的数组原样返回。
- 上限按字节算，不按元素个数算。`Uint32Array` 每个元素 4 字节，所以最多 16384 个元素。
- **出错**：
  - 超过 65536 字节：`QuotaExceededError: getRandomValues can fill at most 65536 bytes per call, got 65537`
  - 传浮点数组（`Float32Array` 等）或 `DataView`：`TypeMismatchError: getRandomValues needs an integer typed array; Float arrays and DataView are not accepted`
  - 传的不是类型数组（比如普通数组）：`TypeError: getRandomValues needs an integer typed array`
  - 系统的随机源失败：`OperationError: the system random source failed`

前三种是在填数组之前检查出来的，数组的内容不变。`QuotaExceededError`、`TypeMismatchError`、`OperationError` 抛出的是 `Error` 对象，用 `err.name` 区分是哪一种。

### `crypto.randomUUID()`

- **参数**：无。
- **返回值**：字符串，一个第 4 版的 UUID。36 个字符，由 32 个小写的十六进制字符和 4 个连字符组成。其中 122 位是随机的。
- **出错**：系统的随机源失败时抛 `OperationError: the system random source failed`。

### `Crypto`

`crypto` 的类。它存在是为了让 `crypto instanceof Crypto` 成立，不能自己创建：

- `new Crypto()` 抛 `TypeError: Illegal constructor`

## 和浏览器的对照

`crypto.getRandomValues()` 和 `crypto.randomUUID()` 的名字、参数、65536 字节的上限与浏览器里的相同。下面列出不同的地方。

| 情况 | 浏览器 | 这里 |
| --- | --- | --- |
| 出错时抛出的对象 | `DOMException` | `Error`，`name` 相同（`QuotaExceededError`、`TypeMismatchError`）。按 `err.name` 判断的代码照常工作，按 `instanceof DOMException` 判断的不行，这里没有 `DOMException` 这个类 |
| `crypto.subtle` | 有 | 没有 |

## 还不能做的

| 想做的事 | 对应的 Web 能力 | 状态 |
| --- | --- | --- |
| 计算 SHA-256 等摘要 | `crypto.subtle.digest()` | 未实现 |
| 加密、解密、签名、验签 | `crypto.subtle.encrypt()`、`sign()` 等 | 未实现 |
| 生成和导入密钥 | `crypto.subtle.generateKey()`、`importKey()` | 未实现 |

## 参见

- [Keychain](keychain.md)：生成的令牌和密钥要保存时放这里
- [运行时怎么工作](how-it-works.md)：有哪些全局对象
