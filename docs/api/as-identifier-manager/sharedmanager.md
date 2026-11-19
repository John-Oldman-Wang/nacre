---
type: reference
native: +[ASIdentifierManager sharedManager]
---

# `ASIdentifierManager.sharedManager()` 静态方法

**`ASIdentifierManager.sharedManager()`** 静态方法返回系统提供的那一个 `ASIdentifierManager`。

## 语法

```
ASIdentifierManager.sharedManager()
```

### 参数

无。

### 返回值

`ASIdentifierManager`。每次调用得到同一个对象，可以用 `===` 比较。

### 异常

无。

## 示例

```js
const manager = ASIdentifierManager.sharedManager();
console.log(manager === ASIdentifierManager.sharedManager());
```

**结果**：输出 `true`。

## 对应的 iOS API

`+[ASIdentifierManager sharedManager]`。它在 ObjC 里是类方法，所以 JS 里带括号。

## 参见

- [`advertisingIdentifier`](advertisingidentifier.md)：从它读广告标识
- [安装 `@nacrejs/app-tracking-transparency`](../app-tracking-transparency.md#先装上)
