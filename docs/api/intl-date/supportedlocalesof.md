---
type: reference
---

# `Intl.DateTimeFormat.supportedLocalesOf()` 静态方法

**`Intl.DateTimeFormat.supportedLocalesOf()`** 静态方法从给的地区里挑出系统有数据的。

## 语法

```
Intl.DateTimeFormat.supportedLocalesOf(locales)
```

### 参数

**`locales`**

地区标签，或者地区标签的数组。规则见[地区标签](../intl.md#地区标签)。

### 返回值

字符串数组，是规范写法的地区标签。

### 异常

同[构造函数](constructor.md#异常)里关于 `locales` 的那几条。

## 示例

```js
console.log(JSON.stringify(Intl.DateTimeFormat.supportedLocalesOf(['zh-CN', 'xx', 'en-us'])));
```

**结果**：控制台输出 `["zh-CN","en-US"]`。**这个输出未在模拟器验证**；`Intl.NumberFormat.supportedLocalesOf()` 对同一组参数在验收用例里得到这个结果。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`Intl.NumberFormat.supportedLocalesOf()`](../intl/supportedlocalesof.md)
