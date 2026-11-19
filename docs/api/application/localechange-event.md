---
type: reference
native: NSCurrentLocaleDidChangeNotification
---

# `Application`：`localechange` 事件

**`localechange`** 事件在用户改了地区设置时派发：国家或地区、货币、数字和日期的格式、公制还是英制。

## 语法

```
application.addEventListener('localechange', (event) => { })
```

## 事件对象

`Event`。`target` 是 `application`，不带新的值，在回调里重新读 [`NSLocale.currentLocale`](../ns-locale/currentlocale.md)。不能取消。

## 什么时候派发

- 用户在系统设置里改了地区、日历、温度单位这类地区设置时派发。**未在模拟器验证。**
- 用户改了系统语言时，iOS 会结束正在运行的 App，App 收不到这个事件，下次启动读到新的语言。**未在模拟器验证。**
- 回调不是在变化的那一刻同步执行，而是稍后执行，见[运行时怎么工作](../how-it-works.md#事件)。

`Intl.NumberFormat`、`Intl.DateTimeFormat` 不指定地区时用的是首选语言，不受地区设置影响。按用户的地区写金额，要自己从 `NSLocale.currentLocale` 读货币代码，在这个事件里重新读一次。

## 示例

```js
function showCurrency() {
  console.log(NSLocale.currentLocale.currencyCode);
}
showCurrency();
application.addEventListener('localechange', showCurrency);
```

**效果**：启动时输出一次货币代码。用户在系统设置里把地区从中国改成日本，回到 App 后再输出一次，变成 `JPY`。**未在模拟器验证。**

## 对应的 iOS API

`NSCurrentLocaleDidChangeNotification`。

## 参见

- [`NSLocale`](../ns-locale.md)
- [`Application`](../application.md#事件)
