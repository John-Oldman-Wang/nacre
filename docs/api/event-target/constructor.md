---
type: reference
native: EventTarget()
---

# `EventTarget()` 构造函数

**`EventTarget()`** 构造函数创建一个独立的事件目标。App 里互不引用的两部分代码可以用它互相通知。

## 语法

```
new EventTarget()
```

### 参数

无。

### 返回值

新建的 `EventTarget`，上面没有监听器。

### 异常

无。

## 示例

```js
const bus = new EventTarget();
bus.addEventListener('saved', () => console.log('保存了'));
bus.dispatchEvent(new Event('saved'));
```

**结果**：控制台输出 `保存了`。**未在模拟器验证**；`application` 上同样的写法验证过。

## 对应的 iOS API

没有对应的系统 API。对应浏览器的 `new EventTarget()`。

## 参见

- [`dispatchEvent()`](dispatchevent.md)
