---
type: reference
web: Headers.has()
---

# `Headers`：`has()` 方法

**`has()`** 方法判断有没有某个名字的头。

## 语法

```
has(name)
```

### 参数

**`name`**

头的名字，字符串，不区分大小写。不是字符串的值先转成字符串。

### 返回值

布尔。

### 异常

**`TypeError`**

名字不合法：`Invalid header name: "坏 名字"`。名字只能由字母、数字和 ``!#$%&'*+-.^_`|~`` 这些符号组成，不能为空。

## 示例

```js
const h = new Headers({ Accept: 'a' });
console.log(h.has('accept'), h.has('Cookie'));
```

**结果**：输出 `true false`。**未在模拟器验证。**

## 和 Web 的差别

和 Web 相同。

## 参见

- [`get()`](get.md)
