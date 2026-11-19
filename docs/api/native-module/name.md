---
type: reference
---

# `NativeModule`：`name` 属性

**`name`** 属性是这个模块登记时用的名字，也就是传给 [`application.nativeModules.get()`](../native-modules/get.md) 的那个名字。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`。
- 拿到模块对象之后不会变，没有变化通知。

## 示例

```js
const example = application.nativeModules.get('example');
console.log(example.name);
```

**结果**：输出 `example`。

## 对应的 iOS API

没有对应的系统 API。名字是原生那一侧登记模块时定的。

## 参见

- [`application.nativeModules.names`](../native-modules/names.md)：全部模块名
