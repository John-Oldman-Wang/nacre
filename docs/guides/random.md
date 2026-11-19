# 生成随机数和唯一编号

这一篇讲怎么用 [`crypto`](../api/crypto.md) 生成令牌、唯一编号、一个范围内的随机整数，以及什么时候用 `Math.random()` 就够了。细节在 [`Crypto`](../api/crypto.md) 的参考页。

## 推荐的做法

| 要做的事 | 用哪个 | 原因 |
| --- | --- | --- |
| 令牌、密钥、验证码、订单号这类不能被猜到的值 | [`crypto.getRandomValues()`](../api/crypto/getrandomvalues.md) | `Math.random()` 的输出可以根据之前的输出推算出来 |
| 给数据、请求、设备生成唯一的标识 | [`crypto.randomUUID()`](../api/crypto/randomuuid.md) | 一次调用得到一个 36 个字符的标识，不需要自己拼 |
| 动画里的随机偏移、随机挑一种颜色这类和安全无关的随机 | `Math.random()` | 直接得到 0 到 1 之间的小数，写起来更短 |

## 第一个例子

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

## 生成一个唯一编号

```js
const id = crypto.randomUUID();
console.log(id);
```

**结果**：输出一个 UUID，形如 `3f2b8c1e-9d47-4a6b-8e15-0c7f2a9d6b31`，共 36 个字符，字母是小写。每次调用都不一样。

## 生成一个范围内的随机整数

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

## 一次要很多随机字节

一次调用最多填 65536 字节，超过时抛 `QuotaExceededError`。上限按字节算：`Uint32Array` 每个元素 4 字节，所以最多 16384 个元素。要更多就分几次：

```js
const big = new Uint8Array(200000);
for (let offset = 0; offset < big.length; offset += 65536) {
  crypto.getRandomValues(big.subarray(offset, offset + 65536));
}
```

**结果**：`big` 的 200000 个字节全部是随机值。**这个例子未在模拟器验证。**

`subarray()` 得到的是原数组上的一段视图，不复制数据。`getRandomValues()` 只填视图覆盖的那一段，不碰其余部分（实测）。

## 参见

- [`Crypto`](../api/crypto.md)：两个方法和出错时抛出什么
- [Keychain](../api/keychain.md)：生成的令牌和密钥要保存时放这里
