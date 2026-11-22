---
type: reference
web: DOMException()
---

# `DOMException()` 构造函数

**`DOMException()`** 构造函数创建一个 `DOMException`，给出说明和名字。

## 语法

```
new DOMException()
new DOMException(message)
new DOMException(message, name)
```

### 参数

**`message`**

可选。一句说明，按字符串转。不传、传 `undefined` 或 `null` 时是空串。

**`name`**

可选。错误的名字，按字符串转。不传或传 `undefined` 时是 `'Error'`，传 `null` 时是空串。

名字不限于 Web 标准里的那些：不认识的名字也照样收下，这时 [`code`](code.md) 是 0。

### 返回值

新建的 `DOMException`。

### 异常

**`TypeError`**

不带 `new` 调用：`DOMException('x')`。

## 说明

可以写 `DOMException` 的子类，子类的实例 `instanceof DOMException` 是 `true`。

## 示例

### 创建一个错误

```js
const plain = new DOMException();
console.log(JSON.stringify(plain.message), plain.name, plain.code);
const aborted = new DOMException('stopped', 'AbortError');
console.log(String(aborted), aborted.code, aborted instanceof Error);
```

**结果**：

- 第一行输出 `"" Error 0`。
- 第二行输出 `AbortError: stopped 20 true`。

### 写一个子类

```js
class LoginRequiredError extends DOMException {
  constructor() {
    super('please sign in first', 'NotAllowedError');
  }
}
const err = new LoginRequiredError();
console.log(err instanceof DOMException, err.name, err.code);
```

**结果**：输出 `true NotAllowedError 0`。`'NotAllowedError'` 没有老数字码，所以 `code` 是 0。

## 和 Web 的差别

`message` 或 `name` 传 `null` 时得到空串。Web 上得到字符串 `'null'`。

## 参见

- [`name`](name.md)、[`message`](message.md)、[`code`](code.md)
