---
type: reference
---

# `Intl.DateTimeFormat`：`formatRangeToParts()` 方法

**`formatRangeToParts()`** 方法在标准里用来把一段时间的结果拆开，并说明每一段属于起点还是终点。这里还不能用：调用时抛 `TypeError`。

## 语法

```
formatRangeToParts(startDate, endDate)
```

### 参数

标准规定的参数。这里不读参数，直接抛。

### 返回值

没有。总是抛异常。

### 异常

**`TypeError`**

`Intl.DateTimeFormat.prototype.formatRangeToParts is not supported by this runtime`。

## 示例

```js
try {
  new Intl.DateTimeFormat('en-US').formatRangeToParts(0, 86400000);
} catch (err) {
  console.log(String(err));
}
```

**结果**：输出 `TypeError: Intl.DateTimeFormat.prototype.formatRangeToParts is not supported by this runtime`。

## 和 Web 的差别

浏览器里有这个方法，这里调用时抛 `TypeError`。方法本身存在，所以 `typeof` 判断不出它能不能用。

## 参见

- [`formatRange()`](formatrange.md)
