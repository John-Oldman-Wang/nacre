---
type: reference
---

# `Performance`：`timeOrigin` 属性

**`timeOrigin`** 属性是 [`now()`](now.md) 的零点对应的时刻。

## 值

数，Unix 时间戳（从 1970 年 1 月 1 日 0 点 UTC 算起），单位是毫秒。

- 只读。给它赋值抛 `TypeError`。
- 这个值是运行时启动那一刻按系统时间记下的。之后系统时间被修改，它不跟着变。
- 运行期间不变，所以没有变化通知。

## 示例

```js
const date = new Date(performance.timeOrigin + performance.now());
console.log(date.toISOString());
```

**结果**：输出当前时刻，形如 `2026-11-12T01:23:45.678Z`。它和 `new Date()` 相差不到 50 毫秒（实测）。

只是要当前日期时直接用 `new Date()`。这个换算用在已经有一批 `now()` 读数、事后要知道它们各自对应几点的场合。

## 和 Web 的差别

和 Web 相同。零点的含义不同，见 [`now()`](now.md#和-web-的差别)。

## 参见

- [`now()`](now.md)
