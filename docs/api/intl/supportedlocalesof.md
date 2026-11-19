---
type: reference
---

# `Intl.NumberFormat.supportedLocalesOf()` 静态方法

**`Intl.NumberFormat.supportedLocalesOf()`** 静态方法从给的地区里挑出系统有数据的。

## 语法

```
Intl.NumberFormat.supportedLocalesOf(locales)
```

### 参数

**`locales`**

地区标签，或者地区标签的数组。规则同[构造函数](constructor.md)。

### 返回值

字符串数组，是规范写法的地区标签。系统没有数据的地区不在里面。

### 异常

同[构造函数](constructor.md#异常)里关于 `locales` 的那几条。

## 示例

```js
console.log(JSON.stringify(Intl.NumberFormat.supportedLocalesOf(['zh-CN', 'xx', 'en-us'])));
```

**结果**：控制台输出 `["zh-CN","en-US"]`。

## 和 Web 的差别

「系统有数据」指的是 iOS 有这个地区的数据。其余和 Web 相同。

## 参见

- [`Intl.getCanonicalLocales()`](getcanonicallocales.md)：只改大小写，不挑
