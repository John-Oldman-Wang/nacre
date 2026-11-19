---
type: reference
---

# `Performance`：`toJSON()` 方法

**`toJSON()`** 方法返回 `performance` 的一个普通对象表示：`{ timeOrigin }`。有了它，`JSON.stringify(performance)` 能得到结果。

## 语法

```
performance.toJSON()
```

### 参数

无。

### 返回值

普通对象，只有一个属性 `timeOrigin`，值和 [`performance.timeOrigin`](timeorigin.md) 相同。

### 异常

无。

## 示例

```js
const json = JSON.stringify(performance);
console.log(json.startsWith('{"timeOrigin":'));
```

**结果**：输出 `true`。

## 和 Web 的差别

浏览器返回的对象还带 `timing`、`navigation`、`eventCounts` 这类字段。这里只有 `timeOrigin`。

## 参见

- [`timeOrigin`](timeorigin.md)
