---
type: reference
status: partial
---

# `Crypto`

**`Crypto`** 表示系统的随机数来源。它唯一的实例是全局对象 `crypto`。它生成别人无法预测的随机数，用来做令牌、密钥、不能被猜到的编号。

`crypto` 在 App 启动时就存在，任何时候都能用，包括脚本顶层。

怎么生成令牌、随机整数、大量随机字节，和 `Math.random()` 怎么选，见指南[生成随机数和唯一编号](../guides/random.md)。

**继承关系**：`Crypto`

## 构造函数

不能用 `new` 创建：`new Crypto()` 抛 `TypeError: Illegal constructor`。`Crypto` 这个类存在是为了让 `crypto instanceof Crypto` 成立。唯一的实例是全局的 `crypto`。

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`getRandomValues()`](crypto/getrandomvalues.md) | 用随机值填满一个整数类型数组，最多 65536 字节 |
| [`randomUUID()`](crypto/randomuuid.md) | 返回一个随机的第 4 版 UUID |

## 随机数是否安全

`crypto` 的随机数来自 iOS 提供给密码学用途的随机源，可以用来生成密钥和登录令牌。

- **不需要初始化，也没有种子。** 不能让它重现同一串随机数。
- **系统的随机源失败时抛异常，不会改用别的来源。** 抛出的错误 `name` 是 `OperationError`，`message` 是 `the system random source failed`。所以拿到了结果，就一定是系统随机源给的。验收过程中没有出现过这个错误。
- **生成很快。** 填 32 个字节约 0.67 微秒（实测，1000 次的平均）。

## 出错时抛出什么

`QuotaExceededError`、`TypeMismatchError`、`OperationError` 抛出的是 [`DOMException`](dom-exception.md)，用 `err.name` 区分是哪一种。参数不是类型数组时抛的是 `TypeError`。

## 示例

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

## 和 Web 的差别

`crypto.getRandomValues()` 和 `crypto.randomUUID()` 的名字、参数、65536 字节的上限与浏览器里的相同。下面列出不同的地方。

| 情况 | 浏览器 | 这里 |
| --- | --- | --- |
| `crypto.subtle` | 有 | 没有 |

## 参见

- [生成随机数和唯一编号](../guides/random.md)：令牌、UUID、随机整数、大量随机字节
- [Keychain](keychain.md)：生成的令牌和密钥要保存时放这里。要先装 `@nacrejs/keychain`
- [运行时怎么工作](how-it-works.md)：有哪些全局对象
