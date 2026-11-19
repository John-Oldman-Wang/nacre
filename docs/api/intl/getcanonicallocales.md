---
type: reference
---

# `Intl.getCanonicalLocales()` 静态方法

**`Intl.getCanonicalLocales()`** 静态方法把地区标签改成规范的大小写。它是 `Intl` 自己的函数，不属于 `Intl.NumberFormat`。

## 语法

```
Intl.getCanonicalLocales(locales)
```

### 参数

**`locales`**

地区标签，或者地区标签的数组。

### 返回值

字符串数组，每个地区标签改成规范的大小写。

只改大小写，不把旧的写法换成新的（`'iw'` 不会变成 `'he'`）。**这一条未在模拟器验证**，来自代码。

### 异常

**`RangeError`**

不是合法的地区标签：`invalid language tag: en_US`，最后是那个标签。

## 示例

```js
console.log(JSON.stringify(Intl.getCanonicalLocales(['EN-us', 'zh-hans-cn'])));
```

**结果**：控制台输出 `["en-US","zh-Hans-CN"]`。

## 和 Web 的差别

浏览器会把旧的写法换成新的（`'iw'` 变成 `'he'`），这里不换。**未在模拟器验证。**

## 参见

- [地区标签](../intl.md#地区标签)
