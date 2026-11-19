---
type: reference
---

# `NativeModule`：`events` 属性

**`events`** 属性列出这个模块会发的事件名。

## 值

字符串数组，按名字排序。

- 只读。
- 数组是冻结的。
- 拿到模块对象之后不会变，没有变化通知。

不在这里的名字也可以监听，它被当成自定义事件，见 [`addEventListener()`](addeventlistener.md)。

## 示例

```js
const example = application.nativeModules.get('example');
console.log(example.events.join(', '));
```

**结果**：输出示例模块声明的事件名，其中有 `tick`。

## 对应的 iOS API

没有对应的系统 API。事件名是原生那一侧登记时定的。

## 参见

- [`addEventListener()`](addeventlistener.md)
