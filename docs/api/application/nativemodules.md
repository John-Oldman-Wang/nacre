---
type: reference
native: application.nativeModules
---

# `Application`：`nativeModules` 属性

**`nativeModules`** 属性给出登记进这个 App 的原生模块。原生模块是用 ObjC 或 Swift 写的一段代码，按名字登记进 App，提供一组方法和事件，跟着 npm 包进来。

## 值

`NativeModules`。用法见[原生模块](../native-modules.md)。

- 只读。给它赋值抛 `TypeError`。
- 每次读到的是同一个对象。每个项目都有；一个模块都没有时它的 `names` 是空数组。

## 示例

下面用示例模块 `@nacrejs/example-module`（登记的名字是 `example`）。

```js
const modules = application.nativeModules;
if (modules.has('example')) {
  const example = modules.get('example');
  console.log(example.call('add', 1, 2));
} else {
  console.log('没有装示例模块');
}
```

**结果**（**未在模拟器验证**）：装了 `@nacrejs/example-module` 的项目输出 `3`，没装的输出 `没有装示例模块`。

## 对应的 iOS API

没有对应的系统 API。原生一侧的写法见[原生模块](../native-modules.md)。

## 参见

- [原生模块](../native-modules.md)
