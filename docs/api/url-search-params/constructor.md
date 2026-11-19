---
type: reference
web: URLSearchParams()
---

# `URLSearchParams()` 构造函数

**`URLSearchParams()`** 构造函数创建一个查询参数列表。

## 语法

```
new URLSearchParams([init])
```

### 参数

**`init`**

可选。列表的初始内容，有四种写法。不传、传 `null` 或 `undefined` 得到空列表。

| 写法 | 例 | 说明 |
| --- | --- | --- |
| 字符串 | `'a=1&b=2'` | 开头的 `?` 会被忽略。`+` 解码成空格，`%XX` 按 UTF-8 解码。百分号编码写坏了的部分原样保留 |
| 对象 | `{ a: '1', b: '2' }` | 每个属性一个参数 |
| 数组 | `[['a', '1'], ['a', '2']]` | 可以表示同名的多个参数。每一项必须正好是两个元素 |
| 另一个 `URLSearchParams` | | 复制一份，两者之后互不影响 |

名字和值不是字符串时，先转成字符串。

### 返回值

新建的 `URLSearchParams`。它不属于任何 `URL`，修改它不影响别的对象。

### 异常

**`TypeError`**

数组写法里有一项不是正好两个元素的数组：`URLSearchParams in array form needs every entry to be [name, value]`

## 示例

```js
const q = new URLSearchParams('?a=1&b=x+y');
console.log(q.get('b'), q.size);
const r = new URLSearchParams([['a', '1'], ['a', '2']]);
console.log(r.getAll('a'));
```

**结果**：输出 `x y 2`，然后 `['1', '2']`。**未在模拟器验证。**

## 和 Web 的差别

和 Web 相同。

## 参见

- [`URL.searchParams`](../url/searchparams.md)：和地址同步的那一个
