---
type: reference
---

# `Intl.NumberFormat`：`resolvedOptions()` 方法

**`resolvedOptions()`** 方法返回这个格式化对象实际用的地区和选项，默认值已经填上。

## 语法

```
resolvedOptions()
```

### 参数

无。

### 返回值

一个新的普通对象。改它不影响格式化。

- 成员和顺序与浏览器相同：`locale`、`numberingSystem`、`style`、`currency`、`currencyDisplay`、`currencySign`、`minimumIntegerDigits`、小数位数或有效数字的两项、`useGrouping`、`notation`、`compactDisplay`、`signDisplay`、`roundingIncrement`、`roundingMode`、`roundingPriority`、`trailingZeroDisplay`。
- 和当前 `style` 无关的成员不出现。
- `useGrouping` 写的是 `true` 时，读出来是 `'always'`。
- `locale` 是实际用的地区。不传地区时，它是系统的首选语言。

### 异常

**`TypeError`**

在不是 `Intl.NumberFormat` 的值上调用：`Intl.NumberFormat.prototype.resolvedOptions called on a value that is not an Intl.NumberFormat`。

## 示例

```js
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'usd' });
const resolved = usd.resolvedOptions();
console.log(resolved.locale, resolved.currency, resolved.maximumFractionDigits);
```

**结果**：控制台输出 `en-US USD 2`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [构造函数](constructor.md)
- [不指定地区时用哪个地区](../intl.md#不指定地区时用哪个地区)
