---
type: reference
---

# `NativeModules`：`names` 属性

**`names`** 属性是登记进这个 App 的全部原生模块的名字。

## 值

字符串数组，按名字排序。

- 只读。
- 数组是冻结的，不能往里加、删、改。
- 每次读得到的是当时的情况，不是同一个数组对象。
- 一个模块都没登记时是空数组。

没有变化通知：模块在 App 启动时登记，之后一般不变。

## 示例

```js
const names = application.nativeModules.names;
console.log(names.join(', '));
console.log(Object.isFrozen(names));
```

**结果**：先输出登记了的模块名，装了 `@nacrejs/example-module` 的项目里其中有 `example`；再输出 `true`。

## 对应的 iOS API

没有对应的系统 API。名字是原生那一侧登记模块时定的，见[写自己的原生模块](../../guides/native-modules.md)。

## 参见

- [`has()`](has.md)：只问一个名字
