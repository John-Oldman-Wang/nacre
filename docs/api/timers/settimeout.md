---
type: reference
---

# `setTimeout()` 全局函数

**`setTimeout()`** 全局函数在指定的延迟之后执行一次回调。

## 语法

```
setTimeout(handler)
setTimeout(handler, delay)
setTimeout(handler, delay, ...args)
```

### 参数

**`handler`**

延迟到了之后执行的函数。不接受一段代码的字符串。

**`delay`** <small>可选</small>

延迟，单位是毫秒，可以带小数。默认 0。

- 延迟是下限：回调不会早于它执行，但可能晚，见[延迟是下限，不是准点](../timers.md#延迟是下限不是准点)。
- 没有最小值。`0` 表示「当前代码结束后尽快执行」，不会被加长到某个固定的毫秒数，嵌套多层也不加长。
- 负数、`NaN`、不传、转不成数的值（比如 `'abc'`）都等于 0。`'100'` 这样的字符串会转成 100。

**`...args`** <small>可选</small>

原样传给 `handler` 的参数。

### 返回值

数，这个定时器的编号，是从 1 开始递增的整数。交给 [`clearTimeout()`](cleartimeout.md) 用。

### 异常

**`TypeError`**

`handler` 不是函数：`setTimeout: the first argument must be a function`。传代码字符串时也抛这一条。

## 说明

- 延迟相同的定时器按注册的先后执行。
- `queueMicrotask()` 和 `Promise` 的回调先于 `setTimeout(fn, 0)` 执行。
- 在定时器的回调里再调 `setTimeout(fn, 0)`，新的回调排到下一轮，中间界面有机会刷新和响应触摸。
- 回调执行超过 50 毫秒时，控制台输出一条警告，见[回调执行得太久](../timers.md#回调执行得太久)。
- 回调抛出的异常由 [`application`](../application.md) 的 `error` 事件报告，其他定时器照常执行。

## 示例

### 延迟执行一次

```js
setTimeout(() => {
  console.log('1 秒过去了');
}, 1000);
```

**结果**：至少 1000 毫秒之后，控制台输出一行。

### 给回调传参数

```js
setTimeout((a, b) => {
  console.log(a + b);
}, 0, '参数', '透传');
```

**结果**：输出 `参数透传`。

### 延迟相同时的先后

```js
setTimeout(() => console.log('A'), 10);
setTimeout(() => console.log('B'), 10);
```

**结果**：先输出 `A`，再输出 `B`。

## 和 Web 的差别

- 嵌套多层的 `setTimeout(fn, 0)`：浏览器把延迟加长到至少 4 毫秒，这里不加长。
- 第一个参数是代码字符串：浏览器把字符串当代码执行，这里抛 `TypeError`。
- 返回值是数，不是 Node 的 `Timeout` 对象，没有 `unref()` 这类方法。
- 单个回调执行超过 50 毫秒时，这里在控制台输出警告，浏览器没有提示。
- App 进入后台后被系统暂停，回调不执行。浏览器是降低频率。**未在模拟器验证。**

## 参见

- [`clearTimeout()`](cleartimeout.md)：取消
- [`setInterval()`](setinterval.md)：重复执行
- [用 `await` 等一段时间](../../guides/timers.md#用-await-等一段时间)
