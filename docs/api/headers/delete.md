---
type: reference
web: Headers.delete()
---

# `Headers`：`delete()` 方法

**`delete()`** 方法删掉某个名字的全部值。

## 语法

```
delete(name)
```

### 参数

**`name`**

头的名字，字符串，不区分大小写。不是字符串的值先转成字符串。

### 返回值

无（`undefined`）。没有这个名字时什么也不做。

### 异常

**`TypeError`**

名字不合法：`Invalid header name: "坏 名字"`。名字只能由字母、数字和 ``!#$%&'*+-.^_`|~`` 这些符号组成，不能为空。

## 示例

```js
const h = new Headers({ Accept: 'a', 'X-Id': '1' });
h.delete('x-id');
console.log(h.has('X-Id'));
```

**结果**：输出 `false`。**未在模拟器验证。**

## 和 Web 的差别

和 Web 相同。

## 参见

- [`set()`](set.md)
