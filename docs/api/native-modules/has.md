---
type: reference
---

# `NativeModules`：`has()` 方法

**`has()`** 方法返回某个名字的原生模块登记过没有。

## 语法

```
has(name)
```

### 参数

**`name`**

模块名，字符串。不是字符串时先转成字符串。

### 返回值

布尔。登记过是 `true`，没登记过是 `false`。

### 异常

无。

## 示例

```js
if (application.nativeModules.has('example')) {
  const example = application.nativeModules.get('example');
  console.log(example.name);
} else {
  console.log('这个 App 没有装示例模块');
}
```

**效果**：装了 `@nacrejs/example-module` 的项目输出 `example`，没装的输出 `这个 App 没有装示例模块`。

## 对应的 iOS API

没有对应的系统 API。

## 参见

- [`get()`](get.md)：没登记过的名字抛 `TypeError`，所以不确定时先用 `has()` 问
