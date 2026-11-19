---
type: reference
web: URLSearchParams.toString()
---

# `URLSearchParams`：`toString()` 方法

**`toString()`** 方法返回编码后的查询文本，不带开头的 `?`。

## 语法

```
toString()
```

### 参数

无。

### 返回值

字符串。每个参数写成 `名字=值`，用 `&` 连起来。空格编码成 `+`，中文等非 ASCII 字符按 UTF-8 编码成 `%XX`。列表为空时是空字符串。

### 异常

无。

## 说明

空格编码成 `+`，和地址的路径部分不同：路径里的空格是 `%20`。

## 示例

```js
const q = new URLSearchParams();
q.append('q', '中 文');
q.append('x', 'a&b');
console.log(q.toString());
```

**结果**：输出 `q=%E4%B8%AD+%E6%96%87&x=a%26b`。**未在模拟器验证。**

## 和 Web 的差别

和 Web 相同。

## 参见

- [`URL.search`](../url/search.md)：查询部分的文本
