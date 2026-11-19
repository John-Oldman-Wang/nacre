---
type: reference
native: "-[LAContext init]"
---

# `LAContext()` 构造函数

**`LAContext()`** 构造函数创建一个新的认证对象。按钮标题这些设置属于这一个对象，所以每次认证用一个新的。

## 语法

```
new LAContext()
```

### 参数

无。

### 返回值

新建的 `LAContext`。每次调用得到一个不同的对象。它的属性都是默认值：`localizedFallbackTitle` 和 `localizedCancelTitle` 是 `null`，`touchIDAuthenticationAllowableReuseDuration` 是 `0`，`interactionNotAllowed` 是 `false`。

### 异常

**`TypeError`**

继承 `LAContext` 再 `new`：原生类都不能继承，见[原生类](../native-classes.md)。

## 示例

```js
const a = new LAContext();
const b = new LAContext();
console.log(a === b, a instanceof NSObject);
```

**结果**：输出 `false true`。

## 对应的 iOS API

`[[LAContext alloc] init]`。

## 参见

- [`evaluatePolicy()`](evaluatepolicy.md)：用这个对象认证
- [一次认证怎么进行](../la-context.md#一次认证怎么进行)
- [安装 `@nacrejs/local-authentication`](../la-context.md#先装上)
