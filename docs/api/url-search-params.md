---
type: reference
---

# `URLSearchParams`

**`URLSearchParams`** 表示地址里 `?` 后面的那一串查询参数。它是一个有顺序的「名字 = 值」列表，同一个名字可以出现多次。它负责参数的编码和解码：写进去的是原文，读出来的也是原文，变成地址文本时才编码。

`URLSearchParams` 有两种来源：自己用 `new` 创建的，是一个独立的列表；从 [`URL`](url.md) 的 [`searchParams`](url/searchparams.md) 读到的，和那个地址互相同步，改它就是改地址。[`fetch()`](fetch.md) 也接受它作请求体，发送的是 [`toString()`](url-search-params/tostring.md) 的结果。

**继承关系**：`URLSearchParams` 不继承任何类。

怎么改地址里的查询参数，见指南[拼接和解析网址](../guides/urls.md)。

## 构造函数

[`URLSearchParams()`](url-search-params/constructor.md)

从查询文本、对象、数组或另一个 `URLSearchParams` 创建一个列表。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`size`](url-search-params/size.md) <small>只读</small> | 参数的个数，同名的分别计数 |

## 实例方法

读：

| 方法 | 说明 |
| --- | --- |
| [`get()`](url-search-params/get.md) | 第一个同名参数的值 |
| [`getAll()`](url-search-params/getall.md) | 全部同名参数的值 |
| [`has()`](url-search-params/has.md) | 有没有这个参数 |
| [`toString()`](url-search-params/tostring.md) | 编码后的查询文本，不带 `?` |

改：

| 方法 | 说明 |
| --- | --- |
| [`append()`](url-search-params/append.md) | 在末尾加一个参数 |
| [`set()`](url-search-params/set.md) | 把某个名字设成一个值，同名的只留一个 |
| [`delete()`](url-search-params/delete.md) | 删掉某个名字的参数 |
| [`sort()`](url-search-params/sort.md) | 按名字排序 |

遍历：

| 方法 | 说明 |
| --- | --- |
| [`keys()`](url-search-params/keys.md) | 依次给出名字 |
| [`values()`](url-search-params/values.md) | 依次给出值 |
| [`entries()`](url-search-params/entries.md) | 依次给出 `[名字, 值]`。`for...of` 直接遍历等于它 |
| [`forEach()`](url-search-params/foreach.md) | 对每个参数调用一次回调 |

## 编码规则

查询参数用表单的编码规则，和地址的路径部分不同：

- 空格编码成 `+`。路径里的空格是 `%20`。
- 中文等非 ASCII 字符按 UTF-8 编码成 `%XX`。
- `&`、`=`、`+` 这些在查询里有含义的字符被编码，不会破坏地址的结构。

`'中 文'` 写进去得到 `%E4%B8%AD+%E6%96%87`，读出来还是 `'中 文'`。

## 示例

下面的代码改一个地址的查询参数。它不需要界面，直接写在 `main.js` 顶层就能运行。

```js
const url = new URL('https://api.example.com/search?page=1');
url.searchParams.set('page', '2');
url.searchParams.append('q', '中 文');
console.log(url.href);

const params = new URLSearchParams('a=1&b=2&a=3');
console.log(params.getAll('a'), params.size);
```

**结果**

- 输出 `https://api.example.com/search?page=2&q=%E4%B8%AD+%E6%96%87`。
- 输出 `['1', '3'] 3`。

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里运行过。

## 和 Web 的差别

和 Web 相同。

## 还不能做的

| 想做的事 | 状态 |
| --- | --- |
| 用 `FormData` 组织表单数据 | 没有 `FormData`。用 `URLSearchParams` 组织键值对 |

## 参见

- [拼接和解析网址](../guides/urls.md)：改查询参数的几种写法
- [`URL`](url.md)：`searchParams` 属性和地址同步
- [`fetch()`](fetch.md)：把 `URLSearchParams` 作请求体发送
