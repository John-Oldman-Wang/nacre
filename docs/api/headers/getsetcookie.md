---
type: reference
web: Headers.getSetCookie()
---

# `Headers`：`getSetCookie()` 方法

**`getSetCookie()`** 方法返回全部 `Set-Cookie` 头的值，一条一项。

## 语法

```
getSetCookie()
```

### 参数

无。

### 返回值

字符串数组，按加入的先后。没有 `Set-Cookie` 时返回空数组。返回的是一份副本，改它不影响这组头。

### 异常

无。

## 说明

`Set-Cookie` 的值里本身可能有逗号（比如过期时间 `Expires=Wed, 21 Oct 2026 …`），用 [`get()`](get.md) 连成一个字符串之后分不开，所以单独用这个方法取数组。

## 示例

```js
const h = new Headers();
h.append('Set-Cookie', 'x=1');
h.append('Set-Cookie', 'y=2');
console.log(h.getSetCookie());
```

**结果**：输出 `['x=1', 'y=2']`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`get()`](get.md)
