---
type: reference
---

# `NativeModules`：`get()` 方法

**`get()`** 方法按名字返回一个原生模块，得到一个 [`NativeModule`](../native-module.md)。

## 语法

```
get(name)
```

### 参数

**`name`**

模块名，字符串。不是字符串时先转成字符串。

### 返回值

[`NativeModule`](../native-module.md)。同一个名字每次返回同一个对象，所以每次用的时候现取就可以，不需要自己保存。

### 异常

**`TypeError`**

没登记过的名字：`nativeModules.get: no native module named "nope"; registered modules: example`，最后列出登记了哪些名字。一个模块都没登记时最后是 `registered modules: none`。

## 示例

```js
const example = application.nativeModules.get('example');
console.log(example.name);
console.log(example === application.nativeModules.get('example'));
```

**结果**：装了 `@nacrejs/example-module` 的项目依次输出 `example`、`true`。没装的在第一行抛 `TypeError`。

## 对应的 iOS API

没有对应的系统 API。

## 参见

- [`has()`](has.md)：先确认在不在
- [`NativeModule`](../native-module.md)：拿到的模块能做什么
