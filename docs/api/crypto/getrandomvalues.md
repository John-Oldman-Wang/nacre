---
type: reference
---

# `Crypto`：`getRandomValues()` 方法

**`getRandomValues()`** 方法用随机值填满一个整数类型数组，再把这个数组原样返回。

## 语法

```
crypto.getRandomValues(array)
```

### 参数

**`array`**

整数类型数组，九种之一：`Int8Array`、`Uint8Array`、`Uint8ClampedArray`、`Int16Array`、`Uint16Array`、`Int32Array`、`Uint32Array`、`BigInt64Array`、`BigUint64Array`。

- 最多 65536 字节。上限按字节算，不按元素个数算：`Uint32Array` 每个元素 4 字节，所以最多 16384 个元素。
- 可以是 `subarray()` 得到的一段视图。只填视图覆盖的那一段，不碰其余部分（实测）。

### 返回值

传进来的那个 `array` 本身，不是副本。数组多长，就得到多少随机数。长度是 0 的数组原样返回。

### 异常

前三种是在填数组之前检查出来的，这时数组的内容不变。

**`QuotaExceededError`**

超过 65536 字节：`getRandomValues can fill at most 65536 bytes per call, got 65537`，最后是实际的字节数。

**`TypeMismatchError`**

传浮点数组（`Float32Array` 等）或 `DataView`：`getRandomValues needs an integer typed array; Float arrays and DataView are not accepted`。

**`TypeError`**

传的不是类型数组（比如普通数组）：`getRandomValues needs an integer typed array`。

**`OperationError`**

系统的随机源失败：`the system random source failed`。验收过程中没有出现过这个错误。

`QuotaExceededError`、`TypeMismatchError`、`OperationError` 是 `name` 被设成这几个值的 `Error` 对象，用 `err.name` 区分。

## 示例

### 生成一个随机令牌

```js
const bytes = new Uint8Array(16);
crypto.getRandomValues(bytes);
let token = '';
for (const b of bytes) {
  token += b.toString(16).padStart(2, '0');
}
console.log(token);
```

**结果**：输出 32 个十六进制字符，形如 `9f3a61c05e7d2b48a1c6f0937be4d215`。每次运行都不一样。

### 一次要得太多

```js
try {
  crypto.getRandomValues(new Uint8Array(65537));
} catch (err) {
  console.log(/** @type {Error} */ (err).name);
}
```

**结果**：输出 `QuotaExceededError`。

## 和 Web 的差别

- 出错时抛出的是 `Error`，不是 `DOMException`。`name` 相同，按 `err.name` 判断的代码照常工作；这里没有 `DOMException` 这个类。
- 其余和 Web 相同。

## 参见

- [一次要很多随机字节](../../guides/random.md#一次要很多随机字节)
- [`randomUUID()`](randomuuid.md)
