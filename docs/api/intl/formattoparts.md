---
type: reference
---

# `Intl.NumberFormat`：`formatToParts()` 方法

**`formatToParts()`** 方法在标准里用来把格式化的结果拆成整数、小数、货币符号等部分。这里还不能用：调用时抛 `TypeError`。

## 语法

```
formatToParts(value)
```

### 参数

标准规定的参数。这里不读参数，直接抛。

### 返回值

没有。总是抛异常。

### 异常

**`TypeError`**

`Intl.NumberFormat.prototype.formatToParts is not supported by this runtime`。

## 示例

```js
try {
  new Intl.NumberFormat('en-US').formatToParts(1234.5);
} catch (err) {
  console.log(String(err));
}
```

**结果**：输出 `TypeError: Intl.NumberFormat.prototype.formatToParts is not supported by this runtime`。

## 和 Web 的差别

浏览器里有这个方法，这里调用时抛 `TypeError`。方法本身存在，所以 `typeof` 判断不出它能不能用。

## 参见

- [`format()`](format.md)
- [还不能做的](../intl.md#还不能做的)
