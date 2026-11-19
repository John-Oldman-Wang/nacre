---
type: reference
---

# `Intl.DateTimeFormat`：`format()` 方法

**`format()`** 方法按这个格式化对象的地区、时区和选项，把一个时刻写成文字。

## 语法

```
format()
format(date)
```

`format` 已经绑定在这个对象上，可以单独取出来用，比如直接交给 `map`。

### 参数

**`date`** <small>可选</small>

`Date` 对象，或者毫秒数。不传是当前时刻。字符串不会被当成日期来解析：要先 `new Date(...)`。

### 返回值

字符串。

### 异常

**`RangeError`**

`date` 是无效的日期（`new Date(NaN)`），或者不是能转成数的值，比如 `format('2026-11-15')`：`date value is not finite in DateTimeFormat format()`。

## 示例

### 一个时刻

```js
const moment = new Date(Date.UTC(2026, 0, 5, 3, 4, 5));
const clock = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric', minute: '2-digit', hour12: false, timeZone: 'UTC',
});
console.log(clock.format(moment));
```

**结果**：控制台输出 `03:04`。

### 交给 `map`

```js
const times = [0, 86400000];
const day = new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeZone: 'UTC' });
console.log(times.map(day.format).join(' / '));
```

**结果**：控制台输出 `1/1/70 / 1/2/70`。**这个输出未在模拟器验证**；把 `format` 取出来交给 `map`、以及给它毫秒数，在验收用例里和网页比对过。

## 和 Web 的差别

和 Web 相同。结果的每个字符和同一台设备上的 Safari 相同。

## 参见

- [`formatToParts()`](formattoparts.md)：拆开给出来
- [`Date.prototype.toLocaleString()`](tolocalestring.md)：一次性的写法
